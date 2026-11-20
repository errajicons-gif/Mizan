import React, { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { MOROCCAN_FOODS } from '../data/moroccanFoods';
import { UI_COPY } from '../i18n/translations';
import { FoodCategory, FoodState, Language } from '../types/mizan';

interface FoodDatabaseViewProps {
  lang: Language;
}

const CATEGORIES: FoodCategory[] = [
  'grains',
  'legumes',
  'vegetables',
  'fruits',
  'proteins',
  'fats_nuts',
];

export const FoodDatabaseView: React.FC<FoodDatabaseViewProps> = ({ lang }) => {
  const copy = UI_COPY[lang];
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<FoodCategory | 'all'>('all');
  const [stateFilter, setStateFilter] = useState<FoodState | 'all'>('all');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return MOROCCAN_FOODS.filter((f) => {
      const catOk = category === 'all' || f.category === category;
      const stateOk = stateFilter === 'all' || f.state === stateFilter;
      const qOk = !q || f.nameAr.toLowerCase().includes(q) || f.nameFr.toLowerCase().includes(q);
      return catOk && stateOk && qOk;
    });
  }, [search, category, stateFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1C3122]">{copy.nav.foods}</h1>
          <p className="text-sm text-[#5A665C]">
            {lang === 'ar'
              ? `القيم لكل 100 غرام موثقة من USDA و ANSES-CIQUAL و FAO INFOODS (${MOROCCAN_FOODS.length} مادة غذائية)`
              : `Valeurs pour 100 g vérifiées (USDA, ANSES-CIQUAL, FAO INFOODS) — ${MOROCCAN_FOODS.length} aliments`}
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-[#5A665C] absolute top-3 start-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={lang === 'ar' ? 'بحث بالعربية أو الفرنسية...' : 'Rechercher (AR/FR)...'}
            className="w-full rounded-xl border border-[#D8CEBC] bg-white ps-10 pe-4 py-2.5 text-sm"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setCategory('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap min-h-[40px] cursor-pointer ${
              category === 'all'
                ? 'bg-[#1C3122] text-white'
                : 'bg-white border border-[#E2D9C8] text-[#5A665C]'
            }`}
          >
            {lang === 'ar' ? 'جميع الفئات' : 'Toutes catégories'}
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap min-h-[40px] cursor-pointer ${
                category === c
                  ? 'bg-[#4F6D3A] text-white'
                  : 'bg-white border border-[#E2D9C8] text-[#5A665C]'
              }`}
            >
              {copy.categories[c]}
            </button>
          ))}
        </div>

        <select
          value={stateFilter}
          onChange={(e) => setStateFilter(e.target.value as FoodState | 'all')}
          className="rounded-xl border border-[#D8CEBC] bg-white px-3.5 py-2 text-xs font-semibold min-h-[40px]"
        >
          <option value="all">{lang === 'ar' ? 'كل الحالات (نيئ/مطبوخ/مجفف)' : 'Tous états'}</option>
          <option value="raw">{copy.foodStates.raw}</option>
          <option value="cooked">{copy.foodStates.cooked}</option>
          <option value="dried">{copy.foodStates.dried}</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white border border-[#E2D9C8] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-start">
            <thead className="bg-[#F7F3EC] border-b border-[#E2D9C8] text-xs font-bold text-[#1C3122]">
              <tr>
                <th className="py-3 px-4 text-start">{lang === 'ar' ? 'الغذاء (عربي / فرنسي)' : 'Aliment (AR / FR)'}</th>
                <th className="py-3 px-3 text-start">{lang === 'ar' ? 'الحالة' : 'État'}</th>
                <th className="py-3 px-3 text-end">{copy.kcal}</th>
                <th className="py-3 px-3 text-end">{copy.protein}</th>
                <th className="py-3 px-3 text-end">{copy.fat}</th>
                <th className="py-3 px-3 text-end">{copy.carbs}</th>
                <th className="py-3 px-3 text-end">{copy.fiber}</th>
                <th className="py-3 px-4 text-start">{lang === 'ar' ? 'المصدر' : 'Source'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5EFE4]">
              {filtered.map((f) => (
                <tr key={f.id} className="hover:bg-[#FBF9F5]">
                  <td className="py-3 px-4">
                    <div className="font-bold text-[#1C281E]">{f.nameAr}</div>
                    <div className="text-xs text-[#5A665C]">{f.nameFr}</div>
                  </td>
                  <td className="py-3 px-3 text-xs text-[#4F6D3A] font-semibold whitespace-nowrap">
                    {copy.foodStates[f.state]}
                  </td>
                  <td className="py-3 px-3 text-end font-num font-bold text-[#1C3122]">{f.kcal}</td>
                  <td className="py-3 px-3 text-end font-num">{f.protein}g</td>
                  <td className="py-3 px-3 text-end font-num">{f.fat}g</td>
                  <td className="py-3 px-3 text-end font-num">{f.carbs}g</td>
                  <td className="py-3 px-3 text-end font-num">{f.fiber}g</td>
                  <td className="py-3 px-4 text-xs text-[#5A665C] whitespace-nowrap">
                    {f.dataSource}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
