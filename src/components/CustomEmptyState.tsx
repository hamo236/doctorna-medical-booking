import React from 'react';
import { 
  Search, 
  CalendarX2, 
  FolderOpen, 
  Stethoscope, 
  RotateCcw, 
  UserPlus, 
  Sparkles,
  ArrowLeft,
  FilePlus2,
  Clock,
  FilterX
} from 'lucide-react';

interface EmptyStateProps {
  type: 'search' | 'appointments' | 'appointments-past' | 'records' | 'records-filtered' | 'notifications';
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  secondaryActionText?: string;
  onSecondaryAction?: () => void;
  extraSuggestions?: string[];
  onSuggestionClick?: (s: string) => void;
}

export const CustomEmptyState: React.FC<EmptyStateProps> = ({
  type,
  title,
  description,
  actionText,
  onAction,
  secondaryActionText,
  onSecondaryAction,
  extraSuggestions,
  onSuggestionClick
}) => {
  // Visual config based on type
  const config = {
    search: {
      icon: Search,
      iconColor: 'text-[#088395] dark:text-teal-400',
      iconBg: 'bg-teal-50 dark:bg-teal-950/60 border-teal-200/80 dark:border-teal-800/80',
      defaultTitle: 'لا توجد نتائج مطابقة لبحثك',
      defaultDesc: 'جرب إزالة بعض الفلاتر أو تغيير الحي والمحافظة لتوسيع نطاق البحث.',
      defaultBtn: 'إعادة تعيين الفلاتر',
    },
    appointments: {
      icon: CalendarX2,
      iconColor: 'text-[#088395] dark:text-teal-400',
      iconBg: 'bg-teal-50 dark:bg-teal-950/60 border-teal-200/80 dark:border-teal-800/80',
      defaultTitle: 'لا توجد مواعيد نشطة قادمة',
      defaultDesc: 'تصفح قائمة الأطباء المعتمدين لحجز موعد كشفك القادم بسهولة.',
      defaultBtn: 'ابحث عن طبيب واحجز الآن',
    },
    'appointments-past': {
      icon: Clock,
      iconColor: 'text-slate-500 dark:text-slate-400',
      iconBg: 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700',
      defaultTitle: 'لا توجد زيارات سابقة مسجلة',
      defaultDesc: 'ستظهر هنا تفاصيل الروشتات ومستندات زياراتك السابقة فور إتمام الكشف.',
      defaultBtn: 'تصفح قائمة الأطباء',
    },
    records: {
      icon: FolderOpen,
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200/80 dark:border-emerald-800/80',
      defaultTitle: 'الملف الطبي الرقمي فارغ',
      defaultDesc: 'احتفظ بجميع الروشتات، نتائج التحاليل، وفحوصات الأشعة في مكان واحد مؤمن.',
      defaultBtn: 'إضافة روشتة أو تقرير',
    },
    'records-filtered': {
      icon: FilterX,
      iconColor: 'text-amber-600 dark:text-amber-400',
      iconBg: 'bg-amber-50 dark:bg-amber-950/60 border-amber-200/80 dark:border-amber-800/80',
      defaultTitle: 'لا توجد مستندات في هذا القسم',
      defaultDesc: 'لم يتم العثور على ملفات تتبع هذا التصنيف حالياً.',
      defaultBtn: 'إضافة مستند جديد',
    },
    notifications: {
      icon: Sparkles,
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      iconBg: 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200/80 dark:border-indigo-800/80',
      defaultTitle: 'لا توجد إشعارات جديدة',
      defaultDesc: 'أنت على اطلاع تام بكافة مستجدات حسابك ومواعيدك الطبية.',
      defaultBtn: 'العودة للرئيسية',
    }
  }[type];

  const IconComponent = config.icon;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 sm:p-12 text-center shadow-xs max-w-2xl mx-auto animate-in fade-in zoom-in-95 duration-200 font-body">
      {/* Icon Badge */}
      <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl ${config.iconBg} border flex items-center justify-center mx-auto mb-4 shadow-xs`}>
        <IconComponent className={`w-7 h-7 sm:w-8 sm:h-8 ${config.iconColor}`} />
      </div>

      {/* Main Title & Subtext */}
      <h3 className="text-lg sm:text-xl font-bold text-[#0A2540] dark:text-white mb-2 leading-snug font-heading">
        {title || config.defaultTitle}
      </h3>
      
      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-lg mx-auto leading-relaxed mb-6 font-medium">
        {description || config.defaultDesc}
      </p>

      {/* Optional Quick Suggestion Chips (e.g. for search keywords) */}
      {extraSuggestions && extraSuggestions.length > 0 && onSuggestionClick && (
        <div className="mb-6 pt-3 border-t border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-2 font-heading">
            اقتراحات شائعة للبحث السريع:
          </span>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {extraSuggestions.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onSuggestionClick(item)}
                className="text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/60 hover:text-[#088395] dark:hover:text-teal-300 text-slate-700 dark:text-slate-200 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 transition-all cursor-pointer font-heading"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Interactive Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        {onAction && (
          <button
            type="button"
            onClick={onAction}
            className="btn-clinical-primary w-full sm:w-auto text-xs sm:text-sm px-6 py-2.5 font-heading"
          >
            {type === 'search' && <RotateCcw className="w-4 h-4" />}
            {type === 'appointments' && <Stethoscope className="w-4 h-4" />}
            {type === 'records' && <FilePlus2 className="w-4 h-4" />}
            <span>{actionText || config.defaultBtn}</span>
          </button>
        )}

        {onSecondaryAction && secondaryActionText && (
          <button
            type="button"
            onClick={onSecondaryAction}
            className="btn-clinical-secondary w-full sm:w-auto text-xs sm:text-sm px-6 py-2.5 font-heading"
          >
            <UserPlus className="w-4 h-4" />
            <span>{secondaryActionText}</span>
          </button>
        )}
      </div>
    </div>
  );
};
