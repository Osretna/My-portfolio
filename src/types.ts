export type ProjectPlacement = "featured" | "main" | "case_study" | "latest_strip";

export interface Project {
  id: string;
  title: string;
  titleEn?: string;
  category: string;
  categoryEn?: string;
  detail: string;
  detailEn?: string;
  fullDescription?: string;
  imageUrl: string;
  galleryImages?: string[];
  clientName?: string;
  completionYear?: string;
  impactMetric?: string; // e.g. "+180% زيادة في المبيعات"
  challengeSolved?: string;
  liveUrl?: string;
  technologies?: string[];
  placements: ProjectPlacement[];
  createdAt: number;
}

export interface ProfileStat {
  title: string;
  detail: string;
  titleEn: string;
  detailEn: string;
}

export interface ProfileData {
  name: string;
  nameEn: string;
  role: string;
  roleEn: string;
  intro: string;
  introEn: string;
  portraitUrl: string;
  availableText: string;
  availableTextEn: string;
  specialty: string;
  specialtyEn: string;
  email: string;
  phone?: string;
  whatsappNumber?: string;
  whatsappMessage?: string;
  facebookMessengerId?: string;
  showFloatingContact?: boolean;
  location?: string;
  stats: ProfileStat[];
}
