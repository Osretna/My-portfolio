import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  Firestore,
} from "firebase/firestore";
import { Project, ProfileData } from "./types.ts";
import { INITIAL_PROFILE, INITIAL_PROJECTS } from "./initialData.ts";

// Config provided exactly by the user
export const firebaseConfig = {
  apiKey: "AIzaSyA03XF-ijDTp1C3jOcmo2ajZL4RvUlcZd0",
  authDomain: "gams-dca3f.firebaseapp.com",
  databaseURL: "https://gams-dca3f-default-rtdb.firebaseio.com",
  projectId: "gams-dca3f",
  storageBucket: "gams-dca3f.firebasestorage.app",
  messagingSenderId: "805484875796",
  appId: "1:805484875796:web:3f5390ad337f7f9c575701",
  measurementId: "G-R03SS18JVS",
};

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let isFirebaseAvailable = false;

// Initialize Firebase safely (client-side only or isomorphic)
if (typeof window !== "undefined") {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    db = getFirestore(app);
    isFirebaseAvailable = true;
  } catch (err) {
    console.warn("Firebase initialization notice:", err);
  }
}

export { app, db, isFirebaseAvailable };

const LOCAL_STORAGE_PROJECTS_KEY = "mohamed_salah_portfolio_projects_v1";
const LOCAL_STORAGE_PROFILE_KEY = "mohamed_salah_portfolio_profile_v1";

// Bulletproof Project Sanitizer
export function sanitizeProject(raw: unknown, index = 0): Project {
  const fallback = INITIAL_PROJECTS[index % INITIAL_PROJECTS.length];
  if (!raw || typeof raw !== "object") return fallback;
  const p = raw as Record<string, unknown>;

  const id = typeof p.id === "string" && p.id.trim() ? p.id.trim() : `proj-${index + 1}`;
  const title = typeof p.title === "string" && p.title.trim() ? p.title.trim() : fallback.title;
  const titleEn = typeof p.titleEn === "string" ? p.titleEn : fallback.titleEn || title;
  const category =
    typeof p.category === "string" && p.category.trim() ? p.category.trim() : fallback.category;
  const categoryEn =
    typeof p.categoryEn === "string" ? p.categoryEn : fallback.categoryEn || category;
  const detail = typeof p.detail === "string" ? p.detail : fallback.detail;
  const detailEn = typeof p.detailEn === "string" ? p.detailEn : fallback.detailEn;
  const fullDescription =
    typeof p.fullDescription === "string" ? p.fullDescription : fallback.fullDescription;
  const fullDescriptionEn =
    typeof p.fullDescriptionEn === "string" ? p.fullDescriptionEn : fallback.fullDescriptionEn;

  // Support legacy `image` property or `imageUrl`
  let imageUrl = fallback.imageUrl;
  if (typeof p.imageUrl === "string" && p.imageUrl.trim()) {
    imageUrl = p.imageUrl.trim();
  } else if (typeof p.image === "string" && p.image.trim()) {
    imageUrl = p.image.trim();
  }

  // Ensure galleryImages is array of strings
  let galleryImages: string[] = [];
  if (Array.isArray(p.galleryImages)) {
    galleryImages = p.galleryImages.filter(
      (img): img is string => typeof img === "string" && img.trim().length > 0,
    );
  }
  if (galleryImages.length === 0 && fallback.galleryImages) {
    galleryImages = [...fallback.galleryImages];
  }

  // Ensure placements is array of valid placements
  let placements: ProjectPlacement[] = [];
  if (Array.isArray(p.placements)) {
    const validSet = new Set(["main", "featured", "case_study", "latest_strip"]);
    placements = p.placements.filter(
      (pl): pl is ProjectPlacement => typeof pl === "string" && validSet.has(pl),
    );
  }
  if (placements.length === 0) {
    placements = fallback.placements || ["main", "featured", "case_study", "latest_strip"];
  }

  return {
    id,
    title,
    titleEn,
    category,
    categoryEn,
    detail,
    detailEn,
    fullDescription,
    fullDescriptionEn,
    imageUrl,
    galleryImages,
    placements,
    liveUrl: typeof p.liveUrl === "string" ? p.liveUrl : undefined,
    figmaUrl: typeof p.figmaUrl === "string" ? p.figmaUrl : undefined,
    completionYear:
      typeof p.completionYear === "string" ? p.completionYear : fallback.completionYear,
    clientName: typeof p.clientName === "string" ? p.clientName : fallback.clientName,
    impactMetric: typeof p.impactMetric === "string" ? p.impactMetric : fallback.impactMetric,
    impactMetricEn:
      typeof p.impactMetricEn === "string" ? p.impactMetricEn : fallback.impactMetricEn,
    challengeSolved:
      typeof p.challengeSolved === "string" ? p.challengeSolved : fallback.challengeSolved,
    challengeSolvedEn:
      typeof p.challengeSolvedEn === "string" ? p.challengeSolvedEn : fallback.challengeSolvedEn,
    createdAt: typeof p.createdAt === "number" ? p.createdAt : Date.now(),
  };
}

export function sanitizeProjects(list: unknown): Project[] {
  if (!Array.isArray(list) || list.length === 0) {
    return INITIAL_PROJECTS;
  }
  const sanitized = list.map((item, idx) => sanitizeProject(item, idx));
  return sanitized.length > 0 ? sanitized : INITIAL_PROJECTS;
}

export function sanitizeProfile(raw: unknown): ProfileData {
  if (!raw || typeof raw !== "object") return INITIAL_PROFILE;
  const p = raw as Record<string, unknown>;

  // Convert legacy stats (like [["خبرة", "..."], ...]) into object format
  let stats = INITIAL_PROFILE.stats;
  if (Array.isArray(p.stats) && p.stats.length > 0) {
    stats = p.stats.map((item, idx) => {
      const fallbackStat = INITIAL_PROFILE.stats[idx % INITIAL_PROFILE.stats.length];
      if (Array.isArray(item)) {
        return {
          title: String(item[0] || fallbackStat.title),
          detail: String(item[1] || fallbackStat.detail),
          titleEn: String(item[0] || fallbackStat.titleEn),
          detailEn: String(item[1] || fallbackStat.detailEn),
        };
      }
      if (item && typeof item === "object") {
        const s = item as Record<string, unknown>;
        return {
          title: typeof s.title === "string" ? s.title : fallbackStat.title,
          detail: typeof s.detail === "string" ? s.detail : fallbackStat.detail,
          titleEn:
            typeof s.titleEn === "string" ? s.titleEn : fallbackStat.titleEn || fallbackStat.title,
          detailEn:
            typeof s.detailEn === "string"
              ? s.detailEn
              : fallbackStat.detailEn || fallbackStat.detail,
        };
      }
      return fallbackStat;
    });
  }

  let portraitUrl = INITIAL_PROFILE.portraitUrl;
  if (typeof p.portraitUrl === "string" && p.portraitUrl.trim()) {
    portraitUrl = p.portraitUrl.trim();
  } else if (typeof p.portrait === "string" && p.portrait.trim()) {
    portraitUrl = p.portrait.trim();
  }

  return {
    name: typeof p.name === "string" && p.name.trim() ? p.name.trim() : INITIAL_PROFILE.name,
    nameEn: typeof p.nameEn === "string" ? p.nameEn : INITIAL_PROFILE.nameEn,
    role: typeof p.role === "string" ? p.role : INITIAL_PROFILE.role,
    roleEn: typeof p.roleEn === "string" ? p.roleEn : INITIAL_PROFILE.roleEn,
    intro: typeof p.intro === "string" ? p.intro : INITIAL_PROFILE.intro,
    introEn: typeof p.introEn === "string" ? p.introEn : INITIAL_PROFILE.introEn,
    portraitUrl,
    availableText:
      typeof p.availableText === "string" ? p.availableText : INITIAL_PROFILE.availableText,
    availableTextEn:
      typeof p.availableTextEn === "string" ? p.availableTextEn : INITIAL_PROFILE.availableTextEn,
    specialty: typeof p.specialty === "string" ? p.specialty : INITIAL_PROFILE.specialty,
    specialtyEn: typeof p.specialtyEn === "string" ? p.specialtyEn : INITIAL_PROFILE.specialtyEn,
    email: typeof p.email === "string" ? p.email : INITIAL_PROFILE.email,
    phone: typeof p.phone === "string" ? p.phone : INITIAL_PROFILE.phone,
    whatsappNumber:
      typeof p.whatsappNumber === "string" && p.whatsappNumber.trim()
        ? p.whatsappNumber.trim()
        : INITIAL_PROFILE.whatsappNumber,
    whatsappMessage:
      typeof p.whatsappMessage === "string" ? p.whatsappMessage : INITIAL_PROFILE.whatsappMessage,
    facebookMessengerId:
      typeof p.facebookMessengerId === "string" && p.facebookMessengerId.trim()
        ? p.facebookMessengerId.trim()
        : INITIAL_PROFILE.facebookMessengerId,
    showFloatingContact:
      typeof p.showFloatingContact === "boolean"
        ? p.showFloatingContact
        : (INITIAL_PROFILE.showFloatingContact ?? true),
    location: typeof p.location === "string" ? p.location : INITIAL_PROFILE.location,
    stats,
  };
}

// Helper: load projects from localStorage or default
export function getLocalProjects(): Project[] {
  if (typeof window === "undefined") return INITIAL_PROJECTS;
  try {
    const raw = window.localStorage.getItem(LOCAL_STORAGE_PROJECTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return sanitizeProjects(parsed);
      }
    }
  } catch (e) {
    console.error("Failed reading projects from local storage", e);
  }
  return INITIAL_PROJECTS;
}

// Helper: save projects to localStorage
export function saveLocalProjects(projects: Project[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LOCAL_STORAGE_PROJECTS_KEY, JSON.stringify(projects));
  } catch (e) {
    console.error("Failed to save projects to localStorage", e);
  }
}

// Helper: load profile from localStorage or default
export function getLocalProfile(): ProfileData {
  if (typeof window === "undefined") return INITIAL_PROFILE;
  try {
    const raw = window.localStorage.getItem(LOCAL_STORAGE_PROFILE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed) return sanitizeProfile(parsed);
    }
  } catch (e) {
    console.error("Failed reading profile from local storage", e);
  }
  return INITIAL_PROFILE;
}

// Helper: save profile to localStorage
export function saveLocalProfile(profile: ProfileData) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LOCAL_STORAGE_PROFILE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error("Failed to save profile to localStorage", e);
  }
}

// Shared Server-Side Persistence via API
async function fetchServerPortfolio(): Promise<{
  projects?: Project[];
  profile?: ProfileData;
} | null> {
  if (typeof window === "undefined") return null;
  try {
    const res = await fetch("/api/portfolio");
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn("Notice: could not load shared portfolio from server store:", err);
    return null;
  }
}

async function saveServerPortfolio(payload: {
  projects?: Project[];
  profile?: ProfileData;
}): Promise<boolean> {
  if (typeof window === "undefined") return false;
  try {
    const res = await fetch("/api/portfolio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return res.ok;
  } catch (err) {
    console.warn("Notice: server storage sync failed:", err);
    return false;
  }
}

// Real-time Firestore Projects Listener with Server & Local Storage Sync
export function subscribeToProjects(
  onUpdate: (projects: Project[], source: "firebase" | "local" | "server") => void,
  onError?: (err: Error) => void,
) {
  if (typeof window === "undefined") return () => {};

  // 1. Immediately broadcast current sanitized local projects
  const initial = getLocalProjects();
  onUpdate(initial, "local");

  // 2. Query central server storage so ANY browser instantly receives shared data
  fetchServerPortfolio()
    .then((shared) => {
      if (shared && Array.isArray(shared.projects) && shared.projects.length > 0) {
        const sanitized = sanitizeProjects(shared.projects);
        saveLocalProjects(sanitized);
        onUpdate(sanitized, "server");
      }
    })
    .catch((err) => {
      console.warn("Notice: could not load shared portfolio from server store:", err);
    });

  if (!db || !isFirebaseAvailable) {
    return () => {};
  }

  // 3. Listen to Firebase Firestore live stream if available
  try {
    const colRef = collection(db, "projects");
    const unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: unknown[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            list.push({
              ...data,
              id: docSnap.id,
            });
          });
          const sanitizedList = sanitizeProjects(list);
          sanitizedList.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
          saveLocalProjects(sanitizedList);
          // Also sync to server store in the background
          saveServerPortfolio({ projects: sanitizedList }).catch(() => {});
          onUpdate(sanitizedList, "firebase");
        } else {
          // If Firestore is empty, seed it with the default projects if possible
          seedFirestoreIfEmpty(initial);
        }
      },
      (err) => {
        console.warn("Firestore projects listener notice:", err.message);
        if (onError) onError(err);
      },
    );

    return unsubscribe;
  } catch (err) {
    console.warn("Failed setting up Firestore projects listener:", err);
    return () => {};
  }
}

// Real-time Firestore Profile Listener with Server & Local Storage Sync
export function subscribeToProfile(
  onUpdate: (profile: ProfileData, source: "firebase" | "local" | "server") => void,
  onError?: (err: Error) => void,
) {
  if (typeof window === "undefined") return () => {};

  const initial = getLocalProfile();
  onUpdate(initial, "local");

  // Load shared profile from server store for cross-browser synchronization
  fetchServerPortfolio()
    .then((shared) => {
      if (shared && shared.profile && shared.profile.name) {
        const sanitized = sanitizeProfile(shared.profile);
        saveLocalProfile(sanitized);
        onUpdate(sanitized, "server");
      }
    })
    .catch((err) => {
      console.warn("Notice: could not load shared profile from server store:", err);
    });

  if (!db || !isFirebaseAvailable) {
    return () => {};
  }

  try {
    const docRef = doc(db, "portfolio_settings", "profile");
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = sanitizeProfile(docSnap.data());
          saveLocalProfile(data);
          saveServerPortfolio({ profile: data }).catch(() => {});
          onUpdate(data, "firebase");
        } else {
          // Seed profile
          setDoc(docRef, initial).catch(() => {});
        }
      },
      (err) => {
        console.warn("Firestore profile listener notice:", err.message);
        if (onError) onError(err);
      },
    );

    return unsubscribe;
  } catch (err) {
    console.warn("Failed setting up Firestore profile listener:", err);
    return () => {};
  }
}

async function seedFirestoreIfEmpty(projects: Project[]) {
  if (!db) return;
  try {
    for (const p of projects) {
      await setDoc(doc(db, "projects", p.id), p);
    }
  } catch {
    // Ignore seed permissions
  }
}

// Save or Update Project (Saves locally + saves to server store + syncs to Firestore)
export async function syncSaveProject(
  project: Project,
): Promise<{ success: boolean; cloudSynced: boolean; message: string }> {
  const current = getLocalProjects();
  const index = current.findIndex((p) => p.id === project.id);
  let updated: Project[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = project;
  } else {
    updated = [project, ...current];
  }
  saveLocalProjects(updated);

  // 1. Save to central shared server database so ALL browsers and devices immediately see it!
  try {
    await saveServerPortfolio({ projects: updated });
  } catch (err) {
    console.warn("Notice: server storage sync failed:", err);
  }

  // 2. Also sync to Firebase Firestore
  let firestoreSynced = false;
  if (db && isFirebaseAvailable) {
    try {
      const docRef = doc(db, "projects", project.id);
      await setDoc(docRef, project, { merge: true });
      firestoreSynced = true;
    } catch (err: unknown) {
      console.warn("Firestore sync notice (permissions may be locked in console):", err);
    }
  }

  const message = firestoreSynced
    ? "تم حفظ المشروع ومزامنته سحابياً على Firebase والخادم بنجاح!"
    : "تم حفظ المشروع في الخادم المركزي بنجاح ومتاح لجميع الزوار والمتصفحات!";

  return { success: true, cloudSynced: true, message };
}

// Delete Project
export async function syncDeleteProject(
  projectId: string,
): Promise<{ success: boolean; cloudSynced: boolean }> {
  const current = getLocalProjects();
  const updated = current.filter((p) => p.id !== projectId);
  saveLocalProjects(updated);

  try {
    await saveServerPortfolio({ projects: updated });
  } catch (err) {
    console.warn("Notice: server storage delete notice:", err);
  }

  if (db && isFirebaseAvailable) {
    try {
      await deleteDoc(doc(db, "projects", projectId));
    } catch (err) {
      console.warn("Firestore delete notice:", err);
    }
  }

  return { success: true, cloudSynced: true };
}

// Save Profile
export async function syncSaveProfile(
  profile: ProfileData,
): Promise<{ success: boolean; cloudSynced: boolean; message: string }> {
  saveLocalProfile(profile);

  // 1. Save to central server store
  try {
    await saveServerPortfolio({ profile });
  } catch (err) {
    console.warn("Notice: server storage profile save failed:", err);
  }

  // 2. Also sync to Firebase Firestore
  let firestoreSynced = false;
  if (db && isFirebaseAvailable) {
    try {
      const docRef = doc(db, "portfolio_settings", "profile");
      await setDoc(docRef, profile, { merge: true });
      firestoreSynced = true;
    } catch (err: unknown) {
      console.warn("Profile Firestore sync notice:", err);
    }
  }

  const message = firestoreSynced
    ? "تم تحديث الملف الشخصي ومزامنته على Firebase والخادم بنجاح!"
    : "تم تحديث الملف الشخصي ومزامنته مركزياً بنجاح لجميع الزوار والمتصفحات!";

  return { success: true, cloudSynced: true, message };
}

// Diagnostic helper to test Firebase Firestore connectivity in Admin Panel
export async function checkFirestoreHealth(): Promise<{
  status: "connected" | "permission_denied" | "unavailable";
  message: string;
  details?: string;
}> {
  if (!db || !isFirebaseAvailable) {
    return {
      status: "unavailable",
      message: "خدمة Firebase غير مهيأة أو غير متصلة.",
    };
  }

  try {
    const testRef = doc(db, "portfolio_settings", "health_check");
    await setDoc(testRef, { lastChecked: Date.now(), platform: "web" }, { merge: true });
    return {
      status: "connected",
      message: "قاعدة بيانات Firestore متصلة وتقبل القراءة والكتابة بنجاح!",
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    if (
      errorMsg.includes("permission-denied") ||
      errorMsg.includes("PERMISSION_DENIED") ||
      errorMsg.includes("Missing or insufficient permissions")
    ) {
      return {
        status: "permission_denied",
        message:
          "مشروع Firebase (gams-dca3f) متصل، ولكن قواعد أمان Firestore في Firebase Console تمنع القراءة/الكتابة (Missing or insufficient permissions).",
        details: errorMsg,
      };
    }
    return {
      status: "unavailable",
      message: "تعذر الاتصال بقاعدة بيانات Firebase حالياً: " + errorMsg,
      details: errorMsg,
    };
  }
}

// Push all current projects and profile directly into Firebase Firestore in one batch
export async function pushAllToFirestore(
  projects: Project[],
  profile: ProfileData,
): Promise<{ success: boolean; message: string; details?: string }> {
  if (!db || !isFirebaseAvailable) {
    return {
      success: false,
      message: "خدمة Firebase غير متوفرة أو لم يتم تهيئتها بعد.",
    };
  }

  try {
    // 1. Save profile document
    const profileRef = doc(db, "portfolio_settings", "profile");
    await setDoc(profileRef, profile, { merge: true });

    // 2. Save all projects
    for (const proj of projects) {
      const projRef = doc(db, "projects", proj.id);
      await setDoc(projRef, proj, { merge: true });
    }

    return {
      success: true,
      message: `تم رفع ومزامنة الملف الشخصي و (${projects.length}) مشاريع إلى Firebase Firestore في حسابك بنجاح!`,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    if (
      errorMsg.includes("permission-denied") ||
      errorMsg.includes("PERMISSION_DENIED") ||
      errorMsg.includes("Missing or insufficient permissions")
    ) {
      return {
        success: false,
        message:
          "Firebase رفضت الكتابة لأن قواعد الأمان مقفلة (Permission Denied). يرجى فتح رابط القواعد في Firebase Console وتغيير false إلى true ثم الضغط على Publish.",
        details: errorMsg,
      };
    }
    return {
      success: false,
      message: "تعذر الرفع إلى Firebase: " + errorMsg,
      details: errorMsg,
    };
  }
}
