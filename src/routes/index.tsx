import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { Project, ProfileData } from "../types.ts";
import {
  subscribeToProjects,
  subscribeToProfile,
  getLocalProjects,
  getLocalProfile,
  isFirebaseAvailable,
} from "../firebase.ts";
import { AdminLoginModal } from "../components/AdminLoginModal.tsx";
import { AdminDashboard } from "../components/AdminDashboard.tsx";
import { ProjectDetailModal } from "../components/ProjectDetailModal.tsx";
import {
  FloatingContactWidget,
  WhatsAppIcon,
  MessengerIcon,
} from "../components/FloatingContactWidget.tsx";
import { formatWhatsAppUrl, formatMessengerUrl } from "../lib/contact-links.ts";
import { getInitialTheme, applyTheme, Theme } from "../lib/theme.ts";
import {
  Sliders,
  Shield,
  Lock,
  ArrowUpRight,
  Sparkles,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  CheckCircle2,
  Layers,
  Star,
  Sun,
  Moon,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "محمد صلاح | مصمم تجارب رقمية وبورتفوليو احترافي" },
      {
        name: "description",
        content:
          "بورتفوليو محمد صلاح — تصميم واجهات، تجارب رقمية، وهوية بصرية مع دراسات حالة بالأرقام.",
      },
      { property: "og:title", content: "محمد صلاح | مصمم تجارب رقمية" },
      {
        property: "og:description",
        content: "أعمال مختارة في تصميم المنتجات الرقمية والهوية البصرية.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PortfolioPage,
});

type Language = "ar" | "en";

const staticContent = {
  ar: {
    navLabel: "التنقل الرئيسي",
    worksNav: "أعمالي",
    servicesNav: "خدماتي",
    caseStudiesNav: "دراسات الحالة",
    experienceNav: "خبرتي",
    contactNav: "تواصل",
    start: "لنبدأ مشروعًا",
    adminBtn: "لوحة التحكم",
    adminTooltip: "دخول لوحة التحكم لإدارة المشاريع وصورة البروفايل",
    adminLoggedIn: "لوحة التحكم (نشطة)",
    themeLight: "الوضع النهاري",
    themeDark: "الوضع الليلي",
    themeToggle: "تبديل المظهر (ليلي / نهاري)",
    viewWork: "استعرض أعمالي",
    contactMe: "تواصل معي",
    workKicker: "مختارات حديثة",
    workTitle: "أعمال صنعت فرقًا",
    allFilter: "الكل",
    spotlightBadge: "دراسة حالة بطل الواجهة",
    spotlightCta: "استكشف دراسة الحالة",
    caseStudiesKicker: "أثر حقيقي ملموس بالأرقام",
    caseStudiesTitle: "كيف نحول التحديات إلى نمو استثنائي؟",
    caseStudiesSubtitle:
      "أعمال مدروسة بعناية أحدثت طفرة في تفاعل المستخدمين وعوائد الأعمال لعملائنا.",
    impactLabel: "الأثر الملموس:",
    solutionLabel: "الحل المصمم:",
    viewDetails: "عرض التفاصيل الكاملة",
    servicesKicker: "ما الذي أقدمه",
    servicesTitle: "خدمات مصممة حول هدفك",
    services: [
      [
        "01",
        "تصميم واجهات مستخدم متقنة",
        "واجهات واضحة، سهلة الاستخدام وعصرية ترفع معدلات التفاعل",
      ],
      ["02", "هندسة تجربة المستخدم (UX)", "رحلات مستخدم مدروسة تقلل الاحتكاك وتسهل اتخاذ القرار"],
      [
        "03",
        "أنظمة التصميم المتكاملة (Design Systems)",
        "مكونات متسقة وقابلة للتوسع الفوري مع نمو فريق العمل",
      ],
      [
        "04",
        "الهوية البصرية والتطبيقات الرقمية",
        "شخصية فريدة ومقنعة للعلامة التجارية عبر كل شاشة ونقطة تواصل",
      ],
    ],
    processKicker: "منهج العمل",
    processTitle: "من الفكرة إلى أثر ملموس",
    process: [
      ["01", "اكتشاف وفهم", "نحدد المشكلة بعمق، وندرس الجمهور المستهدف وأهداف العمل الربحية."],
      ["02", "تصميم واختبار", "نحوّل الرؤية إلى نماذج تفاعلية قابلة للتجربة السريعة والتحسين."],
      ["03", "تسليم وإطلاق", "نجهّز كل التفاصيل البرمجية والملفات لتنفيذ سلس خالٍ من الأخطاء."],
    ],
    idea: "لديك فكرة طموحة؟",
    contactTitle: "لنصنع تجربة تستحق أن تُتذكّر وتجذب عملاءك",
    contactText:
      "يسعدني سماع فكرتك ومعرفة كيف يمكنني مساعدتك في تحويلها إلى منتج رقمي استثنائي ومؤثر.",
    chatWhatsApp: "محادثة فورية عبر واتساب",
    chatMessenger: "محادثة عبر فيسبوك ماسنجر",
    copyright: "© 2026 محمد صلاح. جميع الحقوق محفوظة.",
    crafted: "صُمّم بعناية، ووضوح، وهدف تجاري",
    adminFooterBtn: "منطقة الإدارة (Admin Panel)",
  },
  en: {
    navLabel: "Main navigation",
    worksNav: "Work",
    servicesNav: "Services",
    caseStudiesNav: "Case Studies",
    experienceNav: "Process",
    contactNav: "Contact",
    start: "Start a project",
    adminBtn: "Admin Panel",
    adminTooltip: "Open admin panel to manage projects and profile photo",
    adminLoggedIn: "Admin (Active)",
    themeLight: "Light Mode",
    themeDark: "Dark Mode",
    themeToggle: "Toggle Theme (Light / Dark)",
    viewWork: "Explore my work",
    contactMe: "Get in touch",
    workKicker: "Selected work",
    workTitle: "Projects that made an impact",
    allFilter: "All",
    spotlightBadge: "Hero Case Study",
    spotlightCta: "Explore Case Study",
    caseStudiesKicker: "Proven Measurable ROI",
    caseStudiesTitle: "Transforming challenges into measurable business growth",
    caseStudiesSubtitle:
      "Carefully engineered experiences that boosted conversion rates and client revenue.",
    impactLabel: "Business Impact:",
    solutionLabel: "Solution:",
    viewDetails: "View Full Case Study",
    servicesKicker: "What I do",
    servicesTitle: "Services built around your goals",
    services: [
      ["01", "Interface Design", "Polished, intuitive interfaces that drive user engagement"],
      [
        "02",
        "User Experience",
        "Thoughtful journeys designed to reduce friction and boost clarity",
      ],
      ["03", "Design Systems", "Consistent, scalable component ecosystems built for growth"],
      ["04", "Visual Identity", "A distinct presence across every touchpoint and digital screen"],
    ],
    processKicker: "My process",
    processTitle: "From idea to tangible impact",
    process: [
      [
        "01",
        "Discover & Define",
        "We align on the core problem, user psychology, and revenue goals.",
      ],
      ["02", "Design & Test", "We turn the vision into an interactive experience ready to test."],
      ["03", "Deliver & Launch", "Every pixel and component is prepared for flawless engineering."],
    ],
    idea: "Have an ambitious project?",
    contactTitle: "Let’s create an experience worth remembering",
    contactText:
      "I’d love to hear your idea and explore how I can help turn it into a clear, high-performing product.",
    chatWhatsApp: "Chat on WhatsApp",
    chatMessenger: "Chat on Messenger",
    copyright: "© 2026 Mohamed Salah. All rights reserved.",
    crafted: "Designed with care, clarity, and business purpose",
    adminFooterBtn: "Admin Studio Access",
  },
} as const;

function PortfolioPage() {
  const [language, setLanguage] = useState<Language>("ar");
  const isArabic = language === "ar";
  const copy = staticContent[language];

  // Dynamic Portfolio Data with real-time Firebase & LocalStorage sync
  const [projects, setProjects] = useState<Project[]>(getLocalProjects());
  const [profile, setProfile] = useState<ProfileData>(getLocalProfile());

  // Admin authentication state
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);

  // Selected project for case study modal
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Active category filter in Works section
  const [activeCategory, setActiveCategory] = useState<string>("all");

  // Load language preference
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLang = window.localStorage.getItem("portfolio-language");
      if (savedLang === "ar" || savedLang === "en") setLanguage(savedLang);
    }
  }, []);

  // Dark / Light Mode State
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const initialTheme = getInitialTheme();
    setTheme(initialTheme);
    applyTheme(initialTheme);
  }, []);

  const handleToggleTheme = () => {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    applyTheme(nextTheme);
  };

  // Update HTML direction and language
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = language;
      document.documentElement.dir = isArabic ? "rtl" : "ltr";
      window.localStorage.setItem("portfolio-language", language);
    }
  }, [isArabic, language]);

  // Check admin session on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const auth = sessionStorage.getItem("portfolio_admin_auth") === "true";
      if (auth) setIsAdminLoggedIn(true);
    }
  }, []);

  // Keyboard shortcut: Ctrl + Shift + A or Alt + A to open admin
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey || e.metaKey || e.altKey) &&
        (e.key === "A" || e.key === "a" || e.key === "ش")
      ) {
        e.preventDefault();
        if (isAdminLoggedIn) {
          setIsAdminDashboardOpen(true);
        } else {
          setIsAdminLoginOpen(true);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isAdminLoggedIn]);

  // Subscribe to real-time Firebase Firestore updates with local fallback
  useEffect(() => {
    const unsubProjects = subscribeToProjects((updated) => {
      setProjects(updated);
    });

    const unsubProfile = subscribeToProfile((updated) => {
      setProfile(updated);
    });

    return () => {
      unsubProjects();
      unsubProfile();
    };
  }, []);

  // Filtered categories
  const categories = useMemo(() => {
    if (!Array.isArray(projects)) return [];
    const cats = new Set<string>();
    projects.forEach((p) => {
      if (p && p.category) cats.add(p.category);
    });
    return Array.from(cats);
  }, [projects]);

  // Projects filtered for main grid
  const mainGridProjects = useMemo(() => {
    if (!Array.isArray(projects)) return [];
    return projects.filter((p) => {
      if (!p) return false;
      const matchesPlacement = Array.isArray(p.placements) ? p.placements.includes("main") : true;
      const matchesCategory = activeCategory === "all" || p.category === activeCategory;
      return matchesPlacement && matchesCategory;
    });
  }, [projects, activeCategory]);

  // Top Featured Project for Hero Spotlight
  const heroSpotlightProject = useMemo(() => {
    if (!Array.isArray(projects) || projects.length === 0) return null;
    return (
      projects.find((p) => p && Array.isArray(p.placements) && p.placements.includes("featured")) ||
      projects[0] ||
      null
    );
  }, [projects]);

  // Projects for Case Studies section
  const caseStudyProjects = useMemo(() => {
    if (!Array.isArray(projects) || projects.length === 0) return [];
    const cs = projects.filter(
      (p) => p && Array.isArray(p.placements) && p.placements.includes("case_study"),
    );
    return cs.length > 0 ? cs : projects.filter(Boolean).slice(0, 3);
  }, [projects]);

  // Projects for Marquee Strip
  const marqueeProjects = useMemo(() => {
    if (!Array.isArray(projects) || projects.length === 0) return [];
    const strip = projects.filter(
      (p) => p && Array.isArray(p.placements) && p.placements.includes("latest_strip"),
    );
    return strip.length > 0 ? strip : projects.filter(Boolean);
  }, [projects]);

  const handleLoginSuccess = () => {
    setIsAdminLoggedIn(true);
    setIsAdminLoginOpen(false);
    setIsAdminDashboardOpen(true);
  };

  const handleLogout = () => {
    setIsAdminLoggedIn(false);
    setIsAdminDashboardOpen(false);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("portfolio_admin_auth");
    }
  };

  return (
    <main
      dir={isArabic ? "rtl" : "ltr"}
      className="portfolio-shell min-h-screen overflow-hidden bg-background text-foreground"
    >
      {/* Background ambient color spheres */}
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <div className="ambient ambient-three" />

      {/* Floating Admin Active Shortcut when logged in */}
      {isAdminLoggedIn && (
        <aside
          aria-label="لوحة التحكم"
          className="fixed bottom-6 start-6 z-40 animate-bounce duration-1000"
        >
          <button
            onClick={() => setIsAdminDashboardOpen(true)}
            className="px-4 py-2.5 rounded-full bg-gradient-to-r from-primary to-accent text-white font-bold text-xs shadow-2xl flex items-center gap-2 cursor-pointer hover:scale-105 transition"
            title="فتح لوحة التحكم"
          >
            <Sliders className="w-4 h-4" />
            <span>{isArabic ? "لوحة التحكم مفتوحة" : "Admin Studio Open"}</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </button>
        </aside>
      )}

      {/* Header & Navigation */}
      <header className="relative z-20 mx-auto max-w-6xl px-4 pt-4 sm:px-6 sm:pt-6">
        <nav
          className="glass flex items-center justify-between gap-3 px-4 py-3 sm:px-5"
          aria-label={copy.navLabel}
        >
          <a href="#top" className="flex items-center gap-3 font-semibold">
            <span className="brand-mark">M</span>
            <span className="hidden sm:inline font-bold">
              {isArabic ? profile.name : profile.nameEn || profile.name}
            </span>
          </a>

          {/* Nav links */}
          <div className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <a href="#works" className="nav-link font-medium">
              {copy.worksNav}
            </a>
            <a href="#case-studies" className="nav-link font-medium">
              {copy.caseStudiesNav}
            </a>
            <a href="#services" className="nav-link font-medium">
              {copy.servicesNav}
            </a>
            <a href="#experience" className="nav-link font-medium">
              {copy.experienceNav}
            </a>
            <a href="#contact" className="nav-link font-medium">
              {copy.contactNav}
            </a>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Dark / Light Mode Switcher */}
            <button
              type="button"
              className="theme-toggle"
              onClick={handleToggleTheme}
              title={theme === "dark" ? copy.themeLight : copy.themeDark}
              aria-label={copy.themeToggle}
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-primary" />
              )}
            </button>

            {/* Language Switcher */}
            <button
              type="button"
              className="language-toggle"
              onClick={() => setLanguage(isArabic ? "en" : "ar")}
              aria-label={isArabic ? "Switch to English" : "التبديل إلى العربية"}
            >
              <span>{isArabic ? "EN" : "AR"}</span>
              <i aria-hidden="true">文</i>
            </button>

            {/* Professional Admin Button (The core requested feature!) */}
            <button
              type="button"
              onClick={() => {
                if (isAdminLoggedIn) {
                  setIsAdminDashboardOpen(true);
                } else {
                  setIsAdminLoginOpen(true);
                }
              }}
              className="admin-nav-button"
              title={copy.adminTooltip}
              aria-label={copy.adminBtn}
            >
              {isAdminLoggedIn ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <Sliders className="w-4 h-4 text-primary" />
                  <span className="hidden sm:inline text-primary font-bold">
                    {copy.adminLoggedIn}
                  </span>
                </>
              ) : (
                <>
                  <Sliders className="w-3.5 h-3.5 text-primary" />
                  <span className="hidden sm:inline">{copy.adminBtn}</span>
                </>
              )}
            </button>

            {/* Start a project CTA */}
            <a href="#contact" className="button button-dark hidden sm:inline-flex">
              {copy.start}
            </a>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section
        id="top"
        className="relative z-10 mx-auto grid max-w-6xl items-center gap-10 px-6 pb-16 pt-12 lg:grid-cols-12 lg:pt-16"
      >
        <div className="lg:col-span-7">
          <span className="availability">
            <i />{" "}
            {isArabic ? profile.availableText : profile.availableTextEn || profile.availableText}
          </span>
          <p className="mt-6 text-sm font-bold text-primary tracking-wide">
            {isArabic ? profile.role : profile.roleEn || profile.role}
          </p>
          <h1 className="mt-2 text-5xl font-bold leading-tight sm:text-7xl">
            {isArabic ? profile.name : profile.nameEn || profile.name}
          </h1>
          <p className="mt-6 max-w-2xl text-base sm:text-lg leading-8 text-muted-foreground">
            {isArabic ? profile.intro : profile.introEn || profile.intro}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a className="button button-primary" href="#works">
              {copy.viewWork}{" "}
              <span className="direction-arrow" aria-hidden="true">
                ←
              </span>
            </a>
            <a className="button button-glass" href="#contact">
              {copy.contactMe}
            </a>
          </div>

          {/* Stats Bar */}
          {Array.isArray(profile?.stats) && profile.stats.length > 0 && (
            <div className="mt-10 flex flex-wrap gap-10 border-t border-border/60 pt-7">
              {profile.stats.map((statItem, idx) => {
                if (!statItem) return null;
                const title =
                  typeof statItem === "object" && "title" in statItem
                    ? isArabic
                      ? statItem.title
                      : statItem.titleEn || statItem.title
                    : Array.isArray(statItem)
                      ? statItem[0]
                      : "";
                const detail =
                  typeof statItem === "object" && "detail" in statItem
                    ? isArabic
                      ? statItem.detail
                      : statItem.detailEn || statItem.detail
                    : Array.isArray(statItem)
                      ? statItem[1]
                      : "";
                return (
                  <div key={idx}>
                    <strong className="stat">{title}</strong>
                    <span>{detail}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Hero Portrait & Interactive Hero Spotlight */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="portrait-wrap w-full max-w-[380px]">
            <img
              src={profile.portraitUrl}
              width={1024}
              height={1280}
              alt={isArabic ? profile.name : profile.nameEn}
              className="portrait shadow-xl"
            />
            <div className="specialty">
              <span>{isArabic ? "مجالات العمل" : "Specialty"}</span>
              <strong>
                {isArabic ? profile.specialty : profile.specialtyEn || profile.specialty}
              </strong>
            </div>
          </div>

          {/* Placement 1: Hero Featured Case Study Spotlight Card (Attracts high-value clients immediately!) */}
          {heroSpotlightProject && (
            <div
              onClick={() => setSelectedProject(heroSpotlightProject)}
              className="mt-6 w-full max-w-[380px] p-4 glass hover:bg-white/80 transition duration-300 cursor-pointer shadow-lg group border-primary/30"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-bold bg-amber-500/15 text-amber-700">
                  <Star className="w-3 h-3 fill-amber-500" />
                  {copy.spotlightBadge}
                </span>
                <span className="text-[11px] font-semibold text-accent">
                  {heroSpotlightProject.category}
                </span>
              </div>

              <h3 className="mt-2 text-sm font-bold text-foreground group-hover:text-primary transition line-clamp-1">
                {heroSpotlightProject.title}
              </h3>

              {heroSpotlightProject.impactMetric && (
                <p className="mt-1 text-xs text-emerald-700 font-semibold flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 shrink-0" />
                  <span>{heroSpotlightProject.impactMetric}</span>
                </p>
              )}

              <div className="mt-3 flex items-center justify-between text-xs text-primary font-bold border-t border-border/50 pt-2">
                <span>{copy.spotlightCta}</span>
                <span className="direction-arrow group-hover:translate-x-1 transition duration-200">
                  ←
                </span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Placement 4: Live Projects Marquee Strip (Gives dynamic momentum to the portfolio) */}
      {marqueeProjects.length > 0 && (
        <section className="relative z-10 py-4 border-y border-border/50 bg-white/20 backdrop-blur-sm overflow-hidden">
          <div className="animate-marquee flex items-center gap-8 text-xs font-semibold text-muted-foreground whitespace-nowrap">
            {marqueeProjects.concat(marqueeProjects).map((item, idx) => {
              if (!item) return null;
              return (
                <button
                  key={`${item.id || idx}-${idx}`}
                  type="button"
                  onClick={() => setSelectedProject(item)}
                  className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full glass hover:bg-white/90 text-foreground transition cursor-pointer"
                >
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  <span className="font-bold">{item.title}</span>
                  <span className="text-[10px] text-accent font-semibold">({item.category})</span>
                  {item.impactMetric && (
                    <span className="text-[10px] text-emerald-700 bg-emerald-500/10 px-2 py-0.5 rounded-full font-bold">
                      {item.impactMetric}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Works Section (#works) with Category Filter */}
      <section id="works" className="relative z-10 mx-auto max-w-6xl px-6 py-16">
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="section-kicker">{copy.workKicker}</p>
            <h2 className="section-title">{copy.workTitle}</h2>
          </div>

          {/* Interactive Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveCategory("all")}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                activeCategory === "all"
                  ? "bg-primary text-white shadow-md"
                  : "glass hover:bg-white/80 text-muted-foreground"
              }`}
            >
              {copy.allFilter}
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                  activeCategory === cat
                    ? "bg-primary text-white shadow-md"
                    : "glass hover:bg-white/80 text-muted-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Project Cards Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {mainGridProjects.map((project) => (
            <article
              className="project-card glass group flex flex-col justify-between"
              key={project.id}
              onClick={() => setSelectedProject(project)}
            >
              <div>
                <div className="image-frame">
                  <img
                    src={project.imageUrl}
                    loading="lazy"
                    width={1024}
                    height={768}
                    alt={project.title}
                  />
                  {project.impactMetric && (
                    <span className="absolute bottom-2.5 start-2.5 px-2.5 py-1 rounded-md text-[10px] font-bold bg-black/75 text-emerald-300 backdrop-blur-sm">
                      {project.impactMetric}
                    </span>
                  )}
                </div>

                <div className="px-1 pb-1 pt-5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-accent">{project.category}</span>
                    {project.completionYear && (
                      <span className="text-[11px] text-muted-foreground">
                        {project.completionYear}
                      </span>
                    )}
                  </div>
                  <h3 className="mt-1 text-xl font-bold group-hover:text-primary transition">
                    {project.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground line-clamp-2">
                    {project.detail}
                  </p>
                </div>
              </div>

              <div className="px-1 pt-4 mt-2 border-t border-border/50 flex items-center justify-between text-xs text-primary font-bold">
                <span>{copy.viewDetails}</span>
                <span className="direction-arrow group-hover:translate-x-1 transition duration-200">
                  ←
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Placement 3: Deep Case Studies & Client ROI Section (#case-studies) */}
      {caseStudyProjects.length > 0 && (
        <section id="case-studies" className="relative z-10 mx-auto max-w-6xl px-6 py-16">
          <div className="mb-10 text-center max-w-3xl mx-auto">
            <p className="section-kicker">{copy.caseStudiesKicker}</p>
            <h2 className="section-title mt-2">{copy.caseStudiesTitle}</h2>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              {copy.caseStudiesSubtitle}
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {caseStudyProjects.map((project, idx) => (
              <div
                key={project.id}
                onClick={() => setSelectedProject(project)}
                className="glass p-6 sm:p-7 flex flex-col justify-between hover:scale-[1.02] transition duration-300 cursor-pointer shadow-lg border-primary/20"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black text-primary/40 font-mono">
                      0{idx + 1}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                      {project.category}
                    </span>
                  </div>

                  <h3 className="mt-4 text-xl font-bold text-foreground">{project.title}</h3>

                  <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                    {project.detail}
                  </p>

                  {/* Impact Highlight Box */}
                  {project.impactMetric && (
                    <div className="mt-5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 space-y-1">
                      <strong className="block text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                        {copy.impactLabel}
                      </strong>
                      <p className="text-xs font-bold text-emerald-950">{project.impactMetric}</p>
                    </div>
                  )}

                  {/* Problem / Challenge Solved */}
                  {project.challengeSolved && (
                    <div className="mt-4 p-3.5 rounded-xl bg-white/50 border border-border/70 space-y-1">
                      <strong className="block text-[11px] font-bold text-foreground/80">
                        {copy.solutionLabel}
                      </strong>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {project.challengeSolved}
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-between text-xs font-bold text-primary">
                  <span>{copy.viewDetails}</span>
                  <span className="direction-arrow">←</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Services Section (#services) & Process Section (#experience) */}
      <section
        id="services"
        className="relative z-10 mx-auto grid max-w-6xl gap-6 px-6 py-16 lg:grid-cols-12"
      >
        <div className="glass p-6 sm:p-8 lg:col-span-7">
          <p className="section-kicker">{copy.servicesKicker}</p>
          <h2 className="section-title">{copy.servicesTitle}</h2>
          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            {copy.services.map(([n, t, d]) => (
              <div className="service" key={n}>
                <span>{n}</span>
                <h3>{t}</h3>
                <p>{d}</p>
              </div>
            ))}
          </div>
        </div>

        <div id="experience" className="glass p-6 sm:p-8 lg:col-span-5">
          <p className="section-kicker">{copy.processKicker}</p>
          <h2 className="section-title">{copy.processTitle}</h2>
          <ol className="timeline mt-8">
            {copy.process.map(([n, t, d]) => (
              <li key={n}>
                <span>{n}</span>
                <h3>{t}</h3>
                <p>{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Contact Section (#contact) & Footer */}
      <section id="contact" className="relative z-10 mx-auto max-w-6xl px-6 py-16">
        <div className="contact glass px-6 py-12 text-center sm:px-10">
          <p className="section-kicker">{copy.idea}</p>
          <h2 className="mx-auto mt-2 max-w-2xl text-3xl font-bold sm:text-5xl">
            {copy.contactTitle}
          </h2>
          <p className="mx-auto mt-4 max-w-lg leading-7 text-muted-foreground">
            {copy.contactText}
          </p>

          {/* Direct Messaging Channels & Email Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
            {/* WhatsApp Direct Action Button */}
            {profile.whatsappNumber && (
              <a
                href={formatWhatsAppUrl(profile.whatsappNumber, profile.whatsappMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                <WhatsAppIcon className="w-5 h-5" />
                <span>{copy.chatWhatsApp}</span>
                <span className="text-xs bg-emerald-700/60 px-2 py-0.5 rounded-full font-mono dir-ltr">
                  {profile.whatsappNumber}
                </span>
              </a>
            )}

            {/* Facebook Messenger Action Button */}
            {profile.facebookMessengerId && (
              <a
                href={formatMessengerUrl(profile.facebookMessengerId)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-gradient-to-r from-[#0084FF] to-[#00C6FF] hover:from-[#0070dc] hover:to-[#00b0e6] text-white font-bold text-sm shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                <MessengerIcon className="w-5 h-5" />
                <span>{copy.chatMessenger}</span>
              </a>
            )}

            {/* Email Action */}
            <a
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-border/80 bg-white/80 hover:bg-white text-foreground font-bold text-sm shadow-sm hover:shadow hover:-translate-y-0.5 transition-all cursor-pointer"
              href={`mailto:${profile.email}`}
            >
              <span>{profile.email}</span>
            </a>
          </div>
        </div>

        {/* Footer */}
        <footer className="flex flex-col items-center justify-between gap-4 py-8 text-xs text-muted-foreground sm:flex-row">
          <span>{copy.copyright}</span>

          <div className="flex items-center gap-4">
            <span>{copy.crafted}</span>
            {/* Discreet Admin Login Button in Footer */}
            <button
              type="button"
              onClick={() => {
                if (isAdminLoggedIn) {
                  setIsAdminDashboardOpen(true);
                } else {
                  setIsAdminLoginOpen(true);
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-semibold text-muted-foreground hover:text-foreground hover:bg-black/5 transition cursor-pointer"
            >
              <Lock className="w-3 h-3" />
              <span>{copy.adminFooterBtn}</span>
            </button>
          </div>
        </footer>
      </section>

      {/* Admin Login Modal (Never exposes credentials on screen!) */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onSuccess={handleLoginSuccess}
        isArabic={isArabic}
      />

      {/* Comprehensive Admin Dashboard Studio */}
      <AdminDashboard
        isOpen={isAdminDashboardOpen}
        onClose={() => setIsAdminDashboardOpen(false)}
        onLogout={handleLogout}
        projects={projects}
        profile={profile}
        onUpdateProjects={(updated) => setProjects(updated)}
        onUpdateProfile={(updated) => setProfile(updated)}
        isArabic={isArabic}
      />

      {/* Interactive Project Case Study Detail Modal */}
      <ProjectDetailModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
        isArabic={isArabic}
      />

      {/* Sticky Floating Instant Contact Widget (WhatsApp & Facebook Messenger) */}
      {(profile.showFloatingContact ?? true) && (
        <FloatingContactWidget
          whatsappNumber={profile.whatsappNumber}
          whatsappMessage={profile.whatsappMessage}
          facebookMessengerId={profile.facebookMessengerId}
          isArabic={isArabic}
          designerName={isArabic ? profile.name : profile.nameEn || profile.name}
        />
      )}
    </main>
  );
}
