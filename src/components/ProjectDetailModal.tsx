import { useState } from "react";
import { Project } from "../types.ts";
import {
  X,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  ArrowUpRight,
} from "lucide-react";

interface ProjectDetailModalProps {
  project: Project | null;
  onClose: () => void;
  isArabic: boolean;
}

export function ProjectDetailModal({ project, onClose, isArabic }: ProjectDetailModalProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (!project) return null;

  const allImages = [project.imageUrl, ...(project.galleryImages || [])];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div
        className="relative w-full max-w-4xl my-auto glass-solid border border-border/90 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="px-5 py-4 border-b border-border/70 flex items-center justify-between gap-3 bg-white/50">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-accent/20 text-accent-foreground">
              {project.category}
            </span>
            {project.clientName && (
              <span className="text-xs text-muted-foreground hidden sm:inline">
                • {project.clientName}
              </span>
            )}
            {project.completionYear && (
              <span className="text-xs text-muted-foreground hidden sm:inline">
                ({project.completionYear})
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-black/5 text-muted-foreground hover:text-foreground transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-7 overflow-y-auto flex-1 space-y-6">
          {/* Main Gallery Display */}
          <div className="space-y-3">
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-border/80 bg-black/5 shadow-md">
              <img
                src={allImages[activeImageIndex] || project.imageUrl}
                alt={project.title}
                className="w-full h-full object-cover transition-all duration-300"
              />
              {allImages.length > 1 && (
                <div className="absolute inset-x-3 bottom-3 flex items-center justify-between pointer-events-none">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1));
                    }}
                    className="pointer-events-auto p-2 rounded-full bg-white/80 backdrop-blur shadow hover:bg-white text-foreground transition cursor-pointer"
                  >
                    <ChevronRight className={`w-4 h-4 ${isArabic ? "" : "rotate-180"}`} />
                  </button>
                  <span className="px-3 py-1 rounded-full bg-black/60 text-white text-[11px] font-bold backdrop-blur">
                    {activeImageIndex + 1} / {allImages.length}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImageIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0));
                    }}
                    className="pointer-events-auto p-2 rounded-full bg-white/80 backdrop-blur shadow hover:bg-white text-foreground transition cursor-pointer"
                  >
                    <ChevronLeft className={`w-4 h-4 ${isArabic ? "" : "rotate-180"}`} />
                  </button>
                </div>
              )}
            </div>

            {/* Gallery Thumbnails */}
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-20 h-14 rounded-lg overflow-hidden border-2 shrink-0 transition ${
                      activeImageIndex === idx
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-border/60 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Project Details */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">{project.title}</h2>
            <p className="mt-2 text-base text-muted-foreground leading-relaxed">{project.detail}</p>
          </div>

          {/* Impact Metric Banner */}
          {project.impactMetric && (
            <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-xs font-bold text-emerald-800 uppercase tracking-wide">
                  {isArabic
                    ? "الأثر الرقمي الملموس على العميل (ROI & Impact)"
                    : "Measurable Business Impact"}
                </strong>
                <p className="text-sm font-semibold text-emerald-950 mt-0.5">
                  {project.impactMetric}
                </p>
              </div>
            </div>
          )}

          {/* Case Study Details */}
          {project.fullDescription && (
            <div className="p-5 rounded-xl border border-border/80 bg-white/40 space-y-2">
              <h4 className="text-sm font-bold text-foreground">
                {isArabic ? "منهجية العمل ودراسة الحالة" : "Case Study Breakdown"}
              </h4>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {project.fullDescription}
              </p>
            </div>
          )}

          {/* Challenge Solved */}
          {project.challengeSolved && (
            <div className="p-5 rounded-xl border border-border/80 bg-white/40 space-y-2">
              <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span>{isArabic ? "المشكلة والتحدي الذي تم حله" : "Challenge Solved"}</span>
              </h4>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {project.challengeSolved}
              </p>
            </div>
          )}

          {/* Technologies & Tools */}
          {project.technologies && project.technologies.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                {isArabic ? "الأدوات والأنظمة المستخدمة" : "Tools & Design System"}
              </h4>
              <div className="flex flex-wrap gap-2">
                {project.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="px-3 py-1 rounded-lg text-xs font-semibold bg-white/80 border border-border/80 text-foreground"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-4 border-t border-border/60 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-3">
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="button button-primary text-xs sm:text-sm"
                >
                  <span>{isArabic ? "معاينة المشروع الحي" : "Live Preview"}</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>

            <a href="#contact" onClick={onClose} className="button button-dark text-xs sm:text-sm">
              <span>{isArabic ? "اطلب مشروعاً مماثلاً" : "Request Similar Project"}</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
