import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  PhoneCall, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  Star, 
  ArrowLeft,
  CalendarDays,
  Plus,
  Shield,
  Navigation,
  Download,
  ExternalLink
} from 'lucide-react';
import { Booking } from '../types';
import { DoctorAvatar } from './DoctorAvatar';
import { generateGoogleCalendarUrl, downloadIcsCalendarFile } from '../utils/calendarExport';
import { LiveClinicQueueTracker } from './LiveClinicQueueTracker';
import { ClinicNavigationModal } from './ClinicNavigationModal';
import { CustomEmptyState } from './CustomEmptyState';
import { CustomLoadingSkeleton } from './CustomLoadingSkeleton';

interface MyAppointmentsViewProps {
  bookings: Booking[];
  isLoading?: boolean;
  onCancelBooking: (id: string) => void;
  onRescheduleBooking: (id: string, newDay: string, newSlot: string) => void;
  onNavigateToSearch: () => void;
  onViewVoucher: (booking: Booking) => void;
}

export const MyAppointmentsView: React.FC<MyAppointmentsViewProps> = ({
  bookings,
  isLoading = false,
  onCancelBooking,
  onRescheduleBooking,
  onNavigateToSearch,
  onViewVoucher
}) => {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [reschedulingBooking, setReschedulingBooking] = useState<Booking | null>(null);
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);
  const [navModalBooking, setNavModalBooking] = useState<Booking | null>(null);
  const [newDay, setNewDay] = useState('غداً، 11 سبتمبر');
  const [newSlot, setNewSlot] = useState('06:00 م');
  const [reviewModalBooking, setReviewModalBooking] = useState<Booking | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const upcomingBookings = useMemo(() => bookings.filter(b => b.status === 'confirmed'), [bookings]);
  const pastBookings = useMemo(() => bookings.filter(b => b.status === 'completed' || b.status === 'cancelled'), [bookings]);

  const displayedList = useMemo(() => activeTab === 'upcoming' ? upcomingBookings : pastBookings, [activeTab, upcomingBookings, pastBookings]);

  const handleConfirmReschedule = () => {
    if (reschedulingBooking) {
      onRescheduleBooking(reschedulingBooking.id, newDay, newSlot);
      setReschedulingBooking(null);
    }
  };

  const handleSaveReview = (e: React.FormEvent) => {
    e.preventDefault();
    setReviewSuccess(true);
    setTimeout(() => {
      setReviewSuccess(false);
      setReviewModalBooking(null);
      setReviewComment('');
    }, 1500);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 font-body">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0A2540] dark:text-white font-heading">حجوزاتي الطبية</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            متابعة مواعيد كشوفات العيادات والاستشارات الطبية وتأكيد أو تعديل الحجز
          </p>
        </div>

        <button
          id="btn-new-booking-search"
          onClick={onNavigateToSearch}
          className="btn-clinical-primary text-xs sm:text-sm py-2.5 px-4 rounded-xl flex items-center gap-1.5 self-start sm:self-auto cursor-pointer font-heading"
        >
          <Plus className="w-4 h-4" />
          <span>حجز موعد مع طبيب جديد</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6 font-heading">
        <button
          type="button"
          onClick={() => setActiveTab('upcoming')}
          className={`py-2 px-5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
            activeTab === 'upcoming'
              ? 'bg-[#088395] text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <span>المواعيد القادمة النشطة</span>
          <span className="mr-2 bg-white/20 text-white px-2 py-0.5 rounded-full text-xs font-mono">
            {upcomingBookings.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('past')}
          className={`py-2 px-5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
            activeTab === 'past'
              ? 'bg-[#088395] text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <span>السجل والمواعيد السابقة</span>
          <span className="mr-2 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-2 py-0.5 rounded-full text-xs font-mono">
            {pastBookings.length}
          </span>
        </button>
      </div>

      {/* List */}
      {isLoading ? (
        <CustomLoadingSkeleton type="appointment-card" count={3} />
      ) : displayedList.length === 0 ? (
        <CustomEmptyState
          type={activeTab === 'upcoming' ? 'appointments' : 'appointments-past'}
          title={activeTab === 'upcoming' ? 'لا توجد كشوفات أو مواعيد قادمة مجدولة' : 'لا توجد كشوفات سابقة في سجلك'}
          description={
            activeTab === 'upcoming'
              ? 'احجز كشفك الطبي مع نخبة من أفضل الاستشاريين في منطقتك بكل سهولة مع تأكيد فوري وتنظيم مسبق لطابور الانتظار.'
              : 'عند حضورك لأي موعد قادم، سيتم أرشفة الزيارة والروشتة الإلكترونية هنا تلقائياً لسهولة الرجوع إليها.'
          }
          actionText="تصفح العيادات واحجز موعداً"
          onAction={onNavigateToSearch}
        />
      ) : (
        <div className="space-y-4">
          {displayedList.map((booking) => (
            <div
              key={booking.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs hover:border-teal-300 dark:hover:border-slate-700 transition-all p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
            >
              {/* Doctor and appointment details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-4">
                  <DoctorAvatar
                    verified={true}
                    size="md"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                        {booking.id}
                      </span>
                      {booking.status === 'confirmed' && (
                        <span className="bg-teal-50 dark:bg-teal-950/70 text-[#088395] dark:text-teal-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-teal-200 dark:border-teal-800 font-heading">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>مؤكد بالعيادة</span>
                        </span>
                      )}
                      {booking.status === 'cancelled' && (
                        <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-slate-200 dark:border-slate-700 font-heading">
                          <XCircle className="w-3 h-3 text-slate-500" />
                          <span>تم الإلغاء</span>
                        </span>
                      )}
                      {booking.status === 'completed' && (
                        <span className="bg-slate-100 dark:bg-slate-800 text-[#0A2540] dark:text-slate-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-700 font-heading">
                          تمت الزيارة
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-[#0A2540] dark:text-white font-heading">{booking.doctorName}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-2">{booking.specialty}</p>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-1 text-[#088395] dark:text-teal-400 font-bold font-heading">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{booking.day} - {booking.slot}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span className="max-w-[200px] truncate">{booking.location}</span>
                      </div>
                      {booking.insuranceProvider && (
                        <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-medium">
                          <Shield className="w-3.5 h-3.5 text-[#088395]" />
                          <span>تأمين: {booking.insuranceProvider}</span>
                        </div>
                      )}
                    </div>

                    {/* Compact Live Queue Tracker for active bookings */}
                    {booking.status === 'confirmed' && (
                      <div className="mt-3">
                        <LiveClinicQueueTracker booking={booking} compact={true} />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 w-full md:w-auto self-stretch md:self-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 dark:border-slate-800 font-heading">
                {booking.status === 'confirmed' && (
                  <>
                    <button
                      type="button"
                      onClick={() => setNavModalBooking(booking)}
                      className="text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 py-2.5 px-3 rounded-xl transition-colors flex items-center justify-center gap-1 cursor-pointer min-h-[40px]"
                      title="الملاحة بالـ GPS وطلب أوبر"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>ملاحة العيادة</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => downloadIcsCalendarFile(booking)}
                      className="text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 py-2.5 px-3 rounded-xl transition-colors flex items-center justify-center gap-1 cursor-pointer min-h-[40px]"
                      title="حفظ بالتقويم"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>حفظ بالتقويم</span>
                    </button>

                    <button
                      onClick={() => onViewVoucher(booking)}
                      className="btn-clinical-primary text-xs py-2.5 px-3.5 rounded-xl cursor-pointer col-span-2 sm:col-span-1 min-h-[40px]"
                    >
                      عرض تذكرة الحجز
                    </button>
                    
                    <button
                      onClick={() => setReschedulingBooking(booking)}
                      className="text-xs font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 py-2.5 px-3 rounded-xl transition-colors cursor-pointer text-center min-h-[40px]"
                    >
                      تعديل الموعد
                    </button>

                    <button
                      onClick={() => setBookingToCancel(booking)}
                      className="text-xs font-bold text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 py-2.5 px-2.5 rounded-xl transition-colors cursor-pointer text-center min-h-[40px]"
                    >
                      إلغاء الحجز
                    </button>
                  </>
                )}

                {booking.status !== 'confirmed' && (
                  <button
                    onClick={() => setReviewModalBooking(booking)}
                    className="w-full sm:w-auto text-xs font-bold bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 py-2.5 px-3.5 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer font-heading min-h-[40px]"
                  >
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>تقييم تجربة الكشف</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reschedule Modal */}
      {reschedulingBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 font-body">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4 border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-[#0A2540] dark:text-white text-base font-heading">
              تعديل موعد الحجز مع {reschedulingBooking.doctorName}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              الموعد الحالي: {reschedulingBooking.day} - {reschedulingBooking.slot}
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 font-heading">اختر اليوم الجديد:</label>
                <select
                  value={newDay}
                  onChange={(e) => setNewDay(e.target.value)}
                  className="clinical-input text-xs font-bold"
                >
                  <option value="اليوم، 10 سبتمبر" className="dark:bg-slate-900">اليوم، 10 سبتمبر</option>
                  <option value="غداً، 11 سبتمبر" className="dark:bg-slate-900">غداً، 11 سبتمبر</option>
                  <option value="السبت، 13 سبتمبر" className="dark:bg-slate-900">السبت، 13 سبتمبر</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 font-heading">اختر الساعة المتاحة:</label>
                <select
                  value={newSlot}
                  onChange={(e) => setNewSlot(e.target.value)}
                  className="clinical-input text-xs font-bold"
                >
                  <option value="05:00 م" className="dark:bg-slate-900">05:00 م</option>
                  <option value="06:00 م" className="dark:bg-slate-900">06:00 م</option>
                  <option value="07:00 م" className="dark:bg-slate-900">07:00 م</option>
                  <option value="08:00 م" className="dark:bg-slate-900">08:00 م</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-2 font-heading">
              <button
                onClick={handleConfirmReschedule}
                className="flex-1 btn-clinical-primary text-xs font-bold py-2.5 rounded-xl cursor-pointer"
              >
                تحديث الموعد
              </button>
              <button
                onClick={() => setReschedulingBooking(null)}
                className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold py-2.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Booking Confirmation Modal */}
      {bookingToCancel && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in font-body">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-center space-y-4 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto border border-red-200 dark:border-red-900">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-[#0A2540] dark:text-white text-base mb-1 font-heading">
                تأكيد إلغاء موعد الكشف؟
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                موعدك مع <strong>{bookingToCancel.doctorName}</strong> المحدد لـ ({bookingToCancel.day} - {bookingToCancel.slot}). هل ترغب حقاً في إلغاء الحجز؟
              </p>
            </div>

            <div className="flex gap-2 pt-1 font-heading">
              <button
                onClick={() => {
                  onCancelBooking(bookingToCancel.id);
                  setBookingToCancel(null);
                }}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                نعم، إلغاء الموعد
              </button>
              <button
                onClick={() => setBookingToCancel(null)}
                className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                تراجع
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Write Review Modal */}
      {reviewModalBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 font-body">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4 border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-[#0A2540] dark:text-white text-base font-heading">
              تقييم زيارة الطبيب: {reviewModalBooking.doctorName}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              تقييمك يساعد آلاف المرضى في اختيار الطبيب المناسب بكل شفافية.
            </p>

            {reviewSuccess ? (
              <div className="p-4 bg-teal-50 dark:bg-teal-950/50 text-teal-800 dark:text-teal-300 text-xs rounded-xl font-bold text-center border border-teal-200 dark:border-teal-800 font-heading">
                شكراً لك! تم تسجيل تقييمك وتوثيقه بنجاح.
              </div>
            ) : (
              <form onSubmit={handleSaveReview} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 font-heading">تقييمك الإجمالي:</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="p-1 cursor-pointer"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mr-2 font-heading">
                      ({reviewRating} من 5 نجوم)
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 font-heading">
                    تعليقك وتفاصيل تجربتك بالعيادة:
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="اكتب عن دقة المواعيد، شرح الطبيب للحالة، ونظافة العيادة..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="clinical-input text-xs"
                  />
                </div>

                <div className="flex gap-2 font-heading">
                  <button
                    type="submit"
                    className="flex-1 btn-clinical-primary text-xs font-bold py-2.5 rounded-xl cursor-pointer"
                  >
                    نشر التقييم
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewModalBooking(null)}
                    className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold py-2.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                  >
                    إغلاق
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Clinic Navigation Modal */}
      {navModalBooking && (
        <ClinicNavigationModal
          isOpen={!!navModalBooking}
          onClose={() => setNavModalBooking(null)}
          doctorName={navModalBooking.doctorName}
          address={navModalBooking.location}
          city="القاهرة"
          area={navModalBooking.location.split('-')[0]?.trim() || 'العيادة'}
        />
      )}

    </div>
  );
};
