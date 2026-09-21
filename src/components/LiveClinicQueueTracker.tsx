import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  Clock, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Volume2, 
  VolumeX,
  ChevronRight,
  MapPin,
  Sparkles,
  Stethoscope,
  Bell
} from 'lucide-react';
import { Booking, ClinicQueueState, ClinicQueueDrift } from '../types';
import { apiService } from '../services/apiService';
import { getClinicDrift } from '../services/smartScheduleEngine';

interface LiveClinicQueueTrackerProps {
  booking: Booking;
  compact?: boolean;
}

export const LiveClinicQueueTracker: React.FC<LiveClinicQueueTrackerProps> = ({
  booking,
  compact = false
}) => {
  const userTicketNumber = booking.queueNumber || 1;
  const [queueState, setQueueState] = useState<ClinicQueueState | null>(null);
  const [driftInfo, setDriftInfo] = useState<ClinicQueueDrift | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [hasNotifiedTurn, setHasNotifiedTurn] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchQueue = useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    try {
      const live = await apiService.getClinicQueue(booking.doctorId);
      setQueueState(live);
      setDriftInfo(getClinicDrift(booking.doctorId));
      setFetchError(null);

      // Sound / Visual chime when it's the patient's turn
      if (
        (live.currentServingTicket === userTicketNumber || booking.status === 'in_consultation') && 
        soundEnabled && 
        !hasNotifiedTurn
      ) {
        try {
          const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
          osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15); // A5
          gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
          osc.start();
          osc.stop(audioCtx.currentTime + 0.5);
          setHasNotifiedTurn(true);
        } catch {
          // audio autoplay might be restricted
        }
      }
    } catch (e: any) {
      console.error('Error fetching live queue:', e);
      setFetchError('تعذر تحديث طابور العيادة المباشر حالياً. يتم عرض بيانات الانتظار المسجلة.');
    } finally {
      if (isManual) setIsRefreshing(false);
    }
  }, [booking.doctorId, booking.status, userTicketNumber, soundEnabled, hasNotifiedTurn]);

  useEffect(() => {
    fetchQueue(false);
    // Real-time live polling every 12 seconds
    const interval = setInterval(() => {
      fetchQueue(false);
    }, 12000);
    return () => clearInterval(interval);
  }, [fetchQueue]);

  const currentServing = queueState ? queueState.currentServingTicket : (booking.status === 'in_consultation' ? userTicketNumber : Math.max(1, userTicketNumber - 1));
  const isMyTurn = booking.status === 'in_consultation' || currentServing === userTicketNumber;
  const isCompleted = booking.status === 'completed';
  const patientsAhead = isCompleted ? 0 : Math.max(0, userTicketNumber - currentServing);
  const baseMinutesWait = patientsAhead * 12; // 12 mins per patient average
  const totalEstimatedWait = baseMinutesWait + (driftInfo?.isDelayed ? driftInfo.delayMinutes : 0);


  const handleManualRefresh = () => {
    fetchQueue(true);
  };

  if (compact) {
    return (
      <div className="bg-teal-50/60 dark:bg-slate-800/80 border border-teal-200/80 dark:border-slate-700 rounded-xl p-3 flex items-center justify-between gap-3 text-xs font-body">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-lg text-white flex items-center justify-center font-mono font-bold text-xs shadow-xs ${
            isMyTurn ? 'bg-teal-600 animate-pulse' : isCompleted ? 'bg-slate-500' : 'bg-[#088395]'
          }`}>
            #{userTicketNumber}
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-bold text-[#0A2540] dark:text-slate-200 font-heading">
              <span>الدور الحالي بالعيادة:</span>
              <span className="font-mono text-[#088395] dark:text-teal-400 font-bold">#{currentServing}</span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
              {isCompleted ? 'اكتملت الزيارة الطبية' : isMyTurn ? 'حان دورك للدخول إلى غرفة الكشف الآن!' : `أمامك ${patientsAhead} مرضى • الانتظار ~ ${totalEstimatedWait} دقيقة`}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleManualRefresh}
          className="p-1.5 text-slate-400 hover:text-[#088395] dark:hover:text-teal-400 transition-colors cursor-pointer"
          title="تحديث الدور المباشر"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-teal-200/80 dark:border-slate-800 p-5 shadow-xs font-body">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-teal-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-[#088395] text-white flex items-center justify-center shadow-xs">
              <Users className="w-4 h-4" />
            </div>
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#088395]"></span>
            </span>
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#0A2540] dark:text-white flex items-center gap-1.5 font-heading">
              <span>متابعة طابور العيادة المباشر</span>
              <span className="text-[10px] bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-bold px-2 py-0.5 rounded-full border border-teal-300 dark:border-teal-800">
                مباشر LIVE
              </span>
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">تحديث حي ومباشر مع نظام إدارة عيادة الطبيب</p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-heading">
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              soundEnabled 
                ? 'bg-teal-50 dark:bg-teal-950/60 text-[#088395] dark:text-teal-300 border-teal-300' 
                : 'bg-white dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'
            }`}
            title={soundEnabled ? 'التنبيه الصوتي مفعّل' : 'تفعيل التنبيه الصوتي عند حلول دورك'}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={handleManualRefresh}
            className="flex items-center gap-1 text-xs text-[#088395] dark:text-teal-400 bg-teal-50/50 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-slate-700 px-2.5 py-1.5 rounded-lg border border-teal-200 dark:border-slate-700 transition-colors font-bold cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>تحديث</span>
          </button>
        </div>
      </div>

      {fetchError && (
        <div className="mt-3 p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-xl text-amber-800 dark:text-amber-300 text-xs flex items-center justify-between gap-2 font-heading">
          <div className="flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>{fetchError}</span>
          </div>
          <button 
            type="button"
            onClick={() => fetchQueue(true)} 
            className="underline font-bold text-amber-900 dark:text-amber-200 hover:text-amber-700 cursor-pointer text-[11px] shrink-0"
          >
            إعادة التحديث
          </button>
        </div>
      )}

      {/* Main Queue Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-4 font-body">
        {/* User Ticket */}
        <div className={`bg-slate-50 dark:bg-slate-800/90 p-3.5 rounded-xl border text-center ${
          isMyTurn ? 'border-teal-500 ring-2 ring-teal-400/30' : 'border-teal-200/80 dark:border-teal-900/60'
        }`}>
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1 font-heading">رقم تذكرتك</span>
          <div className="font-mono text-2xl font-bold text-[#088395] dark:text-teal-400">
            #{userTicketNumber}
          </div>
          <span className="text-[10px] text-slate-600 dark:text-slate-300 font-medium">المريض: {booking.patientName}</span>
        </div>

        {/* Current Serving */}
        <div className="bg-slate-50 dark:bg-slate-800/90 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1 font-heading">الدور الحالي بالعيادة</span>
          <div className="font-mono text-2xl font-bold text-teal-600 dark:text-teal-400">
            #{currentServing}
          </div>
          <span className="text-[10px] text-teal-700 dark:text-teal-300 font-bold font-heading">
            {isMyTurn ? 'أنت داخل الكشف الآن' : 'في غرفة الكشف الآن'}
          </span>
        </div>

        {/* Patients Ahead */}
        <div className="col-span-2 sm:col-span-1 bg-slate-50 dark:bg-slate-800/90 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-center flex flex-col justify-center">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1 font-heading">المتبقي أمامك</span>
          <div className={`font-mono text-xl font-bold ${isMyTurn ? 'text-teal-600 dark:text-teal-400' : 'text-slate-800 dark:text-slate-200'}`}>
            {isCompleted ? 'مكتمل' : isMyTurn ? 'دورك الآن!' : `${patientsAhead} مرضى`}
          </div>
          <span className="text-[10px] text-slate-600 dark:text-slate-400 font-medium">
            {isCompleted ? 'شكراً لزيارتكم' : isMyTurn ? 'تفضل بالدخول' : `~ ${totalEstimatedWait} دقيقة متوقعة`}
          </span>
        </div>
      </div>

      {/* Delay Alert Broadcast if active */}
      {driftInfo?.isDelayed && !isCompleted && (
        <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 rounded-xl text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2.5 font-heading">
          <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-bold flex items-center justify-between">
              <span>تنويه من العيادة: تأخير متوقع قرابة ({driftInfo.delayMinutes} دقيقة)</span>
              <span className="text-[10px] bg-amber-200/70 dark:bg-amber-900 text-amber-900 dark:text-amber-200 px-2 py-0.5 rounded-md">
                معدّل
              </span>
            </div>
            <p className="text-[11px] text-amber-800 dark:text-amber-300 mt-0.5 font-body">
              {driftInfo.doctorMessage || 'تم تحديث ميعاد الدخول التقديري تلقائياً لتجنب الانتظار الطويل داخل العيادة.'}
            </p>
          </div>
        </div>
      )}

      {/* Visual Queue Progress Bar */}
      <div className="space-y-1.5 font-heading">
        <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 font-bold">
          <span>حالة الدور:</span>
          <span className={isMyTurn ? 'text-teal-600 font-bold' : ''}>
            {isCompleted ? 'انتهى الكشف' : isMyTurn ? 'حان دورك للدخول!' : patientsAhead === 1 ? 'أنت التالي مباشرة' : 'في قائمة الانتظار'}
          </span>
        </div>
        <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${
              isMyTurn 
                ? 'bg-teal-500 animate-pulse' 
                : 'bg-gradient-to-r from-[#088395] to-teal-400'
            }`}
            style={{ 
              width: isCompleted 
                ? '100%' 
                : `${Math.min(100, Math.max(10, (currentServing / Math.max(1, userTicketNumber)) * 100))}%` 
            }}
          />
        </div>
      </div>

      {/* Advisory status */}
      <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 font-body">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-[#088395] dark:text-teal-400 shrink-0" />
          <span>يرجى التواجد بقاعة الاستقبال قبل موعدك بـ 10 دقائق</span>
        </div>
        <span className="text-[11px] font-mono text-teal-600 dark:text-teal-400 font-bold flex items-center gap-1 font-heading">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-ping"></span>
          <span>متصل بالعيادة</span>
        </span>
      </div>
    </div>
  );
};

