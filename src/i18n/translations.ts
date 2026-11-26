import { Language } from '../types';

export interface Translations {
  appName: string;
  tagline: string;
  subTagline: string;
  allCalculators: string;
  searchPlaceholder: string;
  unitSystem: string;
  metric: string;
  usCustomary: string;
  domains: {
    'water-quality': string;
    'hydrology-reservoirs': string;
    'wastewater': string;
    'geo-energy': string;
    'wef-nexus': string;
  };
  featuredBadge: string;
  showYourWork: string;
  hideYourWork: string;
  printReport: string;
  reportTitle: string;
  projectReport: string;
  projectName: string;
  engineerName: string;
  organization: string;
  calculatedOn: string;
  inputs: string;
  outputs: string;
  stepByStepSolution: string;
  referencesAndStandards: string;
  exportPdf: string;
  close: string;
  loadSampleData: string;
  resetDefaults: string;
  communityFeedback: string;
  sendFeedback: string;
  feedbackPrompt: string;
  feedbackThanks: string;
  aboutTitle: string;
  aboutText: string;
  noLoginFree: string;
  copyLink: string;
  linkCopied: string;
  step: string;
  formula: string;
  substitution: string;
  result: string;
  status: string;
  calculationDetails: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    appName: 'AquaCalcs',
    tagline: 'Water & Environmental Engineering Calculator Suite',
    subTagline: '23+ peer-reviewed, validated hydraulic, hydrologic, and environmental engineering tools with full mathematical transparency.',
    allCalculators: 'All Tools',
    searchPlaceholder: 'Search calculators by name, method (e.g., Penman, Manning, Carlson, DO, BOD)...',
    unitSystem: 'Unit System',
    metric: 'Metric (SI)',
    usCustomary: 'US Customary',
    domains: {
      'water-quality': 'Water Quality Assessment',
      'hydrology-reservoirs': 'Hydrology & Reservoir Design',
      'wastewater': 'Wastewater Treatment',
      'geo-energy': 'Geo-Energy & Hydropower',
      'wef-nexus': 'Water-Energy-Food Nexus',
    },
    featuredBadge: 'Featured Model',
    showYourWork: 'Show Mathematical Derivation & Step-by-Step Work',
    hideYourWork: 'Hide Mathematical Derivation',
    printReport: 'Print / Export Engineering Sheet',
    reportTitle: 'ENGINEERING CALCULATION REPORT',
    projectReport: 'AquaCalcs Standard Technical Calculation Sheet',
    projectName: 'Project Name / Code',
    engineerName: 'Engineer / Analyst',
    organization: 'Agency / Firm',
    calculatedOn: 'Date of Calculation',
    inputs: 'Input Design Parameters',
    outputs: 'Calculated Results & Metrics',
    stepByStepSolution: 'Step-by-Step Mathematical Derivation',
    referencesAndStandards: 'Governing Standards & Citations',
    exportPdf: 'Print / Save as PDF',
    close: 'Close',
    loadSampleData: 'Load Benchmark Data',
    resetDefaults: 'Reset to Defaults',
    communityFeedback: 'Feedback & Bug Report',
    sendFeedback: 'Submit Verification Report',
    feedbackPrompt: 'Have a formula enhancement, edge-case check, or custom tool suggestion?',
    feedbackThanks: 'Thank you for contributing to open-access water engineering!',
    aboutTitle: 'About AquaCalcs',
    aboutText: 'AquaCalcs is an open-access engineering suite built to provide water resources, environmental, and energy engineers with peer-reviewed, error-free calculations aligned with EPA, FAO-56, Metcalf & Eddy, and IAPWS standards.',
    noLoginFree: 'Free & Open-Access · No Login Required · Peer-Reviewed Formulations',
    copyLink: 'Share Calculator',
    linkCopied: 'Direct Link Copied',
    step: 'Step',
    formula: 'Governing Equation',
    substitution: 'Parameter Substitution',
    result: 'Evaluated Value',
    status: 'System Regime / State',
    calculationDetails: 'Methodology & Kinetic Equations',
  },
  fa: {
    appName: 'آکواکلکس (AquaCalcs)',
    tagline: 'مجموعه ابزارهای محاسباتی مهندسی آب و محیط زیست',
    subTagline: 'بیش از ۲۳ ابزار دقیق و داوری‌شده در هیدرولوژی، منابع آب، تصفیه فاضلاب و انرژی با شفافیت کامل معادلات ریاضی.',
    allCalculators: 'همه ابزارها',
    searchPlaceholder: 'جستجوی ماشین‌حساب با نام روش یا مدل (مثل منینگ، کارلسون، اکسیژن، لجن فعال)...',
    unitSystem: 'سیستم واحدها',
    metric: 'متریک (SI)',
    usCustomary: 'سیستم آمریکایی (US)',
    domains: {
      'water-quality': 'ارزیابی کیفیت آب',
      'hydrology-reservoirs': 'هیدرولوژی و طراحی مخازن',
      'wastewater': 'تصفیه آب و فاضلاب',
      'geo-energy': 'ژئو-انرژی و برق‌آبی',
      'wef-nexus': 'پیوند آب-انرژی-غذا (WEF)',
    },
    featuredBadge: 'مدل ویژه',
    showYourWork: 'نمایش گام‌به‌گام محاسبات و جایگذاری فرمول‌ها',
    hideYourWork: 'بستن گام‌به‌گام محاسبات',
    printReport: 'چاپ و استخراج گزارش مهندسی',
    reportTitle: 'برگه محاسبات رسمی مهندسی',
    projectReport: 'گزارش فنی استاندارد AquaCalcs',
    projectName: 'نام پروژه / کد',
    engineerName: 'نام مهندس / تحلیل‌گر',
    organization: 'شرکت / دانشگاه / سازمان',
    calculatedOn: 'تاریخ محاسبه',
    inputs: 'پارامترهای ورودی طراحی',
    outputs: 'نتایج و شاخص‌های محاسبه شده',
    stepByStepSolution: 'مراحل گام‌به‌گام و حل جبری معادلات',
    referencesAndStandards: 'استانداردها و مراجع معتبر',
    exportPdf: 'چاپ یا ذخیره به عنوان PDF',
    close: 'بستن',
    loadSampleData: 'بارگذاری داده‌های پیش‌فرض نمونه',
    resetDefaults: 'بازنشانی مقادیر',
    communityFeedback: 'ارسال بازخورد و گزارش خطا',
    sendFeedback: 'ارسال گزارش',
    feedbackPrompt: 'پیشنهادی برای بهبود فرمول‌ها، بررسی موارد حدی، یا ابزار جدید دارید؟',
    feedbackThanks: 'از مشارکت شما در توسعه ابزارهای متن‌باز مهندسی آب سپاسگزاریم!',
    aboutTitle: 'درباره آکواکلکس',
    aboutText: 'آکواکلکس پلتفرمی آزاد و رایگان برای مهندسان عمران، آب، محیط زیست و انرژی است تا بدون نیاز به ثبت‌نام به فرمول‌های استاندارد FAO، EPA، متکف و ادی، و IAPWS دسترسی داشته باشند.',
    noLoginFree: 'کاملاً رایگان · بدون نیاز به ورود · معادلات استاندارد بین‌المللی',
    copyLink: 'اشتراک‌گذاری ابزار',
    linkCopied: 'پیوند مستقیم کپی شد',
    step: 'مرحله',
    formula: 'معادله حاکم',
    substitution: 'جایگذاری عددی مقادیر',
    result: 'مقدار به‌دست‌آمده',
    status: 'وضعیت رژیم جریان / کیفیت',
    calculationDetails: 'روش‌شناسی و مبانی تئوری',
  },
  es: {
    appName: 'AquaCalcs',
    tagline: 'Suite de Cálculo para Ingeniería Hidráulica y Ambiental',
    subTagline: 'Más de 23 herramientas validadas por pares para recursos hídricos, hidrología, aguas residuales y energía con transparencia matemática total.',
    allCalculators: 'Todas las herramientas',
    searchPlaceholder: 'Buscar calculadora por nombre, método (ej. Penman, Manning, Carlson, DO, BOD)...',
    unitSystem: 'Sistema de Unidades',
    metric: 'Métrico (SI)',
    usCustomary: 'Anglosajón (US)',
    domains: {
      'water-quality': 'Calidad del Agua',
      'hydrology-reservoirs': 'Hidrología y Embalses',
      'wastewater': 'Tratamiento de Aguas Residuales',
      'geo-energy': 'Geo-Energía e Hidroeléctrica',
      'wef-nexus': 'Nexo Agua-Energía-Alimentos',
    },
    featuredBadge: 'Modelo Destacado',
    showYourWork: 'Mostrar Pasos y Sustitución de Fórmulas',
    hideYourWork: 'Ocultar Pasos Matemáticos',
    printReport: 'Imprimir / Exportar Hoja de Cálculo',
    reportTitle: 'HOJA DE CÁLCULO DE INGENIERÍA',
    projectReport: 'Memoria Técnica AquaCalcs',
    projectName: 'Nombre / Código del Proyecto',
    engineerName: 'Ingeniero / Analista',
    organization: 'Empresa / Institución',
    calculatedOn: 'Fecha de Cálculo',
    inputs: 'Parámetros de Entrada de Diseño',
    outputs: 'Resultados y Métricas Obtenidas',
    stepByStepSolution: 'Desarrollo Matemático Paso a Paso',
    referencesAndStandards: 'Normas y Referencias Bibliográficas',
    exportPdf: 'Imprimir / Guardar como PDF',
    close: 'Cerrar',
    loadSampleData: 'Cargar Datos de Prueba',
    resetDefaults: 'Restablecer Valores',
    communityFeedback: 'Comentarios y Reporte de Errores',
    sendFeedback: 'Enviar Reporte',
    feedbackPrompt: '¿Tiene alguna sugerencia de mejora de fórmula o caso límite?',
    feedbackThanks: '¡Gracias por contribuir a la ingeniería de aguas de acceso abierto!',
    aboutTitle: 'Acerca de AquaCalcs',
    aboutText: 'AquaCalcs es una plataforma de acceso libre diseñada para proporcionar cálculos confiables y validados por normas EPA, FAO-56, Metcalf & Eddy e IAPWS.',
    noLoginFree: 'Gratuito y Abierto · Sin Registro · Fórmulas Validadas',
    copyLink: 'Compartir Calculadora',
    linkCopied: 'Enlace Copiado',
    step: 'Paso',
    formula: 'Ecuación Gobernante',
    substitution: 'Sustitución Numérica',
    result: 'Valor Evaluado',
    status: 'Régimen / Estado del Sistema',
    calculationDetails: 'Metodología y Ecuaciones Cinéticas',
  },
};
