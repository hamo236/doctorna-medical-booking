import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Phone, 
  Mail, 
  FileText, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  AlertCircle,
  CalendarCheck,
  Check,
  Shield,
  Building2,
  Lock,
  Timer
} from 'lucide-react';
import { Doctor, Booking } from '../types';
import { DoctorAvatar } from './DoctorAvatar';
import { INSURANCE_COMPANIES } from '../data/seedData';
import { attemptLockSlot, releaseSlotLock } from '../services/smartScheduleEngine';

interface BookingModalProps {
  doctor: Doctor | null;
  day: string;
  slot: string;
  onClose: () => void;
  onCompleteBooking: (booking: Booking) => Promise<void>;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  doctor,
  day,
  slot,
  onClose,
  onCompleteBooking
}) => {
  if (!doctor) return null;

  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [patientNotes, setPatientNotes] = useState('');
  const [bookingFor, setBookingFor] = useState<'self' | 'other'>('self');
  const [hasInsurance, setHasInsurance] = useState(false);
  const [insuranceProvider, setInsuranceProvider] = useState<string>('');
  const [insuranceCardNumber, setInsuranceCardNumber] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  // Lock and Countdown State (5 minutes)
  const [lockExpiresAt, setLockExpiresAt] = useState<number>(Date.now() + 5 * 60 * 1000);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(300);
  const [lockWarning, setLockWarning] = useState<string>('');

  const [submissionError, setSubmissionError] = useState<string | null>(null);

  // Lock the slot on mount
  useEffect(() => {
    const lockResult = attemptLockSlot({
      doctorId: doctor.id,
      dateStr: day,
      timeStr: slot
    });

    if (lockResult.success && lockResult.expiresAt) {
      setLockExpiresAt(lockResult.expiresAt);
    } else {
      setLockWarning(lockResult.message);
    }

    return () => {
      // Release lock on unmount if not submitted
      releaseSlotLock(doctor.id, day, slot);
    };
  }, [doctor.id, day, slot]);

  // Countdown timer loop
  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((lockExpiresAt - Date.now()) / 1000));
      setTimeLeftSeconds(remaining);
      if (remaining <= 0) {
        setLockWarning('انتهت مهلة الحجز المؤقت (5 دقائق). يرجى إعادة اختيار الموعد.');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lockExpiresAt]);

  // Errors
  const [nameError, setNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const validate = () => {
    let valid = true;

    if (!patientName.trim() || patientName.trim().length < 3) {
      setNameError('يرجى إدخال اسم المريض الثلاثي بشكل صحيح');
      valid = false;
    } else {
      setNameError('');
    }

    // Egyptian phone validation: starts with 010, 011, 012, 015 and has 11 digits
    const cleanedPhone = patientPhone.replace(/\s+/g, '');
    const phoneRegex = /^01[0125][0-9]{8}$/;
    if (!phoneRegex.test(cleanedPhone)) {
      setPhoneError('يرجى إدخال رقم هاتف محمول مصري صحيح مكون من 11 رقم (مثال: 01012345678)');
      valid = false;
    } else {
      setPhoneError('');
    }

    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setSubmissionError(null);

    // Generate authentic booking code e.g. #DOC-74912
    const code = '#DOC-' + Math.floor(10000 + Math.random() * 90000);
    const newBooking: Booking = {
      id: code,
      doctorId: doctor.id,
      doctorName: doctor.name,
      doctorTitle: doctor.title,
      specialty: doctor.specialty,
      doctorAvatar: doctor.avatarUrl,
      location: `${doctor.city} - ${doctor.area}: ${doctor.address}`,
      day: day,
      slot: slot,
      patientName: patientName.trim(),
      patientPhone: patientPhone.trim(),
      patientEmail: patientEmail.trim() || undefined,
      patientNotes: patientNotes.trim() || undefined,
      bookingFor: bookingFor,
      bookingDate: new Date().toISOString().split('T')[0],
      status: 'confirmed',
      insuranceProvider: hasInsurance ? insuranceProvider : undefined,
      insuranceCardNumber: hasInsurance ? insuranceCardNumber : undefined
    };

    try {
      await onCompleteBooking(newBooking);
      releaseSlotLock(doctor.id, day, slot);
    } catch (err: any) {
      setSubmissionError(err.message || 'حدث خطأ غير متوقع أثناء إتمام الحجز.');
      setSubmitting(false);
    }
  };


  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200 font-body">
      <div 
        className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#0A2540] text-white p-5 flex items-center justify-between border-b border-slate-800 font-heading">
          <div className="flex items-center gap-2.5">
            <CalendarCheck className="w-5 h-5 text-[#088395]" />
            <h2 className="text-base sm:text-lg font-bold">إتمام حجز موعد كشف العيادة</h2>
          </div>
          <button
            id="btn-close-booking-modal"
            type="button"
            onClick={onClose}
            className="text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Doctor Summary Banner */}
        <div className="bg-slate-50 dark:bg-slate-800/80 p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-4">
          <DoctorAvatar
            specialtyId={doctor.specialtyId}
            gender={doctor.gender}
            verified={doctor.verified}
            size="md"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h4 className="font-bold text-[#0A2540] dark:text-white text-sm truncate font-heading">{doctor.name}</h4>
              <span className="text-xs font-bold text-[#088395] dark:text-teal-400 bg-white dark:bg-slate-900 px-2.5 py-0.5 rounded-md border border-teal-200 dark:border-teal-800 shrink-0 font-heading">
                الكشف: {doctor.fee} ج.م
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 truncate">{doctor.specialty}</p>
            <div className="flex flex-wrap items-center gap-3 text-xs mt-1.5 text-slate-700 dark:text-slate-300">
              <span className="font-bold text-[#088395] dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded border border-teal-200 dark:border-teal-800 font-heading">
                {day} - {slot}
              </span>
              <span className="text-slate-500 dark:text-slate-400">
                {doctor.city} - {doctor.area}
              </span>
            </div>
          </div>
        </div>

        {/* 🔒 Slot Lock & Anti-Double-Booking Banner */}
        <div className="bg-teal-50 dark:bg-teal-950/40 px-4 py-2.5 border-b border-teal-100 dark:border-teal-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-medium text-teal-900 dark:text-teal-200 font-heading">
            <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
            <span>الموعد محجوز مؤقتاً لك لمنع التضارب والحجز المزدوج</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white dark:bg-slate-900 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300 text-xs font-mono font-bold shadow-xs shrink-0">
            <Timer className="w-3.5 h-3.5 text-teal-600" />
            <span>{formatTimer(timeLeftSeconds)}</span>
          </div>
        </div>

        {submissionError && (
          <div className="p-3 bg-red-50 dark:bg-red-950/40 border-b border-red-200 dark:border-red-900 text-red-800 dark:text-red-200 text-xs font-medium flex items-center gap-2 font-heading">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <p>{submissionError}</p>
          </div>
        )}

        {lockWarning && (
          <div className="p-3 bg-amber-50 dark:bg-amber-950/50 border-b border-amber-200 text-amber-900 dark:text-amber-200 text-xs font-medium flex items-center gap-2 font-heading">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{lockWarning}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
          
          {/* Booking For Toggle */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 font-heading">الحجز مخصص لـ:</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setBookingFor('self')}
                className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all cursor-pointer font-heading ${
                  bookingFor === 'self'
                    ? 'bg-teal-50 dark:bg-teal-950/80 border-[#088395] text-[#088395] dark:text-teal-300 ring-1 ring-[#088395]'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                }`}
              >
                أحجز لنفسي
              </button>
              <button
                type="button"
                onClick={() => setBookingFor('other')}
                className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all cursor-pointer font-heading ${
                  bookingFor === 'other'
                    ? 'bg-teal-50 dark:bg-teal-950/80 border-[#088395] text-[#088395] dark:text-teal-300 ring-1 ring-[#088395]'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                }`}
              >
                أحجز لمريض آخر (أحد أفراد الأسرة)
              </button>
            </div>
          </div>

          {/* Patient Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 font-heading">
              اسم المريض بالكامل <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="input-patient-name"
                type="text"
                placeholder="الاسم ثلاثي كما في البطاقة الشخصية"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className={`clinical-input pl-9 text-sm ${
                  nameError ? 'border-red-400' : ''
                }`}
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
            {nameError && (
              <p className="text-[11px] text-red-500 mt-1 font-medium flex items-center gap-1 font-heading">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{nameError}</span>
              </p>
            )}
          </div>

          {/* Patient Phone (Egyptian mobile) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 font-heading">
              رقم الهاتف المحمول (لتأكيد الحجز عبر SMS) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="input-patient-phone"
                type="tel"
                placeholder="مثال: 01012345678"
                dir="ltr"
                value={patientPhone}
                onChange={(e) => setPatientPhone(e.target.value)}
                className={`clinical-input pl-9 text-sm text-right font-mono ${
                  phoneError ? 'border-red-400' : ''
                }`}
              />
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
            {phoneError ? (
              <p className="text-[11px] text-red-500 mt-1 font-medium flex items-center gap-1 font-heading">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{phoneError}</span>
              </p>
            ) : (
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-1 font-heading">
                سيتم إرسال رسالة نصية وتأكيد واتساب برقم الحجز وعنوان العيادة فوراً
              </span>
            )}
          </div>

          {/* Patient Email */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 font-heading">
              البريد الإلكتروني (اختياري)
            </label>
            <div className="relative">
              <input
                id="input-patient-email"
                type="email"
                placeholder="example@mail.com"
                dir="ltr"
                value={patientEmail}
                onChange={(e) => setPatientEmail(e.target.value)}
                className="clinical-input pl-9 text-sm text-right font-mono"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Notes or symptoms */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 font-heading">
              ملاحظات أو سبب الزيارة للطبيب (اختياري)
            </label>
            <textarea
              id="input-patient-notes"
              rows={2}
              placeholder="اكتب باختصار سبب الاستشارة أو الأعراض التي تشعر بها..."
              value={patientNotes}
              onChange={(e) => setPatientNotes(e.target.value)}
              className="clinical-input text-xs"
            />
          </div>

          {/* Insurance & Settlement Information */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2.5">
            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={hasInsurance}
                  onChange={(e) => setHasInsurance(e.target.checked)}
                  className="w-4 h-4 accent-[#088395] rounded cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 font-heading">
                  <Shield className="w-3.5 h-3.5 text-[#088395] dark:text-teal-400" />
                  <span>لدي تأمين صحي / اشتراك نقابة طبية</span>
                </span>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium font-heading">خصم بنسبة التغطية</span>
            </label>

            {hasInsurance && (
              <div className="p-3 bg-teal-50/50 dark:bg-slate-800 rounded-lg border border-teal-100 dark:border-slate-700 space-y-2 mt-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 font-heading">جهة التأمين / النقابة:</label>
                  <select
                    value={insuranceProvider}
                    onChange={(e) => setInsuranceProvider(e.target.value)}
                    className="clinical-input text-xs font-medium"
                  >
                    <option value="">اختر شركة التأمين أو النقابة</option>
                    {(doctor.acceptedInsurances || INSURANCE_COMPANIES).map((ins, i) => (
                      <option key={i} value={ins}>{ins}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 font-heading">رقم بطاقة التأمين (كارنيه النقابة):</label>
                  <input
                    type="text"
                    placeholder="أدخل رقم الكارنيه أو وثيقة التأمين..."
                    value={insuranceCardNumber}
                    onChange={(e) => setInsuranceCardNumber(e.target.value)}
                    className="clinical-input text-xs"
                  />
                </div>
              </div>
            )}

            <div className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-400 pt-1 border-t border-slate-200/60 dark:border-slate-700 font-heading">
              <Building2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
              <span>خدمة حجز المواعيد وتنظيم زيارات العيادة مجانية تماماً وبدون أي رسوم، والدفع بالعيادة بالسعر الرسمي.</span>
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              id="btn-submit-booking-form"
              type="submit"
              disabled={submitting}
              className="btn-clinical-primary w-full py-3.5 px-6 rounded-xl text-sm sm:text-base flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 font-heading"
            >
              {submitting ? (
                <span>جاري تأكيد الموعد وإرسال بيانات الحجز...</span>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  <span>تأكيد حجز الموعد فوراً (الدفع بالعيادة)</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
