import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  HelpCircle, 
  Stethoscope, 
  ArrowLeft, 
  AlertCircle,
  Activity,
  Heart,
  Smile,
  Baby,
  Bone,
  Eye,
  CheckCircle2,
  Mic,
  MicOff,
  Sparkles,
  AlertTriangle,
  ChevronLeft,
  Loader2,
  ShieldAlert,
  Printer,
  Copy,
  Check,
  FileText
} from 'lucide-react';
import { SpecialtyId } from '../types';
import { apiService } from '../services/apiService';

interface SymptomTriageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSpecialty: (specialtyId: SpecialtyId) => void;
}

interface CommonSymptom {
  id: string;
  title: string;
  dialectKeywords: string[];
  description: string;
  recommendedSpecialty: string;
  specialtyId: SpecialtyId;
  advice: string;
  urgency: 'عادية' | 'متوسطة' | 'عاجلة';
  suggestedLabTests?: string;
}

interface AiTriageResult {
  specialtyId: SpecialtyId;
  specialtyName: string;
  secondarySpecialtyId?: SpecialtyId;
  secondarySpecialtyName?: string;
  urgency: 'routine' | 'urgent' | 'emergency';
  urgencyLabel: string;
  clinicalAnalysis: string;
  redFlags?: string[];
  suggestedLabTests?: string[];
  homeCareAdvice?: string;
}

const COMMON_SYMPTOMS: CommonSymptom[] = [
  {
    id: 'chest',
    title: 'خفقان القلب، ضيق التنفس، أو نغزات الصدر',
    dialectKeywords: ['قلبي بينبض بسرعة', 'نهجان', 'وجع في صدري', 'خفقان', 'ضيق تنفس', 'كتمة في النفس', 'نهجان مع السلم'],
    description: 'تسارع ضربات القلب عند المجهود أو الشعور بنغزات وضغط خفيف في الصدر.',
    recommendedSpecialty: 'أمراض القلب والأوعية الدموية',
    specialtyId: 'cardiology',
    advice: 'ينصح بالفحص السريري العاجل وعمل رسم قلب (ECG) وسونار إيكو لتقييم الدورة الدموية.',
    urgency: 'عاجلة',
    suggestedLabTests: 'رسم قلب كهربائي (ECG)، إنزيمات قلب، صورة دم كاملة (CBC)'
  },
  {
    id: 'stomach',
    title: 'آلام المعدة، انتفاخ القولون، والحموضة المستمرة',
    dialectKeywords: ['حرقان في فم المعدة', 'ارتجاع مريء', 'كركبة في البطن', 'انتفاخ القولون', 'عسر هضم', 'مغص بعد الأكل', 'حموضة'],
    description: 'حرقة المريء بعد الوجبات، عسر هضم، تقلصات متكررة في البطن، أو إمساك وإسهال متبادل.',
    recommendedSpecialty: 'باطنة وجهاز هضمي',
    specialtyId: 'internal',
    advice: 'استشارة استشاري باطنة وجهاز هضمي لتقييم جرثومة المعدة (H. Pylori) وسونار البطن.',
    urgency: 'متوسطة',
    suggestedLabTests: 'تحليل جرثومة المعدة بالبراز، سونار بطن وحوض، وظائف كبد وكلى'
  },
  {
    id: 'joints',
    title: 'خشونة الركبة، آلام المفاصل، أو الانزلاق الغضروفي',
    dialectKeywords: ['طقطقة في الركبة', 'وجع في ضهري', 'عرق النسا', 'تنميل في رجلي', 'مش قادر امشي', 'خشونة مفاصل', 'غضروف'],
    description: 'صعوبة في ثني الركبة وصعود الدرج، أو آلام أسفل الظهر الممتدة إلى الساقين.',
    recommendedSpecialty: 'عظام ومفاصل وعمود فقري',
    specialtyId: 'orthopedics',
    advice: 'ينصح بعمل فحص سريري مع أشعة سينية (X-Ray) أو رنين مغناطيسي لتقييم الغضاريف والمفصل.',
    urgency: 'متوسطة',
    suggestedLabTests: 'أشعة X-Ray على المفصل، سرعة ترسيب (ESR)، حمض اليوريك (Uric Acid)'
  },
  {
    id: 'neuro',
    title: 'الصداع النصفي المزمن، الدوخة، وتنميل الأطراف',
    dialectKeywords: ['صداع نصفي', 'زغللة في العين', 'دوخة ودوار', 'تنميل في ايديا', 'عدم اتزان', 'ثقل في الرأس'],
    description: 'صداع نابض في جانب واحد مصحوب بحساسية للضوء أو دوار وعدم اتزان عند الوقوف.',
    recommendedSpecialty: 'مخ وأعصاب',
    specialtyId: 'neurology',
    advice: 'استشارة طبيب مخ وأعصاب لفحص قاع العين وقياس ضغط الدم الشرياني والأعصاب الطرفية.',
    urgency: 'متوسطة',
    suggestedLabTests: 'رنين مغناطيسي على المخ، قياس ضغط الدم، فيتامين B12 وفيتامين D'
  },
  {
    id: 'skin',
    title: 'حب الشباب، تساقط الشعر، أو بقع وحكة جلدية',
    dialectKeywords: ['شعري بيقع جامد', 'حبوب في وشي', 'بقع حمرا وحكة', 'إكزيما', 'فطريات', 'حساسية جلدية'],
    description: 'التهابات بالبشرة، إكزيما، أو تساقط ملحوظ في كثافة الشعر وتقصف الأظافر.',
    recommendedSpecialty: 'جلدية وتجميل وليزر',
    specialtyId: 'dermatology',
    advice: 'فحص بالدرموسكوب لتحديد سبب التساقط أو نوع البكتيريا لوصف روتين علاجي آمن.',
    urgency: 'عادية',
    suggestedLabTests: 'مخزون الحديد (Serum Ferritin)، وظائف غدة درقية (TSH)، زنك'
  },
  {
    id: 'teeth',
    title: 'ألم بالضروس عند شرب السوائل أو نزيف اللثة',
    dialectKeywords: ['ضرسي بيوجعني', 'عصب السن مكشوف', 'الم مع المية الساقعة', 'اللثة بتنزف', 'ورم في خدي', 'تسوّس'],
    description: 'ألم حاد ومفاجئ في الأسنان، حساسية شديدة للمثلجات، أو تورم وانتفاخ في اللثة.',
    recommendedSpecialty: 'طب وجراحة الفم والأسنان',
    specialtyId: 'dentistry',
    advice: 'كشف أسنان فوري لتفادي وصول التسوس إلى عصب السن وعمل تنظيف عميق للجير.',
    urgency: 'متوسطة',
    suggestedLabTests: 'أشعة بانوراما للفكين أو أشعة صغيرة (Periapical X-Ray)'
  },
  {
    id: 'kids',
    title: 'ارتفاع حرارة الرضيع، نزلات معوية، أو كحة الأطفال',
    dialectKeywords: ['ابني سخن مولع', 'ترجيع واسهال للطفل', 'كحة بلغم للبيبي', 'الولد مش بيرضع', 'مغص رضع'],
    description: 'حرارة مستمرة لدى الطفل، قلة الرضاعة، أو سعال متكرر ليلاً وصعوبة في النوم.',
    recommendedSpecialty: 'أطفال وحديثي الولادة',
    specialtyId: 'pediatrics',
    advice: 'فحص فوري لقياس درجة الحرارة وفحص الصدر والأذن الوسطى واستبعاد النزلات الفيروسية.',
    urgency: 'عاجلة',
    suggestedLabTests: 'تحليل دم كامل، تحليل بول، مسحة حلق عند اللزوم'
  },
  {
    id: 'ent',
    title: 'التهاب الجيوب الأنفية، طنين الأذن، والتهاب الحلق',
    dialectKeywords: ['مناخيري مسدودة', 'ودني بتصفر', 'مش قادر ابلع ريقي', 'صداع جيوب انفية', 'بحة صوت'],
    description: 'انسداد في مجرى التنفس الأنفي، ضغط في الجبهة وتحت العينين، أو ألم بالبلع والأذن.',
    recommendedSpecialty: 'أنف وأذن وحنجرة',
    specialtyId: 'ent',
    advice: 'فحص المنظار الأنفي لتقييم اللحمية والجيوب الأنفية وغشاء طبلة الأذن.',
    urgency: 'عادية',
    suggestedLabTests: 'أشعة مقطعية على الجيوب الأنفية (CT Paranasal Sinuses)'
  }
];

const QUICK_DIALECT_TAGS = [
  'حرقان ووجع في المعدة',
  'صداع نصفي مع زغللة',
  'طقطقة وخشونة بالركبة',
  'تساقط شعر وتقصف',
  'وجع جامد في الضرس',
  'خفقان ونهجان بالصدر'
];

export const SymptomTriageModal: React.FC<SymptomTriageModalProps> = ({
  isOpen,
  onClose,
  onSelectSpecialty
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSymptom, setSelectedSymptom] = useState<CommonSymptom | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<AiTriageResult | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  const handleRunAiTriage = async (textToTriage?: string) => {
    const text = (textToTriage || searchQuery).trim();
    if (!text) return;
    setIsAiLoading(true);
    setAiError(null);
    try {
      const result = await apiService.aiTriageSymptoms(text);
      setAiResult(result);
      setSelectedSymptom(null);
    } catch (e: any) {
      console.error('AI Triage error:', e);
      setAiError(e.message || 'تعذر استكمال الفرز السريري، يرجى المحاولة مرة أخرى.');
    } finally {
      setIsAiLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  if (!isOpen) return null;

  const toggleVoiceTriage = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMicError('المتصفح لا يدعم التسجيل الصوتي المباشر. يرجى استخدام لوحة المفاتيح.');
      setTimeout(() => setMicError(null), 4000);
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
      setIsListening(false);
      return;
    }

    try {
      setMicError(null);
      const recognition = new SpeechRecognition();
      recognition.lang = 'ar-EG'; // Egyptian Arabic
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setSearchQuery(transcript);
        }
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const [copied, setCopied] = useState(false);

  const generateTriageTextReport = (): string => {
    let report = `=== تقرير الفرز الطبي الاستشاري الذكي (CarePro Health AI) ===\n`;
    report += `تاريخ الفحص: ${new Date().toLocaleDateString('ar-EG')}\n`;
    report += `الأعراض الموصوفة: "${searchQuery}"\n\n`;

    if (aiResult) {
      report += `[نتيجة التحليل السريري]:\n`;
      report += `التخصص المقترح: ${aiResult.specialtyName}\n`;
      if (aiResult.secondarySpecialtyName) {
        report += `تخصص بديل مقترح: ${aiResult.secondarySpecialtyName}\n`;
      }
      report += `درجة الإلحاح: ${aiResult.urgencyLabel}\n`;
      report += `التقييم السريري: ${aiResult.clinicalAnalysis}\n`;
      if (aiResult.redFlags && aiResult.redFlags.length > 0) {
        report += `علامات الخطر: ${aiResult.redFlags.join(' • ')}\n`;
      }
      if (aiResult.suggestedLabTests && aiResult.suggestedLabTests.length > 0) {
        report += `الفحوصات المقترحة: ${aiResult.suggestedLabTests.join(' • ')}\n`;
      }
      if (aiResult.homeCareAdvice) {
        report += `نصائح الرعاية الأولية: ${aiResult.homeCareAdvice}\n`;
      }
    } else if (selectedSymptom) {
      report += `[العرض السريري]: ${selectedSymptom.title}\n`;
      report += `التخصص الموصى به: ${selectedSymptom.recommendedSpecialty}\n`;
      report += `درجة الإلحاح: ${selectedSymptom.urgency}\n`;
      report += `الإرشاد الطبي: ${selectedSymptom.advice}\n`;
      if (selectedSymptom.suggestedLabTests) {
        report += `الفحوصات المقترحة: ${selectedSymptom.suggestedLabTests}\n`;
      }
    }

    return report;
  };

  const handleCopyTriage = () => {
    const text = generateTriageTextReport();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrintTriage = () => {
    window.print();
  };

  const filtered = COMMON_SYMPTOMS.filter((s) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      s.title.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.recommendedSpecialty.toLowerCase().includes(q) ||
      s.dialectKeywords.some(k => k.toLowerCase().includes(q))
    );
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto animate-in fade-in duration-200 font-body">
      <div 
        className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-t-3xl sm:rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden my-0 sm:my-6 flex flex-col max-h-[92vh] sm:max-h-[88vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#0A2540] text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800 font-heading shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-teal-500/20 text-teal-300 rounded-xl border border-teal-400/30">
              <Sparkles className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold flex items-center gap-2">
                <span>مساعد فرز الأعراض الذكي (AI Symptom Triage)</span>
                <span className="bg-teal-500/20 text-teal-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-teal-500/30">
                  باللهجة المصرية
                </span>
              </h2>
              <p className="text-[11px] sm:text-xs text-teal-200/90 font-body">
                صف ما تشعر به بصوتك أو كتابة لتحديد التخصص الطبي الأنسب فوراً
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {(aiResult || selectedSymptom) && (
              <>
                <button
                  type="button"
                  onClick={handleCopyTriage}
                  className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold"
                  title="نسخ تقرير الفرز الطبي"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span className="hidden sm:inline">{copied ? 'تم النسخ' : 'نسخ التقرير'}</span>
                </button>
                <button
                  type="button"
                  onClick={handlePrintTriage}
                  className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold"
                  title="طباعة تقرير الفرز الطبي"
                >
                  <Printer className="w-4 h-4" />
                  <span className="hidden sm:inline">طباعة</span>
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          
          {/* Voice & Text Search Input Bar */}
          <div className="space-y-2">
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="صف العرض (مثال: عندي حرقان فم المعدة، أو خفقان في القلب)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-clinical text-xs sm:text-sm pl-12 pr-4 py-3"
              />
              <button
                type="button"
                onClick={toggleVoiceTriage}
                className={`absolute left-2.5 p-2 rounded-lg transition-all cursor-pointer ${
                  isListening
                    ? 'bg-rose-500 text-white animate-pulse shadow-md shadow-rose-500/40'
                    : 'bg-teal-50 dark:bg-slate-800 text-[#088395] dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-slate-700'
                }`}
                title="تحدث بصوتك باللهجة المصرية"
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            </div>

            {isListening && (
              <p className="text-xs text-rose-600 dark:text-rose-400 font-bold animate-pulse flex items-center gap-1.5 font-heading">
                <span className="w-2 h-2 bg-rose-500 rounded-full animate-ping"></span>
                <span>جاري الاستماع لوصفك الصوتي الآن... تحدث بحرية</span>
              </p>
            )}

            {micError && (
              <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                {micError}
              </p>
            )}

            {/* Quick Egyptian Tag Pills */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold font-heading">أعراض شائعة:</span>
              {QUICK_DIALECT_TAGS.map((tag, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setSearchQuery(tag);
                    handleRunAiTriage(tag);
                  }}
                  className="text-[11px] bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-[#088395] dark:hover:text-teal-400 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* AI Triage Trigger CTA Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => handleRunAiTriage()}
                disabled={isAiLoading || !searchQuery.trim()}
                className="w-full py-2.5 px-4 btn-clinical-primary font-heading text-xs flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isAiLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جاري التحليل السريري بالذكاء الاصطناعي (Gemini Medical Engine)...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-teal-200" />
                    <span>تشخيص وتحليل دقيق بالذكاء الاصطناعي (فرز تخصصات وعلامات الخطر)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* AI Triage Real-Time Result */}
          {aiResult && (
            <div className="p-4 bg-teal-50/50 dark:bg-slate-800/80 border border-teal-300 dark:border-teal-700/60 rounded-xl shadow-xs text-xs space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-teal-100 dark:border-slate-700 pb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-[#088395] text-white rounded-lg shadow-xs">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#0A2540] dark:text-white text-sm font-heading">
                      نتيجة الفرز السريري الذكي (AI Triage Report)
                    </h4>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                      بناءً على الأعراض المدخلة: &quot;{searchQuery}&quot;
                    </span>
                  </div>
                </div>

                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border font-heading ${
                  aiResult.urgency === 'emergency'
                    ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border-red-300 animate-pulse'
                    : aiResult.urgency === 'urgent'
                    ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300'
                    : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300'
                }`}>
                  {aiResult.urgencyLabel}
                </span>
              </div>

              {/* Clinical Analysis Text */}
              <div className="bg-white/80 dark:bg-slate-800/80 p-3 rounded-lg border border-teal-100 dark:border-slate-700/60 leading-relaxed text-slate-800 dark:text-slate-200 font-body">
                <strong className="block text-[#0A2540] dark:text-teal-300 mb-1 font-bold font-heading">
                  التقييم السريري والتوجيه:
                </strong>
                {aiResult.clinicalAnalysis}
              </div>

              {/* Red Flags if any */}
              {aiResult.redFlags && aiResult.redFlags.length > 0 && (
                <div className="p-2.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-lg text-red-800 dark:text-red-300 text-[11px] space-y-1">
                  <div className="flex items-center gap-1 font-bold font-heading">
                    <ShieldAlert className="w-3.5 h-3.5 text-red-600 dark:text-red-400 shrink-0" />
                    <span>علامات الخطر التي تستوجب التوجه الفوري لأقرب طوارئ:</span>
                  </div>
                  <ul className="list-disc list-inside pr-2 space-y-0.5 font-medium font-body">
                    {aiResult.redFlags.map((flag, idx) => (
                      <li key={idx}>{flag}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommended Lab Tests */}
              {aiResult.suggestedLabTests && aiResult.suggestedLabTests.length > 0 && (
                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-[11px] text-slate-700 dark:text-slate-300">
                  <strong className="text-slate-900 dark:text-white font-bold ml-1 font-heading">فحوصات وتحاليل مقترحة:</strong>
                  <span>{aiResult.suggestedLabTests.join(' • ')}</span>
                </div>
              )}

              {/* Direct Booking Action Buttons */}
              <div className="pt-1 flex flex-wrap items-center justify-between gap-2">
                <div className="text-xs text-slate-600 dark:text-slate-400 font-heading">
                  التخصص الأنسب: <strong className="text-[#088395] dark:text-teal-400 text-sm font-bold">{aiResult.specialtyName}</strong>
                </div>

                <div className="flex items-center gap-2">
                  {aiResult.secondarySpecialtyId && (
                    <button
                      type="button"
                      onClick={() => {
                        onSelectSpecialty(aiResult.secondarySpecialtyId!);
                        onClose();
                      }}
                      className="text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 transition-all cursor-pointer font-heading"
                    >
                      تخصص بديل: {aiResult.secondarySpecialtyName}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      onSelectSpecialty(aiResult.specialtyId);
                      onClose();
                    }}
                    className="btn-clinical-primary text-xs px-4 py-2 flex items-center gap-1.5 shadow-sm transition-all cursor-pointer font-heading"
                  >
                    <span>حجز استشارة مع أطباء {aiResult.specialtyName}</span>
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Filtered Symptoms Cards */}
          <div className="space-y-3 pt-2">
            {filtered.length === 0 ? (
              <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-xs">
                لم نجد تطابقاً مباشراً للأعراض المدخلة. ينصح باختيار تخصص <strong>الباطنة العامة</strong> للفحص السريري الشامل.
              </div>
            ) : (
              filtered.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedSymptom(item)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    selectedSymptom?.id === item.id
                      ? 'border-[#088395] bg-teal-50/40 dark:bg-teal-950/40 shadow-xs ring-1 ring-[#088395]'
                      : 'border-slate-200 dark:border-slate-800 hover:border-teal-300 dark:hover:border-slate-700 hover:bg-slate-50/70 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-1.5">
                    <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm font-heading">{item.title}</h4>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full shrink-0 font-heading ${
                      item.urgency === 'عاجلة' 
                        ? 'bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-900' 
                        : item.urgency === 'متوسطة'
                        ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                    }`}>
                      أولوية {item.urgency}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-2.5 leading-relaxed font-body">
                    {item.description}
                  </p>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs gap-2">
                    <span className="text-slate-600 dark:text-slate-400 font-heading">
                      التخصص الطبي المقترح: <strong className="text-[#088395] dark:text-teal-400 font-bold">{item.recommendedSpecialty}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectSpecialty(item.specialtyId);
                        onClose();
                      }}
                      className="btn-clinical-primary text-xs px-3.5 py-1.5 flex items-center justify-center gap-1 cursor-pointer transition-all shadow-xs shrink-0 self-start sm:self-auto font-heading"
                    >
                      <span>حجز أطباء التخصص</span>
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Selected Symptom Detailed Triage Plan */}
          {selectedSymptom && (
            <div className="p-4 bg-teal-50/50 dark:bg-slate-800/90 border border-teal-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 space-y-2 animate-in fade-in">
              <div className="flex items-center gap-1.5 font-bold text-[#088395] dark:text-teal-400 text-xs font-heading">
                <CheckCircle2 className="w-4 h-4" />
                <span>التقييم الطبي الاسترشادي لتخصص {selectedSymptom.recommendedSpecialty}:</span>
              </div>
              <p className="leading-relaxed text-slate-700 dark:text-slate-300 text-xs font-body">
                {selectedSymptom.advice}
              </p>
              {selectedSymptom.suggestedLabTests && (
                <div className="pt-2 border-t border-teal-200/60 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-400">
                  <strong className="text-slate-800 dark:text-slate-200 font-heading">فحوصات أولية محتملة: </strong>
                  <span>{selectedSymptom.suggestedLabTests}</span>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-50 dark:bg-slate-800/80 p-4 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-3">
          <div className="flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-[#088395] dark:text-teal-400 shrink-0" />
            <span>نظام الفرز استرشادي لمساعدتك في اختيار التخصص المناسب، ولا يغني عن الطوارئ.</span>
          </div>
          <button
            onClick={onClose}
            className="font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer self-end sm:self-auto font-heading"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
