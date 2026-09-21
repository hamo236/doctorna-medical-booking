export interface DrugInteractionAlert {
  drugA: string;
  drugB: string;
  severity: 'high' | 'moderate' | 'mild';
  severityText: string;
  mechanism: string;
  clinicalAdvice: string;
}

export const COMMON_DRUG_DATABASE = [
  'Aspirin (أسبرين)',
  'Ibuprofen - Brufen (بروفين / إيبوبروفين)',
  'Paracetamol - Panadol (بنادول / باراسيتامول)',
  'Warfarin - Marevan (ماريفان / وارفارين)',
  'Clopidogrel - Plavix (بلافيكس)',
  'Metformin - Glucophage (جلوكوفاج / ميتفورمين)',
  'Amoxicillin / Clavulanic - Augmentin (أوجمنتين)',
  'Ciprofloxacin - Ciprobay (سيبروباي)',
  'Omeprazole - Controloc / Antodine (كونترولوك / أوميبرازول)',
  'Atorvastatin - Lipitor (ليبيتور)',
  'Bisoprolol - Concor (كونكور)',
  'Captopril / Enalapril (كابوتين / إنالابريل)',
  'Spironolactone - Aldactone (ألداكتون)',
  'Levothyroxine - Eltroxin (إلتروكسين)',
  'Antacid - Maalox (مالوكس / مضاد حموضة)'
];

export const KNOWN_INTERACTIONS: DrugInteractionAlert[] = [
  {
    drugA: 'أسبرين',
    drugB: 'بروفين',
    severity: 'high',
    severityText: 'تعارض عالي الخطورة',
    mechanism: 'تزامن مسكنات NSAIDs (البروفين) مع الأسبرين يزيد من خطر حدوث قرحة ونزيف في الجهاز الهضمي ويلغي التأثير الوقائي للأسبرين على القلب.',
    clinicalAdvice: 'ينصح بالفصل بينهما وتناول الباراسيتامول (بنادول) كبديل آمن لتسكين الألم بعد استشارة الطبيب.'
  },
  {
    drugA: 'aspirin',
    drugB: 'ibuprofen',
    severity: 'high',
    severityText: 'تعارض عالي الخطورة',
    mechanism: 'NSAIDs block cardioprotective antiplatelet effect of Aspirin and drastically elevate gastrointestinal bleeding risk.',
    clinicalAdvice: 'استشر طبيب القلب لاستبدال مسكن الألم أو تنظيم أوقات الجرعات بفارق 4 ساعات على الأقل.'
  },
  {
    drugA: 'ماريفان',
    drugB: 'أسبرين',
    severity: 'high',
    severityText: 'تعارض حرج - خطر نزيف',
    mechanism: 'تناول مضادين للتجلط في آن واحد يضاعف سيولة الدم بصورة خطرة ويزيد احتمال النزيف الداخلي.',
    clinicalAdvice: 'ممنوع الجمع بينهما دون إشراف دقيق ومتابعة تحليل سيولة الدم (INR).'
  },
  {
    drugA: 'warfarin',
    drugB: 'aspirin',
    severity: 'high',
    severityText: 'تعارض حرج - خطر نزيف',
    mechanism: 'Dual anticoagulant and antiplatelet synergistic effect dramatically heightens hemorrhage hazard.',
    clinicalAdvice: 'تجنب الجمع التلقائي والتزم بالجرعة الدقيقة الموصوفة من طبيب الأوعية الدموية.'
  },
  {
    drugA: 'كونكور',
    drugB: 'بروفين',
    severity: 'moderate',
    severityText: 'تنبيه متوسط - تأثير على ضغط الدم',
    mechanism: 'مضادات الالتهاب غير الستيرويدية تقلل من فاعلية أدوية الضغط وحاصرات بيتا (كونكور) وتسبب احتباس السوائل.',
    clinicalAdvice: 'تجنب الاستخدام المزمن للبروفين لدى مرضى ارتفاع ضغط الدم.'
  },
  {
    drugA: 'سيبروباي',
    drugB: 'مالوكس',
    severity: 'moderate',
    severityText: 'انخفاض امتصاص الدواء',
    mechanism: 'مضادات الحموضة التي تحتوي على الماغنسيوم أو الألومنيوم ترتبط بالمضاد الحيوي (سيبروفلوكساسين) وتمنع امتصاصه في الأمعاء.',
    clinicalAdvice: 'يجب تناول المضاد الحيوي قبل مضاد الحموضة بساعتين أو بعده بـ 4 ساعات.'
  },
  {
    drugA: 'إلتروكسين',
    drugB: 'حديد',
    severity: 'moderate',
    severityText: 'انخفاض امتصاص هرمون الغدة',
    mechanism: 'مكملات الحديد والكالسيوم تقلل امتصاص دواء الغدة الدرقية (ليفوثيروكسين).',
    clinicalAdvice: 'اترك فاصلاً زمنياً لا يقل عن 4 ساعات بين جرعة الإلتروكسين ومكملات المعادن.'
  },
  {
    drugA: 'كابوتين',
    drugB: 'ألداكتون',
    severity: 'high',
    severityText: 'خطر ارتفاع البوتاسيوم في الدم',
    mechanism: 'قد يؤدي الجمع بينهما إلى فرط بوتاسيوم الدم (Hyperkalemia) مما يؤثر على نظم ضربات القلب.',
    clinicalAdvice: 'يتطلب فحصاً دورياً لوظائف الكلى ونسبة البوتاسيوم في الدم.'
  }
];

export function checkDrugInteractions(medicines: string[]): DrugInteractionAlert[] {
  const alerts: DrugInteractionAlert[] = [];
  const normalizedMeds = medicines.map(m => m.toLowerCase().trim());

  for (let i = 0; i < normalizedMeds.length; i++) {
    for (let j = i + 1; j < normalizedMeds.length; j++) {
      const medA = normalizedMeds[i];
      const medB = normalizedMeds[j];

      for (const rule of KNOWN_INTERACTIONS) {
        const rA = rule.drugA.toLowerCase();
        const rB = rule.drugB.toLowerCase();

        const match1 = (medA.includes(rA) && medB.includes(rB)) || (medA.includes(rB) && medB.includes(rA));
        if (match1) {
          // Avoid duplicate alerts
          if (!alerts.some(a => (a.drugA === rule.drugA && a.drugB === rule.drugB) || (a.drugA === rule.drugB && a.drugB === rule.drugA))) {
            alerts.push(rule);
          }
        }
      }
    }
  }

  return alerts;
}
