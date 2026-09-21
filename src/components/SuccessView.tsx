import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Calendar, 
  MapPin, 
  Banknote, 
  PhoneCall, 
  Download, 
  Share2, 
  ArrowRight,
  ShieldCheck,
  Printer,
  Copy,
  Check,
  Shield,
  Navigation,
  ExternalLink
} from 'lucide-react';
import { Booking } from '../types';
import { DoctorAvatar } from './DoctorAvatar';
import { generateGoogleCalendarUrl, downloadIcsCalendarFile } from '../utils/calendarExport';
import { LiveClinicQueueTracker } from './LiveClinicQueueTracker';
import { ClinicNavigationModal } from './ClinicNavigationModal';

interface SuccessViewProps {
  booking: Booking | null;
  onGoToBookings: () => void;
  onGoHome: () => void;
}

export const SuccessView: React.FC<SuccessViewProps> = ({
  booking,
  onGoToBookings,
  onGoHome
}) => {
  const [copied, setCopied] = useState(false);
  const [showNavModal, setShowNavModal] = useState(false);

  if (!booking) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center font-body">
        <p className="text-slate-600 dark:text-slate-400">لا يوجد حجز محدد حالياً.</p>
        <button 
          onClick={onGoHome} 
          className="mt-4 btn-clinical-primary px-6 py-2.5 rounded-xl font-bold text-sm font-heading cursor-pointer"
        >
          العودة للرئيسية
        </button>
      </div>
    );
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(booking.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const googleCalUrl = generateGoogleCalendarUrl(booking);

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 font-body">
      
      {/* Success Banner */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-teal-50 dark:bg-teal-950/60 text-[#088395] dark:text-teal-400 border border-teal-200 dark:border-teal-900 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xs animate-in zoom-in-50 duration-300">
          <CheckCircle2 className="w-9 h-9" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#0A2540] dark:text-white mb-2 font-heading">
          تم تأكيد حجزك بنجاح!
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm max-w-md mx-auto">
          تم إرسال رسالة تأكيد نصية على رقمك <span className="font-mono font-bold text-slate-800 dark:text-slate-200 dir-ltr">{booking.patientPhone}</span> تتضمن كود الحجز وتفاصيل الوصول للعيادة.
        </p>
      </div>

      {/* Live Clinic Queue Tracker */}
      <div className="mb-6">
        <LiveClinicQueueTracker booking={booking} />
      </div>

      {/* Printable / Savable Voucher Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mb-6">
        
        {/* Voucher Header */}
        <div className="bg-[#0A2540] text-white p-5 flex items-center justify-between border-b border-slate-800 font-heading">
          <div>
            <span className="text-xs text-teal-300 block font-bold">تذكرة حجز كشف دكتورنا</span>
            <span className="text-xs text-slate-300">يرجى إبراز كود الحجز عند الاستقبال بالعيادة</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-base sm:text-lg font-bold text-white bg-white/10 px-3 py-1 rounded-lg border border-white/20">
              {booking.id}
            </span>
            <button
              onClick={handleCopyCode}
              className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors cursor-pointer"
              title="نسخ كود الحجز"
            >
              {copied ? <Check className="w-4 h-4 text-teal-400" /> : <Copy className="w-4 h-4 text-white" />}
            </button>
          </div>
        </div>

        {/* Voucher Body */}
        <div className="p-6 space-y-4">
          
          {/* Doctor Info */}
          <div className="flex items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <DoctorAvatar
              verified={true}
              size="md"
            />
            <div>
              <span className="text-xs font-bold text-[#088395] dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded border border-teal-200 dark:border-teal-800 font-heading">
                {booking.doctorTitle}
              </span>
              <h3 className="text-lg font-bold text-[#0A2540] dark:text-white mt-1 font-heading">{booking.doctorName}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{booking.specialty}</p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 block text-xs mb-1 font-heading">اسم المريض المسجل:</span>
              <strong className="text-slate-900 dark:text-white font-bold">{booking.patientName}</strong>
            </div>

            <div className="bg-teal-50/50 dark:bg-slate-800/80 p-3.5 rounded-xl border border-teal-100 dark:border-slate-700">
              <span className="text-teal-800 dark:text-teal-300 block text-xs mb-1 font-bold font-heading">الموعد المؤكد:</span>
              <strong className="text-[#088395] dark:text-teal-400 font-bold font-heading">{booking.day} - {booking.slot}</strong>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 sm:col-span-2">
              <div className="flex items-center justify-between mb-1 font-heading">
                <span className="text-slate-500 dark:text-slate-400 block text-xs">عنوان العيادة:</span>
                <button
                  type="button"
                  onClick={() => setShowNavModal(true)}
                  className="text-xs font-bold text-[#088395] dark:text-teal-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>خط السير والملاحة / أوبر</span>
                </button>
              </div>
              <div className="flex items-start gap-1.5">
                <MapPin className="w-4 h-4 text-[#088395] dark:text-teal-400 shrink-0 mt-0.5" />
                <strong className="text-slate-800 dark:text-slate-200 font-medium">{booking.location}</strong>
              </div>
            </div>

            {booking.insuranceProvider && (
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400 text-xs font-heading">جهة التأمين / التعاقد:</span>
                <span className="text-slate-800 dark:text-slate-200 font-bold text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 font-heading">
                  {booking.insuranceProvider}
                </span>
              </div>
            )}
          </div>

          {/* Quick Calendar & Navigation Integration Buttons */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 font-heading">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
              إضافة الموعد والتذكيرات لتقويمك:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <a
                href={googleCalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs py-2.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-[#088395] dark:text-teal-400" />
                <span>إضافة إلى Google Calendar</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>

              <button
                type="button"
                onClick={() => downloadIcsCalendarFile(booking)}
                className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs py-2.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4 text-[#088395] dark:text-teal-400" />
                <span>تحميل تقويم Apple / Outlook (.ics)</span>
              </button>
            </div>
          </div>

          {/* Insurance note if applicable */}
          {booking.insuranceProvider && (
            <div className="p-3 bg-teal-50/50 dark:bg-slate-800/60 rounded-xl border border-teal-100 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#088395] dark:text-teal-400 shrink-0" />
              <span>
                جهة التأمين: <strong>{booking.insuranceProvider}</strong> {booking.insuranceCardNumber && `(رقم البطاقة: ${booking.insuranceCardNumber})`}
              </span>
            </div>
          )}

          {/* Important instructions */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            <strong className="text-[#088395] dark:text-teal-400 font-heading">ملاحظة هامة:</strong> يرجى الحضور قبل الموعد بـ 10 دقائق للتسجيل برقم الحجز <span className="font-mono font-bold">{booking.id}</span>. في حال الرغبة في تأجيل أو إلغاء الموعد يمكنك إجراء ذلك مجاناً عبر التطبيق.
          </div>

        </div>

        {/* Voucher Footer Action */}
        <div className="bg-slate-50 dark:bg-slate-950 p-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-heading">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-4 h-4 text-[#088395] dark:text-teal-400" />
            <span>حجزك مضمون ومؤكد من إدارة دكتورنا</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowNavModal(true)}
              className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 hover:text-[#088395] dark:hover:text-teal-400 font-bold cursor-pointer"
            >
              <Navigation className="w-4 h-4 text-[#088395]" />
              <span>توجيه GPS</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 text-[#088395] dark:text-teal-400 hover:underline font-bold cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة تذكرة الحجز</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 font-heading">
        <button
          id="btn-view-all-bookings"
          type="button"
          onClick={onGoToBookings}
          className="w-full sm:w-auto btn-clinical-primary text-sm py-3 px-8 rounded-xl flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>عرض وإدارة حجوزاتي</span>
          <ArrowRight className="w-4 h-4 rotate-180" />
        </button>

        <button
          id="btn-back-home"
          type="button"
          onClick={onGoHome}
          className="w-full sm:w-auto bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-sm py-3 px-6 rounded-xl border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
        >
          العودة للصفحة الرئيسية
        </button>
      </div>

      {/* Clinic Navigation Modal */}
      <ClinicNavigationModal
        isOpen={showNavModal}
        onClose={() => setShowNavModal(false)}
        doctorName={booking.doctorName}
        address={booking.location}
        city="القاهرة"
        area={booking.location.split('-')[0]?.trim() || 'العيادة'}
      />

    </div>
  );
};
