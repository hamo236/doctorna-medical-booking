import React, { useState, useMemo } from 'react';
import { 
  Stethoscope, 
  Activity, 
  Sparkles, 
  Smile, 
  Baby, 
  Bone, 
  Ear, 
  Heart, 
  User, 
  Brain, 
  Eye,
  ChevronLeft,
  Search,
  CheckCircle2,
  Filter,
  Users
} from 'lucide-react';
import { SPECIALTIES } from '../data/seedData';
import { Doctor } from '../types';

interface SpecialtiesGridProps {
  selectedSpecialty: string;
  onSelectSpecialty: (specialtyId: string) => void;
  onNavigateToSearch?: () => void;
  doctors?: Doctor[];
  title?: string;
  subtitle?: string;
  compact?: boolean;
}

// Medical Specialty Taxonomy & Cluster Mapping
export type SpecialtyCluster = 'all' | 'frequent' | 'surgical' | 'chronic';

interface SpecialtyMeta {
  id: string;
  name: string;
  subtext: string;
  icon: string;
  cluster: SpecialtyCluster;
  tag: string;
}

const SPECIALTY_DIRECTORY: SpecialtyMeta[] = [
  {
    id: 'internal',
    name: 'باطنة وجهاز هضمي',
    subtext: 'كشف باطنة، كبد، ومناظير جهاز هضمي',
    icon: 'activity',
    cluster: 'frequent',
    tag: 'شائع يوميًا'
  },
  {
    id: 'pediatrics',
    name: 'أطفال وحديثي الولادة',
    subtext: 'متابعة النمو، تطعيمات، وطب الأطفال العام',
    icon: 'baby',
    cluster: 'frequent',
    tag: 'رعاية عائلية'
  },
  {
    id: 'dentistry',
    name: 'طب وجراحة الأسنان',
    subtext: 'حشو، زراعة، تبييض، وتقويم الأسنان',
    icon: 'smile',
    cluster: 'frequent',
    tag: 'عيادات متخصصة'
  },
  {
    id: 'dermatology',
    name: 'جلدية وتجميل',
    subtext: 'علاج الأمراض الجلدية، الليزر، والعناية بالبشرة',
    icon: 'sparkles',
    cluster: 'frequent',
    tag: 'تجميل وعلاج'
  },
  {
    id: 'orthopedics',
    name: 'عظام ومفاصل',
    subtext: 'إصابات ملاعب، خشونة مفاصل، وجراحة عظام',
    icon: 'bone',
    cluster: 'surgical',
    tag: 'جراحة وتأهيل'
  },
  {
    id: 'ent',
    name: 'أنف وأذن وحنجرة',
    subtext: 'علاج الجيوب الأنفية، السمعيات، ومناظير الأنف',
    icon: 'ear',
    cluster: 'surgical',
    tag: 'تخصص دقيق'
  },
  {
    id: 'ophthalmology',
    name: 'طب وجراحة العيون',
    subtext: 'تصحيح الإبصار (الليزك)، المياه البيضاء، وفحص قاع العين',
    icon: 'eye',
    cluster: 'surgical',
    tag: 'جراحة عيون'
  },
  {
    id: 'cardiology',
    name: 'أمراض القلب والأوعية',
    subtext: 'رسم قلب، إيكو، متابعة ضغط الدم والقصور القلبي',
    icon: 'heart',
    cluster: 'chronic',
    tag: 'رعاية حيوية'
  },
  {
    id: 'neurology',
    name: 'مخ وأعصاب',
    subtext: 'علاج الصداع النصفي، الصرع، والأمراض العصبية',
    icon: 'brain',
    cluster: 'chronic',
    tag: 'أعصاب متخصصة'
  },
  {
    id: 'gynecology',
    name: 'نساء وتوليد',
    subtext: 'متابعة الحمل، الولادة، وسونار الأجنة رباعي الأبعاد',
    icon: 'user',
    cluster: 'chronic',
    tag: 'أمومة وصحة المرأة'
  }
];

// Specialty Icon Helper
const getSpecialtyIcon = (iconName: string) => {
  switch (iconName) {
    case 'activity':
      return Activity;
    case 'sparkles':
      return Sparkles;
    case 'smile':
      return Smile;
    case 'baby':
      return Baby;
    case 'bone':
      return Bone;
    case 'ear':
      return Ear;
    case 'heart':
      return Heart;
    case 'user':
      return User;
    case 'brain':
      return Brain;
    case 'eye':
      return Eye;
    default:
      return Stethoscope;
  }
};

export const SpecialtiesGrid: React.FC<SpecialtiesGridProps> = ({
  selectedSpecialty,
  onSelectSpecialty,
  onNavigateToSearch,
  doctors = [],
  title = 'أقسام التخصصات الطبية والعيادات',
  subtitle = 'استكشف التخصصات الطبية المنظمة في أقسام علاجية واضحة لحجز موعد مؤكد بضغطة زر',
  compact = false
}) => {
  const [activeCluster, setActiveCluster] = useState<SpecialtyCluster>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Precompute doctor counts per specialty
  const doctorCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    doctors.forEach((doc) => {
      counts[doc.specialtyId] = (counts[doc.specialtyId] || 0) + 1;
    });
    return counts;
  }, [doctors]);

  // Filter specialties based on cluster and search query
  const filteredSpecialties = useMemo(() => {
    return SPECIALTY_DIRECTORY.filter((spec) => {
      const matchesCluster = activeCluster === 'all' || spec.cluster === activeCluster;
      const q = searchQuery.trim().toLowerCase();
      const matchesQuery = !q || 
        spec.name.toLowerCase().includes(q) || 
        spec.subtext.toLowerCase().includes(q);
      return matchesCluster && matchesQuery;
    });
  }, [activeCluster, searchQuery]);

  const clusterTabs = [
    { id: 'all' as SpecialtyCluster, label: 'جميع الأقسام', count: SPECIALTY_DIRECTORY.length },
    { id: 'frequent' as SpecialtyCluster, label: 'العيادات اليومية الأكثر طلباً', count: 4 },
    { id: 'surgical' as SpecialtyCluster, label: 'الجراحة والعظام والتخصصات الدقيقة', count: 3 },
    { id: 'chronic' as SpecialtyCluster, label: 'الرعاية الحيوية والمزمنة', count: 3 }
  ];

  return (
    <div className="w-full font-body">
      
      {/* Section Header with Clear Hierarchy */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-teal-50 dark:bg-teal-950/60 text-[#088395] dark:text-teal-300 text-xs font-bold px-3 py-1 rounded-md border border-teal-200/80 dark:border-teal-800/80 font-heading mb-2">
            <Stethoscope className="w-3.5 h-3.5" />
            <span>خارطة الأقسام والعيادات التخصصية</span>
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#0A2540] dark:text-white font-heading tracking-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium max-w-2xl">
              {subtitle}
            </p>
          )}
        </div>

        {onNavigateToSearch && (
          <button
            type="button"
            onClick={onNavigateToSearch}
            className="self-start md:self-auto text-xs sm:text-sm font-bold text-[#088395] dark:text-teal-400 hover:text-[#0a4d68] dark:hover:text-teal-300 flex items-center gap-1.5 cursor-pointer font-heading group transition-colors"
          >
            <span>استعراض دليل الأطباء الكامل</span>
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          </button>
        )}
      </div>

      {/* Cluster Navigation Tabs & Quick Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-5">
        {/* Cluster Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 sm:pb-0 scrollbar-none">
          {clusterTabs.map((tab) => {
            const isActive = activeCluster === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveCluster(tab.id)}
                className={`px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap font-heading flex items-center gap-1.5 shrink-0 ${
                  isActive
                    ? 'bg-[#0A2540] dark:bg-teal-500 text-white dark:text-slate-950 shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-semibold ${
                  isActive
                    ? 'bg-white/20 dark:bg-black/20 text-current'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Quick Search within Specialties */}
        <div className="relative w-full sm:w-64 shrink-0">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="ابحث في التخصصات..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg pr-8 pl-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-[#088395] dark:focus:border-teal-400 transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-[10px] font-bold"
            >
              مسح
            </button>
          )}
        </div>
      </div>

      {/* Specialties Cards Grid */}
      {filteredSpecialties.length > 0 ? (
        <div className={`grid ${
          compact
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3'
            : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4'
        }`}>
          {filteredSpecialties.map((spec) => {
            const IconComponent = getSpecialtyIcon(spec.icon);
            const isSelected = selectedSpecialty === spec.id;
            const docCount = doctorCounts[spec.id] || 0;

            return (
              <button
                key={spec.id}
                type="button"
                onClick={() => onSelectSpecialty(spec.id)}
                className={`group relative p-4 rounded-xl border text-right transition-all duration-200 active:scale-[0.99] flex flex-col justify-between cursor-pointer min-h-[140px] text-right ${
                  isSelected
                    ? 'bg-[#0A2540] dark:bg-slate-900 text-white border-[#088395] dark:border-teal-400 shadow-md ring-2 ring-[#088395]/40'
                    : 'bg-white dark:bg-slate-900/90 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-800 hover:border-[#088395] dark:hover:border-teal-500 hover:shadow-sm'
                }`}
              >
                <div>
                  {/* Top Bar: Icon + Category Badge */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors shrink-0 ${
                      isSelected
                        ? 'bg-teal-500/20 text-teal-300 border border-teal-400/30'
                        : 'bg-teal-50 dark:bg-slate-800 text-[#088395] dark:text-teal-400 group-hover:bg-[#088395] group-hover:text-white border border-teal-100 dark:border-slate-700'
                    }`}>
                      <IconComponent className="w-5 h-5 stroke-[2]" />
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md font-heading ${
                        isSelected
                          ? 'bg-white/10 text-teal-200 border border-white/10'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      }`}>
                        {spec.tag}
                      </span>
                      {docCount > 0 && (
                        <span className={`text-[10px] font-mono font-medium flex items-center gap-1 ${
                          isSelected ? 'text-teal-300' : 'text-slate-400 dark:text-slate-500'
                        }`}>
                          <Users className="w-2.5 h-2.5" />
                          <span>{docCount} عيادات</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Specialty Title */}
                  <h3 className={`font-bold text-sm sm:text-base mb-1 leading-snug font-heading ${
                    isSelected ? 'text-white' : 'text-[#0A2540] dark:text-white group-hover:text-[#088395] dark:group-hover:text-teal-400'
                  }`}>
                    {spec.name}
                  </h3>

                  {/* Subtext description */}
                  <p className={`text-xs leading-relaxed line-clamp-2 ${
                    isSelected ? 'text-slate-300' : 'text-slate-500 dark:text-slate-400'
                  }`}>
                    {spec.subtext}
                  </p>
                </div>

                {/* Bottom Action Indicator */}
                <div className={`mt-3 pt-2.5 border-t flex items-center justify-between text-xs font-bold font-heading ${
                  isSelected 
                    ? 'border-white/10 text-teal-300' 
                    : 'border-slate-100 dark:border-slate-800 text-[#088395] dark:text-teal-400'
                }`}>
                  <span>حجز كشف عيادة</span>
                  <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center max-w-md mx-auto">
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">لا توجد تخصصات مطابقة للبحث</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">جرب البحث بكلمة أخرى أو اختر قسماً آخر من الأقسام بالأعلى</p>
          <button
            type="button"
            onClick={() => { setSearchQuery(''); setActiveCluster('all'); }}
            className="btn-clinical-secondary text-xs px-4 py-2"
          >
            إعادة ضبط الفلترة
          </button>
        </div>
      )}
    </div>
  );
};
