import React from 'react';

interface LoadingSkeletonProps {
  type: 'doctor-card' | 'appointment-card' | 'record-card' | 'grid-specialties';
  count?: number;
}

export const CustomLoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  type,
  count = 3
}) => {
  const items = Array.from({ length: count }, (_, i) => i);

  if (type === 'doctor-card') {
    return (
      <div className="space-y-4 w-full animate-pulse font-body">
        {items.map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 flex flex-col lg:flex-row gap-6 shadow-xs"
          >
            {/* Info Side */}
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-200 dark:bg-slate-800 rounded-2xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="flex gap-2">
                    <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded-md" />
                    <div className="h-4 w-28 bg-slate-100 dark:bg-slate-800/60 rounded-md" />
                  </div>
                  <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                  <div className="h-4 w-32 bg-slate-100 dark:bg-slate-800/60 rounded-md" />
                </div>
              </div>

              {/* Sub-tags */}
              <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="h-5 w-24 bg-slate-200 dark:bg-slate-800 rounded-md" />
                <div className="h-5 w-28 bg-slate-200 dark:bg-slate-800 rounded-md" />
                <div className="h-5 w-20 bg-slate-100 dark:bg-slate-800/60 rounded-md" />
              </div>

              {/* Details Box */}
              <div className="h-16 bg-slate-100 dark:bg-slate-800/70 rounded-xl" />
            </div>

            {/* Schedule Side */}
            <div className="w-full lg:w-80 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded-md" />
              <div className="grid grid-cols-3 gap-2">
                <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg" />
              </div>
              <div className="h-11 bg-slate-300 dark:bg-slate-700 rounded-xl mt-4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'appointment-card') {
    return (
      <div className="space-y-4 w-full animate-pulse font-body">
        {items.map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs"
          >
            <div className="flex items-center gap-4 flex-1">
              <div className="w-14 h-14 bg-slate-200 dark:bg-slate-800 rounded-xl shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="h-5 w-44 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                <div className="h-4 w-60 bg-slate-100 dark:bg-slate-800/60 rounded" />
              </div>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <div className="h-10 w-28 bg-slate-200 dark:bg-slate-800 rounded-xl" />
              <div className="h-10 w-28 bg-slate-200 dark:bg-slate-800 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'record-card') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full animate-pulse font-body">
        {items.map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-3 shadow-xs"
          >
            <div className="flex justify-between items-center">
              <div className="h-5 w-20 bg-slate-200 dark:bg-slate-800 rounded-full" />
              <div className="h-4 w-16 bg-slate-100 dark:bg-slate-800/60 rounded" />
            </div>
            <div className="h-6 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-lg" />
            <div className="h-4 w-1/2 bg-slate-100 dark:bg-slate-800/60 rounded" />
            <div className="h-14 bg-slate-100 dark:bg-slate-800/40 rounded-xl" />
            <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="h-8 flex-1 bg-slate-200 dark:bg-slate-800 rounded-lg" />
              <div className="h-8 w-20 bg-slate-100 dark:bg-slate-800/60 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return null;
};
