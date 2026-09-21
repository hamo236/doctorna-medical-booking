import React, { useState } from 'react';
import { 
  Eye, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Check, 
  X,
  Glasses
} from 'lucide-react';
import { TextScale, AccessibilityPreferences } from '../types';

interface AccessibilityBarProps {
  preferences: AccessibilityPreferences;
  onUpdatePreferences: (updated: Partial<AccessibilityPreferences>) => void;
}

export const AccessibilityBar: React.FC<AccessibilityBarProps> = ({
  preferences,
  onUpdatePreferences
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleTextScale = (scale: TextScale) => {
    onUpdatePreferences({ textScale: scale });
  };

  const handleToggleContrast = () => {
    onUpdatePreferences({ highContrast: !preferences.highContrast });
  };

  // Web Speech API for Egyptian/Arabic voice assistance
  const handleToggleSpeech = () => {
    if (!('speechSynthesis' in window)) {
      alert('المتصفح لا يدعم القراءة الصوتية المباشرة');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      onUpdatePreferences({ speechAssist: false });
    } else {
      window.speechSynthesis.cancel();
      const textToRead = "أهلاً بك في منصة دكتورنا الطبية. يمكنك البحث عن أفضل الأطباء والعيادات في محافظات مصر، حجز موعدك فوراً، أو طلب استشارة بالفيديو دون انتظار.";
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.lang = 'ar-EG';
      utterance.rate = 0.9;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
      onUpdatePreferences({ speechAssist: true });
    }
  };

  return (
    <div className="relative z-30 font-body">
      {/* Accessibility Floating/Embedded Pill */}
      <div className="flex items-center gap-1.5 bg-white/95 dark:bg-slate-800/90 backdrop-blur-md px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700 shadow-xs">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full transition-all cursor-pointer font-heading ${
            isOpen || preferences.highContrast || preferences.textScale !== 'normal'
              ? 'bg-[#088395] text-white shadow-xs'
              : 'text-slate-700 dark:text-slate-300 hover:text-[#088395] dark:hover:text-teal-400'
          }`}
          title="خيارات الرؤية وتسهيل القراءة للمريض"
        >
          <Glasses className="w-3.5 h-3.5" />
          <span className="text-[11px]">تسهيل الرؤية</span>
        </button>

        {/* Quick A- / A / A+ direct buttons */}
        <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-slate-900 rounded-full p-0.5 border border-slate-200/60 dark:border-slate-700/60 font-mono">
          <button
            type="button"
            onClick={() => handleTextScale('normal')}
            className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full transition-colors cursor-pointer ${
              preferences.textScale === 'normal'
                ? 'bg-[#088395] text-white'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="حجم خط عادي"
          >
            A
          </button>
          <button
            type="button"
            onClick={() => handleTextScale('large')}
            className={`px-1.5 py-0.5 text-[11px] font-bold rounded-full transition-colors cursor-pointer ${
              preferences.textScale === 'large'
                ? 'bg-[#088395] text-white'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="حجم خط كبير (رؤية مريحة)"
          >
            A+
          </button>
          <button
            type="button"
            onClick={() => handleTextScale('huge')}
            className={`px-1.5 py-0.5 text-[12px] font-black rounded-full transition-colors cursor-pointer ${
              preferences.textScale === 'huge'
                ? 'bg-[#088395] text-white'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="حجم خط فائق الكبر لكبار السن وضعاف النظر"
          >
            A++
          </button>
        </div>

        {/* Quick Audio Read Button */}
        <button
          type="button"
          onClick={handleToggleSpeech}
          className={`p-1 rounded-full transition-all cursor-pointer ${
            isSpeaking
              ? 'bg-teal-600 text-white animate-pulse'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
          title={isSpeaking ? 'إيقاف القراءة الصوتية' : 'تشغيل المساعد الصوتي لقراءة محتوى المنصة'}
        >
          {isSpeaking ? <Volume2 className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Expanded Accessibility Popover */}
      {isOpen && (
        <div className="absolute top-full mt-2 left-0 w-72 bg-white dark:bg-slate-900 p-4 rounded-xl shadow-xl z-50 border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100 dark:border-slate-800 font-heading">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#088395] dark:text-teal-400" />
              <h4 className="font-bold text-xs text-slate-900 dark:text-white">إمكانية الوصول والراحة البصرية</h4>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-full cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3 text-xs">
            {/* High Contrast Mode */}
            <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/70 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-100 font-heading">تباين عالي (وضوح فائق)</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-body">تغميق النصوص وزيادة وضوح الحواف</div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleToggleContrast}
                className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                  preferences.highContrast ? 'bg-[#088395] justify-end' : 'bg-slate-300 dark:bg-slate-600 justify-start'
                }`}
              >
                <div className="w-4 h-4 bg-white rounded-full shadow-xs" />
              </button>
            </div>

            {/* Audio Voice Assistant */}
            <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/70 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
              <div className="flex items-center gap-2">
                {isSpeaking ? (
                  <Volume2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                ) : (
                  <VolumeX className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                )}
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-100 font-heading">المساعد الصوتي الناطق</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-body">قراءة التعليمات والإرشادات بصوت واضح</div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleToggleSpeech}
                className={`px-2.5 py-1 rounded-lg font-bold text-[10px] transition-all cursor-pointer font-heading ${
                  isSpeaking
                    ? 'bg-rose-500 text-white hover:bg-rose-600'
                    : 'bg-[#088395] text-white hover:bg-teal-700'
                }`}
              >
                {isSpeaking ? 'إيقاف' : 'استماع'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
