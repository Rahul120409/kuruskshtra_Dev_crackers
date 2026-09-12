// Data Models strictly mirroring SalonFlow AI LLD Section 6, 7 & 8

export type UserRole = 'CUSTOMER' | 'STAFF' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  dob?: string;
  gender?: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  profileImage?: string;
  preferredArea?: string;
  hairNotes?: string;
  createdAt?: string;
}

export interface Salon {
  id: string;
  name: string;
  address: string;
  area?: string;
  city?: string;
  phone: string;
  phoneNumber?: string;
  email?: string;
  ownerName?: string;
  pincode?: string;
  description?: string;
  salonDescription?: string;
  locationLink?: string;
  rating?: number;
  reviewCount?: number;
  currentWaitMinutes?: number;
  totalWaiting?: number;
  currentServingTokenNumber?: number | null;
  nextAvailableTokenNumber?: number;
  imageUrl?: string;
  openingTime: string;
  closingTime: string;
  status: 'OPEN' | 'CLOSED' | 'BUSY' | 'ACTIVE';
  createdAt?: string;
  distanceKm?: number;
}

export interface SalonStaff {
  id: string;
  userId?: string;
  name: string;
  salonId: string;
  specialization: string;
  status: 'AVAILABLE' | 'BUSY' | 'BREAK' | 'OFFLINE';
  avatarUrl?: string;
  rating?: number;
}

export interface SalonService {
  id: string;
  salonId: string;
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
  category: 'Haircuts' | 'Beard & Shave' | 'Color & Styling' | 'Spa & Treatments';
  imageUrl: string;
  isActive: boolean;
}

export interface Hairstyle {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  category: string;
  suitableFaceShapes: string[];
  suitableHairTypes: string[];
  mappedServiceId?: string;
}

export interface AIRecommendationItem {
  hairstyleId: string;
  name: string;
  matchScore: number;
  reason: string;
  imageUrl: string;
  mappedServiceId?: string;
}

export interface AIAnalysisResult {
  faceShape: 'Oval' | 'Square' | 'Round' | 'Heart' | 'Diamond' | 'Oblong';
  hairType: 'Straight' | 'Wavy' | 'Curly' | 'Coily';
  hairDensity: 'Fine' | 'Medium' | 'Thick';
  recommendations: AIRecommendationItem[];
  analyzedAt?: string;
}

export type QueueStatus = 'WAITING' | 'CALLED' | 'IN_SERVICE' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

export interface QueueToken {
  tokenId: string;
  tokenNumber: number;
  position: number;
  estimatedWait: number; // in minutes
  status: QueueStatus;
  salonId: string;
  salonName?: string;
  customerId: string;
  serviceId: string;
  serviceName?: string;
  servicePrice?: number;
  staffId?: string;
  staffName?: string;
  appointmentId?: string;
  queueDate: string;
  createdAt: string;
  stationNumber?: number;
  selectedHairstyleId?: string;
  selectedHairstyleName?: string;
}

export interface Appointment {
  id: string;
  customerId: string;
  customerName?: string;
  customerPhone?: string;
  salonId: string;
  salonName?: string;
  salonAddress?: string;
  salonArea?: string;
  serviceId: string;
  serviceName?: string;
  servicePrice?: number;
  serviceDuration?: number;
  staffId?: string;
  staffName?: string;
  staffAvatar?: string;
  appointmentDate: string;
  appointmentTime: string;
  status: 'CONFIRMED' | 'CHECKED_IN' | 'COMPLETED' | 'CANCELLED';
  source: 'ONLINE' | 'WALK_IN';
  bookingType?: 'WALK_IN' | 'SCHEDULED';
  tokenNumber?: number;
  paymentMethod?: string;
  paymentStatus?: 'PAID' | 'PENDING_AT_COUNTER';
  rating?: number;
  feedback?: string;
  lateTimestamp?: string;
  cancellationFee?: number;
  createdAt: string;
}

export type NotificationType = 
  | 'BOOKING_CONFIRMED' 
  | 'POSITION_UPDATE' 
  | 'TURN_APPROACHING' 
  | 'TURN_CALLED' 
  | 'COMPLETED';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
}

export interface Feedback {
  id?: string;
  customerId: string;
  appointmentId?: string;
  tokenId?: string;
  rating: number; // 1 to 5
  waitingRating: number; // 1 to 5
  serviceRating: number; // 1 to 5
  comment: string;
  tags?: string[];
  createdAt?: string;
}

export interface QueueLiveOverview {
  salonId: string;
  salonName: string;
  isOpen: boolean;
  totalWaiting: number;
  servingTokenNumber?: number;
  averageWaitMinutes: number;
  availableStaffCount: number;
}
