import React, { useState } from 'react';
import { 
  Search, 
  MapPin, 
  Stethoscope, 
  Home, 
  ChevronDown, 
  ShieldCheck, 
  UserRound,
  Sparkles,
  Zap,
  Star,
  Check,
  Building2,
  Shield
} from 'lucide-react';
import { SPECIALTIES, CITIES_AND_AREAS } from '../data/seedData';

interface HeroSearchProps {
  onSearch: (filters: { specialty: string; city: string; area: string; doctorName: string; insurance?: string; filterPreset?: string }) => void;
  selectedSpecialty: string;
  setSelectedSpecialty: (spec: string) => void;
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  selectedArea: string;
  setSelectedArea: (area: string) => void;
  selectedInsurance?: string;
  setSelectedInsurance?: (insurance: string) => void;
}

export const HeroSearch: React.FC<HeroSearchProps> = ({
  onSearch,
  selectedSpecialty,
  setSelectedSpecialty,
  selectedCity,
  setSelectedCity,
  selectedArea,
  setSelectedArea
}) => {
  const [activeTab, setActiveTab] = useState<'clinic' | 'home'>('clinic');
  const [doctorNameInput, setDoctorNameInput] = useState('');
  const [activeQuickFilter, setActiveQuickFilter] = useState<string | null>(null);

  const currentAreas = CITIES_AND_AREAS.find(c => c.city === selectedCity)?.areas || [];

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    setSelectedArea('');
  };

  const handleExecuteSearch = (customSpecialty?: string, preset?: string) => {
    const specialtyToUse = customSpecialty !== undefined ? customSpecialty : selectedSpecialty;
    onSearch({
      specialty: specialtyToUse,
      city: selectedCity,
      area: selectedArea,
      doctorName: doctorNameInput,
      filterPreset: preset || activeQuickFilter || undefined
    });
  };

  const quickSpecialties = [
    { id: 'internal', label: 'باطنة عامة ومناظير' },
    { id: 'dentistry', label: 'طب وجراحة أسنان' },
    { id: 'pediatrics', label: 'أطفال وحديثي الولادة' },
    { id: 'orthopedics', label: 'عظام ومفاصل' },
    { id: 'dermatology', label: 'جلدية وتجميل' },
    { id: 'cardiology', label: 'أمراض القلب' }
  ];

  const quickFilters = [
    { id: 'today', label: 'متاح اليوم فوراً', icon: Zap },
    { id: 'rating', label: 'أعلى تقييماً (4.9+)', icon: Star },
    { id: 'economy', label: 'كشف اقتصادي (<300 ج.م)', icon: Check },
    { id: 'insurance', label: 'يقبل جميع بطاقات التأمين', icon: Shield }
  ];

  return (
    <section className="bg-gradient-to-b from-white via-slate-50/40 to-white dark:from-[#070B12] dark:via-[#0B121E] dark:to-[#0F172A] pt-7 sm:pt-11 pb-8 sm:pb-12 border-b border-slate-200/90 dark:border-slate-800 transition-colors duration-200 font-body">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Clinical Headline & Reassurance */}
        <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-2 bg-teal-50 dark:bg-teal-950/60 border border-teal-200/80 dark:border-teal-800/80 text-[#088395] dark:text-teal-300 text-xs font-bold px-3.5 py-1.5 rounded-full mb-3 shadow-xs font-heading">
            <ShieldCheck className="w-4 h-4 text-[#088395] dark:text-teal-400 shrink-0" />
            <span>المنظومة الرقمية المعتمدة لحجز العيادات والأطباء في مصر</span>
          </div>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-[#0A2540] dark:text-white tracking-tight leading-snug mb-3 font-heading">
            احجز موعد كشفك المؤكد بالعيادة <br className="hidden sm:inline" />
            <span className="text-[#088395] dark:text-teal-400">بدون أي رسوم مسبقة والدفع عند الزيارة</span>
          </h1>
          <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-base leading-relaxed max-w-xl mx-auto font-medium">
            تصفح مواعيد الأطباء المعتمدين، تابع رقم دورك في طابور العيادة مباشرة، واطلع على تقييمات موثقة من مرضى حقيقيين.
          </p>
        </div>

        {/* Consultation Mode Switcher */}
        <div className="max-w-4xl mx-auto mb-3 flex justify-start sm:justify-center overflow-x-auto pb-1 scrollbar-none">
          <div className="inline-flex bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs font-heading">
            <button
              id="tab-clinic"
              type="button"
              onClick={() => setActiveTab('clinic')}
              className={`flex items-center gap-2 px-5 sm:px-6 py-2 rounded-lg font-bold text-xs sm:text-sm transition-all duration-150 cursor-pointer ${
                activeTab === 'clinic'
                  ? 'bg-[#088395] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Stethoscope className="w-4 h-4" />
              <span>كشف بالعيادة والمستشفى</span>
            </button>

            <button
              id="tab-home"
              type="button"
              onClick={() => setActiveTab('home')}
              className={`flex items-center gap-2 px-5 sm:px-6 py-2 rounded-lg font-bold text-xs sm:text-sm transition-all duration-150 cursor-pointer ${
                activeTab === 'home'
                  ? 'bg-[#088395] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>زيارة واستشارة منزلية</span>
            </button>
          </div>
        </div>

        {/* Master Clinical Search Console */}
        <div className="max-w-5xl mx-auto bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            
            {/* Field 1: Medical Specialty */}
            <div className="md:col-span-4 relative">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1 pr-1 font-heading">
                التخصص الطبي
              </label>
              <div className="relative flex items-center bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-700 focus-within:border-[#088395] dark:focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-500/20 transition-all">
                <Stethoscope className="w-4 h-4 text-[#088395] dark:text-teal-400 mr-3 shrink-0" />
                <select
                  id="select-hero-specialty"
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                  className="w-full bg-transparent py-2.5 pr-1 pl-7 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white outline-none appearance-none cursor-pointer"
                >
                  <option value="" className="dark:bg-slate-900">جميع التخصصات الطبية</option>
                  {SPECIALTIES.filter(s => s.id !== 'all').map((spec) => (
                    <option key={spec.id} value={spec.id} className="dark:bg-slate-900">{spec.name}</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute left-2.5 pointer-events-none" />
              </div>
            </div>

            {/* Field 2: Governorate & Area Compound */}
            <div className="md:col-span-5 relative">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1 pr-1 font-heading">
                المحافظة والحي
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div className="relative flex items-center bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-700 focus-within:border-[#088395] dark:focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-500/20 transition-all">
                  <MapPin className="w-3.5 h-3.5 text-[#088395] dark:text-teal-400 mr-2.5 shrink-0" />
                  <select
                    id="select-hero-city"
                    value={selectedCity}
                    onChange={(e) => handleCityChange(e.target.value)}
                    className="w-full bg-transparent py-2.5 pr-1 pl-6 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white outline-none appearance-none cursor-pointer"
                  >
                    <option value="" className="dark:bg-slate-900">المحافظة (الكل)</option>
                    {CITIES_AND_AREAS.map(c => (
                      <option key={c.city} value={c.city} className="dark:bg-slate-900">{c.city}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute left-2 pointer-events-none" />
                </div>

                <div className="relative flex items-center bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-700 focus-within:border-[#088395] dark:focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-500/20 transition-all">
                  <select
                    id="select-hero-area"
                    value={selectedArea}
                    onChange={(e) => setSelectedArea(e.target.value)}
                    disabled={!selectedCity}
                    className="w-full bg-transparent py-2.5 pr-2.5 pl-6 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white outline-none appearance-none cursor-pointer disabled:opacity-50"
                  >
                    <option value="" className="dark:bg-slate-900">
                      {selectedCity ? `مناطق ${selectedCity}` : 'اختر المحافظة'}
                    </option>
                    {currentAreas.map(area => (
                      <option key={area} value={area} className="dark:bg-slate-900">{area}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute left-2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Field 3: Doctor Name & Direct Search Action */}
            <div className="md:col-span-3 relative flex flex-col">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1 pr-1 font-heading">
                اسم الطبيب أو المركز
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1 flex items-center bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-700 focus-within:border-[#088395] dark:focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-500/20 transition-all">
                  <UserRound className="w-3.5 h-3.5 text-slate-400 mr-2.5 shrink-0" />
                  <input
                    id="input-hero-doctor-name"
                    type="text"
                    placeholder="ابحث بالاسم..."
                    value={doctorNameInput}
                    onChange={(e) => setDoctorNameInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleExecuteSearch()}
                    className="w-full bg-transparent py-2.5 px-2 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400 outline-none"
                  />
                </div>
                <button
                  id="btn-hero-search-submit"
                  type="button"
                  onClick={() => handleExecuteSearch()}
                  className="btn-clinical-primary text-xs sm:text-sm px-4 py-2.5 shrink-0 font-heading"
                >
                  <Search className="w-4 h-4" />
                  <span>بحث</span>
                </button>
              </div>
            </div>

          </div>

          {/* Quick Filter Presets */}
          <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <span className="text-slate-400 text-[11px] font-bold shrink-0 flex items-center gap-1 font-heading ml-1">
                <Sparkles className="w-3 h-3 text-[#088395] dark:text-teal-400" />
                <span>فلترة سريعة:</span>
              </span>
              {quickFilters.map((qf) => {
                const isSelected = activeQuickFilter === qf.id;
                const Icon = qf.icon;
                return (
                  <button
                    key={qf.id}
                    type="button"
                    onClick={() => {
                      const next = isSelected ? null : qf.id;
                      setActiveQuickFilter(next);
                      handleExecuteSearch(undefined, next || undefined);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 font-heading ${
                      isSelected
                        ? 'bg-[#088395] text-white border border-[#088395]'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-teal-50 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    <span>{qf.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Frequent Specialty Keywords */}
            <div className="hidden lg:flex items-center gap-1.5 text-[11px]">
              <span className="text-slate-400 font-medium">أكثر التخصصات بحثاً:</span>
              {quickSpecialties.slice(0, 3).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setSelectedSpecialty(item.id);
                    handleExecuteSearch(item.id);
                  }}
                  className="text-[#088395] dark:text-teal-400 hover:underline font-bold"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Truthful Clinical Commitments Bar */}
        <div className="max-w-5xl mx-auto mt-6 sm:mt-8 grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3 text-center">
          <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-center gap-1.5 text-[#088395] dark:text-teal-400 font-bold text-sm sm:text-base font-heading">
              <ShieldCheck className="w-4 h-4" />
              <span>300+ عيادة معتمدة</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">أطباء واستشاريون مرخصون بنقابة الأطباء</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-center gap-1.5 text-[#088395] dark:text-teal-400 font-bold text-sm sm:text-base font-heading">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>طابور العيادة المباشر</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">تتبع رقم الكشف الفعلي من منزلك لتوفير وقتك</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-center gap-1.5 text-[#088395] dark:text-teal-400 font-bold text-sm sm:text-base font-heading">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>تقييمات مرضى حقيقية</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">فقط للمرضى الذين أتموا الكشف الفعلي بالعيادة</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-center gap-1.5 text-[#088395] dark:text-teal-400 font-bold text-sm sm:text-base font-heading">
              <Building2 className="w-4 h-4" />
              <span>حجز مجاني 100%</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">الدفع في العيادة بنفس السعر الرسمي المعلن</p>
          </div>
        </div>

      </div>
    </section>
  );
};
