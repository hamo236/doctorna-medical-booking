import { Doctor, Booking, MedicalRecord, DoctorJoinRequest, PlatformStats, VitalRecord, ClinicQueueState, SpecialtyId } from '../types';
import { INITIAL_DOCTORS, INITIAL_BOOKINGS, INITIAL_RECORDS, INITIAL_JOIN_REQUESTS } from '../data/seedData';

// Clean Repository Layer with Dual Sync (REST API + LocalStorage Fallback)
const STORAGE_KEYS = {
  DOCTORS: 'carepro_doctors_db_v2',
  BOOKINGS: 'carepro_bookings_db_v2',
  RECORDS: 'carepro_records_db_v2',
  JOIN_REQUESTS: 'carepro_join_requests_db_v2',
  ROLE: 'carepro_current_role',
  VITALS: 'carepro_vitals_history_v2'
};

const getAuthHeaders = (): HeadersInit => {
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  try {
    const secret = sessionStorage.getItem('carepro_role_secret');
    if (secret) {
      headers['x-role-secret'] = secret;
    }
  } catch (e) {}
  return headers;
};

export const apiService = {
  // 1. Doctors Repository
  async getDoctors(): Promise<Doctor[]> {
    try {
      const res = await fetch('/api/doctors', { headers: getAuthHeaders() });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const clean = json.data.filter(d => !d.id?.startsWith('doc-contracted-'));
          localStorage.setItem(STORAGE_KEYS.DOCTORS, JSON.stringify(clean));
          return clean;
        }
      }
    } catch {
      // Backend not reached or offline, fallback to local storage
    }

    const cached = localStorage.getItem(STORAGE_KEYS.DOCTORS);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          const clean = parsed.filter((d: any) => !d.id?.startsWith('doc-contracted-'));
          return clean;
        }
      } catch (e) {
        console.error('Error parsing cached doctors', e);
      }
    }

    const cleanInitial = INITIAL_DOCTORS.filter(d => !d.id?.startsWith('doc-contracted-'));
    localStorage.setItem(STORAGE_KEYS.DOCTORS, JSON.stringify(cleanInitial));
    return cleanInitial;
  },

  async addDoctor(doctor: Partial<Doctor>): Promise<Doctor> {
    try {
      const res = await fetch('/api/doctors', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(doctor)
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          const current = await this.getDoctors();
          localStorage.setItem(STORAGE_KEYS.DOCTORS, JSON.stringify([json.data, ...current]));
          return json.data;
        }
      }
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to add doctor');
    } catch (e) {
      console.warn('Backend sync failed', e);
      throw e;
    }
  },

  // 2. Bookings Repository
  async getBookings(): Promise<Booking[]> {
    try {
      const res = await fetch('/api/bookings', { headers: getAuthHeaders() });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const clean = json.data.filter(b => !b.doctorId?.startsWith('doc-contracted-'));
          localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(clean));
          return clean;
        }
      }
    } catch {
      // offline fallback
    }

    const cached = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          const clean = parsed.filter((b: any) => !b.doctorId?.startsWith('doc-contracted-'));
          return clean;
        }
      } catch (e) {
        console.error('Error parsing cached bookings', e);
      }
    }

    const cleanInitial = INITIAL_BOOKINGS.filter(b => !b.doctorId?.startsWith('doc-contracted-'));
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(cleanInitial));
    return cleanInitial;
  },

  async createBooking(booking: Booking): Promise<Booking> {
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(booking)
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          const current = await this.getBookings();
          localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify([json.data, ...current]));
          return json.data;
        }
      }
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'فشل الحجز - قد يكون الموعد محجوزاً بالفعل');
    } catch (e) {
      console.error('Backend sync failed', e);
      throw e;
    }
  },

  async updateBookingStatus(
    id: string, 
    status: 'confirmed' | 'in_consultation' | 'completed' | 'cancelled',
    ePrescription?: Booking['ePrescription']
  ): Promise<Booking | null> {
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status, ePrescription })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          const current = await this.getBookings();
          const idx = current.findIndex(b => b.id === id);
          if (idx !== -1) {
            current[idx] = json.data;
            localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(current));
          }
          return json.data;
        }
      }
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update booking status');
    } catch (e) {
      console.error('Backend update failed', e);
      throw e;
    }
  },

  async rescheduleBooking(
    id: string,
    newDay: string,
    newSlot: string
  ): Promise<Booking | null> {
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ day: newDay, slot: newSlot, status: 'confirmed' })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          const current = await this.getBookings();
          const idx = current.findIndex(b => b.id === id);
          if (idx !== -1) {
            current[idx] = json.data;
            localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(current));
          }
          return json.data;
        }
      }
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'فشل إعادة جدولة الموعد');
    } catch (e) {
      console.error('Backend reschedule failed', e);
      throw e;
    }
  },

  // 3. Medical Records Repository
  async getRecords(): Promise<MedicalRecord[]> {
    try {
      const res = await fetch('/api/records', { headers: getAuthHeaders() });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(json.data));
          return json.data;
        }
      }
    } catch {
      // offline fallback
    }

    const cached = localStorage.getItem(STORAGE_KEYS.RECORDS);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error('Error parsing cached records', e);
      }
    }

    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(INITIAL_RECORDS));
    return INITIAL_RECORDS;
  },

  async addRecord(record: MedicalRecord): Promise<MedicalRecord> {
    try {
      const res = await fetch('/api/records', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(record)
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          const current = await this.getRecords();
          localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify([json.data, ...current]));
          return json.data;
        }
      }
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to add record');
    } catch (e) {
      console.error('Backend record sync failed', e);
      throw e;
    }
  },

  async deleteRecord(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/records/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          const current = await this.getRecords();
          const updated = current.filter(r => r.id !== id);
          localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(updated));
          return true;
        }
      }
    } catch (e) {
      console.warn('Backend record delete fallback', e);
    }
    // Fallback to local
    const current = await this.getRecords();
    const updated = current.filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(updated));
    return true;
  },

  // 4. Join Requests Repository
  async getJoinRequests(): Promise<DoctorJoinRequest[]> {
    try {
      const res = await fetch('/api/join-requests', { headers: getAuthHeaders() });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          localStorage.setItem(STORAGE_KEYS.JOIN_REQUESTS, JSON.stringify(json.data));
          return json.data;
        }
      }
    } catch {
      // offline fallback
    }

    const cached = localStorage.getItem(STORAGE_KEYS.JOIN_REQUESTS);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error('Error parsing join requests', e);
      }
    }

    localStorage.setItem(STORAGE_KEYS.JOIN_REQUESTS, JSON.stringify(INITIAL_JOIN_REQUESTS));
    return INITIAL_JOIN_REQUESTS;
  },

  async submitJoinRequest(reqData: Partial<DoctorJoinRequest>): Promise<DoctorJoinRequest> {
    try {
      const res = await fetch('/api/join-requests', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(reqData)
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          const current = await this.getJoinRequests();
          localStorage.setItem(STORAGE_KEYS.JOIN_REQUESTS, JSON.stringify([json.data, ...current]));
          return json.data;
        }
      }
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to submit request');
    } catch (e) {
      console.error('Backend request failed', e);
      throw e;
    }
  },

  async processJoinRequest(id: string, action: 'approve' | 'reject'): Promise<{ success: boolean; newDoctor?: Doctor }> {
    try {
      const res = await fetch(`/api/join-requests/${id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ action })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          if (json.newDoctor) {
            const doctors = await this.getDoctors();
            if (!doctors.some(d => d.id === json.newDoctor.id)) {
              localStorage.setItem(STORAGE_KEYS.DOCTORS, JSON.stringify([json.newDoctor, ...doctors]));
            }
          }
          const requests = await this.getJoinRequests();
          const reqIdx = requests.findIndex(r => r.id === id);
          if (reqIdx !== -1) {
             requests[reqIdx] = json.request;
             localStorage.setItem(STORAGE_KEYS.JOIN_REQUESTS, JSON.stringify(requests));
          }
          return { success: true, newDoctor: json.newDoctor };
        }
      }
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to process request');
    } catch (e) {
      console.error('Backend join-request processing failed', e);
      throw e;
    }
  },

  // 5. Analytics Stats
  async getPlatformStats(): Promise<PlatformStats> {
    try {
      const res = await fetch('/api/stats', { headers: getAuthHeaders() });
      if (res.ok) {
        const json = await res.json();
        if (json.success) return json.data;
      }
    } catch {
      // offline fallback
    }

    const bookings = await this.getBookings();
    const doctors = await this.getDoctors();
    const requests = await this.getJoinRequests();

    return {
      totalBookings: bookings.length,
      confirmedBookings: bookings.filter(b => b.status === 'confirmed').length,
      completedBookings: bookings.filter(b => b.status === 'completed').length,
      activeDoctors: doctors.filter(d => d.status === 'active' || !d.status).length,
      pendingJoinRequests: requests.filter(r => r.status === 'pending').length,
      totalPatients: new Set(bookings.map(b => b.patientPhone)).size
    };
  },

  // 6. Live Clinic Queue Management
  async getClinicQueue(doctorId: string): Promise<ClinicQueueState> {
    try {
      const res = await fetch(`/api/queues/${doctorId}`, { headers: getAuthHeaders() });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          return json.data;
        }
      }
    } catch {
      // offline fallback
    }

    const bookings = await this.getBookings();
    const docBookings = bookings.filter(b => b.doctorId === doctorId && b.status !== 'cancelled');
    const inConsult = docBookings.find(b => b.status === 'in_consultation') || null;
    const completed = docBookings.filter(b => b.status === 'completed');
    const waiting = docBookings.filter(b => b.status === 'confirmed');

    let currentTicket = 0;
    if (inConsult) {
      currentTicket = inConsult.queueNumber || 1;
    } else if (completed.length > 0) {
      currentTicket = Math.max(...completed.map(b => b.queueNumber || 1));
    } else if (waiting.length > 0) {
      currentTicket = Math.min(...waiting.map(b => b.queueNumber || 1));
    }

    let isPrivileged = false;
    try {
      const secret = sessionStorage.getItem('carepro_role_secret');
      isPrivileged = Boolean(secret && secret.trim().length > 0);
    } catch (e) {}

    const sanitizedInConsult = inConsult
      ? {
          ...inConsult,
          patientName: isPrivileged ? inConsult.patientName : 'مريض',
          patientPhone: isPrivileged ? inConsult.patientPhone : undefined
        }
      : null;

    return {
      doctorId,
      currentServingTicket: currentTicket,
      currentlyInConsultation: sanitizedInConsult,
      waitingCount: waiting.length,
      isClinicOpen: true,
      servingPatients: docBookings.map(b => ({
        bookingId: b.id,
        queueNumber: b.queueNumber || 1,
        patientName: isPrivileged ? b.patientName : 'مريض',
        status: b.status,
        slot: b.slot
      }))
    };
  },

  async callQueueTicket(doctorId: string, bookingId?: string, queueNumber?: number): Promise<ClinicQueueState | null> {
    try {
      const res = await fetch(`/api/queues/${doctorId}/call-ticket`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ bookingId, queueNumber })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          return this.getClinicQueue(doctorId);
        }
      }
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to call queue ticket');
    } catch (e) {
      console.error('Queue call failed', e);
      throw e;
    }
  },

  // 7. Clinical Vital Signs Repository
  async getVitals(patientPhone?: string): Promise<VitalRecord[]> {
    try {
      const url = patientPhone ? `/api/vitals?patientPhone=${encodeURIComponent(patientPhone)}` : '/api/vitals';
      const res = await fetch(url, { headers: getAuthHeaders() });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          localStorage.setItem(STORAGE_KEYS.VITALS, JSON.stringify(json.data));
          return json.data;
        }
      }
    } catch {
      // offline fallback
    }

    const cached = localStorage.getItem(STORAGE_KEYS.VITALS);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error('Error parsing vitals cache', e);
      }
    }

    return [
      {
        id: 'vit-1',
        date: '2026-09-10',
        time: '09:00 ص',
        systolicBP: 120,
        diastolicBP: 80,
        heartRate: 72,
        bloodSugar: 98,
        bloodSugarType: 'صائم',
        weightKg: 78,
        heightCm: 175,
        temperature: 36.8,
        spo2: 99,
        notes: 'قراءة صباحية قبل تناول وجبة الإفطار',
        patientPhone: '01012345678'
      },
      {
        id: 'vit-2',
        date: '2026-09-08',
        time: '08:30 م',
        systolicBP: 125,
        diastolicBP: 82,
        heartRate: 76,
        bloodSugar: 135,
        bloodSugarType: 'بعد الأكل بساعتين',
        weightKg: 78.2,
        heightCm: 175,
        temperature: 37.0,
        spo2: 98,
        notes: 'بعد العشاء بساعتين',
        patientPhone: '01012345678'
      }
    ];
  },

  async saveVital(record: VitalRecord): Promise<VitalRecord> {
    try {
      const res = await fetch('/api/vitals', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(record)
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          const current = await this.getVitals();
          localStorage.setItem(STORAGE_KEYS.VITALS, JSON.stringify([json.data, ...current]));
          return json.data;
        }
      }
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to save vital');
    } catch (e) {
      console.error('Vital sync failed', e);
      throw e;
    }
  },

  async deleteVital(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/vitals/${id}`, { 
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          const current = await this.getVitals();
          const filtered = current.filter(v => v.id !== id);
          localStorage.setItem(STORAGE_KEYS.VITALS, JSON.stringify(filtered));
          return true;
        }
      }
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to delete vital');
    } catch (e) {
      console.error('Vital delete failed', e);
      throw e;
    }
  },

  // 8. Gemini Clinical Symptom Triage
  async aiTriageSymptoms(symptoms: string): Promise<{
    specialtyId: SpecialtyId;
    specialtyName: string;
    secondarySpecialtyId?: SpecialtyId;
    secondarySpecialtyName?: string;
    urgency: 'routine' | 'urgent' | 'emergency';
    urgencyLabel: string;
    clinicalAnalysis: string;
    redFlags?: string[];
    suggestedLabTests?: string[];
    homeCareAdvice?: string;
  }> {
    const res = await fetch('/api/triage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symptoms })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'فشل الفحص السريري بالذكاء الاصطناعي');
    }

    const json = await res.json();
    return json.data;
  },

  // 9. Gemini Clinical Pharmacology Drug Interaction Checker
  async checkDrugInteractionsAI(medications: string[]): Promise<{
    isSafe: boolean;
    interactionsCount: number;
    summary: string;
    alerts: {
      drugA: string;
      drugB: string;
      severity: 'high' | 'moderate' | 'minor';
      severityText: string;
      mechanism: string;
      clinicalAdvice: string;
    }[];
    generalPrecautions?: string;
  }> {
    const res = await fetch('/api/drugs/check-interactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ medications })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'فشل فحص التعارضات الدوائية بالذكاء الاصطناعي');
    }

    const json = await res.json();
    return json.data;
  },

  // 10. Gemini Clinical Vitals Health Assessment & Trend Analyzer
  async analyzeVitalsTrends(vitalsList: VitalRecord[], patientNotes?: string): Promise<{
    status: 'stable' | 'needs_attention' | 'critical';
    statusLabel: string;
    bpEvaluation: string;
    glucoseEvaluation: string;
    bmiEvaluation: string;
    clinicalSummary: string;
    keyAlerts: string[];
    recommendations: string[];
    suggestedSpecialty: string;
  }> {
    const res = await fetch('/api/vitals/analyze-trend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vitalsList, patientNotes })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'فشل تحليل المؤشرات الحيوية بالذكاء الاصطناعي');
    }

    const json = await res.json();
    return json.data;
  }
};

