/**
 * SPIDER — default site content.
 * The live site loads data/content.json (managed from /admin) and falls back to this.
 */
window.SPIDER_DEFAULT = {
  settings: {
    whatsapp: "963900000000",
    whatsappMessage: "مرحباً SPIDER، أرغب بمناقشة مشروع برمجي.",
    email: "hello@spider.dev",
    phone: "",
    address: "",
    social: { linkedin: "https://www.linkedin.com/", github: "https://github.com/", x: "", instagram: "https://www.instagram.com/", facebook: "https://www.facebook.com/" },
    formEndpoint: "contact.php"
  },
  sections: { stores: true, plans: true, faq: true, services: true, works: true, team: true, process: true, why: true, stack: true, contact: true },
  hero: {
    eyebrow: "Independent Digital Stores",
    title: "أسّس متجرك الرقمي",
    highlight: "بنظام كامل مستقل.",
    subtitle: "متجر باسمك ودومينك ولوحة تحكمك، موردون جاهزون وتسليم تلقائي، وأرباحك كاملة لك.",
    ctaPrimary: "ابدأ متجرك",
    ctaSecondary: "احسب أرباحك"
  },
  stats: [
    { value: "+10", next: "+11", label: "متاجر نخدمها" },
    { value: "8", label: "مجالات بيع جاهزة" },
    { value: "24/7", label: "تسليم تلقائي" },
    { value: "100%", label: "ملكية متجرك لك" }
  ],
  profit: {
    title: "متجرك مستقل،",
    highlight: "وأرباحك لك.",
    text: "أنت تحدد أسعار البيع، والفرق بين سعر المورّد وسعرك هو ربحك على كل طلب.",
    own: [
      { title: "دومينك وهويتك", desc: "متجر باسمك وشعارك، بدون اسم منصة وسيطة." },
      { title: "لوحة تحكم كاملة", desc: "المنتجات، الأسعار، الطلبات، العملاء، والتقارير." },
      { title: "عملاؤك وبياناتك", desc: "قاعدة عملائك ملكك وحدك." },
      { title: "أسعارك وهامشك", desc: "تحدد ربحك لكل منتج ولكل فئة عملاء." }
    ],
    note: "الأرقام في الحاسبة تقديرية للتوضيح فقط، والربح الفعلي يعتمد على مبيعاتك وأسعارك."
  },
  about: {
    statement: "لسنا مجرد مبرمجين. نحن فريق يصمّم، يهندس، ويبني البنية الرقمية التي تقوم عليها الأعمال.",
    points: [
      { title: "تصميم", en: "Product & UI/UX" },
      { title: "هندسة", en: "Architecture & Code" },
      { title: "تشغيل", en: "Launch & Support" }
    ]
  },
  services: [
    { title: "المواقع والمنصات الإلكترونية", en: "Web Platforms", desc: "منصات سريعة ومتجاوبة جاهزة للنمو." },
    { title: "تطبيقات الويب والأنظمة المخصصة", en: "Custom Software", desc: "أنظمة تُبنى حول طريقة عملك." },
    { title: "الأنظمة المحاسبية والإدارية ERP", en: "ERP & Accounting", desc: "المالية والمبيعات والمشتريات في نظام واحد." },
    { title: "المستودعات والمخزون", en: "Inventory", desc: "تتبع دقيق حتى مستوى القطعة الواحدة." },
    { title: "الكاشير ونقاط البيع POS", en: "Point of Sale", desc: "بيع سريع وفواتير منظمة وتقارير فورية." },
    { title: "الدفع الإلكتروني والشحن الرقمي", en: "Payments", desc: "أرصدة ومعاملات ومنتجات رقمية بموثوقية." },
    { title: "واجهات API وحلول White-Label", en: "API & White-Label", desc: "ربط الأنظمة، وحلول جاهزة تُقدَّم بعلامتك." },
    { title: "منصات SaaS متعددة العملاء", en: "Multi-Tenant SaaS", desc: "منتج واحد يخدم عملاء مستقلين." },
    { title: "قواعد البيانات والبنية البرمجية", en: "Architecture", desc: "معمارية متينة قابلة للتوسع." },
    { title: "الدعم والتطوير المستمر", en: "Support", desc: "نبقى مع نظامك بعد الإطلاق." }
  ],
  works: [
    {
      name: "TAFA3OL", name2: "CARD", category: "Digital Payment & Recharge Platform", color: "#D9B56F",
      desc: "منصة متكاملة للدفع الإلكتروني والشحن الرقمي: أرصدة الاتصالات، الألعاب، ومتاجر التطبيقات.",
      features: ["شحن الاتصالات", "شحن الألعاب", "Google Play · App Store", "إدارة الطلبات والعملاء", "الأرصدة والمعاملات", "واجهات API"],
      url: "https://tafa3olcard.com", mock: "card", image: ""
    },
    {
      name: "TAFA3OL", name2: "TECH", category: "Inventory & Warehouse Management", color: "#7FC8A9",
      desc: "إدارة مستودعات الأجهزة الإلكترونية، حيث يُتتبَّع كل جهاز عبر IMEI من دخوله حتى بيعه أو نقله.",
      features: ["مستودعات متعددة", "تتبع IMEI", "سجل حركة كامل", "بيع وشراء وتحويل", "تقارير المخزون", "صلاحيات متعددة"],
      url: "", mock: "tech", image: ""
    },
    {
      name: "LAVENDER", name2: "BEAUTY", category: "Retail Management & Accounting POS", color: "#B9A3D6",
      desc: "نظام محاسبي وإداري مخصص لمتجر مستحضرات التجميل Lavender Beauty.",
      features: ["كاشير متعدد المستخدمين", "الفواتير والمبيعات", "المشتريات والموردون", "الأرباح والخسائر", "الصندوق والحسابات", "أداء الكاشيرات"],
      url: "", mock: "lav", image: ""
    }
  ],
  stores: {
    eyebrow: "SPIDER Stores",
    title: "متجرك الرقمي،",
    highlight: "جاهز للبيع من اليوم الأول.",
    subtitle: "منصة متاجر رقمية متكاملة: موردون مربوطون، تسليم تلقائي، ومتجر باسمك ودومينك.",
    cta: "اطلب متجرك",
    categories: [
      { title: "شحن الألعاب", en: "Game Top-ups", desc: "شدّات وجواهر وعملات للألعاب الأكثر طلباً." },
      { title: "البطاقات الرقمية", en: "Gift Cards", desc: "بطاقات المتاجر والمحافظ الرقمية بتسليم فوري." },
      { title: "الاشتراكات", en: "Subscriptions", desc: "اشتراكات المنصات والخدمات الرقمية." },
      { title: "مفاتيح البرامج", en: "Software Keys", desc: "تراخيص ومفاتيح تفعيل البرامج." },
      { title: "خدمات التواصل SMM", en: "SMM Panel", desc: "متابعون وتفاعل لمنصات التواصل." },
      { title: "أرقام التفعيل", en: "Activation Numbers", desc: "أرقام مؤقتة لتفعيل الحسابات تلقائياً." },
      { title: "البطاقات الافتراضية", en: "Virtual Cards", desc: "بطاقات دفع افتراضية للشراء عبر الإنترنت." },
      { title: "رصيد الاتصالات", en: "Mobile Credit", desc: "شحن أرصدة وباقات شركات الاتصالات." }
    ],
    products: [
      { name: "PUBG Mobile", sub: "شدّات UC", icon: "assets/img/brands/pubg.svg", color: "#F2A900" },
      { name: "Free Fire", sub: "جواهر", icon: "", color: "#FF5A1F" },
      { name: "PlayStation", sub: "بطاقات PSN", icon: "assets/img/brands/playstation.svg", color: "#0070D1" },
      { name: "Google Play", sub: "بطاقات رصيد", icon: "assets/img/brands/googleplay.svg", color: "#01875F" },
      { name: "App Store", sub: "بطاقات iTunes", icon: "assets/img/brands/appstore.svg", color: "#0D96F6" },
      { name: "Netflix", sub: "اشتراكات", icon: "assets/img/brands/netflix.svg", color: "#E50914" },
      { name: "Steam", sub: "محفظة Steam", icon: "assets/img/brands/steam.svg", color: "#1B2838" },
      { name: "TikTok", sub: "عملات", icon: "assets/img/brands/tiktok.svg", color: "#FE2C55" },
      { name: "Roblox", sub: "Robux", icon: "assets/img/brands/roblox.svg", color: "#393B3D" },
      { name: "Xbox", sub: "بطاقات Xbox", icon: "assets/img/brands/xbox.svg", color: "#107C10" },
      { name: "Spotify", sub: "اشتراك Premium", icon: "assets/img/brands/spotify.svg", color: "#1DB954" },
      { name: "Discord", sub: "Nitro", icon: "assets/img/brands/discord.svg", color: "#5865F2" },
      { name: "Telegram", sub: "Premium · أرقام", icon: "assets/img/brands/telegram.svg", color: "#26A5E4" },
      { name: "Instagram", sub: "متابعون SMM", icon: "assets/img/brands/instagram.svg", color: "#E4405F" },
      { name: "YouTube", sub: "مشاهدات SMM", icon: "assets/img/brands/youtube.svg", color: "#FF0000" },
      { name: "WhatsApp", sub: "أرقام تفعيل", icon: "assets/img/brands/whatsapp.svg", color: "#25D366" }
    ],
    storeTypes: ["متجر شحن ألعاب", "متجر بطاقات رقمية", "متجر اشتراكات", "متجر مفاتيح برامج", "لوحة خدمات SMM", "متجر أرقام تفعيل", "متجر بطاقات افتراضية", "واجهة API للموزعين"],
    steps: [
      { title: "سمِّ متجرك واختر شكله", desc: "اسمك، شعارك، ألوانك، ودومينك الخاص." },
      { title: "اربط المنتجات وحدد أسعارك", desc: "موردون جاهزون أو أي مزوّد عبر API، مع هامش ربح تلقائي." },
      { title: "ابدأ البيع", desc: "يشحن العميل محفظته ويشتري، والطلبات تُسلَّم تلقائياً." }
    ],
    features: [
      { title: "تسليم تلقائي فوري", desc: "الطلب يُنفَّذ ويصل للعميل خلال ثوانٍ." },
      { title: "تبديل المورّد تلقائياً", desc: "إذا توقف مورّد يتحول الطلب لمورّد بديل." },
      { title: "حماية من الخسارة", desc: "منع البيع تحت سعر التكلفة." },
      { title: "محفظة وكوبونات", desc: "رصيد للعملاء، كشف حساب، خصومات وعروض." },
      { title: "وكلاء ومستويات أسعار", desc: "تجزئة وجملة ووكلاء، مع صلاحيات للموظفين." },
      { title: "عملات ولغات متعددة", desc: "تسعير بالعملة المحلية والعملات الرقمية." }
    ],
    addons: [
      { title: "بوت تيليغرام", desc: "متجرك داخل تيليغرام باسمك." },
      { title: "تطبيق أندرويد", desc: "تطبيق خاص بمتجرك جاهز للتوزيع." },
      { title: "الوكلاء والربط", desc: "وكلاء بأسعارهم، وربط متجر بمتجر عبر API." },
      { title: "دومين خاص", desc: "متجرك على نطاقك أنت." },
      { title: "خدمات SMM", desc: "خدمات المتابعين من مورّد جاهز." },
      { title: "أرقام التفعيل", desc: "تسليم أرقام التفعيل تلقائياً." }
    ]
  },
  plans: [
    { name: "متجر أساسي", price: "تواصل معنا", period: "", featured: false, features: ["متجر باسمك", "فئات المنتجات الأساسية", "تسليم تلقائي", "محفظة العملاء"], cta: "اطلب عرض سعر" },
    { name: "متجر احترافي", price: "تواصل معنا", period: "", featured: true, features: ["كل فئات المنتجات", "دومين خاص", "وكلاء ومستويات أسعار", "بوت تيليغرام", "دعم فني أولوية"], cta: "اطلب عرض سعر" },
    { name: "نظام مخصص", price: "حسب المشروع", period: "", featured: false, features: ["برمجة حسب الطلب", "تكامل مع أنظمتك", "تطبيق أندرويد", "API للموزعين"], cta: "ناقش مشروعك" }
  ],
  faq: [
    { q: "ما الفرق بين متاجر SPIDER والبرمجة المخصصة؟", a: "متاجر SPIDER منصة جاهزة لبيع المنتجات الرقمية تنطلق بسرعة، أما البرمجة المخصصة فنبني لك نظاماً من الصفر حسب طبيعة عملك." },
    { q: "هل يظهر المتجر باسمي وهويتي؟", a: "نعم، المتجر يعمل باسمك وشعارك ودومينك الخاص." },
    { q: "من أين تأتي المنتجات؟", a: "من موردين مربوطين مسبقاً، ويمكن ربط أي مزوّد آخر عبر API." },
    { q: "ماذا يحدث إذا توقف أحد الموردين؟", a: "يمكن تحويل الطلبات تلقائياً إلى مورّد بديل حتى لا تتوقف مبيعاتك." },
    { q: "من يملك بيانات العملاء؟", a: "أنت. بيانات عملائك وطلباتك ملك لمتجرك." },
    { q: "هل تقدمون دعماً بعد الإطلاق؟", a: "نعم، نقدّم دعماً فنياً وتحديثات مستمرة لكل الأنظمة التي نبنيها." }
  ],
  team: [
    { title: "تصميم المنتجات وتجربة المستخدم", en: "Product & UI/UX Design", icon: "design" },
    { title: "تطوير الواجهات الأمامية", en: "Frontend Engineering", icon: "front" },
    { title: "تطوير الأنظمة الخلفية", en: "Backend Engineering", icon: "back" },
    { title: "هندسة قواعد البيانات", en: "Data & Architecture", icon: "data" },
    { title: "الجودة والاختبار", en: "Quality Assurance", icon: "qa" },
    { title: "البنية التحتية والنشر", en: "DevOps & Cloud", icon: "ops" },
    { title: "إدارة المشاريع", en: "Project Management", icon: "pm" },
    { title: "الدعم الفني", en: "Technical Support", icon: "support" }
  ],
  process: [
    { title: "اكتشاف", en: "Discover", desc: "نفهم عملك وأهدافك." },
    { title: "تصميم", en: "Design", desc: "نرسم التجربة والواجهات." },
    { title: "تطوير", en: "Build", desc: "نهندس ونبرمج ونختبر." },
    { title: "إطلاق", en: "Launch", desc: "ننشر بثقة وأمان." },
    { title: "تطوير مستمر", en: "Evolve", desc: "ندعم ونحسّن باستمرار." }
  ],
  why: ["أنظمة مستخدمة فعلياً", "حلول حسب طبيعة عملك", "بنية قابلة للتوسع", "ربط الأنظمة عبر API", "أمان وحماية للبيانات", "دعم وتطوير مستمر"],
  stack: ["Laravel", "PHP", "JavaScript", "MySQL", "REST API", "HTML5", "CSS3", "Modern Web"],
  contact: {
    title: "لديك فكرة؟",
    highlight: "لنحوّلها إلى واقع.",
    text: "أخبرنا عن مشروعك، وسيتواصل معك فريقنا لمناقشة الحل المناسب.",
    types: ["منصة أو موقع إلكتروني", "نظام مخصص / تطبيق ويب", "نظام محاسبي وإداري ERP", "نظام مستودعات ومخزون", "نظام كاشير POS", "حلول دفع إلكتروني", "ربط API / White-Label", "منصة SaaS", "دعم وتطوير نظام قائم", "أخرى"]
  }
};
