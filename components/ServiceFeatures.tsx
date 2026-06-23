import { Star, Shield, Clock, Award } from 'lucide-react';
import type { DomainConfig } from '@/config/ecosystem';

interface ServiceFeaturesProps {
  config: DomainConfig;
}

export default function ServiceFeatures({ config }: ServiceFeaturesProps) {
  const features = [
    { icon: Star, text: 'Проверенные мастера с Trust Level' },
    { icon: Shield, text: 'Гарантия на все виды работ' },
    { icon: Clock, text: 'Выезд в день обращения' },
    { icon: Award, text: 'Прозрачные цены без доплат' },
  ];

  return (
    <div className="px-4 sm:px-5 mt-4">
      <div className="rounded-[24px] border border-white/10 bg-white/5 backdrop-blur-xl p-4 sm:p-5">
        <h3 className="text-xs sm:text-sm font-bold text-white mb-3">
          Почему выбирают нас
        </h3>
        <div className="space-y-2.5">
          {features.map((feature) => (
            <div key={feature.text} className="flex items-center gap-2.5">
              <feature.icon size={14} style={{ color: config.color }} />
              <span className="text-[10px] sm:text-xs text-white/60">
                {feature.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
