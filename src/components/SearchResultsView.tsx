import React, { useState } from 'react';
import { 
  Filter, 
  RotateCcw, 
  Search, 
  ChevronDown, 
  SlidersHorizontal,
  MapPin,
  CheckCircle2,
  Calendar,
  DollarSign,
  UserCheck,
  Shield,
  LayoutList,
  Map as MapIcon
} from 'lucide-react';
import { Doctor } from '../types';
import { DoctorCard } from './DoctorCard';
import { ClinicMapVisualizer } from './ClinicMapVisualizer';
import { CustomEmptyState } from './CustomEmptyState';
import { CustomLoadingSkeleton } from './CustomLoadingSkeleton';
import { SPECIALTIES, CITIES_AND_AREAS, INSURANCE_COMPANIES } from '../data/seedData';

interface SearchResultsViewProps {
  doctors: Doctor[];
  isLoading?: boolean;
  selectedSpecialty: string;
  setSelectedSpecialty: (s: string) => void;
  selectedCity: string;
  setSelectedCity: (c: string) => void;
  selectedArea: string;
  setSelectedArea: (a: string) => void;
  selectedInsurance?: string;
  setSelectedInsurance?: (ins: string) => void;
  doctorNameQuery: string;
  setDoctorNameQuery: (q: string) => void;
  onOpenProfile: (doctor: Doctor) => void;
  onBookSlot: (doctor: Doctor, day: string, slot: string) => void;
  onOpenJoinDoctor?: () => void;
  favorites?: string[];
  onToggleFavorite?: (id: string) => void;
}

export const SearchResultsView: React.FC<SearchResultsViewProps> = ({
  doctors,
  isLoading = false,
  selectedSpecialty,
  setSelectedSpecialty,
  selectedCity,
  setSelectedCity,
  selectedArea,
  setSelectedArea,
  selectedInsurance = '',
  setSelectedInsurance,
  doctorNameQuery,
  setDoctorNameQuery,
  onOpenProfile,
  onBookSlot,
  onOpenJoinDoctor,
  favorites = [],
  onToggleFavorite
}) => {
  const [selectedTitleFilter, setSelectedTitleFilter] = useState<string>('all');
  const [selectedGenderFilter, setSelectedGenderFilter] = useState<string>('all');
  const [availableTodayOnly, setAvailableTodayOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'rating' | 'reviews'>('rating');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);

  const currentAreas = CITIES_AND_AREAS.find(c => c.city === selectedCity)?.areas || [];

  // Count active filters
  const activeFiltersCount = [
    Boolean(selectedSpecialty && selectedSpecialty !== 'all'),
    Boolean(selectedCity),
    Boolean(selectedArea),
    Boolean(selectedInsurance),
    Boolean(doctorNameQuery.trim()),
    selectedTitleFilter !== 'all',
    selectedGenderFilter !== 'all',
    availableTodayOnly
  ].filter(Boolean).length;

  // Filter Logic
  const filtered = doctors.filter((doc) => {
    // Name Query
    if (doctorNameQuery.trim()) {
      const q = doctorNameQuery.toLowerCase();
      const matchName = doc.name.toLowerCase().includes(q);
      const matchSpec = doc.specialty.toLowerCase().includes(q);
      const matchSub = doc.subSpecialties.some(s => s.toLowerCase().includes(q));
      if (!matchName && !matchSpec && !matchSub) return false;
    }

    // Specialty
    if (selectedSpecialty && selectedSpecialty !== 'all') {
      if (doc.specialtyId !== selectedSpecialty) return false;
    }

    // City & Area
    if (selectedCity && doc.city !== selectedCity) return false;
    if (selectedArea && doc.area !== selectedArea) return false;

    // Insurance
    if (selectedInsurance) {
      if (!doc.acceptedInsurances || !doc.acceptedInsurances.includes(selectedInsurance)) {
        return false;
      }
    }

    // Academic Title
    if (selectedTitleFilter !== 'all' && doc.title !== selectedTitleFilter) return false;

    // Gender
    if (selectedGenderFilter !== 'all' && doc.gender !== selectedGenderFilter) return false;

    // Availability
    if (availableTodayOnly) {
      const hasToday = doc.availableDays.some(d => d.dayName === 'اليوم' && d.slots.length > 0);
      if (!hasToday) return false;
    }

    return true;
  });

  // Sorting
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'reviews') return b.reviewsCount - a.reviewsCount;
    return 0;
  });

  const handleClearAllFilters = () => {
    setSelectedSpecialty('');
    setSelectedCity('');
    setSelectedArea('');
    if (setSelectedInsurance) setSelectedInsurance('');
    setDoctorNameQuery('');
    setSelectedTitleFilter('all');
    setSelectedGenderFilter('all');
    setAvailableTodayOnly(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-body">
      
      {/* Breadcrumb & Results Count Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1.5 font-medium font-heading">
            <span>دكتورنا</span>
            <span>/</span>
            <span>أطباء مصر</span>
            {selectedSpecialty && (
              <>
                <span>/</span>
                <span className="text-[#088395] dark:text-teal-400 font-bold">
                  {SPECIALTIES.find(s => s.id === selectedSpecialty)?.name}
                </span>
              </>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0A2540] dark:text-white font-heading">
            {selectedSpecialty 
              ? `أفضل أطباء ${SPECIALTIES.find(s => s.id === selectedSpecialty)?.name}` 
              : 'دليل أطباء وعيادات دكتورنا'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            احجز موعدك بالعيادة مجاناً، وادفع عند الحضور بدون أي زيادة على سعر الكشف
          </p>
        </div>

        {/* View Toggle (List vs Map) & Sort By Dropdown */}
        <div className="flex flex-wrap items-center gap-3 self-start md:self-auto font-heading">
          
          {/* List vs Map Switcher */}
          <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-xl shadow-xs">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-[#088395] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <LayoutList className="w-3.5 h-3.5" />
              <span>عرض القائمة</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                viewMode === 'map'
                  ? 'bg-[#088395] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>الخريطة الجغرافية</span>
            </button>
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-bold shrink-0">الترتيب:</span>
            <select
              id="select-sort-by"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold py-2 px-3 rounded-xl outline-none focus:border-[#088395] cursor-pointer"
            >
              <option value="rating">الأعلى تقييماً</option>
              <option value="reviews">الأكثر مراجعات</option>
            </select>
          </div>

        </div>
      </div>

      {/* Horizontal Medical Specialties Bar (أقسام التخصص الطبي السريعة) */}
      <div className="mb-6 overflow-x-auto pb-2 scrollbar-none font-heading">
        <div className="flex items-center gap-2 min-w-max">
          <button
            type="button"
            onClick={() => setSelectedSpecialty('')}
            className={`text-xs font-bold px-4 py-2 rounded-xl border transition-all duration-200 cursor-pointer ${
              !selectedSpecialty || selectedSpecialty === 'all'
                ? 'bg-[#088395] text-white border-[#088395] shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-[#088395]'
            }`}
          >
            جميع التخصصات
          </button>
          {SPECIALTIES.filter(s => s.id !== 'all').map((spec) => (
            <button
              key={spec.id}
              type="button"
              onClick={() => setSelectedSpecialty(spec.id)}
              className={`text-xs font-bold px-4 py-2 rounded-xl border transition-all duration-200 cursor-pointer ${
                selectedSpecialty === spec.id
                  ? 'bg-[#088395] text-white border-[#088395] shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-[#088395]'
              }`}
            >
              {spec.name}
            </button>
          ))}
        </div>
      </div>

      {/* Map View Mode */}
      {viewMode === 'map' ? (
        <div className="space-y-6 animate-in fade-in duration-300">
          <ClinicMapVisualizer
            doctors={doctors}
            selectedCity={selectedCity}
            setSelectedCity={setSelectedCity}
            selectedArea={selectedArea}
            setSelectedArea={setSelectedArea}
            onOpenProfile={onOpenProfile}
            onBookSlot={onBookSlot}
            onOpenJoinDoctor={onOpenJoinDoctor}
          />
        </div>
      ) : (
        /* Standard List & Filters View Mode */
        <div className="space-y-4">
          {/* Mobile Filter Toggle Header */}
          <div className="lg:hidden flex items-center justify-between bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs font-heading">
            <button
              type="button"
              onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
              className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-100 cursor-pointer"
            >
              <SlidersHorizontal className="w-4 h-4 text-[#088395] dark:text-teal-400" />
              <span>تصفية الأطباء والنتائج</span>
              {activeFiltersCount > 0 && (
                <span className="bg-[#088395] text-white text-[10px] px-1.5 py-0.5 rounded-full font-mono">
                  {activeFiltersCount}
                </span>
              )}
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isMobileFilterOpen ? 'rotate-180' : ''}`} />
            </button>

            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={handleClearAllFilters}
                className="text-[11px] text-[#088395] dark:text-teal-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>مسح الكل</span>
              </button>
            )}
          </div>

          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start animate-in fade-in duration-300">
            {/* Sidebar Filters */}
            <aside className={`w-full lg:w-72 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs shrink-0 lg:sticky lg:top-24 font-body transition-all duration-200 ${
              isMobileFilterOpen ? 'block' : 'hidden lg:block'
            }`}>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4 font-heading">
                <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 font-bold text-sm">
                  <SlidersHorizontal className="w-4 h-4 text-[#088395] dark:text-teal-400" />
                  <span>خيارات التصفية</span>
                </div>
                <button
                  onClick={handleClearAllFilters}
                  className="text-xs text-[#088395] dark:text-teal-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>مسح الفلاتر</span>
                </button>
              </div>

              <div className="space-y-4 text-xs text-slate-700 dark:text-slate-300">
                
                {/* Quick search input */}
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1.5 font-heading">ابحث بالاسم أو العيادة</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="اسم الطبيب..."
                      value={doctorNameQuery}
                      onChange={(e) => setDoctorNameQuery(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl py-2 px-2.5 text-xs outline-none focus:border-[#088395] focus:bg-white dark:focus:bg-slate-800"
                    />
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                {/* Specialty */}
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1.5 font-heading">التخصص الطبي</label>
                  <select
                    value={selectedSpecialty}
                    onChange={(e) => setSelectedSpecialty(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl py-2 px-2.5 text-xs font-bold outline-none cursor-pointer"
                  >
                    <option value="" className="dark:bg-slate-900">جميع التخصصات</option>
                    {SPECIALTIES.filter(s => s.id !== 'all').map(s => (
                      <option key={s.id} value={s.id} className="dark:bg-slate-900">{s.name}</option>
                    ))}
                  </select>
                </div>

                {/* City & Area */}
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1.5 font-heading">المحافظة والمنطقة</label>
                  <div className="space-y-1.5">
                    <select
                      value={selectedCity}
                      onChange={(e) => {
                        setSelectedCity(e.target.value);
                        setSelectedArea('');
                      }}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl py-2 px-2.5 text-xs outline-none cursor-pointer"
                    >
                      <option value="" className="dark:bg-slate-900">جميع المحافظات</option>
                      {CITIES_AND_AREAS.map(c => (
                        <option key={c.city} value={c.city}>{c.city}</option>
                      ))}
                    </select>

                    <select
                      value={selectedArea}
                      onChange={(e) => setSelectedArea(e.target.value)}
                      disabled={!selectedCity}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl py-2 px-2.5 text-xs outline-none cursor-pointer disabled:opacity-50"
                    >
                      <option value="" className="dark:bg-slate-900">جميع المناطق</option>
                      {currentAreas.map(a => (
                        <option key={a} value={a} className="dark:bg-slate-900">{a}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Academic Title */}
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-2 font-heading">الدرجة العلمية</label>
                  <div className="space-y-1.5">
                    {[
                      { id: 'all', label: 'الكل' },
                      { id: 'أستاذ دكتور', label: 'أستاذ دكتور (بروفيسور)' },
                      { id: 'استشاري', label: 'استشاري' },
                      { id: 'أخصائي أول', label: 'أخصائي أول' }
                    ].map((t) => (
                      <label key={t.id} className="flex items-center gap-2 cursor-pointer font-heading">
                        <input
                          type="radio"
                          name="titleFilter"
                          checked={selectedTitleFilter === t.id}
                          onChange={() => setSelectedTitleFilter(t.id)}
                          className="accent-[#088395]"
                        />
                        <span>{t.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Gender */}
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-2 font-heading">نوع الطبيب</label>
                  <div className="flex gap-2 font-heading">
                    {[
                      { id: 'all', label: 'الكل' },
                      { id: 'male', label: 'طبيب' },
                      { id: 'female', label: 'طبيبة' }
                    ].map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setSelectedGenderFilter(g.id)}
                        className={`flex-1 py-1.5 px-2 rounded-xl border font-bold text-xs transition-all cursor-pointer ${
                          selectedGenderFilter === g.id
                            ? 'bg-[#088395] text-white border-[#088395]'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Availability today checkbox */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 font-heading">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={availableTodayOnly}
                      onChange={(e) => setAvailableTodayOnly(e.target.checked)}
                      className="rounded text-[#088395] accent-[#088395]"
                    />
                    <span className="font-bold text-slate-800 dark:text-slate-200">متاح الحجز اليوم فقط</span>
                  </label>
                </div>

              </div>
            </aside>

          {/* Doctor Cards Listing */}
          <main className="flex-1 w-full space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 p-3 sm:p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 font-heading">
              <span>
                {isLoading ? (
                  <span className="font-bold text-[#088395] dark:text-teal-400">جاري تحميل قائمة الأطباء والمواعيد المتاحة...</span>
                ) : sorted.length > 0 ? (
                  <>عرض <strong className="text-slate-900 dark:text-white font-bold">{sorted.length}</strong> عيادة وطبيب متاح للحجز الفوري</>
                ) : (
                  <span className="text-slate-500 dark:text-slate-400 font-medium">لم يتم العثور على أطباء مطابقة (0 متاح)</span>
                )}
              </span>
              <span className="text-slate-500 dark:text-slate-400 text-[11px] font-medium hidden sm:inline">
                {doctors.length === 0 ? 'شبكة التعاقدات الطبية قيد التحديث' : 'جميع الأطباء مرخصون وموثقون'}
              </span>
            </div>

            {isLoading ? (
              <CustomLoadingSkeleton type="doctor-card" count={3} />
            ) : sorted.length === 0 ? (
              <CustomEmptyState
                type="search"
                title={doctors.length === 0 ? 'شبكة العيادات قيد التوثيق والتحديث' : 'لا توجد عيادات تطابق خيارات التصفية الحالية'}
                description={
                  doctors.length === 0
                    ? 'جاري مراجعة وإدراج جداول العيادات المعتمدة في منطقتك. يمكنك طلب انضمام طبيبك أو إعادة المحاولة قريباً.'
                    : 'جرب إزالة بعض الفلاتر المحددة (مثل التأمين أو المواعيد اليومية) أو اختيار مناطق مجاورة لمشاهدة جميع الأطباء.'
                }
                actionText="إعادة ضبط جميع الفلاتر"
                onAction={handleClearAllFilters}
                secondaryActionText={onOpenJoinDoctor ? 'طلب انضمام طبيب أو عيادة' : undefined}
                onSecondaryAction={onOpenJoinDoctor}
                extraSuggestions={['جلدية', 'أسنان', 'أطفال وحديثي الولادة', 'باطنة وجهاز هضمي', 'عظام']}
                onSuggestionClick={(s) => {
                  const matched = SPECIALTIES.find(sp => sp.name.includes(s) || s.includes(sp.name));
                  if (matched) {
                    setSelectedSpecialty(matched.id);
                  }
                }}
              />
            ) : (
              sorted.map((doc) => (
                <DoctorCard
                  key={doc.id}
                  doctor={doc}
                  onOpenProfile={onOpenProfile}
                  onBookSlot={onBookSlot}
                  isFavorite={favorites.includes(doc.id)}
                  onToggleFavorite={onToggleFavorite}
                />
              ))
            )}
          </main>

        </div>
      </div>
      )}

    </div>
  );
};
