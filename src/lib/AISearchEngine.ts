/**
 * Wewnętrzny Silnik Wyszukiwania Semantycznego bez zewnętrznych API.
 * Opiera się na słownikach synonimów, analizie słów kluczowych i pattern matching.
 */

export interface ParsedQuery {
  category: string | null;
  location: string | null;
  isUrgent: boolean;
  cleanQuery: string; // Reszta tekstu do zwykłego full-text search
}

// Baza wiedzy (Knowledge Base) dla kategorii
const CATEGORY_MAP: Record<string, string[]> = {
  'Uroda i Styl': ['fryzjer', 'kosmetyczka', 'paznokcie', 'barber', 'strzyżenie', 'makijaż', 'uroda', 'włosy', 'broda', 'koloryzacja', 'salon'],
  'Motoryzacja': ['mechanik', 'opony', 'wulkanizacja', 'auto', 'samochód', 'lakiernik', 'blacharz', 'przegląd', 'klimatyzacja', 'warsztat', 'holowanie', 'pomoc drogowa'],
  'Usługi domowe': ['hydraulik', 'kran', 'rury', 'prąd', 'elektryk', 'remont', 'sprzątanie', 'malowanie', 'budowa', 'naprawa', 'awaria', 'złota rączka', 'meble', 'montaż'],
  'Gastronomia': ['pizza', 'jedzenie', 'restauracja', 'kebab', 'obiad', 'burger', 'sushi', 'dostawa', 'catering', 'kawiarnia', 'obiady'],
  'Medycyna': ['lekarz', 'dentysta', 'stomatolog', 'fizjoterapia', 'masaż', 'ból', 'przychodnia', 'apteka', 'ortopeda', 'okulista', 'psycholog'],
  'Nieruchomości': ['mieszkanie', 'dom', 'działka', 'wynajem', 'sprzedaż', 'agent', 'pośrednik', 'biuro nieruchomości']
};

// Heurystyki dla czasu
const URGENCY_KEYWORDS = ['zaraz', 'szybko', 'pilne', 'na już', 'dzisiaj', 'teraz', 'awaria', 'pomocy', 'natychmiast'];

// Prosty parser lokalizacji (w wersji prod baza miast)
const KNOWN_CITIES = ['gniezno', 'poznan', 'warszawa', 'krakow', 'wroclaw', 'gdansk', 'centrum', 'okolica'];

export function analyzeSearchQuery(rawQuery: string): ParsedQuery {
  const query = rawQuery.toLowerCase().trim();
  
  let detectedCategory: string | null = null;
  let detectedLocation: string | null = null;
  let isUrgent = false;

  const words = query.split(/\s+/);

  // 1. Wykrywanie intencji / Kategori
  for (const word of words) {
    if (detectedCategory) break;
    
    for (const [categoryName, keywords] of Object.entries(CATEGORY_MAP)) {
      if (keywords.some(k => word.includes(k) || k.includes(word))) {
        detectedCategory = categoryName;
        break;
      }
    }
  }

  // 2. Wykrywanie pilności
  if (URGENCY_KEYWORDS.some(k => query.includes(k))) {
    isUrgent = true;
  }

  // 3. Wykrywanie lokalizacji
  for (const city of KNOWN_CITIES) {
    if (query.includes(city) || query.includes(city.slice(0, -1))) {
      detectedLocation = city === 'centrum' || city === 'okolica' ? 'Gniezno' : city.charAt(0).toUpperCase() + city.slice(1);
      break;
    }
  }

  return {
    category: detectedCategory,
    location: detectedLocation,
    isUrgent,
    cleanQuery: query
  };
}
