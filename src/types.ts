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
  phone?: string;
  avatar?: string;
}

export interface FAQItem {
  id?: string;
  question: string;
  answer: string;
}

export interface WorkingHoursDay {
  open: string;  // e.g. "08:00"
  close: string; // e.g. "17:00"
  isOpen: boolean;
  breakStart?: string;
  breakEnd?: string;
}

export interface CompanyOpeningHours {
  pn?: WorkingHoursDay;
  wt?: WorkingHoursDay;
  sr?: WorkingHoursDay;
  czw?: WorkingHoursDay;
  pt?: WorkingHoursDay;
  sb?: WorkingHoursDay;
  nd?: WorkingHoursDay;
  [day: string]: WorkingHoursDay | string | undefined;
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
  openingHours?: CompanyOpeningHours | Record<string, any>;
  visibilityPackage: 'free' | 'silver' | 'gold' | 'platinum';
  workingArea?: string;
  rating?: number;
  reviewCount?: number;
  updatedAt: string;
  
  // Enhanced company features
  foundedYear?: number;
  bookingEnabled?: boolean;
  bookingUrl?: string;
  languages?: string[];
  paymentMethods?: string[];
  amenities?: string[];
  faqs?: FAQItem[];
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  teamPhoto?: string;
  certificates?: string[];
  completenessScore?: number;
  responseRateMinutes?: number;
}

export interface Service {
  id: string;
  companyId: string;
  companyName: string;
  name: string;
  price: number;
  description: string;
  category: string;
  durationMin?: number;
  isActive?: boolean;
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
  promoCode?: string;
  isActive?: boolean;
  usageLimit?: number;
  usedCount?: number;
}

export interface Review {
  id: string;
  companyId: string;
  clientId: string;
  clientName: string;
  clientAvatar?: string;
  rating: number;
  comment: string;
  createdAt: string;
  reply?: string;
  replyCreatedAt?: string;
  images?: string[];
}

export interface Booking {
  id: string;
  companyId: string;
  companyName: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  serviceId: string;
  serviceName: string;
  servicePrice: number;
  serviceDurationMin: number;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  status: 'pending' | 'accepted' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  senderName: string;
  content: string;
  timestamp: string;
  read: boolean;
  imageUrl?: string;
}

export interface Conversation {
  id: string;
  participants: string[]; // [clientId, companyId]
  participantNames: Record<string, string>;
  lastMessage: string;
  lastMessageTimestamp: string;
  unreadCount: Record<string, number>;
  updatedAt: string;
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
  userId?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  content: string;
  read: boolean;
  createdAt: string;
  type: 'message' | 'review' | 'booking' | 'promotion' | 'ad_expiry' | 'system';
  linkId?: string;
}

export interface Statistics {
  companyId: string;
  views: number;
  searches: number;
  clicks: number;
  phones: number;
  messages: number;
  webClicks: number;
  bookingsCount?: number;
}

export interface FavoriteCompany {
  id: string;
  userId: string;
  companyId: string;
  companyName: string;
  category?: string;
  city?: string;
  rating?: number;
  logo?: string;
  createdAt: string;
}

export interface UserHistoryItem {
  id: string;
  userId: string;
  type: 'company_view' | 'search';
  targetId?: string;
  title: string;
  subtitle?: string;
  timestamp: string;
}
