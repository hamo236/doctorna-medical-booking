import React, { useState } from 'react';
import { 
  User as UserIcon, 
  LogOut, 
  LogIn, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles,
  Cloud,
  X
} from 'lucide-react';
import { User } from 'firebase/auth';
import { loginWithGoogle, logoutUser } from '../firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await loginWithGoogle();
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'تعذر إتمام تسجيل الدخول عبر جوجل');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    setError(null);
    try {
      await logoutUser();
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'تعذر تسجيل الخروج');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200 font-body">
      <div 
        className="bg-white dark:bg-slate-900 w-full max-w-md rounded-t-3xl sm:rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#0A2540] text-white p-5 flex items-center justify-between border-b border-slate-800 font-heading shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-teal-400" />
            <h3 className="font-bold text-base">
              {currentUser ? 'حساب المريض والملف السحابي' : 'تسجيل الدخول إلى دكتورنا'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {currentUser ? (
            <div className="space-y-4">
              <div className="p-4 bg-teal-50/50 dark:bg-slate-800/80 rounded-xl border border-teal-100 dark:border-slate-700 flex items-center gap-4">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'User'}
                    className="w-14 h-14 rounded-xl border-2 border-white dark:border-slate-700 shadow-sm object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-[#088395] text-white flex items-center justify-center font-bold text-xl font-heading">
                    {currentUser.displayName ? currentUser.displayName[0] : 'U'}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm font-heading">
                      {currentUser.displayName || 'مريض دكتورنا'}
                    </h4>
                    <span className="text-[10px] font-bold bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-400 px-2 py-0.5 rounded-full font-heading">
                      موثق بـ Firebase
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                    {currentUser.email}
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 space-y-2">
                <div className="flex items-center gap-2 text-teal-700 dark:text-teal-400 font-bold font-heading">
                  <Cloud className="w-4 h-4" />
                  <span>المزامنة السحابية الدائمة مفعلة (Firestore)</span>
                </div>
                <p className="leading-relaxed font-body">
                  يتم حفظ مواعيد كشوفاتك، الروشتات الطبية، وبيانات المتابعة بأمان تام عبر قاعدة بيانات Firebase السحابية.
                </p>
              </div>

              <button
                type="button"
                onClick={handleSignOut}
                disabled={loading}
                className="w-full bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/40 text-rose-700 dark:text-rose-300 font-bold text-xs py-3 px-4 rounded-xl border border-rose-200 dark:border-rose-900 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 font-heading"
              >
                <LogOut className="w-4 h-4" />
                <span>{loading ? 'جاري تسجيل الخروج...' : 'تسجيل الخروج من الحساب'}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4 text-center">
              <div className="w-14 h-14 bg-teal-50 dark:bg-slate-800 text-[#088395] dark:text-teal-400 rounded-2xl flex items-center justify-center mx-auto border border-teal-100 dark:border-slate-700 shadow-xs">
                <UserIcon className="w-7 h-7" />
              </div>

              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white font-heading">
                  احفظ مواعيدك وملفك الصحي بأمان
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed font-body">
                  سجل الدخول فوراً بضغطة واحدة باستخدام حساب Google لمزامنة حجوزاتك، الروشتات والتحاليل عبر سحابة Firebase المعتمدة.
                </p>
              </div>

              {error && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 text-xs font-bold rounded-xl border border-rose-200 dark:border-rose-900 text-right">
                  {error}
                </div>
              )}

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold text-xs sm:text-sm py-3.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 transition-all flex items-center justify-center gap-3 cursor-pointer shadow-xs hover:border-[#088395] disabled:opacity-50 font-heading"
              >
                {/* Google multi-color G logo */}
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24Z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15Z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"
                  />
                </svg>
                <span>{loading ? 'جاري الاتصال بـ Google...' : 'المتابعة والتسجيل بحساب Google'}</span>
              </button>

              <div className="pt-2 flex items-center justify-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-body">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>تسجيل آمن ومشفر بنسبة 100% عبر Firebase Authentication</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
