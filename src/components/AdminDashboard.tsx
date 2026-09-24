import React, { useState, useRef } from "react";
import { Project, ProfileData, ProjectPlacement } from "../types.ts";
import {
  syncSaveProject,
  syncDeleteProject,
  syncSaveProfile,
  isFirebaseAvailable,
  checkFirestoreHealth,
  pushAllToFirestore,
} from "../firebase.ts";
import { compressImage } from "../lib/image-compressor.ts";
import { INITIAL_PROJECTS, INITIAL_PROFILE } from "../initialData.ts";
import { formatWhatsAppUrl, formatMessengerUrl } from "../lib/contact-links.ts";
import { WhatsAppIcon, MessengerIcon } from "./FloatingContactWidget.tsx";
import {
  X,
  Plus,
  Trash2,
  Edit3,
  Upload,
  Image as ImageIcon,
  Check,
  User,
  FolderKanban,
  Sliders,
  LogOut,
  ExternalLink,
  Sparkles,
  Layers,
  Cloud,
  RefreshCw,
  Search,
  Eye,
  Star,
  TrendingUp,
  AlertTriangle,
  Database,
  Server,
  ShieldCheck,
  Copy,
} from "lucide-react";

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  projects: Project[];
  profile: ProfileData;
  onUpdateProjects: (projects: Project[]) => void;
  onUpdateProfile: (profile: ProfileData) => void;
  isArabic: boolean;
}

export function AdminDashboard({
  isOpen,
  onClose,
  onLogout,
  projects,
  profile,
  onUpdateProjects,
  onUpdateProfile,
  isArabic,
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<
    "profile" | "projects" | "add" | "placements" | "database"
  >("profile");
  const [searchQuery, setSearchQuery] = useState("");
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Firebase Health Diagnostic state
  const [firebaseHealth, setFirebaseHealth] = useState<{
    status: "connected" | "permission_denied" | "unavailable";
    message: string;
    details?: string;
  } | null>(null);
  const [isCheckingFirebase, setIsCheckingFirebase] = useState(false);
  const [copiedRules, setCopiedRules] = useState(false);

  const handleCheckFirebase = async () => {
    setIsCheckingFirebase(true);
    try {
      const res = await checkFirestoreHealth();
      setFirebaseHealth(res);
    } catch (err: unknown) {
      setFirebaseHealth({
        status: "unavailable",
        message: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setIsCheckingFirebase(false);
    }
  };

  const [isPushingAll, setIsPushingAll] = useState(false);

  const handlePushAll = async () => {
    setIsPushingAll(true);
    try {
      const res = await pushAllToFirestore(projects, profile);
      if (res.success) {
        showToast(res.message);
      } else {
        showToast(res.message, "error");
      }
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Error syncing to Firebase", "error");
    } finally {
      setIsPushingAll(false);
    }
  };

  // Profile Form State
  const [profileForm, setProfileForm] = useState<ProfileData>(profile);
  const [portraitPreview, setPortraitPreview] = useState<string>(profile.portraitUrl);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const profileFileInputRef = useRef<HTMLInputElement>(null);

  // Project Form State (For Add / Edit)
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [projectForm, setProjectForm] = useState<{
    title: string;
    titleEn: string;
    category: string;
    categoryEn: string;
    detail: string;
    detailEn: string;
    fullDescription: string;
    imageUrl: string;
    galleryImages: string[];
    clientName: string;
    completionYear: string;
    impactMetric: string;
    challengeSolved: string;
    liveUrl: string;
    technologies: string;
    placements: ProjectPlacement[];
  }>({
    title: "",
    titleEn: "",
    category: "منتج مالي",
    categoryEn: "Fintech Product",
    detail: "",
    detailEn: "",
    fullDescription: "",
    imageUrl: "",
    galleryImages: [],
    clientName: "",
    completionYear: new Date().getFullYear().toString(),
    impactMetric: "",
    challengeSolved: "",
    liveUrl: "",
    technologies: "Figma, UI/UX, Design System",
    placements: ["main", "featured"],
  });

  const [projectImagePreview, setProjectImagePreview] = useState<string>("");
  const [isSavingProject, setIsSavingProject] = useState(false);
  const projectFileInputRef = useRef<HTMLInputElement>(null);
  const galleryFileInputRef = useRef<HTMLInputElement>(null);

  // Keep form in sync when profile prop changes
  React.useEffect(() => {
    setProfileForm(profile);
    setPortraitPreview(profile.portraitUrl);
  }, [profile]);

  if (!isOpen) return null;

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Handle Profile Portrait Upload from Device
  const handlePortraitFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast(
          isArabic
            ? "حجم الصورة كبير جداً، يرجى اختيار صورة أقل من 5 ميجابايت."
            : "Image size is too large. Please select an image under 5MB.",
          "error",
        );
        return;
      }
      try {
        const compressed = await compressImage(file, 800, 800, 0.82);
        setPortraitPreview(compressed);
        setProfileForm((prev) => ({ ...prev, portraitUrl: compressed }));
        showToast(
          isArabic
            ? 'تم تجهيز وضغط الصورة بنجاح! اضغط "حفظ تعديلات الملف الشخصي" لتثبيتها في Firebase.'
            : 'Image optimized! Click "Save Profile Changes" to apply.',
        );
      } catch (err) {
        console.error("Portrait compression error:", err);
      }
    }
  };

  // Save Profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const updatedProfile = { ...profileForm, portraitUrl: portraitPreview };
      const res = await syncSaveProfile(updatedProfile);
      if (!res.success) {
        showToast(res.message, "error");
        return;
      }
      onUpdateProfile(updatedProfile);
      showToast(
        res.message || (isArabic ? "تم حفظ التعديلات بنجاح!" : "Changes saved successfully!"),
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error saving profile";
      showToast(msg, "error");
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Handle Project Main Image Upload
  const handleProjectImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file, 1200, 1200, 0.82);
        setProjectImagePreview(compressed);
        setProjectForm((prev) => ({ ...prev, imageUrl: compressed }));
        showToast(
          isArabic
            ? "تم تجهيز وضغط صورة المشروع بنجاح لتناسب متطلبات التخزين السحابي!"
            : "Image optimized and ready for cloud sync!",
        );
      } catch (err) {
        console.error("Project image compression error:", err);
      }
    }
  };

  // Handle Project Gallery Images Upload
  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const compressedList: string[] = [];
      for (const file of Array.from(files)) {
        try {
          const comp = await compressImage(file, 1200, 1200, 0.82);
          if (comp) compressedList.push(comp);
        } catch (err) {
          console.error("Gallery image compression error:", err);
        }
      }
      if (compressedList.length > 0) {
        setProjectForm((prev) => ({
          ...prev,
          galleryImages: [...prev.galleryImages, ...compressedList],
        }));
        showToast(
          isArabic
            ? `تمت إضافة (${compressedList.length}) صور مضغوطة للمعرض`
            : `Added (${compressedList.length}) optimized gallery images`,
        );
      }
    }
  };

  // Toggle Placement
  const handleTogglePlacement = (placement: ProjectPlacement) => {
    setProjectForm((prev) => {
      const exists = prev.placements.includes(placement);
      if (exists) {
        return { ...prev, placements: prev.placements.filter((p) => p !== placement) };
      } else {
        return { ...prev, placements: [...prev.placements, placement] };
      }
    });
  };

  // Start Editing Project
  const handleStartEditProject = (proj: Project) => {
    setEditingProjectId(proj.id);
    setProjectForm({
      title: proj.title,
      titleEn: proj.titleEn || "",
      category: proj.category,
      categoryEn: proj.categoryEn || "",
      detail: proj.detail,
      detailEn: proj.detailEn || "",
      fullDescription: proj.fullDescription || "",
      imageUrl: proj.imageUrl,
      galleryImages: proj.galleryImages || [],
      clientName: proj.clientName || "",
      completionYear: proj.completionYear || "",
      impactMetric: proj.impactMetric || "",
      challengeSolved: proj.challengeSolved || "",
      liveUrl: proj.liveUrl || "",
      technologies: proj.technologies ? proj.technologies.join(", ") : "",
      placements: proj.placements || ["main"],
    });
    setProjectImagePreview(proj.imageUrl);
    setActiveTab("add");
  };

  // Reset Project Form
  const resetProjectForm = () => {
    setEditingProjectId(null);
    setProjectForm({
      title: "",
      titleEn: "",
      category: "منتج مالي",
      categoryEn: "Fintech Product",
      detail: "",
      detailEn: "",
      fullDescription: "",
      imageUrl: "",
      galleryImages: [],
      clientName: "",
      completionYear: new Date().getFullYear().toString(),
      impactMetric: "",
      challengeSolved: "",
      liveUrl: "",
      technologies: "Figma, UI/UX, Design System",
      placements: ["main", "featured"],
    });
    setProjectImagePreview("");
  };

  // Submit Project (Add or Update)
  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectForm.title.trim()) {
      showToast(isArabic ? "يرجى إدخال اسم المشروع" : "Please enter project title", "error");
      return;
    }
    if (!projectForm.imageUrl && !projectImagePreview) {
      showToast(
        isArabic ? "يرجى رفع أو وضع رابط صورة للمشروع" : "Please provide a project image",
        "error",
      );
      return;
    }

    setIsSavingProject(true);

    const techArray = projectForm.technologies
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const targetId = editingProjectId || `proj-${Date.now()}`;
    const newProject: Project = {
      id: targetId,
      title: projectForm.title,
      titleEn: projectForm.titleEn || projectForm.title,
      category: projectForm.category,
      categoryEn: projectForm.categoryEn || projectForm.category,
      detail: projectForm.detail,
      detailEn: projectForm.detailEn || projectForm.detail,
      fullDescription: projectForm.fullDescription,
      imageUrl: projectImagePreview || projectForm.imageUrl,
      galleryImages: projectForm.galleryImages,
      clientName: projectForm.clientName,
      completionYear: projectForm.completionYear,
      impactMetric: projectForm.impactMetric,
      challengeSolved: projectForm.challengeSolved,
      liveUrl: projectForm.liveUrl,
      technologies: techArray,
      placements: projectForm.placements.length > 0 ? projectForm.placements : ["main"],
      createdAt: editingProjectId
        ? projects.find((p) => p.id === editingProjectId)?.createdAt || Date.now()
        : Date.now(),
    };

    try {
      const res = await syncSaveProject(newProject);
      if (!res.success) {
        showToast(res.message, "error");
        return;
      }

      const updatedList = editingProjectId
        ? projects.map((p) => (p.id === targetId ? newProject : p))
        : [newProject, ...projects];

      onUpdateProjects(updatedList);
      showToast(res.message);
      resetProjectForm();
      setActiveTab("projects");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error saving project";
      showToast(msg, "error");
    } finally {
      setIsSavingProject(false);
    }
  };

  // Delete Project
  const handleDeleteProject = async (projectId: string, title: string) => {
    const confirmText = isArabic
      ? `هل أنت متأكد من رغبتك في حذف المشروع: "${title}"؟`
      : `Are you sure you want to delete project: "${title}"?`;
    if (window.confirm(confirmText)) {
      try {
        await syncDeleteProject(projectId);
        const filtered = projects.filter((p) => p.id !== projectId);
        onUpdateProjects(filtered);
        showToast(isArabic ? "تم حذف المشروع بنجاح" : "Project deleted successfully");
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Error deleting project";
        showToast(msg, "error");
      }
    }
  };

  // Reset to initial projects
  const handleResetToDefaults = () => {
    if (
      window.confirm(
        isArabic
          ? "هل تريد استعادة المشاريع النموذجية الافتراضية؟"
          : "Do you want to reset to default sample projects?",
      )
    ) {
      INITIAL_PROJECTS.forEach((p) => syncSaveProject(p));
      onUpdateProjects(INITIAL_PROJECTS);
      showToast(isArabic ? "تم استعادة المشاريع الافتراضية" : "Default projects restored");
    }
  };

  // Filtered projects
  const filteredProjects = projects.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.clientName && p.clientName.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div
        className="relative w-full max-w-5xl my-auto glass-solid border border-border/90 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="px-5 py-4 border-b border-border/70 flex flex-wrap items-center justify-between gap-3 bg-white/40">
          <div className="flex items-center gap-3">
            <span className="brand-mark text-sm">M</span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-foreground">
                  {isArabic ? "لوحة تحكم البورتفوليو" : "Portfolio Admin Studio"}
                </h2>
                {/* Firebase Real-time indicator */}
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-700 border border-emerald-500/20"
                  title="متصل بقاعدة بيانات Firebase Firestore (gams-dca3f)"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <Cloud className="w-3 h-3" />
                  {isFirebaseAvailable ? "Firebase متصل" : "حفظ محلي فوري"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {isArabic
                  ? "إدارة الصورة الشخصية، تفاصيل المشاريع، وأماكن الظهور"
                  : "Manage portrait, project details, and showcase placements"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onLogout}
              className="px-3 py-1.5 rounded-lg border border-border/80 text-xs font-semibold hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition flex items-center gap-1.5 cursor-pointer"
              title={isArabic ? "تسجيل الخروج" : "Log out"}
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{isArabic ? "خروج" : "Logout"}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-black/5 text-muted-foreground hover:text-foreground transition cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toast Notification */}
        {notification && (
          <div
            className={`mx-5 mt-3 p-3 rounded-xl text-xs sm:text-sm flex items-center gap-2 transition-all ${
              notification.type === "error"
                ? "bg-destructive/15 text-destructive border border-destructive/30"
                : "bg-emerald-500/15 text-emerald-700 border border-emerald-500/30"
            }`}
          >
            {notification.type === "error" ? (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            ) : (
              <Check className="w-4 h-4 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="px-5 pt-3 border-b border-border/60 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab("profile")}
            className={`pb-3 px-3 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition cursor-pointer ${
              activeTab === "profile"
                ? "border-primary text-primary font-bold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <User className="w-4 h-4" />
            <span>{isArabic ? "الملف الشخصي وصورة البروفايل" : "Profile & Portrait"}</span>
          </button>

          <button
            onClick={() => setActiveTab("projects")}
            className={`pb-3 px-3 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition cursor-pointer ${
              activeTab === "projects"
                ? "border-primary text-primary font-bold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <FolderKanban className="w-4 h-4" />
            <span>
              {isArabic ? "إدارة المشاريع الحالية" : "Manage Projects"} ({projects.length})
            </span>
          </button>

          <button
            onClick={() => {
              if (activeTab !== "add") resetProjectForm();
              setActiveTab("add");
            }}
            className={`pb-3 px-3 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition cursor-pointer ${
              activeTab === "add"
                ? "border-primary text-primary font-bold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>
              {editingProjectId
                ? isArabic
                  ? "تعديل المشروع"
                  : "Edit Project"
                : isArabic
                  ? "إضافة مشروع جديد"
                  : "Add Project"}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("placements")}
            className={`pb-3 px-3 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition cursor-pointer ${
              activeTab === "placements"
                ? "border-primary text-primary font-bold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>
              {isArabic ? "أماكن الظهور واستراتيجية جذب العملاء" : "Placements & Strategy"}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab("database");
              if (!firebaseHealth) handleCheckFirebase();
            }}
            className={`pb-3 px-3 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition cursor-pointer ${
              activeTab === "database"
                ? "border-primary text-primary font-bold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Database className="w-4 h-4" />
            <span>{isArabic ? "حالة المزامنة وقاعدة البيانات" : "Cloud Sync & Database"}</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </button>
        </div>

        {/* Tab Content Container */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: PROFILE & PORTRAIT */}
          {activeTab === "profile" && (
            <form onSubmit={handleSaveProfile} className="space-y-6 animate-fade-in">
              {/* Portrait Image Section */}
              <div className="p-5 rounded-2xl border border-border/80 bg-white/40">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-4">
                  <ImageIcon className="w-4 h-4 text-primary" />
                  <span>
                    {isArabic ? "صورة البروفايل الشخصية (Hero Portrait)" : "Portrait Photo"}
                  </span>
                </h3>

                <div className="grid sm:grid-cols-12 gap-6 items-center">
                  {/* Image Preview Box */}
                  <div className="sm:col-span-4 flex flex-col items-center">
                    <div className="w-44 portrait-wrap shadow-xl">
                      <img
                        src={portraitPreview}
                        alt="Profile Preview"
                        className="portrait w-full h-56 object-cover rounded-xl"
                      />
                      <div className="specialty text-center">
                        <span className="text-[10px] text-muted-foreground">
                          {isArabic ? "المعاينة الحية" : "Live Preview"}
                        </span>
                        <strong className="text-xs">{profileForm.specialty || "UI/UX"}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Upload Controls */}
                  <div className="sm:col-span-8 space-y-4">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {isArabic
                        ? "يمكنك رفع صورتك الشخصية مباشرة من جهازك (كمبيوتر أو هاتف) أو وضع رابط صورة خارجي. ستظهر صورتك فوراً في أعلى الموقع داخل إطار فني مخصص."
                        : "Upload your photo directly from your device or paste an external URL. It will instantly update on the hero section."}
                    </p>

                    <div className="flex flex-wrap gap-3">
                      <input
                        type="file"
                        ref={profileFileInputRef}
                        onChange={handlePortraitFileUpload}
                        accept="image/*"
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => profileFileInputRef.current?.click()}
                        className="button button-primary text-xs"
                      >
                        <Upload className="w-4 h-4" />
                        <span>{isArabic ? "رفع صورة من الجهاز" : "Upload From Device"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setPortraitPreview(INITIAL_PROFILE.portraitUrl);
                          setProfileForm((prev) => ({
                            ...prev,
                            portraitUrl: INITIAL_PROFILE.portraitUrl,
                          }));
                        }}
                        className="button button-glass text-xs"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>{isArabic ? "استعادة الصورة الأصلية" : "Restore Default"}</span>
                      </button>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-foreground/80 mb-1">
                        {isArabic ? "أو أدخل رابط صورة مباشر (URL):" : "Or enter direct image URL:"}
                      </label>
                      <input
                        type="url"
                        value={portraitPreview.startsWith("data:") ? "" : portraitPreview}
                        onChange={(e) => {
                          setPortraitPreview(e.target.value);
                          setProfileForm((prev) => ({ ...prev, portraitUrl: e.target.value }));
                        }}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full glass-input text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Personal Details */}
              <div className="p-5 rounded-2xl border border-border/80 bg-white/40 space-y-4">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  <span>
                    {isArabic ? "المعلومات الشخصية والنصوص" : "Personal Information & Bio"}
                  </span>
                </h3>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-foreground/80 mb-1">
                      {isArabic ? "الاسم (بالعربية)" : "Name (Arabic)"}
                    </label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      className="w-full glass-input text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground/80 mb-1">
                      {isArabic ? "الاسم (بالإنجليزية)" : "Name (English)"}
                    </label>
                    <input
                      type="text"
                      value={profileForm.nameEn}
                      onChange={(e) => setProfileForm({ ...profileForm, nameEn: e.target.value })}
                      className="w-full glass-input text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-foreground/80 mb-1">
                      {isArabic ? "المسمى الوظيفي (بالعربية)" : "Role / Title (Arabic)"}
                    </label>
                    <input
                      type="text"
                      value={profileForm.role}
                      onChange={(e) => setProfileForm({ ...profileForm, role: e.target.value })}
                      className="w-full glass-input text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground/80 mb-1">
                      {isArabic ? "المسمى الوظيفي (بالإنجليزية)" : "Role / Title (English)"}
                    </label>
                    <input
                      type="text"
                      value={profileForm.roleEn}
                      onChange={(e) => setProfileForm({ ...profileForm, roleEn: e.target.value })}
                      className="w-full glass-input text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-foreground/80 mb-1">
                      {isArabic ? "النبذة التعريفية (بالعربية)" : "Intro / Bio (Arabic)"}
                    </label>
                    <textarea
                      rows={3}
                      value={profileForm.intro}
                      onChange={(e) => setProfileForm({ ...profileForm, intro: e.target.value })}
                      className="w-full glass-input text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground/80 mb-1">
                      {isArabic ? "النبذة التعريفية (بالإنجليزية)" : "Intro / Bio (English)"}
                    </label>
                    <textarea
                      rows={3}
                      value={profileForm.introEn}
                      onChange={(e) => setProfileForm({ ...profileForm, introEn: e.target.value })}
                      className="w-full glass-input text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-foreground/80 mb-1">
                      {isArabic ? "حالة التفرغ (Availability)" : "Availability Status"}
                    </label>
                    <input
                      type="text"
                      value={profileForm.availableText}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, availableText: e.target.value })
                      }
                      className="w-full glass-input text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground/80 mb-1">
                      {isArabic ? "وسام التخصص (Specialty)" : "Specialty Badge"}
                    </label>
                    <input
                      type="text"
                      value={profileForm.specialty}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, specialty: e.target.value })
                      }
                      className="w-full glass-input text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground/80 mb-1">
                      {isArabic ? "البريد الإلكتروني للتواصل" : "Contact Email"}
                    </label>
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      className="w-full glass-input text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Direct Messaging Channels Section (WhatsApp & Facebook Messenger) */}
              <div className="p-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.04] space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
                      <WhatsAppIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-foreground">
                        {isArabic
                          ? "قنوات التواصل المباشر (واتساب وفيسبوك ماسنجر)"
                          : "Direct Chat Channels (WhatsApp & Facebook Messenger)"}
                      </h3>
                      <p className="text-[11px] text-muted-foreground">
                        {isArabic
                          ? "يتم تفعيل أي تعديل فورياً على الأزرار العائمة الثابتة وجميع أزرار التواصل في الموقع"
                          : "Changes are automatically synced to the sticky floating buttons and all contact buttons"}
                      </p>
                    </div>
                  </div>

                  {/* Toggle floating widget */}
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-foreground bg-white/80 px-3 py-1.5 rounded-lg border border-border/80 hover:bg-white transition">
                    <input
                      type="checkbox"
                      checked={profileForm.showFloatingContact ?? true}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          showFloatingContact: e.target.checked,
                        })
                      }
                      className="rounded border-gray-300 text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                    />
                    <span>
                      {isArabic
                        ? "تفعيل الأزرار العائمة الثابتة مع التمرير"
                        : "Enable Sticky Floating Contact Widget"}
                    </span>
                  </label>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* WhatsApp Field */}
                  <div className="p-4 rounded-xl border border-emerald-500/20 bg-white/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                        <WhatsAppIcon className="w-4 h-4 text-emerald-600" />
                        <span>{isArabic ? "رقم هاتف الواتساب (WhatsApp)" : "WhatsApp Phone"}</span>
                      </label>
                      {profileForm.whatsappNumber && (
                        <a
                          href={formatWhatsAppUrl(
                            profileForm.whatsappNumber,
                            profileForm.whatsappMessage,
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-100 hover:bg-emerald-200 px-2 py-0.5 rounded-md transition"
                        >
                          <span>{isArabic ? "تجربة الرابط" : "Test Link"}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>

                    <input
                      type="text"
                      placeholder="مثال: 01120194940"
                      value={profileForm.whatsappNumber || ""}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, whatsappNumber: e.target.value })
                      }
                      className="w-full glass-input text-sm font-mono dir-ltr"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      {isArabic
                        ? "يقبل رقم الهاتف المصري المباشر (01120194940) أو الصيغة الدولية (+20...)"
                        : "Supports local Egyptian number (01120194940) or international format"}
                    </p>

                    <div>
                      <label className="block text-[11px] font-semibold text-foreground/80 mb-1">
                        {isArabic
                          ? "الرسالة التلقائية عند بدء المحادثة"
                          : "Default Starter Message in Chat"}
                      </label>
                      <input
                        type="text"
                        placeholder="مرحباً أستاذ محمد، أرغب في الاستفسار عن مشروع..."
                        value={profileForm.whatsappMessage || ""}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, whatsappMessage: e.target.value })
                        }
                        className="w-full glass-input text-xs"
                      />
                    </div>
                  </div>

                  {/* Facebook Messenger Field */}
                  <div className="p-4 rounded-xl border border-sky-500/20 bg-white/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-sky-800 flex items-center gap-1.5">
                        <div className="w-4 h-4 text-sky-600">
                          <MessengerIcon className="w-4 h-4" />
                        </div>
                        <span>
                          {isArabic
                            ? "معرّف صفحة/بروفايل فيسبوك ماسنجر"
                            : "Facebook Messenger Page ID / Link"}
                        </span>
                      </label>
                      {profileForm.facebookMessengerId && (
                        <a
                          href={formatMessengerUrl(profileForm.facebookMessengerId)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-700 hover:text-sky-900 bg-sky-100 hover:bg-sky-200 px-2 py-0.5 rounded-md transition"
                        >
                          <span>{isArabic ? "تجربة الرابط" : "Test Link"}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>

                    <input
                      type="text"
                      placeholder="مثال: 379964405195884 أو رابط الصفحة"
                      value={profileForm.facebookMessengerId || ""}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, facebookMessengerId: e.target.value })
                      }
                      className="w-full glass-input text-sm font-mono dir-ltr"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      {isArabic
                        ? "أدخل معرّف الصفحة (مثل 379964405195884) أو اسم المستخدم أو رابط كامل"
                        : "Enter page ID (e.g. 379964405195884), username, or link"}
                    </p>

                    <div className="text-[11px] text-muted-foreground pt-1 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                      <span>
                        {isArabic
                          ? "رابط الماسنجر المولد تلقائياً:"
                          : "Auto-generated Messenger link:"}{" "}
                        <span className="font-mono text-sky-600 font-bold">
                          m.me/{profileForm.facebookMessengerId?.replace(/^[@/]+/, "") || "..."}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Section */}
              <div className="p-5 rounded-2xl border border-border/80 bg-white/40 space-y-4">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <span>{isArabic ? "الإحصائيات البارزة بالهيدر" : "Featured Header Stats"}</span>
                </h3>

                <div className="grid sm:grid-cols-3 gap-4">
                  {(profileForm.stats || []).map((st, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl border border-border/70 bg-white/60 space-y-2"
                    >
                      <span className="text-[11px] font-bold text-primary">
                        {isArabic ? `الإحصائية ${idx + 1}` : `Stat ${idx + 1}`}
                      </span>
                      <input
                        type="text"
                        placeholder="العنوان (مثلاً: خبرة)"
                        value={st?.title || ""}
                        onChange={(e) => {
                          const updated = [...(profileForm.stats || [])];
                          if (updated[idx]) {
                            updated[idx] = { ...updated[idx], title: e.target.value };
                            setProfileForm({ ...profileForm, stats: updated });
                          }
                        }}
                        className="w-full glass-input text-xs font-bold"
                      />
                      <input
                        type="text"
                        placeholder="التفصيل (مثلاً: في حلول رقمية)"
                        value={st?.detail || ""}
                        onChange={(e) => {
                          const updated = [...(profileForm.stats || [])];
                          if (updated[idx]) {
                            updated[idx] = { ...updated[idx], detail: e.target.value };
                            setProfileForm({ ...profileForm, stats: updated });
                          }
                        }}
                        className="w-full glass-input text-xs"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Profile */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="button button-primary text-sm px-6"
                >
                  {isSavingProfile ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/60 border-t-white rounded-full animate-spin" />
                      {isArabic ? "جارِ الحفظ..." : "Saving..."}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      {isArabic ? "حفظ تعديلات الملف الشخصي" : "Save Profile Changes"}
                    </span>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: PROJECTS MANAGEMENT */}
          {activeTab === "projects" && (
            <div className="space-y-4 animate-fade-in">
              {/* Actions & Search */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="relative flex-1 min-w-[240px]">
                  <Search className="w-4 h-4 text-muted-foreground absolute top-1/2 -translate-y-1/2 start-3" />
                  <input
                    type="text"
                    placeholder={isArabic ? "ابحث في المشاريع..." : "Search projects..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full glass-input ps-9 text-xs sm:text-sm"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      resetProjectForm();
                      setActiveTab("add");
                    }}
                    className="button button-primary text-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{isArabic ? "إضافة مشروع جديد" : "New Project"}</span>
                  </button>

                  <button
                    onClick={handleResetToDefaults}
                    className="button button-glass text-xs"
                    title={isArabic ? "استعادة المشاريع الأصلية" : "Restore Default Projects"}
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>{isArabic ? "استعادة الافتراضي" : "Reset"}</span>
                  </button>
                </div>
              </div>

              {/* Projects Table / Cards */}
              <div className="space-y-3">
                {filteredProjects.length === 0 ? (
                  <div className="p-12 text-center border border-dashed border-border/80 rounded-2xl">
                    <FolderKanban className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-semibold text-foreground">
                      {isArabic ? "لا توجد مشاريع تطابق البحث" : "No projects found"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {isArabic
                        ? "اضغط على زر إضافة مشروع جديد للبدء"
                        : 'Click "New Project" to add one'}
                    </p>
                  </div>
                ) : (
                  filteredProjects.map((proj) => (
                    <div
                      key={proj.id}
                      className="p-4 rounded-xl border border-border/80 bg-white/50 hover:bg-white/70 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={proj.imageUrl}
                          alt={proj.title}
                          className="w-16 h-14 object-cover rounded-lg border border-border/60 shrink-0"
                        />
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-bold text-foreground">{proj.title}</span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-accent/15 text-accent-foreground">
                              {proj.category}
                            </span>
                            {proj.impactMetric && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-700">
                                {proj.impactMetric}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                            {proj.detail}
                          </p>
                          {/* Placements Badges */}
                          <div className="flex flex-wrap items-center gap-1 mt-2">
                            <span className="text-[10px] text-muted-foreground font-medium me-1">
                              {isArabic ? "أماكن الظهور:" : "Placements:"}
                            </span>
                            {proj.placements?.includes("main") && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] bg-primary/10 text-primary font-semibold">
                                {isArabic ? "المعرض الرئيسي" : "Main Grid"}
                              </span>
                            )}
                            {proj.placements?.includes("featured") && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] bg-amber-500/15 text-amber-700 font-semibold">
                                {isArabic ? "بطل الواجهة" : "Hero Spotlight"}
                              </span>
                            )}
                            {proj.placements?.includes("case_study") && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] bg-purple-500/15 text-purple-700 font-semibold">
                                {isArabic ? "دراسة حالة" : "Case Study"}
                              </span>
                            )}
                            {proj.placements?.includes("latest_strip") && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] bg-cyan-500/15 text-cyan-700 font-semibold">
                                {isArabic ? "الشريط السريع" : "Live Strip"}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        <button
                          onClick={() => handleStartEditProject(proj)}
                          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-black/5 transition"
                          title={isArabic ? "تعديل المشروع" : "Edit Project"}
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProject(proj.id, proj.title)}
                          className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition"
                          title={isArabic ? "حذف المشروع" : "Delete Project"}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: ADD / EDIT PROJECT */}
          {activeTab === "add" && (
            <form onSubmit={handleSaveProject} className="space-y-6 animate-fade-in">
              <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    {editingProjectId
                      ? isArabic
                        ? "تعديل بيانات المشروع"
                        : "Edit Project Details"
                      : isArabic
                        ? "إضافة مشروع جديد للمعرض"
                        : "Add New Project to Showcase"}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {isArabic
                      ? "حدد الصور وتفاصيل العمل والأماكن التي يظهر بها لجذب العملاء"
                      : "Configure imagery, client impact, and strategic placements"}
                  </p>
                </div>
                {editingProjectId && (
                  <button
                    type="button"
                    onClick={resetProjectForm}
                    className="button button-glass text-xs py-1"
                  >
                    {isArabic ? "إلغاء التعديل" : "Cancel Edit"}
                  </button>
                )}
              </div>

              {/* Title & Category */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground/80 mb-1">
                    {isArabic ? "عنوان المشروع (بالعربية) *" : "Project Title (Arabic) *"}
                  </label>
                  <input
                    type="text"
                    value={projectForm.title}
                    onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                    placeholder="مثال: منصة رصيد للمدفوعات الرقمية"
                    className="w-full glass-input text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground/80 mb-1">
                    {isArabic ? "عنوان المشروع (بالإنجليزية)" : "Project Title (English)"}
                  </label>
                  <input
                    type="text"
                    value={projectForm.titleEn}
                    onChange={(e) => setProjectForm({ ...projectForm, titleEn: e.target.value })}
                    placeholder="e.g. Raseed Payments Platform"
                    className="w-full glass-input text-sm"
                  />
                </div>
              </div>

              {/* Category & Impact Metric */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground/80 mb-1">
                    {isArabic ? "تصنيف المشروع" : "Category"}
                  </label>
                  <select
                    value={projectForm.category}
                    onChange={(e) => setProjectForm({ ...projectForm, category: e.target.value })}
                    className="w-full glass-input text-sm"
                  >
                    <option value="منتج مالي">منتج مالي (Fintech)</option>
                    <option value="تجارة إلكترونية">تجارة إلكترونية (E-commerce)</option>
                    <option value="تطبيق صحي">تطبيق صحي (Health App)</option>
                    <option value="تطبيق جوال">تطبيق جوال (Mobile App)</option>
                    <option value="منصة سحابية SaaS">منصة سحابية (SaaS Platform)</option>
                    <option value="هوية بصرية">هوية بصرية (Visual Identity)</option>
                    <option value="تصميم واجهات UI/UX">تصميم واجهات UI/UX</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground/80 mb-1">
                    {isArabic
                      ? "الأثر الرقمي أو النتيجة بالأرقام (مهم لجذب العملاء)"
                      : "Measurable Impact (Key client hook)"}
                  </label>
                  <input
                    type="text"
                    value={projectForm.impactMetric}
                    onChange={(e) =>
                      setProjectForm({ ...projectForm, impactMetric: e.target.value })
                    }
                    placeholder="مثال: زيادة معدل التحويل 180% وتقليل وقت الإيداع"
                    className="w-full glass-input text-sm"
                  />
                </div>
              </div>

              {/* Short Detail */}
              <div>
                <label className="block text-xs font-semibold text-foreground/80 mb-1">
                  {isArabic ? "وصف مختصر (يظهر في البطاقة الرئيسية) *" : "Short Description *"}
                </label>
                <input
                  type="text"
                  value={projectForm.detail}
                  onChange={(e) => setProjectForm({ ...projectForm, detail: e.target.value })}
                  placeholder="مثال: تجربة مالية واضحة وآمنة من التسجيل حتى التحويل"
                  className="w-full glass-input text-sm"
                  required
                />
              </div>

              {/* In-depth description */}
              <div>
                <label className="block text-xs font-semibold text-foreground/80 mb-1">
                  {isArabic ? "دراسة الحالة والتفاصيل الكاملة" : "Full Case Study & Details"}
                </label>
                <textarea
                  rows={3}
                  value={projectForm.fullDescription}
                  onChange={(e) =>
                    setProjectForm({ ...projectForm, fullDescription: e.target.value })
                  }
                  placeholder="اشرح المشكلة التي واجهت العميل والحل الإبداعي الذي قمت بتصميمه وكيف حقق المشروع نجاحاً باهراً..."
                  className="w-full glass-input text-sm"
                />
              </div>

              {/* Challenge solved */}
              <div>
                <label className="block text-xs font-semibold text-foreground/80 mb-1">
                  {isArabic ? "التحدي الذي قمت بحله للعميل" : "Challenge Solved for Client"}
                </label>
                <input
                  type="text"
                  value={projectForm.challengeSolved}
                  onChange={(e) =>
                    setProjectForm({ ...projectForm, challengeSolved: e.target.value })
                  }
                  placeholder="مثال: معالجة بطء استخراج التقارير وتشتت البيانات عبر دمج كل الأدوات في لوحة تحكم فورية"
                  className="w-full glass-input text-sm"
                />
              </div>

              {/* Project Images Section */}
              <div className="p-5 rounded-2xl border border-border/80 bg-white/40 space-y-4">
                <h4 className="text-xs font-bold text-foreground flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-primary" />
                  <span>
                    {isArabic ? "صورة الغلاف الرئيسية للمشروع *" : "Main Project Cover Image *"}
                  </span>
                </h4>

                <div className="grid sm:grid-cols-12 gap-4 items-center">
                  <div className="sm:col-span-4">
                    {projectImagePreview ? (
                      <div className="image-frame rounded-xl border border-border/70 overflow-hidden shadow">
                        <img
                          src={projectImagePreview}
                          alt="Cover Preview"
                          className="w-full h-32 object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-32 rounded-xl border-2 border-dashed border-border/80 flex flex-col items-center justify-center text-muted-foreground p-3 text-center">
                        <ImageIcon className="w-6 h-6 mb-1 opacity-50" />
                        <span className="text-[11px]">
                          {isArabic ? "لا توجد صورة محددة" : "No image selected"}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="sm:col-span-8 space-y-3">
                    <input
                      type="file"
                      ref={projectFileInputRef}
                      onChange={handleProjectImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => projectFileInputRef.current?.click()}
                        className="button button-primary text-xs"
                      >
                        <Upload className="w-4 h-4" />
                        <span>{isArabic ? "رفع صورة من جهازك" : "Upload From Device"}</span>
                      </button>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                        {isArabic ? "أو أدخل رابط صورة مباشر (URL):" : "Or enter direct image URL:"}
                      </label>
                      <input
                        type="url"
                        value={projectForm.imageUrl.startsWith("data:") ? "" : projectForm.imageUrl}
                        onChange={(e) => {
                          setProjectImagePreview(e.target.value);
                          setProjectForm({ ...projectForm, imageUrl: e.target.value });
                        }}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full glass-input text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Gallery Images */}
                <div className="pt-3 border-t border-border/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-foreground">
                      {isArabic
                        ? "صور إضافية لمعرض المشروع (اختياري)"
                        : "Additional Gallery Images"}
                    </span>
                    <input
                      type="file"
                      ref={galleryFileInputRef}
                      onChange={handleGalleryUpload}
                      multiple
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => galleryFileInputRef.current?.click()}
                      className="button button-glass text-xs py-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{isArabic ? "إضافة صور للمعرض" : "Add Gallery Images"}</span>
                    </button>
                  </div>

                  {projectForm.galleryImages.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {projectForm.galleryImages.map((img, idx) => (
                        <div
                          key={idx}
                          className="relative group w-16 h-14 rounded-lg overflow-hidden border border-border/80"
                        >
                          <img src={img} alt="Gallery" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => {
                              const updated = projectForm.galleryImages.filter((_, i) => i !== idx);
                              setProjectForm({ ...projectForm, galleryImages: updated });
                            }}
                            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Client, Year, Tech, Live URL */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground/80 mb-1">
                    {isArabic ? "اسم العميل أو المؤسسة" : "Client Name"}
                  </label>
                  <input
                    type="text"
                    value={projectForm.clientName}
                    onChange={(e) => setProjectForm({ ...projectForm, clientName: e.target.value })}
                    placeholder="مثال: شركة رصيد المالية"
                    className="w-full glass-input text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground/80 mb-1">
                    {isArabic ? "سنة الإنجاز" : "Completion Year"}
                  </label>
                  <input
                    type="text"
                    value={projectForm.completionYear}
                    onChange={(e) =>
                      setProjectForm({ ...projectForm, completionYear: e.target.value })
                    }
                    placeholder="2025"
                    className="w-full glass-input text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground/80 mb-1">
                    {isArabic
                      ? "التقنيات وأدوات التصميم (مفصولة بفاصلة)"
                      : "Technologies & Tools (comma separated)"}
                  </label>
                  <input
                    type="text"
                    value={projectForm.technologies}
                    onChange={(e) =>
                      setProjectForm({ ...projectForm, technologies: e.target.value })
                    }
                    placeholder="Figma, UI/UX, Design System, React"
                    className="w-full glass-input text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground/80 mb-1">
                    {isArabic ? "رابط المشروع الحي (Live Link)" : "Live Project URL"}
                  </label>
                  <input
                    type="url"
                    value={projectForm.liveUrl}
                    onChange={(e) => setProjectForm({ ...projectForm, liveUrl: e.target.value })}
                    placeholder="https://example.com/project"
                    className="w-full glass-input text-sm"
                  />
                </div>
              </div>

              {/* Strategic Placements Selection */}
              <div className="p-5 rounded-2xl border border-primary/30 bg-primary/5 space-y-3">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-primary" />
                  <h4 className="text-xs font-bold text-foreground">
                    {isArabic
                      ? "حدد أماكن ظهور المشروع (استراتيجية جذب العملاء)"
                      : "Project Showcase Placements (Client Attraction)"}
                  </h4>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {isArabic
                    ? "اختر أين تريد أن يظهر هذا المشروع لجذب انتباه العملاء واكتساب ثقتهم فور دخولهم الموقع:"
                    : "Choose where this project appears to capture client attention:"}
                </p>

                <div className="grid sm:grid-cols-2 gap-3 pt-2">
                  {/* Placement 1: Main Works Grid */}
                  <label
                    onClick={() => handleTogglePlacement("main")}
                    className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition ${
                      projectForm.placements.includes("main")
                        ? "border-primary bg-primary/10 shadow-sm"
                        : "border-border/80 bg-white/40 opacity-70"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 ${
                        projectForm.placements.includes("main")
                          ? "bg-primary border-primary text-white"
                          : "border-muted-foreground/40 bg-white"
                      }`}
                    >
                      {projectForm.placements.includes("main") && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <strong className="block text-xs font-bold text-foreground">
                        {isArabic ? "المعرض الرئيسي (Main Works Grid)" : "Main Works Grid"}
                      </strong>
                      <span className="block text-[11px] text-muted-foreground mt-0.5">
                        {isArabic
                          ? "يظهر في شبكة الأعمال الأساسية بصفحة الموقع الرئيسية"
                          : "Shows in the primary 3-column project grid"}
                      </span>
                    </div>
                  </label>

                  {/* Placement 2: Hero Spotlight */}
                  <label
                    onClick={() => handleTogglePlacement("featured")}
                    className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition ${
                      projectForm.placements.includes("featured")
                        ? "border-amber-500 bg-amber-500/10 shadow-sm"
                        : "border-border/80 bg-white/40 opacity-70"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 ${
                        projectForm.placements.includes("featured")
                          ? "bg-amber-500 border-amber-500 text-white"
                          : "border-muted-foreground/40 bg-white"
                      }`}
                    >
                      {projectForm.placements.includes("featured") && (
                        <Check className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <div>
                      <strong className="block text-xs font-bold text-foreground">
                        {isArabic ? "بطل الواجهة (Hero Spotlight)" : "Hero Spotlight Showcase"}
                      </strong>
                      <span className="block text-[11px] text-muted-foreground mt-0.5">
                        {isArabic
                          ? "يظهر كدراسة حالة مميزة وبارزة فوراً في الهيرو ليلفت انتباه العميل"
                          : "Featured prominently right in the hero section to hook clients"}
                      </span>
                    </div>
                  </label>

                  {/* Placement 3: In-Depth Case Study */}
                  <label
                    onClick={() => handleTogglePlacement("case_study")}
                    className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition ${
                      projectForm.placements.includes("case_study")
                        ? "border-purple-500 bg-purple-500/10 shadow-sm"
                        : "border-border/80 bg-white/40 opacity-70"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 ${
                        projectForm.placements.includes("case_study")
                          ? "bg-purple-500 border-purple-500 text-white"
                          : "border-muted-foreground/40 bg-white"
                      }`}
                    >
                      {projectForm.placements.includes("case_study") && (
                        <Check className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <div>
                      <strong className="block text-xs font-bold text-foreground">
                        {isArabic
                          ? "دراسة حالة معمقة (In-Depth Case Study)"
                          : "In-Depth Case Study"}
                      </strong>
                      <span className="block text-[11px] text-muted-foreground mt-0.5">
                        {isArabic
                          ? "يظهر في قسم قصص النجاح بالأرقام والنتائج لإثبات القيمة"
                          : "Detailed ROI and impact section proving business value"}
                      </span>
                    </div>
                  </label>

                  {/* Placement 4: Live Strip */}
                  <label
                    onClick={() => handleTogglePlacement("latest_strip")}
                    className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition ${
                      projectForm.placements.includes("latest_strip")
                        ? "border-cyan-500 bg-cyan-500/10 shadow-sm"
                        : "border-border/80 bg-white/40 opacity-70"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 ${
                        projectForm.placements.includes("latest_strip")
                          ? "bg-cyan-500 border-cyan-500 text-white"
                          : "border-muted-foreground/40 bg-white"
                      }`}
                    >
                      {projectForm.placements.includes("latest_strip") && (
                        <Check className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <div>
                      <strong className="block text-xs font-bold text-foreground">
                        {isArabic ? "شريط المشاريع السريعة (Live Strip)" : "Live Showcase Strip"}
                      </strong>
                      <span className="block text-[11px] text-muted-foreground mt-0.5">
                        {isArabic
                          ? "يظهر في الشريط التفاعلي المتحرك الذي يعطي انطباعاً بالحيوية والنشاط"
                          : "Animated ticker giving dynamic energy to the page"}
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={resetProjectForm}
                  className="button button-glass text-xs"
                >
                  {isArabic ? "إعادة ضبط" : "Reset"}
                </button>
                <button
                  type="submit"
                  disabled={isSavingProject}
                  className="button button-primary text-sm px-7"
                >
                  {isSavingProject ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/60 border-t-white rounded-full animate-spin" />
                      {isArabic ? "جارِ النشر..." : "Publishing..."}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      {editingProjectId
                        ? isArabic
                          ? "حفظ التعديلات"
                          : "Save Changes"
                        : isArabic
                          ? "نشر المشروع في المعرض"
                          : "Publish Project"}
                    </span>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: PLACEMENTS & STRATEGY */}
          {activeTab === "placements" && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-5 rounded-2xl border border-border/80 bg-white/40">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <span>
                    {isArabic
                      ? "دليل استراتيجي: كيف تجذب المشاريع كبار العملاء للتعاقد معك؟"
                      : "Client Attraction Strategy Guide"}
                  </span>
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {isArabic
                    ? "لقد قمنا بتوفير 4 أماكن ظهور ذكية يمكنك تفعيلها لأي مشروع من خلال لوحة التحكم لتحقيق أعلى نسبة إقناع لأي عميل أو شركة ناشئة تزور موقعك:"
                    : "We provided 4 smart placement options to maximize client conversion and credibility:"}
                </p>

                <div className="grid sm:grid-cols-2 gap-4 mt-5">
                  <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-2">
                    <div className="flex items-center gap-2 text-primary font-bold text-sm">
                      <Star className="w-4 h-4" />
                      <span>1. مشروع بطل الواجهة (Hero Spotlight)</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      العميل يقرر في أول 5 ثوانٍ! وضع أقوى أعمالك بجوار صورتك الشخصية في الهيرو مع
                      وسام الأرقام والنتائج يجعل العميل يشعر فوراً بأنه أمام مصمم محترف ويزيد فضوله
                      لاستكشاف بقية الأعمال.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-purple-500/20 bg-purple-500/5 space-y-2">
                    <div className="flex items-center gap-2 text-purple-700 font-bold text-sm">
                      <TrendingUp className="w-4 h-4" />
                      <span>2. دراسات الحالة ونتائج بالأرقام (Case Studies & ROI)</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      الشركات لا تشتري "أشكالاً جميلة" فقط، بل تشتري "حلولاً لأعمالها". ذكر أرقام
                      حقيقية (مثل زيادة المبيعات 180%، تقليل نسبة ترك السلة 45%) يثبت للعميل أن
                      استثماره معك سيعود عليه بأرباح مؤكدة.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-accent/20 bg-accent/5 space-y-2">
                    <div className="flex items-center gap-2 text-accent-foreground font-bold text-sm">
                      <Layers className="w-4 h-4" />
                      <span>3. المعرض الرئيسي وفلاتر التصنيف (Filterable Works)</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      يسمح للعميل بتصفية المشاريع حسب اهتمامه (منتجات مالية، تجارة إلكترونية،
                      تطبيقات صحية، SaaS)، مما يسهل عليه أن يرى نماذج مشابهة تماماً لفكرته ومشروعه
                      المستقبلي.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-cyan-500/20 bg-cyan-500/5 space-y-2">
                    <div className="flex items-center gap-2 text-cyan-700 font-bold text-sm">
                      <RefreshCw className="w-4 h-4" />
                      <span>4. الشريط السريع المتحرك (Live Work Marquee)</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      يعطي الموقع حيوية فائقة وحركة مستمرة تشعر العميل بأنك مصمم نشط ولديك مشاريع
                      مستمرة تحت التنفيذ وتواكب أحدث معايير التصميم العالمية.
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Placements Summary Table */}
              <div className="p-5 rounded-2xl border border-border/80 bg-card/60">
                <h4 className="text-sm font-bold text-foreground mb-3">
                  {isArabic ? "ملخص توزيع مشاريعك الحالية:" : "Current Projects Distribution:"}
                </h4>
                <div className="space-y-2">
                  {projects.map((p) => (
                    <div
                      key={p.id}
                      className="p-3 rounded-lg border border-border/60 bg-card/70 flex flex-wrap items-center justify-between gap-2"
                    >
                      <span className="text-xs font-bold text-foreground">{p.title}</span>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {p.placements?.map((plc) => (
                          <span
                            key={plc}
                            className="px-2 py-0.5 rounded text-[10px] font-semibold bg-primary/10 text-primary"
                          >
                            {plc === "main"
                              ? "المعرض الرئيسي"
                              : plc === "featured"
                                ? "بطل الواجهة"
                                : plc === "case_study"
                                  ? "دراسة حالة"
                                  : "الشريط السريع"}
                          </span>
                        ))}
                        <button
                          type="button"
                          onClick={() => handleStartEditProject(p)}
                          className="text-[11px] text-primary hover:underline ms-2 font-bold cursor-pointer"
                        >
                          {isArabic ? "تعديل الأماكن" : "Change"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: DATABASE & SYNC HEALTH */}
          {activeTab === "database" && (
            <div className="space-y-6 animate-fade-in">
              {/* Primary Active Server Sync Card */}
              <div className="p-5 sm:p-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                      <Server className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                        {isArabic
                          ? "الحفظ السحابي المركزي المشترك (Cross-Browser Persistence)"
                          : "Central Shared Cloud Persistence"}
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500 text-white">
                          <Check className="w-3 h-3" />
                          {isArabic ? "نشط ومفعل" : "Active & Synced"}
                        </span>
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {isArabic
                          ? "تم حل مشكلة عدم ظهور البيانات على المتصفحات الأخرى بنجاح!"
                          : "Cross-browser data persistence is fully operational!"}
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-semibold px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                    {projects.length} {isArabic ? "مشاريع محفوظة مركزياً" : "Projects Saved"}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed">
                  {isArabic
                    ? "أي مشروع تضيفه، أو تعديل للملف الشخصي والصورة، أو تغيير لرقم الواتساب ومعرف الفيسبوك يتم حفظه وتثبيته فوراً في قاعدة بيانات الخادم المركزية. عندما يفتح أي عميل أو زائر الموقع من أي متصفح آخر (Chrome, Safari, Firefox) أو من الهاتف، تظهر له البيانات المحدثة مباشرة دون أي فقدان."
                    : "Any project you add, profile updates, and contact identifiers are immediately saved to the central server database. Visitors on any browser or mobile device will see your changes instantly."}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3 rounded-xl border border-emerald-500/20 bg-background/60">
                    <span className="text-[11px] text-muted-foreground block">
                      {isArabic ? "حالة المزامنة بين المتصفحات" : "Cross-browser Sync"}
                    </span>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1">
                      <Check className="w-3.5 h-3.5" />
                      {isArabic ? "متزامن ومضمون 100%" : "100% Guaranteed"}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl border border-emerald-500/20 bg-background/60">
                    <span className="text-[11px] text-muted-foreground block">
                      {isArabic ? "رقم الواتساب النشط" : "Active WhatsApp"}
                    </span>
                    <span
                      className="text-xs font-bold text-foreground flex items-center gap-1 mt-1"
                      dir="ltr"
                    >
                      {profileForm.whatsappNumber || "01120194940"}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl border border-emerald-500/20 bg-background/60">
                    <span className="text-[11px] text-muted-foreground block">
                      {isArabic ? "معرف فيسبوك ماسنجر" : "Active Messenger ID"}
                    </span>
                    <span
                      className="text-xs font-bold text-foreground flex items-center gap-1 mt-1"
                      dir="ltr"
                    >
                      {profileForm.facebookMessengerId || "379964405195884"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Firebase Firestore Diagnostics Card */}
              <div className="p-5 sm:p-6 rounded-2xl border border-border/80 bg-card/60 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                      <Cloud className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                        {isArabic
                          ? "حالة الاتصال بـ Firebase Firestore (مشروع gams-dca3f)"
                          : "Firebase Firestore Connection (gams-dca3f)"}
                        {firebaseHealth?.status === "connected" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500 text-white">
                            <Check className="w-3 h-3" />
                            {isArabic ? "متصل كلياً" : "Fully Connected"}
                          </span>
                        )}
                        {firebaseHealth?.status === "permission_denied" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500 text-white">
                            <AlertTriangle className="w-3 h-3" />
                            {isArabic ? "قواعد الحماية مقيدة" : "Rules Locked"}
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Project ID: <code className="text-primary font-mono">gams-dca3f</code>
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handlePushAll}
                      disabled={isPushingAll}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-2 hover:bg-emerald-700 transition cursor-pointer disabled:opacity-50"
                    >
                      <Cloud className={`w-3.5 h-3.5 ${isPushingAll ? "animate-bounce" : ""}`} />
                      <span>
                        {isPushingAll
                          ? isArabic
                            ? "جاري المزامنة مع Firebase..."
                            : "Syncing to Firebase..."
                          : isArabic
                            ? "مزامنة ورفع جميع البيانات لـ Firebase الآن"
                            : "Sync All to Firebase Now"}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={handleCheckFirebase}
                      disabled={isCheckingFirebase}
                      className="px-3.5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold flex items-center gap-2 hover:bg-primary/90 transition cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw
                        className={`w-3.5 h-3.5 ${isCheckingFirebase ? "animate-spin" : ""}`}
                      />
                      <span>
                        {isCheckingFirebase
                          ? isArabic
                            ? "جاري الفحص..."
                            : "Checking..."
                          : isArabic
                            ? "فحص تصاريح Firebase"
                            : "Check Firebase"}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Health result message */}
                {firebaseHealth && (
                  <div
                    className={`p-4 rounded-xl border text-xs sm:text-sm leading-relaxed ${
                      firebaseHealth.status === "connected"
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                        : "bg-amber-500/10 border-amber-500/30 text-foreground"
                    }`}
                  >
                    <div className="font-bold flex items-center gap-2 mb-1">
                      {firebaseHealth.status === "connected" ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                      )}
                      <span>{firebaseHealth.message}</span>
                    </div>

                    {firebaseHealth.status === "permission_denied" && (
                      <div className="mt-3 space-y-3 pt-3 border-t border-amber-500/20 text-xs">
                        <p className="text-muted-foreground">
                          {isArabic
                            ? "ملاحظة: موقعك يعمل بنجاح ويحفظ كل البيانات لجميع المتصفحات بدون أي مشكلة عبر الخادم المركزي. إذا أردت أيضاً إرسال نسخة احتياطية إضافية إلى Firebase Console مباشرة، يمكنك تعديل قواعد الحماية (Rules) في Firebase كالتالي:"
                            : "Note: Your site works and persists for all visitors via the central server store. If you also want direct writes to sync inside Firebase Console, update your Firestore Security Rules:"}
                        </p>

                        <div className="relative">
                          <pre
                            className="p-3 rounded-lg bg-black/90 text-emerald-400 font-mono text-[11px] overflow-x-auto text-left"
                            dir="ltr"
                          >
                            {`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}`}
                          </pre>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(
                                `rules_version = '2';\nservice cloud.firestore {\n  match /databases/{database}/documents {\n    match /{document=**} {\n      allow read, write: if true;\n    }\n  }\n}`,
                              );
                              setCopiedRules(true);
                              setTimeout(() => setCopiedRules(false), 3000);
                            }}
                            className="absolute top-2 end-2 px-2.5 py-1 rounded bg-white/20 hover:bg-white/30 text-white text-[10px] font-semibold flex items-center gap-1 transition cursor-pointer"
                          >
                            <Copy className="w-3 h-3" />
                            <span>{copiedRules ? "تم النسخ!" : "نسخ القواعد"}</span>
                          </button>
                        </div>

                        <a
                          href="https://console.firebase.google.com/project/gams-dca3f/firestore/rules"
                          target="_blank"
                          rel="noreferrer noopener"
                          className="inline-flex items-center gap-1.5 text-primary hover:underline font-bold text-xs"
                        >
                          <span>
                            {isArabic
                              ? "فتح صفحة قواعد Firestore في Firebase Console"
                              : "Open Firebase Console Rules"}
                          </span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {/* Dark / Light Mode info card */}
                <div className="p-4 rounded-xl border border-border/70 bg-card/40 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
                      🌓
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-foreground">
                        {isArabic
                          ? "الوضع الليلي والنهاري (Dark / Light Mode)"
                          : "Dark & Light Mode"}
                      </h4>
                      <p className="text-[11px] text-muted-foreground">
                        {isArabic
                          ? "متاح في شريط التنقل العلوي للموقع بزر الشمس والقمر مع حفظ تلقائي لتفضيل الزائر."
                          : "Available in top navigation bar with auto-saved preference."}
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-primary/10 text-primary">
                    {isArabic ? "مفعل وجاهز" : "Enabled"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
