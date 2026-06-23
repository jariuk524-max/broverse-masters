'use client';

import { useState } from 'react';
import ServiceHeader from '@/components/ServiceHeader';
import ServiceHero from '@/components/ServiceHero';
import ServiceFooter from '@/components/ServiceFooter';
import GlassCard from '@/components/GlassCard';
import SmartOrderForm from '@/components/SmartOrderForm';
import { BroVerseConfig } from '@/config/ecosystem';
import { CheckCircle2, Leaf, Mic, Star, Shield, Clock } from 'lucide-react';

const config = BroVerseConfig.wash;

const FURNITURE = [
  { id: 'sofa2', name: 'Диван 2-м', icon: '🛋️', price: 2500 },
  { id: 'sofa3', name: 'Диван 3-м', icon: '🛋️', price: 3500 },
  { id: 'armchair', name: 'Кресло', icon: '💺', price: 1500 },
  { id: 'mattress', name: 'Матрас', icon: '🛏️', price: 3000 },
  { id: 'chair', name: 'Стул', icon: '🪑', price: 800 },
  { id: 'corner', name: 'Уголок', icon: '🍳', price: 2000 },
];

const STAINS = [
  { name: 'Вино', icon: '🍷', time: '15 мин' },
  { name: 'Кофе', icon: '☕', time: '10 мин' },
  { name: 'Маркер', icon: '🖊️', time: '20 мин' },
  { name: 'Кровь', icon: '🩸', time: '25 мин' },
];

function SofaSVG({ clean }: { clean?: boolean }) {
  return (
    <svg viewBox="0 0 240 160" className="w-full h-full">
      <ellipse cx="120" cy="148" rx="90" ry="6" fill="black" opacity="0.1" />
      <rect x="25" y="38" width="190" height="48" rx="14" fill={clean ? '#F5F0E8' : '#8B7355'} />
      <rect x="20" y="78" width="200" height="52" rx="14" fill={clean ? '#EDE5D8' : '#7B6345'} />
      <rect x="28" y="82" width="58" height="42" rx="10" fill={clean ? '#FFFCF8' : '#A89070'} />
      <rect x="91" y="82" width="58" height="42" rx="10" fill={clean ? '#FFFCF8' : '#A89070'} />
      <rect x="154" y="82" width="58" height="42" rx="10" fill={clean ? '#FFFCF8' : '#A89070'} />
      {!clean && (
        <>
          <circle cx="55" cy="102" r="11" fill="#654321" opacity="0.7" />
          <circle cx="120" cy="108" r="9" fill="#8B0000" opacity="0.6" />
          <circle cx="178" cy="98" r="8" fill="#3D2B1F" opacity="0.75" />
          <ellipse cx="88" cy="112" rx="14" ry="7" fill="#5C4033" opacity="0.5" />
        </>
      )}
      {clean && (
        <>
          <path d="M60 58 L63 50 L66 58 L74 55 L66 58 L63 66 L60 58 L52 55 Z" fill="white" opacity="0.7" />
          <path d="M145 48 L148 40 L151 48 L159 45 L151 48 L148 56 L145 48 L137 45 Z" fill="white" opacity="0.6" />
        </>
      )}
      <rect x="32" y="130" width="7" height="14" rx="3" fill={clean ? '#D4C4A8' : '#5B3423'} />
      <rect x="201" y="130" width="7" height="14" rx="3" fill={clean ? '#D4C4A8' : '#5B3423'} />
    </svg>
  );
}

function BeforeAfterSlider() {
  const [tab, setTab] = useState<'sofa' | number>('sofa');
  const [pos, setPos] = useState(50);

  return (
    <GlassCard glow="#4682B4" className="mx-4">
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white">Вот наша магия ✨</h3>
            <p className="text-[10px] text-white/40 mt-0.5">Тяните ползунок и смотрите</p>
          </div>
        </div>
        <div className="flex gap-1.5 mb-4 overflow-x-auto scrollbar-none">
          <button type="button" onClick={() => setTab('sofa')}
            className={`shrink-0 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all ${tab === 'sofa' ? 'bg-white text-black' : 'bg-white/10 text-white/50'}`}>
            🛋️ Диван
          </button>
          {STAINS.map((s, i) => (
            <button key={s.name} type="button" onClick={() => setTab(i)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all ${tab === i ? 'bg-white text-black' : 'bg-white/10 text-white/50'}`}>
              {s.icon} {s.name}
            </button>
          ))}
        </div>
        <div className="relative h-44 rounded-[24px] overflow-hidden bg-black/20">
          <div className="absolute inset-0 flex items-center justify-center" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
            {tab === 'sofa' ? <SofaSVG /> : <div className="text-center"><span className="text-5xl block">{STAINS[tab as number].icon}</span><span className="text-[10px] text-red-400 font-bold block mt-2">Было</span></div>}
          </div>
          <div className="absolute inset-0 flex items-center justify-center" style={{ clipPath: `inset(0 0 0 ${pos}%)` }}>
            <div className="w-full h-full flex items-center justify-center bg-emerald-500/5">
              {tab === 'sofa' ? <SofaSVG clean /> : <div className="text-center"><span className="text-5xl block">✨</span><span className="text-[10px] text-emerald-400 font-bold block mt-2">Стало</span></div>}
            </div>
          </div>
          <input type="range" min="0" max="100" value={pos} onChange={(e) => setPos(Number(e.target.value))} className="absolute inset-0 w-full h-full opacity-0 cursor-col-resize z-10" />
          <div className="absolute inset-y-0 w-px bg-white/60 pointer-events-none z-20" style={{ left: `${pos}%` }}>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white/20 backdrop-blur-xl border border-white/40 flex items-center justify-center"><span className="text-white text-[10px]">⟷</span></div>
          </div>
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/30 backdrop-blur-sm text-[9px] font-bold text-red-400 z-30 pointer-events-none">Было</div>
          <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/30 backdrop-blur-sm text-[9px] font-bold text-emerald-400 z-30 pointer-events-none">Стало</div>
        </div>
        <p className="text-[11px] text-white/50 mt-3 text-center">
          {tab === 'sofa' ? 'Так выглядит диван после нашей химчистки — чистый, свежий, без запахов' : `Пятно от ${STAINS[tab as number].name.toLowerCase()}? Без проблем, справимся за ${STAINS[tab as number].time.toLowerCase()}`}
        </p>
      </div>
    </GlassCard>
  );
}

function QuickCalculator({ onPriceChange }: { onPriceChange: (price: number) => void }) {
  const [selected, setSelected] = useState<string[]>([]);
  const toggle = (id: string) => {
    const next = selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id];
    setSelected(next);
    const total = FURNITURE.filter((f) => next.includes(f.id)).reduce((s, f) => s + f.price, 0);
    onPriceChange(total);
  };
  const total = FURNITURE.filter((f) => selected.includes(f.id)).reduce((s, f) => s + f.price, 0);

  return (
    <GlassCard glow="#4682B4" className="mx-4">
      <div className="p-5">
        <h3 className="text-sm font-bold text-white mb-1">Сколько это стоит?</h3>
        <p className="text-[10px] text-white/40 mb-4">Выберите мебель — покажем цену сразу</p>
        <div className="grid grid-cols-3 gap-2">
          {FURNITURE.map((f) => (
            <button key={f.id} type="button" onClick={() => toggle(f.id)}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-[20px] transition-all ${selected.includes(f.id) ? 'bg-white/15 border border-white/30' : 'bg-white/5 border border-transparent hover:bg-white/10'}`}>
              <span className="text-xl">{f.icon}</span>
              <span className="text-[9px] font-bold text-white text-center leading-tight">{f.name}</span>
              <span className="text-[9px] text-[#4682B4] font-bold">{f.price} ₽</span>
            </button>
          ))}
        </div>
        {selected.length > 0 && (
          <div className="mt-4 p-3 rounded-[16px] bg-white/10 border border-white/20">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-white/60">{selected.length} {selected.length === 1 ? 'позиция' : 'позиции'}</span>
              <span className="text-lg font-black text-white">{total.toLocaleString()} ₽</span>
            </div>
            <p className="text-[10px] text-white/40 mt-1">Точную сумму скажет мастер после осмотра</p>
          </div>
        )}
      </div>
    </GlassCard>
  );
}

function TrustSection() {
  return (
    <div className="px-4 grid grid-cols-3 gap-2">
      {[{ icon: <Shield size={18} />, label: 'Гарантия', sub: 'Если не поможет — вернём деньги' }, { icon: <Clock size={18} />, label: 'Выезд', sub: 'Приедем сегодня' }, { icon: <Leaf size={18} />, label: 'SafeWay', sub: 'Без химии и запахов' }].map((b) => (
        <GlassCard key={b.label} glow="#4682B4"><div className="flex flex-col items-center gap-2 p-4 text-center"><span className="text-[#4682B4]">{b.icon}</span><span className="text-[11px] font-bold text-white">{b.label}</span><span className="text-[9px] text-white/40 leading-tight">{b.sub}</span></div></GlassCard>
      ))}
    </div>
  );
}

function EcoBlock() {
  return (
    <GlassCard glow="#22C55E" className="mx-4">
      <div className="p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-emerald-500/10"><Leaf size={18} className="text-emerald-400" /></div>
          <div><h3 className="text-sm font-bold text-white">Нам не всё равно</h3><p className="text-[10px] text-emerald-400">SafeWay — эко-химия для тех, кому важно</p></div>
        </div>
        <p className="text-[11px] text-white/50 mb-3">Мы используем SafeWay — премиальную эко-химию. Безопасна для детей, животных и аллергиков. Не воняет химией после чистки.</p>
        <div className="space-y-2">
          {['Не вызывает аллергии', 'Биоразлагаемый состав', 'Без резкого запаха'].map((t) => (
            <div key={t} className="flex items-center gap-2"><CheckCircle2 size={12} className="text-emerald-400 shrink-0" /><span className="text-[11px] text-white/60">{t}</span></div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}

function AudioDiagnostic() {
  const [recording, setRecording] = useState(false);
  const [done, setDone] = useState(false);
  const toggle = () => { if (recording) { setRecording(false); setDone(true); } else { setRecording(true); setDone(false); } };

  return (
    <GlassCard glow="#4682B4" className="mx-4">
      <div className="p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-[#4682B4]/10"><Mic size={18} className="text-[#4682B4]" /></div>
          <div><h3 className="text-sm font-bold text-white">Не знаете что сломалось?</h3><p className="text-[10px] text-white/40">Запишите звук — поймём по нему</p></div>
        </div>
        <p className="text-[11px] text-white/50 mb-3">Если техника гудит, стучит или издаёт странные звуки — запишите их. Наш мастер определит проблему ещё до выезда.</p>
        <button type="button" onClick={toggle}
          className={`w-full py-3 rounded-[16px] text-xs font-bold transition-all flex items-center justify-center gap-2 ${recording ? 'bg-red-500/20 border border-red-500/40 text-red-400 animate-pulse' : done ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400' : 'bg-[#4682B4]/20 border border-[#4682B4]/40 text-[#4682B4]'}`}>
          <Mic size={14} />{recording ? 'Записываем... нажмите когда хватит' : done ? 'Готово! Мастер прослушает' : 'Начать запись звука'}
        </button>
      </div>
    </GlassCard>
  );
}

function ReviewsBlock() {
  return (
    <div className="px-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-white">Что говорят клиенты</h3>
        <span className="text-[10px] text-white/30">4.9 ★ · 312 отзывов</span>
      </div>
      <div className="space-y-2">
        {[
          { name: 'Анна М.', text: 'Выли пятно от красного вина на диване — думала, всё, конец дивану. Мастера BroWash сделали невозможное! Диван как новый, дети снова прыгают по нему.', date: '2 дня назад' },
          { name: 'Сергей К.', text: 'Заказывали чистку матрасов. Пришли вовремя, работали аккуратно, убирали за собой. Матрас пахнет свежестью, аллергия у ребёнка прошла.', date: '5 дней назад' },
        ].map((r) => (
          <GlassCard key={r.name}>
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-white">{r.name}</span>
                <span className="text-[9px] text-white/30">{r.date}</span>
              </div>
              <div className="flex gap-0.5 mb-2">{[...Array(5)].map((_, i) => <Star key={i} size={10} className="text-yellow-400 fill-yellow-400" />)}</div>
              <p className="text-[11px] text-white/60 leading-relaxed">{r.text}</p>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}

export default function WashPage() {
  const [orderOpen, setOrderOpen] = useState(false);
  const [calcPrice, setCalcPrice] = useState(0);

  return (
    <div className="min-h-[100dvh]" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif' }}>
      <div className="fixed inset-0 -z-10 bg-black" />
      <div className="fixed inset-0 -z-10"><div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-[#4682B4]/10 blur-[120px]" /><div className="absolute bottom-0 right-0 w-[400px] h-[300px] rounded-full bg-[#4682B4]/5 blur-[100px]" /></div>
      <ServiceHeader config={config} />
      <main className="mx-auto max-w-lg pb-32 pt-4 space-y-4">
        <ServiceHero config={config} price={calcPrice} />
        <BeforeAfterSlider />
        <QuickCalculator onPriceChange={setCalcPrice} />
        <TrustSection />
        <EcoBlock />
        <AudioDiagnostic />
        <ReviewsBlock />
      </main>
      <ServiceFooter config={config} onOrder={() => setOrderOpen(true)} />
      <SmartOrderForm isOpen={orderOpen} onClose={() => setOrderOpen(false)} domainId="wash" price={calcPrice} />
    </div>
  );
}
