import { Company } from '../types';
import { ParsedQuery } from './AISearchEngine';

export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export interface SearchResultItem {
  id: string;
  type: 'company' | 'service' | 'ad' | 'promotion';
  title: string;
  description: string;
  badgeText: string;
  price?: number;
  discount?: string;
  distance?: number; // in km
  score: number;
  rating: number;
  reviewCount: number;
  companyId: string;
  companyName: string;
  city: string;
  address: string;
  isSponsored: boolean;
  item: any; // original object
}

export function calculateProfileCompleteness(company: Company): number {
  let score = 0;
  const fields: (keyof Company)[] = [
    'logo', 'mainPhoto', 'website', 'socialLinks', 
    'phone', 'email', 'description', 'openingHours'
  ];
  
  fields.forEach(field => {
    if (company[field]) {
      score += 1;
    }
  });

  return (score / fields.length) * 15; // Max 15 points
}

export function calculateScore(
  query: string,
  itemType: 'company' | 'service' | 'ad' | 'promotion',
  title: string,
  description: string,
  company: Company,
  userLocation?: { lat: number; lng: number },
  semanticQuery?: ParsedQuery
): { score: number; distance?: number } {
  let score = 0;

  // 1. Text Relevance (Max 40 points)
  const normQuery = query.toLowerCase().trim();
  const normTitle = title.toLowerCase();
  const normDesc = description.toLowerCase();
  const normServices = (company.services || '').toLowerCase();
  const normCompanyName = company.companyName.toLowerCase();

  if (normQuery) {
    if (normTitle.includes(normQuery) || normCompanyName.includes(normQuery)) {
      score += 40;
    } else if (normServices.includes(normQuery)) {
      score += 30;
    } else if (normDesc.includes(normQuery)) {
      score += 20;
    } else {
      // Partial match
      const words = normQuery.split(/\s+/);
      let matches = 0;
      words.forEach(w => {
        if (normTitle.includes(w) || normDesc.includes(w) || normServices.includes(w)) {
          matches++;
        }
      });
      score += Math.min(20, (matches / words.length) * 20);
    }
  } else {
    // Empty query (browsing mode) - default full relevance score
    score += 30;
  }

  // 1.5 Semantic AI Matching (Max 25 points bonus)
  if (semanticQuery) {
    if (semanticQuery.category && normServices.includes(semanticQuery.category.toLowerCase())) {
      score += 15; // Duży bonus za trafienie w intencję kategorii
    }
    if (semanticQuery.location && (company.city.toLowerCase() === semanticQuery.location.toLowerCase() || company.address.toLowerCase().includes(semanticQuery.location.toLowerCase()))) {
      score += 10; // Bonus za rozpoznaną lokalizację
    }
  }

  // 2. Geolocation (Max 20 points)
  let distance: number | undefined;
  if (userLocation && company.lat && company.lng) {
    distance = calculateDistance(userLocation.lat, userLocation.lng, company.lat, company.lng);
    if (distance <= 2) {
      score += 20;
    } else if (distance <= 5) {
      score += 15;
    } else if (distance <= 10) {
      score += 10;
    } else if (distance <= 25) {
      score += 5;
    } else {
      score += 1;
    }
  } else {
    score += 10; // Default mid points when location is unknown
  }

  // 3. Profile Completeness (Max 15 points)
  score += calculateProfileCompleteness(company);

  // 4. Freshness (Max 10 points)
  // Check company updatedAt
  const lastUpdated = new Date(company.updatedAt || Date.now());
  const diffDays = Math.floor((Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays <= 7) {
    score += 10;
  } else if (diffDays <= 30) {
    score += 7;
  } else if (diffDays <= 90) {
    score += 4;
  } else {
    score += 1;
  }

  // 5. Customer Reviews (Max 10 points)
  const rating = company.rating || 0;
  score += (rating / 5) * 10;

  // 6. Visibility Package (Max 15 points)
  switch (company.visibilityPackage) {
    case 'platinum':
      score += 15;
      break;
    case 'gold':
      score += 10;
      break;
    case 'silver':
      score += 5;
      break;
    default:
      score += 0;
  }

  return { score: Math.round(score), distance };
}
