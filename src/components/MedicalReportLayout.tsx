import React, { useState } from 'react';
import { 
  Printer, 
  Copy, 
  Check, 
  X, 
  ShieldCheck, 
  QrCode, 
  FileText, 
  Building2, 
  Calendar, 
  User, 
  Activity, 
  AlertTriangle,
  Stethoscope
} from 'lucide-react';

export interface MedicalReportMeta {
  reportId: string;
  reportType: 'prescription' | 'drug_interaction' | 'vital_signs' | 'triage_assessment' | 'lab_report' | 'executive_analytics';
  reportTitle: string;
  patientName?: string;
  patientPhone?: string;
  patientAge?: string | number;
  doctorName?: string;
  doctorTitle?: string;
  specialty?: string;
  clinicOrFacility?: string;
  dateStr?: string;
  urgencyLevel?: 'routine' | 'moderate' | 'urgent' | 'emergency';
}

interface MedicalReportLayoutProps {
  meta: MedicalReportMeta;
  children: React.ReactNode;
  onClose?: () => void;
  rawTextToCopy?: string;
  showActions?: boolean;
}

export const MedicalReportLayout: React.FC<MedicalReportLayoutProps> = ({
  meta,
  children,
  onClose,
  rawTextToCopy,
  showActions = true
}) => {
  const [copied, setCopied] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = () => {
    if (rawTextToCopy) {
      navigator.clipboard.writeText(rawTextToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const currentDate = meta.dateStr || new Date().toISOString().split('T')[0];

  return (
    <div className="printable-medical-report bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-3xl border-2 border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden font-['Tajawal',sans-serif] transition-all">
      
      {/* Non-printable Action Toolbar */}
      {showActions && (
        <div className="no-print bg-slate-100 dark:bg-slate-800/90 px-5 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/80 text-[#0066b2] dark:text-blue-300 border border-blue-200 dark:border-blue-800 px-3 py-1 rounded-full text-xs font-black">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>تقرير طبي رقمي موثق</span>
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono hidden sm:inline">
              كود المرجع: {meta.reportId}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {rawTextToCopy && (
              <button
                type="button"
                onClick={handleCopy}
                className="px-3 py-1.5 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 border border-slate-300 dark:border-slate-600 rounded-xl text-xs font-black text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-2xs"
                title="نسخ نص التقرير الطبي بالكامل"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                <span>{copied ? 'تم النسخ بنجاح' : 'نسخ النص'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-[#0066b2] hover:bg-[#005596] dark:bg-blue-600 dark:hover:bg-blue-500 text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-xs"
              title="طباعة التقرير بصيغة A4 رسمية"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>طباعة A4 / حفظ PDF</span>
            </button>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                title="إغلاق التقرير"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Official Medical Letterhead Header */}
      <div className="p-6 sm:p-8 bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 border-b-2 border-slate-200 dark:border-slate-800 relative">
        
        {/* Top Header Row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#002b49] dark:bg-blue-600 text-white flex items-center justify-center font-black text-xl shadow-xs shrink-0">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  دكتورنا <span className="text-[#0066b2] dark:text-blue-400 font-bold">CarePro Health</span>
                </h1>
                <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-300 dark:border-emerald-700">
                  معتمد وموثق
                </span>
              </div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                المنصة الرقمية للرعاية الصحية وإدارة السجلات الطبية - جمهورية مصر العربية
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-left sm:text-left">
            <div className="hidden sm:block text-[11px] text-slate-500 dark:text-slate-400 font-mono">
              <span className="block font-black text-slate-800 dark:text-slate-200">الرقم المرجعي:</span>
              <span>{meta.reportId}</span>
              <span className="block mt-0.5">{currentDate}</span>
            </div>
            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <QrCode className="w-9 h-9 text-slate-800 dark:text-slate-200" />
            </div>
          </div>
        </div>

        {/* Report Title & Metadata Grid */}
        <div className="mt-5">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#0066b2] dark:text-blue-400" />
              <span>{meta.reportTitle}</span>
            </h2>

            {meta.urgencyLevel && (
              <span className={`text-xs font-black px-3 py-1 rounded-full border ${
                meta.urgencyLevel === 'emergency'
                  ? 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-200'
                  : meta.urgencyLevel === 'urgent'
                  ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-200'
                  : 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200'
              }`}>
                {meta.urgencyLevel === 'emergency' ? 'حالة طوارئ فورية' : meta.urgencyLevel === 'urgent' ? 'فحص سريري عاجل' : 'حالة روتينية مستقرة'}
              </span>
            )}
          </div>

          {/* Metadata Cards Table */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div>
              <span className="text-slate-500 dark:text-slate-400 block font-bold text-[11px]">اسم المريض:</span>
              <strong className="text-slate-900 dark:text-white font-black">{meta.patientName || 'المريض (ملف شخصي)'}</strong>
            </div>

            <div>
              <span className="text-slate-500 dark:text-slate-400 block font-bold text-[11px]">الطبيب / الاستشاري:</span>
              <strong className="text-slate-900 dark:text-white font-black">{meta.doctorName || 'استشاري المنصة الرقمي'}</strong>
            </div>

            <div>
              <span className="text-slate-500 dark:text-slate-400 block font-bold text-[11px]">التخصص الطبي:</span>
              <strong className="text-[#0066b2] dark:text-blue-400 font-black">{meta.specialty || 'استشارات طبية عامة'}</strong>
            </div>

            <div>
              <span className="text-slate-500 dark:text-slate-400 block font-bold text-[11px]">تاريخ الإصدار:</span>
              <strong className="text-slate-900 dark:text-white font-mono font-black">{currentDate}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Main Report Body / Content */}
      <div className="p-6 sm:p-8 space-y-6 text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
        {children}
      </div>

      {/* Official Stamp & Signoff Footer */}
      <div className="p-6 sm:p-8 bg-slate-50 dark:bg-slate-950 border-t-2 border-slate-200 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          
          <div className="space-y-1 max-w-md">
            <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-black text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>وثيقة طبية رقمية مؤمنة ضد التعديل</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal font-medium">
              هذا التقرير صادر إلكترونياً عبر منظومة دكتورنا الرقمية ومطابق لمعايير جودة الرعاية الصحية في مصر. يخضع لإشراف الكادر الطبي المعالج.
            </p>
          </div>

          <div className="flex items-center gap-4 self-end sm:self-center">
            <div className="text-center">
              <div className="w-28 h-12 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center text-[10px] text-slate-400 dark:text-slate-500 font-bold bg-white dark:bg-slate-900">
                <span>ختم المنظومة الطبية</span>
                <span className="text-[9px] font-mono text-[#0066b2] dark:text-blue-400">VERIFIED-DIGITAL</span>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
