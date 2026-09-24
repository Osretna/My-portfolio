import React, { useState } from "react";
import { formatWhatsAppUrl, formatMessengerUrl } from "../lib/contact-links";
import { MessageCircle, X, ChevronUp, Sparkles, Send } from "lucide-react";

interface FloatingContactWidgetProps {
  whatsappNumber?: string;
  whatsappMessage?: string;
  facebookMessengerId?: string;
  isArabic: boolean;
  designerName?: string;
}

// Authentic WhatsApp SVG Icon
export function WhatsAppIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      stroke="currentColor"
      strokeWidth="0"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.301-.15-1.78-.878-2.056-.979-.276-.1-.476-.15-.677.15-.2.3-.777.979-.953 1.18-.175.2-.351.225-.652.075-.301-.15-1.272-.469-2.423-1.496-.896-.799-1.501-1.787-1.677-2.088-.175-.301-.019-.464.132-.614.136-.135.301-.351.451-.527.151-.175.201-.301.301-.501.1-.2.05-.376-.025-.526-.075-.15-.677-1.631-.927-2.233-.244-.587-.492-.507-.677-.517-.175-.01-.376-.01-.577-.01s-.527.075-.802.376c-.276.301-1.053 1.028-1.053 2.508s1.078 2.91 1.229 3.111c.15.2 2.122 3.24 5.141 4.544.718.31 1.278.496 1.716.635.722.23 1.378.197 1.897.12.578-.087 1.78-.727 2.031-1.43.25-.702.25-1.304.175-1.43-.075-.125-.276-.2-.577-.35zM12.04 2C6.54 2 2.08 6.46 2.08 11.96c0 1.94.55 3.75 1.51 5.28L2 22l4.9-1.55c1.47.88 3.19 1.39 5.14 1.39 5.5 0 9.96-4.46 9.96-9.96S17.54 2 12.04 2zM12.04 20.12c-1.7 0-3.29-.5-4.63-1.37l-.33-.21-2.9 1.15 1.14-2.82-.23-.37a8.08 8.08 0 0 1-1.28-4.51c0-4.48 3.65-8.12 8.24-8.12 4.49 0 8.14 3.64 8.14 8.12 0 4.49-3.65 8.12-8.08 8.12z" />
    </svg>
  );
}

// Authentic Facebook Messenger SVG Icon (Chat bubble with lightning)
export function MessengerIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 2C6.36 2 2 6.13 2 11.7c0 2.91 1.19 5.43 3.13 7.15.16.14.26.35.26.56l-.08 1.76c-.03.54.51.93 1.01.73l1.96-.8c.17-.07.36-.08.54-.03.99.27 2.04.42 3.18.42 5.64 0 10-4.13 10-9.7C22 6.13 17.64 2 12 2zm1.09 13.04l-2.58-2.75a.8.8 0 0 0-1.16 0l-3.5 3.5c-.47.47-1.12-.13-.77-.7l3.9-6.33a.8.8 0 0 1 1.16 0l2.58 2.75a.8.8 0 0 0 1.16 0l3.5-3.5c.47-.47 1.12.13.77.7l-3.9 6.33a.8.8 0 0 1-1.16 0z" />
    </svg>
  );
}

export function FloatingContactWidget({
  whatsappNumber = "01120194940",
  whatsappMessage = "مرحباً أستاذ محمد، أرغب في الاستفسار عن مشروع تصميم رقمي جديد.",
  facebookMessengerId = "379964405195884",
  isArabic,
  designerName = "محمد صلاح",
}: FloatingContactWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const waUrl = formatWhatsAppUrl(whatsappNumber, whatsappMessage);
  const messengerUrl = formatMessengerUrl(facebookMessengerId);

  const texts = {
    ar: {
      quickContact: "تواصل سريع",
      chatWithMohamed: `محادثة مباشرة مع ${designerName}`,
      statusOnline: "متاح الآن للرد",
      whatsAppTitle: "واتساب (WhatsApp)",
      whatsAppSub: "رد فوري خلال دقائق",
      messengerTitle: "ماسنجر (Messenger)",
      messengerSub: "فيسبوك ماسنجر الرسمي",
      openDirect: "بدء المحادثة",
      collapse: "تصغير القائمة",
      expand: "تواصل معي مباشرة",
      tooltipText: "تواصل مباشر عبر واتساب أو ماسنجر",
      availableNowBadge: "رد سريع",
    },
    en: {
      quickContact: "Quick Contact",
      chatWithMohamed: `Direct Chat with ${designerName}`,
      statusOnline: "Available Now",
      whatsAppTitle: "WhatsApp",
      whatsAppSub: "Fast response within minutes",
      messengerTitle: "Messenger",
      messengerSub: "Official Facebook Messenger",
      openDirect: "Start Chat",
      collapse: "Minimize",
      expand: "Direct Chat with Me",
      tooltipText: "Direct contact via WhatsApp or Messenger",
      availableNowBadge: "Fast Reply",
    },
  }[isArabic ? "ar" : "en"];

  return (
    <aside
      aria-label={texts.quickContact}
      className="fixed bottom-5 end-5 z-40 sm:bottom-7 sm:end-7 flex flex-col items-end select-none pointer-events-none"
    >
      {/* Expanded Interactive Card */}
      {isExpanded && (
        <div
          role="dialog"
          aria-label={texts.chatWithMohamed}
          className="pointer-events-auto mb-3 w-[19.5rem] sm:w-[21.5rem] rounded-2xl border border-white/70 bg-white/95 p-4 shadow-2xl backdrop-blur-2xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 text-foreground"
        >
          {/* Card Header */}
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
              </span>
              <div>
                <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <span>{texts.chatWithMohamed}</span>
                  <Sparkles className="w-3 h-3 text-amber-500" />
                </h4>
                <p className="text-[10px] text-emerald-700 font-semibold">{texts.statusOnline}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-black/5 transition cursor-pointer"
              title={texts.collapse}
              aria-label={texts.collapse}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Action Channels */}
          <div className="mt-3 space-y-2.5">
            {/* WhatsApp Action Button */}
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between p-3 rounded-xl border border-emerald-500/25 bg-emerald-50/70 hover:bg-emerald-500 hover:border-emerald-600 text-foreground hover:text-white transition-all duration-200 shadow-sm cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/30 group-hover:scale-105 transition-transform">
                  <WhatsAppIcon className="w-6 h-6" />
                </div>
                <div className="text-start">
                  <div className="text-xs font-bold flex items-center gap-1.5">
                    <span>{texts.whatsAppTitle}</span>
                    <span className="text-[10px] opacity-75 font-mono dir-ltr">
                      {whatsappNumber}
                    </span>
                  </div>
                  <div className="text-[11px] text-emerald-800 group-hover:text-emerald-50 transition-colors">
                    {texts.whatsAppSub}
                  </div>
                </div>
              </div>

              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 group-hover:bg-white/20 flex items-center justify-center transition-colors">
                <Send className="w-3.5 h-3.5 rtl:rotate-180 text-emerald-600 group-hover:text-white transition-colors" />
              </div>
            </a>

            {/* Facebook Messenger Action Button */}
            <a
              href={messengerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between p-3 rounded-xl border border-sky-500/25 bg-sky-50/70 hover:bg-gradient-to-r hover:from-[#0084FF] hover:to-[#00C6FF] hover:border-sky-600 text-foreground hover:text-white transition-all duration-200 shadow-sm cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0084FF] to-[#00C6FF] text-white flex items-center justify-center shadow-md shadow-sky-500/30 group-hover:scale-105 transition-transform">
                  <MessengerIcon className="w-6 h-6" />
                </div>
                <div className="text-start">
                  <div className="text-xs font-bold">{texts.messengerTitle}</div>
                  <div className="text-[11px] text-sky-800 group-hover:text-sky-50 transition-colors">
                    {texts.messengerSub}
                  </div>
                </div>
              </div>

              <div className="w-7 h-7 rounded-lg bg-sky-500/10 group-hover:bg-white/20 flex items-center justify-center transition-colors">
                <Send className="w-3.5 h-3.5 rtl:rotate-180 text-sky-600 group-hover:text-white transition-colors" />
              </div>
            </a>
          </div>

          <div className="mt-3 text-center border-t border-border/50 pt-2 text-[10px] text-muted-foreground">
            {isArabic ? "اضغط على أي وسيلة لفتح الشات مباشرة" : "Click any option to chat directly"}
          </div>
        </div>
      )}

      {/* Main Sticky Floating Bar / Capsule */}
      <div className="pointer-events-auto flex items-center gap-2">
        {/* Direct WhatsApp Instant Bubble */}
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          title={`${texts.whatsAppTitle} - ${whatsappNumber}`}
          aria-label={texts.whatsAppTitle}
          className="group relative flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xl shadow-emerald-500/35 hover:shadow-emerald-500/60 hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer border-2 border-white"
        >
          {/* Subtle pulsating radar wave */}
          <span className="absolute -inset-1 rounded-full bg-emerald-400 opacity-30 group-hover:animate-ping" />

          {/* Green Online Dot */}
          <span className="absolute top-0 end-0 block h-3.5 w-3.5 rounded-full bg-emerald-300 ring-2 ring-white" />

          <WhatsAppIcon className="w-6 h-6 sm:w-7 sm:h-7 transition-transform group-hover:scale-110" />

          {/* Desktop Hover Tooltip */}
          <span className="pointer-events-none absolute bottom-full mb-2 hidden sm:group-hover:flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-slate-900/90 backdrop-blur-md px-2.5 py-1 text-[11px] font-semibold text-white shadow-lg">
            <span>{texts.whatsAppTitle}</span>
            <span className="text-[10px] text-emerald-400 font-mono">({whatsappNumber})</span>
          </span>
        </a>

        {/* Direct Messenger Instant Bubble */}
        <a
          href={messengerUrl}
          target="_blank"
          rel="noopener noreferrer"
          title={texts.messengerTitle}
          aria-label={texts.messengerTitle}
          className="group relative flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-gradient-to-tr from-[#0084FF] via-[#00A3FF] to-[#00C6FF] text-white shadow-xl shadow-sky-500/35 hover:shadow-sky-500/60 hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer border-2 border-white"
        >
          {/* Blue radar glow */}
          <span className="absolute -inset-1 rounded-full bg-sky-400 opacity-25 group-hover:animate-ping" />

          <MessengerIcon className="w-6 h-6 sm:w-7 sm:h-7 transition-transform group-hover:scale-110" />

          {/* Desktop Hover Tooltip */}
          <span className="pointer-events-none absolute bottom-full mb-2 hidden sm:group-hover:flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-slate-900/90 backdrop-blur-md px-2.5 py-1 text-[11px] font-semibold text-white shadow-lg">
            <span>{texts.messengerTitle}</span>
            <span className="text-[10px] text-sky-300">Facebook</span>
          </span>
        </a>

        {/* Expand / Quick Menu Pill Toggle */}
        <button
          type="button"
          onClick={() => {
            setIsExpanded(!isExpanded);
            setHasInteracted(true);
          }}
          className="group hidden sm:inline-flex items-center gap-2 px-3.5 py-2.5 rounded-full border border-border/80 bg-white/90 text-foreground hover:bg-white hover:border-primary/50 shadow-lg hover:shadow-xl backdrop-blur-md transition-all duration-200 cursor-pointer font-semibold text-xs"
          title={isExpanded ? texts.collapse : texts.expand}
          aria-expanded={isExpanded}
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <span className="font-bold">{texts.quickContact}</span>
          <ChevronUp
            className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>
    </aside>
  );
}
