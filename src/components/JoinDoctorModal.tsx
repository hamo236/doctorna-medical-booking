import React, { useState } from 'react';
import { 
  X, 
  Stethoscope, 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  CheckCircle2, 
  ShieldCheck, 
  FileText,
  AlertCircle
} from 'lucide-react';
import { SPECIALTIES, CITIES_AND_AREAS } from '../data/seedData';

interface JoinDoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (reqData: {
    providerName: string;
    specialtyId: any;
    specialtyName: string;
    city: string;
    phone: string;
    facilityType: any;
    licenseNo?: string;
  }) => Promise<void> | void;
}

export const JoinDoctorModal: React.FC<JoinDoctorModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [providerName, setProviderName] = useState('');
  const [specialtyId, setSpecialtyId] = useState('');
  const [city, setCity] = useState('القاهرة');
  const [phone, setPhone] = useState('');
  const [facilityType, setFacilityType] = useState<'private_clinic' | 'polyclinic' | 'hospital'>('private_clinic');
  const [licenseNo, setLicenseNo] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!providerName.trim()) {
      setError('يرجى إدخال اسم الطبيب أو العيادة');
      return;
    }
    if (!phone.trim() || phone.trim().length < 10) {
      setError('يرجى إدخال رقم هاتف صحيح للتواصل (11 رقم)');
      return;
    }
    if (!specialtyId) {
      setError('يرجى اختيار التخصص الطبي الرئيسي');
      return;
    }

    const specObj = SPECIALTIES.find(s => s.id === specialtyId);

    try {
      setError(null);
      await onSuccess({
        providerName: providerName.trim(),
        specialtyId: specialtyId as any,
        specialtyName: specObj?.name || 'تخصص عام',
        city,
        phone: phone.trim(),
        facilityType,
        licenseNo: licenseNo.trim() || undefined
      });
      setIsSubmitted(true);

      setTimeout(() => {
        setIsSubmitted(false);
        onClose();
        // Reset form
        setProviderName('');
        setPhone('');
        setLicenseNo('');
      }, 2500);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء تقديم طلب الانضمام. يرجى المحاولة مرة أخرى.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto font-body">
      <div 
        className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-t-3xl sm:rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden my-0 sm:my-6 max-h-[92vh] flex flex-col animate-in fade-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#0A2540] text-white p-5 sm:p-6 relative flex items-start justify-between border-b border-slate-800 font-heading shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-300">
              <Stethoscope className="w-6 h-6 text-teal-300" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold">انضم لشبكة أطباء وعيادات دكتورنا</h2>
              <p className="text-xs text-slate-300 dark:text-slate-400 mt-0.5">طلب تسجيل تعاقد جديد للعيادات والمراكز الطبية المعتمدة</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isSubmitted ? (
            <div className="text-center py-8 space-y-3 font-heading">
              <div className="w-16 h-16 bg-teal-100 dark:bg-teal-950/80 text-[#088395] dark:text-teal-400 rounded-full flex items-center justify-center mx-auto border border-teal-200 dark:border-teal-800">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">تم إرسال طلب التعاقد بنجاح</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xs mx-auto leading-relaxed font-body">
                شكراً لتواصلكم. سيقوم مسؤول إدارة الشبكة الطبية بمراجعة البيانات والتواصل معكم لتفعيل حساب العيادة.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900 rounded-xl text-xs text-red-700 dark:text-red-300 font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 font-heading">
                  اسم الطبيب أو اسم المركز الطبي <span className="text-slate-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: عيادات النور التخصصية"
                  value={providerName}
                  onChange={(e) => setProviderName(e.target.value)}
                  className="input-clinical w-full"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 font-heading">
                    التخصص الطبي <span className="text-slate-400">*</span>
                  </label>
                  <select
                    value={specialtyId}
                    onChange={(e) => setSpecialtyId(e.target.value)}
                    required
                    className="input-clinical w-full font-bold cursor-pointer"
                  >
                    <option value="">اختر التخصص</option>
                    {SPECIALTIES.filter(s => s.id !== 'all').map((spec) => (
                      <option key={spec.id} value={spec.id} className="dark:bg-slate-900">{spec.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 font-heading">
                    المحافظة <span className="text-slate-400">*</span>
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="input-clinical w-full font-bold cursor-pointer"
                  >
                    {CITIES_AND_AREAS.map((c) => (
                      <option key={c.city} value={c.city} className="dark:bg-slate-900">{c.city}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 font-heading">
                    رقم هاتف التواصل <span className="text-slate-400">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="مثال: 01012345678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="input-clinical w-full text-left font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 font-heading">
                    نوع المنشأة
                  </label>
                  <select
                    value={facilityType}
                    onChange={(e) => setFacilityType(e.target.value as any)}
                    className="input-clinical w-full font-bold cursor-pointer"
                  >
                    <option value="private_clinic" className="dark:bg-slate-900">عيادة خاصة</option>
                    <option value="polyclinic" className="dark:bg-slate-900">مركز عيادات تخصصية</option>
                    <option value="hospital" className="dark:bg-slate-900">مستشفى أو مركز جراحي</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 font-heading">
                  رقم ترخيص مزاولة المهنة أو السجل التجاري (اختياري)
                </label>
                <input
                  type="text"
                  placeholder="رقم الترخيص الصادر من وزارة الصحة أو النقابة"
                  value={licenseNo}
                  onChange={(e) => setLicenseNo(e.target.value)}
                  className="input-clinical w-full text-xs"
                />
              </div>

              <div className="p-3 bg-teal-50/60 dark:bg-slate-800/80 border border-teal-100 dark:border-slate-700 rounded-xl flex items-center gap-2 text-xs text-teal-900 dark:text-teal-300">
                <ShieldCheck className="w-4 h-4 text-[#088395] dark:text-teal-400 shrink-0" />
                <span>يتم التحقق من تراخيص كافة المنشآت الطبية لضمان سلامة المرضى.</span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 font-heading">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="btn-clinical-primary text-xs font-bold px-6 py-2.5 rounded-lg shadow-xs transition-all cursor-pointer"
                >
                  إرسال طلب الانضمام
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
