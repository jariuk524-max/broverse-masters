import { type DomainConfig } from '@/config/ecosystem';

interface ServiceHeroProps {
  config: DomainConfig;
  price?: number;
}

export default function ServiceHero({ config, price }: ServiceHeroProps) {
  return (
    <div className="px-4 sm:px-5 pt-6 sm:pt-8 pb-4">
      {config.images?.main && (
        <div className="relative mb-5 rounded-[24px] overflow-hidden h-52 sm:h-64">
          <img
            src={config.images.main}
            alt={config.title}
            className="w-full h-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.7))',
            }}
          />
          <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
            <h1
              className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight"
              style={{ textShadow: '0 4px 12px rgba(0,0,0,0.8)' }}
            >
              {config.hero || config.title}
            </h1>
            {config.subHero && (
              <p
                className="text-xs sm:text-sm text-white/90 mt-2 max-w-[320px] leading-relaxed"
                style={{ textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}
              >
                {config.subHero}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center gap-4">
        <div
          className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-[24px] shadow-2xl text-white text-2xl sm:text-3xl font-black"
          style={{ backgroundColor: config.color }}
        >
          {config.title.charAt(3)}
        </div>
        <div>
          <h1
            className="text-2xl sm:text-3xl font-black text-white tracking-tight"
            style={{ textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}
          >
            {config.title}
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-white/60 mt-0.5">
            {config.accent}
          </p>
        </div>
      </div>

      {price !== undefined && price > 0 && (
        <div className="mt-4 flex items-center justify-between rounded-[20px] border border-white/10 bg-white/5 backdrop-blur-xl p-4">
          <span className="text-xs sm:text-sm text-white/50">Стоимость от</span>
          <span className="text-xl sm:text-2xl font-black text-white">
            {price.toLocaleString('ru-RU')} ₽
          </span>
        </div>
      )}
    </div>
  );
}
