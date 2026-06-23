'use client';

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';

export type LeadSource = 'BroWash' | 'BroMove' | 'BroFrame' | 'BroBuild' | 'BroRent' | 'BroCare';

export type Lead = {
  id: string;
  source: LeadSource;
  domain: string;
  title: string;
  price: number;
  address: string;
  coords: [number, number];
  timestamp: number;
  status: 'new' | 'accepted' | 'completed';
  phone: string;
  comment: string;
};

type LeadsContextType = {
  leads: Lead[];
  activeLead: Lead | null;
  paused: boolean;
  setPaused: (v: boolean) => void;
  addLead: (lead: Omit<Lead, 'id' | 'timestamp' | 'status'>) => void;
  acceptLead: (id: string) => void;
  completeLead: () => void;
};

const LeadsContext = createContext<LeadsContextType | null>(null);

const SOURCE_COLORS: Record<LeadSource, string> = {
  BroWash: '#4285F4',
  BroMove: '#EA4335',
  BroFrame: '#FBBC05',
  BroBuild: '#34A853',
  BroRent: '#007AFF',
  BroCare: '#8B5CF6',
};

const SOURCE_COORDS: Record<LeadSource, [number, number][]> = {
  BroWash: [
    [55.7644, 37.6057],
    [55.7494, 37.5356],
    [55.7539, 37.6208],
    [55.7278, 37.5747],
    [55.7680, 37.5870],
  ],
  BroMove: [
    [55.7411, 37.6202],
    [55.7380, 37.5900],
    [55.7520, 37.6400],
    [55.7200, 37.5600],
  ],
  BroFrame: [
    [55.7558, 37.6173],
    [55.7600, 37.6000],
    [55.7500, 37.6300],
  ],
  BroBuild: [
    [55.7450, 37.5850],
    [55.7350, 37.6100],
    [55.7580, 37.5950],
    [55.7420, 37.6250],
    [55.7550, 37.5750],
  ],
  BroRent: [
    [55.7300, 37.6050],
    [55.7500, 37.5800],
  ],
  BroCare: [
    [55.7558, 37.6173],
  ],
};

const CITY_COORDS: Record<string, [number, number][]> = {
  moscow: [
    [55.7644, 37.6057], [55.7494, 37.5356], [55.7539, 37.6208],
    [55.7278, 37.5747], [55.7680, 37.5870], [55.7411, 37.6202],
  ],
  spb: [
    [59.9343, 30.3351], [59.9200, 30.3150], [59.9400, 30.3600],
    [59.9100, 30.3400],
  ],
  kazan: [
    [55.7887, 49.1221], [55.7900, 49.1100], [55.7850, 49.1300],
  ],
  novosibirsk: [
    [55.0084, 82.9357], [55.0100, 82.9200], [55.0050, 82.9500],
  ],
  ekb: [
    [56.8389, 60.6057], [56.8400, 60.5900], [56.8350, 60.6200],
  ],
  nizhny: [
    [56.2965, 43.9361], [56.3000, 43.9200], [56.2900, 43.9500],
  ],
  krasnodar: [
    [45.0355, 38.9753], [45.0400, 38.9600], [45.0300, 38.9900],
  ],
  samara: [
    [53.1959, 50.1002], [53.2000, 50.0900], [53.1900, 50.1100],
  ],
};

const MOCK_LEADS: Omit<Lead, 'id' | 'timestamp' | 'status'>[] = [
  { source: 'BroWash', domain: 'BroWash.ru', title: 'Химчистка дивана', price: 4500, address: 'ул. Маросейка, 11', coords: [55.7644, 37.6057], phone: '+7 (495) 123-45-67', comment: 'Диван 3-местный, светлый тканевый. Срочно к выходным, будут гости.' },
  { source: 'BroMove', domain: 'BroMove.ru', title: 'Переезд 2-комн.', price: 12000, address: 'Кутузовский просп., 36', coords: [55.7494, 37.5356], phone: '+7 (495) 234-56-78', comment: 'Переезд из 2-комнатной квартиры. Есть грузчики, нужна машина.' },
  { source: 'BroBuild', domain: 'BroBuild.ru', title: 'Ремонт сантехники', price: 8500, address: 'ул. Мясницкая, 24', coords: [55.7539, 37.6208], phone: '+7 (495) 345-67-89', comment: 'Протечка под раковиной, нужно заменить сифон и кран.' },
  { source: 'BroFrame', domain: 'BroFrame.ru', title: 'Ремонт iPhone', price: 3500, address: 'Тверская ул., 18', coords: [55.7558, 37.6173], phone: '+7 (495) 456-78-90', comment: 'Разбит экран iPhone 15, стекло целое. Замена дисплея.' },
  { source: 'BroWash', domain: 'BroWash.ru', title: 'Мытьё окон', price: 2800, address: 'Сретенка, 4/2', coords: [55.7680, 37.5870], phone: '+7 (495) 567-89-01', comment: '8 окон в квартире на 12 этаже. Балкон тоже.' },
  { source: 'BroRent', domain: 'BroRent.ru', title: 'Аренда перфоратора', price: 1500, address: 'Ленинский просп., 42', coords: [55.7300, 37.6050], phone: '+7 (495) 678-90-12', comment: 'Нужен перфоратор Bosch на день. Сверление бетона.' },
  { source: 'BroBuild', domain: 'BroBuild.ru', title: 'Установка розеток', price: 5200, address: 'ул. Новый Арбат, 15', coords: [55.7278, 37.5747], phone: '+7 (495) 789-01-23', comment: 'Установить 6 розеток и 2 выключателя в новостройке.' },
  { source: 'BroMove', domain: 'BroMove.ru', title: 'Переезд офиса', price: 25000, address: 'Большая Ордынка, 40', coords: [55.7411, 37.6202], phone: '+7 (495) 890-12-34', comment: 'Переезд офиса на 15 рабочих мест. Перенести серверы аккуратно.' },
];

export function LeadsProvider({ children }: { children: ReactNode }) {
  const [leads, setLeads] = useState<Lead[]>(() => {
    const initial: Lead[] = [];
    for (let i = 0; i < 4; i++) {
      const mock = MOCK_LEADS[i % MOCK_LEADS.length];
      const sourceCoords = SOURCE_COORDS[mock.source];
      const coords = sourceCoords[i % sourceCoords.length];
      initial.push({
        ...mock,
        id: `lead-init-${i}`,
        coords,
        timestamp: Date.now() - i * 60000,
        status: 'new',
      });
    }
    return initial;
  });
  const [activeLead, setActiveLead] = useState<Lead | null>(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const addRandom = () => {
      const mock = MOCK_LEADS[Math.floor(Math.random() * MOCK_LEADS.length)];
      const sourceCoords = SOURCE_COORDS[mock.source];
      const coords = sourceCoords[Math.floor(Math.random() * sourceCoords.length)];
      const jitter = () => (Math.random() - 0.5) * 0.005;

      setLeads((prev) => {
        const newLead: Lead = {
          ...mock,
          id: `lead-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          coords: [coords[0] + jitter(), coords[1] + jitter()],
          timestamp: Date.now(),
          status: 'new',
        };
        return [newLead, ...prev].slice(0, 20);
      });
    };

    const timer = setInterval(addRandom, 5000);
    return () => clearInterval(timer);
  }, [paused]);

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'BROVERSE_LEAD' && e.data.payload) {
        const p = e.data.payload;
        const sourceMap: Record<string, LeadSource> = {
          'BroWash.ru': 'BroWash',
          'BroMove.ru': 'BroMove',
          'BroFrame.ru': 'BroFrame',
          'BroBuild.ru': 'BroBuild',
          'BroRent.ru': 'BroRent',
          'BroCare.ru': 'BroCare',
        };
        const source = sourceMap[p.domain] ?? 'BroBuild';
        const cityId = p.city || 'moscow';
        const cityCoords = CITY_COORDS[cityId] || CITY_COORDS['moscow'];
        const coords = p.coords || cityCoords[Math.floor(Math.random() * cityCoords.length)];

        setLeads((prev) => {
          const newLead: Lead = {
            id: `lead-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            source,
            domain: p.domain,
            title: p.title,
            price: p.price,
            address: p.address || `${cityId}, новый заказ`,
            coords,
            timestamp: Date.now(),
            status: 'new',
            phone: '',
            comment: '',
          };
          return [newLead, ...prev].slice(0, 20);
        });
      }
    };

    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  const addLead = useCallback((data: Omit<Lead, 'id' | 'timestamp' | 'status'>) => {
    setLeads((prev) => {
      const newLead: Lead = {
        ...data,
        id: `lead-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: Date.now(),
        status: 'new',
      };
      return [newLead, ...prev].slice(0, 20);
    });
  }, []);

  const acceptLead = useCallback((id: string) => {
    setLeads((prev) => {
      const lead = prev.find((l) => l.id === id);
      if (lead) setActiveLead({ ...lead, status: 'accepted' });
      return prev.filter((l) => l.id !== id);
    });
  }, []);

  const completeLead = useCallback(() => {
    setActiveLead(null);
  }, []);

  return (
    <LeadsContext.Provider value={{ leads, activeLead, paused, setPaused, addLead, acceptLead, completeLead }}>
      {children}
    </LeadsContext.Provider>
  );
}

export function useLeads() {
  const ctx = useContext(LeadsContext);
  if (!ctx) throw new Error('useLeads must be used within LeadsProvider');
  return ctx;
}

export { SOURCE_COLORS };
