import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Navigation, 
  Car, 
  ExternalLink, 
  Clock, 
  Compass, 
  ShieldCheck,
  Building2,
  Copy,
  Check
} from 'lucide-react';

interface ClinicNavigationModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctorName: string;
  address: string;
  city: string;
  area: string;
  landmark?: string;
}

export const ClinicNavigationModal: React.FC<ClinicNavigationModalProps> = ({
  isOpen,
  onClose,
  doctorName,
  address,
  city,
  area,
  landmark
}) => {
  const [copied, setCopied] = useState(false);
  const [estDistance, setEstDistance] = useState('7.4 كم');
  const [estDriveTime, setEstDriveTime] = useState('18 دقيقة');

  if (!isOpen) return null;

  const fullDestination = `${doctorName}, ${address}, ${area}, ${city}, Egypt`;
  const encodedDest = encodeURIComponent(fullDestination);

  // Google Maps Turn-by-Turn Navigation URL
  const googleMapsNavUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedDest}`;

  // Uber ride request deep link
  const uberUrl = `https://m.uber.com/ul/?action=setPickup&pickup=my_location&dropoff[formatted_address]=${encodedDest}`;

  // Careem ride link
  const careemUrl = `https://careem.me/`;

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(`${address} - ${landmark || ''} (${area}، ${city})`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto animate-in fade-in font-body">
      <div 
        className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-t-3xl sm:rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden my-0 sm:my-6 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#0A2540] text-white p-5 flex items-center justify-between border-b border-slate-800 font-heading shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">الملاحة وخط السير إلى العيادة</h2>
              <p className="text-xs text-teal-200">توجيه GPS مباشر وطلب سيارة انتقال</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-sm text-slate-700 dark:text-slate-300">
          
          {/* Destination Summary Card */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-xs text-[#088395] dark:text-teal-400 font-bold block font-heading">وجهة الزيارة:</span>
                <h3 className="font-bold text-[#0A2540] dark:text-white text-base font-heading">{doctorName}</h3>
              </div>
              <button
                type="button"
                onClick={handleCopyAddress}
                className="flex items-center gap-1 text-[11px] font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer font-heading"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-teal-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'تم النسخ' : 'نسخ العنوان'}</span>
              </button>
            </div>

            <div className="flex items-start gap-1.5 text-xs text-slate-600 dark:text-slate-400">
              <MapPin className="w-4 h-4 text-[#088395] dark:text-teal-400 shrink-0 mt-0.5" />
              <span>{address}</span>
            </div>

            {landmark && (
              <p className="text-xs text-slate-500 dark:text-slate-400 pr-5">
                علامة مميزة: {landmark}
              </p>
            )}

            {/* Estimated Drive Distance & Time */}
            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs font-heading">
              <div className="flex items-center gap-1 font-bold text-slate-800 dark:text-slate-200">
                <Compass className="w-3.5 h-3.5 text-[#088395] dark:text-teal-400" />
                <span>المسافة التقريبية: {estDistance}</span>
              </div>
              <div className="flex items-center gap-1 font-bold text-teal-700 dark:text-teal-400">
                <Clock className="w-3.5 h-3.5" />
                <span>زمن الرحلة: ~ {estDriveTime}</span>
              </div>
            </div>
          </div>

          {/* Navigation Action Buttons */}
          <div className="space-y-3 font-heading">
            {/* Google Maps Turn-by-turn */}
            <a
              href={googleMapsNavUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full btn-clinical-primary text-white font-bold text-sm py-3 px-4 rounded-xl transition-all shadow-xs flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <Navigation className="w-4 h-4" />
                </div>
                <div className="text-right">
                  <span className="block text-xs font-medium text-teal-100">بدء الملاحة المباشرة (GPS)</span>
                  <span className="text-sm">فتح خرائط Google Maps</span>
                </div>
              </div>
              <ExternalLink className="w-4 h-4" />
            </a>

            {/* Uber ride booking */}
            <a
              href={uberUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-[#0A2540] hover:bg-slate-900 active:scale-98 text-white font-bold text-xs sm:text-sm py-3 px-4 rounded-xl transition-all flex items-center justify-between cursor-pointer border border-slate-700"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                  <Car className="w-4 h-4 text-white" />
                </div>
                <div className="text-right">
                  <span className="block text-xs text-slate-300 font-normal">طلب مشوار فوري بالوجهة المحددة</span>
                  <span>حجز سيارة عبر أوبر (Uber)</span>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-400" />
            </a>
          </div>

          {/* Tips note */}
          <div className="p-3 bg-teal-50/50 dark:bg-slate-800/40 rounded-xl border border-teal-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-2 font-body">
            <ShieldCheck className="w-4 h-4 text-[#088395] dark:text-teal-400 shrink-0" />
            <span>يتم تحديد العنوان الجغرافي للعيادة بدقة لتفادي أي تأخير قبل موعد الكشف.</span>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-50 dark:bg-slate-950 p-4 border-t border-slate-200 dark:border-slate-800 text-right font-heading">
          <button
            type="button"
            onClick={onClose}
            className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs px-5 py-2.5 rounded-lg transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
