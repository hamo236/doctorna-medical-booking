import React, { useState } from 'react';
import { 
  MapPin, 
  Search, 
  Sparkles, 
  ExternalLink, 
  Building2, 
  Navigation, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Compass,
  Map,
  X
} from 'lucide-react';
import { SPECIALTIES } from '../data/seedData';

interface MapsGroundingModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultLocation?: string;
  defaultSpecialty?: string;
}

export const MapsGroundingModal: React.FC<MapsGroundingModalProps> = ({
  isOpen,
  onClose,
  defaultLocation = 'القاهرة - مدينة نصر',
  defaultSpecialty = 'باطنة وجهاز هضمي'
}) => {
  const [location, setLocation] = useState(defaultLocation);
  const [specialty, setSpecialty] = useState(defaultSpecialty);
  const [query, setQuery] = useState('أقرب عيادات ومراكز طبية متخصصة ومستشفيات معتمدة');
  const [loading, setLoading] = useState(false);
  const [resultText, setResultText] = useState<string | null>(null);
  const [groundingChunks, setGroundingChunks] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    setResultText(null);
    setGroundingChunks([]);

    try {
      const res = await fetch('/api/maps/grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location,
          specialty,
          query
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'حدث خطأ أثناء جلب بيانات خرائط جوجل');
      }

      setResultText(data.text);
      setGroundingChunks(data.groundingChunks || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'تعذر الاتصال بخرائط جوجل الطبية حالياً');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200 font-['Tajawal',sans-serif]">
      <div 
        className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#002b49] dark:bg-slate-950 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black">مستكشف العيادات والمستشفيات الحية</h3>
                <span className="text-[10px] font-black bg-blue-500/30 text-blue-200 px-2 py-0.5 rounded-full border border-blue-400/30 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>Google Maps Grounding</span>
                </span>
              </div>
              <p className="text-xs text-slate-300">بيانات حية ومحدثة من خرائط جوجل للعيادات والمراكز والمستشفيات في مصر</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Controls */}
        <div className="p-6 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800">
          <form onSubmit={handleSearch} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  المدينة أو المنطقة في مصر:
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="مثال: التجمع الخامس، الدقي، مدينة نصر، سموحة..."
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-3 pl-9 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-[#0070cd]"
                  />
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  التخصص الطبي المطلوب:
                </label>
                <select
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-3 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-[#0070cd]"
                >
                  <option value="عام وطوارئ">عام ومستشفيات طوارئ</option>
                  {SPECIALTIES.filter(s => s.id !== 'all').map(s => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                استفسار أو تفاصيل إضافية (أقرب مستشفى، صيدلية ٢٤ ساعة، علامة مميزة):
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="ابحث عن أقرب مستشفى أو صيدلية أو مجمع عيادات..."
                  className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-3 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-[#0070cd]"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#0066b2] hover:bg-[#005596] dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <span>جاري الاتصال بخرائط جوجل...</span>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      <span>بحث خرائط جوجل المباشر</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Results Area */}
        <div className="p-6 overflow-y-auto max-h-[55vh] space-y-4">
          {error && (
            <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-2xl flex items-center gap-3 text-rose-800 dark:text-rose-200 text-xs font-bold">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {loading && (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 border-3 border-blue-200 dark:border-blue-900 border-t-[#0070cd] rounded-full animate-spin mx-auto"></div>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                جاري استدعاء محرك Google Maps وربطه بـ Gemini للتحقق من العناوين والأماكن الحقيقية...
              </p>
            </div>
          )}

          {!loading && !resultText && !error && (
            <div className="py-10 text-center space-y-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-6">
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950/60 text-[#0070cd] rounded-2xl flex items-center justify-center mx-auto">
                <Map className="w-6 h-6" />
              </div>
              <h4 className="font-black text-sm text-slate-900 dark:text-white">استكشف خريطة العيادات والمستشفيات بدقة تامة</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                انقر على زر البحث أعلاه للحصول على العناوين الموثقة من خرائط جوجل، أقرب محطات المترو، وأرقام الطوارئ ومواعيد العمل الفعلية في منطقتك.
              </p>
              <div className="pt-2 flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  onClick={() => { setLocation('مدينة نصر'); setSpecialty('باطنة وجهاز هضمي'); handleSearch(); }}
                  className="text-[11px] font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-full text-slate-700 dark:text-slate-300 hover:border-[#0070cd] cursor-pointer"
                >
                  📍 عيادات باطنة في مدينة نصر
                </button>
                <button
                  type="button"
                  onClick={() => { setLocation('التجمع الخامس'); setSpecialty('جلدية وتجميل وليزر'); handleSearch(); }}
                  className="text-[11px] font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-full text-slate-700 dark:text-slate-300 hover:border-[#0070cd] cursor-pointer"
                >
                  📍 مراكز جلدية وليزر بالتجمع
                </button>
                <button
                  type="button"
                  onClick={() => { setLocation('الدقي والمهندسين'); setSpecialty('عظام ومفاصل وعمود فقري'); handleSearch(); }}
                  className="text-[11px] font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-full text-slate-700 dark:text-slate-300 hover:border-[#0070cd] cursor-pointer"
                >
                  📍 استشاريين عظام بالمهندسين
                </button>
              </div>
            </div>
          )}

          {!loading && resultText && (
            <div className="space-y-4 animate-in fade-in">
              <div className="bg-blue-50/70 dark:bg-slate-800/80 p-4 rounded-2xl border border-blue-200/80 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-[#002b49] dark:text-white">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>نتائج مستخرجة وموثقة عبر Google Maps Grounding ({location})</span>
                </div>
                <a
                  href={`https://www.google.com/maps/search/${encodeURIComponent(specialty + ' ' + location)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-[#0070cd] dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  <span>فتح في Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Main Response Content */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                {resultText}
              </div>

              {/* Grounding Source References if any */}
              {groundingChunks && groundingChunks.length > 0 && (
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    المصادر المعتمدة من خرائط جوجل:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {groundingChunks.map((chunk, idx) => {
                      const web = chunk.web;
                      if (!web) return null;
                      return (
                        <a
                          key={idx}
                          href={web.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-bold text-[#0070cd] dark:text-blue-400 bg-white dark:bg-slate-900 px-3 py-1 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-[#0070cd] flex items-center gap-1"
                        >
                          <span>{web.title || 'رابط الموقع الجغرافي'}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-[#0070cd]" />
            <span>بيانات موثوقة ومربوطة بأحدث تحديثات الأماكن والعيادات في مصر</span>
          </div>
          <button
            onClick={onClose}
            className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
