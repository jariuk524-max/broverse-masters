'use client';

import { useState } from 'react';
import { ChevronRight, CheckCircle2 } from 'lucide-react';
import type { ServiceCategory } from '@/lib/domains';

interface ServiceCategoriesProps {
  categories: ServiceCategory[];
  color: string;
}

export default function ServiceCategories({ categories, color }: ServiceCategoriesProps) {
  const [expanded, setExpanded] = useState<string | null>(categories[0]?.name || null);

  const toggle = (name: string) => {
    setExpanded(expanded === name ? null : name);
  };

  return (
    <div className="px-4 sm:px-5 space-y-3">
      {categories.map((category) => (
        <div
          key={category.name}
          className="rounded-[24px] border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden"
        >
          <button
            type="button"
            onClick={() => toggle(category.name)}
            className="w-full flex items-center justify-between p-4 sm:p-5 text-left hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-1 h-8 rounded-full"
                style={{ backgroundColor: color }}
              />
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white">
                  {category.name}
                </h3>
                <p className="text-[10px] sm:text-xs text-white/40">
                  {category.items.length} услуг
                </p>
              </div>
            </div>
            <ChevronRight
              size={16}
              className={`text-white/40 transition-transform ${
                expanded === category.name ? 'rotate-90' : ''
              }`}
            />
          </button>

          {expanded === category.name && (
            <div className="px-4 sm:px-5 pb-4 sm:pb-5 space-y-2">
              {category.items.map((item) => (
                <div
                  key={item.name}
                  className="flex items-start gap-3 p-3 rounded-[16px] bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <CheckCircle2 size={14} className="mt-0.5 shrink-0" style={{ color }} />
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-white">
                      {item.name}
                    </p>
                    <p className="text-[10px] sm:text-xs text-white/50 mt-0.5">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
