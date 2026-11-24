import { getLang, tr } from "./i18n";

export interface Option {
  value: string;
  label: string;
}

export const ownershipTypes: Option[] = [
  { value: "llc", get label() { return tr("LLC — Sociedad de responsabilidad limitada", "LLC — Limited liability company"); } },
  { value: "c-corp", get label() { return tr("Corporación (C-Corp)", "Corporation (C-Corp)"); } },
  { value: "s-corp", get label() { return tr("Corporación S (S-Corp)", "S Corporation (S-Corp)"); } },
  { value: "sole-proprietor", get label() { return tr("Empresa individual (Sole Proprietor)", "Sole proprietorship"); } },
  { value: "partnership", get label() { return tr("Sociedad colectiva (Partnership)", "Partnership"); } },
  { value: "non-profit", get label() { return tr("Entidad sin ánimo de lucro", "Non-profit organization"); } },
  { value: "trust", get label() { return tr("Trust / fideicomiso", "Trust"); } },
  { value: "other", get label() { return tr("Otra forma jurídica", "Other legal structure"); } },
];

export const locationTypes: Option[] = [
  { value: "office", get label() { return tr("Oficina (Office)", "Office"); } },
  { value: "retail", get label() { return tr("Local físico (Retail)", "Retail storefront"); } },
  { value: "online", get label() { return tr("Online / e-commerce", "Online / e-commerce"); } },
  { value: "warehouse", get label() { return tr("Almacén / logística", "Warehouse / logistics"); } },
  { value: "restaurant", get label() { return tr("Restaurante / hostelería", "Restaurant / hospitality"); } },
  { value: "clinic", get label() { return tr("Clínica / consulta", "Clinic / practice"); } },
  { value: "mobile", get label() { return tr("Móvil / a domicilio", "Mobile / on-site"); } },
  { value: "home", get label() { return tr("Domicilio particular", "Home-based"); } },
  { value: "other", get label() { return tr("Otro", "Other"); } },
];

export const businessTypes: Option[] = [
  { value: "advertising", get label() { return tr("Marketing y publicidad", "Marketing & advertising"); } },
  { value: "agency", get label() { return tr("Agencia de servicios", "Service agency"); } },
  { value: "ecommerce", get label() { return tr("Comercio electrónico (general)", "E-commerce (general)"); } },
  { value: "dropshipping", get label() { return tr("Dropshipping", "Dropshipping"); } },
  { value: "saas", get label() { return tr("SaaS / software", "SaaS / software"); } },
  { value: "infoproducts", get label() { return tr("Infoproductos y formación online", "Digital products & online courses"); } },
  { value: "education", get label() { return tr("Educación y academias", "Education & academies"); } },
  { value: "consulting", get label() { return tr("Consultoría y servicios profesionales", "Consulting & professional services"); } },
  { value: "coaching", get label() { return tr("Coaching y mentoría", "Coaching & mentoring"); } },
  { value: "subscriptions", get label() { return tr("Suscripciones y membresías", "Subscriptions & memberships"); } },
  { value: "affiliate", get label() { return tr("Afiliación y performance", "Affiliate & performance marketing"); } },
  { value: "media", get label() { return tr("Medios y contenido digital", "Media & digital content"); } },
  { value: "gaming", get label() { return tr("Videojuegos y gaming", "Video games & gaming"); } },
  { value: "igaming", get label() { return tr("Apuestas deportivas e iGaming", "Sports betting & iGaming"); } },
  { value: "crypto", get label() { return tr("Cripto y activos digitales", "Crypto & digital assets"); } },
  { value: "financial", get label() { return tr("Servicios financieros", "Financial services"); } },
  { value: "insurance", get label() { return tr("Seguros", "Insurance"); } },
  { value: "real-estate", get label() { return tr("Inmobiliaria", "Real estate"); } },
  { value: "travel", get label() { return tr("Viajes y turismo", "Travel & tourism"); } },
  { value: "hospitality", get label() { return tr("Hoteles y alojamiento", "Hotels & lodging"); } },
  { value: "restaurant", get label() { return tr("Restauración y bares", "Restaurants & bars"); } },
  { value: "health", get label() { return tr("Salud y clínicas", "Health & clinics"); } },
  { value: "wellness", get label() { return tr("Bienestar y terapias", "Wellness & therapies"); } },
  { value: "supplements", get label() { return tr("Suplementos y nutrición", "Supplements & nutrition"); } },
  { value: "beauty", get label() { return tr("Belleza y cosmética", "Beauty & cosmetics"); } },
  { value: "fashion", get label() { return tr("Moda y complementos", "Fashion & accessories"); } },
  { value: "jewelry", get label() { return tr("Joyería y relojería", "Jewelry & watches"); } },
  { value: "electronics", get label() { return tr("Electrónica y tecnología", "Electronics & technology"); } },
  { value: "home", get label() { return tr("Hogar, muebles y jardín", "Home, furniture & garden"); } },
  { value: "diy", get label() { return tr("Ferretería y bricolaje", "Hardware & DIY"); } },
  { value: "automotive", get label() { return tr("Automoción y recambios", "Automotive & parts"); } },
  { value: "sports", get label() { return tr("Deporte y outdoor", "Sports & outdoor"); } },
  { value: "pets", get label() { return tr("Mascotas", "Pets"); } },
  { value: "kids", get label() { return tr("Infancia y juguetes", "Kids & toys"); } },
  { value: "art", get label() { return tr("Arte, artesanía y coleccionismo", "Art, crafts & collectibles"); } },
  { value: "adult", get label() { return tr("Contenido para adultos", "Adult content"); } },
  { value: "logistics", get label() { return tr("Logística y transporte", "Logistics & transportation"); } },
  { value: "wholesale", get label() { return tr("Mayorista y distribución", "Wholesale & distribution"); } },
  { value: "manufacturing", get label() { return tr("Fabricación e industria", "Manufacturing & industry"); } },
  { value: "telecom", get label() { return tr("Telecomunicaciones", "Telecommunications"); } },
  { value: "utilities", get label() { return tr("Energía y suministros", "Energy & utilities"); } },
  { value: "nonprofit", get label() { return tr("ONG y entidades sin ánimo de lucro", "NGOs & non-profits"); } },
  { value: "events", get label() { return tr("Eventos y entradas", "Events & ticketing"); } },
  { value: "photography", get label() { return tr("Fotografía y vídeo", "Photography & video"); } },
  { value: "legal", get label() { return tr("Servicios legales", "Legal services"); } },
  { value: "construction", get label() { return tr("Construcción y reformas", "Construction & renovation"); } },
  { value: "agriculture", get label() { return tr("Agricultura y alimentación", "Agriculture & food"); } },
  { value: "other", get label() { return tr("Otro", "Other"); } },
];

export const idTypes: Option[] = [
  { value: "passport", get label() { return tr("Pasaporte", "Passport"); } },
  { value: "drivers-license", get label() { return tr("Carné de conducir", "Driver's license"); } },
  { value: "national-id", get label() { return tr("Documento nacional de identidad", "National ID card"); } },
  { value: "residence-permit", get label() { return tr("Permiso de residencia / trabajo", "Residence / work permit"); } },
];

export const processingMethods: { value: "cards" | "ach" | "both"; label: string; hint: string }[] = [
  { value: "cards", get label() { return tr("Tarjetas", "Cards"); }, get hint() { return tr("Visa, Mastercard, Amex", "Visa, Mastercard, Amex"); } },
  { value: "ach", get label() { return tr("ACH", "ACH"); }, get hint() { return tr("Transferencias bancarias", "Bank transfers"); } },
  { value: "both", get label() { return tr("Ambos", "Both"); }, get hint() { return tr("Tarjetas + ACH", "Cards + ACH"); } },
];

const regionNamesEn =
  typeof Intl !== "undefined" && "DisplayNames" in Intl
    ? new Intl.DisplayNames(["en"], { type: "region" })
    : null;

/** Nombre en español fijo; en inglés se toma de Intl. */
function country(code: string, es: string, dial: string) {
  return {
    code,
    dial,
    get label() {
      return getLang() === "en" ? (regionNamesEn?.of(code) ?? es) : es;
    },
  };
}

export const countries: { code: string; label: string; dial: string }[] = [
  country("US", "Estados Unidos", "+1"),
  country("ES", "España", "+34"),
  country("MX", "México", "+52"),
  country("CA", "Canadá", "+1"),
  country("GB", "Reino Unido", "+44"),
  country("IE", "Irlanda", "+353"),
  country("FR", "Francia", "+33"),
  country("DE", "Alemania", "+49"),
  country("IT", "Italia", "+39"),
  country("PT", "Portugal", "+351"),
  country("NL", "Países Bajos", "+31"),
  country("BE", "Bélgica", "+32"),
  country("CH", "Suiza", "+41"),
  country("AT", "Austria", "+43"),
  country("SE", "Suecia", "+46"),
  country("NO", "Noruega", "+47"),
  country("DK", "Dinamarca", "+45"),
  country("FI", "Finlandia", "+358"),
  country("PL", "Polonia", "+48"),
  country("RO", "Rumanía", "+40"),
  country("CZ", "Chequia", "+420"),
  country("GR", "Grecia", "+30"),
  country("TR", "Turquía", "+90"),
  country("IL", "Israel", "+972"),
  country("AE", "Emiratos Árabes Unidos", "+971"),
  country("SA", "Arabia Saudí", "+966"),
  country("QA", "Catar", "+974"),
  country("IN", "India", "+91"),
  country("PK", "Pakistán", "+92"),
  country("BD", "Bangladés", "+880"),
  country("CN", "China", "+86"),
  country("HK", "Hong Kong", "+852"),
  country("SG", "Singapur", "+65"),
  country("MY", "Malasia", "+60"),
  country("TH", "Tailandia", "+66"),
  country("VN", "Vietnam", "+84"),
  country("PH", "Filipinas", "+63"),
  country("ID", "Indonesia", "+62"),
  country("JP", "Japón", "+81"),
  country("KR", "Corea del Sur", "+82"),
  country("AU", "Australia", "+61"),
  country("NZ", "Nueva Zelanda", "+64"),
  country("ZA", "Sudáfrica", "+27"),
  country("NG", "Nigeria", "+234"),
  country("KE", "Kenia", "+254"),
  country("EG", "Egipto", "+20"),
  country("MA", "Marruecos", "+212"),
  country("AR", "Argentina", "+54"),
  country("CL", "Chile", "+56"),
  country("CO", "Colombia", "+57"),
  country("PE", "Perú", "+51"),
  country("BR", "Brasil", "+55"),
  country("UY", "Uruguay", "+598"),
  country("PY", "Paraguay", "+595"),
  country("BO", "Bolivia", "+591"),
  country("EC", "Ecuador", "+593"),
  country("PA", "Panamá", "+507"),
  country("CR", "Costa Rica", "+506"),
  country("DO", "República Dominicana", "+1809"),
  country("PR", "Puerto Rico", "+1787"),
  country("GT", "Guatemala", "+502"),
];

export const usStates: Option[] = [
  { value: "AL", label: "Alabama" },
  { value: "AK", label: "Alaska" },
  { value: "AZ", label: "Arizona" },
  { value: "AR", label: "Arkansas" },
  { value: "CA", label: "California" },
  { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" },
  { value: "DE", label: "Delaware" },
  { value: "DC", label: "District of Columbia" },
  { value: "FL", label: "Florida" },
  { value: "GA", label: "Georgia" },
  { value: "HI", label: "Hawaii" },
  { value: "ID", label: "Idaho" },
  { value: "IL", label: "Illinois" },
  { value: "IN", label: "Indiana" },
  { value: "IA", label: "Iowa" },
  { value: "KS", label: "Kansas" },
  { value: "KY", label: "Kentucky" },
  { value: "LA", label: "Louisiana" },
  { value: "ME", label: "Maine" },
  { value: "MD", label: "Maryland" },
  { value: "MA", label: "Massachusetts" },
  { value: "MI", label: "Michigan" },
  { value: "MN", label: "Minnesota" },
  { value: "MS", label: "Mississippi" },
  { value: "MO", label: "Missouri" },
  { value: "MT", label: "Montana" },
  { value: "NE", label: "Nebraska" },
  { value: "NV", label: "Nevada" },
  { value: "NH", label: "New Hampshire" },
  { value: "NJ", label: "New Jersey" },
  { value: "NM", label: "New Mexico" },
  { value: "NY", label: "New York" },
  { value: "NC", label: "North Carolina" },
  { value: "ND", label: "North Dakota" },
  { value: "OH", label: "Ohio" },
  { value: "OK", label: "Oklahoma" },
  { value: "OR", label: "Oregon" },
  { value: "PA", label: "Pennsylvania" },
  { value: "RI", label: "Rhode Island" },
  { value: "SC", label: "South Carolina" },
  { value: "SD", label: "South Dakota" },
  { value: "TN", label: "Tennessee" },
  { value: "TX", label: "Texas" },
  { value: "UT", label: "Utah" },
  { value: "VT", label: "Vermont" },
  { value: "VA", label: "Virginia" },
  { value: "WA", label: "Washington" },
  { value: "WV", label: "West Virginia" },
  { value: "WI", label: "Wisconsin" },
  { value: "WY", label: "Wyoming" },
];

export interface DocumentRequirement {
  id: string;
  label: string;
  hint: string;
  required: boolean;
  conditional?: string;
  multiple?: boolean;
}

export const documentRequirements: DocumentRequirement[] = [
  {
    id: "drivers_license",
    get label() { return tr("Carné de conducir", "Driver's license"); },
    get hint() { return tr("Del titular con el 25 % o más de propiedad. Anverso y reverso.", "Of each owner with 25% or more ownership. Front and back."); },
    required: true,
  },
  {
    id: "voided_check",
    get label() { return tr("Cheque anulado o carta del banco", "Voided check or bank letter"); },
    get hint() { return tr("Donde se vean el número de cuenta y el routing.", "Showing the account and routing numbers."); },
    required: true,
  },
  {
    id: "articles",
    get label() { return tr("Escritura de constitución", "Articles of incorporation"); },
    get hint() { return tr("Articles of Incorporation u operating agreement de la LLC.", "Articles of Incorporation or the LLC operating agreement."); },
    required: true,
  },
  {
    id: "bank_statement",
    get label() { return tr("Extracto bancario", "Bank statement"); },
    get hint() { return tr("Últimos 3 meses de la cuenta de liquidación.", "Last 3 months of the settlement account."); },
    required: true,
  },
  {
    id: "processing_statement",
    get label() { return tr("Extracto de procesamiento", "Processing statement"); },
    get hint() { return tr("Solo si ya procesas con otro proveedor. Últimos 3 meses.", "Only if you already process with another provider. Last 3 months."); },
    required: false,
    get conditional() { return tr("Solo si ya procesas tarjetas", "Only if you already process cards"); },
  },
  {
    id: "fulfillment",
    get label() { return tr("Acuerdo de fulfillment", "Fulfillment agreement"); },
    get hint() { return tr("Solo si un tercero gestiona el envío o el soporte.", "Only if a third party handles shipping or support."); },
    required: false,
    get conditional() { return tr("Solo si hay fulfillment externo", "Only with third-party fulfillment"); },
  },
  {
    id: "extra_processing",
    get label() { return tr("Extractos adicionales de procesamiento", "Additional processing statements"); },
    get hint() { return tr("Otros procesadores o cuentas que quieras declarar.", "Other processors or accounts you want to disclose."); },
    required: false,
    multiple: true,
  },
  {
    id: "extra_bank",
    get label() { return tr("Extractos adicionales de banco", "Additional bank statements"); },
    get hint() { return tr("Otras cuentas o divisas con las que operas.", "Other accounts or currencies you operate with."); },
    required: false,
    multiple: true,
  },
  {
    id: "other",
    get label() { return tr("Otros documentos", "Other documents"); },
    get hint() { return tr("Cualquier otro documento que apoye el expediente.", "Any other document that supports the application."); },
    required: false,
    multiple: true,
  },
];
