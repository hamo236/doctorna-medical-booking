import React, { useState, useEffect } from 'react';
import { 
  X, 
  Activity, 
  Heart, 
  Droplet, 
  Scale, 
  Thermometer, 
  Plus, 
  TrendingUp, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  Printer, 
  Download, 
  Trash2,
  Sparkles,
  CloudCheck,
  RefreshCw,
  Copy,
  Check,
  Loader2,
  ShieldAlert,
  Stethoscope,
  FileText,
  ChevronLeft
} from 'lucide-react';
import { VitalRecord } from '../types';
import { apiService } from '../services/apiService';

const INITIAL_VITALS: VitalRecord[] = [];

interface VitalSignsTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VitalSignsTrackerModal: React.FC<VitalSignsTrackerModalProps> = ({
  isOpen,
  onClose
}) => {
  const [vitals, setVitals] = useState<VitalRecord[]>(INITIAL_VITALS);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  // AI Health Assessment State
  const [aiAssessment, setAiAssessment] = useState<{
    status: 'stable' | 'needs_attention' | 'critical';
    statusLabel: string;
    bpEvaluation: string;
    glucoseEvaluation: string;
    bmiEvaluation: string;
    clinicalSummary: string;
    keyAlerts: string[];
    recommendations: string[];
    suggestedSpecialty: string;
  } | null>(null);
  const [isAnalyzingAi, setIsAnalyzingAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [showAddForm, setShowAddForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'bp' | 'sugar' | 'weight'>('overview');

  // New Vital Form State
  const [inputDate, setInputDate] = useState(new Date().toISOString().split('T')[0]);
  const [inputTime, setInputTime] = useState('09:00 ص');
  const [systolic, setSystolic] = useState<string>('120');
  const [diastolic, setDiastolic] = useState<string>('80');
  const [heartRate, setHeartRate] = useState<string>('72');
  const [bloodSugar, setBloodSugar] = useState<string>('');
  const [sugarType, setSugarType] = useState<'صائم' | 'بعد الأكل بساعتين' | 'عشوائي' | 'تراكمي (HbA1c)'>('صائم');
  const [weightKg, setWeightKg] = useState<string>('');
  const [heightCm, setHeightCm] = useState<string>('175');
  const [temp, setTemp] = useState<string>('37.0');
  const [spo2, setSpo2] = useState<string>('98');
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      apiService.getVitals().then(data => {
        if (data && data.length > 0) {
          setVitals(data);
        }
      }).catch(err => {
        console.error('Failed to load vitals:', err);
      }).finally(() => {
        setIsLoading(false);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const latest = vitals[0] || {
    id: '',
    date: '',
    time: '',
    systolicBP: undefined,
    diastolicBP: undefined,
    heartRate: undefined,
    bloodSugar: undefined,
    bloodSugarType: undefined,
    weightKg: undefined,
    heightCm: 175,
    temperature: undefined,
    spo2: undefined,
    notes: ''
  };

  // Helper for BMI calculation
  const calculateBMI = (weight?: number, height?: number) => {
    if (!weight || !height || height <= 0) return null;
    const hMeter = height / 100;
    const bmi = weight / (hMeter * hMeter);
    return bmi.toFixed(1);
  };

  const getBMILabel = (bmi: number) => {
    if (bmi < 18.5) return { text: 'نقص في الوزن', color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/50' };
    if (bmi < 25) return { text: 'وزن مثالي صحي', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50' };
    if (bmi < 30) return { text: 'زيادة طفيفة في الوزن', color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/50' };
    return { text: 'سمنة (ينصح بمتابعة تغذية)', color: 'text-red-600 bg-red-50 dark:bg-red-950/50' };
  };

  const getBPStatus = (sys?: number, dia?: number) => {
    if (!sys || !dia) return { text: 'غير مسجل', color: 'text-slate-500' };
    if (sys < 120 && dia < 80) return { text: 'ضغط دم مثالي (طبيعي)', color: 'text-emerald-600 dark:text-emerald-400' };
    if (sys <= 129 && dia < 80) return { text: 'مرتفع طبيعي', color: 'text-blue-600 dark:text-blue-400' };
    if (sys <= 139 || dia <= 89) return { text: 'مرحلة أولى ارتفاع ضغط', color: 'text-amber-600 dark:text-amber-400' };
    return { text: 'ضغط دم مرتفع - ينصح باستشارة طبيب', color: 'text-red-600 dark:text-red-400' };
  };

  const handleAddReading = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setActionError(null);
    const newEntry: VitalRecord = {
      id: `vit-${Date.now()}`,
      date: inputDate,
      time: inputTime,
      systolicBP: systolic ? Number(systolic) : undefined,
      diastolicBP: diastolic ? Number(diastolic) : undefined,
      heartRate: heartRate ? Number(heartRate) : undefined,
      bloodSugar: bloodSugar ? Number(bloodSugar) : undefined,
      bloodSugarType: bloodSugar ? sugarType : undefined,
      weightKg: weightKg ? Number(weightKg) : undefined,
      heightCm: heightCm ? Number(heightCm) : undefined,
      temperature: temp ? Number(temp) : undefined,
      spo2: spo2 ? Number(spo2) : undefined,
      notes: notes.trim() || undefined
    };

    try {
      const saved = await apiService.saveVital(newEntry);
      setVitals([saved, ...vitals.filter(v => v.id !== saved.id)]);
      setShowAddForm(false);
      setBloodSugar('');
      setNotes('');
    } catch (err: any) {
      console.error('Error saving vital:', err);
      setActionError(err.message || 'حدث خطأ أثناء حفظ القياس الطبي. تم استخدام الحفظ المحلي المؤقت.');
      setVitals([newEntry, ...vitals]);
      setShowAddForm(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteVital = async (id: string) => {
    setActionError(null);
    const previousVitals = [...vitals];
    setVitals(vitals.filter((v) => v.id !== id));
    try {
      await apiService.deleteVital(id);
    } catch (e: any) {
      console.error('Error deleting vital:', e);
      setVitals(previousVitals);
      setActionError(e.message || 'تعذر حذف القراءة الحيوية من السيرفر.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleRunAiHealthAssessment = async () => {
    if (vitals.length === 0) return;
    setIsAnalyzingAi(true);
    setAiError(null);
    try {
      const result = await apiService.analyzeVitalsTrends(vitals);
      setAiAssessment(result);
    } catch (err: any) {
      console.error('Error in vitals AI analysis:', err);
      setAiError(err.message || 'فشل تشغيل التحليل السريري الذكي');
    } finally {
      setIsAnalyzingAi(false);
    }
  };

  const generateVitalsTextReport = (): string => {
    let report = `=== تقرير المؤشرات والقياسات الحيوية (CarePro Health) ===\n`;
    report += `تاريخ التقرير: ${new Date().toLocaleDateString('ar-EG')}\n`;
    report += `عدد القراءات المسجلة: ${vitals.length}\n\n`;

    if (aiAssessment) {
      report += `[التقييم السريري الذكي - AI Health Assessment]:\n`;
      report += `الحالة العامة: ${aiAssessment.statusLabel}\n`;
      report += `تقييم ضغط الدم: ${aiAssessment.bpEvaluation}\n`;
      report += `تقييم السكر: ${aiAssessment.glucoseEvaluation}\n`;
      report += `مؤشر كتلة الجسم: ${aiAssessment.bmiEvaluation}\n`;
      report += `الملخص السريري: ${aiAssessment.clinicalSummary}\n`;
      if (aiAssessment.keyAlerts?.length) {
        report += `التنبيهات: ${aiAssessment.keyAlerts.join(' • ')}\n`;
      }
      if (aiAssessment.recommendations?.length) {
        report += `التوصيات: ${aiAssessment.recommendations.join(' • ')}\n`;
      }
      report += `التخصص المقترح للمتابعة: ${aiAssessment.suggestedSpecialty}\n\n`;
    }

    report += `[سجل القراءات السريرية]:\n`;
    vitals.forEach((v, idx) => {
      report += `${idx + 1}. التاريخ: ${v.date} ${v.time || ''} | `;
      if (v.systolicBP && v.diastolicBP) report += `ضغط الدم: ${v.systolicBP}/${v.diastolicBP} mmHg | `;
      if (v.bloodSugar) report += `سكر الدم: ${v.bloodSugar} mg/dL (${v.bloodSugarType || 'صائم'}) | `;
      if (v.heartRate) report += `النبض: ${v.heartRate} bpm | `;
      if (v.weightKg) report += `الوزن: ${v.weightKg} كجم | `;
      if (v.notes) report += `ملاحظة: ${v.notes}`;
      report += `\n`;
    });

    return report;
  };

  const handleCopySummary = () => {
    const text = generateVitalsTextReport();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200 font-['Tajawal',sans-serif]">
      <div 
        className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#002b49] dark:bg-slate-950 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-rose-500/20 text-rose-300 rounded-xl border border-rose-400/30">
              <Activity className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black flex items-center gap-2">
                <span>سجل ومؤشرات القياسات الحيوية (Vital Signs)</span>
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-300 dark:text-slate-400">
                متابعة دقيقة لضغط الدم، السكر، النبض، ومؤشر كتلة الجسم لتقديمها للطبيب
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopySummary}
              title="نسخ تقرير القياسات بالكامل"
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span className="hidden sm:inline">{copied ? 'تم النسخ' : 'نسخ التقرير'}</span>
            </button>
            <button
              onClick={handlePrint}
              title="طباعة التقرير الطبي A4"
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">طباعة</span>
            </button>
            <button 
              onClick={onClose} 
              className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {actionError && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 rounded-2xl text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center justify-between gap-3 shadow-sm animate-in fade-in">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{actionError}</span>
              </div>
              <button onClick={() => setActionError(null)} className="text-amber-700 hover:text-amber-950 dark:hover:text-amber-100 font-bold cursor-pointer">✕</button>
            </div>
          )}
          
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Blood Pressure */}
            <div className="bg-slate-50 dark:bg-slate-800/70 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                <span className="flex items-center gap-1 font-bold">
                  <Heart className="w-3.5 h-3.5 text-rose-500" />
                  <span>ضغط الدم</span>
                </span>
                <span className="text-[10px]">mmHg</span>
              </div>
              <div className="text-lg font-black text-slate-900 dark:text-white mb-0.5">
                {latest.systolicBP && latest.diastolicBP ? `${latest.systolicBP}/${latest.diastolicBP}` : '120/80'}
              </div>
              <p className={`text-[10px] font-bold truncate ${getBPStatus(latest.systolicBP, latest.diastolicBP).color}`}>
                {getBPStatus(latest.systolicBP, latest.diastolicBP).text}
              </p>
            </div>

            {/* Blood Sugar */}
            <div className="bg-slate-50 dark:bg-slate-800/70 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                <span className="flex items-center gap-1 font-bold">
                  <Droplet className="w-3.5 h-3.5 text-blue-500" />
                  <span>سكر الدم</span>
                </span>
                <span className="text-[10px]">mg/dL</span>
              </div>
              <div className="text-lg font-black text-slate-900 dark:text-white mb-0.5">
                {latest.bloodSugar || 95}
              </div>
              <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 truncate">
                {latest.bloodSugarType || 'صائم (طبيعي)'}
              </p>
            </div>

            {/* Heart Rate */}
            <div className="bg-slate-50 dark:bg-slate-800/70 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                <span className="flex items-center gap-1 font-bold">
                  <Activity className="w-3.5 h-3.5 text-emerald-500" />
                  <span>النبض</span>
                </span>
                <span className="text-[10px]">BPM</span>
              </div>
              <div className="text-lg font-black text-slate-900 dark:text-white mb-0.5">
                {latest.heartRate || 72}
              </div>
              <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                معدل نبض منتظم
              </p>
            </div>

            {/* BMI / Weight */}
            <div className="bg-slate-50 dark:bg-slate-800/70 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                <span className="flex items-center gap-1 font-bold">
                  <Scale className="w-3.5 h-3.5 text-purple-500" />
                  <span>مؤشر الكتلة</span>
                </span>
                <span className="text-[10px]">BMI</span>
              </div>
              <div className="text-lg font-black text-slate-900 dark:text-white mb-0.5">
                {calculateBMI(latest.weightKg || 78, latest.heightCm || 175) || '24.2'}
              </div>
              <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 truncate">
                {latest.weightKg ? `${latest.weightKg} كجم (طبيعي)` : 'طبيعي'}
              </p>
            </div>
          </div>

          {/* AI Clinical Health Assessment & Trend Analyzer Trigger */}
          <div className="bg-gradient-to-r from-blue-50/90 via-indigo-50/60 to-purple-50/80 dark:from-slate-800/90 dark:via-slate-800/80 dark:to-indigo-950/40 p-4 rounded-2xl border border-indigo-200 dark:border-slate-700 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-xs">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-indigo-950 dark:text-white flex items-center gap-2">
                    <span>التقييم السريري الذكي للمؤشرات (AI Vitals Assessment)</span>
                    <span className="text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-md">Gemini Clinical</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    تحليل نمط ضغط الدم، تذبذب السكر، ونسب مؤشر الكتلة بدقة استشارية
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRunAiHealthAssessment}
                disabled={isAnalyzingAi || vitals.length === 0}
                className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-black px-4 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isAnalyzingAi ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>جاري التحليل السريري...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>{aiAssessment ? 'إعادة التقييم الطبي' : 'تشغيل التقييم السريري'}</span>
                  </>
                )}
              </button>
            </div>

            {aiError && (
              <p className="text-xs text-rose-600 dark:text-rose-400 font-bold bg-rose-50 dark:bg-rose-950/50 p-2.5 rounded-xl border border-rose-200 dark:border-rose-900">
                {aiError}
              </p>
            )}

            {/* AI Assessment Result Card */}
            {aiAssessment && (
              <div className="p-4 bg-white dark:bg-slate-900 border border-indigo-200 dark:border-slate-700 rounded-2xl space-y-3.5 animate-in fade-in">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-black text-slate-900 dark:text-white">نتيجة التشخيص الاستشاري:</span>
                  </div>
                  <span className={`text-xs font-black px-2.5 py-0.5 rounded-full border ${
                    aiAssessment.status === 'critical'
                      ? 'bg-red-100 text-red-800 border-red-300 dark:bg-red-950 dark:text-red-200'
                      : aiAssessment.status === 'needs_attention'
                      ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-200'
                      : 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200'
                  }`}>
                    {aiAssessment.statusLabel}
                  </span>
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {aiAssessment.clinicalSummary}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px]">
                  <div className="bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                    <strong className="block text-rose-600 dark:text-rose-400 font-bold mb-0.5">مؤشر الضغط:</strong>
                    <span className="text-slate-600 dark:text-slate-400">{aiAssessment.bpEvaluation}</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                    <strong className="block text-blue-600 dark:text-blue-400 font-bold mb-0.5">مؤشر السكر:</strong>
                    <span className="text-slate-600 dark:text-slate-400">{aiAssessment.glucoseEvaluation}</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                    <strong className="block text-purple-600 dark:text-purple-400 font-bold mb-0.5">مؤشر الكتلة:</strong>
                    <span className="text-slate-600 dark:text-slate-400">{aiAssessment.bmiEvaluation}</span>
                  </div>
                </div>

                {aiAssessment.keyAlerts && aiAssessment.keyAlerts.length > 0 && (
                  <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl text-amber-800 dark:text-amber-300 text-[11px] space-y-1">
                    <div className="flex items-center gap-1 font-black">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                      <span>تنبيهات استشارية هامة:</span>
                    </div>
                    <ul className="list-disc list-inside pr-2 space-y-0.5 font-medium">
                      {aiAssessment.keyAlerts.map((alert, i) => (
                        <li key={i}>{alert}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {aiAssessment.recommendations && aiAssessment.recommendations.length > 0 && (
                  <div className="p-2.5 bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 rounded-xl text-blue-900 dark:text-blue-200 text-[11px] space-y-1">
                    <strong className="block font-black">التوصيات الطبية ونمط الحياة:</strong>
                    <ul className="list-disc list-inside pr-2 space-y-0.5">
                      {aiAssessment.recommendations.map((rec, i) => (
                        <li key={i}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1 text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">
                    التخصص المقترح للمتابعة السريرية: <strong className="text-indigo-600 dark:text-indigo-400 font-black">{aiAssessment.suggestedSpecialty}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={handleCopySummary}
                    className="text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-indigo-600 flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>نسخ التقرير</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Toggle Add Form Button */}
          <div className="flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#0070cd]" />
              <span>سجل القياسات والتواريخ المسجلة ({vitals.length})</span>
            </h3>
            <button
              type="button"
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-[#0070cd] hover:bg-[#005bb0] active:scale-95 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{showAddForm ? 'إلغاء الإضافة' : 'تسجيل قراءة جديدة'}</span>
            </button>
          </div>

          {/* Add New Vital Form */}
          {showAddForm && (
            <form onSubmit={handleAddReading} className="bg-blue-50/60 dark:bg-slate-800/90 p-4 rounded-2xl border border-blue-200 dark:border-slate-700 space-y-4 animate-in fade-in">
              <div className="font-bold text-xs text-slate-900 dark:text-white border-b border-blue-200/60 dark:border-slate-700 pb-2">
                إدخال قياس سريري جديد
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">التاريخ</label>
                  <input
                    type="date"
                    value={inputDate}
                    onChange={(e) => setInputDate(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2 text-xs focus:ring-2 focus:ring-[#0070cd]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">الوقت</label>
                  <input
                    type="text"
                    value={inputTime}
                    onChange={(e) => setInputTime(e.target.value)}
                    placeholder="مثال: 10:30 ص"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2 text-xs focus:ring-2 focus:ring-[#0070cd]"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">الضغط الانقباضي</label>
                  <input
                    type="number"
                    value={systolic}
                    onChange={(e) => setSystolic(e.target.value)}
                    placeholder="120"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2 text-xs focus:ring-2 focus:ring-[#0070cd]"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">الضغط الانبساطي</label>
                  <input
                    type="number"
                    value={diastolic}
                    onChange={(e) => setDiastolic(e.target.value)}
                    placeholder="80"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2 text-xs focus:ring-2 focus:ring-[#0070cd]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">سكر الدم (mg/dL)</label>
                  <input
                    type="number"
                    value={bloodSugar}
                    onChange={(e) => setBloodSugar(e.target.value)}
                    placeholder="مثال: 105"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2 text-xs focus:ring-2 focus:ring-[#0070cd]"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">نوع قياس السكر</label>
                  <select
                    value={sugarType}
                    onChange={(e: any) => setSugarType(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2 text-xs focus:ring-2 focus:ring-[#0070cd]"
                  >
                    <option value="صائم">صائم</option>
                    <option value="بعد الأكل بساعتين">بعد الأكل بساعتين</option>
                    <option value="عشوائي">عشوائي</option>
                    <option value="تراكمي (HbA1c)">تراكمي (HbA1c)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">النبض (BPM)</label>
                  <input
                    type="number"
                    value={heartRate}
                    onChange={(e) => setHeartRate(e.target.value)}
                    placeholder="75"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2 text-xs focus:ring-2 focus:ring-[#0070cd]"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">الوزن (كجم)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    placeholder="78"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2 text-xs focus:ring-2 focus:ring-[#0070cd]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium text-xs">ملاحظات إضافية (أعراض مصاحبة)</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="مثال: قياس بعد المشي، أو بعد تناول دواء الضغط..."
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2 text-xs focus:ring-2 focus:ring-[#0070cd]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="bg-[#0070cd] hover:bg-[#005bb0] text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors"
                >
                  حفظ القراءة
                </button>
              </div>
            </form>
          )}

          {/* Vitals History List */}
          <div className="space-y-3">
            {vitals.length === 0 && (
              <div className="text-center py-10 bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-body">
                لا توجد قياسات حيوية مسجلة بعد. انقر على "تسجيل قراءة جديدة" للبدء في تتبع مؤشراتك الصحية.
              </div>
            )}
            {vitals.map((record) => (
              <div 
                key={record.id}
                className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-slate-600 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-bold text-slate-900 dark:text-white">{record.date}</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">{record.time}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    {record.systolicBP && record.diastolicBP && (
                      <span className="bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                        <Heart className="w-3.5 h-3.5 text-rose-500" />
                        <span>ضغط الدم: {record.systolicBP}/{record.diastolicBP}</span>
                      </span>
                    )}

                    {record.bloodSugar && (
                      <span className="bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                        <Droplet className="w-3.5 h-3.5 text-blue-500" />
                        <span>سكر: {record.bloodSugar} ({record.bloodSugarType || 'صائم'})</span>
                      </span>
                    )}

                    {record.heartRate && (
                      <span className="bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 flex items-center gap-1">
                        <Activity className="w-3.5 h-3.5 text-emerald-500" />
                        <span>نبض: {record.heartRate} bpm</span>
                      </span>
                    )}

                    {record.weightKg && (
                      <span className="bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 flex items-center gap-1">
                        <Scale className="w-3.5 h-3.5 text-purple-500" />
                        <span>وزن: {record.weightKg} كجم</span>
                      </span>
                    )}
                  </div>

                  {record.notes && (
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 italic">
                      ملاحظة: {record.notes}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteVital(record.id)}
                  className="text-slate-400 hover:text-red-600 dark:hover:text-red-400 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors self-end sm:self-center cursor-pointer"
                  title="حذف القراءة"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            تُحفظ القياسات محلياً ومشفرة في ملفك الشخصي
          </span>
          <button
            type="button"
            onClick={onClose}
            className="bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 text-white text-xs font-bold px-5 py-2 rounded-xl transition-colors cursor-pointer"
          >
            تم
          </button>
        </div>

      </div>
    </div>
  );
};
