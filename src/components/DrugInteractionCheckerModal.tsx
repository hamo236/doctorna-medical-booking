import React, { useState, useEffect } from 'react';
import { 
  X, 
  AlertTriangle, 
  ShieldCheck, 
  Plus, 
  Trash2, 
  Info, 
  CheckCircle2, 
  Sparkles,
  Pill,
  Loader2,
  AlertOctagon,
  HelpCircle,
  Apple,
  Printer,
  Copy,
  Check
} from 'lucide-react';
import { COMMON_DRUG_DATABASE, checkDrugInteractions, DrugInteractionAlert } from '../data/drugInteractions';
import { apiService } from '../services/apiService';

interface DrugInteractionCheckerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMedicines?: string[];
}

export const DrugInteractionCheckerModal: React.FC<DrugInteractionCheckerModalProps> = ({
  isOpen,
  onClose,
  initialMedicines = []
}) => {
  const [selectedMeds, setSelectedMeds] = useState<string[]>(initialMedicines);
  const [customInput, setCustomInput] = useState('');
  const [isAiChecking, setIsAiChecking] = useState(false);
  const [aiReport, setAiReport] = useState<any | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // Run AI interaction check whenever meds change (if >= 2 meds)
  useEffect(() => {
    if (selectedMeds.length >= 2) {
      setIsAiChecking(true);
      setAiError(null);
      apiService.checkDrugInteractionsAI(selectedMeds)
        .then((res) => {
          setAiReport(res);
        })
        .catch((err) => {
          console.error('AI Drug interaction check error:', err);
          setAiError('تعذر الاتصال بمركز المعلومات الدوائية الذكي. تم استخدام الفاحص السريع.');
          setAiReport(null);
        })
        .finally(() => {
          setIsAiChecking(false);
        });
    } else {
      setAiReport(null);
    }
  }, [selectedMeds]);

  if (!isOpen) return null;

  const handleAddMed = (medName: string) => {
    const trimmed = medName.trim();
    if (trimmed && !selectedMeds.includes(trimmed)) {
      setSelectedMeds([...selectedMeds, trimmed]);
      setCustomInput('');
    }
  };

  const handleRemoveMed = (index: number) => {
    setSelectedMeds(selectedMeds.filter((_, i) => i !== index));
  };

  const localAlerts = checkDrugInteractions(selectedMeds);

  // Robust Normalization of AI Report Fields
  const aiAlertsList: any[] = aiReport 
    ? (Array.isArray(aiReport.alerts) ? aiReport.alerts : Array.isArray(aiReport.interactions) ? aiReport.interactions : [])
    : [];
  
  const isAiSafe = aiReport 
    ? (aiReport.isSafe !== undefined ? aiReport.isSafe : (aiReport.hasInteractions !== undefined ? !aiReport.hasInteractions : aiAlertsList.length === 0))
    : true;

  const hasInteractions = !isAiSafe || aiAlertsList.length > 0;

  const generalPrecautions = aiReport?.generalPrecautions || null;
  const foodInteractionsList = Array.isArray(aiReport?.foodInteractions) ? aiReport.foodInteractions : [];

  const handleCopyReport = () => {
    const reportSummary = `تقرير فحص التعارضات الدوائية - دكتورنا كلينك
الأدوية المفحوصة: ${selectedMeds.join('، ')}
النتيجة: ${hasInteractions ? 'توجد تعارضات تستوجب مراجعة الطبيب' : 'الأدوية آمنة معاً'}
${aiReport?.summary || ''}
${generalPrecautions ? `إرشادات عامة: ${generalPrecautions}` : ''}`;
    
    navigator.clipboard?.writeText(reportSummary);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto animate-in fade-in font-body">
      <div 
        className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-t-3xl sm:rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden my-0 sm:my-6 flex flex-col max-h-[92vh] sm:max-h-[90vh] printable-medical-report"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#0A2540] text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800 font-heading shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>فاحص التعارضات والتفاعلات الدوائية الذكي</span>
                <span className="bg-teal-500/20 text-teal-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-teal-500/30 no-print">
                  مدعوم بـ Gemini AI
                </span>
              </h2>
              <p className="text-xs text-teal-200/90 font-body">فحص أمان وسلامة الأدوية المتزامنة لتجنب التفاعلات الضارة والأعراض الجانبية</p>
            </div>
          </div>
          <div className="flex items-center gap-2 no-print">
            <button
              type="button"
              onClick={handlePrint}
              title="طباعة التقرير الصيدلاني"
              className="text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-700 dark:text-slate-300">
          
          {/* Input & Quick selection */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 font-heading">
              أضف أسماء الأدوية أو المواد الفعالة التي تتناولها:
            </label>
            
            <div className="flex gap-2">
              <input
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddMed(customInput)}
                placeholder="مثال: أسبرين، بروفين، كونكور، جلوكوفاج..."
                className="input-clinical text-xs flex-1"
              />
              <button
                type="button"
                onClick={() => handleAddMed(customInput)}
                className="btn-clinical-primary text-xs px-4 py-2.5 font-heading flex items-center gap-1 cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة دواء</span>
              </button>
            </div>

            {/* Quick chips */}
            <div>
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1.5 font-heading">أدوية شائعة للفحص السريع:</span>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_DRUG_DATABASE.slice(0, 8).map((med, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleAddMed(med.split('(')[1]?.replace(')', '') || med.split(' ')[0])}
                    className="text-[11px] bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-slate-700 hover:text-[#088395] text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                  >
                    + {med}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Current list of tested meds */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-heading">
                قائمة الأدوية قيد الفحص ({selectedMeds.length}):
              </span>
              {selectedMeds.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedMeds([])}
                  className="text-[11px] text-red-500 hover:underline font-bold cursor-pointer font-heading"
                >
                  مسح القائمة
                </button>
              )}
            </div>

            {selectedMeds.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
                لم تقم بإضافة أدوية بعد. اختر من القائمة أعلاه أو اكتب اسم الدواء.
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {selectedMeds.map((med, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 bg-teal-50 dark:bg-slate-800 text-[#088395] dark:text-teal-400 border border-teal-200/80 dark:border-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold font-heading"
                  >
                    <span>{med}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveMed(idx)}
                      className="hover:text-red-500 transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Results Analysis */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-heading">
                نتيجة الفحص الصيدلاني والسلامة الدوائية:
              </h3>
              <div className="flex items-center gap-2">
                {isAiChecking ? (
                  <div className="flex items-center gap-1.5 text-xs text-teal-600 dark:text-teal-400 font-bold font-heading">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>فحص صيدلاني ذكي جاري...</span>
                  </div>
                ) : (aiReport || selectedMeds.length >= 2) ? (
                  <button
                    type="button"
                    onClick={handleCopyReport}
                    className="text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-[#088395] flex items-center gap-1 cursor-pointer no-print font-heading"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopied ? 'تم نسخ التقرير' : 'نسخ ملخص التقرير'}</span>
                  </button>
                ) : null}
              </div>
            </div>

            {selectedMeds.length < 2 ? (
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2">
                <Info className="w-4 h-4 text-[#088395] shrink-0" />
                <span>أضف دوائين على الأقل للتحقق من وجود أي تفاعلات أو تعارضات كيميائية متبادلة.</span>
              </div>
            ) : isAiChecking ? (
              <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                <Loader2 className="w-8 h-8 text-[#088395] animate-spin mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300 font-heading">
                  جاري فحص التفاعلات الدوائية ومسارات الأيض الكبدي والكلوي عبر محرك الذكاء الاصطناعي...
                </p>
              </div>
            ) : aiReport ? (
              <div className="space-y-4 animate-in fade-in">
                {/* Overall Summary Card */}
                <div className={`p-4 rounded-xl border printable-card ${
                  hasInteractions
                    ? 'bg-red-50/80 dark:bg-red-950/40 border-red-200 dark:border-red-900/60'
                    : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/50'
                }`}>
                  <div className="flex items-start gap-3">
                    {hasInteractions ? (
                      <AlertOctagon className="w-6 h-6 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                    ) : (
                      <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-1">
                      <h4 className={`text-sm font-bold font-heading ${
                        hasInteractions ? 'text-red-900 dark:text-red-200' : 'text-emerald-900 dark:text-emerald-200'
                      }`}>
                        {hasInteractions ? 'تم رصد تفاعلات دوائية تستوجب الانتباه الطبي' : 'لا توجد تعارضات خطيرة مسجلة - الاستعمال متوافق'}
                      </h4>
                      <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300 font-body">
                        {aiReport.summary}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Specific Interaction Cards */}
                {aiAlertsList.length > 0 && (
                  <div className="space-y-3">
                    {aiAlertsList.map((inter: any, idx: number) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-xl border printable-card ${
                          inter.severity === 'contraindicated' || inter.severity === 'high' || inter.severity === 'major'
                            ? 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900/60'
                            : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className={`w-5 h-5 shrink-0 ${
                            inter.severity === 'contraindicated' || inter.severity === 'high' || inter.severity === 'major'
                              ? 'text-red-600 dark:text-red-400' 
                              : 'text-amber-600 dark:text-amber-400'
                          }`} />
                          <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full font-heading ${
                            inter.severity === 'contraindicated' || inter.severity === 'high' || inter.severity === 'major'
                              ? 'bg-red-200 dark:bg-red-900 text-red-900 dark:text-red-100'
                              : 'bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100'
                          }`}>
                            {inter.severityText || (inter.severity === 'high' ? 'تعارض مرتفع الخطورة' : 'تفاعل متوسط')}
                          </span>
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-heading">
                            [{inter.drugA}] مع [{inter.drugB}]
                          </span>
                        </div>

                        <p className="text-xs text-slate-800 dark:text-slate-200 mb-2 leading-relaxed font-body">
                          <strong>آلية التعارض:</strong> {inter.mechanism}
                        </p>

                        <div className="text-xs text-slate-700 dark:text-slate-300 bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-800 font-body">
                          <strong className="text-[#088395] dark:text-teal-400 font-heading">التوصية السريرية:</strong> {inter.clinicalAdvice}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* General & Food precautions */}
                {(generalPrecautions || foodInteractionsList.length > 0) && (
                  <div className="p-3.5 bg-amber-50/70 dark:bg-slate-850 rounded-xl border border-amber-200/80 dark:border-slate-750 text-xs text-slate-700 dark:text-slate-300 space-y-1.5 printable-card">
                    <div className="flex items-center gap-1.5 font-bold text-amber-900 dark:text-amber-300 font-heading">
                      <Apple className="w-4 h-4 text-amber-600" />
                      <span>إرشادات التناول مع الأغذية والسوائل:</span>
                    </div>
                    {generalPrecautions && (
                      <p className="text-xs leading-relaxed pr-1 font-body">{generalPrecautions}</p>
                    )}
                    {foodInteractionsList.length > 0 && (
                      <ul className="list-disc list-inside space-y-1 pr-1 text-[11px] mt-1 font-body">
                        {foodInteractionsList.map((item: string, i: number) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            ) : localAlerts.length === 0 ? (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-900/50 flex items-start gap-3 printable-card">
                <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-200 font-heading">
                    لا توجد تعارضات مباشرة مسجلة
                  </h4>
                  <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1 leading-relaxed font-body">
                    لم يتم رصد أي تفاعل خطير بين الأدوية المختارة وفقاً لقواعد البيانات الدوائية المعتمدة. استشر طبيبك دائماً قبل تغيير الجرعات.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {localAlerts.map((alert, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl border printable-card ${
                      alert.severity === 'high'
                        ? 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900/60'
                        : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className={`w-5 h-5 shrink-0 ${alert.severity === 'high' ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}`} />
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full font-heading ${
                        alert.severity === 'high'
                          ? 'bg-red-200 dark:bg-red-900 text-red-900 dark:text-red-100'
                          : 'bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100'
                      }`}>
                        {alert.severityText}
                      </span>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-heading">
                        [{alert.drugA}] مع [{alert.drugB}]
                      </span>
                    </div>

                    <p className="text-xs text-slate-800 dark:text-slate-200 mb-2 leading-relaxed font-body">
                      <strong>آلية التعارض:</strong> {alert.mechanism}
                    </p>

                    <div className="text-xs text-slate-700 dark:text-slate-300 bg-white/70 dark:bg-slate-900/70 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-800 font-body">
                      <strong className="text-[#088395] dark:text-teal-400 font-heading">التوصية الطبية:</strong> {alert.clinicalAdvice}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-50 dark:bg-slate-950 p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs no-print font-heading">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-body">
            <ShieldCheck className="w-4 h-4 text-[#088395] dark:text-teal-400" />
            <span>نظام إرشادي صيدلاني معتمد لا يغني عن استشارة الطبيب المعالج أو الصيدلي</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn-clinical-primary text-xs px-5 py-2 cursor-pointer"
          >
            إغلاق الفاحص
          </button>
        </div>

      </div>
    </div>
  );
};

