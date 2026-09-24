import { createFileRoute } from "@tanstack/react-router";
import portrait from "@/assets/mohamed-portrait.jpg";
import fintech from "@/assets/project-fintech.jpg";
import coffee from "@/assets/project-coffee.jpg";
import health from "@/assets/project-health.jpg";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "محمد صلاح | مصمم تجارب رقمية" },
      {
        name: "description",
        content: "بورتفوليو محمد صلاح — تصميم واجهات، تجارب رقمية، وهوية بصرية.",
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
  component: Portfolio,
});

type Language = "ar" | "en";

const content = {
  ar: {
    navLabel: "التنقل الرئيسي",
    name: "محمد صلاح",
    worksNav: "أعمالي",
    servicesNav: "خدماتي",
    experienceNav: "خبرتي",
    contactNav: "تواصل",
    start: "لنبدأ مشروعًا",
    available: "متاح لمشاريع مختارة",
    role: "مصمم منتجات رقمية وواجهات مستخدم",
    intro:
      "أحوّل الأفكار المعقّدة إلى تجارب رقمية واضحة وجميلة. أصمم منتجات وهوية بصرية تساعد العلامات الطموحة على النمو وترك انطباع لا يُنسى.",
    viewWork: "استعرض أعمالي",
    contactMe: "تواصل معي",
    stats: [
      ["خبرة", "في حلول رقمية متكاملة"],
      ["دقة", "في كل قرار تصميمي"],
      ["شراكة", "من الفكرة حتى الإطلاق"],
    ],
    specialty: "مجالات العمل",
    portraitAlt: "صورة تعريفية لمحمد صلاح",
    workKicker: "مختارات حديثة",
    workTitle: "أعمال صنعت فرقًا",
    workNote: "ثلاث دراسات حالة نموذجية",
    projects: [
      {
        image: fintech,
        category: "منتج مالي",
        title: "منصة رصيد للمدفوعات",
        detail: "تجربة مالية واضحة وآمنة من التسجيل حتى التحويل",
      },
      {
        image: coffee,
        category: "تجارة إلكترونية",
        title: "متجر محمصة أثير",
        detail: "هوية رقمية وتجربة شراء تضع المنتج في الواجهة",
      },
      {
        image: health,
        category: "تطبيق صحي",
        title: "تطبيق نبض للمتابعة",
        detail: "لوحات صحية يومية سهلة القراءة واتخاذ القرار",
      },
    ],
    servicesKicker: "ما الذي أقدمه",
    servicesTitle: "خدمات مصممة حول هدفك",
    services: [
      ["01", "تصميم واجهات", "واجهات متقنة وسهلة الاستخدام"],
      ["02", "تجربة المستخدم", "رحلات مدروسة تقلل التعقيد"],
      ["03", "أنظمة التصميم", "مكونات متسقة قابلة للتوسع"],
      ["04", "الهوية البصرية", "شخصية واضحة عبر كل نقطة تواصل"],
    ],
    processKicker: "منهج العمل",
    processTitle: "من الفكرة إلى أثر ملموس",
    process: [
      ["01", "اكتشاف وفهم", "نحدد المشكلة والجمهور وأهداف النجاح."],
      ["02", "تصميم واختبار", "نحوّل الرؤية إلى تجربة قابلة للتجربة والتحسين."],
      ["03", "تسليم وإطلاق", "نجهّز كل التفاصيل لتنفيذ متقن وسلس."],
    ],
    idea: "لديك فكرة؟",
    contactTitle: "لنصنع تجربة تستحق أن تُتذكّر",
    contactText: "يسعدني سماع فكرتك ومعرفة كيف يمكنني مساعدتك في تحويلها إلى منتج واضح ومؤثر.",
    copyright: "© 2026 محمد صلاح",
    crafted: "صُمّم بعناية، ووضوح، وهدف",
  },
  en: {
    navLabel: "Main navigation",
    name: "Mohamed Salah",
    worksNav: "Work",
    servicesNav: "Services",
    experienceNav: "Process",
    contactNav: "Contact",
    start: "Start a project",
    available: "Available for select projects",
    role: "Digital Product & UI Designer",
    intro:
      "I turn complex ideas into clear, beautiful digital experiences. I design products and visual identities that help ambitious brands grow and leave a lasting impression.",
    viewWork: "Explore my work",
    contactMe: "Get in touch",
    stats: [
      ["Experience", "Across complete digital products"],
      ["Precision", "In every design decision"],
      ["Partnership", "From first idea to launch"],
    ],
    specialty: "Expertise",
    portraitAlt: "Portrait of Mohamed Salah",
    workKicker: "Selected work",
    workTitle: "Projects that made an impact",
    workNote: "Three sample case studies",
    projects: [
      {
        image: fintech,
        category: "Fintech Product",
        title: "Raseed Payments Platform",
        detail: "A clear, secure financial journey from onboarding to transfer",
      },
      {
        image: coffee,
        category: "E-commerce",
        title: "Atheer Coffee Store",
        detail: "A digital identity and shopping experience that puts the product first",
      },
      {
        image: health,
        category: "Health App",
        title: "Nabd Health Tracker",
        detail: "Daily health dashboards designed for clarity and confident decisions",
      },
    ],
    servicesKicker: "What I do",
    servicesTitle: "Services built around your goals",
    services: [
      ["01", "Interface Design", "Polished, intuitive interfaces"],
      ["02", "User Experience", "Thoughtful journeys that reduce complexity"],
      ["03", "Design Systems", "Consistent components made to scale"],
      ["04", "Visual Identity", "A distinct presence across every touchpoint"],
    ],
    processKicker: "My process",
    processTitle: "From idea to tangible impact",
    process: [
      ["01", "Discover & Define", "We align on the problem, audience, and success goals."],
      ["02", "Design & Test", "We turn the vision into an experience ready to test and refine."],
      ["03", "Deliver & Launch", "Every detail is prepared for a polished, seamless build."],
    ],
    idea: "Have an idea?",
    contactTitle: "Let’s create an experience worth remembering",
    contactText:
      "I’d love to hear your idea and explore how I can help turn it into a clear, meaningful product.",
    copyright: "© 2026 Mohamed Salah",
    crafted: "Designed with care, clarity, and purpose",
  },
} as const;

function Portfolio() {
  const [language, setLanguage] = useState<Language>("ar");
  const copy = content[language];
  const isArabic = language === "ar";

  useEffect(() => {
    const saved = window.localStorage.getItem("portfolio-language");
    if (saved === "ar" || saved === "en") setLanguage(saved);
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = isArabic ? "rtl" : "ltr";
    window.localStorage.setItem("portfolio-language", language);
  }, [isArabic, language]);

  return (
    <main
      dir={isArabic ? "rtl" : "ltr"}
      className="portfolio-shell min-h-screen overflow-hidden bg-background text-foreground"
    >
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <header className="relative z-20 mx-auto max-w-6xl px-4 pt-4 sm:px-6 sm:pt-6">
        <nav
          className="glass flex items-center justify-between gap-3 px-4 py-3 sm:px-5"
          aria-label={copy.navLabel}
        >
          <a href="#top" className="flex items-center gap-3 font-semibold">
            <span className="brand-mark">M</span>
            <span className="hidden sm:inline">{copy.name}</span>
          </a>
          <div className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
            <a href="#works" className="nav-link">
              {copy.worksNav}
            </a>
            <a href="#services" className="nav-link">
              {copy.servicesNav}
            </a>
            <a href="#experience" className="nav-link">
              {copy.experienceNav}
            </a>
            <a href="#contact" className="nav-link">
              {copy.contactNav}
            </a>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="language-toggle"
              onClick={() => setLanguage(isArabic ? "en" : "ar")}
              aria-label={isArabic ? "Switch to English" : "التبديل إلى العربية"}
            >
              <span>{isArabic ? "EN" : "AR"}</span>
              <i aria-hidden="true">文</i>
            </button>
            <a href="#contact" className="button button-dark hidden sm:inline-flex">
              {copy.start}
            </a>
          </div>
        </nav>
      </header>

      <section
        id="top"
        className="relative z-10 mx-auto grid max-w-6xl items-center gap-12 px-6 pb-16 pt-14 lg:grid-cols-12 lg:pt-20"
      >
        <div className="lg:col-span-7">
          <span className="availability">
            <i /> {copy.available}
          </span>
          <p className="mt-7 text-sm font-semibold text-primary">{copy.role}</p>
          <h1 className="mt-2 text-5xl font-bold leading-tight sm:text-7xl">{copy.name}</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">{copy.intro}</p>
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
          <div className="mt-10 flex flex-wrap gap-10 border-t border-border/60 pt-7">
            {copy.stats.map(([title, detail]) => (
              <div key={title}>
                <strong className="stat">{title}</strong>
                <span>{detail}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="lg:col-span-5">
          <div className="portrait-wrap">
            <img
              src={portrait}
              width={1024}
              height={1280}
              alt={copy.portraitAlt}
              className="portrait"
            />
            <div className="specialty">
              <span>{copy.specialty}</span>
              <strong>UI/UX · Branding</strong>
            </div>
          </div>
        </div>
      </section>

      <section id="works" className="relative z-10 mx-auto max-w-6xl px-6 py-16">
        <div className="mb-9 flex items-end justify-between">
          <div>
            <p className="section-kicker">{copy.workKicker}</p>
            <h2 className="section-title">{copy.workTitle}</h2>
          </div>
          <span className="hidden text-sm text-muted-foreground sm:block">{copy.workNote}</span>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {copy.projects.map((project) => (
            <article className="project-card glass" key={project.title}>
              <div className="image-frame">
                <img
                  src={project.image}
                  loading="lazy"
                  width={1024}
                  height={768}
                  alt={project.title}
                />
              </div>
              <div className="px-1 pb-1 pt-5">
                <span className="text-xs font-semibold text-accent">{project.category}</span>
                <h3 className="mt-1 text-xl font-semibold">{project.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{project.detail}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

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

      <section id="contact" className="relative z-10 mx-auto max-w-6xl px-6 py-16">
        <div className="contact glass px-6 py-12 text-center sm:px-10">
          <p className="section-kicker">{copy.idea}</p>
          <h2 className="mx-auto mt-2 max-w-2xl text-3xl font-bold sm:text-5xl">
            {copy.contactTitle}
          </h2>
          <p className="mx-auto mt-4 max-w-lg leading-7 text-muted-foreground">
            {copy.contactText}
          </p>
          <a className="button button-dark mt-8" href="mailto:hello@mohamedsalah.design">
            hello@mohamedsalah.design
          </a>
        </div>
        <footer className="flex flex-col items-center justify-between gap-3 py-8 text-xs text-muted-foreground sm:flex-row">
          <span>{copy.copyright}</span>
          <span>{copy.crafted}</span>
        </footer>
      </section>
    </main>
  );
}
