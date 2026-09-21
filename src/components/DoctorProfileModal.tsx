import React, { useState } from 'react';
import { 
  X, 
  Star, 
  MapPin, 
  Clock, 
  PhoneCall, 
  CheckCircle2, 
  GraduationCap, 
  Award, 
  Stethoscope,
  ShieldCheck,
  CalendarCheck,
  Building2,
  MessageSquare,
  Shield,
  ExternalLink,
  Navigation,
  Camera,
  Activity,
  Heart,
  ThumbsUp
} from 'lucide-react';
import { Doctor } from '../types';
import { DoctorAvatar } from './DoctorAvatar';
import { ClinicNavigationModal } from './ClinicNavigationModal';
import { getDoctorClinicPhotos, getDoctorQualityMetrics } from '../utils/doctorShowcase';

interface DoctorProfileModalProps {
  doctor: Doctor | null;
  onClose: () => void;
  onBook: (doctor: Doctor, day: string, slot: string) => void;
}

export const DoctorProfileModal: React.FC<DoctorProfileModalProps> = ({
  doctor,
  onClose,
  onBook
}) => {
  if (!doctor) return null;

  const [activeDayIdx, setActiveDayIdx] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<string>(
    doctor.availableDays[0]?.slots[0] || '05:00 م'
  );
  const [showNavModal, setShowNavModal] = useState(false);

  const currentDay = doctor.availableDays[activeDayIdx] || doctor.availableDays[0];

  const handleBookNow = () => {
    onBook(doctor, currentDay.dateStr, selectedSlot);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200 font-body">
      <div 
        className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-[#0A2540] dark:bg-slate-950 text-white p-5 sm:p-6 relative flex items-start justify-between border-b border-slate-800 font-heading">
          <div className="flex items-start gap-4">
            <DoctorAvatar
              specialtyId={doctor.specialtyId}
              gender={doctor.gender}
              verified={doctor.verified}
              size="lg"
            />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-[#088395] text-white text-[11px] font-bold px-2.5 py-0.5 rounded-md">
                  {doctor.title}
                </span>
                <span className="text-xs text-teal-200 flex items-center gap-1 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-300" />
                  <span>طبيب معتمد وموثق</span>
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-white font-heading">{doctor.name}</h2>
              <p className="text-xs sm:text-sm text-slate-200 mt-1 max-w-xl font-medium font-body">
                {doctor.specialty}
              </p>

              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-md text-xs font-bold font-mono">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 ml-1" />
                  <span>{doctor.rating}</span>
                </div>
                <span className="text-xs text-slate-300 font-body">
                  بناءً على {doctor.reviewsCount} تقييم من مرضى حقيقيين
                </span>
              </div>
            </div>
          </div>

          <button
            id="btn-close-profile-modal"
            type="button"
            onClick={onClose}
            className="text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-700 dark:text-slate-300 text-sm">
          
          {/* Quick Clinic Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-slate-800 text-[#088395] dark:text-teal-400 border border-teal-100 dark:border-slate-700 flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 block font-heading">نوع المنشأة:</span>
                <strong className="text-slate-900 dark:text-white text-sm font-heading">
                  {doctor.facilityType === 'hospital' ? 'مستشفى' : doctor.facilityType === 'polyclinic' ? 'مجمع عيادات' : 'عيادة خاصة'}
                </strong>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-slate-800 text-[#088395] dark:text-teal-400 border border-teal-100 dark:border-slate-700 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 block font-heading">متوسط مدة الانتظار:</span>
                <strong className="text-slate-900 dark:text-white text-sm font-heading">{doctor.waitingTime}</strong>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-slate-800 text-[#088395] dark:text-teal-400 border border-teal-100 dark:border-slate-700 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 block font-heading">موقع العيادة:</span>
                <strong className="text-slate-900 dark:text-white text-sm font-heading">{doctor.city} - {doctor.area}</strong>
              </div>
            </div>
          </div>

          {/* Insurance Acceptance Section */}
          {doctor.acceptedInsurances && doctor.acceptedInsurances.length > 0 && (
            <div className="bg-teal-50/50 dark:bg-slate-800/80 p-4 rounded-xl border border-teal-100 dark:border-slate-700">
              <h3 className="text-sm font-bold text-[#0A2540] dark:text-white mb-2 flex items-center gap-2 font-heading">
                <Shield className="w-4 h-4 text-[#088395] dark:text-teal-400" />
                <span>التعاقدات وشركات التأمين المقبولة بالعيادة</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {doctor.acceptedInsurances.map((ins, i) => (
                  <span key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs px-3 py-1 rounded-lg font-medium font-body">
                    {ins}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* About & Bio */}
          <div>
            <h3 className="text-base font-bold text-[#0A2540] dark:text-white mb-2 flex items-center gap-2 font-heading">
              <Award className="w-5 h-5 text-[#088395] dark:text-teal-400" />
              <span>نبذة عن الطبيب والخبرات</span>
            </h3>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm bg-slate-50/50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800 font-body">
              {doctor.bio}
            </p>
          </div>

          {/* Qualifications & Degrees */}
          <div>
            <h3 className="text-base font-bold text-[#0A2540] dark:text-white mb-2 flex items-center gap-2 font-heading">
              <GraduationCap className="w-5 h-5 text-[#088395] dark:text-teal-400" />
              <span>الشهادات العلمية والزمالات الدولية</span>
            </h3>
            <ul className="space-y-2 font-body">
              {doctor.degrees.map((deg, i) => (
                <li key={i} className="flex items-start gap-2 text-slate-700 dark:text-slate-300 text-xs sm:text-sm">
                  <CheckCircle2 className="w-4 h-4 text-[#088395] dark:text-teal-400 shrink-0 mt-0.5" />
                  <span>{deg}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Clinic Services */}
          <div>
            <h3 className="text-base font-bold text-[#0A2540] dark:text-white mb-3 flex items-center gap-2 font-heading">
              <Stethoscope className="w-5 h-5 text-[#088395] dark:text-teal-400" />
              <span>الخدمات الطبية والتخصصية المتاحة بالعيادة</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {doctor.services.map((srv, idx) => (
                <div key={idx} className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center gap-2 text-xs sm:text-sm font-body">
                  <CheckCircle2 className="w-4 h-4 text-[#088395] dark:text-teal-400 shrink-0" />
                  <span className="font-bold text-slate-800 dark:text-slate-200">{srv.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Address & Landmarks */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-[#0A2540] dark:text-white flex items-center gap-2 font-heading">
                <MapPin className="w-5 h-5 text-[#088395] dark:text-teal-400" />
                <span>عنوان وموقع العيادة الجغرافي</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowNavModal(true)}
                className="text-xs text-[#088395] dark:text-teal-400 hover:underline font-bold flex items-center gap-1 bg-teal-50 dark:bg-teal-950/70 px-3 py-1.5 rounded-xl border border-teal-200/80 dark:border-teal-900/60 cursor-pointer font-heading"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>الملاحة بالـ GPS / أوبر</span>
              </button>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800 font-body">
              <p className="font-bold text-slate-900 dark:text-slate-200 mb-1">{doctor.address}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{doctor.landmark}</p>
              <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-400">
                <span>نوع الحجز: إلكتروني فوري ومؤكد</span>
                <span className="text-[#088395] dark:text-teal-400 font-bold font-heading">متاح مصعد وتجهيزات لذوي الاحتياجات</span>
              </div>
            </div>
          </div>

          {/* Clinic Photos Gallery & Quality Radar in Profile Modal */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-[#0A2540] dark:text-white flex items-center gap-2 font-heading">
                <Camera className="w-5 h-5 text-[#088395] dark:text-teal-400" />
                <span>معاينة مرافق وصور العيادة الحقيقية</span>
              </h3>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 font-heading">
                بيئة معقمة ومطابقة للمعايير الصحية
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {getDoctorClinicPhotos(doctor).map((photo) => (
                <div key={photo.id} className="group relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 aspect-4/3 bg-slate-900">
                  <img
                    src={photo.url}
                    alt={photo.title}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-1.5 right-1.5 left-1.5 text-white">
                    <span className="text-[10px] font-bold bg-[#088395]/90 px-1.5 py-0.5 rounded block w-fit mb-0.5 font-heading">
                      {photo.tagLabel}
                    </span>
                    <p className="text-[11px] font-bold truncate font-heading">{photo.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quality Radar & Patient Trust Metrics */}
          {(() => {
            const metrics = getDoctorQualityMetrics(doctor);
            return (
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                <h3 className="text-sm font-bold text-[#0A2540] dark:text-white mb-3 flex items-center gap-2 font-heading">
                  <Activity className="w-4 h-4 text-[#088395]" />
                  <span>مؤشرات جودة الرعاية وانطباعات المرضى الموثقة</span>
                </h3>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                  <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
                    <div className="flex items-center justify-center text-rose-500 mb-1">
                      <Heart className="w-4 h-4 fill-rose-500" />
                    </div>
                    <strong className="text-base font-bold text-slate-900 dark:text-white font-mono">{metrics.recommendationRate}%</strong>
                    <span className="text-[11px] text-slate-500 block font-heading">يوصون بالطبيب</span>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
                    <div className="flex items-center justify-center text-[#088395] mb-1">
                      <Clock className="w-4 h-4" />
                    </div>
                    <strong className="text-base font-bold text-slate-900 dark:text-white font-mono">{metrics.punctualityRate}%</strong>
                    <span className="text-[11px] text-slate-500 block font-heading">انضباط المواعيد</span>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
                    <div className="flex items-center justify-center text-teal-600 mb-1">
                      <Stethoscope className="w-4 h-4" />
                    </div>
                    <strong className="text-base font-bold text-slate-900 dark:text-white font-mono">{metrics.diagnosisClarity} / 5</strong>
                    <span className="text-[11px] text-slate-500 block font-heading">عمق الفحص</span>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
                    <div className="flex items-center justify-center text-emerald-500 mb-1">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <strong className="text-base font-bold text-slate-900 dark:text-white font-mono">{metrics.sanitationScore}%</strong>
                    <span className="text-[11px] text-slate-500 block font-heading">معايير التعقيم</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {metrics.patientSentiments.map((s, idx) => (
                    <span key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 font-body">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                      <span>{s.text}</span>
                      <span className="text-[#088395] font-mono font-bold mr-1">({s.percentage}%)</span>
                    </span>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Verified Patient Reviews */}
          <div>
            <h3 className="text-base font-bold text-[#0A2540] dark:text-white mb-3 flex items-center gap-2 font-heading">
              <MessageSquare className="w-5 h-5 text-[#088395] dark:text-teal-400" />
              <span>آراء وتقييمات المرضى الموثقة ({doctor.reviewsCount})</span>
            </h3>
            <div className="space-y-3 font-body">
              {doctor.recentReviews.map((rev, idx) => (
                <div key={idx} className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <strong className="text-slate-900 dark:text-slate-200 text-sm font-heading">{rev.author}</strong>
                      {rev.verifiedVisit && (
                        <span className="bg-teal-50 dark:bg-slate-800 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 font-heading">
                          <CheckCircle2 className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                          <span>زيارة محققة</span>
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400 font-mono">{rev.date}</span>
                  </div>
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(rev.rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'}`} />
                    ))}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">"{rev.comment}"</p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Modal Pinned Booking Footer */}
        <div className="bg-slate-100 dark:bg-slate-950 p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 font-heading">
          
          {/* Slot selector inside profile */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 shrink-0">اختر موعد:</span>
            <select
              value={activeDayIdx}
              onChange={(e) => {
                const idx = Number(e.target.value);
                setActiveDayIdx(idx);
                setSelectedSlot(doctor.availableDays[idx]?.slots[0] || '');
              }}
              className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs font-bold py-2.5 px-3 rounded-xl outline-none cursor-pointer"
            >
              {doctor.availableDays.map((d, i) => (
                <option key={i} value={i}>{d.dayName} ({d.dateStr})</option>
              ))}
            </select>

            <select
              value={selectedSlot}
              onChange={(e) => setSelectedSlot(e.target.value)}
              className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs font-bold py-2.5 px-3 rounded-xl outline-none cursor-pointer"
            >
              {currentDay.slots.map((s, i) => (
                <option key={i} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              id="btn-profile-book-action"
              type="button"
              onClick={handleBookNow}
              className="btn-clinical-primary w-full sm:w-auto px-6 py-3 rounded-xl text-sm cursor-pointer"
            >
              تأكيد حجز الموعد الآن
            </button>
          </div>
        </div>

      </div>

      {/* Clinic Navigation & Transport Modal */}
      <ClinicNavigationModal
        isOpen={showNavModal}
        onClose={() => setShowNavModal(false)}
        doctorName={doctor.name}
        address={doctor.address}
        city={doctor.city}
        area={doctor.area}
        landmark={doctor.landmark}
      />
    </div>
  );
};
