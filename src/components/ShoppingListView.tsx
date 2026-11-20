import React, { useMemo, useState } from 'react';
import { Check, Plus, Printer, Share2, ShoppingBasket, Trash2 } from 'lucide-react';
import { UI_COPY } from '../i18n/translations';
import { FoodCategory, Language, ShoppingItem } from '../types/mizan';

interface ShoppingListViewProps {
  lang: Language;
  items: ShoppingItem[];
  onToggleItem: (id: string) => void;
  onAddManual: (name: string, category: FoodCategory, grams: number) => void;
  onRemoveItem: (id: string) => void;
  onClearChecked: () => void;
}

const CATEGORIES: FoodCategory[] = [
  'vegetables',
  'fruits',
  'legumes',
  'grains',
  'proteins',
  'fats_nuts',
];

export const ShoppingListView: React.FC<ShoppingListViewProps> = ({
  lang,
  items,
  onToggleItem,
  onAddManual,
  onRemoveItem,
  onClearChecked,
}) => {
  const copy = UI_COPY[lang];
  const [newName, setNewName] = useState('');
  const [newCat, setNewCat] = useState<FoodCategory>('vegetables');
  const [newGrams, setNewGrams] = useState(500);
  const [copiedMsg, setCopiedMsg] = useState(false);

  const grouped = useMemo(() => {
    const map: Partial<Record<FoodCategory, ShoppingItem[]>> = {};
    for (const item of items) {
      if (!map[item.category]) map[item.category] = [];
      map[item.category]!.push(item);
    }
    return map;
  }, [items]);

  const handleShare = async () => {
    const lines = items.map(
      (i) =>
        `${i.checked ? '✓' : '○'} ${lang === 'ar' ? i.nameAr : i.nameFr} (${i.grams}${copy.grams})`
    );
    const text = `MIZAN – ${copy.nav.shopping}\n\n${lines.join('\n')}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: copy.nav.shopping, text });
        return;
      } catch {
        // fallback to clipboard
      }
    }
    await navigator.clipboard.writeText(text);
    setCopiedMsg(true);
    setTimeout(() => setCopiedMsg(false), 2500);
  };

  return (
    <div className="space-y-6">
      <div className="no-print flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1C3122]">{copy.nav.shopping}</h1>
          <p className="text-sm text-[#5A665C]">
            {lang === 'ar'
              ? `${items.filter((i) => !i.checked).length} منتج متبقٍ من أصل ${items.length}`
              : `${items.filter((i) => !i.checked).length} articles restants sur ${items.length}`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleShare}
            disabled={items.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#D8CEBC] bg-white hover:bg-[#F7F3EC] text-xs font-semibold min-h-[40px] cursor-pointer disabled:opacity-40"
          >
            <Share2 className="w-4 h-4" />
            <span>
              {copiedMsg
                ? lang === 'ar'
                  ? 'تم النسخ!'
                  : 'Copié !'
                : lang === 'ar'
                ? 'مشاركة / نسخ'
                : 'Partager / Copier'}
            </span>
          </button>

          <button
            onClick={() => window.print()}
            disabled={items.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#D8CEBC] bg-white hover:bg-[#F7F3EC] text-xs font-semibold min-h-[40px] cursor-pointer disabled:opacity-40"
          >
            <Printer className="w-4 h-4" />
            <span>{lang === 'ar' ? 'طباعة' : 'Imprimer'}</span>
          </button>

          {items.some((i) => i.checked) && (
            <button
              onClick={onClearChecked}
              className="px-3.5 py-2 rounded-xl bg-[#EFE8DA] text-[#1C3122] text-xs font-semibold min-h-[40px] cursor-pointer"
            >
              {lang === 'ar' ? 'إزالة المشتراة' : 'Effacer cochés'}
            </button>
          )}
        </div>
      </div>

      {/* Add Manual Item */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!newName.trim()) return;
          onAddManual(newName.trim(), newCat, newGrams);
          setNewName('');
        }}
        className="no-print rounded-2xl bg-white border border-[#E2D9C8] p-4 flex flex-wrap items-center gap-2.5"
      >
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder={lang === 'ar' ? 'إضافة منتج يدوياً (نعناع، ليمون...)' : 'Ajouter un produit...'}
          className="flex-1 min-w-[180px] rounded-xl border border-[#D8CEBC] bg-[#FBF9F5] px-3.5 py-2.5 text-sm"
        />
        <select
          value={newCat}
          onChange={(e) => setNewCat(e.target.value as FoodCategory)}
          className="rounded-xl border border-[#D8CEBC] bg-[#FBF9F5] px-3 py-2.5 text-xs font-semibold"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {copy.categories[c]}
            </option>
          ))}
        </select>
        <input
          type="number"
          min={10}
          max={10000}
          value={newGrams}
          onChange={(e) => setNewGrams(Math.max(10, Number(e.target.value) || 100))}
          className="w-24 rounded-xl border border-[#D8CEBC] bg-[#FBF9F5] px-3 py-2.5 text-sm font-num text-center"
        />
        <button
          type="submit"
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#4F6D3A] text-white text-sm font-semibold min-h-[44px] cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{lang === 'ar' ? 'إضافة' : 'Ajouter'}</span>
        </button>
      </form>

      {/* Categorized List */}
      {items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CATEGORIES.map((cat) => {
            const catItems = grouped[cat];
            if (!catItems || catItems.length === 0) return null;
            return (
              <div
                key={cat}
                className="print-break-avoid rounded-2xl bg-white border border-[#E2D9C8] p-4 space-y-2.5"
              >
                <h2 className="font-bold text-sm text-[#4F6D3A] border-b border-[#EFE8DA] pb-2">
                  {copy.categories[cat]}
                </h2>
                <div className="divide-y divide-[#F5EFE4]">
                  {catItems.map((item) => (
                    <div key={item.id} className="py-2 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => onToggleItem(item.id)}
                        className="flex items-center gap-3 flex-1 text-start min-h-[40px] cursor-pointer"
                      >
                        <span
                          className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                            item.checked
                              ? 'bg-[#4F6D3A] border-[#4F6D3A] text-white'
                              : 'border-[#D8CEBC] bg-white'
                          }`}
                        >
                          {item.checked && <Check className="w-3.5 h-3.5" />}
                        </span>
                        <span
                          className={`text-sm font-medium ${
                            item.checked ? 'line-through text-[#5A665C]' : 'text-[#1C281E]'
                          }`}
                        >
                          {lang === 'ar' ? item.nameAr : item.nameFr}
                        </span>
                      </button>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-num text-[#5A665C]">
                          {item.grams >= 1000
                            ? `${(item.grams / 1000).toFixed(1)} kg`
                            : `${item.grams} ${copy.grams}`}
                        </span>
                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="no-print p-1.5 text-[#5A665C] hover:text-red-700 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl bg-white border border-[#E2D9C8] p-8 text-center space-y-2">
          <ShoppingBasket className="w-10 h-10 text-[#4F6D3A] mx-auto" />
          <p className="text-sm text-[#5A665C]">
            {lang === 'ar'
              ? 'قائمة المشتريات فارغة حالياً. أنشئ برنامجاً أسبوعياً ثم اضغط "تحديث قائمة المشتريات" أو أضف منتجات يدوياً.'
              : 'Liste vide. Générez un programme hebdomadaire pour remplir la liste automatiquement.'}
          </p>
        </div>
      )}
    </div>
  );
};
