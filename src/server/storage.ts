import * as fs from "node:fs";
import * as path from "node:path";
import { Project, ProfileData } from "../types.ts";

export interface PortfolioStore {
  projects: Project[];
  profile: ProfileData;
  updatedAt: number;
}

const DATA_DIR = path.resolve(process.cwd(), "data");
const STORE_PATH = path.join(DATA_DIR, "portfolio-store.json");

function ensureStoreExists(): PortfolioStore {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(STORE_PATH)) {
      const raw = fs.readFileSync(STORE_PATH, "utf-8");
      const parsed = JSON.parse(raw) as Partial<PortfolioStore>;
      if (Array.isArray(parsed.projects) && parsed.projects.length > 0 && parsed.profile) {
        return {
          projects: parsed.projects as Project[],
          profile: parsed.profile as ProfileData,
          updatedAt: typeof parsed.updatedAt === "number" ? parsed.updatedAt : Date.now(),
        };
      }
    }
  } catch (err) {
    console.error("Error reading portfolio store:", err);
  }

  return {
    projects: [],
    profile: {} as ProfileData,
    updatedAt: Date.now(),
  };
}

export function getPortfolioStore(): PortfolioStore {
  return ensureStoreExists();
}

export function savePortfolioStore(data: {
  projects?: Project[];
  profile?: ProfileData;
}): PortfolioStore {
  const current = ensureStoreExists();
  const updated: PortfolioStore = {
    projects: data.projects ?? current.projects,
    profile: data.profile ?? current.profile,
    updatedAt: Date.now(),
  };

  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STORE_PATH, JSON.stringify(updated, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing portfolio store:", err);
  }

  return updated;
}
