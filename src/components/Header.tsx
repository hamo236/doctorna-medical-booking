import React, { useState } from 'react';
import { 
  Stethoscope, 
  Calendar, 
  FileText, 
  PhoneCall, 
  Bell, 
  Menu, 
  X, 
  HelpCircle,
  ShieldCheck,
  Moon,
  Sun,
  ShieldAlert,
  Sparkles,
  ArrowUpRight,
  MapPin,
  User as UserIcon,
  Compass,
  Home
} from 'lucide-react';
import { User } from 'firebase/auth';
import { motion, AnimatePresence } from 'motion/react';
import { ActiveView, ThemeMode, UserRole, AccessibilityPreferences } from '../types';
import { AccessibilityBar } from './AccessibilityBar';
import { RoleProtectionModal } from './RoleProtectionModal';

interface HeaderProps {
  currentView: ActiveView;
  navigate: (view: ActiveView) => void;
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  bookingsCount: number;
  recordsCount: number;
  onOpenNotifications: () => void;
  unreadNotifications: number;
  onOpenSymptomGuide: () => void;
  onOpenJoinDoctor: () => void;
  onOpenPatientHelp: () => void;
  onOpenEmergency: () => void;
  onOpenMaps?: () => void;
  onOpenAuth?: () => void;
  currentUser?: User | null;
  theme: ThemeMode;
  toggleTheme: () => void;
  accessibilityPreferences: AccessibilityPreferences;
  onUpdateAccessibility: (updated: Partial<AccessibilityPreferences>) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  navigate,
  currentRole,
  onRoleChange,
  bookingsCount,
  recordsCount,
  onOpenNotifications,
  unreadNotifications,
  onOpenSymptomGuide,
  onOpenJoinDoctor,
  onOpenPatientHelp,
  onOpenEmergency,
  onOpenMaps,
  onOpenAuth,
  currentUser,
  theme,
  toggleTheme,
  accessibilityPreferences,
  onUpdateAccessibility
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pendingProtectedRole, setPendingProtectedRole] = useState<UserRole | null>(null);

  const requestRoleSwitch = (targetRole: UserRole) => {
    if (targetRole === 'patient') {
      try {
        sessionStorage.removeItem('carepro_role_secret');
      } catch (e) {}
      onRoleChange('patient');
      if (currentView === 'DOCTOR_DASHBOARD' || currentView === 'ADMIN_DASHBOARD') {
        navigate('HOME');
      }
      return;
    }
    // If already in target role, just navigate
    if (currentRole === targetRole) {
      if (targetRole === 'doctor') navigate('DOCTOR_DASHBOARD');
      if (targetRole === 'admin') navigate('ADMIN_DASHBOARD');
      return;
    }
    // Intercept with passcode confirmation modal for security
    setPendingProtectedRole(targetRole);
  };

  const handleRoleAuthSuccess = (role: UserRole) => {
    onRoleChange(role);
    if (role === 'doctor') navigate('DOCTOR_DASHBOARD');
    if (role === 'admin') navigate('ADMIN_DASHBOARD');
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-clinical-surface/90 border-b border-clinical-border shadow-[0_2px_12px_rgba(10,37,64,0.04)] font-body transition-colors duration-300">
      
      {/* Top Ergonomics & Utility Bar */}
      <div className="bg-[#0A2540] dark:bg-[#061321] text-slate-200 text-xs py-1.5 px-4 hidden md:block border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2 text-white font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="text-slate-200 font-heading">منظومة حجز العيادات والرعاية الصحية المعتمدة</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-[11px]">
            {/* Visual Ergonomics Controller */}
            <AccessibilityBar
              preferences={accessibilityPreferences}
              onUpdatePreferences={onUpdateAccessibility}
            />

            {/* Role Switcher Pill Container */}
            <div className="flex items-center gap-1 bg-slate-900/90 p-0.5 rounded-lg border border-slate-700/80 font-heading">
              <span className="text-slate-400 text-[10px] px-2 font-medium">الواجهة:</span>
              <button
                type="button"
                onClick={() => requestRoleSwitch('patient')}
                className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                  currentRole === 'patient'
                    ? 'bg-[#088395] text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                مريض
              </button>
              <button
                type="button"
                onClick={() => requestRoleSwitch('doctor')}
                className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                  currentRole === 'doctor'
                    ? 'bg-[#088395] text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                عيادة / طبيب
              </button>
              <button
                type="button"
                onClick={() => requestRoleSwitch('admin')}
                className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                  currentRole === 'admin'
                    ? 'bg-[#088395] text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                إدارة المنصة
              </button>
            </div>

            <span className="text-slate-600">|</span>
            <button
              type="button"
              onClick={onOpenJoinDoctor}
              className="hover:text-white cursor-pointer transition-colors text-teal-300 font-bold flex items-center gap-1 font-heading"
            >
              <span>انضم كطبيب</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Apple Clean Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          
          {/* Brand Logo with Clean Modern Typography */}
          <div 
            id="brand-logo"
            onClick={() => navigate('HOME')} 
            className="flex items-center gap-2 sm:gap-3 cursor-pointer group select-none"
          >
            <div className="w-9 h-9 md:w-11 md:h-11 rounded-xl bg-[#0A2540] dark:bg-teal-950/70 border border-teal-600/30 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform duration-200">
              <Stethoscope className="w-5 h-5 md:w-6 md:h-6 text-teal-400" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 md:gap-2">
                <span className="font-bold text-lg md:text-2xl tracking-tight text-[#0A2540] dark:text-white font-heading">دكتورنا</span>
              </div>
              <span className="text-[10px] md:text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">الرعاية الصحية الرقمية الأذكى في مصر</span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-100 dark:bg-slate-900/80 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold font-heading">
            <button 
              id="nav-home"
              onClick={() => navigate('HOME')}
              className={`px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
                currentView === 'HOME' 
                  ? 'bg-white dark:bg-slate-800 text-[#088395] dark:text-teal-400 shadow-xs font-bold' 
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              الرئيسية
            </button>

            <button 
              id="nav-doctors"
              onClick={() => navigate('SEARCH')}
              className={`px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                currentView === 'SEARCH' 
                  ? 'bg-white dark:bg-slate-800 text-[#088395] dark:text-teal-400 shadow-xs font-bold' 
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Stethoscope className="w-4 h-4 opacity-70" />
              <span>دليل الأطباء</span>
            </button>

            <button 
              id="nav-records"
              onClick={() => navigate('RECORDS')}
              className={`px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                currentView === 'RECORDS' 
                  ? 'bg-white dark:bg-slate-800 text-[#088395] dark:text-teal-400 shadow-xs font-bold' 
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4 opacity-70" />
              <span>الملف الطبي</span>
              {recordsCount > 0 && (
                <span className="bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-[10px] font-bold px-1.5 py-0.2 rounded-full font-mono">
                  {recordsCount}
                </span>
              )}
            </button>

            {/* Doctor Portal Nav Link */}
            <button 
              id="nav-doctor-dashboard"
              onClick={() => {
                onRoleChange('doctor');
                navigate('DOCTOR_DASHBOARD');
              }}
              className={`px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                currentView === 'DOCTOR_DASHBOARD' 
                  ? 'bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-xs font-bold' 
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Stethoscope className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>بوابة الطبيب</span>
            </button>

            {/* Admin Portal Nav Link */}
            <button 
              id="nav-admin-dashboard"
              onClick={() => {
                onRoleChange('admin');
                navigate('ADMIN_DASHBOARD');
              }}
              className={`px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                currentView === 'ADMIN_DASHBOARD' 
                  ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-xs font-bold' 
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>الإدارة</span>
            </button>
          </nav>

          {/* Right Action Icons & Theme Toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Google Maps Grounding Explorer */}
            {onOpenMaps && (
              <button 
                id="btn-open-maps"
                onClick={onOpenMaps}
                className="hidden md:flex items-center gap-1.5 text-xs font-bold text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900/60 px-3 py-2 rounded-lg border border-teal-200/80 dark:border-teal-800/80 transition-all cursor-pointer shadow-xs active:scale-95 font-heading"
                title="استكشاف خريطة العيادات والمستشفيات الحية عبر Google Maps"
              >
                <Compass className="w-3.5 h-3.5 text-[#088395] dark:text-teal-400" />
                <span>خريطة العيادات الحية</span>
              </button>
            )}

            {/* Symptom triage helper */}
            <button 
              id="nav-symptoms-guide"
              onClick={onOpenSymptomGuide}
              className="hidden xl:flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 transition-all cursor-pointer font-heading"
            >
              <HelpCircle className="w-3.5 h-3.5 text-[#088395] dark:text-teal-400" />
              <span>دليل التخصصات</span>
            </button>

            {/* Firebase User Auth Pill / Button */}
            {onOpenAuth && (
              <button
                id="btn-auth-user"
                onClick={onOpenAuth}
                className="hidden lg:flex items-center justify-center gap-1.5 p-1.5 lg:px-3 lg:py-2 text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl border border-slate-200 dark:border-slate-700 transition-all cursor-pointer active:scale-95 font-heading shrink-0"
                title={currentUser ? `مسجل باسم ${currentUser.displayName || currentUser.email}` : 'تسجيل الدخول'}
              >
                {currentUser ? (
                  <>
                    {currentUser.photoURL ? (
                      <img 
                        src={currentUser.photoURL} 
                        alt="User" 
                        className="w-5 h-5 rounded-full object-cover border border-emerald-500 shrink-0" 
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-[#088395] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                        {currentUser.displayName ? currentUser.displayName[0] : 'U'}
                      </div>
                    )}
                    <span className="hidden sm:inline text-[11px] truncate max-w-[90px]">
                      {currentUser.displayName?.split(' ')[0] || 'حسابي'}
                    </span>
                    <span className="hidden sm:inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
                  </>
                ) : (
                  <>
                    <UserIcon className="w-4 h-4 text-slate-600 dark:text-slate-300 shrink-0" />
                    <span className="hidden sm:inline text-[11px]">دخول</span>
                  </>
                )}
              </button>
            )}

            {/* Custom Theme Switch (Light / Dark) - Restored for all views with elegant mobile scale down */}
            <div className="hidden lg:flex items-center shrink-0">
              <label 
                id="btn-theme-toggle" 
                className="theme-switch flex items-center cursor-pointer select-none"
                title={theme === 'dark' ? 'التحويل للوضع الطبيعي (النهاري)' : 'التحويل للوضع الليلي'}
              >
                <input 
                  type="checkbox" 
                  className="theme-switch__checkbox" 
                  checked={theme === 'dark'} 
                  onChange={toggleTheme}
                />
                <div className="theme-switch__container">
                  <div className="theme-switch__clouds"></div>
                  <div className="theme-switch__stars-container">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 144 55" fill="none">
                      <path fillRule="evenodd" clipRule="evenodd" d="M135.831 3.00688C135.055 3.85027 134.111 4.29946 133 4.35447C134.111 4.40947 135.055 4.85867 135.831 5.71123C136.607 6.55462 136.996 7.56303 136.996 8.72727C136.996 7.95722 137.172 7.25134 137.525 6.59129C137.886 5.93124 138.372 5.39954 138.98 5.00535C139.598 4.60199 140.268 4.39114 141 4.35447C139.88 4.2903 138.936 3.85027 138.16 3.00688C137.384 2.16348 136.996 1.16425 136.996 0C136.996 1.16425 136.607 2.16348 135.831 3.00688ZM31 23.3545C32.1114 23.2995 33.0551 22.8503 33.8313 22.0069C34.6075 21.1635 34.9956 20.1642 34.9956 19C34.9956 20.1642 35.3837 21.1635 36.1599 22.0069C36.9361 22.8503 37.8798 23.2903 39 23.3545C38.2679 23.3911 37.5976 23.602 36.9802 24.0053C36.3716 24.3995 35.8864 24.9312 35.5248 25.5913C35.172 26.2513 34.9956 26.9572 34.9956 27.7273C34.9956 26.563 34.6075 25.5546 33.8313 24.7112C33.0551 23.8587 32.1114 23.4095 31 23.3545ZM0 36.3545C1.11136 36.2995 2.05513 35.8503 2.83131 35.0069C3.6075 34.1635 3.99559 33.1642 3.99559 32C3.99559 33.1642 4.38368 34.1635 5.15987 35.0069C5.93605 35.8503 6.87982 36.2903 8 36.3545C7.26792 36.3911 6.59757 36.602 5.98015 37.0053C5.37155 37.3995 4.88644 37.9312 4.52481 38.5913C4.172 39.2513 3.99559 39.9572 3.99559 40.7273C3.99559 39.563 3.6075 38.5546 2.83131 37.7112C2.05513 36.8587 1.11136 36.4095 0 36.3545ZM56.8313 24.0069C56.0551 24.8503 55.1114 25.2995 54 25.3545C55.1114 25.4095 56.0551 25.8587 56.8313 26.7112C57.6075 27.5546 57.9956 28.563 57.9956 29.7273C57.9956 28.9572 58.172 28.2513 58.5248 27.5913C58.8864 26.9312 59.3716 26.3995 59.9802 26.0053C60.5976 25.602 61.2679 25.3911 62 25.3545C60.8798 25.2903 59.9361 24.8503 59.1599 24.0069C58.3837 23.1635 57.9956 22.1642 57.9956 21C57.9956 22.1642 57.6075 23.1635 56.8313 24.0069ZM81 25.3545C82.1114 25.2995 83.0551 24.8503 83.8313 24.0069C84.6075 23.1635 84.9956 22.1642 84.9956 21C84.9956 22.1642 85.3837 23.1635 86.1599 24.0069C86.9361 24.8503 87.8798 25.2903 89 25.3545C88.2679 25.3911 87.5976 25.602 86.9802 26.0053C86.3716 26.3995 85.8864 26.9312 85.5248 27.5913C85.172 28.2513 84.9956 28.9572 84.9956 29.7273C84.9956 28.563 84.6075 27.5546 83.8313 26.7112C83.0551 25.8587 82.1114 25.4095 81 25.3545ZM136 36.3545C137.111 36.2995 138.055 35.8503 138.831 35.0069C139.607 34.1635 139.996 33.1642 139.996 32C139.996 33.1642 140.384 34.1635 141.16 35.0069C141.936 35.8503 142.88 36.2903 144 36.3545C143.268 36.3911 142.598 36.602 141.98 37.0053C141.372 37.3995 140.886 37.9312 140.525 38.5913C140.172 39.2513 139.996 39.9572 139.996 40.7273C139.996 39.563 139.607 38.5546 138.831 37.7112C138.055 36.8587 137.111 36.4095 136 36.3545ZM101.831 49.0069C101.055 49.8503 100.111 50.2995 99 50.3545C100.111 50.4095 101.055 50.8587 101.831 51.7112C102.607 52.5546 102.996 53.563 102.996 54.7273C102.996 53.9572 103.172 53.2513 103.525 52.5913C103.886 51.9312 104.372 51.3995 104.98 51.0053C105.598 50.602 106.268 50.3911 107 50.3545C105.88 50.2903 104.936 49.8503 104.16 49.0069C103.384 48.1635 102.996 47.1642 102.996 46C102.996 47.1642 102.607 48.1635 101.831 49.0069Z" fill="currentColor" />
                    </svg>
                  </div>
                  <div className="theme-switch__circle-container">
                    <div className="theme-switch__sun-moon-container">
                      <div className="theme-switch__moon">
                        <div className="theme-switch__spot"></div>
                        <div className="theme-switch__spot"></div>
                        <div className="theme-switch__spot"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </label>
            </div>

            {/* Notification bell */}
            <button 
              id="btn-notifications"
              onClick={onOpenNotifications}
              className="relative w-11 h-11 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:text-[#088395] dark:hover:text-teal-300 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-all cursor-pointer border border-slate-200 dark:border-slate-700/80 shadow-xs active:scale-95 shrink-0"
              title="التنبيهات والمواعيد"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifications > 0 && (
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#088395] dark:bg-teal-400 rounded-full ring-2 ring-white dark:ring-slate-900 animate-pulse"></span>
              )}
            </button>

            {/* My Appointments Button */}
            <button
              id="btn-my-bookings"
              onClick={() => navigate('BOOKINGS')}
              className={`hidden md:flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-150 cursor-pointer shadow-xs active:scale-95 font-heading ${
                currentView === 'BOOKINGS'
                  ? 'btn-clinical-primary'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>حجوزاتي</span>
              {bookingsCount > 0 && (
                <span className="bg-white/20 dark:bg-white/20 text-current text-[11px] px-1.5 py-0.2 rounded-full font-mono font-bold">
                  {bookingsCount}
                </span>
              )}
            </button>

            {/* Mobile menu hamburger */}
            <button 
              id="btn-mobile-menu"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden w-11 h-11 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer transition-colors shrink-0"
              aria-expanded={mobileMenuOpen}
              aria-label="قائمة التحكم الرئيسية"
            >
              {mobileMenuOpen ? <X className="w-6 h-6 animate-in spin-in-12 duration-200" /> : <Menu className="w-6 h-6 animate-in fade-in duration-200" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu - Animated and Touch-Optimized with a clear, stackable structure */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="lg:hidden overflow-hidden bg-white/95 dark:bg-[#070b12]/95 backdrop-blur-2xl border-b border-slate-200 dark:border-slate-800 shadow-2xl font-heading max-h-[calc(100vh-4.5rem)] overflow-y-auto"
          >
            <div className="px-4 pt-4 pb-28 space-y-4">
              
              {/* User Profile / Auth Block */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-xs">
                {currentUser ? (
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {currentUser.photoURL ? (
                        <img 
                          src={currentUser.photoURL} 
                          alt="User" 
                          className="w-10 h-10 rounded-full object-cover border border-emerald-500/80 shadow-xs"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[#088395] text-white flex items-center justify-center text-sm font-black shadow-xs">
                          {currentUser.displayName ? currentUser.displayName[0] : 'U'}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="font-bold text-slate-800 dark:text-white text-xs truncate max-w-[140px]">{currentUser.displayName || 'مستخدِم دكتورنا'}</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[140px]">{currentUser.email}</div>
                      </div>
                    </div>
                    {onOpenAuth && (
                      <button
                        type="button"
                        onClick={() => { onOpenAuth(); setMobileMenuOpen(false); }}
                        className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-[11px] font-bold text-slate-700 dark:text-slate-200 rounded-lg cursor-pointer transition-colors"
                      >
                        إدارة الحساب
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400">
                        <UserIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-800 dark:text-white text-xs">مرحباً بك في دكتورنا</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">سجّل دخولك لحفظ مواعيدك وملفك</div>
                      </div>
                    </div>
                    {onOpenAuth && (
                      <button
                        type="button"
                        onClick={() => { onOpenAuth(); setMobileMenuOpen(false); }}
                        className="px-3.5 py-1.5 bg-[#088395] hover:bg-teal-600 text-white text-[11px] font-bold rounded-lg cursor-pointer transition-colors shadow-xs"
                      >
                        دخول
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Theme Settings Block */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-xs flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300">
                    {theme === 'dark' ? <Moon className="w-4 h-4 text-teal-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
                  </div>
                  <div>
                    <div className="font-bold text-slate-800 dark:text-white text-xs">مظهر المنصة</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">
                      {theme === 'dark' ? 'الوضع الداكن (نشط)' : 'الوضع المضيء (نشط)'}
                    </div>
                  </div>
                </div>
                
                {/* Clean iOS Switch */}
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden bg-slate-300 dark:bg-teal-600"
                >
                  <span className="sr-only">مظهر التطبيق</span>
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                      theme === 'dark' ? 'translate-x-[-20px]' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Mobile Accessibility Bar */}
              <div className="p-4 bg-slate-50/80 dark:bg-slate-800/60 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-xs">
                <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-2.5 tracking-wide font-heading">تخصيص العرض والراحة البصرية:</div>
                <AccessibilityBar
                  preferences={accessibilityPreferences}
                  onUpdatePreferences={onUpdateAccessibility}
                />
              </div>

              {/* Navigation Stack */}
              <div className="flex flex-col gap-1">
                <button 
                  type="button"
                  onClick={() => { navigate('HOME'); setMobileMenuOpen(false); }}
                  className="w-full text-right py-3 px-4 rounded-xl text-slate-800 dark:text-slate-100 font-bold hover:bg-slate-100/80 dark:hover:bg-slate-800/80 flex items-center gap-3 text-sm cursor-pointer transition-all active:translate-x-[-4px]"
                >
                  <Home className="w-5 h-5 text-slate-400" />
                  <span>الرئيسية</span>
                </button>

                <button 
                  type="button"
                  onClick={() => { navigate('SEARCH'); setMobileMenuOpen(false); }}
                  className="w-full text-right py-3 px-4 rounded-xl text-slate-800 dark:text-slate-100 font-bold hover:bg-slate-100/80 dark:hover:bg-slate-800/80 flex items-center gap-3 text-sm cursor-pointer transition-all active:translate-x-[-4px]"
                >
                  <Stethoscope className="w-5 h-5 text-[#088395] dark:text-teal-400" />
                  <span>دليل الأطباء والعيادات</span>
                </button>

                <button 
                  type="button"
                  onClick={() => { navigate('RECORDS'); setMobileMenuOpen(false); }}
                  className="w-full text-right py-3 px-4 rounded-xl text-slate-800 dark:text-slate-100 font-bold hover:bg-slate-100/80 dark:hover:bg-slate-800/80 flex items-center gap-3 text-sm cursor-pointer transition-all active:translate-x-[-4px]"
                >
                  <FileText className="w-5 h-5 text-indigo-500" />
                  <span>الملف الطبي والروشتات ({recordsCount})</span>
                </button>

                <button 
                  type="button"
                  onClick={() => { 
                    requestRoleSwitch('doctor');
                    setMobileMenuOpen(false); 
                  }}
                  className="w-full text-right py-3 px-4 rounded-xl text-emerald-700 dark:text-emerald-400 font-bold hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 flex items-center gap-3 text-sm cursor-pointer transition-all active:translate-x-[-4px]"
                >
                  <Stethoscope className="w-5 h-5 text-emerald-500" />
                  <span>لوحة تحكم الطبيب والعيادة</span>
                </button>

                <button 
                  type="button"
                  onClick={() => { 
                    requestRoleSwitch('admin');
                    setMobileMenuOpen(false); 
                  }}
                  className="w-full text-right py-3 px-4 rounded-xl text-amber-700 dark:text-amber-400 font-bold hover:bg-amber-50/50 dark:hover:bg-amber-950/20 flex items-center gap-3 text-sm cursor-pointer transition-all active:translate-x-[-4px]"
                >
                  <ShieldCheck className="w-5 h-5 text-amber-500" />
                  <span>لوحة إدارة المنصة والاعتمادات</span>
                </button>

                {onOpenMaps && (
                  <button 
                    type="button"
                    onClick={() => { onOpenMaps(); setMobileMenuOpen(false); }}
                    className="w-full text-right py-3 px-4 rounded-xl text-teal-800 dark:text-teal-300 font-bold hover:bg-teal-50/50 dark:hover:bg-teal-950/20 flex items-center gap-3 text-sm cursor-pointer transition-all active:translate-x-[-4px]"
                  >
                    <Compass className="w-5 h-5 text-[#088395] dark:text-teal-400" />
                    <span>خريطة العيادات والمستشفيات الحية (Google Maps)</span>
                  </button>
                )}

                <button 
                  type="button"
                  onClick={() => { onOpenSymptomGuide(); setMobileMenuOpen(false); }}
                  className="w-full text-right py-3 px-4 rounded-xl text-slate-800 dark:text-slate-100 font-bold hover:bg-slate-100/80 dark:hover:bg-slate-800/80 flex items-center gap-3 text-sm cursor-pointer transition-all active:translate-x-[-4px]"
                >
                  <HelpCircle className="w-5 h-5 text-sky-500" />
                  <span>دليل اختيار التخصص الطبي</span>
                </button>
              </div>

              {/* Sub-Actions Stack */}
              <div className="pt-3.5 border-t border-slate-200 dark:border-slate-800/80 flex flex-col gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => { onOpenJoinDoctor(); setMobileMenuOpen(false); }}
                  className="text-right py-2.5 px-4 text-[#088395] dark:text-teal-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-xl cursor-pointer font-heading transition-all"
                >
                  انضم لشبكة أطباء وعيادات دكتورنا
                </button>
                <button
                  type="button"
                  onClick={() => { onOpenPatientHelp(); setMobileMenuOpen(false); }}
                  className="text-right py-2.5 px-4 text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-xl cursor-pointer font-heading transition-all"
                >
                  مركز مساعدة المرضى والأسئلة الشائعة
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Role Protection Passcode Verification Modal */}
      {pendingProtectedRole && (
        <RoleProtectionModal
          isOpen={!!pendingProtectedRole}
          targetRole={pendingProtectedRole}
          onClose={() => setPendingProtectedRole(null)}
          onSuccess={(role) => {
            handleRoleAuthSuccess(role);
            setPendingProtectedRole(null);
          }}
        />
      )}
    </header>
  );
};
