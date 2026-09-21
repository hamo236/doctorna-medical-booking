import React, { useState, useMemo } from 'react';
import { 
  Stethoscope, 
  FileText, 
  HelpCircle, 
  ShieldCheck, 
  Star, 
  CreditCard, 
  ChevronLeft,
  Award,
  Compass,
  PhoneCall,
  CalendarCheck,
  Zap,
  Sparkles,
  MapPin,
  Clock,
  HeartPulse,
  Activity,
  ArrowUpRight
} from 'lucide-react';
import { Doctor, Booking } from '../types';
import { DoctorCard } from './DoctorCard';
import { HeroSearch } from './HeroSearch';
import { UpcomingAppointmentBanner } from './UpcomingAppointmentBanner';
import { SpecialtiesGrid } from './SpecialtiesGrid';

interface HomeViewProps {
  doctors: Doctor[];
  bookings?: Booking[];
  selectedSpecialty: string;
  setSelectedSpecialty: (s: string) => void;
  selectedCity: string;
  setSelectedCity: (c: string) => void;
  selectedArea: string;
  setSelectedArea: (a: string) => void;
  selectedInsurance?: string;
  setSelectedInsurance?: (ins: string) => void;
  onSearch: (filters: { specialty: string; city: string; area: string; doctorName: string; insurance?: string; filterPreset?: string }) => void;
  onOpenProfile: (doctor: Doctor) => void;
  onBookSlot: (doctor: Doctor, day: string, slot: string) => void;
  onNavigateToSearch: () => void;
  onNavigateToRecords: () => void;
  onNavigateToBookings?: () => void;
  onViewVoucher?: (booking: Booking) => void;
  onOpenSymptomGuide: () => void;
  onOpenMaps?: () => void;
  onOpenJoinDoctor?: () => void;
  favorites?: string[];
  onToggleFavorite?: (id: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  doctors,
  bookings = [],
  selectedSpecialty,
  setSelectedSpecialty,
  selectedCity,
  setSelectedCity,
  selectedArea,
  setSelectedArea,
  selectedInsurance = '',
  setSelectedInsurance,
  onSearch,
  onOpenProfile,
  onBookSlot,
  onNavigateToSearch,
  onNavigateToRecords,
  onNavigateToBookings = () => {},
  onViewVoucher = () => {},
  onOpenSymptomGuide,
  onOpenMaps,
  onOpenJoinDoctor,
  favorites = [],
  onToggleFavorite
}) => {
  // Curated doctors filter state
  const [curatedFilter, setCuratedFilter] = useState<'top_rated' | 'available_soon' | 'affordable' | 'all'>('top_rated');

  // Filter curated doctors
  const displayedCuratedDoctors = useMemo(() => {
    if (!doctors || doctors.length === 0) return [];
    
    let list = [...doctors];
    if (curatedFilter === 'top_rated') {
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (curatedFilter === 'affordable') {
      list.sort((a, b) => (a.consultationFee || 0) - (b.consultationFee || 0));
    } else if (curatedFilter === 'available_soon') {
      // Prioritize doctors with available slots today or tomorrow
      list.sort((a, b) => {
        const aHasToday = a.availableDays?.some(d => d.dateStr.includes('اليوم')) ? 1 : 0;
        const bHasToday = b.availableDays?.some(d => d.dateStr.includes('اليوم')) ? 1 : 0;
        return bHasToday - aHasToday;
      });
    }
    return list.slice(0, 3);
  }, [doctors, curatedFilter]);

  const confirmedBookingsCount = bookings.filter(b => b.status === 'confirmed').length;

  return (
    <div className="w-full font-body bg-clinical-canvas text-slate-800 dark:text-slate-100 transition-colors duration-300">
      
      {/* 1. Quick Info Bar */}
      <div className="bg-clinical-navy text-white border-b border-clinical-border py-2 px-4 text-xs font-heading">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-teal-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
              <span>مرحباً بك في المنصة الطبية المعتمدة للعيادات والمراكز الصحية</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            {confirmedBookingsCount > 0 && (
              <button
                type="button"
                onClick={onNavigateToBookings}
                className="text-teal-300 hover:text-teal-200 font-bold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <CalendarCheck className="w-3.5 h-3.5" />
                <span>لديك {confirmedBookingsCount} كشف نشط</span>
              </button>
            )}
            <button
              type="button"
              onClick={onOpenSymptomGuide}
              className="text-slate-300 hover:text-white font-bold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5 text-teal-400" />
              <span>محتار في التخصص؟</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Upcoming Appointment Flight Board (if active confirmed booking exists) */}
      {bookings.length > 0 && (
        <UpcomingAppointmentBanner
          bookings={bookings}
          onViewVoucher={onViewVoucher}
          onNavigateToBookings={onNavigateToBookings}
        />
      )}

      {/* 3. Hero Clinical Search Console */}
      <HeroSearch
        onSearch={onSearch}
        selectedSpecialty={selectedSpecialty}
        setSelectedSpecialty={setSelectedSpecialty}
        selectedCity={selectedCity}
        setSelectedCity={setSelectedCity}
        selectedArea={selectedArea}
        setSelectedArea={setSelectedArea}
        selectedInsurance={selectedInsurance}
        setSelectedInsurance={setSelectedInsurance}
      />

      {/* 4. Structured Clinical Specialties Taxonomy Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-9 sm:py-12 border-b border-slate-200/90 dark:border-slate-800">
        <SpecialtiesGrid
          selectedSpecialty={selectedSpecialty}
          onSelectSpecialty={(specId) => {
            setSelectedSpecialty(specId);
            onNavigateToSearch();
          }}
          onNavigateToSearch={onNavigateToSearch}
          doctors={doctors}
        />
      </section>

      {/* 5. Core Healthcare Services & Clinical Utilities */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-9 sm:py-12 border-b border-slate-200/90 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6 sm:mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-teal-50 dark:bg-teal-950/60 text-[#088395] dark:text-teal-300 text-xs font-bold px-3 py-1 rounded-md border border-teal-200/80 dark:border-teal-800/80 font-heading mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>منظومة متكاملة لخدمة المريض</span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#0A2540] dark:text-white font-heading tracking-tight">
              ركائز الرعاية الصحية في دكتورنا
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium max-w-2xl">
              أدوات طبية ذكية مصممة لحماية وقتك وصحتك، من حجز الكشف وتتبع الطابور إلى حفظ الروشتات وفحص تعارضات الأدوية
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          
          {/* Pillar 1: Clinic Booking & Live Queue Tracker */}
          <div 
            id="service-clinic-booking"
            onClick={onNavigateToSearch}
            className="group relative bg-clinical-surface rounded-2xl border border-clinical-border p-5 sm:p-6 shadow-xs hover:border-clinical-teal hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-950/80 text-clinical-teal border border-teal-200/80 dark:border-teal-800 flex items-center justify-center group-hover:bg-clinical-teal group-hover:text-white transition-colors">
                  <Stethoscope className="w-6 h-6 stroke-[2]" />
                </div>
                <span className="text-[11px] font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-0.5 rounded-full border border-teal-200 dark:border-teal-800 font-heading">
                  حجز فوري
                </span>
              </div>
              
              <h3 className="font-bold text-clinical-navy dark:text-white text-base sm:text-lg mb-1.5 font-heading group-hover:text-clinical-teal transition-colors">
                حجز كشف عيادة ومستشفى
              </h3>
              <p className="text-xs text-clinical-muted leading-relaxed font-medium">
                احجز موعدك المؤكد، تتبع رقم دورك في طابور العيادة مباشرة من بيتك، وادفع عند الزيارة بالسعر الرسمي المعلن.
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-clinical-teal font-heading">
              <span>تصفح الأطباء المتاحين</span>
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Pillar 2: Live Clinic & Hospital Maps */}
          <div 
            id="service-live-maps"
            onClick={onOpenMaps || onNavigateToSearch}
            className="group relative bg-clinical-surface rounded-2xl border border-clinical-border p-5 sm:p-6 shadow-xs hover:border-sky-500 dark:hover:border-sky-400 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-sky-50 dark:bg-sky-950/80 text-sky-600 dark:text-sky-300 border border-sky-200/80 dark:border-sky-800 flex items-center justify-center group-hover:bg-sky-600 group-hover:text-white transition-colors">
                  <Compass className="w-6 h-6 stroke-[2]" />
                </div>
                <span className="text-[11px] font-bold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 px-2.5 py-0.5 rounded-full border border-sky-200 dark:border-sky-800 font-heading">
                  Maps التفاعلية
                </span>
              </div>

              <h3 className="font-bold text-clinical-navy dark:text-white text-base sm:text-lg mb-1.5 font-heading group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                خريطة العيادات والمراكز الحية
              </h3>
              <p className="text-xs text-clinical-muted leading-relaxed font-medium">
                استكشف العيادات والمستشفيات الأقرب لموقعك بدقة مع حساب المسافة وزمن الوصول والتوجيه بخط السير المباشر.
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-sky-600 dark:text-sky-400 font-heading">
              <span>استكشاف الخريطة الحية</span>
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Pillar 3: Smart Medical Records & Prescription OCR */}
          <div 
            id="service-medical-records"
            onClick={onNavigateToRecords}
            className="group relative bg-clinical-surface rounded-2xl border border-clinical-border p-5 sm:p-6 shadow-xs hover:border-emerald-500 dark:hover:border-emerald-400 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <FileText className="w-6 h-6 stroke-[2]" />
                </div>
                <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 font-heading">
                  OCR ذكي
                </span>
              </div>

              <h3 className="font-bold text-clinical-navy dark:text-white text-base sm:text-lg mb-1.5 font-heading group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                الملف الطبي والروشتات الذكية
              </h3>
              <p className="text-xs text-clinical-muted leading-relaxed font-medium">
                احفظ تاريخك المرضي وفحوصاتك مع فاحص تعارضات الأدوية الذكي والمسح الضوئي لروشتات الأطباء بخط اليد.
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400 font-heading">
              <span>فتح ملفي الطبي</span>
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Pillar 4: AI Clinical Specialty Triage Guide */}
          <div 
            id="service-triage-guide"
            onClick={onOpenSymptomGuide}
            className="group relative bg-clinical-surface rounded-2xl border border-clinical-border p-5 sm:p-6 shadow-xs hover:border-indigo-500 dark:hover:border-indigo-400 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <HelpCircle className="w-6 h-6 stroke-[2]" />
                </div>
                <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800 font-heading">
                  فرز فوري
                </span>
              </div>

              <h3 className="font-bold text-clinical-navy dark:text-white text-base sm:text-lg mb-1.5 font-heading group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                دليل الفرز واختيار التخصص
              </h3>
              <p className="text-xs text-clinical-muted leading-relaxed font-medium">
                غير متأكد من التخصص الصحيح؟ صف أعراضك وسيوجهك الدليل الطبي السريري للتخصص الأنسب والفحوصات الأولية.
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400 font-heading">
              <span>بدء الفرز الطبي الآن</span>
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            </div>
          </div>

        </div>
      </section>

      {/* 6. Curated & Recommended Doctors Section */}
      <section className="bg-white dark:bg-slate-900/60 py-10 sm:py-14 border-b border-slate-200/90 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {doctors.length > 0 ? (
            <>
              {/* Header with Curated Filter Tabs */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-bold px-3 py-1 rounded-md border border-amber-200/80 dark:border-amber-800/80 font-heading mb-2">
                    <Award className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span>أطباء وعيادات موثقة من مرضى المنصة</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#0A2540] dark:text-white font-heading tracking-tight">
                    ترشيحات الأطباء والمراكز المعتمدة
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
                    مواعيد كشف حقيقية متاحة اليوم وغداً مع تقييمات موثقة وانضباط في الحضور
                  </p>
                </div>

                {/* Curated Filter Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                  <button
                    type="button"
                    onClick={() => setCuratedFilter('top_rated')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer font-heading whitespace-nowrap ${
                      curatedFilter === 'top_rated'
                        ? 'bg-[#0A2540] dark:bg-teal-500 text-white dark:text-slate-950'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    ⭐ الأعلى تقييماً
                  </button>

                  <button
                    type="button"
                    onClick={() => setCuratedFilter('available_soon')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer font-heading whitespace-nowrap ${
                      curatedFilter === 'available_soon'
                        ? 'bg-[#0A2540] dark:bg-teal-500 text-white dark:text-slate-950'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    ⚡ أقرب موعد متاح
                  </button>

                  <button
                    type="button"
                    onClick={() => setCuratedFilter('affordable')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer font-heading whitespace-nowrap ${
                      curatedFilter === 'affordable'
                        ? 'bg-[#0A2540] dark:bg-teal-500 text-white dark:text-slate-950'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    💰 كشف اقتصادي
                  </button>
                </div>
              </div>

              {/* Doctors List */}
              <div className="space-y-4">
                {displayedCuratedDoctors.map((doctor) => (
                  <DoctorCard
                    key={doctor.id}
                    doctor={doctor}
                    onOpenProfile={onOpenProfile}
                    onBookSlot={onBookSlot}
                    isFavorite={favorites.includes(doctor.id)}
                    onToggleFavorite={onToggleFavorite}
                  />
                ))}
              </div>

              {/* View Full Directory Button */}
              <div className="mt-8 text-center">
                <button
                  type="button"
                  onClick={onNavigateToSearch}
                  className="btn-clinical-secondary text-xs sm:text-sm px-6 py-3 font-heading inline-flex items-center gap-2"
                >
                  <span>استعراض دليل الأطباء والعيادات الكامل ({doctors.length} عيادة)</span>
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 sm:p-10 text-center max-w-2xl mx-auto shadow-xs">
              <div className="w-14 h-14 rounded-xl bg-teal-50 dark:bg-slate-800 text-[#088395] dark:text-teal-400 flex items-center justify-center mx-auto mb-4 border border-teal-100 dark:border-slate-700">
                <Stethoscope className="w-7 h-7" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-[#0A2540] dark:text-white mb-2 font-heading">
                شبكة التعاقدات الطبية قيد المراجعة والتسجيل
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6 font-medium">
                لم يتم التعاقد مع أطباء أو مراكز طبية حتى الآن. نعمل حالياً على استكمال إجراءات التعاقد ومراجعة التراخيص لضمان جودة الرعاية الصحية قبل إطلاق جداول الحجز.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 font-heading">
                {onOpenJoinDoctor && (
                  <button
                    type="button"
                    onClick={onOpenJoinDoctor}
                    className="btn-clinical-primary text-xs w-full sm:w-auto"
                  >
                    طلب انضمام طبيب أو عيادة
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSpecialty('all');
                    onNavigateToSearch();
                  }}
                  className="w-full sm:w-auto bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-5 py-2.5 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  استعراض كل الأطباء
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 7. Clinical Trust Commitments & Transparency */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-9 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-teal-50 dark:bg-slate-800 text-[#088395] dark:text-teal-400 border border-teal-200/70 dark:border-slate-700 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm font-heading mb-1">عيادات وأطباء معتمدون</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                مراجعة رسمية لتراخيص مزاولة المهنة وسجلات نقابة الأطباء المصرية لكل طبيب مدرج بالمنصة.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-teal-50 dark:bg-slate-800 text-[#088395] dark:text-teal-400 border border-teal-200/70 dark:border-slate-700 flex items-center justify-center shrink-0">
              <Star className="w-5 h-5 stroke-[2] fill-[#088395] dark:fill-teal-400" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm font-heading mb-1">تقييمات مرضى حقيقية وموثقة</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                تُكتب وتُراجع حصرياً بعد تأكيد إتمام الكشف الفعلي بالعيادة لمنع أي تقييمات مضللة.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-teal-50 dark:bg-slate-800 text-[#088395] dark:text-teal-400 border border-teal-200/70 dark:border-slate-700 flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm font-heading mb-1">حجز مجاني 100% ودفع بالعيادة</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                بدون أي رسوم حجز إضافية مسبقة، والدفع يكون مباشرة في العيادة بنفس السعر الرسمي المعلن.
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
