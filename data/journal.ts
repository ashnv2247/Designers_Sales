export interface JournalArticle {
  id: string;
  title: string;
  category: string;
  readTime: string;
  date: string;
  author: string;
  excerpt: string;
  image: string;
  content?: string;
  published?: boolean;
}

export const JOURNAL_ARTICLES: JournalArticle[] = [
  {
    id: "gertrude-street-guide",
    title: "The Architecture of Gertrude Street: How One Strip Defined Melbourne Retail",
    category: "RETAIL CULTURE",
    readTime: "6 MIN READ",
    date: "OCTOBER 2026",
    author: "ELENA ROCHE",
    excerpt: "From historic Victorian shopfronts to minimalist Japanese-inspired interiors, exploring the tactile aesthetic that turned Fitzroy into Australia's design epicenter.",
    image: "/images/generated/melbourne-laneway.jpg",
    content: `No thoroughfare in Australia embodies the quiet synthesis of heritage architecture and contemporary retail intimacy like Fitzroy's Gertrude Street.\n\nOnce a working-class corridor of bootmakers and dry-goods merchants, its intact 1880s Victorian bluestone terraces now house some of the most exacting design studios in the Southern Hemisphere.\n\nThe tactile dialogue between rough bluestone, polished concrete, and unlacquered brass creates a distinct spatial language that invites slow exploration rather than rapid commercial consumption.`,
    published: true,
  },
  {
    id: "sydney-archival-vintage",
    title: "In Search of Archival Fashion: A Curator's Guide to Surry Hills and Paddington",
    category: "VINTAGE & ARCHIVAL",
    readTime: "8 MIN READ",
    date: "SEPTEMBER 2026",
    author: "MARCUS CHEN",
    excerpt: "Private showrooms, hidden back-alleys, and appointments-only archives where collectors source rare 90s tailoring and Japanese avant-garde pieces.",
    image: "/images/explore/explore-handbag.jpg",
    content: `Across Sydney's leafy sandstone enclaves of Surry Hills and Paddington, an underground network of appointment-only fashion archives is redefining luxury.\n\nHere, the emphasis is not on current seasonal churn, but on museum-grade preservation: Issey Miyake Pleats Please from 1994, Helmut Lang unconstructed tailoring, and early Rei Kawakubo sculptural silhouettes.`,
    published: true,
  },
  {
    id: "australian-ceramics-revival",
    title: "Tactile Earth: Inside the Studios of Australia's Most Celebrated Potters",
    category: "CRAFT & DESIGN",
    readTime: "5 MIN READ",
    date: "SEPTEMBER 2026",
    author: "SOPHIE VANCE",
    excerpt: "Why the country's most discerning boutique owners are championing small-batch ceramicists who work with native clays and wood-fired kilns.",
    image: "/images/discoveries/keep.jpg",
    content: `Australian boutique proprietors are increasingly eschewing mass-manufactured homewares in favor of small-batch ceramicists working with native iron-rich clays.\n\nFrom wood-fired anagama kilns in the Victorian goldfields to light-drenched studios in Byron Bay hinterland, these vessels celebrate intentional imperfection, tactile slips, and natural ash glazes.`,
    published: true,
  },
];
