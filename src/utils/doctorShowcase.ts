import { Doctor, ClinicPhotoItem, QualityMetrics, SpecialtyId } from '../types';

/**
 * 🏥 معرض صور العيادات والمرافق الطبية المعتمدة بحسب التخصص
 */
const SPECIALTY_PHOTO_CATALOG: Record<string, ClinicPhotoItem[]> = {
  internal: [
    {
      id: 'photo-int-1',
      url: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80',
      title: 'غرفة الاستشارة والفحص السريري',
      caption: 'جناح استشارة هادئ ومجهز بأحدث أجهزة قياس العلامات الحيوية وفحص الباطنة',
      tag: 'examination',
      tagLabel: 'غرفة الكشف'
    },
    {
      id: 'photo-int-2',
      url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80',
      title: 'صالة الاستقبال والانتظار المكيفة',
      caption: 'مساحة انتظار مريحة مزودة بنظام نداء آلي وشاشات إرشادية للمرضى',
      tag: 'reception',
      tagLabel: 'صالة الاستقبال'
    },
    {
      id: 'photo-int-3',
      url: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80',
      title: 'وحدة السونار والفحوصات التخصصية',
      caption: 'أجهزة فحص بالموجات فوق الصوتية المتقدمة لسرعة التشخيص الفوري',
      tag: 'equipment',
      tagLabel: 'أجهزة متقدمة'
    },
    {
      id: 'photo-int-4',
      url: 'https://images.unsplash.com/photo-1583912267550-d44d9c9a0586?auto=format&fit=crop&w=800&q=80',
      title: 'محطة التعقيم والوقاية الطبية',
      caption: 'بروتوكول تعقيم دوري معتمد وأدوات فحص معقمة أحادية الاستخدام',
      tag: 'sterilization',
      tagLabel: 'تعقيم معتمد'
    }
  ],
  dentistry: [
    {
      id: 'photo-dent-1',
      url: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=800&q=80',
      title: 'جناح طب وجراحة الأسنان الرقمي',
      caption: 'وحدة أسنان متطورة مريحة وشاشات عرض لأشعة البانوراما ثلاثية الأبعاد',
      tag: 'examination',
      tagLabel: 'عيادة الأسنان'
    },
    {
      id: 'photo-dent-2',
      url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80',
      title: 'بهو الاستقبال الهادئ',
      caption: 'استقبال فندقي راقٍ لتوفير تجربة استرخاء خالية من التوتر قبل الكشف',
      tag: 'reception',
      tagLabel: 'الاستقبال'
    },
    {
      id: 'photo-dent-3',
      url: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80',
      title: 'جهاز الليزر والمسح الرقمي',
      caption: 'أحدث كاميرات المسح داخل الفم للتصميم الفوري لتركيبات وابتسامة هوليوود',
      tag: 'equipment',
      tagLabel: 'أجهزة رقمية'
    },
    {
      id: 'photo-dent-4',
      url: 'https://images.unsplash.com/photo-1583912267550-d44d9c9a0586?auto=format&fit=crop&w=800&q=80',
      title: 'غرفة الأوتوكلاف والتعقيم الجراحي',
      caption: 'تعقيم كامل بدرجة حرارة وضغط طبيين طبقا لمعايير مكافحة العدوى الدولية',
      tag: 'sterilization',
      tagLabel: 'أوتوكلاف معتمد'
    }
  ],
  pediatrics: [
    {
      id: 'photo-ped-1',
      url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80',
      title: 'عيادة فحص الأطفال الصديقة',
      caption: 'بيئة مرحة وآمنة للأطفال الصغار وحديثي الولادة مع ألعاب فحص مهدئة',
      tag: 'examination',
      tagLabel: 'غرفة فحص الطفل'
    },
    {
      id: 'photo-ped-2',
      url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80',
      title: 'صالة انتظار عائلية',
      caption: 'ركن مخصص للعب الأطفال وتهيئة الأمهات قبل استشارة الطبيب',
      tag: 'reception',
      tagLabel: 'استقبال العائلة'
    },
    {
      id: 'photo-ped-3',
      url: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80',
      title: 'موازين رقمية ومعدات نمو',
      caption: 'قياسات دقيقة لكتلة الجسم ومنحنيات النمو وتخطيط التنفس للأطفال',
      tag: 'equipment',
      tagLabel: 'متابعة النمو'
    },
    {
      id: 'photo-ped-4',
      url: 'https://images.unsplash.com/photo-1583912267550-d44d9c9a0586?auto=format&fit=crop&w=800&q=80',
      title: 'منطقة تطعيمات معقمة',
      caption: 'حفظ وتخزين آمن للقاحات مع تطهير فوري لكل أدوات الحقن والفحص',
      tag: 'sterilization',
      tagLabel: 'تعقيم فائق'
    }
  ],
  dermatology: [
    {
      id: 'photo-derm-1',
      url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80',
      title: 'جناح الجلدية والليزر التجميلي',
      caption: 'غرفة إجراءات مجهزة بأحدث تقنيات الليزر والعناية بالبشرة والشعر',
      tag: 'examination',
      tagLabel: 'جناح الليزر'
    },
    {
      id: 'photo-derm-2',
      url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80',
      title: 'صالة استقبال واستراحة المرضى',
      caption: 'أجواء عصرية مريحة تتسم بالخصوصية والهدوء التام',
      tag: 'reception',
      tagLabel: 'استراحة خاصة'
    },
    {
      id: 'photo-derm-3',
      url: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80',
      title: 'منظار الجلد التشخيصي (Dermatoscope)',
      caption: 'فحص ميكروسكوبي دقيق للوحمات والشعر ومشاكل الجلد التصبغية',
      tag: 'equipment',
      tagLabel: 'فحص مجهري'
    },
    {
      id: 'photo-derm-4',
      url: 'https://images.unsplash.com/photo-1583912267550-d44d9c9a0586?auto=format&fit=crop&w=800&q=80',
      title: 'أدوات عناية معقمة فردياً',
      caption: 'تغليف طبي فردي لكل أداة استخدام لضمان أعلى درجات الأمان الصحي',
      tag: 'sterilization',
      tagLabel: 'أمان بيولوجي'
    }
  ],
  cardiology: [
    {
      id: 'photo-cardio-1',
      url: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80',
      title: 'غرفة فحص القلب وتخطيط الجهد',
      caption: 'مجهزة بأحدث شاشات رسم القلب بالمجهود وجهاز إيكو القلب عالي الدقة',
      tag: 'examination',
      tagLabel: 'فحص القلب'
    },
    {
      id: 'photo-cardio-2',
      url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80',
      title: 'استقبال العيادات التخصصية',
      caption: 'استقبال فوري وإعطاء أولوية مباشرة للحالات الطارئة وأمراض الصدر',
      tag: 'reception',
      tagLabel: 'الاستقبال'
    },
    {
      id: 'photo-cardio-3',
      url: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80',
      title: 'سونار القلب والأوعية (Echocardiogram)',
      caption: 'تحليل دقيق لكفاءة عضلة القلب وصماماته بدقة رقمية 4D',
      tag: 'equipment',
      tagLabel: 'إيكو القلب 4D'
    },
    {
      id: 'photo-cardio-4',
      url: 'https://images.unsplash.com/photo-1583912267550-d44d9c9a0586?auto=format&fit=crop&w=800&q=80',
      title: 'محطة الرعاية والمراقبة',
      caption: 'أجهزة قياس الضغط ونبض القلب والتشبع بالأكسجين المعقمة باستمرار',
      tag: 'sterilization',
      tagLabel: 'مراقبة حيوية'
    }
  ]
};

/**
 * دالة استخراج وتوليد صور العيادة المعتمدة للطبيب
 */
export function getDoctorClinicPhotos(doctor: Doctor): ClinicPhotoItem[] {
  if (doctor.clinicPhotos && doctor.clinicPhotos.length > 0) {
    return doctor.clinicPhotos;
  }

  // Fallback based on specialty
  const specKey = doctor.specialtyId in SPECIALTY_PHOTO_CATALOG ? doctor.specialtyId : 'internal';
  return SPECIALTY_PHOTO_CATALOG[specKey] || SPECIALTY_PHOTO_CATALOG['internal'];
}

/**
 * دالة استخراج وحساب مؤشرات الجودة والتقييمات البصرية غير التقليدية
 */
export function getDoctorQualityMetrics(doctor: Doctor): QualityMetrics {
  if (doctor.qualityMetrics) {
    return doctor.qualityMetrics;
  }

  // Calculate realistic, deterministic metrics from doctor attributes
  const seed = (doctor.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 5);
  
  // Punctuality: 94% to 98%
  const punctualityRate = 94 + (seed % 5);
  
  // Diagnosis Clarity: 4.8 to 5.0
  const diagnosisClarity = Math.min(5.0, Math.max(4.7, Number((doctor.rating).toFixed(1))));
  
  // Sanitation: 98% or 100%
  const sanitationScore = seed % 2 === 0 ? 100 : 98;
  
  // Recommendation: 96% to 99%
  const recommendationRate = 96 + (seed % 4);

  // Extract average waiting minutes from string
  const waitMatch = doctor.waitingTime.match(/(\d+)/);
  const avgWaitingMinutes = waitMatch ? parseInt(waitMatch[1], 10) : 15;

  const verifiedPatientsCount = doctor.reviewsCount > 0 ? doctor.reviewsCount : 120 + seed * 25;

  const patientSentiments = [
    {
      tag: 'diagnosis',
      text: 'فحص إكلينيكي متأنٍ وتشخيص وافٍ',
      percentage: 97 + (seed % 3)
    },
    {
      tag: 'listening',
      text: 'استماع باهتمام وأريحية للمريض',
      percentage: 98 + (seed % 2)
    },
    {
      tag: 'punctuality',
      text: 'التزام دقيق بوقت الحضور والكشف',
      percentage: punctualityRate
    },
    {
      tag: 'clarity',
      text: 'شرح مبسط لخطة العلاج والجرعات',
      percentage: 96 + (seed % 4)
    }
  ];

  return {
    punctualityRate,
    diagnosisClarity,
    sanitationScore,
    recommendationRate,
    avgWaitingMinutes,
    verifiedPatientsCount,
    patientSentiments
  };
}
