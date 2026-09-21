import React from 'react';
import { Home, Stethoscope, FileText, Calendar } from 'lucide-react';
import { motion } from 'motion/react';
import { ActiveView } from '../types';

interface BottomNavBarProps {
  currentView: ActiveView;
  navigate: (view: ActiveView) => void;
  bookingsCount: number;
  recordsCount: number;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  currentView,
  navigate,
  bookingsCount,
  recordsCount
}) => {
  const navItems = [
    {
      id: 'HOME' as ActiveView,
      label: 'الرئيسية',
      icon: Home
    },
    {
      id: 'SEARCH' as ActiveView,
      label: 'الأطباء',
      icon: Stethoscope
    },
    {
      id: 'RECORDS' as ActiveView,
      label: 'ملفي الطبي',
      icon: FileText,
      count: recordsCount
    },
    {
      id: 'BOOKINGS' as ActiveView,
      label: 'مواعيدي',
      icon: Calendar,
      count: bookingsCount
    }
  ];

  return (
    <nav 
      aria-label="التنقل الرئيسي للهاتف"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 backdrop-blur-xl bg-white/90 dark:bg-[#090d16]/90 border-t border-slate-200/80 dark:border-slate-800/80 shadow-[0_-8px_30px_rgb(0,0,0,0.06)] font-heading select-none transition-colors duration-300"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 12px)' }}
    >
      <div className="flex items-center justify-around px-3 pt-2">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          const Icon = item.icon;

          return (
            <motion.button
              key={item.id}
              type="button"
              whileTap={{ scale: 0.93 }}
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                navigate(item.id);
              }}
              className={`relative flex flex-col items-center justify-center flex-1 py-1 px-2 rounded-2xl min-h-[48px] touch-manipulation transition-colors duration-200 cursor-pointer ${
                isActive
                  ? 'text-[#088395] dark:text-teal-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium'
              }`}
            >
              {/* Active morphing pill background indicator using motion layoutId */}
              {isActive && (
                <motion.span 
                  layoutId="activeTabBackground"
                  className="absolute inset-0 bg-slate-100/80 dark:bg-slate-800/50 rounded-2xl -z-10"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}

              {/* Active Clinical Top Accent Indicator */}
              {isActive && (
                <motion.span 
                  layoutId="activeTabAccent"
                  className="absolute -top-2 w-7 h-0.5 bg-[#088395] dark:bg-teal-400 rounded-full"
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                />
              )}

              <div className="relative p-0.5">
                <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110 stroke-[2.2]' : 'stroke-[1.8]'}`} />
                
                {/* Numeric Counter Badge with micro-bounce entrance */}
                {item.count !== undefined && item.count > 0 && (
                  <motion.span 
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute -top-1.5 -right-2 bg-[#088395] dark:bg-teal-500 text-white text-[10px] font-mono font-bold min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center border-2 border-white dark:border-[#090d16]"
                  >
                    {item.count}
                  </motion.span>
                )}
              </div>

              <span className="text-[10px] sm:text-[11px] mt-1 leading-none tracking-tight whitespace-nowrap">
                {item.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
};

