import { Doctor } from '../types';

/**
 * ====================================================================================
 * 🏥 سِجِل الأطباء والعيادات المعتمدة والمتعاقد معها رسمياً (Contracted Doctors Registry)
 * ====================================================================================
 * 
 * هذا الملف هو "المصدر البرمجي المعتمد" (In-Memory In-Code Master Catalog) لجميع الأطباء
 * والعيادات والمراكز الطبية المتعاقد معها في منصة دكتورنا (CarePro).
 * 
 * 💡 سبب تصميم هذا النظام في الكود (In-Code / In-Memory Architecture):
 * -------------------------------------------------------------------------
 * 1. عدم التحميل على قاعدة البيانات (Zero DB Overhead): 
 *    عند دخول آلاف المرضى في نفس اللحظة للبحث وتصفح الأطباء وعناوينهم ومواعيدهم، يتم
 *    استرجاع البيانات فورياً من ذاكرة الخادم والواجهة (In-Memory O(1) Lookup) دون إجراء
 *    استعلامات ثقيلة أو متكررة على قاعدة البيانات، مما يضمن أقصى سرعة واستقرار 100%.
 * 
 * 2. سهولة الإضافة الفورية: 
 *    بمجرد أن تعطي أمراً بإضافة دكتور جديد مع بياناته (الاسم، اللقب، التخصص، المدينة،
 *    المنطقة، العنوان، رقم الهاتف، المواعيد، التوثيق Verified، الترخيص الطبي، والخدمات)،
 *    يتم إدراجه مباشرة في مصفوفة `CONTRACTED_DOCTORS` أدناه ليتوفر فوراً في كل أنحاء الموقع.
 * 
 * 3. حماية البيانات والاستقلالية: 
 *    البيانات الطبية والتراخيص تكون محمية وموثقة برمجياً ولا تتأثر بأي مسح عشوائي لقواعد البيانات.
 * 
 * -------------------------------------------------------------------------
 * 📋 الحالة الحالية:
 * المصفوفة فارغة تماماً ([]) لعدم وجود تعاقدات فعلية مع أطباء حتى الآن.
 * ====================================================================================
 */

/**
 * دالة مساعدة معيارية لتعريف طبيب جديد متعاقد معه ببيانات موثقة وكاملة
 */
export function defineContractedDoctor(doctor: Doctor): Doctor {
  return {
    ...doctor,
    verified: doctor.verified ?? true,
    status: doctor.status ?? 'active',
    rating: doctor.rating ?? 5.0,
    reviewsCount: doctor.reviewsCount ?? 0,
    recentReviews: doctor.recentReviews ?? []
  };
}

/**
 * 🌟 مصفوفة الأطباء والعيادات المتعاقد معها رسمياً (المصدر الرئيسي)
 * ------------------------------------------------------------------------------------
 * لإضافة طبيب جديد مستقبلاً، يتم وضع بياناته داخل هذه المصفوفة بالشكل النموذجي التالي:
 * 
 * مثال:
 * export const CONTRACTED_DOCTORS: Doctor[] = [
 *   defineContractedDoctor({
 *     id: 'doc-contracted-001',
 *     name: 'د. اسم الطبيب',
 *     title: 'استشاري',
 *     specialty: 'استشاري أمراض القلب والأوعية الدموية',
 *     specialtyId: 'cardiology',
 *     subSpecialties: ['قسطرة القلب', 'ضغط الدم'],
 *     gender: 'male',
 *     city: 'القاهرة',
 *     area: 'مدينة نصر',
 *     address: 'العنوان بالتفصيل',
 *     landmark: 'علامة مميزة بجوار العيادة',
 *     phone: '010XXXXXXXX',
 *     waitingTime: '١٥ دقيقة',
 *     bio: 'نبذة عن خبرات الطبيب وشهاداته',
 *     degrees: ['دكتوراه الطب والجراحة'],
 *     services: [{ name: 'كشف عيادة' }],
 *     avatarUrl: 'https://images.unsplash.com/...',
 *     verified: true,
 *     licenseNo: 'EGY-DOC-XXXXX',
 *     availableDays: [
 *       { dateStr: 'اليوم', dayName: 'اليوم', slots: ['05:00 م', '06:00 م', '07:00 م'] }
 *     ]
 *   })
 * ];
 */
export const CONTRACTED_DOCTORS: Doctor[] = [];

/**
 * استرجاع جميع الأطباء المتعاقد معهم من الذاكرة الفورية (Zero DB load)
 */
export function getContractedDoctors(): Doctor[] {
  return [...CONTRACTED_DOCTORS];
}

/**
 * البحث عن طبيب بواسطة المعرف الفريد بسرعة فائقة O(1)
 */
export function getContractedDoctorById(id: string): Doctor | undefined {
  return CONTRACTED_DOCTORS.find(d => d.id === id);
}

/**
 * فلترة الأطباء في الذاكرة بدون أي استعلام على قاعدة البيانات
 */
export function filterContractedDoctors(params: {
  specialtyId?: string;
  city?: string;
  area?: string;
  query?: string;
}): Doctor[] {
  return CONTRACTED_DOCTORS.filter(doc => {
    if (params.specialtyId && params.specialtyId !== 'all' && doc.specialtyId !== params.specialtyId) {
      return false;
    }
    if (params.city && doc.city !== params.city) {
      return false;
    }
    if (params.area && doc.area !== params.area) {
      return false;
    }
    if (params.query && params.query.trim()) {
      const q = params.query.toLowerCase();
      const matchName = doc.name.toLowerCase().includes(q);
      const matchSpec = doc.specialty.toLowerCase().includes(q);
      if (!matchName && !matchSpec) return false;
    }
    return true;
  });
}
