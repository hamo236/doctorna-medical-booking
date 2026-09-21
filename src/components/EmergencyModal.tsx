import React from 'react';
import { X, PhoneCall, ShieldAlert, HeartPulse, Activity, AlertTriangle, Flame, Stethoscope } from 'lucide-react';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToDoctors?: () => void;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({
  isOpen,
  onClose,
  onNavigateToDoctors
}) => {
  if (!isOpen) return null;

  const emergencyContacts = [
    {
      name: 'هيئة الإسعاف المصرية (طوارئ الحوادث والإنقاذ)',
      number: '123',
      description: 'سيارات إسعاف مجهزة للحالات الحرجة على مدار 24 ساعة في جميع المحافظات',
      icon: HeartPulse,
      primary: true
    },
    {
      name: 'طوارئ واستشارات السموم (قصر العيني)',
      number: '0223643141',
      description: 'المركز القومي للسموم - حالات التسمم الدوائي والكيميائي واللدغات',
      icon: AlertTriangle,
      primary: false
    },
    {
      name: 'الخط الساخن لوزارة الصحة والسكان',
      number: '105',
      description: 'استشارات وتوجيهات الطوارئ وتوفير أسرة الرعاية المركزة وحضانات الأطفال',
      icon: Activity,
      primary: false
    },
    {
      name: 'طوارئ الحروق (أهل مصر)',
      number: '16863',
      description: 'استقبال وتوجيه حالات الحروق الحرجة',
      icon: Flame,
      primary: false
    },
    {
      name: 'الخط الساخن لمنصة دكتورنا كلينك',
      number: '16676',
      description: 'المساعدة الفورية في الحجز وتوجيه الحالات لأقرب عيادة متاحة',
      icon: Stethoscope,
      primary: false
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto font-body">
      <div 
        className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-t-3xl sm:rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden my-0 sm:my-6 max-h-[92vh] flex flex-col animate-in fade-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#0A2540] text-white p-5 sm:p-6 relative flex items-start justify-between font-heading shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-400/30 flex items-center justify-center text-rose-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold">أرقام الطوارئ والإسعاف السريع</h2>
                <span className="bg-white/10 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/20">
                  مصر 🇪🇬
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">خطوط الاتصال المباشرة لخدمات الإسعاف والرعاية العاجلة</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Main Ambulance Banner */}
          <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-right">
              <div className="w-12 h-12 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0">
                <HeartPulse className="w-7 h-7" />
              </div>
              <div>
                <strong className="block text-slate-900 dark:text-slate-100 text-sm font-bold font-heading">إسعاف جمهورية مصر العربية</strong>
                <span className="text-xs text-slate-600 dark:text-slate-400">للحالات الحرجة والإنقاذ العاجل على مدار 24 ساعة</span>
              </div>
            </div>
            <a
              href="tel:123"
              className="w-full sm:w-auto text-center px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white text-base font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 font-heading"
            >
              <PhoneCall className="w-5 h-5" />
              <span className="font-mono">اتصال بـ 123</span>
            </a>
          </div>

          {/* Emergency Numbers List */}
          <div className="space-y-2.5 pt-2">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 font-heading">أرقام مراكز الدعم والطوارئ المتخصصة:</h3>
            {emergencyContacts.filter(c => !c.primary).map((contact, idx) => {
              const Icon = contact.icon;
              return (
                <div 
                  key={idx}
                  className="p-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between gap-3 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-[#088395] dark:text-teal-400 border border-teal-200 dark:border-teal-800 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="block text-xs font-bold text-slate-800 dark:text-slate-200 font-heading">{contact.name}</strong>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight block">{contact.description}</span>
                    </div>
                  </div>
                  <a
                    href={`tel:${contact.number}`}
                    className="px-3.5 py-1.5 bg-white dark:bg-slate-800 hover:bg-[#088395] hover:text-white text-[#088395] border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono font-bold transition-colors flex items-center gap-1.5 shrink-0"
                  >
                    <PhoneCall className="w-3 h-3" />
                    <span>{contact.number}</span>
                  </a>
                </div>
              );
            })}
          </div>

          {/* Quick Doctor Booking Referral */}
          {onNavigateToDoctors && (
            <div className="p-4 bg-teal-50/50 dark:bg-slate-800/40 border border-teal-100 dark:border-slate-800 rounded-xl flex items-center justify-between gap-3 font-heading">
              <div>
                <h4 className="text-xs font-bold text-[#0A2540] dark:text-slate-200">تحتاج حجز عاجل في أقرب عيادة؟</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-body">ابحث في قائمة أطباء الطوارئ والعيادات المتاحة اليوم</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigateToDoctors();
                }}
                className="btn-clinical-primary text-xs font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer shrink-0"
              >
                بحث عن طبيب متاح
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex justify-end font-heading">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
