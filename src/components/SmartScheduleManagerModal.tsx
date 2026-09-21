import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Calendar, 
  ShieldCheck, 
  AlertCircle, 
  UserCheck, 
  Users, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Bell, 
  Timer, 
  Lock, 
  Unlock, 
  Activity, 
  X, 
  Sparkles,
  Send,
  UserPlus
} from 'lucide-react';
import { Doctor, Booking, ShiftRule, ClinicQueueDrift, AppointmentServiceType } from '../types';
import { 
  getDoctorShiftRules, 
  saveDoctorShiftRules, 
  getClinicDrift, 
  updateClinicDrift, 
  createWalkInBooking, 
  formatAppointmentReminderMessage,
  generateSmartSlotsForDay 
} from '../services/smartScheduleEngine';

interface SmartScheduleManagerModalProps {
  doctor: Doctor;
  isOpen: boolean;
  onClose: () => void;
  bookings: Booking[];
  onAddBooking: (booking: Booking) => void;
  onUpdateBookingStatus: (bookingId: string, status: Booking['status']) => Promise<void> | void;
}

export const SmartScheduleManagerModal: React.FC<SmartScheduleManagerModalProps> = ({
  doctor,
  isOpen,
  onClose,
  bookings,
  onAddBooking,
  onUpdateBookingStatus
}) => {
  const [activeTab, setActiveTab] = useState<'SHIFTS' | 'LIVE_QUEUE' | 'WALK_IN' | 'COLLISION_AUDIT'>('LIVE_QUEUE');
  
  // Shift Rules State
  const [rules, setRules] = useState<ShiftRule[]>([]);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [queueError, setQueueError] = useState<string | null>(null);

  const handleQueueStatusChange = async (bookingId: string, status: Booking['status']) => {
    setQueueError(null);
    try {
      await onUpdateBookingStatus(bookingId, status);
    } catch (err: any) {
      setQueueError(err.message || 'فشل تحديث حالة المريض بالعيادة.');
    }
  };

  // Clinic Drift & Delay State
  const [drift, setDrift] = useState<ClinicQueueDrift>({
    doctorId: doctor.id,
    isDelayed: false,
    delayMinutes: 0,
    currentConsultationPaceMinutes: 20,
    expectedStartTime: 'في الموعد المحدد',
    lastUpdated: new Date().toISOString()
  });
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastSent, setBroadcastSent] = useState(false);

  // Walk-in form state
  const [walkInName, setWalkInName] = useState('');
  const [walkInPhone, setWalkInPhone] = useState('');
  const [walkInService, setWalkInService] = useState<AppointmentServiceType>('new_checkup');
  const [walkInSuccess, setWalkInSuccess] = useState(false);

  // Load initial data
  useEffect(() => {
    if (isOpen && doctor) {
      setRules(getDoctorShiftRules(doctor.id));
      setDrift(getClinicDrift(doctor.id));
    }
  }, [isOpen, doctor]);

  if (!isOpen) return null;

  // Doctor bookings for today
  const doctorBookings = bookings.filter(b => b.doctorId === doctor.id && b.status !== 'cancelled');
  const activeServing = doctorBookings.find(b => b.status === 'in_consultation');
  const waitingPatients = doctorBookings.filter(b => b.status === 'confirmed');
  const completedPatients = doctorBookings.filter(b => b.status === 'completed');

  // Handle saving shift rules
  const handleSaveRules = () => {
    saveDoctorShiftRules(doctor.id, rules);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Handle adding a new shift
  const handleAddShift = () => {
    const newShift: ShiftRule = {
      id: `${doctor.id}-shift-${Date.now()}`,
      dayOfWeek: 0,
      dayName: 'الأحد',
      startTime: '18:00',
      endTime: '22:00',
      slotDurationMinutes: 20,
      bufferMinutes: 5,
      maxCapacity: 12,
      allowWalkIns: true,
      active: true
    };
    setRules([...rules, newShift]);
  };

  // Handle updating delay status
  const handleUpdateDelay = (minutes: number, reason?: string) => {
    const updated: ClinicQueueDrift = {
      doctorId: doctor.id,
      isDelayed: minutes > 0,
      delayMinutes: minutes,
      currentConsultationPaceMinutes: 20,
      expectedStartTime: minutes > 0 ? `تأخير متوقع ${minutes} دقيقة` : 'في الموعد المنضبط',
      doctorMessage: reason || (minutes > 0 ? `نعتذر عن تأخير العيادة قرابة ${minutes} دقيقة بسبب حالة طارئة.` : undefined),
      lastUpdated: new Date().toISOString()
    };
    setDrift(updated);
    updateClinicDrift(updated);
  };

  // Handle sending broadcast delay alert
  const handleSendBroadcast = () => {
    setBroadcastSent(true);
    setTimeout(() => setBroadcastSent(false), 4000);
  };

  // Handle adding a walk-in patient
  const handleCreateWalkIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!walkInName.trim() || !walkInPhone.trim()) return;

    const nextQueueNum = (doctorBookings.length > 0 ? Math.max(...doctorBookings.map(b => b.queueNumber || 1)) : 0) + 1;
    const newBooking = createWalkInBooking({
      doctor,
      patientName: walkInName.trim(),
      patientPhone: walkInPhone.trim(),
      serviceType: walkInService,
      queueNumber: nextQueueNum
    });

    onAddBooking(newBooking);
    setWalkInName('');
    setWalkInPhone('');
    setWalkInSuccess(true);
    setTimeout(() => setWalkInSuccess(false), 3000);
  };

  // Generate real-time matrix
  const smartSlots = generateSmartSlotsForDay({
    doctor,
    dateStr: 'اليوم',
    dayName: 'اليوم',
    existingBookings: bookings
  });

  return (
    <div 
      id="smart-schedule-manager-modal" 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-900/80 backdrop-blur-md overflow-y-auto"
      dir="rtl"
    >
      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-auto flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-teal-950 p-6 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">نظام إدارة المواعيد وجدولة العيادة الذكي</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Clean Architecture
                </span>
              </div>
              <p className="text-xs text-stone-300 mt-1">
                {doctor.name} • {doctor.specialty}
              </p>
            </div>
          </div>

          <button
            id="close-schedule-manager-btn"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white flex items-center justify-center transition-all"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-stone-100/80 px-6 py-2 border-b border-stone-200 flex items-center gap-2 overflow-x-auto shrink-0">
          <button
            id="tab-live-queue"
            onClick={() => setActiveTab('LIVE_QUEUE')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'LIVE_QUEUE'
                ? 'bg-white text-teal-800 shadow-sm border border-stone-200/80 font-bold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Timer className="w-4 h-4 text-teal-600" />
            <span>حركة العيادة ومنع التأخير</span>
            {drift.isDelayed && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            )}
          </button>

          <button
            id="tab-shift-rules"
            onClick={() => setActiveTab('SHIFTS')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'SHIFTS'
                ? 'bg-white text-teal-800 shadow-sm border border-stone-200/80 font-bold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Calendar className="w-4 h-4 text-teal-600" />
            <span>فترات العمل ومدد الكشف</span>
          </button>

          <button
            id="tab-walk-in"
            onClick={() => setActiveTab('WALK_IN')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'WALK_IN'
                ? 'bg-white text-teal-800 shadow-sm border border-stone-200/80 font-bold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <UserPlus className="w-4 h-4 text-teal-600" />
            <span>شباك الاستقبال (Walk-in)</span>
          </button>

          <button
            id="tab-collision"
            onClick={() => setActiveTab('COLLISION_AUDIT')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'COLLISION_AUDIT'
                ? 'bg-white text-teal-800 shadow-sm border border-stone-200/80 font-bold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>مصفوفة الحماية من التضارب</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 bg-stone-50/50">

          {/* TAB 1: LIVE QUEUE & ANTI-DELAY CONTROLLER */}
          {activeTab === 'LIVE_QUEUE' && (
            <div className="space-y-6">
              {/* Delay Controller Header Card */}
              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      drift.isDelayed ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-stone-900 text-base">حالة انضباط المواعيد ومؤشر التأخير</h3>
                      <p className="text-xs text-stone-500">
                        {drift.isDelayed 
                          ? `العيادة متأخرة حالياً بمقدار (${drift.delayMinutes} دقيقة) عن الجدول الزمني.`
                          : 'العيادة تعمل بانضباط تام وفق الجدول الزمني المحدد.'}
                      </p>
                    </div>
                  </div>

                  {/* Delay Presets */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => handleUpdateDelay(0)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        drift.delayMinutes === 0
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                      }`}
                    >
                      منضبط (0 د)
                    </button>
                    <button
                      onClick={() => handleUpdateDelay(15, 'تأخير بسيط بسبب استشارة تخصصية دقيقة')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        drift.delayMinutes === 15
                          ? 'bg-amber-500 text-white shadow-sm'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                      }`}
                    >
                      +15 دقيقة
                    </button>
                    <button
                      onClick={() => handleUpdateDelay(30, 'تأخير ناتج عن فحص حالة طارئة مستعجلة')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        drift.delayMinutes === 30
                          ? 'bg-amber-600 text-white shadow-sm'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                      }`}
                    >
                      +30 دقيقة
                    </button>
                    <button
                      onClick={() => handleUpdateDelay(45, 'تأخير لوجود إجراء جراحي صغرى غير مجدول')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        drift.delayMinutes === 45
                          ? 'bg-rose-600 text-white shadow-sm'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                      }`}
                    >
                      +45 دقيقة
                    </button>
                  </div>
                </div>

                {/* Broadcast Delay Notice to Queued Patients */}
                {drift.isDelayed && (
                  <div className="bg-amber-50 p-4 rounded-xl border border-amber-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-amber-800 text-xs font-bold">
                        <Bell className="w-4 h-4" />
                        <span>إذاعة إشعار التأخير الفوري للمرضى في قائمة الانتظار</span>
                      </div>
                      <span className="text-[11px] text-amber-700">
                        {waitingPatients.length} مرضى ينتظرون دورهم
                      </span>
                    </div>

                    <p className="text-xs text-amber-900 leading-relaxed">
                      💡 <strong>الحل الهندسي لمشكلة العيادات المصرية:</strong> بدلاً من حضور المرضى وتكدسهم في غرفة الانتظار لساعات، يتم إرسال رسالة آلية مع الميعاد المعدل المقترح لتوفير وقت الجميع.
                    </p>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={broadcastMessage || drift.doctorMessage || ''}
                        onChange={(e) => setBroadcastMessage(e.target.value)}
                        placeholder="رسالة مخصصة للمرضى في الطابور..."
                        className="flex-1 px-3 py-2 rounded-lg text-xs bg-white border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                      <button
                        onClick={handleSendBroadcast}
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>إرسال فوري للمرضى</span>
                      </button>
                    </div>

                    {broadcastSent && (
                      <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-bold flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>تم إرسال إشعار التعديل الزمني لجميع المرضى المسجلين بنجاح.</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Queue Error Banner if active */}
              {queueError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{queueError}</span>
                  </div>
                  <button onClick={() => setQueueError(null)} className="text-rose-600 hover:text-rose-900 font-bold">✕</button>
                </div>
              )}

              {/* Active Consultation & Live Patients Stream */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Active in room */}
                <div className="bg-white p-5 rounded-2xl border border-teal-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between border-b border-teal-100 pb-2">
                    <span className="text-xs font-bold text-teal-900 flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-teal-600 animate-pulse" />
                      الحالة قيد الكشف الآن
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800">
                      غرفة الطبيب
                    </span>
                  </div>

                  {activeServing ? (
                    <div className="p-4 bg-teal-50/50 rounded-xl border border-teal-200/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-stone-900">{activeServing.patientName}</span>
                        <span className="text-xs font-bold text-teal-700 bg-white px-2 py-0.5 rounded-md border border-teal-200">
                          دور #{activeServing.queueNumber || 1}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-600">
                        📞 {activeServing.patientPhone} • الموعد: {activeServing.slot}
                      </p>
                      <button
                        onClick={() => handleQueueStatusChange(activeServing.id, 'completed')}
                        className="w-full mt-2 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>إنهاء الكشف واستدعاء التالي</span>
                      </button>
                    </div>
                  ) : (
                    <div className="p-6 text-center text-stone-400 space-y-2 bg-stone-50 rounded-xl border border-dashed border-stone-200">
                      <Users className="w-8 h-8 mx-auto text-stone-300" />
                      <p className="text-xs font-semibold">لا يوجد مريض داخل غرفة الكشف حالياً</p>
                    </div>
                  )}
                </div>

                {/* Queue list */}
                <div className="md:col-span-2 bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                    <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-stone-600" />
                      قائمة الانتظار بالعيادة ({waitingPatients.length} مريض)
                    </span>
                    <span className="text-[11px] text-stone-500">
                      مكتمل اليوم: {completedPatients.length}
                    </span>
                  </div>

                  {waitingPatients.length > 0 ? (
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                      {waitingPatients.map((booking, idx) => (
                        <div 
                          key={booking.id}
                          className="p-3 bg-stone-50 hover:bg-stone-100 rounded-xl border border-stone-200/80 flex items-center justify-between gap-3 transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 font-bold text-xs flex items-center justify-center shrink-0">
                              #{booking.queueNumber || idx + 1}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs text-stone-900">{booking.patientName}</span>
                                {booking.patientNotes?.includes('Walk-in') && (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-100 text-purple-700">
                                    استقبال مباشر
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-stone-500">
                                🕒 {booking.slot} • {booking.patientPhone}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleQueueStatusChange(booking.id, 'in_consultation')}
                              className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
                            >
                              بدء الكشف
                            </button>
                            <button
                              onClick={() => handleQueueStatusChange(booking.id, 'cancelled')}
                              className="px-2.5 py-1.5 bg-stone-200 hover:bg-rose-100 hover:text-rose-700 text-stone-700 rounded-lg text-xs font-bold transition-all cursor-pointer"
                              title="اعتذار أو عدم حضور (No-show)"
                            >
                              اعتذار
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-stone-400 space-y-2 bg-stone-50 rounded-xl">
                      <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500/50" />
                      <p className="text-xs font-semibold text-stone-600">لا توجد حالات انتظار إضافية في طابور اليوم.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SHIFTS & SLOT RULES CONFIGURATOR */}
          {activeTab === 'SHIFTS' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-stone-900 text-base">جدولة فترات العمل وأزمنة الكشف</h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    تخصيص أيام وساعات العمل، وتحديد زمن الكشف (مثلاً 20 دقيقة) وفترة الراحة بين الكشوفات.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleAddShift}
                    className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>إضافة فترة عمل جديدة</span>
                  </button>
                  <button
                    onClick={handleSaveRules}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>حفظ التعديلات</span>
                  </button>
                </div>
              </div>

              {savedSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>تم حفظ وتحديث قواعد فترات عمل الطبيب بنجاح وتطبيقها على المنظومة فورياً.</span>
                </div>
              )}

              {/* Shifts List */}
              <div className="space-y-3">
                {rules.map((rule, idx) => (
                  <div 
                    key={rule.id}
                    className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm grid grid-cols-1 sm:grid-cols-6 gap-3 items-center"
                  >
                    <div className="sm:col-span-1">
                      <label className="block text-[10px] font-bold text-stone-500 mb-1">اليوم</label>
                      <select
                        value={rule.dayName}
                        onChange={(e) => {
                          const updated = [...rules];
                          updated[idx].dayName = e.target.value;
                          setRules(updated);
                        }}
                        className="w-full px-2.5 py-1.5 text-xs font-bold bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="السبت">السبت</option>
                        <option value="الأحد">الأحد</option>
                        <option value="الإثنين">الإثنين</option>
                        <option value="الثلاثاء">الثلاثاء</option>
                        <option value="الأربعاء">الأربعاء</option>
                        <option value="الخميس">الخميس</option>
                        <option value="الجمعة">الجمعة</option>
                      </select>
                    </div>

                    <div className="sm:col-span-1">
                      <label className="block text-[10px] font-bold text-stone-500 mb-1">من الساعة</label>
                      <input
                        type="time"
                        value={rule.startTime}
                        onChange={(e) => {
                          const updated = [...rules];
                          updated[idx].startTime = e.target.value;
                          setRules(updated);
                        }}
                        className="w-full px-2.5 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg"
                      />
                    </div>

                    <div className="sm:col-span-1">
                      <label className="block text-[10px] font-bold text-stone-500 mb-1">إلى الساعة</label>
                      <input
                        type="time"
                        value={rule.endTime}
                        onChange={(e) => {
                          const updated = [...rules];
                          updated[idx].endTime = e.target.value;
                          setRules(updated);
                        }}
                        className="w-full px-2.5 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg"
                      />
                    </div>

                    <div className="sm:col-span-1">
                      <label className="block text-[10px] font-bold text-stone-500 mb-1">مدة الكشف</label>
                      <select
                        value={rule.slotDurationMinutes}
                        onChange={(e) => {
                          const updated = [...rules];
                          updated[idx].slotDurationMinutes = parseInt(e.target.value, 10);
                          setRules(updated);
                        }}
                        className="w-full px-2.5 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg"
                      >
                        <option value={15}>١٥ دقيقة</option>
                        <option value={20}>٢٠ دقيقة</option>
                        <option value={30}>٣٠ دقيقة</option>
                        <option value={45}>٤٥ دقيقة</option>
                      </select>
                    </div>

                    <div className="sm:col-span-1">
                      <label className="block text-[10px] font-bold text-stone-500 mb-1">السعة القصوى</label>
                      <input
                        type="number"
                        value={rule.maxCapacity}
                        onChange={(e) => {
                          const updated = [...rules];
                          updated[idx].maxCapacity = parseInt(e.target.value, 10);
                          setRules(updated);
                        }}
                        className="w-full px-2.5 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg"
                        min={1}
                        max={50}
                      />
                    </div>

                    <div className="sm:col-span-1 flex items-center justify-end gap-2 pt-3 sm:pt-0">
                      <button
                        onClick={() => {
                          const updated = rules.filter((_, i) => i !== idx);
                          setRules(updated);
                        }}
                        className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                        title="حذف هذه الفترة"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: WALK-IN DESK */}
          {activeTab === 'WALK_IN' && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
                <div className="flex items-center gap-3 border-b border-stone-100 pb-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-900 text-base">تسجيل كشف استقبال مباشر (Walk-In)</h3>
                    <p className="text-xs text-stone-500">
                      إدراج المرضى الحاضرين مباشرة إلى العيادة دون حجز إلكتروني مسبق مع منع التضارب مع المواعيد المحجوزة أونلاين.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleCreateWalkIn} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">اسم المريض بالكامل *</label>
                    <input
                      type="text"
                      required
                      value={walkInName}
                      onChange={(e) => setWalkInName(e.target.value)}
                      placeholder="مثال: حسام الدين محمود"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">رقم الهاتف للتواصل *</label>
                      <input
                        type="tel"
                        required
                        value={walkInPhone}
                        onChange={(e) => setWalkInPhone(e.target.value)}
                        placeholder="01XXXXXXXXX"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">نوع الكشف / الخدمة</label>
                      <select
                        value={walkInService}
                        onChange={(e) => setWalkInService(e.target.value as AppointmentServiceType)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                      >
                        <option value="new_checkup">كشف جديد (فحص كامل)</option>
                        <option value="follow_up">إعادة كشف / استشارة</option>
                        <option value="urgent_consult">حالة طارئة مستعجلة</option>
                        <option value="procedure">إجراء طبي / غيار / جلسة</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>طباعة التذكرة وإدراج المريض في الطابور المباشر</span>
                  </button>

                  {walkInSuccess && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>تم تسجيل المريض المباشر وحجز التذكرة بنجاح في نظام العيادة.</span>
                    </div>
                  )}
                </form>
              </div>
            </div>
          )}

          {/* TAB 4: ANTI-COLLISION & CONCURRENCY MATRIX */}
          {activeTab === 'COLLISION_AUDIT' && (
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <div>
                    <h3 className="font-bold text-stone-900 text-base">مصفوفة الرصد الحي وحماية الحجز المتزامن</h3>
                    <p className="text-xs text-stone-500">
                      نظام القفل الذري (Atomic Slot Lock) يمنع حجز مريضين لنفس الموعد في نفس اللحظة مع حماية لمدة 5 دقائق.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      متاح
                    </span>
                    <span className="flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                      <Lock className="w-3 h-3 text-amber-600" />
                      قفل مؤقت (5 د)
                    </span>
                    <span className="flex items-center gap-1 text-[11px] font-bold text-stone-700 bg-stone-100 px-2.5 py-1 rounded-lg border border-stone-200">
                      <UserCheck className="w-3 h-3 text-teal-600" />
                      محجوز أونلاين
                    </span>
                  </div>
                </div>

                {/* Slots Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {smartSlots.map((slot) => (
                    <div
                      key={slot.id}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        slot.status === 'booked_online'
                          ? 'bg-stone-100 border-stone-300 text-stone-800'
                          : slot.status === 'locked_temporary'
                          ? 'bg-amber-50 border-amber-300 text-amber-900 animate-pulse'
                          : 'bg-emerald-50/50 border-emerald-200 text-emerald-900 hover:border-emerald-400'
                      }`}
                    >
                      <div className="text-xs font-bold">{slot.timeStr}</div>
                      <div className="text-[10px] mt-1 font-semibold">
                        {slot.status === 'booked_online' && `محجوز (${slot.patientName?.split(' ')[0] || 'مريض'})`}
                        {slot.status === 'locked_temporary' && 'قيد الحجز...'}
                        {slot.status === 'available' && 'متاح للحجز'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-stone-100 p-4 border-t border-stone-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>نظام الحماية من الحجز المزدوج وضبط التأخير نشط 100%</span>
          </div>

          <button
            id="done-schedule-manager-btn"
            onClick={onClose}
            className="px-6 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            إغلاق النافذة
          </button>
        </div>

      </div>
    </div>
  );
};
