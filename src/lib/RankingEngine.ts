import { Company } from '@/types';
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
  let totalPossible = 0;

  // Essential fields (1 point each)
  const essentialFields: (keyof Company)[] = [
    'logo', 'mainPhoto', 'website', 'phone', 'email', 'description'
  ];
  essentialFields.forEach(field => {
    totalPossible += 1;
    if (company[field]) {
      score += 1;
    }
  });

  // Opening hours check (1 point)
  totalPossible += 1;
  if (company.openingHours && Object.keys(company.openingHours).length > 0) {
    score += 1;
  }

  // Social media check (0.5 points per active network, max 1.5)
  totalPossible += 1.5;
  if (company.facebook) score += 0.5;
  if (company.instagram) score += 0.5;
  if (company.tiktok) score += 0.5;

  // Team photo (1 point)
  totalPossible += 1;
  if (company.teamPhoto) score += 1;

  // Year founded (0.5 points)
  totalPossible += 0.5;
  if (company.foundedYear) score += 0.5;

  // Payment methods (0.5 points)
  totalPossible += 0.5;
  if (company.paymentMethods && company.paymentMethods.length > 0) {
    score += 0.5;
  }

  // Amenities (0.5 points)
  totalPossible += 0.5;
  if (company.amenities && company.amenities.length > 0) {
    score += 0.5;
  }

  // FAQs (0.5 points)
  totalPossible += 0.5;
  if (company.faqs && company.faqs.length > 0) {
    score += 0.5;
  }

  // Booking details (1 point)
  totalPossible += 1;
  if (company.bookingEnabled && company.bookingUrl) {
    score += 1;
  }

  // Certificates list (1 point)
  totalPossible += 1;
  if (company.certificates && company.certificates.length > 0) {
    score += 1;
  }

  return (score / totalPossible) * 20; // Scale to max 20 points
}

function calculateTextRelevance(query: string, title: string, description: string, company: Company): number {
  const normQuery = query.toLowerCase().trim();
  if (!normQuery) {
    return 30; // Empty query relevance
  }
  const normTitle = title.toLowerCase();
  const normDesc = description.toLowerCase();
  const normServices = (company.services || '').toLowerCase();
  const normCompanyName = company.companyName.toLowerCase();

  if (normTitle.includes(normQuery) || normCompanyName.includes(normQuery)) {
    return 40;
  }
  if (normServices.includes(normQuery)) {
    return 30;
  }
  if (normDesc.includes(normQuery)) {
    return 20;
  }

  // Partial word match
  const words = normQuery.split(/\s+/);
  let matches = 0;
  words.forEach(w => {
    if (normTitle.includes(w) || normDesc.includes(w) || normServices.includes(w)) {
      matches++;
    }
  });
  return Math.min(20, (matches / words.length) * 20);
}

function calculateSemanticBonus(company: Company, semanticQuery?: ParsedQuery): number {
  if (!semanticQuery) return 0;
  let score = 0;
  const normServices = (company.services || '').toLowerCase();
  if (semanticQuery.category && normServices.includes(semanticQuery.category.toLowerCase())) {
    score += 15;
  }
  if (semanticQuery.location && (
    company.city.toLowerCase() === semanticQuery.location.toLowerCase() || 
    company.address.toLowerCase().includes(semanticQuery.location.toLowerCase())
  )) {
    score += 10;
  }
  return score;
}

function calculateGeoScore(company: Company, userLocation?: { lat: number; lng: number }): { score: number; distance?: number } {
  if (!userLocation || !company.lat || !company.lng) {
    return { score: 10 }; // Default mid points when location is unknown
  }
  const distance = calculateDistance(userLocation.lat, userLocation.lng, company.lat, company.lng);
  let score = 1;
  if (distance <= 2) {
    score = 20;
  } else if (distance <= 5) {
    score = 15;
  } else if (distance <= 10) {
    score = 10;
  } else if (distance <= 25) {
    score = 5;
  }
  return { score, distance };
}

function calculateFreshnessScore(updatedAt?: string): number {
  const lastUpdated = new Date(updatedAt || Date.now());
  const diffDays = Math.floor((Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays <= 7) {
    return 10;
  }
  if (diffDays <= 30) {
    return 7;
  }
  if (diffDays <= 90) {
    return 4;
  }
  return 1;
}

function calculateVisibilityBonus(visibilityPackage?: string): number {
  switch (visibilityPackage) {
    case 'platinum':
      return 500; // Guaranteed #1 Top Spot Boost
    case 'gold':
      return 150; // Top 3 Placement Boost
    case 'silver':
      return 50;  // Priority Rank Boost
    default:
      return 0;
  }
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

  score += calculateTextRelevance(query, title, description, company);
  score += calculateSemanticBonus(company, semanticQuery);

  const geo = calculateGeoScore(company, userLocation);
  score += geo.score;

  score += calculateProfileCompleteness(company);
  score += calculateFreshnessScore(company.updatedAt);
  score += ((company.rating || 0) / 5) * 10;
  score += calculateVisibilityBonus(company.visibilityPackage);

  // Bonus for professional certifications (credibility boost)
  if (company.certificates && company.certificates.length > 0) {
    score += 15;
  }

  // Bonus for enabling online bookings directly
  if (company.bookingEnabled && company.bookingUrl) {
    score += 10;
  }

  return { score: Math.round(score), distance: geo.distance };
}
