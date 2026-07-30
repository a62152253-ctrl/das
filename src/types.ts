export type AuthView = 
  | 'login' 
  | 'register' 
  | 'forgot-password' 
  | 'create-company-profile'
  | 'home'
  | 'search'
  | 'company-profile'
  | 'dashboard-client'
  | 'dashboard-company'
  | 'dashboard-admin';

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: 'client' | 'firma' | 'admin';
  createdAt: string;
  location?: {
    lat: number;
    lng: number;
    city: string;
  };
}

export interface Company {
  uid: string; // matches user.uid
  companyName: string;
  nip: string;
  description: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
  email: string;
  website?: string;
  socialLinks?: string;
  services: string; // comma separated initial services or text representation
  logo?: string;
  mainPhoto?: string;
  gallery?: string[];
  lat: number;
  lng: number;
  openingHours?: {
    [day: string]: string; // e.g. "08:00 - 16:00"
  };
  visibilityPackage: 'free' | 'silver' | 'gold' | 'platinum';
  workingArea?: string;
  rating?: number;
  reviewCount?: number;
  updatedAt: string;
}

export interface Service {
  id: string;
  companyId: string;
  companyName: string;
  name: string;
  price: number;
  description: string;
  category: string;
}

export interface Ad {
  id: string;
  companyId: string;
  companyName: string;
  title: string;
  description: string;
  price?: number;
  city: string;
  createdAt: string;
  status: 'active' | 'archived';
  views: number;
  category: string;
  imageUrl?: string;
}

export interface Promotion {
  id: string;
  companyId: string;
  companyName: string;
  title: string;
  description: string;
  discountValue: string; // e.g. "-20%" or "50 zł taniej"
  expiresAt: string;
  imageUrl?: string;
}

export interface Review {
  id: string;
  companyId: string;
  clientId: string;
  clientName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  senderName: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface SavedSearch {
  id: string;
  userId: string;
  query: string;
  filters?: any;
  createdAt: string;
}

export interface SearchLog {
  id: string;
  query: string;
  city: string;
  timestamp: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  content: string;
  read: boolean;
  createdAt: string;
  type: 'message' | 'review' | 'promotion' | 'ad_expiry' | 'system';
}

export interface Statistics {
  companyId: string;
  views: number;
  searches: number;
  clicks: number;
  phones: number;
  messages: number;
  webClicks: number;
}
