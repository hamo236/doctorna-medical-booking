import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  X, 
  Calendar, 
  FileText, 
  CheckCircle2, 
  ShieldCheck, 
  Volume2, 
  Settings, 
  Sparkles, 
  Clock,
  Check
} from 'lucide-react';
import { Booking } from '../types';
import { 
  getNotificationPreferences, 
  saveNotificationPreferences, 
  requestBrowserNotificationPermission, 
  playNotificationChime, 
  triggerLocalNotification,
  NotificationPreferences 
} from '../utils/notificationsService';
import { CustomEmptyState } from './CustomEmptyState';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookings: Booking[];
  providerNotice?: string | null;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  bookings,
  providerNotice
}) => {
  const [activeTab, setActiveTab] = useState<'alerts' | 'settings'>('alerts');
  const [prefs, setPrefs] = useState<NotificationPreferences>(getNotificationPreferences());
  const [permGranted, setPermGranted] = useState<boolean>(() => {
    return typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted';
  });
  const [testSent, setTestSent] = useState(false);

  const [cleared, setCleared] = useState(false);

  useEffect(() => {
    setPrefs(getNotificationPreferences());
  }, [isOpen]);

  if (!isOpen) return null;

  const activeBooking = bookings[0];
  const hasNotifications = !cleared && (Boolean(providerNotice) || Boolean(activeBooking) || true);

  const handleTogglePref = (key: keyof NotificationPreferences) => {
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated);
    saveNotificationPreferences(updated);
  };

  const handleEnableBrowserNotifications = async () => {
    const granted = await requestBrowserNotificationPermission();
    setPermGranted(granted);
    if (granted) {
      const updated = { ...prefs, browserNotificationsEnabled: true };
      setPrefs(updated);
      saveNotificationPreferences(updated);
      triggerLocalNotification('دكتورنا - تم تفعيل التنبيهات!', 'ستصلك الآن تذكيرات مواعيد العيادة ومتابعة طابور الانتظار.');
    }
  };

  const handleSendTestAlert = () => {
    playNotificationChime();
    triggerLocalNotification(
      'تنبيه تجريبي من دكتورنا 🩺', 
      'تم إعداد وتفعيل نغمة ورسائل التذكير بنجاح على جهازك!'
    );
    setTestSent(true);
    setTimeout(() => setTestSent(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200 font-body">
      <div 
        className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#0A2540] text-white p-5 flex items-center justify-between border-b border-slate-800 font-heading">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm">التنبيهات ومحرك التذكيرات الذكية</h3>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-1.5 font-heading">
          <button
            type="button"
            onClick={() => setActiveTab('alerts')}
            className={`flex-1 text-xs font-bold py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'alerts'
                ? 'bg-white dark:bg-slate-800 text-[#088395] dark:text-teal-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>الإشعارات الحالية</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`flex-1 text-xs font-bold py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'settings'
                ? 'bg-white dark:bg-slate-800 text-[#088395] dark:text-teal-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>إعدادات التذكير والتنبيه</span>
          </button>
        </div>

        {/* Tab 1: Current Alerts */}
        {activeTab === 'alerts' && (
          <div className="p-5 space-y-3 max-h-96 overflow-y-auto">
            {cleared ? (
              <CustomEmptyState
                type="notifications"
                title="تم الاطلاع على جميع التنبيهات"
                description="سجلك التنبيهي خالٍ من الإشعارات المعلقة حالياً. سنقوم بتنبيهك تلقائياً قبل موعد كشفك القادم."
                actionText="إغلاق"
                onAction={onClose}
              />
            ) : (
              <>
                <div className="flex items-center justify-between pb-1 font-heading">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">آخر المستجدات والمواعيد</span>
                  <button
                    type="button"
                    onClick={() => setCleared(true)}
                    className="text-[11px] font-bold text-[#088395] dark:text-teal-400 hover:underline cursor-pointer"
                  >
                    تحديد الكل كمقروء
                  </button>
                </div>

                {providerNotice && (
                  <div className="p-3.5 bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 rounded-xl animate-in fade-in">
                    <div className="flex items-center justify-between text-xs mb-1 font-heading">
                      <span className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        <span>طلب تعاقد عيادة قيد المراجعة</span>
                      </span>
                      <span className="text-[10px] text-amber-700 dark:text-amber-400">الآن</span>
                    </div>
                    <p className="text-xs text-amber-800 dark:text-amber-300/90 leading-relaxed font-body">
                      تم تسجيل طلب انضمام <strong>{providerNotice}</strong> إلى شبكة دكتورنا الطبية بنجاح، وسيتواصل معكم ممثل التعاقدات.
                    </p>
                  </div>
                )}

                {activeBooking && (
                  <div className="p-3.5 bg-teal-50/70 dark:bg-slate-800/80 border border-teal-100 dark:border-slate-700 rounded-xl">
                    <div className="flex items-center justify-between text-xs mb-1 font-heading">
                      <span className="font-bold text-[#088395] dark:text-teal-400 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>تذكير بموعد العيادة القادم</span>
                      </span>
                      <span className="text-[10px] bg-teal-100 dark:bg-teal-950/60 text-[#088395] dark:text-teal-300 px-2 py-0.5 rounded-full font-bold">اليوم</span>
                    </div>
                    <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-body">
                      موعدك مع <strong>{activeBooking.doctorName}</strong> مجدول لـ ({activeBooking.day} - {activeBooking.slot}) برقم حجز <strong className="font-mono text-[#088395] dark:text-teal-400">{activeBooking.id}</strong>.
                    </p>
                  </div>
                )}

                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl">
                  <div className="flex items-center justify-between text-xs mb-1 font-heading">
                    <span className="font-bold text-[#088395] dark:text-teal-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>تأكيد تسجيل الحجز بالعيادة</span>
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">منذ ساعة</span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-body">
                    تم تأكيد الموعد لدى سكرتارية العيادة بنجاح. لا يلزم الدفع مسبقاً، الدفع عند الحضور.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl">
                  <div className="flex items-center justify-between text-xs mb-1 font-heading">
                    <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-slate-500" />
                      <span>تحديث الملف الطبي الرقمي</span>
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">أمس</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-body">
                    تمت أرشفة وتوثيق روشتة علاجية جديدة بنجاح في ملفك الصحي الإلكتروني.
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        {/* Tab 2: Notification & Reminder Settings */}
        {activeTab === 'settings' && (
          <div className="p-5 space-y-4 max-h-96 overflow-y-auto font-heading">
            {/* Browser Permission Card */}
            <div className="p-4 bg-teal-50/60 dark:bg-slate-800/70 rounded-xl border border-teal-100 dark:border-slate-700 flex items-center justify-between gap-3">
              <div>
                <span className="font-bold text-[#0A2540] dark:text-white text-xs block">
                  إشعارات المتصفح الفورية (Push Alerts)
                </span>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 font-body">
                  استقبل تنبيهات سطح المكتب عند اقتراب دورك بالعيادة
                </p>
              </div>

              {permGranted ? (
                <span className="text-teal-700 dark:text-teal-400 bg-teal-100 dark:bg-teal-950/60 text-[11px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 shrink-0">
                  <Check className="w-3.5 h-3.5" />
                  <span>مفعلة</span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleEnableBrowserNotifications}
                  className="btn-clinical-primary text-xs font-bold px-3 py-1.5 rounded-lg transition-colors shrink-0 cursor-pointer"
                >
                  تفعيل الإذن
                </button>
              )}
            </div>

            {/* Notification Options Toggles */}
            <div className="space-y-2.5">
              <label className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer">
                <span className="text-xs text-slate-800 dark:text-slate-200 font-bold">
                  تذكير بالموعد قبل 24 ساعة
                </span>
                <input
                  type="checkbox"
                  checked={prefs.appointmentReminders24h}
                  onChange={() => handleTogglePref('appointmentReminders24h')}
                  className="w-4 h-4 text-[#088395] rounded focus:ring-teal-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer">
                <span className="text-xs text-slate-800 dark:text-slate-200 font-bold">
                  تنبيه الوصول للعيادة قبل الكشف بساعتين
                </span>
                <input
                  type="checkbox"
                  checked={prefs.appointmentReminders2h}
                  onChange={() => handleTogglePref('appointmentReminders2h')}
                  className="w-4 h-4 text-[#088395] rounded focus:ring-teal-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer">
                <span className="text-xs text-slate-800 dark:text-slate-200 font-bold">
                  تحديثات طابور العيادة المباشرة
                </span>
                <input
                  type="checkbox"
                  checked={prefs.queueAlerts}
                  onChange={() => handleTogglePref('queueAlerts')}
                  className="w-4 h-4 text-[#088395] rounded focus:ring-teal-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer">
                <span className="text-xs text-slate-800 dark:text-slate-200 font-bold flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>الصوت والنغمات التنبيهية</span>
                </span>
                <input
                  type="checkbox"
                  checked={prefs.soundEnabled}
                  onChange={() => handleTogglePref('soundEnabled')}
                  className="w-4 h-4 text-[#088395] rounded focus:ring-teal-500"
                />
              </label>
            </div>

            {/* Test Notification Sound */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleSendTestAlert}
                className="text-xs font-bold text-[#088395] dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-slate-800 px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer border border-teal-200 dark:border-slate-700"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>{testSent ? 'تم إرسال التنبيه التجريبي!' : 'تجربة نغمة الإشعار الآن'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 text-center font-heading">
          <button
            onClick={onClose}
            className="btn-clinical-primary w-full text-xs font-bold py-2.5 rounded-lg transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
