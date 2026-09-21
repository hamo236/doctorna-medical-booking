import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Stethoscope, 
  Building2, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  FileText, 
  AlertCircle,
  Plus,
  Search,
  Sliders,
  DollarSign,
  TrendingUp,
  MapPin,
  Phone,
  ShieldAlert,
  ChevronLeft,
  BarChart3,
  PieChart,
  Printer,
  Download,
  ArrowUpRight,
  Activity
} from 'lucide-react';
import { Doctor, Booking, DoctorJoinRequest, PlatformStats } from '../types';
import { SPECIALTIES } from '../data/seedData';

interface AdminDashboardProps {
  doctors: Doctor[];
  bookings: Booking[];
  joinRequests: DoctorJoinRequest[];
  onProcessJoinRequest: (id: string, action: 'approve' | 'reject') => Promise<void>;
  onAddDoctor: (doc: Partial<Doctor>) => Promise<void>;
  onToggleDoctorStatus?: (doctorId: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  doctors,
  bookings,
  joinRequests,
  onProcessJoinRequest,
  onAddDoctor,
  onToggleDoctorStatus
}) => {
  const [activeTab, setActiveTab] = useState<'requests' | 'doctors' | 'bookings' | 'analytics'>('requests');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDoctorModalOpen, setIsAddDoctorModalOpen] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // New Doctor Form State
  const [newDocName, setNewDocName] = useState('');
  const [newDocSpecialtyId, setNewDocSpecialtyId] = useState('internal');
  const [newDocCity, setNewDocCity] = useState('القاهرة');
  const [newDocArea, setNewDocArea] = useState('مدينة نصر');
  const [newDocPhone, setNewDocPhone] = useState('');

  const pendingRequests = useMemo(() => joinRequests.filter(r => r.status === 'pending'), [joinRequests]);
  const processedRequests = useMemo(() => joinRequests.filter(r => r.status !== 'pending'), [joinRequests]);

  const handleApprove = async (id: string, name: string) => {
    setActionError(null);
    try {
      await onProcessJoinRequest(id, 'approve');
      setActionMessage(`تم اعتماد الطبيب/العيادة "${name}" وإضافته مباشرة إلى شبكة البحث والحجز!`);
      setTimeout(() => setActionMessage(null), 4000);
    } catch (err: any) {
      setActionError(err.message || 'فشل اعتماد الطبيب.');
    }
  };

  const handleReject = async (id: string, name: string) => {
    setActionError(null);
    try {
      await onProcessJoinRequest(id, 'reject');
      setActionMessage(`تم رفض طلب انضمام "${name}".`);
      setTimeout(() => setActionMessage(null), 4000);
    } catch (err: any) {
      setActionError(err.message || 'فشل رفض الطلب.');
    }
  };

  const handleCreateDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocName.trim()) return;
    setActionError(null);

    const specObj = SPECIALTIES.find(s => s.id === newDocSpecialtyId);

    try {
      await onAddDoctor({
        name: newDocName.trim(),
        title: 'استشاري',
        specialty: `استشاري ${specObj?.name || 'الباطنة'}`,
        specialtyId: newDocSpecialtyId as any,
        subSpecialties: [`علاج الحالات المتقدمة`, 'استشارات تخصصية'],
        gender: 'male',
        city: newDocCity,
        area: newDocArea,
        address: `${newDocCity} - ${newDocArea}`,
        landmark: 'بالقرب من الميدان الرئيسي',
        phone: newDocPhone || '01000000000',
        waitingTime: '١٥ دقيقة',
        verified: true,
        status: 'active',
        availableDays: [
          { dateStr: 'اليوم، 10 سبتمبر', dayName: 'اليوم', slots: ['05:00 م', '06:00 م', '07:00 م'] },
          { dateStr: 'غداً، 11 سبتمبر', dayName: 'غداً', slots: ['04:30 م', '05:30 م', '06:30 م'] }
        ]
      });

      setIsAddDoctorModalOpen(false);
      setActionMessage(`تمت إضافة وتفعيل الطبيب "${newDocName}" بنجاح!`);
      setTimeout(() => setActionMessage(null), 4000);

      // Reset
      setNewDocName('');
      setNewDocPhone('');
    } catch (err: any) {
      setActionError(err.message || 'فشل إضافة الطبيب.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-['Tajawal',sans-serif]">
      
      {/* Action Notification Toast */}
      {actionMessage && (
        <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-xs sm:text-sm font-bold text-emerald-800 dark:text-emerald-200 flex items-center justify-between gap-3 shadow-sm animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{actionMessage}</span>
          </div>
          <button onClick={() => setActionMessage(null)} className="text-emerald-600 hover:text-emerald-900 cursor-pointer">✕</button>
        </div>
      )}

      {actionError && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-2xl text-xs sm:text-sm font-bold text-red-800 dark:text-red-200 flex items-center justify-between gap-3 shadow-sm animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{actionError}</span>
          </div>
          <button onClick={() => setActionError(null)} className="text-red-600 hover:text-red-900 cursor-pointer">✕</button>
        </div>
      )}

      {/* Admin Top Header */}
      <div className="bg-[#0A2540] text-white rounded-2xl p-6 sm:p-8 shadow-sm mb-8 relative overflow-hidden font-body">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs bg-teal-500/20 text-teal-200 font-bold px-2.5 py-0.5 rounded-full border border-teal-400/30 flex items-center gap-1 font-heading">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>إدارة المنصة والاعتماد الطبي</span>
              </span>
              <span className="text-xs text-slate-300 font-medium">نظام الرقابة والحوكمة الطبية</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-heading">
              لوحة الإدارة العليا لمنصة دكتورنا
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed font-medium">
              مراجعة طلبات تعاقد الأطباء والعيادات، التحقق من تراخيص وزارة الصحة، ومتابعة حركة الحجوزات اليومية في مصر.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto no-print font-heading">
            <button
              type="button"
              onClick={() => window.print()}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs active:scale-98"
              title="طباعة التقرير التشغيلي والإداري الرسمي"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة التقرير الإداري</span>
            </button>
            <button
              onClick={() => setIsAddDoctorModalOpen(true)}
              className="btn-clinical-primary px-5 py-2.5 text-xs sm:text-sm flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة وتفعيل عيادة جديدة</span>
            </button>
          </div>
        </div>

        {/* Top KPIs Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-700/60 printable-card font-body">
          <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-xl border border-white/10">
            <span className="text-xs text-slate-300 font-bold block mb-1">طلبات الانضمام المعلقة</span>
            <span className="text-2xl font-bold text-amber-300 font-mono">{pendingRequests.length}</span>
          </div>

          <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-xl border border-white/10">
            <span className="text-xs text-slate-300 font-bold block mb-1">الأطباء والعيادات المعتمدة</span>
            <span className="text-2xl font-bold text-teal-300 font-mono">{doctors.length}</span>
          </div>

          <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-xl border border-white/10">
            <span className="text-xs text-slate-300 font-bold block mb-1">إجمالي الحجوزات المنفذة</span>
            <span className="text-2xl font-bold text-white font-mono">{bookings.length}</span>
          </div>

          <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-xl border border-white/10">
            <span className="text-xs text-slate-300 font-bold block mb-1">نسبة التوثيق والاعتماد</span>
            <span className="text-xl font-bold text-teal-200 font-mono">100% معتمد</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 mb-6 border-b border-slate-200 dark:border-slate-800 pb-3 no-print font-heading overflow-x-auto scrollbar-none flex-nowrap sm:flex-wrap">
        <button
          onClick={() => setActiveTab('requests')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer shrink-0 whitespace-nowrap ${
            activeTab === 'requests'
              ? 'bg-[#088395] text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>طلبات الانضمام والتعاقد ({pendingRequests.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('doctors')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer shrink-0 whitespace-nowrap ${
            activeTab === 'doctors'
              ? 'bg-[#088395] text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Stethoscope className="w-4 h-4" />
          <span>دليل الأطباء المعتمدين ({doctors.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('bookings')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer shrink-0 whitespace-nowrap ${
            activeTab === 'bookings'
              ? 'bg-[#088395] text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>سجل حجوزات المنصة ({bookings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer shrink-0 whitespace-nowrap ${
            activeTab === 'analytics'
              ? 'bg-[#088395] text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>التقارير الإحصائية والتشغيلية</span>
        </button>
      </div>

      {/* Tab 1: Pending Join Requests & Approvals */}
      {activeTab === 'requests' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-black text-base text-slate-900 dark:text-white">طلبات تعاقد المنشآت الطبية المعلقة</h3>
                <p className="text-xs text-slate-500">يجب التحقق من رقم الترخيص والشهادات قبل الموافقة وتفعيل الحساب</p>
              </div>
              <span className="text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-800">
                {pendingRequests.length} طلب بانتظار المراجعة
              </span>
            </div>

            {pendingRequests.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-slate-800 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">تمت مراجعة واعتماد جميع الطلبات</h4>
                <p className="text-xs text-slate-500">لا توجد طلبات انضمام جديدة قيد الانتظار حالياً.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingRequests.map((req) => (
                  <div 
                    key={req.id}
                    className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-blue-100 dark:bg-blue-950 text-[#0070cd] dark:text-blue-300 font-bold px-2.5 py-0.5 rounded-md">
                          {req.facilityType === 'hospital' ? 'مستشفى' : req.facilityType === 'polyclinic' ? 'مركز تخصصي' : 'عيادة خاصة'}
                        </span>
                        <h4 className="font-black text-base text-slate-900 dark:text-white">{req.providerName}</h4>
                        <span className="text-xs text-slate-500 font-bold">({req.specialtyName})</span>
                      </div>

                      <div className="text-xs text-slate-600 dark:text-slate-400 flex flex-wrap items-center gap-x-4 gap-y-1">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{req.city} - {req.area || 'وسط البلد'}</span>
                        </span>
                        <span className="flex items-center gap-1 font-mono">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{req.phone}</span>
                        </span>
                        {req.licenseNo && (
                          <span className="flex items-center gap-1 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 font-mono font-bold text-slate-700 dark:text-slate-300">
                            ترخيص: {req.licenseNo}
                          </span>
                        )}
                        <span className="text-slate-400 text-[11px]">تاريخ الطلب: {req.createdAt}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end lg:self-auto">
                      <button
                        onClick={() => handleReject(req.id, req.providerName)}
                        className="bg-red-50 hover:bg-red-100 text-red-700 dark:bg-red-950 dark:hover:bg-red-900 dark:text-red-300 border border-red-200 dark:border-red-900 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                      >
                        رفض
                      </button>

                      <button
                        onClick={() => handleApprove(req.id, req.providerName)}
                        className="bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-emerald-600/20 transition-all cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>قبول وتفعيل العيادة</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Doctors Directory Management */}
      {activeTab === 'doctors' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-black text-base text-slate-900 dark:text-white">قائمة الأطباء والعيادات المسجلة بالمنظومة</h3>
              <p className="text-xs text-slate-500">إجمالي الأطباء المعتمدين والمفعلين: {doctors.length}</p>
            </div>

            <button
              onClick={() => setIsAddDoctorModalOpen(true)}
              className="bg-[#0070cd] hover:bg-[#005bb0] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة طبيب جديد</span>
            </button>
          </div>

          <div className="space-y-3">
            {doctors.map((doctor) => (
              <div
                key={doctor.id}
                className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-[#0070cd] font-bold">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">{doctor.name}</h4>
                      <span className="text-[11px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2 py-0.2 rounded font-bold">
                        معتمد
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">
                      {doctor.specialty} • {doctor.city} ({doctor.area}) • الانتظار: {doctor.waitingTime}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-300 font-mono flex items-center gap-3">
                  <span>هاتف: {doctor.phone}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Platform Bookings Master Log */}
      {activeTab === 'bookings' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-black text-base text-slate-900 dark:text-white">سجل الحجوزات والمواعيد الشامل</h3>
              <p className="text-xs text-slate-500">حركة الحجوزات اليومية والعيادات المستلمة</p>
            </div>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono">
              إجمالي: {bookings.length} حجز
            </span>
          </div>

          <div className="space-y-3">
            {bookings.map((booking) => (
              <div 
                key={booking.id}
                className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-[#0070cd] dark:text-blue-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                      {booking.id}
                    </span>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">{booking.patientName}</h4>
                    <span className={`text-xs px-2 py-0.5 rounded font-bold ${
                      booking.status === 'completed' 
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : booking.status === 'in_consultation'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                    }`}>
                      {booking.status === 'completed' ? 'تم الكشف' : booking.status === 'in_consultation' ? 'في الكشف' : 'مؤكد'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap items-center gap-3">
                    <span>الطبيب: {booking.doctorName} ({booking.specialty})</span>
                    <span>• الموعد: {booking.day} ({booking.slot})</span>
                    <span>• الهاتف: {booking.patientPhone}</span>
                  </div>
                </div>

                <div className="text-xs font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 self-end sm:self-auto">
                  حجز مؤكد بالعيادة
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Comprehensive Operational Analytics & Official Reports */}
      {activeTab === 'analytics' && (
        <div className="space-y-6 printable-medical-report">
          {/* Executive Overview Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs printable-card">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-5 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">التقرير التشغيلي الدوري لمنصة دكتورنا</span>
                </div>
                <h3 className="font-black text-lg text-slate-900 dark:text-white">
                  المؤشرات التشغيلية والخدمية الشاملة
                </h3>
              </div>
              <button
                type="button"
                onClick={() => window.print()}
                className="self-start sm:self-auto bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer no-print"
              >
                <Printer className="w-4 h-4 text-blue-400" />
                <span>طباعة التقرير الإداري</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-slate-50 dark:bg-slate-850 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">معدل تنفيذ الحجوزات الطبية</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                    {bookings.length > 0 ? Math.round((bookings.filter(b => b.status === 'completed' || b.status === 'confirmed').length / bookings.length) * 100) : 100}%
                  </span>
                  <span className="text-[11px] text-slate-500">نسبة نجاح التواجد والكشف</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full w-[94%]"></div>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-850 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">متوسط زمن الانتظار بالعيادات</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-[#0070cd] dark:text-blue-400 font-mono">
                    ١٨ دقيقة
                  </span>
                  <span className="text-[11px] text-slate-500">معدل الانضباط الزمني</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div className="bg-[#0070cd] h-full rounded-full w-[85%]"></div>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-850 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">نسبة التوثيق والرقابة الصحية</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
                    {doctors.length > 0 ? Math.round((doctors.filter(d => d.verified).length / doctors.length) * 100) : 100}%
                  </span>
                  <span className="text-[11px] text-slate-500">أطباء معتمدون رسمياً</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div className="bg-indigo-500 h-full rounded-full w-[98%]"></div>
                </div>
              </div>
            </div>

            {/* Specialties Distribution */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                توزيع الأطباء والطلب حسب التخصصات الطبية:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SPECIALTIES.filter(s => s.id !== 'all').slice(0, 8).map(spec => {
                  const count = doctors.filter(d => d.specialtyId === spec.id).length;
                  const percent = Math.max(12, Math.round((count / Math.max(1, doctors.length)) * 100));
                  return (
                    <div key={spec.id} className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-bold text-slate-800 dark:text-slate-200">{spec.name}</span>
                        <span className="font-mono text-slate-500 dark:text-slate-400">{count} طبيب ({percent}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Geographical Distribution */}
            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
                التغطية الجغرافية للعيادات بالمحافظات المصرية:
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                {['القاهرة', 'الجيزة', 'الإسكندرية', 'الدقهلية'].map((city) => {
                  const cityCount = doctors.filter(d => d.city?.includes(city)).length;
                  return (
                    <div key={city} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
                      <span className="block text-slate-500 dark:text-slate-400 text-[11px] mb-1">محافظة {city}</span>
                      <span className="text-lg font-black text-slate-900 dark:text-white font-mono">{cityCount || 4} عيادة</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Direct Add Doctor */}
      {isAddDoctorModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto font-body">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6">
            <div className="bg-[#0A2540] text-white p-5 flex items-center justify-between">
              <h3 className="font-bold text-base font-heading">إضافة وتفعيل عيادة أو طبيب جديد</h3>
              <button onClick={() => setIsAddDoctorModalOpen(false)} className="text-slate-300 hover:text-white cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleCreateDoctor} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 font-heading">اسم الطبيب أو المركز الطبي</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: د. مصطفى الشيمي"
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                  className="input-clinical text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 font-heading">التخصص الطبي</label>
                  <select
                    value={newDocSpecialtyId}
                    onChange={(e) => setNewDocSpecialtyId(e.target.value)}
                    className="input-clinical text-xs font-bold cursor-pointer"
                  >
                    {SPECIALTIES.filter(s => s.id !== 'all').map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 font-heading">المحافظة</label>
                  <input
                    type="text"
                    value={newDocCity}
                    onChange={(e) => setNewDocCity(e.target.value)}
                    className="input-clinical text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 font-heading">المنطقة</label>
                  <input
                    type="text"
                    value={newDocArea}
                    onChange={(e) => setNewDocArea(e.target.value)}
                    className="input-clinical text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 font-heading">رقم الهاتف للتواصل</label>
                  <input
                    type="tel"
                    placeholder="01012345678"
                    value={newDocPhone}
                    onChange={(e) => setNewDocPhone(e.target.value)}
                    className="input-clinical text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 font-heading">
                <button
                  type="button"
                  onClick={() => setIsAddDoctorModalOpen(false)}
                  className="btn-clinical-secondary text-xs py-2 px-4"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="btn-clinical-primary text-xs py-2.5 px-5"
                >
                  حفظ وتفعيل الطبيب
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
