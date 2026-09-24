import { Project, ProfileData } from "./types.ts";
import portraitImg from "./assets/mohamed-portrait.jpg";
import fintechImg from "./assets/project-fintech.jpg";
import coffeeImg from "./assets/project-coffee.jpg";
import healthImg from "./assets/project-health.jpg";

export const INITIAL_PROFILE: ProfileData = {
  name: "محمد صلاح السيد فرحات",
  nameEn: "Mohamed Salah EL-Sayed Farahat",
  role: "مصمم منتجات رقمية وواجهات مستخدم (Senior UI/UX Designer)",
  roleEn: "Digital Product & UI Designer",
  intro:
    "أحوّل الأفكار المعقّدة إلى تجارب رقمية واضحة وجميلة. أصمم منتجات وهوية بصرية تساعد العلامات الطموحة على النمو وترك انطباع لا يُنسى.",
  introEn:
    "I turn complex ideas into clear, beautiful digital experiences. I design products and visual identities that help ambitious brands grow and leave a lasting impression.",
  portraitUrl: "https://i.ibb.co/mFBxFkD0/mohamed-portrait-new.png",
  availableText: "متاح لمشاريع مختارة",
  availableTextEn: "Available for select projects",
  specialty: "UI/UX · Branding · Design Systems",
  specialtyEn: "UI/UX · Branding · Design Systems",
  email: "s.mohamed1111111@gmail.com",
  phone: "01120194940",
  whatsappNumber: "01120194940",
  whatsappMessage: "مرحباً أستاذ محمد، أرغب في الاستفسار عن مشروع تصميم جديد.",
  facebookMessengerId: "379964405195884",
  showFloatingContact: true,
  location: "القاهرة، مصر (متاح للعمل عن بعد عالمياً)",
  stats: [
    {
      title: "خبرة",
      detail: "في حلول رقمية متكاملة",
      titleEn: "Experience",
      detailEn: "Across complete digital products",
    },
    {
      title: "دقة",
      detail: "في كل قرار تصميمي",
      titleEn: "Precision",
      detailEn: "In every design decision",
    },
    {
      title: "شراكة",
      detail: "من الفكرة حتى الإطلاق",
      titleEn: "Partnership",
      detailEn: "From first idea to launch",
    },
  ],
};

export const INITIAL_PROJECTS: Project[] = [
  {
    id: "proj-raseed",
    title: "منصة رصيد للمدفوعات الرقمية",
    titleEn: "Raseed Payments Platform",
    category: "منتج مالي",
    categoryEn: "Fintech Product",
    detail: "تجربة مالية واضحة وآمنة من التسجيل حتى التحويل الفوري للشركات والأفراد",
    detailEn: "A clear, secure financial journey from onboarding to transfer",
    fullDescription:
      "تصميم تجربة مستخدم مبتكرة لإدارة الحسابات البنكية والتحويلات المالية الفورية، مع لوحة معلومات مالية تركز على الوضوح الأقصى وتقليل أخطاء العمليات.",
    imageUrl: fintechImg,
    galleryImages: [
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80",
    ],
    clientName: "شركة رصيد المالية",
    completionYear: "2025",
    impactMetric: "زيادة معدل إتمام المعاملات 140% وتقليل وقت الإيداع إلى 25 ثانية",
    challengeSolved:
      "معالجة رهبة المستخدمين من واجهات المعاملات البنكية المعقدة من خلال تسلسل خطوات بصري بسيط ومطمئن.",
    liveUrl: "https://example.com/raseed-fintech",
    technologies: [
      "Figma",
      "UI/UX Design",
      "Design System",
      "Micro-interactions",
      "Fintech Architecture",
    ],
    placements: ["featured", "main", "case_study", "latest_strip"],
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 7,
  },
  {
    id: "proj-atheer",
    title: "متجر محمصة أثير المختصة",
    titleEn: "Atheer Coffee Store",
    category: "تجارة إلكترونية",
    categoryEn: "E-commerce",
    detail: "هوية رقمية وتجربة شراء استثنائية تضع جودة حبوب القهوة والمنتج في الواجهة",
    detailEn: "A digital identity and shopping experience that puts the product first",
    fullDescription:
      "بناء هوية بصرية كاملة وتجربة تسوق سريعة وممتعة لعشاق القهوة المختصة، تتضمن فلاتر ذكية لاختيار الإيحاءات ودرجة التحميص مع اشتراكات شهرية متجددة.",
    imageUrl: coffeeImg,
    galleryImages: [
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=1200&q=80",
    ],
    clientName: "محمصة أثير",
    completionYear: "2025",
    impactMetric: "نمو مبيعات الاشتراكات الشهرية 210% وانخفاض ترك السلة بنسبة 45%",
    challengeSolved:
      "تحويل حب القهوة وتذوقها الحسي إلى واجهة تفاعلية تشرح النكهات والروائح وتلهم الزبائن لاكتشاف أنواع جديدة.",
    liveUrl: "https://example.com/atheer-coffee",
    technologies: ["Branding", "E-commerce UX", "Design System", "Shopify Design", "Storytelling"],
    placements: ["featured", "main", "case_study", "latest_strip"],
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 14,
  },
  {
    id: "proj-nabd",
    title: "تطبيق نبض الصحي الذكي",
    titleEn: "Nabd Health Tracker",
    category: "تطبيق صحي",
    categoryEn: "Health App",
    detail: "لوحات صحية يومية سهلة القراءة واتخاذ القرار مع تتبع المؤشرات الحيوية لحظياً",
    detailEn: "Daily health dashboards designed for clarity and confident decisions",
    fullDescription:
      "تطبيق متكامل لمتابعة المؤشرات الحيوية لكبار السن والرياضيين، يربط الساعات الذكية ويعرض تقارير دورية للطبيب مع تنبيهات فورية عند وجود أي خلل.",
    imageUrl: healthImg,
    galleryImages: [
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=1200&q=80",
    ],
    clientName: "مؤسسة نبض للرعاية الطبية",
    completionYear: "2024",
    impactMetric: "أكثر من 85,000 مستخدم نشط وتقييم 4.9 في متجر التطبيقات",
    challengeSolved:
      "تصميم واجهة خالية من التوتر النفسي لبيانات الضغط ومستوى السكر ونبضات القلب، بألوان هادئة وخطوط مقروءة بنقرة واحدة.",
    liveUrl: "https://example.com/nabd-health",
    technologies: [
      "Mobile UI/UX",
      "iOS / Android Guidelines",
      "Data Visualization",
      "Accessibility",
    ],
    placements: ["main", "case_study", "latest_strip"],
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 25,
  },
  {
    id: "proj-horizon",
    title: "منصة هورايزون لإدارة الاستثمار والعقارات",
    titleEn: "Horizon Real Estate & Investment",
    category: "منصة سحابية SaaS",
    categoryEn: "SaaS Platform",
    detail: "لوحة قيادة تفاعلية لإدارة الصفقات العقارية والعوائد الاستثمارية اللحظية",
    detailEn: "Interactive dashboard for managing high-value real estate portfolios and ROI",
    fullDescription:
      "تصميم تجربة للمستثمرين في السوق العقاري تتيح جولات افتراضية ثلاثية الأبعاد، ومحاكاة العائد السنوي وخرائط حرارية للفرص الواعدة في الخليج العربي.",
    imageUrl:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1460472178825-e5240623afd5?auto=format&fit=crop&w=1200&q=80",
    ],
    clientName: "هورايزون للتطوير العقاري",
    completionYear: "2024",
    impactMetric: "تسهيل صفقات استثمارية بقيمة تتجاوز 40 مليون دولار خلال 6 أشهر",
    challengeSolved:
      "تبسيط البيانات القانونية والمالية المعقدة في بطاقات مقارنة ذكية تسهل اتخاذ القرار في ثوانٍ.",
    liveUrl: "https://example.com/horizon-properties",
    technologies: ["Figma", "Complex UI/UX", "Financial Dashboards", "Tailwind", "Design Systems"],
    placements: ["main", "latest_strip"],
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 40,
  },
];
