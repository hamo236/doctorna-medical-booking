import React, { useState } from 'react';
import { 
  Star, 
  MapPin, 
  Clock, 
  PhoneCall, 
  ShieldCheck, 
  Info,
  CalendarCheck,
  Bookmark,
  Shield,
  Building2,
  Camera,
  Activity,
  Heart,
  Sparkles,
  X,
  ZoomIn,
  CheckCircle2,
  ThumbsUp,
  Stethoscope,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Doctor, ClinicPhotoItem } from '../types';
import { DoctorAvatar } from './DoctorAvatar';
import { getDoctorClinicPhotos, getDoctorQualityMetrics } from '../utils/doctorShowcase';

interface DoctorCardProps {
  doctor: Doctor;
  onOpenProfile: (doctor: Doctor) => void;
  onBookSlot: (doctor: Doctor, day: string, slot: string) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
}

export const DoctorCard: React.FC<DoctorCardProps> = ({
  doctor,
  onOpenProfile,
  onBookSlot,
  isFavorite = false,
  onToggleFavorite
}) => {
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(
    doctor.availableDays[0]?.slots[0] || null
  );

  // Showcase state: 'photos' or 'metrics'
  const [previewTab, setPreviewTab] = useState<'photos' | 'metrics'>('photos');
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [isPhotoLightboxOpen, setIsPhotoLightboxOpen] = useState(false);

  const clinicPhotos = getDoctorClinicPhotos(doctor);
  const qualityMetrics = getDoctorQualityMetrics(doctor);
  const currentDay = doctor.availableDays[activeDayIndex] || doctor.availableDays[0];
  const activePhoto: ClinicPhotoItem = clinicPhotos[activePhotoIndex] || clinicPhotos[0];

  const handleSlotClick = (slot: string) => {
    setSelectedSlot(slot);
  };

  const handleConfirmBooking = () => {
    if (selectedSlot && currentDay) {
      onBookSlot(doctor, currentDay.dateStr, selectedSlot);
    }
  };

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActivePhotoIndex((prev) => (prev + 1) % clinicPhotos.length);
  };

  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActivePhotoIndex((prev) => (prev - 1 + clinicPhotos.length) % clinicPhotos.length);
  };

  return (
    <>
      <div 
        id={`doctor-card-${doctor.id}`}
        className="group relative bg-clinical-surface rounded-2xl border border-clinical-border shadow-xs hover:border-clinical-teal hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col lg:flex-row font-body"
      >
        {/* Right Column: Doctor Information & Interactive Mini Showcase (RTL Layout) */}
        <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
          <div>
            {/* Top Identity Header */}
            <div className="flex items-start gap-3.5 sm:gap-4 relative">
              
              {/* Avatar with subtle scale on hover & Live Status Dot */}
              <div className="relative shrink-0">
                <div className="transition-transform duration-200 group-hover:scale-105">
                  <DoctorAvatar
                    specialtyId={doctor.specialtyId}
                    gender={doctor.gender}
                    verified={doctor.verified}
                    size="lg"
                  />
                </div>
                {/* Real-time active clinic beacon */}
                <span 
                  className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5"
                  title="العيادة مفتوحة وجداول الحجز نشطة الآن"
                >
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-teal-500 border-2 border-white dark:border-slate-900"></span>
                </span>
              </div>

              {/* Basic Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <span className="text-[11px] font-bold bg-teal-50 dark:bg-teal-950/80 text-clinical-teal px-2.5 py-0.5 rounded-md border border-teal-200/80 dark:border-teal-800/80 font-heading">
                      {doctor.title}
                    </span>
                    <span className="text-xs font-semibold text-clinical-muted flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-clinical-teal shrink-0" />
                      <span>{doctor.city} - {doctor.area}</span>
                    </span>
                  </div>

                  {/* Bookmark / Favorite with active feedback */}
                  {onToggleFavorite && (
                    <button
                      type="button"
                      onClick={() => onToggleFavorite(doctor.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-clinical-teal hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors active:scale-90 cursor-pointer"
                      title={isFavorite ? 'إزالة من المفضلة' : 'حفظ في المفضلة'}
                    >
                      <Bookmark className={`w-4 h-4 ${isFavorite ? 'fill-clinical-teal text-clinical-teal' : ''}`} />
                    </button>
                  )}
                </div>

                <h3 
                  onClick={() => onOpenProfile(doctor)}
                  className="text-base sm:text-xl font-bold text-clinical-navy dark:text-white hover:text-clinical-teal transition-colors cursor-pointer truncate font-heading"
                >
                  {doctor.name}
                </h3>

                <p className="text-xs sm:text-sm font-medium text-clinical-muted mt-0.5 sm:mt-1 line-clamp-1">
                  {doctor.specialty}
                </p>

                {/* Rating and Reviews count & Consultation Fee */}
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <div className="flex items-center bg-amber-50 dark:bg-amber-950/60 border border-amber-300/80 dark:border-amber-700/80 px-2 py-0.5 rounded-md">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500 ml-1" />
                    <span className="text-xs font-bold text-amber-900 dark:text-amber-200 tabular-nums">{doctor.rating.toFixed(1)}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onOpenProfile(doctor)}
                    className="text-xs font-semibold text-clinical-muted hover:text-clinical-teal hover:underline cursor-pointer"
                  >
                    ({doctor.reviewsCount} تقييم موثق)
                  </button>

                  {/* Recommendation Rate Tag */}
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded-md border border-teal-200/80 dark:border-teal-800/80 font-heading">
                    <ThumbsUp className="w-3 h-3 text-clinical-teal" />
                    <span>{qualityMetrics.recommendationRate}% يوصون به</span>
                  </span>

                  {/* Transparent Consultation Fee Pill */}
                  <span className="inline-flex items-center text-[11px] font-bold text-clinical-navy dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 font-heading mr-auto">
                    الكشف: <span className="text-clinical-teal font-extrabold mr-1">{doctor.fee} ج.م</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Sub-specialties tags */}
            <div className="flex flex-wrap gap-1.5 mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800">
              {doctor.subSpecialties.slice(0, 3).map((sub, i) => (
                <span key={i} className="text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-clinical-navy dark:text-slate-200 px-2.5 py-0.5 rounded-md border border-slate-200/60 dark:border-slate-700">
                  {sub}
                </span>
              ))}
              {doctor.subSpecialties.length > 3 && (
                <span className="text-[11px] font-medium text-clinical-muted px-1 py-0.5">
                  +{doctor.subSpecialties.length - 3} تخصصات إضافية
                </span>
              )}
            </div>

            {/* Preview Showcase Deck */}
            <div className="mt-3.5 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700/70 transition-all duration-200">
              
              {/* Segmented Switcher Header */}
              <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-slate-200/80 dark:border-slate-700/60 font-heading">
                <div className="flex items-center gap-1 p-0.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => setPreviewTab('photos')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                      previewTab === 'photos'
                        ? 'bg-clinical-teal text-white shadow-xs'
                        : 'text-clinical-muted hover:text-clinical-teal'
                    }`}
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>صور العيادة ({clinicPhotos.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPreviewTab('metrics')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                      previewTab === 'metrics'
                        ? 'bg-clinical-teal text-white shadow-xs'
                        : 'text-clinical-muted hover:text-clinical-teal'
                    }`}
                  >
                    <Activity className="w-3.5 h-3.5 text-teal-400" />
                    <span>رادار الجودة والتقييم</span>
                  </button>
                </div>

                <span className="text-[11px] font-medium text-clinical-muted hidden sm:inline-flex items-center gap-1 font-heading">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>معاينة حية سريعة</span>
                </span>
              </div>

              {/* View 1: Clinic Mini Photos Gallery Showcase */}
              {previewTab === 'photos' && (
                <div className="space-y-2 animate-in fade-in duration-200">
                  {/* Active Photo Viewport with Tag Overlay & Lightbox trigger */}
                  <div 
                    onClick={() => setIsPhotoLightboxOpen(true)}
                    className="relative w-full h-32 sm:h-36 rounded-xl overflow-hidden cursor-pointer group/photo border border-slate-200 dark:border-slate-700 bg-slate-900"
                  >
                    <img
                      src={activePhoto.url}
                      alt={activePhoto.title}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover/photo:scale-105 transition-transform duration-500"
                    />

                    {/* Gradient Overlay for Text Legibility */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                    {/* Tag badge on top right */}
                    <span className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-white text-[10px] font-black px-2 py-0.5 rounded-md border border-white/20">
                      {activePhoto.tagLabel}
                    </span>

                    {/* Expand / Lightbox Action on top left */}
                    <div className="absolute top-2 left-2 bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-white p-1 rounded-md shadow-xs opacity-0 group-hover/photo:opacity-100 transition-opacity flex items-center gap-1 text-[10px] font-bold font-heading">
                      <ZoomIn className="w-3 h-3 text-[#088395] dark:text-teal-400" />
                      <span className="hidden sm:inline">تكبير المعاينة</span>
                    </div>

                    {/* Caption on Bottom */}
                    <div className="absolute bottom-2 right-2 left-2 flex items-center justify-between text-white pointer-events-none">
                      <div className="min-w-0">
                        <p className="text-xs font-bold truncate font-heading">{activePhoto.title}</p>
                        {activePhoto.caption && (
                          <p className="text-[10px] text-slate-200 truncate opacity-90">{activePhoto.caption}</p>
                        )}
                      </div>
                      <span className="text-[10px] font-mono font-bold bg-white/20 px-1.5 py-0.5 rounded shrink-0 mr-2">
                        {activePhotoIndex + 1}/{clinicPhotos.length}
                      </span>
                    </div>

                    {/* Quick navigation arrows */}
                    <button
                      type="button"
                      onClick={handlePrevPhoto}
                      className="absolute right-1 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white p-1 rounded-full opacity-0 group-hover/photo:opacity-100 transition-opacity cursor-pointer"
                      title="الصورة السابقة"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNextPhoto}
                      className="absolute left-1 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white p-1 rounded-full opacity-0 group-hover/photo:opacity-100 transition-opacity cursor-pointer"
                      title="الصورة التالية"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Micro Thumbnails Strip */}
                  <div className="grid grid-cols-4 gap-1.5">
                    {clinicPhotos.map((photo, pIdx) => (
                      <button
                        key={photo.id}
                        type="button"
                        onClick={() => setActivePhotoIndex(pIdx)}
                        className={`relative h-11 sm:h-12 rounded-lg overflow-hidden border-2 transition-all duration-150 cursor-pointer ${
                          activePhotoIndex === pIdx
                            ? 'border-[#088395] dark:border-teal-400 ring-2 ring-[#088395]/30 dark:ring-teal-400/40 scale-98 shadow-xs'
                            : 'border-transparent opacity-70 hover:opacity-100 hover:border-slate-300 dark:hover:border-slate-600'
                        }`}
                        title={photo.title}
                      >
                        <img
                          src={photo.url}
                          alt={photo.title}
                          loading="lazy"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-0 inset-x-0 bg-black/65 text-white text-[9px] font-bold text-center py-0.5 truncate px-1">
                          {photo.tagLabel}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* View 2: Non-conventional Visual Quality & Trust Radar */}
              {previewTab === 'metrics' && (
                <div className="animate-in fade-in duration-200 space-y-2.5">
                  {/* Grid of Visual Trust Gauges */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    
                    {/* Gauge 1: Patient Recommendation Pulse */}
                    <div className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-700/80 flex flex-col items-center text-center">
                      <div className="relative flex items-center justify-center mb-1">
                        <div className="w-8 h-8 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                          <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                        </div>
                      </div>
                      <span className="text-sm font-black text-slate-900 dark:text-white">
                        {qualityMetrics.recommendationRate}%
                      </span>
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 leading-tight">
                        يوصون به للأقارب
                      </span>
                    </div>

                    {/* Gauge 2: Punctuality Speedometer / Meter */}
                    <div className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-700/80 flex flex-col items-center text-center">
                      <div className="w-8 h-8 rounded-full bg-teal-50 dark:bg-teal-950/60 text-[#088395] dark:text-teal-400 flex items-center justify-center mb-1">
                        <Clock className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-bold text-slate-900 dark:text-white font-heading">
                        {qualityMetrics.punctualityRate}%
                      </span>
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 leading-tight font-heading">
                        انضباط المواعيد
                      </span>
                    </div>

                    {/* Gauge 3: Diagnosis Depth & Clarity */}
                    <div className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-700/80 flex flex-col items-center text-center">
                      <div className="w-8 h-8 rounded-full bg-teal-50 dark:bg-teal-950/60 text-[#088395] dark:text-teal-400 flex items-center justify-center mb-1">
                        <Stethoscope className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-bold text-slate-900 dark:text-white font-heading">
                        {qualityMetrics.diagnosisClarity} <span className="text-[10px] font-normal text-slate-400">/ 5</span>
                      </span>
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 leading-tight font-heading">
                        عمق الفحص والشرح
                      </span>
                    </div>

                    {/* Gauge 4: Certified Hygiene Standard */}
                    <div className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-700/80 flex flex-col items-center text-center">
                      <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-1">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <span className="text-sm font-bold text-slate-900 dark:text-white font-heading">
                        {qualityMetrics.sanitationScore}%
                      </span>
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 leading-tight font-heading">
                        معايير التعقيم الفائق
                      </span>
                    </div>

                  </div>

                  {/* Patient Sentiments Breakdown Chips */}
                  <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700/80">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-1.5 font-heading">
                      خلاصة انطباعات المرضى الموثقين:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 font-heading">
                      {qualityMetrics.patientSentiments?.map((sent, sIdx) => (
                        <div 
                          key={sIdx}
                          className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/90 px-2 py-1 rounded-lg text-[11px] font-bold text-slate-700 dark:text-slate-300"
                        >
                          <span className="flex items-center gap-1 truncate">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            <span className="truncate">{sent.text}</span>
                          </span>
                          <span className="font-mono text-[10px] text-[#088395] dark:text-teal-300 shrink-0 mr-1.5">
                            {sent.percentage}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Insurance accepted badges */}
            {doctor.acceptedInsurances && doctor.acceptedInsurances.length > 0 && (
              <div className="flex items-center gap-1.5 mt-2.5 pt-2 text-[11px] text-slate-700 dark:text-slate-300 font-heading">
                <Shield className="w-3.5 h-3.5 text-[#088395] dark:text-teal-400 shrink-0" />
                <span className="font-bold shrink-0">التأمين المتاح:</span>
                <div className="flex flex-wrap gap-1">
                  {doctor.acceptedInsurances.slice(0, 3).map((ins, i) => (
                    <span key={i} className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 px-2 py-0.5 rounded text-[10px] font-bold text-slate-800 dark:text-slate-200">
                      {ins}
                    </span>
                  ))}
                  {doctor.acceptedInsurances.length > 3 && (
                    <span className="text-[10px] text-slate-600 dark:text-slate-400 font-bold">
                      +{doctor.acceptedInsurances.length - 3} أخرى
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Practical details (Address, Facility, Waiting time) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 text-xs text-slate-700 dark:text-slate-200 bg-slate-50/70 dark:bg-slate-800/60 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700/80 font-heading">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#088395] dark:text-teal-400 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <span className="font-bold text-slate-900 dark:text-white block truncate">{doctor.address}</span>
                  <span className="text-[11px] text-slate-600 dark:text-slate-400 block truncate">{doctor.landmark}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#088395] dark:text-teal-400 shrink-0" />
                <div>
                  <span className="text-slate-600 dark:text-slate-400 font-medium">نوع المنشأة:</span>
                  <strong className="text-slate-900 dark:text-white font-bold mr-1">
                    {doctor.facilityType === 'hospital' ? 'مستشفى' : doctor.facilityType === 'polyclinic' ? 'مجمع عيادات' : 'عيادة خاصة'}
                  </strong>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#088395] dark:text-teal-400 shrink-0" />
                <div>
                  <span className="text-slate-600 dark:text-slate-400 font-medium">مدة الانتظار:</span>
                  <strong className="text-slate-900 dark:text-white font-bold mr-1">{doctor.waitingTime}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Link & Quick Booking Badge */}
          <div className="mt-3.5 pt-3 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => onOpenProfile(doctor)}
              className="text-xs font-bold text-[#088395] dark:text-teal-400 hover:text-[#0a4d68] dark:hover:text-teal-300 flex items-center gap-1 cursor-pointer font-heading"
            >
              <Info className="w-3.5 h-3.5" />
              <span>عرض السيرة والشهادات والخدمات</span>
            </button>
            <span className="text-[11px] text-teal-800 dark:text-teal-300 font-bold bg-teal-50 dark:bg-teal-950/80 px-2.5 py-0.5 rounded-md border border-teal-200 dark:border-teal-800 flex items-center gap-1 font-heading">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>متاح الحجز الفوري</span>
            </span>
          </div>
        </div>

        {/* Left Column: Horizontal Multi-Day Booking Schedule */}
        <div className="w-full lg:w-80 bg-slate-50 dark:bg-slate-950 border-t lg:border-t-0 lg:border-r border-slate-200 dark:border-slate-800 p-4 sm:p-5 flex flex-col justify-between shrink-0 font-body">
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold text-[#0A2540] dark:text-white flex items-center gap-1.5 font-heading">
                <CalendarCheck className="w-4 h-4 text-[#088395] dark:text-teal-400" />
                <span>مواعيد كشف العيادة</span>
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold font-heading">الدفع بالعيادة</span>
            </div>

            {/* Consultation Fee Banner */}
            <div className="mb-3 bg-white dark:bg-slate-900 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300 font-heading">قيمة الكشف بالعيادة:</span>
              <span className="text-sm font-bold text-[#088395] dark:text-teal-400 font-heading tabular-nums">{doctor.fee} جنيه</span>
            </div>

            {/* Days Tabs Slider */}
            <div className="grid grid-cols-3 gap-1.5 mb-3 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs font-heading">
              {doctor.availableDays.map((d, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    setActiveDayIndex(index);
                    setSelectedSlot(d.slots[0] || null);
                  }}
                  className={`py-2 px-1 rounded-lg text-center transition-all duration-150 active:scale-95 cursor-pointer ${
                    activeDayIndex === index
                      ? 'bg-[#088395] text-white shadow-xs font-bold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium'
                  }`}
                >
                  <span className="block text-xs leading-none">{d.dayName}</span>
                  <span className="block text-[10px] opacity-90 mt-0.5 font-medium">
                    {d.dateStr.split('،')[1]?.trim() || d.dateStr}
                  </span>
                </button>
              ))}
            </div>

            {/* Time Slots Chips Grid */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-2 font-heading">
                <span>المواعيد لـ ({currentDay?.dateStr}):</span>
                {currentDay?.slots && (
                  <span className="text-[10px] font-medium text-slate-400">
                    {currentDay.slots.length} فترات متاحة
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-0.5">
                {currentDay?.slots.map((slot, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSlotClick(slot)}
                    className={`text-xs py-2 px-2.5 rounded-lg border font-bold transition-all duration-150 active:scale-95 cursor-pointer font-heading ${
                      selectedSlot === slot
                        ? 'bg-teal-50 dark:bg-teal-950/80 text-[#088395] dark:text-teal-200 border-[#088395] dark:border-teal-400 shadow-xs ring-1 ring-[#088395]'
                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-700 hover:border-[#088395] hover:bg-teal-50/40 dark:hover:bg-slate-700'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Instant Booking Action Button */}
          <div>
            <button
              id={`btn-book-doctor-${doctor.id}`}
              type="button"
              onClick={handleConfirmBooking}
              disabled={!selectedSlot}
              className="btn-clinical-primary w-full py-3 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 font-heading"
            >
              <span>احجز الآن في العيادة</span>
              {selectedSlot && (
                <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded font-mono font-bold">
                  {selectedSlot}
                </span>
              )}
            </button>

            <div className="flex items-center justify-center gap-1.5 mt-2.5 text-[11px] text-slate-500 dark:text-slate-400 text-center font-medium font-heading">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>الحجز مجاني، والدفع بالعيادة بالسعر الرسمي</span>
            </div>
          </div>
        </div>
      </div>

      {/* Full Clinic Photo Lightbox Modal */}
      {isPhotoLightboxOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200 font-['Tajawal',sans-serif]"
          onClick={() => setIsPhotoLightboxOpen(false)}
        >
          <div 
            className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Lightbox Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between text-white">
              <div>
                <span className="text-[11px] font-bold text-cyan-400 block mb-0.5">
                  معاينة مرافق عيادة {doctor.name}
                </span>
                <h4 className="text-base font-black">{activePhoto.title}</h4>
              </div>
              <button
                type="button"
                onClick={() => setIsPhotoLightboxOpen(false)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="إغلاق"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Main Lightbox Image */}
            <div className="relative aspect-video w-full bg-black">
              <img
                src={activePhoto.url}
                alt={activePhoto.title}
                className="w-full h-full object-contain"
              />
              <button
                type="button"
                onClick={handlePrevPhoto}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/90 text-white p-2.5 rounded-full cursor-pointer transition-colors"
                title="السابق"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={handleNextPhoto}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/90 text-white p-2.5 rounded-full cursor-pointer transition-colors"
                title="التالي"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            </div>

            {/* Lightbox Footer with Caption & Thumbnails */}
            <div className="p-4 bg-slate-950 border-t border-slate-800">
              {activePhoto.caption && (
                <p className="text-xs text-slate-300 mb-3 leading-relaxed">
                  {activePhoto.caption}
                </p>
              )}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {clinicPhotos.map((p, idx) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setActivePhotoIndex(idx)}
                    className={`relative w-16 h-12 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                      activePhotoIndex === idx ? 'border-blue-500 ring-2 ring-blue-500/50' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={p.url} alt={p.title} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
