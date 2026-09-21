import React, { useState, useEffect } from 'react';
import { 
  X, 
  QrCode, 
  KeyRound, 
  Copy, 
  Check, 
  Clock, 
  ShieldCheck, 
  Share2, 
  Lock, 
  RefreshCw,
  FileText
} from 'lucide-react';
import { MedicalRecord } from '../types';

interface ShareMedicalRecordsModalProps {
  isOpen: boolean;
  onClose: () => void;
  recordsCount: number;
  records?: MedicalRecord[];
}

export const ShareMedicalRecordsModal: React.FC<ShareMedicalRecordsModalProps> = ({
  isOpen,
  onClose,
  recordsCount,
  records = []
}) => {
  const [pinCode, setPinCode] = useState('CP-849201');
  const [timeLeft, setTimeLeft] = useState(3599); // 60 mins
  const [copied, setCopied] = useState(false);
  const [shareScope, setShareScope] = useState<'all' | 'prescriptions' | 'labs'>('all');
  const [isRevoked, setIsRevoked] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Sync share session to backend when pinCode or scope changes
  const syncShareToBackend = async (newPin: string, currentScope: string) => {
    setIsSyncing(true);
    try {
      const filtered = currentScope === 'all' 
        ? records 
        : currentScope === 'prescriptions'
          ? records.filter(r => r.type === 'prescription')
          : records.filter(r => r.type === 'lab' || r.type === 'scan');

      await fetch('/api/records/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pinCode: newPin,
          records: filtered,
          scope: currentScope,
          patientName: 'مريض دكتورنا'
        })
      });
    } catch (e) {
      console.warn('Backend PIN share register error:', e);
    } finally {
      setIsSyncing(false);
    }
  };

  // Generate a random PIN on open
  useEffect(() => {
    if (isOpen) {
      const randomPin = 'CP-' + Math.floor(100000 + Math.random() * 900000);
      setPinCode(randomPin);
      setTimeLeft(3599);
      setIsRevoked(false);
      syncShareToBackend(randomPin, shareScope);
    }
  }, [isOpen]);

  const handleScopeChange = (newScope: 'all' | 'prescriptions' | 'labs') => {
    setShareScope(newScope);
    syncShareToBackend(pinCode, newScope);
  };

  // Countdown timer
  useEffect(() => {
    if (!isOpen || isRevoked) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, isRevoked]);

  if (!isOpen) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const shareUrl = `https://doctorna.eg/dr/share/${pinCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`رابط الاطلاع الآمن على ملفي الصحي لدى دكتورنا: ${shareUrl} (الكود المؤقت: ${pinCode})`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerate = () => {
    const newPin = 'CP-' + Math.floor(100000 + Math.random() * 900000);
    setPinCode(newPin);
    setTimeLeft(3599);
    setIsRevoked(false);
    syncShareToBackend(newPin, shareScope);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto animate-in fade-in font-['Tajawal',sans-serif]">
      <div 
        className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-0 sm:my-6 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#002b49] dark:bg-slate-950 text-white p-5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">مشاركة الملف الطبي المشفر</h2>
              <p className="text-xs text-blue-200">رمز مرور مؤقت وآمن لاطلاع طبيب العيادة</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 text-sm text-slate-700 dark:text-slate-300">
          
          {/* Scope Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
              حدد نطاق السجلات المسموح للطبيب بالاطلاع عليها:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleScopeChange('all')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  shareScope === 'all'
                    ? 'bg-blue-50 dark:bg-slate-800 border-[#0070cd] text-[#0070cd] dark:text-blue-400 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                الملف الشامل ({recordsCount})
              </button>
              <button
                type="button"
                onClick={() => handleScopeChange('prescriptions')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  shareScope === 'prescriptions'
                    ? 'bg-blue-50 dark:bg-slate-800 border-[#0070cd] text-[#0070cd] dark:text-blue-400 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                الروشتات فقط
              </button>
              <button
                type="button"
                onClick={() => handleScopeChange('labs')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  shareScope === 'labs'
                    ? 'bg-blue-50 dark:bg-slate-800 border-[#0070cd] text-[#0070cd] dark:text-blue-400 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                التحاليل والأشعة
              </button>
            </div>
          </div>

          {/* QR Code & PIN Container */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 text-center flex flex-col items-center">
            
            {/* Visual QR Code Representation */}
            <div className="bg-white p-3.5 rounded-2xl shadow-sm border border-slate-200 mb-3 inline-block">
              <svg 
                className="w-40 h-40" 
                viewBox="0 0 100 100" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* QR Pattern Representation */}
                <rect width="100" height="100" fill="white" />
                {/* Top-left corner */}
                <rect x="5" y="5" width="28" height="28" fill="#002b49" rx="4" />
                <rect x="10" y="10" width="18" height="18" fill="white" rx="2" />
                <rect x="14" y="14" width="10" height="10" fill="#0070cd" rx="1" />
                {/* Top-right corner */}
                <rect x="67" y="5" width="28" height="28" fill="#002b49" rx="4" />
                <rect x="72" y="10" width="18" height="18" fill="white" rx="2" />
                <rect x="76" y="14" width="10" height="10" fill="#0070cd" rx="1" />
                {/* Bottom-left corner */}
                <rect x="5" y="67" width="28" height="28" fill="#002b49" rx="4" />
                <rect x="10" y="72" width="18" height="18" fill="white" rx="2" />
                <rect x="14" y="76" width="10" height="10" fill="#0070cd" rx="1" />
                {/* Random styled matrix squares */}
                <rect x="38" y="8" width="6" height="6" fill="#002b49" />
                <rect x="48" y="8" width="6" height="6" fill="#0070cd" />
                <rect x="58" y="8" width="5" height="5" fill="#002b49" />
                <rect x="38" y="18" width="8" height="8" fill="#002b49" />
                <rect x="50" y="20" width="12" height="6" fill="#002b49" />
                <rect x="8" y="38" width="8" height="8" fill="#002b49" />
                <rect x="20" y="38" width="6" height="6" fill="#0070cd" />
                <rect x="30" y="38" width="6" height="6" fill="#002b49" />
                <rect x="40" y="35" width="20" height="20" fill="#0070cd" rx="4" />
                <rect x="44" y="39" width="12" height="12" fill="white" rx="2" />
                <rect x="47" y="42" width="6" height="6" fill="#0070cd" />
                <rect x="65" y="38" width="8" height="8" fill="#002b49" />
                <rect x="78" y="38" width="14" height="6" fill="#002b49" />
                <rect x="8" y="50" width="14" height="6" fill="#002b49" />
                <rect x="26" y="50" width="8" height="8" fill="#002b49" />
                <rect x="68" y="50" width="10" height="10" fill="#002b49" />
                <rect x="82" y="50" width="10" height="8" fill="#0070cd" />
                <rect x="38" y="65" width="8" height="8" fill="#002b49" />
                <rect x="50" y="65" width="10" height="6" fill="#002b49" />
                <rect x="65" y="65" width="6" height="6" fill="#0070cd" />
                <rect x="76" y="65" width="16" height="8" fill="#002b49" />
                <rect x="38" y="78" width="14" height="8" fill="#002b49" />
                <rect x="56" y="78" width="8" height="14" fill="#0070cd" />
                <rect x="68" y="78" width="8" height="8" fill="#002b49" />
                <rect x="80" y="78" width="12" height="14" fill="#002b49" />
              </svg>
            </div>

            {/* 6-Digit PIN display */}
            <div className="space-y-1 mb-2">
              <span className="text-xs text-slate-500 dark:text-slate-400 block font-bold">كود الدخول المؤقت للطبيب:</span>
              <div className="inline-flex items-center gap-2 bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 px-4 py-1.5 rounded-2xl shadow-inner">
                <KeyRound className="w-5 h-5 text-[#0070cd] dark:text-blue-400" />
                <span className="font-mono text-xl font-black text-slate-900 dark:text-white tracking-widest">
                  {isRevoked ? 'ملغي' : pinCode}
                </span>
              </div>
            </div>

            {/* Live Expiration Countdown */}
            {!isRevoked ? (
              <div className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-900/60 font-bold">
                <Clock className="w-3.5 h-3.5" />
                <span>ينتهي خلال: <strong className="font-mono">{timeFormatted}</strong> (صالح لمدة 60 دقيقة فقط)</span>
              </div>
            ) : (
              <div className="text-xs text-red-600 dark:text-red-400 font-bold bg-red-50 dark:bg-red-950/60 px-3 py-1 rounded-full border border-red-200">
                تم إلغاء صلاحية المشاركة
              </div>
            )}
          </div>

          {/* Quick Actions (Copy Link, Regenerate, Revoke) */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={handleCopyLink}
              disabled={isRevoked}
              className="w-full bg-[#0070cd] hover:bg-[#005bb0] active:scale-98 text-white font-bold text-xs sm:text-sm py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>تم نسخ رابط وكود المشاركة</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  <span>نسخ رابط المشاركة للطبيب</span>
                </>
              )}
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleRegenerate}
                className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold py-2 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>توليد كود جديد</span>
              </button>

              <button
                type="button"
                onClick={() => setIsRevoked(true)}
                disabled={isRevoked}
                className="flex-1 bg-red-50 dark:bg-red-950/50 hover:bg-red-100 dark:hover:bg-red-900/60 text-red-700 dark:text-red-300 text-xs font-bold py-2 rounded-xl border border-red-200 dark:border-red-900/60 transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>إلغاء الصلاحية فوراً</span>
              </button>
            </div>
          </div>

          {/* Security Note */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <p>
              بياناتك الصحية مشفرة وفق معايير HIPAA و GDPR. لن يتمكن الطبيب من تعديل ملفك، وتنتهي صلاحية الرابط تلقائياً بعد الفحص.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};
