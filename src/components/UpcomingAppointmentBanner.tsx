import React, { useState } from 'react';
import { 
  CalendarCheck, 
  Clock, 
  MapPin, 
  ChevronLeft, 
  X, 
  ShieldCheck, 
  BellRing, 
  Stethoscope,
  ExternalLink,
  Navigation
} from 'lucide-react';
import { Booking } from '../types';
import { LiveClinicQueueTracker } from './LiveClinicQueueTracker';
import { ClinicNavigationModal } from './ClinicNavigationModal';

interface UpcomingAppointmentBannerProps {
  bookings: Booking[];
  onViewVoucher: (booking: Booking) => void;
  onNavigateToBookings: () => void;
}

export const UpcomingAppointmentBanner: React.FC<UpcomingAppointmentBannerProps> = ({
  bookings,
  onViewVoucher,
  onNavigateToBookings
}) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [showNavModal, setShowNavModal] = useState(false);

  // Find confirmed bookings within next 24 hours (containing 'اليوم' or 'غداً' or recent active confirmed)
  const upcomingBooking = bookings.find((b) => {
    if (b.status !== 'confirmed') return false;
    const dayStr = (b.day || '').toLowerCase();
    return dayStr.includes('اليوم') || dayStr.includes('غداً') || dayStr.includes('غدا') || dayStr.includes('today');
  }) || bookings.find((b) => b.status === 'confirmed');

  if (!upcomingBooking || isDismissed) {
    return null;
  }

  const isToday = (upcomingBooking.day || '').includes('اليوم');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2 animate-in fade-in slide-in-from-top-4 duration-300 font-body">
      <div className="relative overflow-hidden bg-gradient-to-r from-teal-50/80 via-white to-teal-50/50 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-900 border border-teal-200 dark:border-teal-900/60 rounded-2xl p-4 sm:p-5 shadow-xs">
        
        {/* Glow Accent Line */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#088395] via-teal-400 to-[#0A2540]" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          
          {/* Right Info Section (Doctor + Timing) */}
          <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
            {/* Animated Pulsing Icon */}
            <div className="relative shrink-0 mt-0.5 sm:mt-0">
              <div className="w-11 h-11 rounded-xl bg-[#088395] text-white flex items-center justify-center shadow-md shadow-teal-500/20">
                <BellRing className="w-5 h-5 animate-bounce" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#088395] border-2 border-white dark:border-slate-900"></span>
              </span>
            </div>

            {/* Details */}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1 bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-teal-200 dark:border-teal-800 font-heading">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#088395] animate-pulse"></span>
                  {isToday ? 'موعد كشف مؤكد اليوم' : 'موعد كشف قادم خلال 24 ساعة'}
                </span>
                
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 font-mono">
                  رقم الحجز: #{upcomingBooking.id}
                </span>

                {upcomingBooking.insuranceProvider && (
                  <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 font-heading">
                    تأمين: {upcomingBooking.insuranceProvider}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-[#0A2540] dark:text-white truncate font-heading">
                  {upcomingBooking.doctorName}
                </h3>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  ({upcomingBooking.specialty})
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-600 dark:text-slate-300 font-medium">
                <div className="flex items-center gap-1 font-bold text-[#088395] dark:text-teal-400 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 font-heading">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{upcomingBooking.day} • {upcomingBooking.slot}</span>
                </div>

                <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 truncate max-w-xs">
                  <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                  <span className="truncate">{upcomingBooking.location}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Left Actions */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-200/60 dark:border-slate-800 font-heading">
            <button
              type="button"
              onClick={() => setShowNavModal(true)}
              className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-bold px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
              title="خط السير وتوجيه GPS"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">ملاحة</span>
            </button>

            <button
              id="btn-upcoming-view-voucher"
              type="button"
              onClick={() => onViewVoucher(upcomingBooking)}
              className="btn-clinical-primary text-xs sm:text-sm px-4 py-2 flex-1 sm:flex-initial flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>تفاصيل وتذكرة الكشف</span>
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              id="btn-upcoming-manage-bookings"
              type="button"
              onClick={onNavigateToBookings}
              className="bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-bold px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
              title="إدارة المواعيد"
            >
              تعديل / إلغاء
            </button>

            <button
              id="btn-dismiss-upcoming-toast"
              type="button"
              onClick={() => setIsDismissed(true)}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-white/80 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="إخفاء التنبيه"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

      {/* Navigation Modal */}
      <ClinicNavigationModal
        isOpen={showNavModal}
        onClose={() => setShowNavModal(false)}
        doctorName={upcomingBooking.doctorName}
        address={upcomingBooking.location}
        city="القاهرة"
        area={upcomingBooking.location.split('-')[0]?.trim() || 'العيادة'}
      />
    </div>
  );
};
