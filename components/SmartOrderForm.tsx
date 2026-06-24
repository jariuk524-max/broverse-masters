'use client';

import { useState, useEffect } from 'react';
import { Camera, ArrowRight, Check, Phone, MessageCircle, X, ChevronRight, Zap } from 'lucide-react';

const SERVICES: Record<string, { icon: string; name: string; desc: string }> = {
  wash: { icon: '🧹', name: 'Химчистка', desc: 'Мебель, окна, ковры' },
  build: { icon: '🔧', name: 'Ремонт', desc: 'Сантехника, электрика' },
  frame: { icon: '📱', name: 'Техника', desc: 'Смартфоны, ноутбуки' },
  move: { icon: '🚚', name: 'Переезд', desc: 'Грузоперевозки' },
  rent: { icon: '🧰', name: 'Инструмент', desc: 'Аренда пылесосов' },
};

const CITIES = [
  { id: 'moscow', name: 'Москва', coords: [55.7558, 37.6173] as [number, number] },
  { id: 'spb', name: 'Санкт-Петербург', coords: [59.9343, 30.3351] as [number, number] },
  { id: 'kazan', name: 'Казань', coords: [55.7887, 49.1221] as [number, number] },
  { id: 'novosibirsk', name: 'Новосибирск', coords: [55.0084, 82.9357] as [number, number] },
  { id: 'ekb', name: 'Екатеринбург', coords: [56.8389, 60.6057] as [number, number] },
  { id: 'nizhny', name: 'Нижний Новгород', coords: [56.2965, 43.9361] as [number, number] },
  { id: 'krasnodar', name: 'Краснодар', coords: [45.0355, 38.9753] as [number, number] },
  { id: 'samara', name: 'Самара', coords: [53.1959, 50.1002] as [number, number] },
];

const TIME_SLOTS = [
  'Сейчас (срочно)',
  'Сегодня 14:00',
  'Сегодня 18:00',
  'Завтра 10:00',
  'Завтра 14:00',
];

interface SmartOrderFormProps {
  isOpen: boolean;
  onClose: () => void;
  domainId?: string;
  price?: number;
}

export default function SmartOrderForm({ isOpen, onClose, domainId, price }: SmartOrderFormProps) {
  const [step, setStep] = useState(1);
  const [service, setService] = useState(domainId || '');
  const [city, setCity] = useState('moscow');
  const [timeSlot, setTimeSlot] = useState('');
  const [photo, setPhoto] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (domainId) {
      setService(domainId);
      setStep(2);
    }
  }, [domainId]);

  useEffect(() => {
    if (isOpen) {
      setStep(domainId ? 2 : 1);
      setTimeSlot('');
      setPhoto(false);
      setName('');
      setPhone('');
      setSubmitted(false);
    }
  }, [isOpen, domainId]);

  if (!isOpen) return null;

  const svc = SERVICES[service];

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full sm:max-w-[400px] mx-4 mb-4 sm:mb-0">
        <div className="bg-[#1a1a1a]/95 backdrop-blur-3xl border border-white/10 rounded-[32px] p-6 text-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)]">
          <button type="button" onClick={onClose}
            className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
            <X size={14} />
          </button>

          <div className="flex gap-1.5 mb-6">
            {[1, 2, 3, 4, 5].map((s) => (
              <div key={s} className={`h-1 flex-1 rounded-full transition-all ${step >= s ? 'bg-white' : 'bg-white/20'}`} />
            ))}
          </div>

          {submitted ? (
            <div className="text-center py-8">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 mb-4">
                <Check size={32} className="text-emerald-400" />
              </div>
              <h3 className="text-xl font-black mb-2">Заявка отправлена!</h3>
              <p className="text-sm text-white/50 mb-6">Мастер свяжется через 5 минут</p>
              <button type="button" onClick={onClose}
                className="w-full py-3 rounded-[16px] bg-white/10 text-sm font-bold">
                Закрыть
              </button>
            </div>
          ) : (
            <>
              {step === 1 && (
                <div>
                  <h3 className="text-lg font-black mb-1">Что нужно?</h3>
                  <p className="text-[11px] text-white/40 mb-4">Выберите услугу</p>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(SERVICES).map(([id, s]) => (
                      <button key={id} type="button" onClick={() => { setService(id); setStep(2); }}
                        className="flex items-center gap-3 p-3 rounded-[40px] bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-left">
                        <span className="text-xl">{s.icon}</span>
                        <div>
                          <p className="text-xs font-bold">{s.name}</p>
                          <p className="text-[9px] text-white/40">{s.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div>
                  <h3 className="text-lg font-black mb-1">Город</h3>
                  <p className="text-[11px] text-white/40 mb-4">Где нужна помощь?</p>
                  <div className="grid grid-cols-2 gap-2 max-h-[280px] overflow-y-auto scrollbar-none">
                    {CITIES.map((c) => (
                      <button key={c.id} type="button" onClick={() => { setCity(c.id); setStep(3); }}
                        className={`flex items-center gap-3 p-3 rounded-[40px] border transition-all text-left ${
                          city === c.id ? 'bg-white/15 border-white/30' : 'bg-white/5 border-white/10 hover:bg-white/10'
                        }`}>
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                          <span className="text-xs">📍</span>
                        </div>
                        <span className="text-xs font-bold">{c.name}</span>
                      </button>
                    ))}
                  </div>
                  <button type="button" onClick={() => setStep(1)} className="mt-3 w-full py-2.5 rounded-[12px] bg-white/10 text-[11px] font-bold">Назад</button>
                </div>
              )}

              {step === 3 && (
                <div>
                  <h3 className="text-lg font-black mb-1">Прикрепи фото</h3>
                  <p className="text-[11px] text-white/40 mb-4">{svc?.name} — для точной оценки</p>
                  <label className="block border-2 border-dashed border-white/20 rounded-[40px] h-28 flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-all">
                    {photo ? (
                      <div className="flex items-center gap-2 text-emerald-400">
                        <Check size={18} />
                        <span className="text-xs font-bold">Фото загружено</span>
                      </div>
                    ) : (
                      <>
                        <Camera size={24} className="text-white/30 mb-2" />
                        <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider">Нажмите для фото</span>
                      </>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={() => setPhoto(true)} />
                  </label>
                  <div className="flex gap-2 mt-4">
                    <button type="button" onClick={() => setStep(2)} className="flex-1 py-3 rounded-[16px] bg-white/10 text-xs font-bold">Назад</button>
                    <button type="button" onClick={() => setStep(4)} className="flex-[2] py-3 rounded-[16px] bg-white text-black text-xs font-bold flex items-center justify-center gap-1">
                      Далее <ChevronRight size={12} />
                    </button>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div>
                  <h3 className="text-lg font-black mb-1">Когда приехать?</h3>
                  <p className="text-[11px] text-white/40 mb-4">Выберите удобное время</p>
                  <div className="space-y-2">
                    {TIME_SLOTS.map((slot) => (
                      <button key={slot} type="button" onClick={() => setTimeSlot(slot)}
                        className={`w-full p-3 rounded-[16px] text-xs font-bold transition-all text-left flex items-center gap-3 ${
                          timeSlot === slot ? 'bg-white text-black' : 'bg-white/5 text-white/60 hover:bg-white/10'
                        }`}>
                        {timeSlot === slot ? <Check size={14} /> : <div className="h-3.5 w-3.5 rounded-full border border-white/20" />}
                        {slot}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button type="button" onClick={() => setStep(3)} className="flex-1 py-3 rounded-[16px] bg-white/10 text-xs font-bold">Назад</button>
                    <button type="button" onClick={() => setStep(5)} disabled={!timeSlot}
                      className="flex-[2] py-3 rounded-[16px] bg-white text-black text-xs font-bold disabled:opacity-30 flex items-center justify-center gap-1">
                      Далее <ChevronRight size={12} />
                    </button>
                  </div>
                </div>
              )}

              {step === 5 && (
                <div>
                  <h3 className="text-lg font-black mb-1">Контакты и адрес</h3>
                  <p className="text-[11px] text-white/40 mb-2">Мастер свяжется через 5 минут</p>
                  {price && price > 0 && (
                    <div className="mb-3 p-3 rounded-[14px] bg-white/10 border border-white/20">
                      <p className="text-[10px] text-white/40">Ориентировочная стоимость</p>
                      <p className="text-xl font-black text-white">{price.toLocaleString()} ₽</p>
                    </div>
                  )}
                  <div className="space-y-2.5">
                    <input type="text" placeholder="Ваше имя" value={name} onChange={(e) => setName(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-[14px] px-4 py-2.5 text-sm outline-none focus:border-white/30" />
                    <input type="tel" placeholder="+7 (___) ___-__-__" value={phone} onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-[14px] px-4 py-2.5 text-sm outline-none focus:border-white/30" />
                    <div className="relative">
                      <input type="text" placeholder="Точный адрес (улица, дом, квартира)" value={address} onChange={(e) => setAddress(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-[14px] px-4 py-2.5 text-sm outline-none focus:border-white/30 pr-8" />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 text-sm">📍</span>
                    </div>
                    <textarea placeholder="Комментарий к заказу (что нужно сделать, особенности, этаж...)" value={comment} onChange={(e) => setComment(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-[14px] px-4 py-2.5 text-sm outline-none focus:border-white/30 resize-none h-16" />
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button type="button" onClick={() => setStep(4)} className="flex-1 py-2.5 rounded-[14px] bg-white/10 text-xs font-bold">Назад</button>
                    <button type="button" onClick={async () => {
                      const svc = SERVICES[service];
                      const selectedCity = CITIES.find((c) => c.id === city);
                      const fullAddress = address ? `${selectedCity?.name || city}, ${address}` : `${selectedCity?.name || city}`;
                      const payload = {
                        domain: `${service}.ru`,
                        service: svc?.name || service,
                        price: price || 0,
                        name,
                        phone,
                        city: selectedCity?.name || city,
                        address: fullAddress,
                        comment,
                        from: 'web',
                      };

                      try {
                        await fetch('/api/orders', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(payload),
                        });

                        window.postMessage({
                          type: 'BROVERSE_LEAD',
                          payload: {
                            domain: `${service}.ru`,
                            title: `${svc?.name || service} — ${name}`,
                            price: price || 0,
                            address: fullAddress,
                            city: selectedCity?.id || city,
                            coords: selectedCity?.coords || [55.7558, 37.6173],
                          },
                        }, '*');
                      } catch (err) {
                        console.error('[SmartOrderForm]', err);
                      }

                      setSubmitted(true);
                    }} disabled={!name || !phone}
                      className="flex-[2] py-3 rounded-[16px] bg-white text-black text-xs font-black disabled:opacity-30 flex items-center justify-center gap-1">
                      <Zap size={12} /> {price ? `Заказать за ${price.toLocaleString()} ₽` : 'Отправить'}
                    </button>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <a href="tel:+79001234567" className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-[12px] bg-white/5 text-[10px] font-bold text-white/50">
                      <Phone size={10} /> Звонок
                    </a>
                    <a href="https://t.me/" target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-[12px] bg-white/5 text-[10px] font-bold text-white/50">
                      <MessageCircle size={10} /> Telegram
                    </a>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
