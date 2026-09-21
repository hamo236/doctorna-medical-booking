import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { CONTRACTED_DOCTORS } from './src/data/contractedDoctorsRegistry';

// Lazy initialized Gemini client
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!genAIClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not configured');
    }
    genAIClient = new GoogleGenAI({ apiKey });
  }
  return genAIClient;
}

// Data Persistence Layer (File-backed JSON Store with In-Memory Caching)
const DATA_DIR = path.join(process.cwd(), '.data');
const DATA_FILE = path.join(DATA_DIR, 'carepro_store.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (err) {
    console.error('Failed to create data directory:', err);
  }
}

// Initial Seed Data (Awaiting in-code contracted doctors injection)
const INITIAL_DOCTORS: any[] = CONTRACTED_DOCTORS;
const INITIAL_BOOKINGS: any[] = [];
const INITIAL_RECORDS: any[] = [];
const INITIAL_JOIN_REQUESTS: any[] = [];
const INITIAL_VITALS: any[] = [];

// In-Memory state
let doctorsStore: any[] = [];
let bookingsStore: any[] = [];
let recordsStore: any[] = [];
let joinRequestsStore: any[] = [];
let vitalsStore: any[] = [];
let sharedRecordsStore: { [pin: string]: { records: any[]; scope: string; expiresAt: number; patientName: string } } = {};

// Load from persistent disk or fallback to seed data
function loadPersistentData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      // Clean legacy mock IDs (doc-1 to doc-10, etc.) and fake contracted doctors
      const isLegacyMockDoc = (d: any) => {
        if (!d || !d.id) return false;
        const num = parseInt(d.id.replace('doc-', ''), 10);
        return !isNaN(num) && num <= 20;
      };
      doctorsStore = (parsed.doctors || []).filter((d: any) => {
        if (!d || !d.id) return false;
        if (isLegacyMockDoc(d)) return false;
        if (d.id.startsWith('doc-contracted-')) return false;
        return true;
      });
      if (doctorsStore.length === 0 && CONTRACTED_DOCTORS.length > 0) {
        doctorsStore = [...CONTRACTED_DOCTORS];
      }
      bookingsStore = (parsed.bookings || []).filter((b: any) => {
        if (!b || !b.id) return false;
        if (b.id.startsWith('BK-2026-')) return false;
        if (b.doctorId && b.doctorId.startsWith('doc-contracted-')) return false;
        return true;
      });
      recordsStore = (parsed.records || []).filter((r: any) => {
        if (!r || !r.id) return false;
        if (r.id === 'rec-01' || r.id === 'rec-02' || r.id.startsWith('rec-mock-')) return false;
        return true;
      });
      joinRequestsStore = (parsed.joinRequests || []).filter((r: any) => !r.id?.startsWith('req-10'));
      vitalsStore = parsed.vitals || [];
      console.log(`[Store] Loaded clean persistent data: ${doctorsStore.length} doctors, ${bookingsStore.length} bookings, ${vitalsStore.length} vitals`);
      savePersistentData();
      return;
    }
  } catch (e) {
    console.error('[Store] Error reading persistent data, seeding defaults:', e);
  }
  doctorsStore = [...CONTRACTED_DOCTORS];
  bookingsStore = INITIAL_BOOKINGS;
  recordsStore = INITIAL_RECORDS;
  joinRequestsStore = INITIAL_JOIN_REQUESTS;
  vitalsStore = INITIAL_VITALS;
  savePersistentData();
}

function savePersistentData() {
  try {
    const payload = {
      doctors: doctorsStore,
      bookings: bookingsStore,
      records: recordsStore,
      joinRequests: joinRequestsStore,
      vitals: vitalsStore,
      updatedAt: new Date().toISOString()
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(payload, null, 2), 'utf-8');
  } catch (e) {
    console.error('[Store] Error writing persistent data:', e);
  }
}

// Initial hydration
loadPersistentData();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Support base64 image uploads for OCR (up to 15MB)
  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ extended: true, limit: '15mb' }));

  // ===================== SECURITY MIDDLEWARE =====================
  const ADMIN_SECRET = process.env.ADMIN_SECRET || 'admin123';
  const DOCTOR_SECRET = process.env.DOCTOR_SECRET || 'doctor123';

  const requireAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const secret = req.headers['x-role-secret'];
    if (secret !== ADMIN_SECRET) {
      return res.status(403).json({ success: false, error: 'Unauthorized: Admin access required' });
    }
    next();
  };

  const requireDoctor = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const secret = req.headers['x-role-secret'];
    // Admin can also perform doctor actions
    if (secret !== DOCTOR_SECRET && secret !== ADMIN_SECRET) {
      return res.status(403).json({ success: false, error: 'Unauthorized: Doctor access required' });
    }
    next();
  };

  const requireDoctorOrAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const secret = req.headers['x-role-secret'];
    if (secret !== DOCTOR_SECRET && secret !== ADMIN_SECRET) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }
    next();
  };

  const requireValidSecretIfPresent = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const secret = req.headers['x-role-secret'];
    if (secret && secret !== DOCTOR_SECRET && secret !== ADMIN_SECRET) {
      return res.status(403).json({ success: false, error: 'Unauthorized: Invalid role secret' });
    }
    next();
  };
  // ===============================================================

  // ===================== REST API ROUTES =====================

  // Health Check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString(), doctorsCount: doctorsStore.length });
  });

  // 1. Doctors Endpoints
  app.get('/api/doctors', (req, res) => {
    const { specialty, city, status } = req.query;
    let result = [...doctorsStore];

    if (status) {
      result = result.filter(d => d.status === status);
    } else {
      // By default return active doctors
      result = result.filter(d => d.status === 'active' || !d.status);
    }

    if (specialty && specialty !== 'all') {
      result = result.filter(d => d.specialtyId === specialty);
    }
    if (city) {
      result = result.filter(d => d.city === city);
    }

    res.json({ success: true, count: result.length, data: result });
  });

  app.post('/api/doctors', requireAdmin, (req, res) => {
    const newDoc = req.body;
    if (!newDoc.name || !newDoc.specialty) {
      return res.status(400).json({ success: false, error: 'Name and specialty are required' });
    }
    newDoc.id = newDoc.id || `doc-${Date.now()}`;
    newDoc.status = newDoc.status || 'active';
    newDoc.verified = newDoc.verified ?? true;
    doctorsStore.unshift(newDoc);
    savePersistentData();
    res.status(201).json({ success: true, data: newDoc });
  });

  app.patch('/api/doctors/:id', requireDoctorOrAdmin, (req, res) => {
    const { id } = req.params;
    const idx = doctorsStore.findIndex(d => d.id === id);
    if (idx === -1) {
      return res.status(404).json({ success: false, error: 'Doctor not found' });
    }
    doctorsStore[idx] = { ...doctorsStore[idx], ...req.body };
    savePersistentData();
    res.json({ success: true, data: doctorsStore[idx] });
  });

  // 2. Bookings Endpoints
  app.get('/api/bookings', requireValidSecretIfPresent, (req, res) => {
    const { doctorId, patientPhone } = req.query;
    let result = [...bookingsStore];
    if (doctorId) {
      result = result.filter(b => b.doctorId === doctorId);
    }
    if (patientPhone) {
      result = result.filter(b => b.patientPhone === patientPhone);
    }
    res.json({ success: true, count: result.length, data: result });
  });

  app.post('/api/bookings', (req, res) => {
    const booking = req.body;
    if (!booking.doctorId || !booking.patientName || !booking.patientPhone) {
      return res.status(400).json({ success: false, error: 'Missing required booking fields' });
    }

    // Check slot collision (conflict detection)
    const hasConflict = bookingsStore.some(
      b => b.doctorId === booking.doctorId &&
           b.day === booking.day &&
           b.slot === booking.slot &&
           b.status !== 'cancelled'
    );
    if (hasConflict) {
      return res.status(409).json({
        success: false,
        error: 'هذا الموعد تم حجزه للتو من مريض آخر. يرجى اختيار موعد آخر.'
      });
    }

    booking.id = booking.id || `BK-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    booking.bookingDate = booking.bookingDate || new Date().toISOString().replace('T', ' ').substring(0, 16);
    booking.status = booking.status || 'confirmed';
    booking.queueNumber = booking.queueNumber || (bookingsStore.filter(b => b.doctorId === booking.doctorId).length + 1);
    bookingsStore.unshift(booking);
    savePersistentData();
    res.status(201).json({ success: true, data: booking });
  });

  app.patch('/api/bookings/:id', (req, res) => {
    const { id } = req.params;
    const idx = bookingsStore.findIndex(b => b.id === id);
    if (idx === -1) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    const { status, ePrescription, day, slot } = req.body;
    const secret = req.headers['x-role-secret'];
    const isDoctorOrAdmin = secret === DOCTOR_SECRET || secret === ADMIN_SECRET;

    // Clinical lifecycle mutations require elevated role
    if ((status === 'in_consultation' || status === 'completed' || ePrescription) && !isDoctorOrAdmin) {
      return res.status(403).json({ success: false, error: 'Unauthorized: Doctor or Admin access required for clinical consultation' });
    }

    // Patients are permitted to cancel their booking or reschedule day/slot
    bookingsStore[idx] = { ...bookingsStore[idx], ...req.body };
    savePersistentData();
    res.json({ success: true, data: bookingsStore[idx] });
  });

  // 3. Medical Records & E-Prescriptions
  app.get('/api/records', requireValidSecretIfPresent, (req, res) => {
    const { patientPhone } = req.query;
    let result = [...recordsStore];
    if (patientPhone) {
      result = result.filter(r => r.patientPhone === patientPhone);
    }
    res.json({ success: true, count: result.length, data: result });
  });

  app.post('/api/records', (req, res) => {
    const record = req.body;
    if (!record.title || !record.doctorName) {
      return res.status(400).json({ success: false, error: 'Missing required record fields' });
    }
    record.id = record.id || `rec-${Date.now()}`;
    record.date = record.date || new Date().toISOString().split('T')[0];
    recordsStore.unshift(record);
    savePersistentData();
    res.status(201).json({ success: true, data: record });
  });

  app.delete('/api/records/:id', (req, res) => {
    const { id } = req.params;
    const initialLen = recordsStore.length;
    recordsStore = recordsStore.filter(r => r.id !== id);
    savePersistentData();
    res.json({ success: true, removed: initialLen !== recordsStore.length });
  });

  // 4. Doctor Join Requests (Admin Approval Flow)
  app.get('/api/join-requests', requireAdmin, (req, res) => {
    const { status } = req.query;
    let result = [...joinRequestsStore];
    if (status) {
      result = result.filter(r => r.status === status);
    }
    res.json({ success: true, count: result.length, data: result });
  });

  app.post('/api/join-requests', (req, res) => {
    const reqData = req.body;
    if (!reqData.providerName || !reqData.phone || !reqData.specialtyId) {
      return res.status(400).json({ success: false, error: 'Missing required fields for join request' });
    }
    const newReq = {
      id: `req-${Date.now()}`,
      providerName: reqData.providerName,
      doctorTitle: reqData.doctorTitle || 'استشاري',
      specialtyId: reqData.specialtyId,
      specialtyName: reqData.specialtyName || reqData.specialtyId,
      city: reqData.city || 'القاهرة',
      area: reqData.area || 'وسط البلد',
      address: reqData.address || `${reqData.city} - عيادات ${reqData.providerName}`,
      phone: reqData.phone,
      facilityType: reqData.facilityType || 'private_clinic',
      licenseNo: reqData.licenseNo || `EGY-REG-${Math.floor(10000 + Math.random() * 90000)}`,
      status: 'pending',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    joinRequestsStore.unshift(newReq);
    savePersistentData();
    res.status(201).json({ success: true, data: newReq });
  });

  app.patch('/api/join-requests/:id', requireAdmin, (req, res) => {
    const { id } = req.params;
    const { action } = req.body; // 'approve' | 'reject'
    const idx = joinRequestsStore.findIndex(r => r.id === id);
    if (idx === -1) {
      return res.status(404).json({ success: false, error: 'Join request not found' });
    }

    const request = joinRequestsStore[idx];

    if (action === 'approve') {
      request.status = 'approved';
      request.reviewedAt = new Date().toISOString().replace('T', ' ').substring(0, 16);

      // Automatically construct and seed the doctor into the live Doctors Store
      const newDoctor = {
        id: `doc-${Date.now()}`,
        name: request.providerName,
        title: request.doctorTitle || 'استشاري',
        specialty: `استشاري ${request.specialtyName}`,
        specialtyId: request.specialtyId,
        subSpecialties: [`علاج الحالات المتقدمة في ${request.specialtyName}`, 'استشارات وتشخيص دقيق'],
        gender: 'male',
        rating: 5.0,
        reviewsCount: 1,
        city: request.city,
        area: request.area || 'وسط البلد',
        address: request.address || `${request.city} - عيادة ${request.providerName}`,
        landmark: 'بالقرب من الميدان الرئيسي',
        waitingTime: '١٥ دقيقة',
        phone: request.phone,
        bio: `طبيب واستشاري معتمد لدى منصة دكتورنا، حاصل على ترخيص مزاولة المهنة برقم ${request.licenseNo}`,
        degrees: [
          `بكالوريوس وماجستير ${request.specialtyName}`,
          `ترخيص نقابة الأطباء المصرية: ${request.licenseNo}`
        ],
        services: [
          { name: `كشف واستشارة ${request.specialtyName}` }
        ],
        avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80',
        verified: true,
        status: 'active',
        facilityType: request.facilityType,
        licenseNo: request.licenseNo,
        acceptedInsurances: ['أكسا (AXA)', 'التأمين الصحي الشامل', 'نقابة المهندسين المصرية'],
        availableDays: [
          { dateStr: 'اليوم، 10 سبتمبر', dayName: 'اليوم', slots: ['05:00 م', '06:00 م', '07:00 م'] },
          { dateStr: 'غداً، 11 سبتمبر', dayName: 'غداً', slots: ['04:30 م', '05:30 م', '06:30 م'] }
        ],
        recentReviews: [
          {
            author: 'إدارة شبكة دكتورنا الطبية',
            date: 'اليوم',
            rating: 5,
            comment: 'تم اعتماد الترخيص الطبي والمنشأة الطبية رسمياً بعد فحص الأوراق والمطابقة.',
            verifiedVisit: true
          }
        ]
      };

      doctorsStore.unshift(newDoctor);
      savePersistentData();
      return res.json({ success: true, message: 'Request approved and doctor activated', request, newDoctor });
    } else if (action === 'reject') {
      request.status = 'rejected';
      request.reviewedAt = new Date().toISOString().replace('T', ' ').substring(0, 16);
      savePersistentData();
      return res.json({ success: true, message: 'Request rejected', request });
    } else {
      return res.status(400).json({ success: false, error: 'Invalid action, must be approve or reject' });
    }
  });

  // 5. Platform Stats (KPIs for Admin)
  app.get('/api/stats', requireAdmin, (req, res) => {
    const totalBookings = bookingsStore.length;
    const confirmedBookings = bookingsStore.filter(b => b.status === 'confirmed').length;
    const completedBookings = bookingsStore.filter(b => b.status === 'completed').length;
    const activeDoctors = doctorsStore.filter(d => d.status === 'active' || !d.status).length;
    const pendingJoinRequests = joinRequestsStore.filter(r => r.status === 'pending').length;
    const totalPatients = new Set(bookingsStore.map(b => b.patientPhone)).size;

    res.json({
      success: true,
      data: {
        totalBookings,
        confirmedBookings,
        completedBookings,
        activeDoctors,
        pendingJoinRequests,
        totalPatients
      }
    });
  });

  // 6. Gemini Google Maps Grounding for Clinics, Hospitals & Pharmacies in Egypt
  app.post('/api/maps/grounding', async (req, res) => {
    try {
      const { query, location, specialty } = req.body;
      const prompt = `ابحث عن معلومات دقيقة وحقيقية ومحدثة من خرائط جوجل للعيادات أو المستشفيات أو الصيدليات في مصر التالية:
التخصص المطلوب: ${specialty || 'عام'}
الموقع أو المنطقة: ${location || 'القاهرة، مصر'}
الاستفسار: ${query || 'أقرب عيادات ومستشفيات معتمدة'}

المطلوب:
1. اذكر أسماء المراكز الطبية / المستشفيات / العيادات الشهيرة الحقيقية في هذه المنطقة.
2. العنوان الدقيق والعلامات المميزة.
3. التقييم وساعات العمل إن توفرت.
4. نصائح وإرشادات الوصول وأقرب محطات مترو أو مواصلات.
اجعل الإجابة منظمة ومهنية باللغة العربية مع نقاط واضحة تناسب المريض.`;

      const ai = getGenAI();
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          tools: [{ googleMaps: {} }],
        },
      });

      const text = response.text;
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const webSearchQueries = response.candidates?.[0]?.groundingMetadata?.webSearchQueries || [];

      return res.json({
        success: true,
        text,
        groundingChunks,
        webSearchQueries
      });
    } catch (err: any) {
      console.error('Error in maps grounding:', err);
      return res.status(500).json({
        success: false,
        error: err.message || 'Failed to query Google Maps grounding'
      });
    }
  });

  // 7. Real Gemini 2.5 Flash Vision OCR for Egyptian Hand-written & Printed Prescriptions
  app.post('/api/prescriptions/ocr', async (req, res) => {
    try {
      const { imageBase64, mimeType } = req.body;
      if (!imageBase64) {
        return res.status(400).json({ success: false, error: 'imageBase64 is required' });
      }

      // Clean base64 data url if passed
      const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
      const detectedMime = mimeType || (imageBase64.includes('image/png') ? 'image/png' : 'image/jpeg');

      const prompt = `أنت خبير صيدلي وطبيب متخصص في قراءة الروشتات والتقارير الطبية المكتوبة بخط اليد والمطبوعة في مصر.
قم بتحليل صورة الروشتة المرفقة واستخرج البيانات التالية بدقة بالغة:
1. اسم الطبيب (Doctor Name)
2. التخصص الطبي (Medical Specialty)
3. المستشفى أو المركز أو العيادة (Clinic or Hospital)
4. تاريخ الكشف (Date) بصيغة YYYY-MM-DD (إذا لم يظهر استخدم تاريخ اليوم)
5. التشخيص السريري (Diagnosis)
6. قائمة الأدوية (Medications): لكل دواء:
   - name: الاسم التجاري والعلمي مع التركيز (مثل Concor 5mg أو Amoxicillin 500mg)
   - dose: الجرعة (مثل: قرص، كبسولة، 5 مل، ملعقة)
   - frequency: عدد المرات ومواعيد الاستخدام (مثل: مرتين يومياً بعد الأكل)
   - duration: مدة العلاج (مثل: لمدة ٥ أيام، أو مستمر بانتظام)

أرجع النتيجة بصيغة JSON حصراً بدون أي كود ماركداون إضافي:
{
  "doctor": "اسم الطبيب",
  "specialty": "التخصص",
  "clinic": "اسم العيادة",
  "date": "YYYY-MM-DD",
  "diagnosis": "التشخيص",
  "medications": [
    {
      "name": "اسم الدواء",
      "dose": "الجرعة",
      "frequency": "التكرار",
      "duration": "المدة"
    }
  ]
}`;

      const ai = getGenAI();
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            role: 'user',
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: detectedMime,
                  data: cleanBase64
                }
              }
            ]
          }
        ],
        config: {
          responseMimeType: 'application/json'
        }
      });

      const rawText = response.text || '{}';
      const parsedData = JSON.parse(rawText);

      return res.json({
        success: true,
        data: parsedData
      });
    } catch (err: any) {
      console.error('Error in prescription OCR:', err);
      return res.status(500).json({
        success: false,
        error: err.message || 'Failed to process prescription image with AI Vision'
      });
    }
  });

  // 8. Secure Medical Record PIN Sharing (Creation & Lookup)
  app.post('/api/records/share', (req, res) => {
    try {
      const { pinCode, records, scope, patientName } = req.body;
      if (!pinCode || !records) {
        return res.status(400).json({ success: false, error: 'pinCode and records are required' });
      }

      // Store in memory with 60 minutes TTL
      sharedRecordsStore[pinCode] = {
        records,
        scope: scope || 'all',
        expiresAt: Date.now() + 60 * 60 * 1000,
        patientName: patientName || 'مريض CarePro'
      };

      res.status(201).json({
        success: true,
        message: 'Records shared successfully with temporary PIN',
        pinCode,
        expiresInSeconds: 3600
      });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.get('/api/records/shared/:pinCode', (req, res) => {
    try {
      const { pinCode } = req.params;
      const share = sharedRecordsStore[pinCode];

      if (!share) {
        return res.status(404).json({ success: false, error: 'رمز المشاركة غير صحيح أو لم يعد موجوداً' });
      }

      if (Date.now() > share.expiresAt) {
        delete sharedRecordsStore[pinCode];
        return res.status(410).json({ success: false, error: 'انتهت صلاحية رمز المرور المؤقت (أكثر من ساعة)' });
      }

      res.json({
        success: true,
        data: share.records,
        scope: share.scope,
        patientName: share.patientName,
        remainingMinutes: Math.max(1, Math.round((share.expiresAt - Date.now()) / 60000))
      });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // 9. Real Clinic Live Queue Management
  app.get('/api/queues/:doctorId', (req, res) => {
    try {
      const secret = req.headers['x-role-secret'];
      const isPrivileged = secret === ADMIN_SECRET || secret === DOCTOR_SECRET;
      const { doctorId } = req.params;
      const doctor = doctorsStore.find(d => d.id === doctorId);
      const doctorBookings = bookingsStore.filter(b => b.doctorId === doctorId && b.status !== 'cancelled');

      // Find booking currently in consultation
      const inConsultationBooking = doctorBookings.find(b => b.status === 'in_consultation');
      const completedBookings = doctorBookings.filter(b => b.status === 'completed');
      const waitingBookings = doctorBookings.filter(b => b.status === 'confirmed');

      let currentServingTicket = 0;
      if (inConsultationBooking) {
        currentServingTicket = inConsultationBooking.queueNumber || 1;
      } else if (completedBookings.length > 0) {
        currentServingTicket = Math.max(...completedBookings.map(b => b.queueNumber || 1));
      } else if (waitingBookings.length > 0) {
        currentServingTicket = Math.min(...waitingBookings.map(b => b.queueNumber || 1));
      }

      res.json({
        success: true,
        data: {
          doctorId,
          doctorName: doctor?.name || 'الطبيب',
          currentServingTicket,
          currentlyInConsultation: inConsultationBooking
            ? {
                ...inConsultationBooking,
                patientName: isPrivileged ? inConsultationBooking.patientName : 'مريض',
                patientPhone: isPrivileged ? inConsultationBooking.patientPhone : undefined
              }
            : null,
          waitingCount: waitingBookings.length,
          isClinicOpen: true,
          servingPatients: doctorBookings.map(b => ({
            bookingId: b.id,
            queueNumber: b.queueNumber || 1,
            patientName: isPrivileged ? b.patientName : 'مريض',
            status: b.status,
            slot: b.slot
          }))
        }
      });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.post('/api/queues/:doctorId/call-ticket', requireDoctor, (req, res) => {
    try {
      const { doctorId } = req.params;
      const { bookingId, queueNumber } = req.body;

      // Finish any previous in_consultation for this doctor
      bookingsStore.forEach(b => {
        if (b.doctorId === doctorId && b.status === 'in_consultation') {
          b.status = 'completed';
        }
      });

      // Find target booking
      const target = bookingsStore.find(b => 
        b.doctorId === doctorId && 
        ((bookingId && b.id === bookingId) || (queueNumber && b.queueNumber === queueNumber))
      );

      if (target) {
        target.status = 'in_consultation';
      }

      savePersistentData();

      const doctorBookings = bookingsStore.filter(b => b.doctorId === doctorId && b.status !== 'cancelled');
      const inConsultationBooking = doctorBookings.find(b => b.status === 'in_consultation');
      const waitingBookings = doctorBookings.filter(b => b.status === 'confirmed');

      res.json({
        success: true,
        message: 'تم استدعاء المريض لغرفة الكشف بنجاح',
        data: {
          doctorId,
          currentServingTicket: target ? target.queueNumber : queueNumber || 1,
          currentlyInConsultation: inConsultationBooking || null,
          waitingCount: waitingBookings.length
        }
      });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // 10. Persistent Clinical Vital Signs (Blood Pressure, Sugar, BMI, Heart Rate)
  app.get('/api/vitals', requireValidSecretIfPresent, (req, res) => {
    try {
      const { patientPhone } = req.query;
      let result = [...vitalsStore];
      if (patientPhone) {
        result = result.filter(v => v.patientPhone === patientPhone || !v.patientPhone);
      }
      res.json({ success: true, count: result.length, data: result });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.post('/api/vitals', requireValidSecretIfPresent, (req, res) => {
    try {
      const vital = req.body;
      if (!vital.date) {
        return res.status(400).json({ success: false, error: 'Date is required for vital record' });
      }
      vital.id = vital.id || `vit-${Date.now()}`;
      vital.createdAt = new Date().toISOString();
      vitalsStore.unshift(vital);
      savePersistentData();
      res.status(201).json({ success: true, data: vital });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.delete('/api/vitals/:id', requireValidSecretIfPresent, (req, res) => {
    try {
      const { id } = req.params;
      const initialLen = vitalsStore.length;
      vitalsStore = vitalsStore.filter(v => v.id !== id);
      savePersistentData();
      res.json({ success: true, removed: initialLen !== vitalsStore.length });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // 10.1 Real Gemini 2.5 Flash Clinical Vitals Trend & Health Assessment Analyzer
  app.post('/api/vitals/analyze-trend', async (req, res) => {
    try {
      const { vitalsList, patientNotes } = req.body;
      if (!vitalsList || !Array.isArray(vitalsList) || vitalsList.length === 0) {
        return res.status(400).json({ success: false, error: 'vitalsList array is required' });
      }

      const prompt = `أنت استشاري باطنة ورعاية صحية أولية (Internal Medicine Consultant).
قم بتحليل سجل القراءات والمؤشرات الحيوية التالي للمريض:
${JSON.stringify(vitalsList)}
${patientNotes ? `ملاحظات إضافية من المريض: ${patientNotes}` : ''}

المطلوب بدقة:
1. تقييم استقرار ضغط الدم (Blood Pressure Stability Analysis).
2. تقييم سكر الدم ونمط القراءات (Blood Glucose Trend).
3. تقييم مؤشر كتلة الجسم والوزن (BMI / Weight Category).
4. ملخص سريري تنفيذي (Executive Clinical Summary) يوضح الحالة العامة.
5. مؤشرات الخطر أو التنبيهات السريرية (Clinical Warnings / Risk Flags).
6. توصيات محددة لنمط الحياة والمتابعة (Recommendations).
7. التخصص الطبي المقترح للمتابعة القادمة (Suggested Specialty).

أرجع النتيجة بصيغة JSON حصراً بهذا الهيكل:
{
  "status": "stable" | "needs_attention" | "critical",
  "statusLabel": "مؤشرات حيوية مستقرة" | "تحتاج مراجعة الطبيب" | "تنبيه سريري عاجل",
  "bpEvaluation": "تقييم تفصيلي لضغط الدم...",
  "glucoseEvaluation": "تقييم تفصيلي لمستويات السكر...",
  "bmiEvaluation": "تقييم مؤشر كتلة الجسم والوزن...",
  "clinicalSummary": "شرح طبي شامل وواضح للمريض...",
  "keyAlerts": ["تنبيه 1", "تنبيه 2"],
  "recommendations": ["توصية 1", "توصية 2", "توصية 3"],
  "suggestedSpecialty": "باطنة وسكر وجهاز هضمي"
}`;

      const ai = getGenAI();
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const rawText = response.text || '{}';
      const parsed = JSON.parse(rawText);
      return res.json({ success: true, data: parsed });
    } catch (err: any) {
      console.error('Error in vitals trend analysis:', err);
      return res.status(500).json({ success: false, error: err.message || 'Failed to analyze vitals trends' });
    }
  });

  // 11. Real Gemini 2.5 Flash Clinical Symptom Triage (Egyptian Dialect & Standard Arabic)
  app.post('/api/triage', async (req, res) => {
    try {
      const { symptoms } = req.body;
      if (!symptoms || !symptoms.trim()) {
        return res.status(400).json({ success: false, error: 'Symptoms text is required' });
      }

      const prompt = `أنت خبير فرز وتوجيه طبي سريري (Clinical Triage Officer) لمنصة رعاية صحية ذكية في مصر.
المريض يصف أعراضه التالية (قد تكون باللهجة المصرية الدارجة أو الفصحى):
"${symptoms.trim()}"

المطلوب بدقة:
1. التخصص الطبي الأنسب من قائمة التخصصات المعتمدة التالية حصراً:
   - internal (باطنة وجهاز هضمي)
   - cardiology (أمراض القلب والأوعية الدموية)
   - orthopedics (عظام ومفاصل وعمود فقري)
   - pediatrics (أطفال وحديثي الولادة)
   - neurology (مخ وأعصاب)
   - dermatology (جلدية وتجميل)
   - dentistry (طب وجراحة الأسنان)
   - ent (أنف وأذن وحنجرة)
   - ophthalmology (عيون ورمد)
   - gynecology (نساء وتوليد)
2. تخصص بديل ثانوي إن لزم الأمر (secondarySpecialtyId).
3. تقييم درجة الإلحاح (urgency): إما "emergency" (طوارئ قصوى تستوجب الاتصال بالإسعاف 123 فوراً)، أو "urgent" (فحص خلال 24 ساعة)، أو "routine" (حجز عيادة عادي).
4. شرح سريري مبسط ومطمئن للمريض باللغة العربية يوضح أسباب توجيهه لهذا التخصص.
5. علامات الخطر (redFlags): أعراض تحذيرية حادة تستدعي التوجه الفوري للطوارئ.
6. التحاليل أو الفحوصات المقترحة (suggestedLabTests) للاستئناس قبل أو أثناء الكشف.
7. إرشادات رعاية منزلية مؤقتة (homeCareAdvice) لحين مقابلة الطبيب.

أرجع النتيجة بصيغة JSON حصراً بدون أي نصوص أخرى:
{
  "specialtyId": "internal",
  "specialtyName": "باطنة وجهاز هضمي",
  "secondarySpecialtyId": "cardiology",
  "secondarySpecialtyName": "أمراض القلب والأوعية الدموية",
  "urgency": "urgent",
  "urgencyLabel": "فحص عاجل خلال ٢٤ ساعة",
  "clinicalAnalysis": "شرح مبسط للأعراض...",
  "redFlags": ["علامة خطر 1", "علامة خطر 2"],
  "suggestedLabTests": ["صورة دم كاملة (CBC)", "رسم قلب كهربائي (ECG)"],
  "homeCareAdvice": "نصائح أولية مؤقتة"
}`;

      const ai = getGenAI();
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const rawText = response.text || '{}';
      const parsed = JSON.parse(rawText);
      return res.json({ success: true, data: parsed });
    } catch (err: any) {
      console.error('Error in AI triage:', err);
      return res.status(500).json({ success: false, error: err.message || 'Failed to triage symptoms' });
    }
  });

  // 12. Real Gemini 2.5 Flash Clinical Pharmacology Drug Interaction Checker
  app.post('/api/drugs/check-interactions', async (req, res) => {
    try {
      const { medications } = req.body;
      if (!medications || !Array.isArray(medications) || medications.length < 2) {
        return res.status(400).json({ success: false, error: 'At least 2 medications are required for interaction check' });
      }

      const prompt = `أنت بروفيسور واستشاري في علم الأدوية السريرية والصيدلة الإكلينيكية (Clinical Pharmacologist).
قم بفحص وتقييم التفاعلات والتعارضات الدوائية المحتملة بدقة علمية بين الأدوية التالية (التي قد تشمل أسماء تجارية مصرية أو مواد فعالة):
${JSON.stringify(medications)}

المطلوب:
1. فحص كيميائي وسريري دقيق لجميع احتمالات التداخل بين كل زوج من الأدوية (Drug-Drug Interactions).
2. تحديد مستوى الخطورة لكل تعارض:
   - "high": تعارض خطير مهدد للحياة أو مضاد استطباب مطلق (Contraindicated)
   - "moderate": تداخل متوسط يتطلب تعديل الجرعات أو مباعدة مواعيد التناول
   - "minor": تداخل بسيط لا يستدعي إيقاف العلاج
3. الآلية البيولوجية والدوائية (Pharmacokinetic / Pharmacodynamic Mechanism).
4. التوصية السريرية المحددة للطبيب والصيدلي والمريض.

أرجع النتيجة بصيغة JSON حصراً بهذا الهيكل:
{
  "isSafe": false,
  "interactionsCount": 1,
  "summary": "ملخص عام لدرجة سلامة الأدوية معاً",
  "alerts": [
    {
      "drugA": "اسم الدواء الأول",
      "drugB": "اسم الدواء الثاني",
      "severity": "high",
      "severityText": "تعارض مرتفع الخطورة",
      "mechanism": "الآلية العلمية بالتفصيل...",
      "clinicalAdvice": "التوصية الطبية والبدائل الآمنة..."
    }
  ],
  "generalPrecautions": "إرشادات عامة للمريض حول مواعيد تناول هذه الأدوية مع الطعام أو السوائل"
}`;

      const ai = getGenAI();
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const rawText = response.text || '{}';
      const parsed = JSON.parse(rawText);
      return res.json({ success: true, data: parsed });
    } catch (err: any) {
      console.error('Error in drug interaction check:', err);
      return res.status(500).json({ success: false, error: err.message || 'Failed to check drug interactions' });
    }
  });

  // ===================== VITE MIDDLEWARE / STATIC =====================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: PORT },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[CarePro Backend API Server] running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
