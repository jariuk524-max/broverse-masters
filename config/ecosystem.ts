export type ChannelDiscount = {
  tg?: number;
  vk?: number;
  web?: number;
  insta?: number;
};

export type DomainConfig = {
  id: string;
  title: string;
  domain: string;
  accent: string;
  color: string;
  priceBase: number;
  channels: ChannelDiscount;
  description: string;
  hero?: string;
  subHero?: string;
  images?: {
    main?: string;
    process?: string;
  };
};

export const BroVerseConfig: Record<string, DomainConfig> = {
  wash: {
    id: 'wash',
    title: 'BroWash',
    domain: 'BroWash.ru',
    accent: 'Химчистка мебели',
    color: '#4682B4',
    priceBase: 1500,
    channels: { tg: 0.9, vk: 1.0, web: 1.0, insta: 0.95 },
    description: 'Химчистка мягкой мебели и матрасов. Окна, ковры, озонирование.',
    hero: 'Химчистка, которая возвращает уют',
    subHero: 'Используем технологию экстракции и составы SafeWay, чтобы твой диван был чистым и безопасным для детей.',
    images: {
      main: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=1200',
      process: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&q=80&w=800',
    },
  },
  move: {
    id: 'move',
    title: 'BroMove',
    domain: 'BroMove.ru',
    accent: 'Грузоперевозки',
    color: '#A0522D',
    priceBase: 2500,
    channels: { tg: 0.95, web: 1.0 },
    description: 'Грузоперевозки, квартирные и офисные переезды, сборка мебели.',
    hero: 'Грузоперевозки со скоростью мысли',
    subHero: 'Прозрачный тариф: от 2500₽. Свои чистые Газели и грузчики, которые не задают лишних вопросов.',
    images: {
      main: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200',
      process: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?auto=format&fit=crop&q=80&w=800',
    },
  },
  frame: {
    id: 'frame',
    title: 'BroFrame',
    domain: 'BroFrame.ru',
    accent: 'Ремонт электроники и техники',
    color: '#DAA520',
    priceBase: 1000,
    channels: { tg: 1.0, web: 1.0 },
    description: 'Ремонт сложной техники: смартфоны, ноутбуки, роботы-пылесосы.',
    hero: 'Реанимация твоей электроники',
    subHero: 'От замены экрана на iPhone до починки компрессора холодильника. Делаем при тебе с гарантией 1 год.',
    images: {
      main: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=1200',
      process: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?auto=format&fit=crop&q=80&w=800',
    },
  },
  build: {
    id: 'build',
    title: 'BroBuild',
    domain: 'BroBuild.ru',
    accent: 'Инженерия и ремонт',
    color: '#8B4513',
    priceBase: 1200,
    channels: { tg: 0.9, web: 1.0 },
    description: 'Сантехника, электрика, ремонт помещений, бытовая техника.',
    hero: 'Ремонт, который делают с душой',
    subHero: 'Сантехника, электрика, отделка — приедем в день обращения и сделаем так, как нужно вам.',
    images: {
      main: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&q=80&w=1200',
      process: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=800',
    },
  },
  rent: {
    id: 'rent',
    title: 'BroRent',
    domain: 'BroRent.ru',
    accent: 'Шеринг инструментов',
    color: '#228B22',
    priceBase: 800,
    channels: { tg: 0.95, web: 1.0 },
    description: 'Аренда профессиональных моющих пылесосов и электроинструмента.',
    hero: 'Профессиональный инструмент — без покупки',
    subHero: 'Арендуйте пылесосы Karcher, перфораторы Bosch, парогенераторы — привезём на объект и заберём обратно.',
    images: {
      main: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&q=80&w=1200',
      process: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=800',
    },
  },
  brew: {
    id: 'brew',
    title: 'BroBrew',
    domain: 'BroBrew.ru',
    accent: 'Сообщество братства',
    color: '#8B4513',
    priceBase: 0,
    channels: { tg: 1.0, web: 1.0 },
    description: 'Социальный хаб. Встречи мастеров, нетворкинг и отдых.',
  },
  care: {
    id: 'care',
    title: 'BroCare',
    domain: 'BroCare.ru',
    accent: 'Инкубатор мастеров',
    color: '#1C1C1E',
    priceBase: 0,
    channels: { tg: 1.0, web: 1.0 },
    description: 'Обучение, аттестация, Trust Level и вход в Братство.',
  },
  verse: {
    id: 'verse',
    title: 'BroVerse',
    domain: 'BroVerse.ru',
    accent: 'Сердце экосистемы',
    color: '#1a1a2e',
    priceBase: 0,
    channels: { tg: 1.0, web: 1.0 },
    description: 'Главная витрина для клиентов и точка входа в Дашборд для Мастеров.',
  },
};

export type OrderSource = 'tg' | 'vk' | 'web' | 'insta';

export function getPriceForChannel(
  domainId: string,
  source: OrderSource
): number {
  const domain = BroVerseConfig[domainId];
  if (!domain) return 0;

  const multiplier = domain.channels[source] ?? 1.0;
  return Math.round(domain.priceBase * multiplier);
}

export function getDomainByService(service: string): DomainConfig | undefined {
  return Object.values(BroVerseConfig).find(
    (d) => d.accent.toLowerCase().includes(service.toLowerCase())
  );
}

export function getAllDomains(): DomainConfig[] {
  return Object.values(BroVerseConfig);
}
