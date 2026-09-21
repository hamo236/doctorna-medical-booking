import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './firebase';
import { ActiveView, Doctor, Booking, MedicalRecord, SpecialtyId, ThemeMode, UserRole, DoctorJoinRequest, AccessibilityPreferences } from './types';
import { apiService } from './services/apiService';
import { Header } from './components/Header';
import { HomeView } from './components/HomeView';
import { SearchResultsView } from './components/SearchResultsView';
import { DoctorProfileModal } from './components/DoctorProfileModal';
import { BookingModal } from './components/BookingModal';
import { SuccessView } from './components/SuccessView';
import { MyAppointmentsView } from './components/MyAppointmentsView';
import { MedicalRecordsView } from './components/MedicalRecordsView';
import { DoctorDashboard } from './components/DoctorDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { SymptomTriageModal } from './components/SymptomTriageModal';
import { NotificationsModal } from './components/NotificationsModal';
import { JoinDoctorModal } from './components/JoinDoctorModal';
import { PatientHelpModal } from './components/PatientHelpModal';
import { EmergencyModal } from './components/EmergencyModal';
import { MapsGroundingModal } from './components/MapsGroundingModal';
import { AuthModal } from './components/AuthModal';
import { BottomNavBar } from './components/BottomNavBar';
import { Footer } from './components/Footer';

export default function App() {
  const [currentView, setCurrentView] = useState<ActiveView>('HOME');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showMapsGrounding, setShowMapsGrounding] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    try {
      const saved = localStorage.getItem('carepro_current_role');
      if (saved === 'admin' || saved === 'doctor') {
        const secret = sessionStorage.getItem('carepro_role_secret');
        if (!secret) {
          localStorage.setItem('carepro_current_role', 'patient');
          return 'patient';
        }
        return saved;
      }
      return 'patient';
    } catch {
      return 'patient';
    }
  });
  
  const THEME_KEY = 'doctorna_theme';
  
  // Theme state
  const [theme, setTheme] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      if (saved === 'dark' || saved === 'light') return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  const updateTheme = (mode: ThemeMode) => {
    try {
      localStorage.setItem(THEME_KEY, mode);
      const root = document.documentElement;
      if (mode === 'dark') {
        if (!root.classList.contains('dark')) root.classList.add('dark');
      } else {
        if (root.classList.contains('dark')) root.classList.remove('dark');
      }
    } catch (e) {
      console.error('Failed to update theme', e);
    }
  };

  // Accessibility Preferences State (Apple ergonomics & senior-friendly UX)
  const [accessibility, setAccessibility] = useState<AccessibilityPreferences>(() => {
    try {
      const saved = localStorage.getItem('carepro_accessibility');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {
      textScale: 'normal',
      highContrast: false,
      speechAssist: false
    };
  });

  const handleUpdateAccessibility = (updated: Partial<AccessibilityPreferences>) => {
    setAccessibility(prev => {
      const next = { ...prev, ...updated };
      try {
        localStorage.setItem('carepro_accessibility', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  useEffect(() => {
    updateTheme(theme);
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      // Only sync if user hasn't set a manual preference
      if (!localStorage.getItem(THEME_KEY)) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Synchronize accessibility classes on <html> tag
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('text-scale-normal', 'text-scale-large', 'text-scale-huge', 'high-contrast');
    root.classList.add(`text-scale-${accessibility.textScale}`);
    if (accessibility.highContrast) {
      root.classList.add('high-contrast');
    }
  }, [accessibility]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleRoleChange = (newRole: UserRole) => {
    setCurrentRole(newRole);
    try {
      localStorage.setItem('carepro_current_role', newRole);
    } catch (e) {
      console.error(e);
    }
  };

  // Search Filters State
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedArea, setSelectedArea] = useState<string>('');
  const [doctorNameQuery, setDoctorNameQuery] = useState<string>('');

  // Modals State
  const [profileDoctor, setProfileDoctor] = useState<Doctor | null>(null);
  const [bookingTarget, setBookingTarget] = useState<{ doctor: Doctor; day: string; slot: string } | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [unreadCount, setUnreadCount] = useState<number>(1);
  const [showSymptomGuide, setShowSymptomGuide] = useState<boolean>(false);
  const [showJoinDoctor, setShowJoinDoctor] = useState<boolean>(false);
  const [showPatientHelp, setShowPatientHelp] = useState<boolean>(false);
  const [showEmergency, setShowEmergency] = useState<boolean>(false);
  const [providerNotice, setProviderNotice] = useState<string | null>(null);

  // Core Data Stores (Hydrated via API Repository)
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [joinRequests, setJoinRequests] = useState<DoctorJoinRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initial Data Fetch from Backend / Sync & Firebase Auth state subscription
  useEffect(() => {
    async function loadPlatformData() {
      try {
        const [docsData, bookingsData, recordsData, reqsData] = await Promise.all([
          apiService.getDoctors(),
          apiService.getBookings(),
          apiService.getRecords(),
          apiService.getJoinRequests()
        ]);
        setDoctors(docsData);
        setBookings(bookingsData);
        setRecords(recordsData);
        setJoinRequests(reqsData);
      } catch (err) {
        console.error('Failed loading backend data', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadPlatformData();

    // Firebase Auth State Listener
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });

    return () => unsubscribe();
  }, []);

  // Navigation Helper
  const navigate = (view: ActiveView) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentView(view);
  };

  // Search Action
  const handleExecuteSearch = (filters: { specialty: string; city: string; area: string; doctorName: string }) => {
    setSelectedSpecialty(filters.specialty);
    setSelectedCity(filters.city);
    setSelectedArea(filters.area);
    setDoctorNameQuery(filters.doctorName);
    navigate('SEARCH');
  };

  // Profile Modal
  const handleOpenProfile = (doctor: Doctor) => {
    setProfileDoctor(doctor);
  };

  // Trigger Booking Modal
  const handleBookSlot = (doctor: Doctor, day: string, slot: string) => {
    setProfileDoctor(null);
    setBookingTarget({ doctor, day, slot });
  };

  // Complete Booking
  const handleCompleteBooking = async (newBooking: Booking) => {
    const saved = await apiService.createBooking(newBooking);
    setBookings((prev) => [saved, ...prev]);
    setBookingTarget(null);
    setConfirmedBooking(saved);
    setUnreadCount((prev) => prev + 1);
    navigate('CONFIRMATION');
  };

  // Cancel Booking
  const handleCancelBooking = async (id: string) => {
    try {
      await apiService.updateBookingStatus(id, 'cancelled');
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: 'cancelled' as const } : b))
      );
    } catch (e: any) {
      console.error('Cancel booking failed', e);
      throw e;
    }
  };

  // Reschedule Booking
  const handleRescheduleBooking = async (id: string, newDay: string, newSlot: string) => {
    try {
      const updated = await apiService.rescheduleBooking(id, newDay, newSlot);
      if (updated) {
        setBookings((prev) => prev.map((b) => (b.id === id ? updated : b)));
      } else {
        setBookings((prev) =>
          prev.map((b) =>
            b.id === id ? { ...b, day: newDay, slot: newSlot, status: 'confirmed' as const } : b
          )
        );
      }
    } catch (e: any) {
      console.error('Reschedule booking failed', e);
      throw e;
    }
  };

  // Update Booking Status (e.g. called from Doctor Dashboard during consultation)
  const handleUpdateBookingStatus = async (
    id: string, 
    status: Booking['status'],
    ePrescription?: Booking['ePrescription']
  ) => {
    const updated = await apiService.updateBookingStatus(id, status, ePrescription);
    if (updated) {
      setBookings((prev) => prev.map((b) => (b.id === id ? updated : b)));
    } else {
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status, ePrescription: ePrescription || b.ePrescription } : b))
      );
    }
  };

  // Medical Records Actions
  const handleAddRecord = async (record: MedicalRecord) => {
    const saved = await apiService.addRecord(record);
    setRecords((prev) => [saved, ...prev]);
  };

  const handleDeleteRecord = async (id: string) => {
    await apiService.deleteRecord(id);
    setRecords((prev) => prev.filter((r) => r.id !== id));
  };

  // Doctor Provider Registration Handler
  const handleProviderJoinSubmit = async (reqData: any) => {
    const newReq = await apiService.submitJoinRequest(reqData);
    setJoinRequests((prev) => [newReq, ...prev]);
    setProviderNotice(reqData.providerName);
    setUnreadCount((prev) => prev + 1);
  };

  // Admin Process Join Request (Approve / Reject)
  const handleProcessJoinRequest = async (id: string, action: 'approve' | 'reject') => {
    const result = await apiService.processJoinRequest(id, action);
    if (result.success) {
      setJoinRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: action === 'approve' ? 'approved' : 'rejected' } : r))
      );
      if (result.newDoctor) {
        setDoctors((prev) => [result.newDoctor!, ...prev]);
      }
    }
  };

  // Direct Doctor Creation (from Admin)
  const handleAddDoctorDirect = async (docData: Partial<Doctor>) => {
    const created = await apiService.addDoctor(docData);
    setDoctors((prev) => [created, ...prev]);
  };

  // Symptom Guide Specialty Selection
  const handleSelectSpecialtyFromGuide = (specialtyId: SpecialtyId) => {
    setSelectedSpecialty(specialtyId);
    navigate('SEARCH');
  };

  return (
    <div dir="rtl" className="min-h-screen animate-fade-in bg-transparent text-slate-800 dark:text-slate-100 flex flex-col font-['Tajawal',system-ui,sans-serif] transition-colors duration-300">
      
      {/* Top Header */}
      <Header
        currentView={currentView}
        navigate={navigate}
        currentRole={currentRole}
        onRoleChange={handleRoleChange}
        bookingsCount={bookings.filter(b => b.status === 'confirmed').length}
        recordsCount={records.length}
        onOpenNotifications={() => {
          setShowNotifications(true);
          setUnreadCount(0);
        }}
        unreadNotifications={unreadCount}
        onOpenSymptomGuide={() => setShowSymptomGuide(true)}
        onOpenJoinDoctor={() => setShowJoinDoctor(true)}
        onOpenPatientHelp={() => setShowPatientHelp(true)}
        onOpenEmergency={() => setShowEmergency(true)}
        onOpenMaps={() => setShowMapsGrounding(true)}
        onOpenAuth={() => setShowAuthModal(true)}
        currentUser={currentUser}
        theme={theme}
        toggleTheme={toggleTheme}
        accessibilityPreferences={accessibility}
        onUpdateAccessibility={handleUpdateAccessibility}
      />

      {/* Main View Router */}
      <main className="flex-1 pb-20 md:pb-0">
        {currentView === 'HOME' && (
          <HomeView
            doctors={doctors}
            bookings={bookings}
            selectedSpecialty={selectedSpecialty}
            setSelectedSpecialty={setSelectedSpecialty}
            selectedCity={selectedCity}
            setSelectedCity={setSelectedCity}
            selectedArea={selectedArea}
            setSelectedArea={setSelectedArea}
            onSearch={handleExecuteSearch}
            onOpenProfile={handleOpenProfile}
            onBookSlot={handleBookSlot}
            onNavigateToSearch={() => navigate('SEARCH')}
            onNavigateToRecords={() => navigate('RECORDS')}
            onNavigateToBookings={() => navigate('BOOKINGS')}
            onViewVoucher={(booking) => {
              setConfirmedBooking(booking);
              navigate('CONFIRMATION');
            }}
            onOpenSymptomGuide={() => setShowSymptomGuide(true)}
            onOpenMaps={() => setShowMapsGrounding(true)}
            onOpenJoinDoctor={() => setShowJoinDoctor(true)}
          />
        )}

        {currentView === 'SEARCH' && (
          <SearchResultsView
            doctors={doctors}
            isLoading={isLoading}
            selectedSpecialty={selectedSpecialty}
            setSelectedSpecialty={setSelectedSpecialty}
            selectedCity={selectedCity}
            setSelectedCity={setSelectedCity}
            selectedArea={selectedArea}
            setSelectedArea={setSelectedArea}
            doctorNameQuery={doctorNameQuery}
            setDoctorNameQuery={setDoctorNameQuery}
            onOpenProfile={handleOpenProfile}
            onBookSlot={handleBookSlot}
            onOpenJoinDoctor={() => setShowJoinDoctor(true)}
          />
        )}

        {currentView === 'RECORDS' && (
          <MedicalRecordsView
            records={records}
            isLoading={isLoading}
            onAddRecord={handleAddRecord}
            onDeleteRecord={handleDeleteRecord}
          />
        )}

        {currentView === 'BOOKINGS' && (
          <MyAppointmentsView
            bookings={bookings}
            isLoading={isLoading}
            onCancelBooking={handleCancelBooking}
            onRescheduleBooking={handleRescheduleBooking}
            onNavigateToSearch={() => navigate('SEARCH')}
            onViewVoucher={(booking) => {
              setConfirmedBooking(booking);
              navigate('CONFIRMATION');
            }}
          />
        )}

        {currentView === 'DOCTOR_DASHBOARD' && (
          <DoctorDashboard
            doctors={doctors}
            bookings={bookings}
            onUpdateBookingStatus={handleUpdateBookingStatus}
            onAddRecord={handleAddRecord}
            onAddBooking={(newBooking) => setBookings((prev) => [newBooking, ...prev])}
          />
        )}

        {currentView === 'ADMIN_DASHBOARD' && (
          <AdminDashboard
            doctors={doctors}
            bookings={bookings}
            joinRequests={joinRequests}
            onProcessJoinRequest={handleProcessJoinRequest}
            onAddDoctor={handleAddDoctorDirect}
          />
        )}

        {currentView === 'CONFIRMATION' && (
          <SuccessView
            booking={confirmedBooking}
            onGoToBookings={() => navigate('BOOKINGS')}
            onGoHome={() => navigate('HOME')}
          />
        )}
      </main>

      {/* Doctor Profile Modal */}
      {profileDoctor && (
        <DoctorProfileModal
          doctor={profileDoctor}
          onClose={() => setProfileDoctor(null)}
          onBook={handleBookSlot}
        />
      )}

      {/* Booking Modal */}
      {bookingTarget && (
        <BookingModal
          doctor={bookingTarget.doctor}
          day={bookingTarget.day}
          slot={bookingTarget.slot}
          onClose={() => setBookingTarget(null)}
          onCompleteBooking={handleCompleteBooking}
        />
      )}

      {/* Notifications Modal */}
      <NotificationsModal
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        bookings={bookings}
        providerNotice={providerNotice}
      />

      {/* Symptom to Specialty Triage Guide Modal */}
      <SymptomTriageModal
        isOpen={showSymptomGuide}
        onClose={() => setShowSymptomGuide(false)}
        onSelectSpecialty={handleSelectSpecialtyFromGuide}
      />

      {/* Doctor/Clinic Join Registration Modal */}
      <JoinDoctorModal
        isOpen={showJoinDoctor}
        onClose={() => setShowJoinDoctor(false)}
        onSuccess={handleProviderJoinSubmit}
      />

      {/* Patient Help & FAQ Modal */}
      <PatientHelpModal
        isOpen={showPatientHelp}
        onClose={() => setShowPatientHelp(false)}
        onNavigate={navigate}
      />

      {/* Emergency Hotline 123 & Medical Aid Modal */}
      <EmergencyModal
        isOpen={showEmergency}
        onClose={() => setShowEmergency(false)}
        onNavigateToDoctors={() => {
          setShowEmergency(false);
          navigate('SEARCH');
        }}
      />

      {/* Google Maps Grounding Explorer Modal */}
      <MapsGroundingModal
        isOpen={showMapsGrounding}
        onClose={() => setShowMapsGrounding(false)}
        defaultLocation={selectedCity ? `${selectedCity} - ${selectedArea}` : 'القاهرة'}
        defaultSpecialty={selectedSpecialty || 'باطنة وجهاز هضمي'}
      />

      {/* Firebase User Authentication & Account Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        currentUser={currentUser}
      />

      {/* iOS Apple-style Bottom Navigation Bar for Mobile Devices */}
      <BottomNavBar
        currentView={currentView}
        navigate={navigate}
        bookingsCount={bookings.filter(b => b.status === 'confirmed').length}
        recordsCount={records.length}
      />

      {/* Footer */}
      <Footer
        navigate={navigate}
        onSelectSpecialty={(specId) => {
          setSelectedSpecialty(specId);
          navigate('SEARCH');
        }}
        onSelectArea={(city, area) => {
          setSelectedCity(city);
          setSelectedArea(area);
          navigate('SEARCH');
        }}
        onOpenJoinDoctor={() => setShowJoinDoctor(true)}
        onOpenPatientHelp={() => setShowPatientHelp(true)}
      />

    </div>
  );
}
