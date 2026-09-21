import React from 'react';
import { Stethoscope, PhoneCall, ShieldCheck, Heart, UserPlus, HelpCircle } from 'lucide-react';
import { ActiveView } from '../types';

interface FooterProps {
  navigate: (view: ActiveView) => void;
  onSelectSpecialty: (specId: string) => void;
  onSelectArea: (city: string, area: string) => void;
  onOpenJoinDoctor: () => void;
  onOpenPatientHelp: () => void;
}

export const Footer: React.FC<FooterProps> = ({ 
  navigate, 
  onSelectSpecialty, 
  onSelectArea,
  onOpenJoinDoctor,
  onOpenPatientHelp
}) => {
  return (
    <footer className="bg-[#051424] text-slate-300 font-body border-t border-slate-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-28 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-10">
          
          {/* Brand & Hotline */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#088395] rounded-xl flex items-center justify-center text-white shadow-md shadow-teal-500/20">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-xl text-white font-heading">دكتورنا</span>
                <span className="block text-[10px] text-slate-400 font-medium">منظومة حجز العيادات والرعاية الصحية</span>
              </div>
            </div>

            <p className="text-slate-400 leading-relaxed max-w-sm text-xs font-normal">
              دكتورنا هي المنظومة الرقمية المعتمدة لحجز العيادات في مصر، تتيح للمرضى البحث عن أفضل الاستشاريين والمراكز الطبية وحجز المواعيد المؤكدة مع الدفع في العيادة.
            </p>

            <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center shrink-0 border border-teal-500/20">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">تحتاج إلى مساعدة أو إرشادات؟</span>
                  <span className="text-xs text-white font-bold">تواصل مع الدعم الفني للمنصة</span>
                </div>
              </div>
              <button
                onClick={onOpenPatientHelp}
                className="bg-[#088395] hover:bg-[#0a4d68] text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shrink-0 font-heading"
              >
                مركز المساعدة
              </button>
            </div>
          </div>

          {/* Specialties Column */}
          <div>
            <h4 className="font-bold text-white mb-3 text-sm font-heading">أشهر التخصصات الطبية</h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <button 
                  onClick={() => { onSelectSpecialty('internal'); navigate('SEARCH'); }}
                  className="hover:text-teal-300 transition-colors cursor-pointer text-right"
                >
                  أمراض الباطنة والجهاز الهضمي
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { onSelectSpecialty('dermatology'); navigate('SEARCH'); }}
                  className="hover:text-teal-300 transition-colors cursor-pointer text-right"
                >
                  الجلدية والتجميل والليزر
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { onSelectSpecialty('dentistry'); navigate('SEARCH'); }}
                  className="hover:text-teal-300 transition-colors cursor-pointer text-right"
                >
                  طب وجراحة الأسنان
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { onSelectSpecialty('pediatrics'); navigate('SEARCH'); }}
                  className="hover:text-teal-300 transition-colors cursor-pointer text-right"
                >
                  طب الأطفال وحديثي الولادة
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { onSelectSpecialty('orthopedics'); navigate('SEARCH'); }}
                  className="hover:text-teal-300 transition-colors cursor-pointer text-right"
                >
                  جراحة العظام والمفاصل
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { onSelectSpecialty('cardiology'); navigate('SEARCH'); }}
                  className="hover:text-teal-300 transition-colors cursor-pointer text-right"
                >
                  أمراض القلب والأوعية الدموية
                </button>
              </li>
            </ul>
          </div>

          {/* Cities Column */}
          <div>
            <h4 className="font-bold text-white mb-3 text-sm font-heading">العيادات حسب المحافظة</h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <button 
                  onClick={() => { onSelectArea('القاهرة', 'مصر الجديدة'); navigate('SEARCH'); }}
                  className="hover:text-teal-300 transition-colors cursor-pointer text-right"
                >
                  أطباء مصر الجديدة
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { onSelectArea('القاهرة', 'مدينة نصر'); navigate('SEARCH'); }}
                  className="hover:text-teal-300 transition-colors cursor-pointer text-right"
                >
                  أطباء مدينة نصر
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { onSelectArea('القاهرة', 'المعادي'); navigate('SEARCH'); }}
                  className="hover:text-teal-300 transition-colors cursor-pointer text-right"
                >
                  أطباء المعادي
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { onSelectArea('الجيزة', 'الدقي'); navigate('SEARCH'); }}
                  className="hover:text-teal-300 transition-colors cursor-pointer text-right"
                >
                  أطباء الدقي والمهندسين
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { onSelectArea('الجيزة', 'الشيخ زايد'); navigate('SEARCH'); }}
                  className="hover:text-teal-300 transition-colors cursor-pointer text-right"
                >
                  أطباء الشيخ زايد و ٦ أكتوبر
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { onSelectArea('الإسكندرية', 'سموحة'); navigate('SEARCH'); }}
                  className="hover:text-teal-300 transition-colors cursor-pointer text-right"
                >
                  أطباء سموحة بالإسكندرية
                </button>
              </li>
            </ul>
          </div>

          {/* Patient Services & Providers */}
          <div>
            <h4 className="font-bold text-white mb-3 text-sm font-heading">خدمات المرضى والشبكة</h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <button onClick={() => navigate('SEARCH')} className="hover:text-teal-300 cursor-pointer text-right">
                  حجز كشف عيادة
                </button>
              </li>
              <li>
                <button onClick={() => navigate('RECORDS')} className="hover:text-teal-300 cursor-pointer text-right">
                  الملف الطبي والروشتات الرقمية
                </button>
              </li>
              <li>
                <button onClick={() => navigate('BOOKINGS')} className="hover:text-teal-300 cursor-pointer text-right">
                  متابعة وتأكيد الحجوزات
                </button>
              </li>
              <li className="pt-2 border-t border-slate-800">
                <button 
                  onClick={onOpenJoinDoctor}
                  className="text-teal-400 hover:text-teal-300 font-bold flex items-center gap-1.5 cursor-pointer text-right font-heading"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>انضم كطبيب أو عيادة</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={onOpenPatientHelp} 
                  className="hover:text-teal-300 cursor-pointer text-right"
                >
                  شروط الاستخدام والخصوصية
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#088395]" />
            <span>جميع حقوق الملكية والعلامة التجارية محفوظة لمنصة دكتورنا © 2026</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={onOpenPatientHelp} className="hover:text-slate-400 cursor-pointer">سياسة حماية بيانات المرضى</button>
            <span>•</span>
            <button onClick={onOpenPatientHelp} className="hover:text-slate-400 cursor-pointer">ميثاق شرف الممارسة الطبية</button>
            <span>•</span>
            <button onClick={onOpenPatientHelp} className="hover:text-slate-400 cursor-pointer">تواصل معنا</button>
          </div>
        </div>

      </div>
    </footer>
  );
};
