import React, { useState, useMemo } from 'react';
import { 
  MapPin, 
  Navigation, 
  Compass, 
  Layers, 
  Building2, 
  Search, 
  Star, 
  Clock, 
  PhoneCall, 
  ChevronLeft, 
  ExternalLink,
  ShieldCheck,
  Stethoscope,
  Info,
  CheckCircle2,
  Maximize2
} from 'lucide-react';
import { Doctor } from '../types';
import { CITIES_AND_AREAS } from '../data/seedData';

interface ClinicMapVisualizerProps {
  doctors: Doctor[];
  selectedCity: string;
  setSelectedCity: (c: string) => void;
  selectedArea: string;
  setSelectedArea: (a: string) => void;
  onOpenProfile: (doctor: Doctor) => void;
  onBookSlot: (doctor: Doctor, day: string, slot: string) => void;
  onOpenJoinDoctor?: () => void;
}

interface AreaGeoPoint {
  city: string;
  area: string;
  lat: number;
  lng: number;
  xPercent: number; // For SVG/Canvas static map relative projection
  yPercent: number;
  description: string;
}

// Egyptian major medical clusters and district geographic coordinates
const EGYPT_AREA_COORDINATES: AreaGeoPoint[] = [
  // Cairo
  { city: 'القاهرة', area: 'مصر الجديدة', lat: 30.089, lng: 31.328, xPercent: 57, yPercent: 44, description: 'شارع الحجاز والميرغني وميدان المحكمة' },
  { city: 'القاهرة', area: 'مدينة نصر', lat: 30.056, lng: 31.345, xPercent: 61, yPercent: 48, description: 'شارع عباس العقاد ومكرم عبيد والطيران' },
  { city: 'القاهرة', area: 'المعادي', lat: 29.960, lng: 31.256, xPercent: 53, yPercent: 62, description: 'شارع النصر ودجلة وميدان الحرية' },
  { city: 'القاهرة', area: 'التجمع الخامس', lat: 30.007, lng: 31.428, xPercent: 68, yPercent: 54, description: 'شارع التسعين الشمالي والجنوبي ومراكز الميديكال سنتر' },
  { city: 'القاهرة', area: 'شبرا', lat: 30.078, lng: 31.245, xPercent: 50, yPercent: 43, description: 'شارع شبرا وميدان فيكتوريا وأحمد حلمي' },
  { city: 'القاهرة', area: 'وسط البلد', lat: 30.048, lng: 31.239, xPercent: 49, yPercent: 49, description: 'ميدان التحرير وشارع طلعت حرب ورمسيس' },

  // Giza
  { city: 'الجيزة', area: 'الدقي', lat: 30.038, lng: 31.212, xPercent: 45, yPercent: 50, description: 'شارع التحرير ومصدق وميدان المساحة' },
  { city: 'الجيزة', area: 'المهندسين', lat: 30.052, lng: 31.200, xPercent: 44, yPercent: 47, description: 'شارع جامعة الدول العربية ولبنان والبطل أحمد عبد العزيز' },
  { city: 'الجيزة', area: '٦ أكتوبر', lat: 29.972, lng: 30.942, xPercent: 25, yPercent: 58, description: 'المحور المركزي والحي المتميز وميدان الحصري' },
  { city: 'الجيزة', area: 'الشيخ زايد', lat: 30.040, lng: 31.002, xPercent: 29, yPercent: 51, description: 'محور 26 يوليو وهايبر وان والمستشفيات التخصصية' },
  { city: 'الجيزة', area: 'فيصل والهرم', lat: 29.998, lng: 31.180, xPercent: 43, yPercent: 56, description: 'شارع الهرم الرئيسي ومحطة العريش وميدان الجيزة' },

  // Alexandria
  { city: 'الإسكندرية', area: 'سموحة', lat: 31.215, lng: 29.948, xPercent: 32, yPercent: 18, description: 'ميدان فيكتور عمانويل وطريق 14 مايو' },
  { city: 'الإسكندرية', area: 'لوران', lat: 31.250, lng: 29.974, xPercent: 35, yPercent: 15, description: 'شارع الإقبال وطريق الحرية' },
  { city: 'الإسكندرية', area: 'سيدي جابر', lat: 31.220, lng: 29.939, xPercent: 30, yPercent: 19, description: 'شارع المشير أحمد إسماعيل وميدان سيدي جابر' },
  { city: 'الإسكندرية', area: 'محطة الرمل', lat: 31.200, lng: 29.900, xPercent: 27, yPercent: 20, description: 'ميدان سعد زغلول وصفية زغلول' },
  { city: 'الإسكندرية', area: 'ميامي', lat: 31.265, lng: 30.010, xPercent: 39, yPercent: 14, description: 'شارع خالد بن الوليد وجمال عبد الناصر' },

  // Daqahlia
  { city: 'الدقهلية', area: 'المنصورة - المشاية', lat: 31.045, lng: 31.378, xPercent: 62, yPercent: 28, description: 'المشاية السفلية وكورنيش النيل' },
  { city: 'الدقهلية', area: 'المنصورة - توريل', lat: 31.050, lng: 31.390, xPercent: 65, yPercent: 27, description: 'شارع سعد زغلول والترعة القديمة' },
  { city: 'الدقهلية', area: 'المنصورة - حي الجامعة', lat: 31.039, lng: 31.360, xPercent: 60, yPercent: 30, description: 'شارع جيهان وأمام جامعة المنصورة والمستشفيات' },
];

export const ClinicMapVisualizer: React.FC<ClinicMapVisualizerProps> = ({
  doctors,
  selectedCity,
  setSelectedCity,
  selectedArea,
  setSelectedArea,
  onOpenProfile,
  onBookSlot,
  onOpenJoinDoctor
}) => {
  const [activePin, setActivePin] = useState<AreaGeoPoint | null>(null);
  const [mapLayer, setMapLayer] = useState<'streets' | 'satellite'>('streets');
  const [userOriginArea, setUserOriginArea] = useState<string>(selectedArea || 'مصر الجديدة');

  // Filter areas based on current selected city or all
  const displayedAreas = useMemo(() => {
    if (!selectedCity) return EGYPT_AREA_COORDINATES;
    return EGYPT_AREA_COORDINATES.filter(a => a.city === selectedCity);
  }, [selectedCity]);

  // Group doctors by area
  const areaDoctorMap = useMemo(() => {
    const map = new Map<string, Doctor[]>();
    doctors.forEach(doc => {
      const key = `${doc.city}-${doc.area}`;
      const existing = map.get(key) || [];
      existing.push(doc);
      map.set(key, existing);
    });
    return map;
  }, [doctors]);

  // Doctors in active selected pin
  const activePinDoctors = useMemo(() => {
    if (!activePin) return [];
    return doctors.filter(d => d.city === activePin.city && d.area === activePin.area);
  }, [activePin, doctors]);

  const handleSelectAreaPin = (geo: AreaGeoPoint) => {
    setActivePin(geo);
    setSelectedCity(geo.city);
    setSelectedArea(geo.area);
  };

  const openGoogleMapsDirections = (geo: AreaGeoPoint) => {
    const query = encodeURIComponent(`عيادات وأطباء ${geo.area} ${geo.city} مصر`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden font-body transition-colors duration-200">
      
      {/* Top Header Controls */}
      <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 bg-teal-50 dark:bg-teal-950/70 text-[#088395] dark:text-teal-400 text-xs font-bold px-3 py-1 rounded-full border border-teal-200 dark:border-teal-900/60 font-heading">
              <Compass className="w-3.5 h-3.5 text-[#088395] dark:text-teal-400" />
              <span>الخريطة الجغرافية للعيادات والمراكز المعتمدة في مصر</span>
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#0A2540] dark:text-white font-heading">
            استكشف وتصفح العيادات حسب الموقع والحي
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-body">
            حدد المحافظة أو انقر على أي منطقة لعرض الأطباء والعيادات المسجلة بدقة مع إمكانية الملاحة المباشرة عبر خرائط جوجل.
          </p>
        </div>

        {/* City Filter & Map Style Selector */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto font-heading">
          <select
            value={selectedCity}
            onChange={(e) => {
              setSelectedCity(e.target.value);
              setSelectedArea('');
              setActivePin(null);
            }}
            className="input-clinical text-xs font-bold py-2 px-3 cursor-pointer"
          >
            <option value="">جميع المحافظات (مصر)</option>
            {CITIES_AND_AREAS.map(c => (
              <option key={c.city} value={c.city}>{c.city}</option>
            ))}
          </select>

          <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-0.5 rounded-xl">
            <button
              type="button"
              onClick={() => setMapLayer('streets')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                mapLayer === 'streets'
                  ? 'bg-[#088395] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              خريطة الشوارع
            </button>
            <button
              type="button"
              onClick={() => setMapLayer('satellite')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                mapLayer === 'satellite'
                  ? 'bg-[#088395] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              طبوغرافي / قمر صناعي
            </button>
          </div>
        </div>
      </div>

      {/* Main Map Canvas & Sidebar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[460px]">
        
        {/* Visual Map Area */}
        <div className="lg:col-span-8 relative bg-slate-100 dark:bg-slate-950 overflow-hidden flex items-center justify-center p-4 select-none min-h-[360px] sm:min-h-[460px]">
          
          {/* Static Map Background Grid & Vector Geography */}
          <div 
            className={`absolute inset-0 transition-opacity duration-500 ${
              mapLayer === 'satellite' 
                ? 'bg-gradient-to-br from-slate-900 via-slate-950 to-teal-950 opacity-95' 
                : 'bg-gradient-to-br from-[#eef7f8] via-[#f4f9fa] to-[#e8f3f5] dark:from-slate-950 dark:via-slate-900 dark:to-slate-950'
            }`}
          >
            {/* Topographic Lines & River Nile Stylized Graphic Layer */}
            <svg className="w-full h-full opacity-30 dark:opacity-20 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-teal-400 dark:text-slate-700" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid-pattern)" />
              
              {/* Mediterranean Sea Coast curve */}
              <path 
                d="M 0 110 Q 250 80 500 130 T 1000 100" 
                fill="none" 
                stroke="#088395" 
                strokeWidth="4" 
                strokeDasharray="6 4"
                className="opacity-40" 
              />
              
              {/* River Nile Delta Visual Branching */}
              <path 
                d="M 500 500 L 490 280 Q 420 200 320 120 M 490 280 Q 560 190 640 120" 
                fill="none" 
                stroke="#0a4d68" 
                strokeWidth="6" 
                strokeLinecap="round"
                className="opacity-50" 
              />
            </svg>
          </div>

          {/* Map Region Labels on Canvas */}
          <div className="absolute top-4 left-6 text-[10px] sm:text-xs font-bold text-slate-400 dark:text-slate-500 pointer-events-none uppercase tracking-wider flex items-center gap-1.5 font-heading">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
            <span>البحر الأبيض المتوسط • الإسكندرية والساحل</span>
          </div>

          <div className="absolute bottom-4 right-6 text-[10px] sm:text-xs font-bold text-slate-400 dark:text-slate-500 pointer-events-none uppercase tracking-wider font-heading">
            <span>إقليم القاهرة الكبرى والدلتا • مصر</span>
          </div>

          {/* Interactive Geographic Pins */}
          <div className="relative w-full max-w-2xl h-80 sm:h-96 my-auto">
            {displayedAreas.map((geo, idx) => {
              const count = areaDoctorMap.get(`${geo.city}-${geo.area}`)?.length || 0;
              const isSelected = activePin?.area === geo.area;

              return (
                <div
                  key={idx}
                  style={{
                    left: `${geo.xPercent}%`,
                    top: `${geo.yPercent}%`,
                    transform: 'translate(-50%, -100%)'
                  }}
                  className="absolute z-10 transition-all duration-300"
                >
                  <button
                    type="button"
                    onClick={() => handleSelectAreaPin(geo)}
                    className={`group relative flex flex-col items-center cursor-pointer transition-all duration-200 active:scale-95 ${
                      isSelected ? 'scale-125 z-30' : 'hover:scale-110 z-20'
                    }`}
                  >
                    {/* Pin Bubble */}
                    <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold shadow-md transition-all font-heading ${
                      isSelected
                        ? 'bg-[#088395] text-white ring-4 ring-teal-200 dark:ring-teal-900/80 shadow-teal-500/40'
                        : count > 0
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:border-[#088395]'
                    }`}>
                      <MapPin className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-white' : count > 0 ? 'text-white' : 'text-[#088395] dark:text-teal-400'}`} />
                      <span className="whitespace-nowrap">{geo.area}</span>
                      {count > 0 && (
                        <span className="bg-white/20 text-white text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold">
                          {count}
                        </span>
                      )}
                    </div>

                    {/* Pin Point Pointer Triangle */}
                    <div className={`w-2 h-2 rotate-45 -mt-1 shadow-xs ${
                      isSelected
                        ? 'bg-[#088395]'
                        : count > 0
                        ? 'bg-emerald-600'
                        : 'bg-white dark:bg-slate-800 border-r border-b border-slate-300 dark:border-slate-700'
                    }`} />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Map Compass & Quick Zoom Helper Legend */}
          <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] space-y-1 shadow-sm font-heading">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-[#088395]" />
              <span>المنطقة المحددة حالياً</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              <span>عيادات معتمدة نشطة</span>
            </div>
          </div>

        </div>

        {/* Area & Clinic Details Sidebar */}
        <div className="lg:col-span-4 p-5 sm:p-6 bg-white dark:bg-slate-900 border-t lg:border-t-0 lg:border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div>
            {activePin ? (
              <div>
                <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800 mb-4 font-heading">
                  <div>
                    <span className="text-[11px] font-bold bg-teal-50 dark:bg-teal-950 text-[#088395] dark:text-teal-400 px-2 py-0.5 rounded-md border border-teal-100 dark:border-teal-900/60">
                      {activePin.city}
                    </span>
                    <h3 className="text-lg font-bold text-[#0A2540] dark:text-white mt-1">
                      حي {activePin.area}
                    </h3>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => openGoogleMapsDirections(activePin)}
                    className="p-2 rounded-lg text-[#088395] dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold"
                    title="فتح في خرائط جوجل"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>الملاحة</span>
                  </button>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 mb-4 font-body">
                  <span className="font-bold text-slate-800 dark:text-slate-200 block mb-0.5 font-heading">أبرز الشوارع والمراكز الطبية:</span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">{activePin.description}</p>
                </div>

                {/* Registered Doctors in this area */}
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-2.5 font-heading">
                    <span>العيادات والأطباء في {activePin.area}:</span>
                    <span className="text-[#088395] dark:text-teal-400">({activePinDoctors.length} متاح)</span>
                  </div>

                  {activePinDoctors.length === 0 ? (
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/80 dark:border-slate-800 text-center font-body">
                      <Building2 className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300 font-heading">لم يتم تسجيل عيادات في هذه المنطقة بعد</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        بإمكانك توجيه طلب لربط عيادتك أو حجز كشف بالفيديو مع استشاري مناوب فوراً.
                      </p>
                      {onOpenJoinDoctor && (
                        <button
                          type="button"
                          onClick={onOpenJoinDoctor}
                          className="mt-3 text-xs text-[#088395] dark:text-teal-400 font-bold hover:underline cursor-pointer font-heading"
                        >
                          + تسجيل عيادة أو مركز طبي بالمنطقة
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-60 overflow-y-auto pr-0.5">
                      {activePinDoctors.map((doc) => (
                        <div
                          key={doc.id}
                          className="p-3 bg-slate-50 dark:bg-slate-800/60 hover:bg-teal-50/40 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl transition-all"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 
                                onClick={() => onOpenProfile(doc)}
                                className="text-xs font-bold text-slate-900 dark:text-white hover:text-[#088395] cursor-pointer font-heading"
                              >
                                {doc.name}
                              </h4>
                              <p className="text-[11px] text-slate-600 dark:text-slate-400 font-body">{doc.specialty}</p>
                            </div>
                            <span className="text-xs font-bold text-[#088395] dark:text-teal-400 shrink-0 font-heading">
                              {doc.fee} ج.م
                            </span>
                          </div>

                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-[11px] font-heading">
                            <span className="text-slate-500 dark:text-slate-400 truncate max-w-[140px] font-body">{doc.landmark}</span>
                            <button
                              type="button"
                              onClick={() => onOpenProfile(doc)}
                              className="text-[#088395] dark:text-teal-400 font-bold hover:underline cursor-pointer"
                            >
                              حجز موعد
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            ) : (
              <div className="py-8 text-center">
                <div className="w-14 h-14 rounded-xl bg-teal-50 dark:bg-slate-800 text-[#088395] dark:text-teal-400 flex items-center justify-center mx-auto mb-3 border border-teal-100 dark:border-slate-700">
                  <Navigation className="w-7 h-7 animate-pulse" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1 font-heading">
                  اختر أي منطقة على الخريطة
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto font-body">
                  انقر على مؤشر المنطقة الجغرافية (مثل مصر الجديدة، المهندسين، سموحة) لعرض تفاصيل العيادات وأقرب الأطباء.
                </p>
              </div>
            )}
          </div>

          {/* Quick Find Closest District Suggestion */}
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1.5 font-heading">
              مناطق طبية رئيسية شائعة:
            </span>
            <div className="flex flex-wrap gap-1.5 font-heading">
              {displayedAreas.slice(0, 4).map((geo, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelectAreaPin(geo)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                    activePin?.area === geo.area
                      ? 'bg-[#088395] text-white border-[#088395]'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-[#088395]'
                  }`}
                >
                  {geo.area}
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
