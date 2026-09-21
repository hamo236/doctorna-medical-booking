export type SpecialtyId = 
  | 'internal' 
  | 'dermatology' 
  | 'dentistry' 
  | 'pediatrics' 
  | 'orthopedics' 
  | 'ent' 
  | 'cardiology' 
  | 'gynecology' 
  | 'neurology' 
  | 'ophthalmology';

export type UserRole = 'patient' | 'doctor' | 'admin';

export interface ClinicPhotoItem {
  id: string;
  url: string;
  title: string;
  caption?: string;
  tag: 'reception' | 'examination' | 'equipment' | 'sterilization';
  tagLabel: string;
}

export interface QualityMetrics {
  punctualityRate: number; // e.g., 96 (%)
  diagnosisClarity: number; // e.g., 4.9 (out of 5)
  sanitationScore: number; // e.g., 100 (%)
  recommendationRate: number; // e.g., 98 (%)
  avgWaitingMinutes?: number; // e.g., 15
  verifiedPatientsCount?: number; // e.g., 280
  patientSentiments?: {
    tag: string;
    text: string;
    percentage: number;
  }[];
}

export interface Doctor {
  id: string;
  name: string;
  title: 'أستاذ دكتور' | 'استشاري' | 'أخصائي أول' | 'أستاذ دكتور استشاري' | 'استشاري أول' | 'أخصائي استشاري';
  specialty: string;
  specialtyId: SpecialtyId;
  subSpecialties: string[];
  gender: 'male' | 'female';
  rating: number;
  reviewsCount: number;
  city: string;
  area: string;
  address: string;
  landmark: string;
  waitingTime: string;
  phone: string;
  bio: string;
  degrees: string[];
  services: { name: string }[];
  avatarUrl: string;
  verified: boolean;
  status?: 'active' | 'pending' | 'suspended';
  facilityType?: 'private_clinic' | 'polyclinic' | 'hospital';
  licenseNo?: string;
  acceptedInsurances?: string[];
  clinicPhotos?: ClinicPhotoItem[];
  qualityMetrics?: QualityMetrics;
  availableDays: {
    dateStr: string; // e.g., "اليوم، 10 سبتمبر"
    dayName: string; // e.g., "اليوم"
    slots: string[]; // e.g., ["04:30 م", "05:00 م", "05:30 م"]
  }[];
  recentReviews: {
    author: string;
    date: string;
    rating: number;
    comment: string;
    verifiedVisit: boolean;
  }[];
}

export interface MedicationItem {
  name: string;
  dose: string;
  frequency: string;
  duration: string;
}

export interface Booking {
  id: string;
  doctorId: string;
  doctorName: string;
  doctorTitle: string;
  specialty: string;
  doctorAvatar: string;
  location: string;
  day: string;
  slot: string;
  patientName: string;
  patientPhone: string;
  patientEmail?: string;
  patientNotes?: string;
  bookingFor: 'self' | 'other';
  bookingDate: string;
  queueNumber?: number;
  status: 'confirmed' | 'in_consultation' | 'completed' | 'cancelled';
  insuranceProvider?: string;
  insuranceCardNumber?: string;
  ePrescription?: {
    diagnosis: string;
    medications: MedicationItem[];
    notes?: string;
    createdAt: string;
  };
}

export type ThemeMode = 'light' | 'dark';

export type TextScale = 'normal' | 'large' | 'huge';

export interface AccessibilityPreferences {
  textScale: TextScale;
  highContrast: boolean;
  speechAssist: boolean;
}

export interface MedicalRecord {
  id: string;
  title: string;
  type: 'prescription' | 'lab' | 'scan';
  doctorName: string;
  specialty: string;
  date: string;
  clinicOrLab: string;
  notes: string;
  patientPhone?: string;
  medications?: MedicationItem[];
}

export interface DoctorJoinRequest {
  id: string;
  providerName: string;
  doctorTitle?: string;
  specialtyId: SpecialtyId;
  specialtyName: string;
  city: string;
  area?: string;
  address?: string;
  phone: string;
  facilityType: 'private_clinic' | 'polyclinic' | 'hospital';
  licenseNo?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  reviewedAt?: string;
}

export interface PlatformStats {
  totalBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  activeDoctors: number;
  pendingJoinRequests: number;
  totalPatients: number;
}

export interface VitalRecord {
  id: string;
  date: string;
  time: string;
  systolicBP?: number;
  diastolicBP?: number;
  heartRate?: number;
  bloodSugar?: number;
  bloodSugarType?: 'صائم' | 'بعد الأكل بساعتين' | 'عشوائي' | 'تراكمي (HbA1c)';
  weightKg?: number;
  heightCm?: number;
  temperature?: number;
  spo2?: number;
  notes?: string;
  patientPhone?: string;
}

export type AppointmentServiceType = 'new_checkup' | 'follow_up' | 'urgent_consult' | 'procedure';

export interface ShiftRule {
  id: string;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  dayName: string;
  startTime: string; // e.g. "17:00"
  endTime: string;   // e.g. "22:00"
  slotDurationMinutes: number; // e.g. 20
  bufferMinutes: number; // e.g. 5
  maxCapacity: number;
  allowWalkIns: boolean;
  active: boolean;
}

export interface SlotLock {
  slotId: string;
  doctorId: string;
  dateStr: string;
  timeStr: string;
  lockedBySession: string;
  lockedAt: number;
  expiresAt: number;
}

export interface SmartSlot {
  id: string;
  doctorId: string;
  dateStr: string;
  timeStr: string;
  dayName: string;
  durationMinutes: number;
  status: 'available' | 'locked_temporary' | 'booked_online' | 'walk_in_occupied' | 'break' | 'blocked';
  lockedUntil?: number;
  bookingId?: string;
  patientName?: string;
  serviceType?: AppointmentServiceType;
}

export interface ClinicQueueDrift {
  doctorId: string;
  isDelayed: boolean;
  delayMinutes: number;
  currentConsultationPaceMinutes: number;
  expectedStartTime: string;
  doctorMessage?: string;
  lastUpdated: string;
}

export interface ClinicQueueState {
  doctorId: string;
  doctorName?: string;
  currentServingTicket: number;
  currentlyInConsultation: Booking | null;
  waitingCount: number;
  patientsAhead?: number;
  servingPatients: {
    bookingId: string;
    queueNumber: number;
    patientName: string;
    status: Booking['status'];
    slot: string;
    isWalkIn?: boolean;
  }[];
  isClinicOpen: boolean;
  delayInfo?: ClinicQueueDrift;
}

export type ActiveView = 
  | 'HOME' 
  | 'SEARCH' 
  | 'RECORDS' 
  | 'BOOKINGS' 
  | 'CONFIRMATION'
  | 'DOCTOR_DASHBOARD'
  | 'ADMIN_DASHBOARD';



