'use client';

import { useState } from 'react';
import { CheckCircle2, Star, Shield, TrendingUp, BookOpen, Award, Users, ChevronRight, Phone, MessageCircle } from 'lucide-react';

const TRUST_LEVELS = [
  { level: 1, name: 'Стажёр', min: 0, color: '#8E8E93', benefits: ['Доступ к базе заказов', 'Обучающие материалы'] },
  { level: 2, name: 'Мастер', min: 10, color: '#34A853', benefits: ['Приоритет в выдаче', 'Снижение комиссии до 15%'] },
  { level: 3, name: 'Профи', min: 30, color: '#4285F4', benefits: ['Топ в выдаче', 'Комиссия 10%', 'Бейдж Профи'] },
  { level: 4, name: 'Эксперт', min: 60, color: '#FBBC05', benefits: ['Минимальная комиссия 5%', 'Приоритетная поддержка'] },
  { level: 5, name: 'Легенда', min: 100, color: '#EA4335', benefits: ['0% комиссии', 'Эксклюзивные заказы', 'Персональный менеджер'] },
];

const TRAINING_COURSES = [
  { title: 'Основы химчистки', domain: 'BroWash', duration: '8 ч', modules: 12, color: '#4285F4' },
  { title: 'Ремонт сантехники', domain: 'BroBuild', duration: '6 ч', modules: 8, color: '#EA4335' },
  { title: 'Сборка мебели IKEA', domain: 'BroMove', duration: '4 ч', modules: 6, color: '#34A853' },
  { title: 'Ремонт техники Apple', domain: 'BroFrame', duration: '10 ч', modules: 15, color: '#FBBC05' },
];

const MASTER_STATS = [
  { label: 'Заказов выполнено', value: '47', icon: CheckCircle2, color: '#34A853' },
  { label: 'Рейтинг', value: '5.0', icon: Star, color: '#FBBC05' },
  { label: 'Trust Level', value: '3', icon: Shield, color: '#4285F4' },
  { label: 'До следующего уровня', value: '3 заказа', icon: TrendingUp, color: '#EA4335' },
];

export default function MasterPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'training' | 'profile'>('overview');

  return (
    <div className="min-h-[100dvh] bg-[#F2F2F7]">
      <header className="bg-white border-b border-zinc-100 px-4 pt-12 pb-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center">
              <Shield size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-zinc-900">Кабинет мастера</h1>
              <p className="text-xs text-zinc-400">BroCare · Инкубатор мастеров</p>
            </div>
          </div>
          <div className="flex gap-1 bg-zinc-100 rounded-xl p-1">
            {[
              { id: 'overview' as const, label: 'Обзор' },
              { id: 'training' as const, label: 'Обучение' },
              { id: 'profile' as const, label: 'Профиль' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-zinc-900 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-5 space-y-4">
        {activeTab === 'overview' && (
          <>
            <div className="grid grid-cols-2 gap-3">
              {MASTER_STATS.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="bg-white rounded-2xl p-4 border border-zinc-100">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${stat.color}15` }}>
                        <Icon size={16} style={{ color: stat.color }} />
                      </div>
                    </div>
                    <p className="text-xl font-bold text-zinc-900">{stat.value}</p>
                    <p className="text-[11px] text-zinc-400 mt-0.5">{stat.label}</p>
                  </div>
                );
              })}
            </div>

            <div className="bg-white rounded-2xl p-4 border border-zinc-100">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-zinc-900">Trust Level</h2>
                <span className="text-xs font-bold text-blue-500">Уровень 3</span>
              </div>
              <div className="h-2 bg-zinc-100 rounded-full overflow-hidden mb-3">
                <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full" style={{ width: '60%' }} />
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-500" />
                <span className="text-xs text-zinc-500">30 заказов выполнено · До уровня «Эксперт» осталось 30</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-zinc-100">
              <h2 className="text-sm font-bold text-zinc-900 mb-3">Уровни Trust</h2>
              <div className="space-y-2">
                {TRUST_LEVELS.map((level) => (
                  <div key={level.level} className="flex items-center gap-3 p-2 rounded-xl bg-zinc-50">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: level.color }}>
                      {level.level}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-zinc-800">{level.name}</p>
                      <p className="text-[10px] text-zinc-400">от {level.min} заказов</p>
                    </div>
                    {level.level === 3 && <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">Текущий</span>}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'training' && (
          <>
            <div className="bg-white rounded-2xl p-4 border border-zinc-100">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen size={18} className="text-zinc-600" />
                <h2 className="text-sm font-bold text-zinc-900">Обучающие курсы</h2>
              </div>
              <p className="text-xs text-zinc-400 mb-4">Повышайте квалификацию и получайте новые уровни Trust</p>
              <div className="space-y-3">
                {TRAINING_COURSES.map((course) => (
                  <div key={course.title} className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 border border-zinc-100">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${course.color}15` }}>
                      <Award size={18} style={{ color: course.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-zinc-800">{course.title}</p>
                      <p className="text-[10px] text-zinc-400">{course.domain} · {course.duration} · {course.modules} модулей</p>
                    </div>
                    <ChevronRight size={14} className="text-zinc-300" />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-zinc-100">
              <div className="flex items-center gap-2 mb-3">
                <Users size={18} className="text-zinc-600" />
                <h2 className="text-sm font-bold text-zinc-900">Аттестация</h2>
              </div>
              <p className="text-xs text-zinc-500 mb-3">Пройдите тест для подтверждения уровня</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-100">
                  <CheckCircle2 size={14} className="text-emerald-500" />
                  <span className="text-xs font-bold text-emerald-700">Тест по химчистке — пройден</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-50 border border-zinc-100">
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-zinc-300" />
                  <span className="text-xs text-zinc-500">Тест по сантехнике — доступен</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-50 border border-zinc-100">
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-zinc-300" />
                  <span className="text-xs text-zinc-500">Тест по сборке мебели — доступен</span>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'profile' && (
          <>
            <div className="bg-white rounded-2xl p-5 border border-zinc-100">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-zinc-900 flex items-center justify-center text-2xl font-bold text-white">
                  Е
                </div>
                <div>
                  <h2 className="text-lg font-bold text-zinc-900">Евгений</h2>
                  <p className="text-xs text-zinc-400">Мастер · Уровень 3 «Профи»</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star size={12} className="text-amber-400" fill="#FBBF24" />
                    <span className="text-xs font-bold text-zinc-700">5.0</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-600">
                  <CheckCircle2 size={10} /> Верифицирован
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-600">
                  <Shield size={10} /> Профи
                </span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-zinc-100">
              <h2 className="text-sm font-bold text-zinc-900 mb-3">Специализация</h2>
              <div className="flex flex-wrap gap-2">
                {['Химчистка мебели', 'Мойка окон', 'Чистка ковров'].map((spec) => (
                  <span key={spec} className="px-3 py-1.5 rounded-full bg-zinc-100 text-[11px] font-bold text-zinc-600">
                    {spec}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-zinc-100">
              <h2 className="text-sm font-bold text-zinc-900 mb-3">Контакты</h2>
              <div className="space-y-2">
                <a href="tel:+79001234567" className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 border border-zinc-100 hover:bg-zinc-100 transition-colors">
                  <Phone size={16} className="text-zinc-500" />
                  <span className="text-xs font-bold text-zinc-700">+7 (900) 123-45-67</span>
                </a>
                <a href="https://t.me/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 border border-zinc-100 hover:bg-zinc-100 transition-colors">
                  <MessageCircle size={16} className="text-zinc-500" />
                  <span className="text-xs font-bold text-zinc-700">Telegram</span>
                </a>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
