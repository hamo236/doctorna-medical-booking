import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Clock, 
  CheckCircle2, 
  FileText, 
  Plus, 
  Calendar, 
  DollarSign, 
  Phone, 
  MapPin, 
  UserCheck, 
  Sparkles, 
  AlertCircle,
  PlayCircle,
  Stethoscope,
  ChevronDown,
  Search,
  Sliders,
  Send,
  Trash2,
  KeyRound,
  ShieldCheck,
  Eye,
  Pill,
  Activity,
  Timer
} from 'lucide-react';
import { Doctor, Booking, MedicationItem, MedicalRecord } from '../types';
import { SmartScheduleManagerModal } from './SmartScheduleManagerModal';

interface DoctorDashboardProps {
  doctors: Doctor[];
  bookings: Booking[];
  onUpdateBookingStatus: (id: string, status: Booking['status'], ePrescription?: Booking['ePrescription']) => Promise<void>;
  onAddRecord: (record: MedicalRecord) => Promise<void>;
  onUpdateDoctorProfile?: (doctorId: string, updates: Partial<Doctor>) => void;
  onAddBooking?: (booking: Booking) => void;
}

export const DoctorDashboard: React.FC<DoctorDashboardProps> = ({
  doctors,
  bookings,
  onUpdateBookingStatus,
  onAddRecord,
  onUpdateDoctorProfile,
  onAddBooking
}) => {
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(doctors[0]?.id || 'doc-1');
  const [activeTab, setActiveTab] = useState<'queue' | 'schedule' | 'patients' | 'shared_records'>('queue');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSmartScheduleOpen, setIsSmartScheduleOpen] = useState(false);


  // PIN Unlock State for Shared Medical Records
  const [accessPin, setAccessPin] = useState('');
  const [isVerifyingPin, setIsVerifyingPin] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);
  const [sharedPatientData, setSharedPatientData] = useState<{
    records: MedicalRecord[];
    patientName: string;
    remainingMinutes: number;
  } | null>(null);

  const handleVerifyPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessPin.trim()) {
      setPinError('يرجى إدخال رمز المرور المؤقت');
      return;
    }
    setPinError(null);
    setIsVerifyingPin(true);
    try {
      const cleanPin = accessPin.trim();
      const res = await fetch(`/api/records/shared/${cleanPin}`);
      const json = await res.json();
      if (res.ok && json.success) {
        setSharedPatientData({
          records: json.data || [],
          patientName: json.patientName || 'المريض',
          remainingMinutes: json.remainingMinutes || 60
        });
      } else {
        setPinError(json.error || 'رمز المرور غير صحيح أو انتهت صلاحيته');
        setSharedPatientData(null);
      }
    } catch (err: any) {
      setPinError('فشل الاتصال بالخادم للتحقق من الرمز');
    } finally {
      setIsVerifyingPin(false);
    }
  };
  
  // E-Prescription Writer Modal State
  const [activeConsultationBooking, setActiveConsultationBooking] = useState<Booking | null>(null);
  const [diagnosis, setDiagnosis] = useState('');
  const [prescNotes, setPrescNotes] = useState('');
  const [medsList, setMedsList] = useState<MedicationItem[]>([
    { name: '', dose: '', frequency: '', duration: '' }
  ]);
  const [isPrescriptionSent, setIsPrescriptionSent] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const currentDoctor = useMemo(() => doctors.find(d => d.id === selectedDoctorId) || doctors[0], [doctors, selectedDoctorId]);
  
  // Filter bookings for this doctor
  const doctorBookings = useMemo(() => bookings.filter(b => b.doctorId === selectedDoctorId), [bookings, selectedDoctorId]);

  const waitingPatients = useMemo(() => doctorBookings.filter(b => b.status === 'confirmed'), [doctorBookings]);
  const inConsultationPatient = useMemo(() => doctorBookings.find(b => b.status === 'in_consultation'), [doctorBookings]);
  const completedPatients = useMemo(() => doctorBookings.filter(b => b.status === 'completed'), [doctorBookings]);

  // Add Medication Row in Prescription
  const handleAddMedRow = () => {
    setMedsList([...medsList, { name: '', dose: '', frequency: '', duration: '' }]);
  };

  const handleMedChange = (index: number, field: keyof MedicationItem, value: string) => {
    const updated = [...medsList];
    updated[index][field] = value;
    setMedsList(updated);
  };

  const handleRemoveMedRow = (index: number) => {
    if (medsList.length === 1) return;
    setMedsList(medsList.filter((_, i) => i !== index));
  };

  // Open Prescription Writer
  const handleStartConsultation = async (booking: Booking) => {
    setActionError(null);
    try {
      await onUpdateBookingStatus(booking.id, 'in_consultation');
      setActiveConsultationBooking(booking);
      setDiagnosis('');
      setPrescNotes('');
      setMedsList([{ name: '', dose: '', frequency: '', duration: '' }]);
      setIsPrescriptionSent(false);
    } catch (err: any) {
      setActionError(err.message || 'فشل بدء الكشف');
    }
  };

  // Submit Prescription & Complete Consultation
  const handleCompleteConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConsultationBooking) return;
    setActionError(null);

    const validMeds = medsList.filter(m => m.name.trim().length > 0);

    const prescriptionData = {
      diagnosis: diagnosis.trim() || 'كشف عيادة ومتابعة عامة',
      medications: validMeds,
      notes: prescNotes.trim(),
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    try {
      // 1. Update Booking status to completed with ePrescription attached
      await onUpdateBookingStatus(activeConsultationBooking.id, 'completed', prescriptionData);

      // 2. Automatically generate a real Medical Record in patient's profile!
      const newRecord: MedicalRecord = {
        id: `rec-${Date.now()}`,
        title: `روشتة طبية - ${activeConsultationBooking.specialty}`,
        type: 'prescription',
        doctorName: activeConsultationBooking.doctorName,
        specialty: activeConsultationBooking.specialty,
        date: new Date().toISOString().split('T')[0],
        clinicOrLab: activeConsultationBooking.location || 'العيادة التخصصية',
        notes: `التشخيص: ${diagnosis || 'فحص سريري واستشارة'}. ${prescNotes}`,
        patientPhone: activeConsultationBooking.patientPhone,
        medications: validMeds
      };
      await onAddRecord(newRecord);

      setIsPrescriptionSent(true);
      setTimeout(() => {
        setActiveConsultationBooking(null);
        setIsPrescriptionSent(false);
      }, 1500);
    } catch (err: any) {
      setActionError(err.message || 'فشل إنهاء الكشف وإرسال الروشتة');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-body">
      {/* Header & Doctor Selector */}
      {actionError && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-2xl text-xs sm:text-sm font-bold text-red-800 dark:text-red-200 flex items-center justify-between gap-3 shadow-sm animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{actionError}</span>
          </div>
          <button onClick={() => setActionError(null)} className="text-red-600 hover:text-red-900 cursor-pointer">✕</button>
        </div>
      )}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-teal-50 dark:bg-slate-800 text-[#088395] dark:text-teal-400 border border-teal-200/80 dark:border-slate-700 flex items-center justify-center shrink-0">
              <Stethoscope className="w-8 h-8 stroke-[1.9]" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs bg-teal-50 dark:bg-teal-950/80 text-[#088395] dark:text-teal-300 font-bold px-2.5 py-0.5 rounded-full border border-teal-200/80 dark:border-teal-800 font-heading">
                  لوحة تحكم الطبيب والعيادة
                </span>
                <span className="text-xs text-slate-500 font-semibold font-heading">حساب العيادة المعتمد</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#0A2540] dark:text-white font-heading">
                {currentDoctor?.name || 'لوحة تحكم الطبيب'}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                {currentDoctor?.specialty} • {currentDoctor?.city} - {currentDoctor?.area}
              </p>
            </div>
          </div>

          {/* Quick Doctor Account Switcher & Smart Schedule Manager */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto font-heading">
            <button
              id="open-smart-schedule-btn"
              onClick={() => setIsSmartScheduleOpen(true)}
              className="btn-clinical-primary text-xs py-2.5 flex items-center justify-center gap-2 w-full sm:w-auto min-h-[42px]"
            >
              <Activity className="w-4 h-4 text-teal-200 animate-pulse" />
              <span>غرفة عمليات المواعيد ومنع التأخير</span>
            </button>

            <div className="bg-slate-50 dark:bg-slate-800/80 p-2 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between sm:justify-start gap-2">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300 shrink-0">العيادة الحالية:</span>
              <select
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
                className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs font-bold py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 outline-none cursor-pointer flex-1 sm:flex-initial"
              >
                {doctors.map(doc => (
                  <option key={doc.id} value={doc.id}>
                    {doc.name} ({doc.specialtyId})
                  </option>
                ))}
              </select>
            </div>
          </div>

        </div>

        {/* Quick KPI Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
          <div className="bg-teal-50/50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-teal-100/80 dark:border-slate-700">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-bold block mb-1 font-heading">المرضى في الانتظار</span>
            <span className="text-2xl font-bold text-[#088395] dark:text-teal-400 font-mono">{waitingPatients.length}</span>
          </div>

          <div className="bg-amber-50/60 dark:bg-slate-800/60 p-3.5 rounded-xl border border-amber-100 dark:border-slate-700">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-bold block mb-1 font-heading">في غرفة الكشف</span>
            <span className="text-2xl font-bold text-amber-600 dark:text-amber-400 font-mono">
              {inConsultationPatient ? '١ مريض' : 'لا يوجد'}
            </span>
          </div>

          <div className="bg-emerald-50/60 dark:bg-slate-800/60 p-3.5 rounded-xl border border-emerald-100 dark:border-slate-700">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-bold block mb-1 font-heading">تم الكشف اليوم</span>
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">{completedPatients.length}</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-bold block mb-1 font-heading">متوسط مدة الانتظار</span>
            <span className="text-xl font-bold text-slate-900 dark:text-white font-mono">{currentDoctor?.waitingTime || '٢٠ دقيقة'}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto scrollbar-none font-heading">
        <button
          onClick={() => setActiveTab('queue')}
          className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'queue'
              ? 'bg-[#088395] text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>طابور الكشف المباشر ({waitingPatients.length + (inConsultationPatient ? 1 : 0)})</span>
        </button>

        <button
          onClick={() => setActiveTab('patients')}
          className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'patients'
              ? 'bg-[#088395] text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>سجل الكشوفات والروشتات ({completedPatients.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('schedule')}
          className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'schedule'
              ? 'bg-[#088395] text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>إدارة مواعيد وساعات عمل العيادة</span>
        </button>

        <button
          onClick={() => setActiveTab('shared_records')}
          className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'shared_records'
              ? 'bg-[#088395] text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>فتح ملف مريض برمز PIN</span>
        </button>
      </div>

      {/* Tab 1: Live Clinic Queue & Patient Flow */}
      {activeTab === 'queue' && (
        <div className="space-y-6">
          
          {/* Active In-Consultation Banner */}
          {inConsultationPatient && (
            <div className="bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-800 rounded-3xl p-6 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-mono font-black text-lg shadow-xs">
                    #{inConsultationPatient.queueNumber || 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 font-bold px-2 py-0.5 rounded-md">
                        داخل غرفة الكشف الآن
                      </span>
                      <span className="text-xs text-slate-500 font-mono font-bold">{inConsultationPatient.slot}</span>
                    </div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1">
                      {inConsultationPatient.patientName}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      هاتف: {inConsultationPatient.patientPhone} {inConsultationPatient.patientNotes ? `• الشكوى: ${inConsultationPatient.patientNotes}` : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 font-heading">
                  <button
                    onClick={() => setActiveConsultationBooking(inConsultationPatient)}
                    className="btn-clinical-primary text-xs py-2.5 flex items-center gap-1.5"
                  >
                    <FileText className="w-4 h-4" />
                    <span>كتابة وإصدار الروشتة الطبية</span>
                  </button>
                  <button
                    onClick={async () => {
                    try {
                      setActionError(null);
                      await onUpdateBookingStatus(inConsultationPatient.id, 'completed');
                    } catch (err: any) {
                      setActionError(err.message || 'حدث خطأ غير متوقع');
                    }
                  }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-all active:scale-98"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>إنهاء الكشف</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Waiting Queue List */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800 font-heading">
              <h3 className="font-bold text-base text-[#0A2540] dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-[#088395] dark:text-teal-400" />
                <span>قائمة انتظار المرضى بالعيادة ({waitingPatients.length})</span>
              </h3>
              <span className="text-xs text-slate-500 font-medium">يتم ترتيب الدور بحسب وقت وتذكرة الحجز</span>
            </div>

            {waitingPatients.length === 0 ? (
              <div className="text-center py-12 space-y-3 font-body">
                <div className="w-12 h-12 rounded-full bg-teal-50 dark:bg-slate-800 text-[#088395] dark:text-teal-400 flex items-center justify-center mx-auto border border-teal-100 dark:border-slate-700">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 font-heading">لا يوجد مرضى في قاعة الانتظار حالياً</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto font-medium">
                  جميع المرضى المسجلين تم الكشف عليهم بنجاح أو لم يحن موعدهم بعد.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {waitingPatients.map((booking, idx) => (
                  <div 
                    key={booking.id}
                    className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start sm:items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[#088395] dark:text-teal-400 font-mono font-bold text-base flex items-center justify-center shrink-0 shadow-xs">
                        #{booking.queueNumber || (idx + 1)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm font-heading">{booking.patientName}</h4>
                          <span className="text-[11px] font-mono text-slate-500 font-bold bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                            {booking.slot}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex flex-wrap items-center gap-2 font-medium">
                          <span>هاتف: {booking.patientPhone}</span>
                          {booking.patientNotes && <span>• ملاحظة: {booking.patientNotes}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto font-heading">
                      <button
                        onClick={() => handleStartConsultation(booking)}
                        className="btn-clinical-primary text-xs py-2 px-4 flex items-center gap-1.5"
                      >
                        <PlayCircle className="w-4 h-4" />
                        <span>استدعاء لغرفة الكشف</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Completed Patients & Prescriptions Log */}
      {activeTab === 'patients' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs font-body">
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100 dark:border-slate-800 font-heading">
            <h3 className="font-bold text-base text-[#0A2540] dark:text-white">سجل المرضى والكشوفات المكتملة</h3>
            <span className="text-xs text-slate-500 font-semibold font-mono">إجمالي الكشوفات: {completedPatients.length}</span>
          </div>

          {completedPatients.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-xs font-medium">
              لم يتم تسجيل كشوفات مكتملة حتى الآن في هذه الجلسة.
            </div>
          ) : (
            <div className="space-y-4">
              {completedPatients.map((booking) => (
                <div 
                  key={booking.id}
                  className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm font-heading">{booking.patientName}</h4>
                        <span className="text-xs bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                          تم الكشف
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 block mt-0.5 font-medium">
                        التاريخ: {booking.day} ({booking.slot}) • الهاتف: {booking.patientPhone}
                      </span>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                      {booking.fee} ج.م
                    </span>
                  </div>

                  {/* E-Prescription snapshot if available */}
                  {booking.ePrescription && (
                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 rounded-xl">
                      <div className="text-xs font-bold text-[#088395] dark:text-teal-400 mb-1 font-heading">
                        التشخيص الطبي: {booking.ePrescription.diagnosis}
                      </div>
                      {booking.ePrescription.medications.length > 0 && (
                        <div className="space-y-1 mt-2">
                          <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block font-heading">الأدوية الموصوفة:</span>
                          {booking.ePrescription.medications.map((m, i) => (
                            <div key={i} className="text-xs text-slate-700 dark:text-slate-300 font-mono bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700">
                              • {m.name} - {m.dose} ({m.frequency}) {m.duration}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Clinic Schedule Settings */}
      {activeTab === 'schedule' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs max-w-2xl font-body">
          <h3 className="font-bold text-base text-[#0A2540] dark:text-white mb-4 font-heading">إعدادات مواعيد وساعات عمل العيادة</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 font-heading">مدة الانتظار التقريبية</label>
              <input
                type="text"
                defaultValue={currentDoctor?.waitingTime || '٢٠ دقيقة'}
                className="input-clinical text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 font-heading">أيام وساعات العمل بالعيادة</label>
              <div className="space-y-2">
                {currentDoctor?.availableDays.map((d, i) => (
                  <div key={i} className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-heading">{d.dateStr}</span>
                    <span className="text-xs text-slate-500 font-mono">{d.slots.join(' • ')}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 font-heading">
              <button
                type="button"
                className="btn-clinical-primary text-xs py-2.5 px-6"
              >
                حفظ التعديلات
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Open Shared Patient Records via PIN */}
      {activeTab === 'shared_records' && (
        <div className="space-y-6 font-body">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800 font-heading">
              <div className="p-2.5 bg-teal-50 dark:bg-slate-800 text-[#088395] dark:text-teal-400 rounded-xl border border-teal-100 dark:border-slate-700">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-[#0A2540] dark:text-white">
                  الاطلاع على الملف الطبي للمريض عبر رمز المرور المؤقت (PIN)
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  أدخل رمز المرور الذي شاركه المريض معك (مثل CP-123456) لفتح تاريخه الطبي والروشتات السابقة بأمان
                </p>
              </div>
            </div>

            {/* PIN Entry Form */}
            <form onSubmit={handleVerifyPin} className="max-w-md space-y-4 font-body">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 font-heading">
                  رمز المرور الطبي المؤقت (6 أرقام)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    dir="ltr"
                    placeholder="CP-123456"
                    value={accessPin}
                    onChange={(e) => setAccessPin(e.target.value)}
                    className="flex-1 input-clinical font-mono text-sm tracking-wider"
                  />
                  <button
                    type="submit"
                    disabled={isVerifyingPin}
                    className="btn-clinical-primary text-xs py-2.5 px-5 flex items-center gap-1.5 shrink-0 disabled:opacity-50 font-heading"
                  >
                    {isVerifyingPin ? (
                      <span>جاري التحقق...</span>
                    ) : (
                      <>
                        <Eye className="w-4 h-4" />
                        <span>فتح الملف</span>
                      </>
                    )}
                  </button>
                </div>
                {pinError && (
                  <p className="text-xs text-red-500 font-bold mt-2 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{pinError}</span>
                  </p>
                )}
              </div>
            </form>

            {/* Display Shared Patient Data */}
            {sharedPatientData && (
              <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in duration-200 font-body">
                <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    <div>
                      <h4 className="font-bold text-sm text-emerald-950 dark:text-emerald-300 font-heading">
                        تم فتح الملف الطبي للمريض: {sharedPatientData.patientName}
                      </h4>
                      <p className="text-xs text-emerald-800 dark:text-emerald-400 font-medium">
                        متاح للاطلاع خلال {sharedPatientData.remainingMinutes} دقيقة قادمة
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 font-mono">
                    {sharedPatientData.records.length} سجل متاح
                  </span>
                </div>

                {sharedPatientData.records.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4 text-center font-medium">لا توجد سجلات طبية مرفوعة ضمن هذا النطاق.</p>
                ) : (
                  <div className="space-y-3">
                    {sharedPatientData.records.map((rec) => (
                      <div key={rec.id} className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                        <div className="flex items-center justify-between">
                          <h5 className="font-bold text-sm text-slate-900 dark:text-white font-heading">{rec.title}</h5>
                          <span className="text-xs text-slate-500 font-mono">{rec.date}</span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                          الطبيب: {rec.doctorName} • {rec.specialty} ({rec.clinicOrLab})
                        </p>
                        {rec.notes && (
                          <p className="text-xs bg-white dark:bg-slate-900 p-2.5 rounded-lg text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            {rec.notes}
                          </p>
                        )}
                        {rec.medications && rec.medications.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 flex flex-wrap gap-1.5">
                            {rec.medications.map((m, i) => (
                              <span key={i} className="text-[11px] bg-teal-50 dark:bg-teal-900/40 text-[#088395] dark:text-teal-300 px-2 py-0.5 rounded-md font-bold font-mono">
                                {m.name} ({m.dose})
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* E-Prescription Modal */}
      {activeConsultationBooking && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto font-body">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-0 sm:my-6 max-h-[92vh] sm:max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="bg-[#0A2540] text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center text-teal-300">
                  <FileText className="w-5 h-5 text-teal-300" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base font-heading">إصدار روشتة إلكترونية فورية</h3>
                  <p className="text-xs text-slate-300 font-medium">المريض: {activeConsultationBooking.patientName} ({activeConsultationBooking.patientPhone})</p>
                </div>
              </div>
              <button
                onClick={() => setActiveConsultationBooking(null)}
                className="text-slate-300 hover:text-white text-xs bg-white/10 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                إغلاق
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCompleteConsultation} className="p-4 sm:p-6 space-y-4 overflow-y-auto">
              {isPrescriptionSent ? (
                <div className="text-center py-8 space-y-2 font-body">
                  <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white font-heading">تم إصدار الروشتة الطبية بنجاح</h4>
                  <p className="text-xs text-slate-500">تم تسجيل الروشتة في الملف الطبي للمريض فورياً وتحديث سجل الكشف.</p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 font-heading">
                      التشخيص الطبي للحالة <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: التهاب معوي حاد مع جفاف بسيط / حساسية موسمية"
                      value={diagnosis}
                      onChange={(e) => setDiagnosis(e.target.value)}
                      className="input-clinical text-sm"
                    />
                  </div>

                  {/* Medications List */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 font-heading">الأدوية الموصوفة والجرعات</label>
                      <button
                        type="button"
                        onClick={handleAddMedRow}
                        className="text-xs text-[#088395] dark:text-teal-400 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>إضافة دواء</span>
                      </button>
                    </div>

                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {medsList.map((med, index) => (
                        <div key={index} className="grid grid-cols-1 sm:grid-cols-12 gap-2 bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 items-center">
                          <input
                            type="text"
                            placeholder="اسم الدواء (مثال: أوجمنتين 1 جم)"
                            value={med.name}
                            onChange={(e) => handleMedChange(index, 'name', e.target.value)}
                            className="sm:col-span-4 input-clinical text-xs"
                          />
                          <input
                            type="text"
                            placeholder="الجرعة (قرص واحد)"
                            value={med.dose}
                            onChange={(e) => handleMedChange(index, 'dose', e.target.value)}
                            className="sm:col-span-3 input-clinical text-xs"
                          />
                          <input
                            type="text"
                            placeholder="التكرار (كل 12 ساعة)"
                            value={med.frequency}
                            onChange={(e) => handleMedChange(index, 'frequency', e.target.value)}
                            className="sm:col-span-3 input-clinical text-xs"
                          />
                          <div className="sm:col-span-2 flex items-center gap-1">
                            <input
                              type="text"
                              placeholder="المدة (5 أيام)"
                              value={med.duration}
                              onChange={(e) => handleMedChange(index, 'duration', e.target.value)}
                              className="w-full input-clinical text-xs"
                            />
                            {medsList.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveMedRow(index)}
                                className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 font-heading">
                      تعليمات إضافية للمريض (الراحة، التغذية، الفحوصات)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="مثال: شرب كميات وافرة من السوائل، الراحة التامة، إعادة الفحص بعد أسبوع."
                      value={prescNotes}
                      onChange={(e) => setPrescNotes(e.target.value)}
                      className="input-clinical text-xs"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 font-heading">
                    <button
                      type="button"
                      onClick={() => setActiveConsultationBooking(null)}
                      className="btn-clinical-secondary text-xs py-2 px-4"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      className="bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer transition-all"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>إصدار الروشتة وإتمام الكشف</span>
                    </button>
                  </div>
                </>
              )}
            </form>

          </div>
        </div>
      )}

      {/* Smart Schedule & Anti-Delay Manager Modal */}
      {currentDoctor && (
        <SmartScheduleManagerModal
          doctor={currentDoctor}
          isOpen={isSmartScheduleOpen}
          onClose={() => setIsSmartScheduleOpen(false)}
          bookings={bookings}
          onAddBooking={(newBooking) => {
            if (onAddBooking) {
              onAddBooking(newBooking);
            }
          }}
          onUpdateBookingStatus={onUpdateBookingStatus}
        />
      )}

    </div>
  );
};
