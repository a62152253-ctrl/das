import { getFirebaseDb } from './firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Company, Service, Ad, Promotion } from '../types';
import { calculateScore, SearchResultItem } from './RankingEngine';
import { analyzeSearchQuery } from './AISearchEngine';

const defaultCompany: Company = {
  uid: '',
  companyName: 'Brak nazwy firmy',
  nip: '',
  description: '',
  address: '',
  city: '',
  postalCode: '',
  phone: '',
  email: '',
  services: '',
  visibilityPackage: 'free',
  rating: 0,
  reviewCount: 0,
  lat: 52.5360,
  lng: 17.5950,
  updatedAt: new Date().toISOString()
};

// Memory Cache to prevent redundant Firestore calls within short intervals
interface SearchCache {
  companies: Company[];
  services: Service[];
  ads: Ad[];
  promotions: Promotion[];
  timestamp: number;
}

let cache: SearchCache | null = null;
const CACHE_TTL_MS = 15000; // Cache duration: 15 seconds

// Levenshtein Distance implementation for typo tolerance
function getLevenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

// Check if two words are a fuzzy match (typo tolerant)
function isFuzzyMatch(word1: string, word2: string): boolean {
  if (word1.length < 3 || word2.length < 3) return word1 === word2;
  const maxDistance = Math.floor(word1.length * 0.25); // Allow ~25% typo rate
  return getLevenshteinDistance(word1, word2) <= maxDistance;
}

// Polish diacritics normalizer helper
function normalizeText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ł/g, "l")
    .replace(/Ł/g, "l")
    .trim();
}

// Synonyms mapping for query expansion
const SYNONYMS: Record<string, string[]> = {
  fryzjer: ['barber', 'strzyzenie', 'wlosy', 'salon', 'fryzjerski', 'czesanie', 'fryzura'],
  barber: ['fryzjer', 'strzyzenie', 'broda', 'fade', 'meskie', 'wlosy'],
  mechanik: ['auto', 'samochod', 'rozrzad', 'warsztat', 'opony', 'serwis', 'naprawa', 'silnik', 'bmw'],
  hydraulik: ['rury', 'cieknie', 'zlew', 'awaria', 'wod-kan', 'uslugi domowe', 'pogotowie'],
  pizza: ['jedzenie', 'pizzeria', 'obiad', 'restauracja', 'wloska', 'dostawa'],
  remont: ['malowanie', 'wykonczenia', 'budowlane', 'plytki', 'sciany', 'mieszkanie']
};

// Fetch data either from memory cache or Firestore database
export async function fetchSearchData(): Promise<{ companies: Company[]; services: Service[]; ads: Ad[]; promotions: Promotion[] }> {
  const now = Date.now();
  if (cache && now - cache.timestamp < CACHE_TTL_MS) {
    return cache;
  }

  const companies: Company[] = [];
  const services: Service[] = [];
  const ads: Ad[] = [];
  const promotions: Promotion[] = [];

  try {
    const db = await getFirebaseDb();
    
    // Concurrently fetch all Firestore collections to maximize performance
    const [compSnap, servSnap, adsSnap, promSnap] = await Promise.all([
      getDocs(collection(db, 'companies')),
      getDocs(collection(db, 'services')),
      getDocs(collection(db, 'ads')),
      getDocs(collection(db, 'promotions'))
    ]);

    compSnap.forEach(doc => {
      companies.push({ uid: doc.id, ...doc.data() } as Company);
    });

    servSnap.forEach(doc => {
      services.push({ id: doc.id, ...doc.data() } as Service);
    });

    adsSnap.forEach(doc => {
      ads.push({ id: doc.id, ...doc.data() } as Ad);
    });

    promSnap.forEach(doc => {
      promotions.push({ id: doc.id, ...doc.data() } as Promotion);
    });

    // Update in-memory cache
    cache = { companies, services, ads, promotions, timestamp: now };
  } catch (error) {
    console.error("Could not read Firestore collections:", error);
  }

  return { companies, services, ads, promotions };
}

export async function searchAll(
  queryText: string,
  userLocation?: { lat: number; lng: number }
): Promise<SearchResultItem[]> {
  const { companies, services, ads, promotions } = await fetchSearchData();

  // Index companies by UID for O(1) parent lookups
  const companyMap = new Map<string, Company>();
  companies.forEach(c => companyMap.set(c.uid, c));

  const results: SearchResultItem[] = [];
  
  // SEMANTIC AI ANALYSIS
  const semanticQuery = analyzeSearchQuery(queryText);
  const normalizedQuery = normalizeText(semanticQuery.cleanQuery);

  // Query Expansion: find related synonym terms
  const searchTerms = [normalizedQuery];
  if (normalizedQuery) {
    Object.entries(SYNONYMS).forEach(([key, synonyms]) => {
      if (normalizedQuery.includes(key) || synonyms.some(syn => normalizedQuery.includes(syn))) {
        searchTerms.push(key, ...synonyms);
      }
    });
  }
  const uniqueTerms = Array.from(new Set(searchTerms.filter(Boolean)));

  // Helper to verify matching with normalized terms and typo tolerance
  const isMatch = (title: string, desc: string, servicesStr = '', companyName = ''): boolean => {
    if (!normalizedQuery) return true;
    const targetNormalized = normalizeText(`${title} ${desc} ${servicesStr} ${companyName}`);
    
    // Check direct inclusion of terms/synonyms
    const directHit = uniqueTerms.some(term => targetNormalized.includes(term));
    if (directHit) return true;

    // Check fuzzy match (split targets into words to tolerate typos)
    const targetWords = targetNormalized.split(/\s+/);
    const queryWords = normalizedQuery.split(/\s+/);
    return queryWords.every(qWord => 
      targetWords.some(tWord => isFuzzyMatch(qWord, tWord))
    );
  };

  // Match companies
  companies.forEach(company => {
    if (!isMatch(company.companyName, company.description, company.services)) return;

    const calculation = calculateScore(queryText, 'company', company.companyName, company.description, company, userLocation, semanticQuery);
    if (queryText.trim() && calculation.score < 25) return;

    results.push({
      id: company.uid,
      type: 'company',
      title: company.companyName,
      description: company.description,
      badgeText: '🏢 Wizytówka firmy',
      distance: calculation.distance,
      score: calculation.score,
      rating: company.rating || 0,
      reviewCount: company.reviewCount || 0,
      companyId: company.uid,
      companyName: company.companyName,
      city: company.city,
      address: company.address,
      isSponsored: company.visibilityPackage === 'platinum' || company.visibilityPackage === 'gold',
      item: company
    });
  });

  // Match services
  services.forEach(service => {
    const parentCompany = companyMap.get(service.companyId) || defaultCompany;
    if (!isMatch(service.name, service.description, '', parentCompany.companyName)) return;

    const calculation = calculateScore(queryText, 'service', service.name, service.description, parentCompany, userLocation, semanticQuery);
    if (queryText.trim() && calculation.score < 25) return;

    results.push({
      id: service.id,
      type: 'service',
      title: service.name,
      description: service.description,
      badgeText: '✂ Usługa',
      price: service.price,
      distance: calculation.distance,
      score: calculation.score,
      rating: parentCompany.rating || 0,
      reviewCount: parentCompany.reviewCount || 0,
      companyId: service.companyId,
      companyName: service.companyName || parentCompany.companyName,
      city: parentCompany.city,
      address: parentCompany.address,
      isSponsored: parentCompany.visibilityPackage === 'platinum',
      item: service
    });
  });

  // Match ads
  ads.forEach(ad => {
    // Filter out inactive ads
    if (ad.status && ad.status !== 'active') return;

    const parentCompany = companyMap.get(ad.companyId) || defaultCompany;
    if (!isMatch(ad.title, ad.description, '', parentCompany.companyName)) return;

    const calculation = calculateScore(queryText, 'ad', ad.title, ad.description, parentCompany, userLocation, semanticQuery);
    if (queryText.trim() && calculation.score < 25) return;

    results.push({
      id: ad.id,
      type: 'ad',
      title: ad.title,
      description: ad.description,
      badgeText: '📢 Ogłoszenie',
      price: ad.price,
      distance: calculation.distance,
      score: calculation.score,
      rating: parentCompany.rating || 0,
      reviewCount: parentCompany.reviewCount || 0,
      companyId: ad.companyId,
      companyName: ad.companyName || parentCompany.companyName,
      city: ad.city || parentCompany.city,
      address: parentCompany.address,
      isSponsored: parentCompany.visibilityPackage === 'platinum',
      item: ad
    });
  });

  // Match promotions
  promotions.forEach(promotion => {
    // Filter out expired promotions
    if (promotion.expiresAt && new Date(promotion.expiresAt) < new Date()) return;

    const parentCompany = companyMap.get(promotion.companyId) || defaultCompany;
    if (!isMatch(promotion.title, promotion.description, '', parentCompany.companyName)) return;

    const calculation = calculateScore(queryText, 'promotion', promotion.title, promotion.description, parentCompany, userLocation, semanticQuery);
    if (queryText.trim() && calculation.score < 25) return;

    results.push({
      id: promotion.id,
      type: 'promotion',
      title: promotion.title,
      description: promotion.description,
      badgeText: '🏷 Promocja',
      discount: promotion.discountValue,
      distance: calculation.distance,
      score: calculation.score,
      rating: parentCompany.rating || 0,
      reviewCount: parentCompany.reviewCount || 0,
      companyId: promotion.companyId,
      companyName: promotion.companyName || parentCompany.companyName,
      city: parentCompany.city,
      address: parentCompany.address,
      isSponsored: parentCompany.visibilityPackage === 'platinum',
      item: promotion
    });
  });

  // Sort by final calculated score desc
  return results.sort((a, b) => b.score - a.score);
}

// Generate autocomplete search suggestions dynamically
export async function getSuggestions(queryText: string): Promise<string[]> {
  const normalized = normalizeText(queryText);
  if (!normalized || normalized.length < 2) return [];

  const { companies, services, ads } = await fetchSearchData();
  const suggestionsSet = new Set<string>();

  // Extract titles and names that match current input
  companies.forEach(c => {
    if (normalizeText(c.companyName).includes(normalized)) {
      suggestionsSet.add(c.companyName);
    }
  });

  services.forEach(s => {
    if (normalizeText(s.name).includes(normalized)) {
      suggestionsSet.add(s.name);
    }
  });

  ads.forEach(a => {
    if (normalizeText(a.title).includes(normalized)) {
      suggestionsSet.add(a.title);
    }
  });

  return Array.from(suggestionsSet).slice(0, 5); // Return top 5 suggestions
}
