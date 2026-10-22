import {
  ShieldCheck,
  Zap,
  Repeat,
  Globe,
  Award,
  CheckCircle,
  Star,
  Heart,
  TrendingUp,
  Users,
  Activity,
  Anchor,
  Aperture,
  Archive,
  ArrowRight,
  Briefcase,
  Camera,
  Cloud,
  LucideIcon,
} from 'lucide-react';

export interface CoreValueItem {
  _id: string;
  title: string;
  description: string;
  icon: string;
  order: number;
}

const ICON_MAP: Record<string, LucideIcon> = {
  ShieldCheck,
  Zap,
  Repeat,
  Globe,
  Award,
  CheckCircle,
  Star,
  Heart,
  TrendingUp,
  Users,
  Activity,
  Anchor,
  Aperture,
  Archive,
  ArrowRight,
  Briefcase,
  Camera,
  Cloud,
};

export default function WhyChooseUs({ initialReasons }: { initialReasons?: CoreValueItem[] }) {
  const reasons = initialReasons || [];

  if (reasons.length === 0) return null;

  return (
    <section className="py-10 sm:py-14 px-[5px] sm:px-4 bg-gray-50 border-y border-gray-100 relative overflow-hidden">
      <div className="absolute inset-0 bg-primary/5 pattern-grid opacity-10 pointer-events-none" />
      <div className="w-full sm:w-[90%] mx-auto px-[5px] sm:px-4 relative z-10">
        <div className="text-center mb-8 sm:mb-16">
          <span className="block text-primary font-medium tracking-[0.3em] uppercase text-xs sm:text-sm mb-2 sm:mb-4">Core Values</span>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-secondary uppercase tracking-tight sm:tracking-tighter">
            Why <span className="text-primary">LabZenix?</span>
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {reasons.map((reason) => {
            const IconComponent = ICON_MAP[reason.icon] || ShieldCheck;

            return (
              <div 
                key={reason._id} 
                className="p-10 rounded-none bg-white border border-gray-100 hover:border-primary transition-all duration-300 hover:shadow-xl group"
              >
                <div className="w-14 h-14 bg-primary/10 flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform">
                  <IconComponent className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-black mb-4 text-secondary uppercase tracking-tight">{reason.title}</h3>
                <p className="text-gray-700 leading-relaxed font-medium text-sm">{reason.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
