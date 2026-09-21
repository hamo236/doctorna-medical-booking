import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, 
  Plus, 
  Trash2, 
  Download, 
  Pill, 
  Activity, 
  Calendar, 
  Stethoscope, 
  CheckCircle2,
  Printer,
  X,
  Mic,
  MicOff,
  AlertCircle,
  Sparkles,
  QrCode,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { MedicalRecord } from '../types';
import { DrugInteractionCheckerModal } from './DrugInteractionCheckerModal';
import { ShareMedicalRecordsModal } from './ShareMedicalRecordsModal';
import { PrescriptionScannerModal } from './PrescriptionScannerModal';
import { VitalSignsTrackerModal } from './VitalSignsTrackerModal';
import { CustomEmptyState } from './CustomEmptyState';
import { CustomLoadingSkeleton } from './CustomLoadingSkeleton';
import { MedicalReportLayout, MedicalReportMeta } from './MedicalReportLayout';
import { checkDrugInteractions } from '../data/drugInteractions';

interface MedicalRecordsViewProps {
  records: MedicalRecord[];
  isLoading?: boolean;
  onAddRecord: (record: MedicalRecord) => Promise<void>;
  onDeleteRecord: (id: string) => void;
}

export const MedicalRecordsView: React.FC<MedicalRecordsViewProps> = ({
  records,
  isLoading = false,
  onAddRecord,
  onDeleteRecord
}) => {
  const [filterType, setFilterType] = useState<'all' | 'prescription' | 'lab' | 'scan'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedRecordForPreview, setSelectedRecordForPreview] = useState<MedicalRecord | null>(null);
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);

  // New Features State
  const [showShareModal, setShowShareModal] = useState(false);
  const [showDrugCheckerModal, setShowDrugCheckerModal] = useState(false);
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [showVitalsModal, setShowVitalsModal] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Collect all active medications across prescriptions
  const allActiveMedNames = records
    .filter(r => r.type === 'prescription' && r.medications)
    .flatMap(r => r.medications?.map(m => m.name) || []);
  
  const detectedInteractions = checkDrugInteractions(allActiveMedNames);

  // Form State
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<'prescription' | 'lab' | 'scan'>('prescription');
  const [newDoctor, setNewDoctor] = useState('');
  const [newSpecialty, setNewSpecialty] = useState('باطنة عامة');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newClinic, setNewClinic] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [medName, setMedName] = useState('');
  const [medDose, setMedDose] = useState('');
  const [medFreq, setMedFreq] = useState('');

  // Speech Recognition State
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  // Cleanup speech recognition on unmount or modal close
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

  const toggleSpeechRecognition = () => {
    // Check if browser supports SpeechRecognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechError('عذراً، متصفحك لا يدعم ميزة الإملاء الصوتي المباشر. يرجى تجربة متصفح Chrome أو Edge الحديث.');
      setTimeout(() => setSpeechError(null), 5000);
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
      setSpeechError(null);
      const recognition = new SpeechRecognition();
      recognition.lang = 'ar-EG'; // Egyptian Arabic dialect recognition
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            transcript += event.results[i][0].transcript;
          }
        }

        if (transcript.trim()) {
          setNewNotes(prev => {
            const separator = prev.trim() ? ' ' : '';
            return prev + separator + transcript.trim();
          });
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setSpeechError('يرجى السماح بصلاحية الميكروفون في المتصفح لاستخدام الإملاء الصوتي.');
        } else if (event.error === 'no-speech') {
          // just no speech detected
        } else {
          setSpeechError('حدث خطأ أثناء الاستماع. يرجى المحاولة مرة أخرى.');
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Failed to initialize speech recognition:', err);
      setSpeechError('تعذر تفعيل الميكروفون. يرجى التأكد من توصيل الميكروفون ومنح الإذن.');
      setIsListening(false);
    }
  };

  const filteredRecords = filterType === 'all' 
    ? records 
    : records.filter(r => r.type === filterType);

  const handleSaveNewRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      setIsListening(false);
    }

    const record: MedicalRecord = {
      id: 'rec-' + Date.now(),
      title: newTitle.trim(),
      type: newType,
      doctorName: newDoctor.trim() || 'طبيب استشاري معتمد',
      specialty: newSpecialty,
      date: newDate,
      clinicOrLab: newClinic.trim() || 'مجمع العيادات التخصصية',
      notes: newNotes.trim(),
      medications: medName ? [
        {
          name: medName,
          dose: medDose || 'قرص واحد',
          frequency: medFreq || 'يومياً بعد الأكل',
          duration: 'أسبوعين'
        }
      ] : []
    };

    try {
      setActionError(null);
      await onAddRecord(record);
      setShowAddModal(false);
      // Reset
      setNewTitle('');
      setNewDoctor('');
      setNewClinic('');
      setNewNotes('');
      setMedName('');
    } catch (err: any) {
      setActionError(err.message || 'حدث خطأ أثناء حفظ السجل الطبي.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 font-body">
      
      {/* Header */}
      {actionError && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl text-xs sm:text-sm font-bold text-red-800 dark:text-red-200 flex items-center justify-between gap-3 shadow-xs animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{actionError}</span>
          </div>
          <button onClick={() => setActionError(null)} className="text-red-600 hover:text-red-900 cursor-pointer">✕</button>
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0A2540] dark:text-white font-heading">الملف الطبي الرقمي</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 font-body">
            احفظ روشتاتك، نتائج التحاليل، وفحوصاتك الطبية في مكان واحد آمن ومتاح دائماً
          </p>
        </div>

        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 w-full sm:w-auto self-start sm:self-auto">
          {/* Smart Prescription Scanner OCR Modal Trigger */}
          <button
            type="button"
            onClick={() => setShowScannerModal(true)}
            className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/80 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs sm:text-sm font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-all font-heading min-h-[42px]"
            title="مسح وتصوير الروشتة الورقية وتحويلها تلقائياً لبيانات رقمية"
          >
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="truncate">ماسح الروشتات</span>
          </button>

          {/* Vital Signs Tracker Modal Trigger */}
          <button
            type="button"
            onClick={() => setShowVitalsModal(true)}
            className="bg-purple-50 dark:bg-purple-950/60 border border-purple-200/80 dark:border-purple-800/80 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 text-xs sm:text-sm font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-all font-heading min-h-[42px]"
            title="متابعة قياسات الضغط والسكر والنبض والوزن"
          >
            <Activity className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
            <span className="truncate">العلامات الحيوية</span>
          </button>

          {/* Share Medical Record via QR/PIN */}
          <button
            type="button"
            onClick={() => setShowShareModal(true)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-all font-heading min-h-[42px]"
            title="مشاركة الملف مع طبيب العيادة عبر كود مؤقت"
          >
            <QrCode className="w-4 h-4 text-[#088395] dark:text-teal-400 shrink-0" />
            <span className="truncate">مشاركة مع الطبيب</span>
          </button>

          {/* Drug Interaction Checker */}
          <button
            type="button"
            onClick={() => setShowDrugCheckerModal(true)}
            className="bg-teal-50 dark:bg-slate-800 border border-teal-200/80 dark:border-slate-700 hover:bg-teal-100 dark:hover:bg-slate-700 text-[#088395] dark:text-teal-400 text-xs sm:text-sm font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-all font-heading min-h-[42px]"
            title="فحص أمان وتعارضات الأدوية"
          >
            <Pill className="w-4 h-4 shrink-0" />
            <span className="truncate">تعارض الأدوية</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="btn-clinical-primary col-span-2 sm:col-auto text-xs sm:text-sm font-bold py-2.5 px-4 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-all font-heading min-h-[42px]"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة روشتة أو تقرير</span>
          </button>
        </div>
      </div>

      {/* Automatic Drug-Drug Interaction Alert Banner */}
      {detectedInteractions.length > 0 && (
        <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 flex items-center justify-center shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-amber-900 dark:text-amber-200 font-heading">
                تنبيه سلامة دوائية: تم رصد تعارض محتمل بين الأدوية في روشتاتك
              </h4>
              <p className="text-xs text-amber-800 dark:text-amber-300 mt-0.5 font-body">
                يوجد تعارض بين ({detectedInteractions[0].drugA}) و ({detectedInteractions[0].drugB}). يرجى مراجعة الصيدلي أو الطبيب.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowDrugCheckerModal(true)}
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl shrink-0 transition-colors cursor-pointer font-heading"
          >
            عرض تفاصيل التعارض
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <button
          onClick={() => setFilterType('all')}
          className={`py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer font-heading ${
            filterType === 'all'
              ? 'bg-[#088395] text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          الكل ({records.length})
        </button>

        <button
          onClick={() => setFilterType('prescription')}
          className={`py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer font-heading ${
            filterType === 'prescription'
              ? 'bg-[#088395] text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          الروشتات الطبية ({records.filter(r => r.type === 'prescription').length})
        </button>

        <button
          onClick={() => setFilterType('lab')}
          className={`py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer font-heading ${
            filterType === 'lab'
              ? 'bg-[#088395] text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          التحاليل المعملية ({records.filter(r => r.type === 'lab').length})
        </button>

        <button
          onClick={() => setFilterType('scan')}
          className={`py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer font-heading ${
            filterType === 'scan'
              ? 'bg-[#088395] text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          الأشعة والفحوصات ({records.filter(r => r.type === 'scan').length})
        </button>
      </div>

      {/* Record Cards */}
      {isLoading ? (
        <CustomLoadingSkeleton type="record-card" count={4} />
      ) : filteredRecords.length === 0 ? (
        <CustomEmptyState
          type={filterType === 'all' ? 'records' : 'records-filtered'}
          title={
            filterType === 'all'
              ? 'سجلك الطبي الرقمي فارغ حتى الآن'
              : `لا توجد ${filterType === 'prescription' ? 'روشتات أدوية' : filterType === 'lab' ? 'تحاليل معملية' : 'تقارير أشعة'} مسجلة`
          }
          description={
            filterType === 'all'
              ? 'احتفظ بروشتاتك وفحوصاتك الطبية في مكان واحد آمن لتتمكن من تتبع حالتك الصحية ومشاركتها مع طبيبك بسهولة.'
              : 'يمكنك إضافة تقرير جديد في هذا القسم أو مراجعة الأقسام الأخرى.'
          }
          actionText="إضافة مستند أو روشتة جديدة"
          onAction={() => setShowAddModal(true)}
          secondaryActionText={filterType !== 'all' ? 'عرض جميع الملفات الطبية' : undefined}
          onSecondaryAction={filterType !== 'all' ? () => setFilterType('all') : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRecords.map((record) => (
            <div
              key={record.id}
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs hover:border-teal-400 dark:hover:border-teal-600 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-heading">
                    {record.type === 'prescription' ? 'روشتة علاج' : record.type === 'lab' ? 'تحليل معملي' : 'فحص أشعة'}
                  </span>

                  <span className="text-xs text-slate-400 dark:text-slate-500 font-mono flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{record.date}</span>
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1 font-heading">{record.title}</h3>
                <div className="text-xs text-slate-600 dark:text-slate-400 space-y-0.5 mb-3 font-body">
                  <p className="font-medium text-slate-800 dark:text-slate-200">الطبيب / المعمل: {record.doctorName}</p>
                  <p className="text-slate-500 dark:text-slate-400">{record.clinicOrLab} • {record.specialty}</p>
                </div>

                {record.notes && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 mb-3 leading-relaxed font-body">
                    {record.notes}
                  </p>
                )}

                {record.medications && record.medications.length > 0 && (
                  <div className="space-y-1.5 mb-3">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block font-heading">الأدوية الموصوفة:</span>
                    {record.medications.map((med, idx) => (
                      <div key={idx} className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-2 rounded-lg text-xs flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Pill className="w-3.5 h-3.5 text-[#088395] dark:text-teal-400" />
                          <strong className="text-slate-800 dark:text-slate-200">{med.name}</strong>
                        </div>
                        <span className="text-slate-500 dark:text-slate-400 text-[11px]">{med.frequency}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 mt-2">
                <button
                  onClick={() => setSelectedRecordForPreview(record)}
                  className="text-xs font-bold text-[#088395] dark:text-teal-400 hover:underline flex items-center gap-1 cursor-pointer font-heading"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>عرض وطباعة الروشتة</span>
                </button>

                <button
                  onClick={() => setRecordToDelete(record.id)}
                  className="text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-slate-800 p-1.5 rounded-lg transition-colors cursor-pointer"
                  title="حذف السجل"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {recordToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-center space-y-4 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-black text-slate-900 dark:text-white text-base">هل أنت متأكد من حذف هذا السجل الطبي؟</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">لا يمكن التراجع عن هذه العملية بعد التأكيد.</p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  onDeleteRecord(recordToDelete);
                  setRecordToDelete(null);
                }}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                تأكيد الحذف
              </button>
              <button
                onClick={() => setRecordToDelete(null)}
                className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Record Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto font-body">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-t-3xl sm:rounded-2xl p-5 sm:p-6 shadow-xl border border-slate-200 dark:border-slate-800 max-h-[92vh] sm:max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800 font-heading shrink-0">
              <h3 className="font-bold text-[#0A2540] dark:text-white text-base">إضافة مستند أو روشتة طبية جديدة</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewRecord} className="space-y-3 text-xs overflow-y-auto pr-0.5">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 font-heading">نوع المستند:</label>
                <div className="grid grid-cols-3 gap-2 font-heading">
                  {[
                    { id: 'prescription', label: 'روشتة أدوية' },
                    { id: 'lab', label: 'تحليل دم / معمل' },
                    { id: 'scan', label: 'تقرير أشعة' }
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setNewType(t.id as any)}
                      className={`py-2 px-2 rounded-xl font-bold border transition-all cursor-pointer ${
                        newType === t.id
                          ? 'bg-[#088395] text-white border-[#088395]'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 font-heading">عنوان التقرير أو التشخيص *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: روشتة علاج ضغط الدم أو تحليل سكر تراكمي"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="input-clinical text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 font-heading">اسم الطبيب أو المعمل</label>
                  <input
                    type="text"
                    placeholder="د. أحمد..."
                    value={newDoctor}
                    onChange={(e) => setNewDoctor(e.target.value)}
                    className="input-clinical text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 font-heading">تاريخ الكشف</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="input-clinical text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 font-heading">اسم الدواء الموصوف (إن وجد)</label>
                <input
                  type="text"
                  placeholder="اسم الدواء والجرعة..."
                  value={medName}
                  onChange={(e) => setMedName(e.target.value)}
                  className="input-clinical text-xs"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-slate-700 dark:text-slate-300 font-heading">
                    ملاحظات الطبيب، التشخيص أو الأعراض
                  </label>
                  
                  {/* Speech Dictation Button */}
                  <button
                    type="button"
                    onClick={toggleSpeechRecognition}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all duration-200 cursor-pointer font-heading ${
                      isListening
                        ? 'bg-red-500 text-white animate-pulse shadow-xs shadow-red-500/30 ring-2 ring-red-300 dark:ring-red-900'
                        : 'bg-teal-50 dark:bg-slate-800 text-[#088395] dark:text-teal-400 hover:bg-teal-100 dark:hover:bg-slate-700 border border-teal-200/60 dark:border-slate-700'
                    }`}
                    title="إملاء صوتي باللغة العربية"
                  >
                    {isListening ? (
                      <>
                        <MicOff className="w-3.5 h-3.5" />
                        <span>إيقاف التسجيل الصوتي</span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-3.5 h-3.5" />
                        <span>إملاء صوتي للأعراض</span>
                      </>
                    )}
                  </button>
                </div>

                {isListening && (
                  <div className="mb-2 p-2 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl flex items-center justify-between text-[11px] text-red-700 dark:text-red-300 animate-in fade-in">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                      </span>
                      <span>جاري الاستماع الآن... تحدث لتسجيل التشخيص والأعراض صوتياً</span>
                    </div>
                    <span className="text-[10px] bg-red-100 dark:bg-red-900/80 px-2 py-0.5 rounded-md font-mono">AR-EG</span>
                  </div>
                )}

                {speechError && (
                  <div className="mb-2 p-2 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 rounded-xl flex items-start gap-1.5 text-[11px] text-amber-800 dark:text-amber-300 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <p className="flex-1">{speechError}</p>
                    <button 
                      type="button" 
                      onClick={() => setSpeechError(null)}
                      className="text-amber-600 hover:text-amber-900 text-xs font-bold px-1"
                    >
                      ×
                    </button>
                  </div>
                )}

                <textarea
                  rows={3}
                  placeholder="اكتب تعليمات الطبيب أو اضغط زر الإملاء الصوتي للتحدث مباشرة..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className={`w-full bg-slate-50 dark:bg-slate-800 border rounded-xl p-2.5 text-xs text-slate-900 dark:text-slate-100 outline-none transition-all ${
                    isListening 
                      ? 'border-red-400 ring-2 ring-red-100 dark:ring-red-950/50' 
                      : 'border-slate-200 dark:border-slate-700 focus:border-[#088395]'
                  }`}
                />
              </div>

              <div className="pt-2 flex gap-2 font-heading">
                <button
                  type="submit"
                  className="flex-1 btn-clinical-primary text-xs py-2.5"
                >
                  حفظ في الملف الطبي
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 btn-clinical-secondary text-xs py-2.5"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Prescription / Medical Report Preview Modal */}
      {selectedRecordForPreview && (() => {
        const record = selectedRecordForPreview;
        const reportMeta: MedicalReportMeta = {
          reportId: record.id,
          reportType: record.type === 'prescription' ? 'prescription' : record.type === 'lab' ? 'lab_report' : 'prescription',
          reportTitle: record.title,
          doctorName: record.doctorName,
          doctorTitle: 'استشاري معتمد',
          specialty: record.specialty,
          clinicOrFacility: record.clinicOrLab || 'دكتورنا كلينك (CarePro Health)',
          dateStr: record.date,
          urgencyLevel: 'routine'
        };

        let rawCopyText = `=== ${record.title} ===\n`;
        rawCopyText += `كود المستند: ${record.id}\n`;
        rawCopyText += `الطبيب: ${record.doctorName} (${record.specialty})\n`;
        rawCopyText += `المنشأة: ${record.clinicOrLab || 'عيادات دكتورنا'}\n`;
        rawCopyText += `التاريخ: ${record.date}\n\n`;

        if (record.medications && record.medications.length > 0) {
          rawCopyText += `[الأدوية الموصوفة]:\n`;
          record.medications.forEach((m, idx) => {
            rawCopyText += `${idx + 1}. ${m.name} - الجرعة: ${m.dose} (${m.frequency}) - المدة: ${m.duration}\n`;
          });
          rawCopyText += `\n`;
        }

        if (record.notes) {
          rawCopyText += `[تعليمات الطبيب]:\n${record.notes}\n`;
        }

        return (
          <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
            <div className="w-full max-w-2xl my-6" onClick={(e) => e.stopPropagation()}>
              <MedicalReportLayout
                meta={reportMeta}
                rawTextToCopy={rawCopyText}
                onClose={() => setSelectedRecordForPreview(null)}
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="font-serif italic font-black text-2xl text-[#0066b2] dark:text-blue-400">℞</span>
                    <strong className="text-slate-900 dark:text-white text-sm font-bold">{record.title}</strong>
                  </div>

                  {record.medications && record.medications.length > 0 ? (
                    <div className="space-y-2.5">
                      <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <Pill className="w-3.5 h-3.5 text-[#0066b2] dark:text-blue-400" />
                        <span>الأدوية والجرعات العلاجية المقررة ({record.medications.length})</span>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {record.medications.map((m, idx) => (
                          <div key={idx} className="p-3 bg-blue-50/50 dark:bg-slate-800/70 rounded-2xl border border-blue-100 dark:border-slate-700 text-xs space-y-1">
                            <strong className="text-slate-900 dark:text-white block text-sm font-black">{m.name}</strong>
                            <p className="text-slate-700 dark:text-slate-300 font-medium">الجرعة: {m.dose} • {m.frequency}</p>
                            <span className="text-slate-500 dark:text-slate-400 text-[11px] block">المدة المقررة: {m.duration}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300">
                      {record.notes || 'تقرير فحص وملاحظات سريرية معتمدة.'}
                    </div>
                  )}

                  {record.notes && record.medications && record.medications.length > 0 && (
                    <div className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1">
                      <strong className="text-slate-900 dark:text-white block font-black">إرشادات الطبيب المعالج والتعليمات:</strong>
                      <p className="leading-relaxed font-medium">{record.notes}</p>
                    </div>
                  )}
                </div>
              </MedicalReportLayout>
            </div>
          </div>
        );
      })()}

      {/* Drug Interaction Checker Modal */}
      <DrugInteractionCheckerModal
        isOpen={showDrugCheckerModal}
        onClose={() => setShowDrugCheckerModal(false)}
        initialMedicines={allActiveMedNames}
      />

      {/* Share Medical Records via QR/PIN Modal */}
      <ShareMedicalRecordsModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        recordsCount={records.length}
        records={records}
      />

      {/* Smart Prescription Scanner OCR Modal */}
      <PrescriptionScannerModal
        isOpen={showScannerModal}
        onClose={() => setShowScannerModal(false)}
        onSaveRecord={async (newRecord) => {
          try {
            setActionError(null);
            await onAddRecord(newRecord);
            setShowScannerModal(false);
          } catch (err: any) {
            setActionError(err.message || 'حدث خطأ أثناء استيراد الروشتة.');
            setShowScannerModal(false); // Close modal on error and show toast in main view
          }
        }}
      />

      {/* Vital Signs Tracker Modal */}
      <VitalSignsTrackerModal
        isOpen={showVitalsModal}
        onClose={() => setShowVitalsModal(false)}
      />

    </div>
  );
};
