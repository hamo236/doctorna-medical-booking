import React from 'react';
import { 
  Stethoscope, 
  Activity, 
  Sparkles, 
  Smile, 
  Baby, 
  Bone, 
  Heart, 
  Eye, 
  ShieldCheck
} from 'lucide-react';

interface DoctorAvatarProps {
  specialtyId?: string;
  gender?: 'male' | 'female';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  verified?: boolean;
}

export const DoctorAvatar: React.FC<DoctorAvatarProps> = ({
  specialtyId = 'internal',
  size = 'md',
  className = '',
  verified = true
}) => {
  // Select specialty medical emblem - clean, cohesive medical palette
  const getSpecialtyIcon = () => {
    switch (specialtyId) {
      case 'internal':
        return <Activity className="w-1/2 h-1/2 text-[#0070cd]" />;
      case 'dermatology':
        return <Sparkles className="w-1/2 h-1/2 text-[#0070cd]" />;
      case 'dentistry':
        return <Smile className="w-1/2 h-1/2 text-[#0070cd]" />;
      case 'pediatrics':
        return <Baby className="w-1/2 h-1/2 text-[#0070cd]" />;
      case 'orthopedics':
        return <Bone className="w-1/2 h-1/2 text-[#0070cd]" />;
      case 'cardiology':
        return <Heart className="w-1/2 h-1/2 text-[#0070cd]" />;
      case 'ophthalmology':
        return <Eye className="w-1/2 h-1/2 text-[#0070cd]" />;
      default:
        return <Stethoscope className="w-1/2 h-1/2 text-[#0070cd]" />;
    }
  };

  const sizeClasses = {
    sm: 'w-10 h-10 rounded-xl',
    md: 'w-14 h-14 rounded-2xl',
    lg: 'w-20 h-20 sm:w-24 sm:h-24 rounded-2xl',
    xl: 'w-28 h-28 rounded-3xl'
  }[size];

  return (
    <div className={`relative shrink-0 ${className}`}>
      <div 
        className={`${sizeClasses} bg-slate-50 border border-slate-200/90 flex flex-col items-center justify-center shadow-xs select-none`}
        title="عيادة طبية تخصصية معتمدة"
      >
        {getSpecialtyIcon()}
        <span className="text-[9px] font-bold tracking-tight text-slate-600 mt-0.5">
          عيادة معتمدة
        </span>
      </div>

      {verified && (
        <div 
          className="absolute -bottom-1 -left-1 bg-emerald-600 text-white p-1 rounded-full border-2 border-white shadow-xs" 
          title="عيادة مسجلة وموثقة"
        >
          <ShieldCheck className="w-3 h-3 stroke-[3]" />
        </div>
      )}
    </div>
  );
};

