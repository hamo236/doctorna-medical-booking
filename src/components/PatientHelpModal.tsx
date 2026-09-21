import React, { useState } from 'react';
import { 
  X, 
  PhoneCall, 
  HelpCircle, 
  ShieldCheck, 
  CreditCard, 
  Calendar, 
  FileText, 
  Video,
  ChevronDown,
  CheckCircle2,
  Send
} from 'lucide-react';

interface PatientHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: any) => void;
}

export const PatientHelpModal: React.FC<PatientHelpModalProps> = ({
  isOpen,
  onClose,
  onNavigate
}) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [inquiryText, setInquiryText] = useState('');
  const [inquirySent, setInquirySent] = useState(false);

  if (!isOpen) return null;

  const faqs = [
    {
      q: 'هل الحجز مجاني بالكامل؟',
      a: 'نعم، الحجز مجاني 100% والدفع كاش بالعيادة بالسعر الرسمي المعلن دون أي زيادة.'
    },
    {
      q: 'كيف يمكنني تعديل أو إلغاء موعدي؟',
      a: 'من صفحة "حجوزاتي" بالضغط على "تعديل" لتعديل الموعد، أو "إلغاء" لإلغائه مجاناً في أي وقت.'
    },
    {
      q: 'كيف أحصل على روشتة الاستشارة بالفيديو؟',
      a: 'تصدر الروشتة إلكترونياً كملف PDF قابل للتحميل فور انتهاء المكالمة المرئية مع الطبيب.'
    },
    {
      q: 'أين أجد الروشتات والتحاليل المرفوعة؟',
      a: 'في صفحة "ملفي الطبي"، حيث تحفظ بأمان تام وتكون متاحة للطباعة أو العرض على الطبيب.'
    }
  ];

  const handleSendInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryText.trim()) return;
    setInquirySent(true);
    setTimeout(() => {
      setInquirySent(false);
      setInquiryText('');
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto font-body">
      <div 
        className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-t-3xl sm:rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden my-0 sm:my-6 animate-in fade-in duration-200 flex flex-col max-h-[92vh] sm:max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#0A2540] text-white p-5 sm:p-6 relative flex items-start justify-between shrink-0 border-b border-slate-800 font-heading">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300">
              <HelpCircle className="w-6 h-6 text-teal-300" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold">مركز مساعدة وخدمة المرضى</h2>
              <p className="text-xs text-slate-300 dark:text-slate-400 mt-0.5">فريق دعم دكتورنا متاح لمساعدتكم 24 ساعة يومياً</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-700 dark:text-slate-300">
          
          {/* Direct Assistance Info Box */}
          <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 font-heading">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#088395] text-white flex items-center justify-center shrink-0 shadow-xs">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#088395] dark:text-teal-400 block mb-0.5">منصة دكتورنا الإلكترونية المعتمدة:</span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-100 block">يمكنك حجز كافة المواعيد والاستشارات الطبية وتأكيدها إلكترونياً بالكامل.</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-body">الخدمة متاحة على مدار الساعة مجاناً للمرضى</span>
              </div>
            </div>
          </div>

          {/* Quick FAQ Accordion */}
          <div>
            <h3 className="font-bold text-[#0A2540] dark:text-white text-sm mb-3 font-heading">الأسئلة الأكثر شيوعاً</h3>
            <div className="space-y-2 font-heading">
              {faqs.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div 
                    key={idx} 
                    className="border border-slate-200 dark:border-slate-700/80 rounded-xl overflow-hidden transition-all bg-slate-50/50 dark:bg-slate-800/40"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full text-right p-3.5 flex items-center justify-between font-bold text-xs text-slate-800 dark:text-slate-200 hover:text-[#088395] dark:hover:text-teal-400 transition-colors cursor-pointer"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-[#088395]' : ''}`} />
                    </button>
                    {isOpen && (
                      <div className="p-3.5 pt-0 text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-700/60 bg-white dark:bg-slate-800/80 font-body">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Ask Support Box */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 font-heading">
            <h3 className="font-bold text-[#0A2540] dark:text-white text-xs mb-2">هل لديك استفسار محدد؟ أرسله مباشرة</h3>
            {inquirySent ? (
              <div className="p-3 bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300 rounded-xl text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#088395] dark:text-teal-400" />
                <span>تم استلام رسالتك، وسيقوم فريق الدعم بالرد فوراً.</span>
              </div>
            ) : (
              <form onSubmit={handleSendInquiry} className="flex gap-2">
                <input
                  type="text"
                  placeholder="اكتب استفسارك هنا..."
                  value={inquiryText}
                  onChange={(e) => setInquiryText(e.target.value)}
                  className="input-clinical flex-1 text-xs"
                />
                <button
                  type="submit"
                  className="btn-clinical-primary px-4 py-2 rounded-lg text-xs font-bold transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 rotate-180" />
                  <span>إرسال</span>
                </button>
              </form>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
