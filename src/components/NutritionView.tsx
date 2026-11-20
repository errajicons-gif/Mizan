import React, { useMemo, useState } from 'react';
import {
  ChefHat,
  Plus,
  PlusCircle,
  Search,
  ShoppingBag,
  Trash2,
  UtensilsCrossed,
} from 'lucide-react';
import { FOODS_BY_ID, MOROCCAN_FOODS } from '../data/moroccanFoods';
import { IMG_HERO_TABLE } from '../data/moroccanRecipes';
import { UI_COPY } from '../i18n/translations';
import {
  FoodItem,
  Language,
  MealLogEntry,
  MealSlot,
  Recipe,
  RecipeIngredient,
  UserProfile,
} from '../types/mizan';
import {
  calculateDailyReference,
  calculateFoodNutrition,
  calculateRecipeNutrition,
  findKitchenMatches,
  sumNutrition,
} from '../utils/nutrition';
import { RecipeCard } from './RecipeCard';

interface NutritionViewProps {
  lang: Language;
  profile: UserProfile;
  allRecipes: Recipe[];
  mealLogs: MealLogEntry[];
  initialSubTab?: string;
  onAddLog: (entry: Omit<MealLogEntry, 'id' | 'createdAt'>) => void;
  onDeleteLog: (id: string) => void;
  onSaveCustomRecipe: (recipe: Recipe) => void;
  onAddMissingToShopping: (foodIds: string[]) => void;
}

const KITCHEN_STAPLES = [
  'eggs_cooked',
  'tomato_raw',
  'sardine_grilled',
  'barley_bread',
  'olive_oil',
  'lentils_cooked',
  'potato_cooked',
  'onion_raw',
  'carrot_raw',
  'chickpeas_cooked',
  'bell_pepper_raw',
  'eggplant_raw',
];

export const NutritionView: React.FC<NutritionViewProps> = ({
  lang,
  profile,
  allRecipes,
  mealLogs,
  initialSubTab,
  onAddLog,
  onDeleteLog,
  onSaveCustomRecipe,
  onAddMissingToShopping,
}) => {
  const copy = UI_COPY[lang];
  const [subTab, setSubTab] = useState<'log' | 'kitchen' | 'custom'>(
    initialSubTab === 'kitchen' ? 'kitchen' : initialSubTab === 'custom' ? 'custom' : 'log'
  );

  // Daily Log State
  const todayStr = new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedSlot, setSelectedSlot] = useState<MealSlot>('lunch');
  const [searchMode, setSearchMode] = useState<'food' | 'recipe'>('food');
  const [query, setQuery] = useState('');
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(MOROCCAN_FOODS[0]);
  const [grams, setGrams] = useState<number>(100);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(allRecipes[0] || null);
  const [servingsCount, setServingsCount] = useState<number>(1);

  // What's in my kitchen state
  const [kitchenIds, setKitchenIds] = useState<string[]>(['eggs_cooked', 'tomato_raw', 'olive_oil']);
  const [kitchenSearch, setKitchenSearch] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  // Custom Recipe Builder state
  const [customNameAr, setCustomNameAr] = useState('');
  const [customNameFr, setCustomNameFr] = useState('');
  const [customServings, setCustomServings] = useState(2);
  const [customPrepMin, setCustomPrepMin] = useState(25);
  const [customIngs, setCustomIngs] = useState<RecipeIngredient[]>([]);
  const [ingSearch, setIngSearch] = useState('');
  const [ingGrams, setIngGrams] = useState(100);

  const showNotice = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  };

  const ref = calculateDailyReference(profile);
  const dateLogs = useMemo(
    () => mealLogs.filter((l) => l.date === selectedDate),
    [mealLogs, selectedDate]
  );
  const dayTotals = useMemo(
    () => sumNutrition(dateLogs.map((l) => l.nutrition)),
    [dateLogs]
  );

  const filteredFoods = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return MOROCCAN_FOODS.slice(0, 12);
    return MOROCCAN_FOODS.filter(
      (f) => f.nameAr.toLowerCase().includes(q) || f.nameFr.toLowerCase().includes(q)
    );
  }, [query]);

  const filteredRecipes = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allRecipes.slice(0, 12);
    return allRecipes.filter(
      (r) => r.nameAr.toLowerCase().includes(q) || r.nameFr.toLowerCase().includes(q)
    );
  }, [query, allRecipes]);

  const handleLogSelectedFood = () => {
    if (!selectedFood || grams <= 0) return;
    const nutrition = calculateFoodNutrition(selectedFood, grams);
    onAddLog({
      date: selectedDate,
      slot: selectedSlot,
      type: 'food',
      refId: selectedFood.id,
      nameAr: `${selectedFood.nameAr} (${copy.foodStates[selectedFood.state]})`,
      nameFr: `${selectedFood.nameFr} (${copy.foodStates[selectedFood.state]})`,
      amount: grams,
      unitLabelAr: copy.grams,
      unitLabelFr: copy.grams,
      nutrition,
    });
    showNotice(lang === 'ar' ? 'تم تسجيل الغذاء بنجاح' : 'Aliment enregistré');
  };

  const handleLogSelectedRecipe = () => {
    if (!selectedRecipe || servingsCount <= 0) return;
    const { perServing } = calculateRecipeNutrition(selectedRecipe);
    const nutrition = {
      kcal: Math.round(perServing.kcal * servingsCount),
      protein: Math.round(perServing.protein * servingsCount * 10) / 10,
      fat: Math.round(perServing.fat * servingsCount * 10) / 10,
      carbs: Math.round(perServing.carbs * servingsCount * 10) / 10,
      fiber: Math.round(perServing.fiber * servingsCount * 10) / 10,
    };
    onAddLog({
      date: selectedDate,
      slot: selectedSlot,
      type: 'recipe',
      refId: selectedRecipe.id,
      nameAr: selectedRecipe.nameAr,
      nameFr: selectedRecipe.nameFr,
      amount: servingsCount,
      unitLabelAr: copy.serving,
      unitLabelFr: copy.serving,
      nutrition,
    });
    showNotice(lang === 'ar' ? 'تم تسجيل الوصفة في يومك' : 'Recette enregistrée');
  };

  const kitchenMatches = useMemo(
    () => findKitchenMatches(kitchenIds, allRecipes),
    [kitchenIds, allRecipes]
  );

  const kitchenSearchResults = useMemo(() => {
    const q = kitchenSearch.trim().toLowerCase();
    if (!q) return [];
    return MOROCCAN_FOODS.filter(
      (f) => f.nameAr.toLowerCase().includes(q) || f.nameFr.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [kitchenSearch]);

  const customPreviewNutrition = useMemo(() => {
    if (customIngs.length === 0) return null;
    const tempRecipe: Recipe = {
      id: 'preview',
      nameAr: customNameAr || 'وصفة خاصة',
      nameFr: customNameFr || 'Recette perso',
      tags: ['balanced'],
      mealSlots: ['lunch'],
      prepMinutes: customPrepMin,
      servings: Math.max(1, customServings),
      budgetTier: 'moderate',
      season: 'all',
      imageUrl: IMG_HERO_TABLE,
      ingredients: customIngs,
      stepsAr: [],
      stepsFr: [],
      healthyTipAr: '',
      healthyTipFr: '',
    };
    return calculateRecipeNutrition(tempRecipe);
  }, [customIngs, customNameAr, customNameFr, customServings, customPrepMin]);

  const handleSaveCustom = () => {
    if (!customNameAr.trim() || customIngs.length === 0) return;
    const newRecipe: Recipe = {
      id: `custom_${Date.now()}`,
      nameAr: customNameAr.trim(),
      nameFr: customNameFr.trim() || customNameAr.trim(),
      tags: ['balanced'],
      mealSlots: ['lunch', 'dinner', 'breakfast'],
      prepMinutes: customPrepMin,
      servings: Math.max(1, customServings),
      budgetTier: 'moderate',
      season: 'all',
      imageUrl: IMG_HERO_TABLE,
      ingredients: customIngs,
      stepsAr: [lang === 'ar' ? 'وصفة شخصية مضافة من المستخدم.' : 'Recette personnelle.'],
      stepsFr: ['Recette personnelle ajoutée par l’utilisateur.'],
      healthyTipAr: 'وصفة محسوبة مباشرة من قاعدة البيانات الغذائية المغربية.',
      healthyTipFr: 'Valeurs calculées directement depuis la base nutritionnelle.',
      isCustom: true,
    };
    onSaveCustomRecipe(newRecipe);
    setCustomNameAr('');
    setCustomNameFr('');
    setCustomIngs([]);
    showNotice(lang === 'ar' ? 'تم حفظ وصفتك الخاصة في مكتبة الوصفات' : 'Recette personnelle enregistrée');
  };

  return (
    <div className="space-y-6">
      {/* Sub-navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-[#1C3122]">{copy.nav.nutrition}</h1>
        <div className="flex items-center gap-1 p-1 bg-white border border-[#E2D9C8] rounded-xl">
          <button
            onClick={() => setSubTab('log')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold min-h-[38px] cursor-pointer ${
              subTab === 'log' ? 'bg-[#1C3122] text-white' : 'text-[#5A665C] hover:text-[#1C3122]'
            }`}
          >
            {lang === 'ar' ? 'حاسبة السعرات واليوم' : 'Calculateur & Journal'}
          </button>
          <button
            onClick={() => setSubTab('kitchen')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold min-h-[38px] cursor-pointer ${
              subTab === 'kitchen' ? 'bg-[#1C3122] text-white' : 'text-[#5A665C] hover:text-[#1C3122]'
            }`}
          >
            {lang === 'ar' ? 'ماذا أطبخ اليوم؟' : 'Que cuisiner ?'}
          </button>
          <button
            onClick={() => setSubTab('custom')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold min-h-[38px] cursor-pointer ${
              subTab === 'custom' ? 'bg-[#1C3122] text-white' : 'text-[#5A665C] hover:text-[#1C3122]'
            }`}
          >
            {lang === 'ar' ? 'وصفة خاصة' : 'Créer une recette'}
          </button>
        </div>
      </div>

      {toast && (
        <div className="rounded-xl bg-[#1C3122] text-white px-4 py-3 text-sm font-medium">
          {toast}
        </div>
      )}

      {/* TAB 1: Calorie Calculator & Daily Log */}
      {subTab === 'log' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Calculator & Input */}
          <div className="lg:col-span-6 rounded-2xl bg-white border border-[#E2D9C8] p-5 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-bold text-base text-[#1C3122]">
                {lang === 'ar' ? 'حاسبة الأغذية الدقيقة' : 'Calculateur alimentaire exact'}
              </h2>
              <div className="flex items-center gap-1 p-1 bg-[#F7F3EC] rounded-lg">
                <button
                  onClick={() => setSearchMode('food')}
                  className={`px-3 py-1 rounded-md text-xs font-semibold cursor-pointer ${
                    searchMode === 'food' ? 'bg-white text-[#1C3122]' : 'text-[#5A665C]'
                  }`}
                >
                  {lang === 'ar' ? 'أغذية (بالغرام)' : 'Aliments (g)'}
                </button>
                <button
                  onClick={() => setSearchMode('recipe')}
                  className={`px-3 py-1 rounded-md text-xs font-semibold cursor-pointer ${
                    searchMode === 'recipe' ? 'bg-white text-[#1C3122]' : 'text-[#5A665C]'
                  }`}
                >
                  {lang === 'ar' ? 'أطباق جاهزة' : 'Recettes'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#5A665C] mb-1">
                  {lang === 'ar' ? 'التاريخ' : 'Date'}
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full rounded-xl border border-[#D8CEBC] bg-[#FBF9F5] px-3 py-2 text-xs font-num"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#5A665C] mb-1">
                  {lang === 'ar' ? 'الوجبة' : 'Repas'}
                </label>
                <select
                  value={selectedSlot}
                  onChange={(e) => setSelectedSlot(e.target.value as MealSlot)}
                  className="w-full rounded-xl border border-[#D8CEBC] bg-[#FBF9F5] px-3 py-2 text-xs"
                >
                  {(Object.keys(copy.mealSlots) as MealSlot[]).map((s) => (
                    <option key={s} value={s}>
                      {copy.mealSlots[s]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-[#5A665C] absolute top-3 start-3.5" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={
                  lang === 'ar'
                    ? 'ابحث عن غذاء أو طبق (خبز الشعير، سردين، عدس مطبوخ...)'
                    : 'Rechercher un aliment ou plat...'
                }
                className="w-full rounded-xl border border-[#D8CEBC] bg-[#FBF9F5] ps-10 pe-4 py-2.5 text-sm"
              />
            </div>

            {searchMode === 'food' ? (
              <>
                <div className="max-h-52 overflow-y-auto divide-y divide-[#F5EFE4] border border-[#EFE8DA] rounded-xl">
                  {filteredFoods.map((f) => {
                    const active = selectedFood?.id === f.id;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setSelectedFood(f)}
                        className={`w-full px-3.5 py-2.5 flex items-center justify-between text-start text-sm transition-colors cursor-pointer ${
                          active ? 'bg-[#4F6D3A]/15' : 'hover:bg-[#FBF9F5]'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="font-semibold text-[#1C281E] truncate">
                            {lang === 'ar' ? f.nameAr : f.nameFr}
                          </div>
                          <div className="text-xs text-[#5A665C]">
                            {copy.foodStates[f.state]} · {copy.categories[f.category]}
                          </div>
                        </div>
                        <span className="text-xs font-num text-[#4F6D3A] font-semibold shrink-0">
                          {f.kcal} {copy.kcal}/100g
                        </span>
                      </button>
                    );
                  })}
                </div>

                {selectedFood && (
                  <div className="rounded-xl bg-[#F7F3EC] p-4 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <div className="font-bold text-sm text-[#1C3122]">
                          {lang === 'ar' ? selectedFood.nameAr : selectedFood.nameFr}
                        </div>
                        <div className="text-xs text-[#5A665C]">
                          {copy.foodStates[selectedFood.state]} · {selectedFood.dataSource}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min={5}
                          max={2000}
                          value={grams}
                          onChange={(e) => setGrams(Math.max(1, Number(e.target.value) || 0))}
                          className="w-20 rounded-lg border border-[#D8CEBC] bg-white px-2.5 py-1.5 text-sm font-num text-center"
                        />
                        <span className="text-xs font-semibold">{copy.grams}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {[30, 50, 100, 150, 200].map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setGrams(g)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-num border cursor-pointer ${
                            grams === g
                              ? 'bg-[#1C3122] text-white border-[#1C3122]'
                              : 'bg-white border-[#D8CEBC] text-[#5A665C]'
                          }`}
                        >
                          {g}g
                        </button>
                      ))}
                    </div>

                    {(() => {
                      const calc = calculateFoodNutrition(selectedFood, grams);
                      return (
                        <div className="grid grid-cols-5 gap-2 text-center bg-white rounded-xl p-2.5 border border-[#EFE8DA]">
                          <div>
                            <div className="text-[11px] text-[#5A665C]">{copy.kcal}</div>
                            <div className="font-bold font-num text-sm">{calc.kcal}</div>
                          </div>
                          <div>
                            <div className="text-[11px] text-[#5A665C]">{copy.protein}</div>
                            <div className="font-bold font-num text-sm">{calc.protein}g</div>
                          </div>
                          <div>
                            <div className="text-[11px] text-[#5A665C]">{copy.fat}</div>
                            <div className="font-bold font-num text-sm">{calc.fat}g</div>
                          </div>
                          <div>
                            <div className="text-[11px] text-[#5A665C]">{copy.carbs}</div>
                            <div className="font-bold font-num text-sm">{calc.carbs}g</div>
                          </div>
                          <div>
                            <div className="text-[11px] text-[#5A665C]">{copy.fiber}</div>
                            <div className="font-bold font-num text-sm">{calc.fiber}g</div>
                          </div>
                        </div>
                      );
                    })()}

                    <button
                      type="button"
                      onClick={handleLogSelectedFood}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#4F6D3A] hover:bg-[#40592f] text-white text-sm font-semibold min-h-[44px] cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{lang === 'ar' ? 'إضافة إلى السجل اليومي' : 'Ajouter au journal'}</span>
                    </button>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="max-h-52 overflow-y-auto divide-y divide-[#F5EFE4] border border-[#EFE8DA] rounded-xl">
                  {filteredRecipes.map((r) => {
                    const active = selectedRecipe?.id === r.id;
                    const { perServing } = calculateRecipeNutrition(r);
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setSelectedRecipe(r)}
                        className={`w-full px-3.5 py-2.5 flex items-center justify-between text-start text-sm cursor-pointer ${
                          active ? 'bg-[#4F6D3A]/15' : 'hover:bg-[#FBF9F5]'
                        }`}
                      >
                        <span className="font-semibold text-[#1C281E] truncate">
                          {lang === 'ar' ? r.nameAr : r.nameFr}
                        </span>
                        <span className="text-xs font-num text-[#4F6D3A] font-semibold shrink-0">
                          {perServing.kcal} {copy.kcal}/{copy.serving}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {selectedRecipe && (
                  <div className="rounded-xl bg-[#F7F3EC] p-4 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-bold text-sm text-[#1C3122]">
                        {lang === 'ar' ? selectedRecipe.nameAr : selectedRecipe.nameFr}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min={0.5}
                          max={6}
                          step={0.5}
                          value={servingsCount}
                          onChange={(e) => setServingsCount(Math.max(0.5, Number(e.target.value) || 1))}
                          className="w-16 rounded-lg border border-[#D8CEBC] bg-white px-2 py-1.5 text-sm font-num text-center"
                        />
                        <span className="text-xs font-semibold">{copy.serving}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleLogSelectedRecipe}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#4F6D3A] hover:bg-[#40592f] text-white text-sm font-semibold min-h-[44px] cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{lang === 'ar' ? 'تسجيل الطبق' : 'Enregistrer la recette'}</span>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Right: Daily Dashboard */}
          <div className="lg:col-span-6 rounded-2xl bg-white border border-[#E2D9C8] p-5 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold text-base text-[#1C3122]">
                  {lang === 'ar' ? 'لوحة اليوم الغذائية' : 'Tableau journalier'}
                </h2>
                <p className="text-xs text-[#5A665C] font-num">{selectedDate}</p>
              </div>
              <div className="text-end font-num">
                <span className="text-xl font-bold text-[#1C3122]">{dayTotals.kcal}</span>
                <span className="text-xs text-[#5A665C] ms-1">
                  / {ref.kcal} {copy.kcal}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2.5">
              {[
                { l: copy.protein, v: dayTotals.protein, t: ref.protein },
                { l: copy.carbs, v: dayTotals.carbs, t: ref.carbs },
                { l: copy.fat, v: dayTotals.fat, t: ref.fat },
                { l: copy.fiber, v: dayTotals.fiber, t: ref.fiber },
              ].map((m) => (
                <div key={m.l} className="rounded-xl bg-[#F7F3EC] p-3 text-center">
                  <div className="text-[11px] text-[#5A665C]">{m.l}</div>
                  <div className="font-bold font-num text-sm text-[#1C3122] mt-0.5">{m.v}g</div>
                  <div className="text-[11px] font-num text-[#5A665C]">/ {m.t}g</div>
                </div>
              ))}
            </div>

            {dateLogs.length > 0 ? (
              <div className="divide-y divide-[#EFE8DA]">
                {dateLogs.map((log) => (
                  <div key={log.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-[#4F6D3A]">
                        {copy.mealSlots[log.slot]}
                      </div>
                      <div className="font-bold text-sm text-[#1C281E] truncate">
                        {lang === 'ar' ? log.nameAr : log.nameFr}
                      </div>
                      <div className="text-xs text-[#5A665C] font-num">
                        {log.amount} {lang === 'ar' ? log.unitLabelAr : log.unitLabelFr} ·{' '}
                        {log.nutrition.kcal} {copy.kcal} · P {log.nutrition.protein}g · F{' '}
                        {log.nutrition.fat}g · C {log.nutrition.carbs}g
                      </div>
                    </div>
                    <button
                      onClick={() => onDeleteLog(log.id)}
                      className="p-2 rounded-lg text-[#5A665C] hover:text-red-700 hover:bg-red-50 min-w-[40px] min-h-[40px] flex items-center justify-center cursor-pointer"
                      aria-label="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-[#D8CEBC] p-6 text-center text-sm text-[#5A665C]">
                {lang === 'ar'
                  ? 'لا توجد وجبات مسجلة لهذا التاريخ بعد.'
                  : 'Aucun repas enregistré pour cette date.'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: What's in my kitchen? */}
      {subTab === 'kitchen' && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-white border border-[#E2D9C8] p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2.5">
              <ChefHat className="w-6 h-6 text-[#4F6D3A]" />
              <div>
                <h2 className="text-lg font-bold text-[#1C3122]">
                  {lang === 'ar' ? 'ماذا أطبخ اليوم؟' : 'Que cuisiner aujourd’hui ?'}
                </h2>
                <p className="text-xs text-[#5A665C]">
                  {lang === 'ar'
                    ? 'اختر المكونات المتوفرة في مطبخك ليقترح عليك ميزان 3 وصفات مغربية مناسبة مع المكونات الناقصة.'
                    : 'Sélectionnez vos ingrédients disponibles pour découvrir 3 recettes marocaines adaptées.'}
                </p>
              </div>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-[#5A665C] absolute top-3 start-3.5" />
              <input
                type="text"
                value={kitchenSearch}
                onChange={(e) => setKitchenSearch(e.target.value)}
                placeholder={
                  lang === 'ar'
                    ? 'أضف مكوناً من قاعدة البيانات (سردين، بطاطس، عدس...)'
                    : 'Rechercher un ingrédient...'
                }
                className="w-full rounded-xl border border-[#D8CEBC] bg-[#FBF9F5] ps-10 pe-4 py-2.5 text-sm"
              />
            </div>

            {kitchenSearchResults.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {kitchenSearchResults.map((f) => {
                  const selected = kitchenIds.includes(f.id);
                  return (
                    <button
                      key={f.id}
                      onClick={() =>
                        setKitchenIds((prev) =>
                          selected ? prev.filter((x) => x !== f.id) : [...prev, f.id]
                        )
                      }
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer ${
                        selected
                          ? 'bg-[#1C3122] text-white border-[#1C3122]'
                          : 'bg-[#FBF9F5] border-[#D8CEBC] text-[#1C281E]'
                      }`}
                    >
                      {selected ? '✓ ' : '+ '}
                      {lang === 'ar' ? f.nameAr : f.nameFr}
                    </button>
                  );
                })}
              </div>
            )}

            <div>
              <div className="text-xs font-semibold text-[#5A665C] mb-2">
                {lang === 'ar' ? 'مكونات مطبخك الشائعة:' : 'Ingrédients courants :'}
              </div>
              <div className="flex flex-wrap gap-2">
                {KITCHEN_STAPLES.map((id) => {
                  const f = FOODS_BY_ID[id];
                  if (!f) return null;
                  const active = kitchenIds.includes(id);
                  return (
                    <button
                      key={id}
                      onClick={() =>
                        setKitchenIds((prev) =>
                          active ? prev.filter((x) => x !== id) : [...prev, id]
                        )
                      }
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold border min-h-[40px] transition-colors cursor-pointer ${
                        active
                          ? 'bg-[#4F6D3A] text-white border-[#4F6D3A]'
                          : 'bg-[#F7F3EC] text-[#1C281E] border-[#E2D9C8] hover:bg-[#EFE8DA]'
                      }`}
                    >
                      {lang === 'ar' ? f.nameAr : f.nameFr}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 3 Suggested Moroccan Recipes */}
          {kitchenMatches.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {kitchenMatches.map((m) => (
                <RecipeCard
                  key={m.recipe.id}
                  recipe={m.recipe}
                  lang={lang}
                  kicker={
                    lang === 'ar'
                      ? `تطابق ${m.matchScore}%`
                      : `Compatibilité ${m.matchScore}%`
                  }
                  imageHeightClass="h-40"
                  footerExtra={
                    <div className="flex flex-wrap gap-2 pt-1">
                      {m.missingFoodIds.length > 0 && (
                        <button
                          onClick={() => {
                            onAddMissingToShopping(m.missingFoodIds);
                            showNotice(
                              lang === 'ar'
                                ? 'أُضيفت المكونات الناقصة إلى قائمة المشتريات'
                                : 'Ingrédients ajoutés aux courses'
                            );
                          }}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-[#D8CEBC] hover:bg-[#F7F3EC] text-xs font-semibold min-h-[40px] cursor-pointer"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>{lang === 'ar' ? 'أضف النواقص للمشتريات' : 'Aux courses'}</span>
                        </button>
                      )}
                      <button
                        onClick={() => {
                          onAddLog({
                            date: todayStr,
                            slot: 'lunch',
                            type: 'recipe',
                            refId: m.recipe.id,
                            nameAr: m.recipe.nameAr,
                            nameFr: m.recipe.nameFr,
                            amount: 1,
                            unitLabelAr: copy.serving,
                            unitLabelFr: copy.serving,
                            nutrition: m.perServing,
                          });
                          showNotice(lang === 'ar' ? 'تم تسجيل الوجبة اليوم' : 'Repas enregistré');
                        }}
                        className="flex-1 py-2 px-3 rounded-xl bg-[#1C3122] text-white text-xs font-semibold min-h-[40px] cursor-pointer"
                      >
                        {lang === 'ar' ? 'سجلها اليوم' : 'Logger'}
                      </button>
                    </div>
                  }
                >
                  <div className="space-y-2">
                    {m.missingFoodIds.length > 0 ? (
                      <div className="text-xs bg-[#F7F3EC] rounded-xl p-2.5 text-[#1C281E]">
                        <span className="font-bold text-[#8A671F]">
                          {lang === 'ar' ? 'المكونات الناقصة: ' : 'Manquants : '}
                        </span>
                        {m.missingFoodIds
                          .map((id) => {
                            const f = FOODS_BY_ID[id];
                            return f ? (lang === 'ar' ? f.nameAr : f.nameFr) : id;
                          })
                          .join('، ')}
                      </div>
                    ) : (
                      <div className="text-xs bg-[#4F6D3A]/10 rounded-xl p-2.5 font-semibold text-[#1C3122]">
                        {lang === 'ar'
                          ? 'جميع المكونات متوفرة لديك!'
                          : 'Tous les ingrédients sont disponibles !'}
                      </div>
                    )}
                    <div className="text-xs text-[#5A665C] leading-relaxed line-clamp-2">
                      {(lang === 'ar' ? m.recipe.stepsAr : m.recipe.stepsFr)[0]}
                    </div>
                  </div>
                </RecipeCard>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl bg-white border border-[#E2D9C8] p-8 text-center text-sm text-[#5A665C]">
              {lang === 'ar'
                ? 'اختر مكوناً واحداً على الأقل لعرض وصفات مغربية مقترحة.'
                : 'Sélectionnez au moins un ingrédient pour afficher des suggestions.'}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Custom Recipe Builder */}
      {subTab === 'custom' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 rounded-2xl bg-white border border-[#E2D9C8] p-5 space-y-4">
            <h2 className="font-bold text-base text-[#1C3122] flex items-center gap-2">
              <UtensilsCrossed className="w-5 h-5 text-[#4F6D3A]" />
              <span>{lang === 'ar' ? 'إنشاء وصفة خاصة وحساب قيمها' : 'Créer une recette personnalisée'}</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#5A665C] mb-1">
                  {lang === 'ar' ? 'اسم الوصفة (بالعربية)' : 'Nom (Arabe)'}
                </label>
                <input
                  type="text"
                  value={customNameAr}
                  onChange={(e) => setCustomNameAr(e.target.value)}
                  placeholder={lang === 'ar' ? 'مثال: طاجين القرع الأخضر' : 'Ex : Tajine courgettes'}
                  className="w-full rounded-xl border border-[#D8CEBC] bg-[#FBF9F5] px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#5A665C] mb-1">
                  {lang === 'ar' ? 'الاسم بالفرنسية (اختياري)' : 'Nom (Français)'}
                </label>
                <input
                  type="text"
                  value={customNameFr}
                  onChange={(e) => setCustomNameFr(e.target.value)}
                  className="w-full rounded-xl border border-[#D8CEBC] bg-[#FBF9F5] px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#5A665C] mb-1">
                  {lang === 'ar' ? 'عدد الحصص' : 'Portions'}
                </label>
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={customServings}
                  onChange={(e) => setCustomServings(Math.max(1, Number(e.target.value) || 1))}
                  className="w-full rounded-xl border border-[#D8CEBC] bg-[#FBF9F5] px-3 py-2 text-sm font-num"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#5A665C] mb-1">
                  {lang === 'ar' ? 'مدة التحضير (دقيقة)' : 'Préparation (min)'}
                </label>
                <input
                  type="number"
                  min={5}
                  max={240}
                  value={customPrepMin}
                  onChange={(e) => setCustomPrepMin(Math.max(5, Number(e.target.value) || 15))}
                  className="w-full rounded-xl border border-[#D8CEBC] bg-[#FBF9F5] px-3 py-2 text-sm font-num"
                />
              </div>
            </div>

            <div className="border-t border-[#EFE8DA] pt-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <input
                  type="text"
                  value={ingSearch}
                  onChange={(e) => setIngSearch(e.target.value)}
                  placeholder={lang === 'ar' ? 'ابحث لإضافة مكون...' : 'Ajouter un ingrédient...'}
                  className="flex-1 rounded-xl border border-[#D8CEBC] bg-[#FBF9F5] px-3 py-2 text-sm"
                />
                <input
                  type="number"
                  min={5}
                  max={2000}
                  value={ingGrams}
                  onChange={(e) => setIngGrams(Math.max(5, Number(e.target.value) || 50))}
                  className="w-20 rounded-xl border border-[#D8CEBC] bg-[#FBF9F5] px-2 py-2 text-sm font-num text-center"
                />
                <span className="text-xs font-semibold">{copy.grams}</span>
              </div>

              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
                {MOROCCAN_FOODS.filter(
                  (f) =>
                    !ingSearch.trim() ||
                    f.nameAr.includes(ingSearch.trim()) ||
                    f.nameFr.toLowerCase().includes(ingSearch.trim().toLowerCase())
                )
                  .slice(0, 14)
                  .map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() =>
                        setCustomIngs((prev) => {
                          const existing = prev.find((i) => i.foodId === f.id);
                          if (existing) {
                            return prev.map((i) =>
                              i.foodId === f.id ? { ...i, grams: i.grams + ingGrams } : i
                            );
                          }
                          return [...prev, { foodId: f.id, grams: ingGrams }];
                        })
                      }
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#F7F3EC] hover:bg-[#EFE8DA] text-xs font-medium text-[#1C281E] border border-[#E2D9C8] cursor-pointer"
                    >
                      <PlusCircle className="w-3.5 h-3.5 text-[#4F6D3A]" />
                      <span>{lang === 'ar' ? f.nameAr : f.nameFr}</span>
                    </button>
                  ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 rounded-2xl bg-white border border-[#E2D9C8] p-5 space-y-4">
            <h3 className="font-bold text-base text-[#1C3122]">
              {lang === 'ar' ? 'ملخص الوصفة لكل حصة' : 'Résumé par portion'}
            </h3>

            {customPreviewNutrition ? (
              <div className="grid grid-cols-5 gap-2 bg-[#F7F3EC] rounded-xl p-3 text-center">
                <div>
                  <div className="text-[11px] text-[#5A665C]">{copy.kcal}</div>
                  <div className="font-bold font-num text-sm">{customPreviewNutrition.perServing.kcal}</div>
                </div>
                <div>
                  <div className="text-[11px] text-[#5A665C]">{copy.protein}</div>
                  <div className="font-bold font-num text-sm">{customPreviewNutrition.perServing.protein}g</div>
                </div>
                <div>
                  <div className="text-[11px] text-[#5A665C]">{copy.fat}</div>
                  <div className="font-bold font-num text-sm">{customPreviewNutrition.perServing.fat}g</div>
                </div>
                <div>
                  <div className="text-[11px] text-[#5A665C]">{copy.carbs}</div>
                  <div className="font-bold font-num text-sm">{customPreviewNutrition.perServing.carbs}g</div>
                </div>
                <div>
                  <div className="text-[11px] text-[#5A665C]">{copy.fiber}</div>
                  <div className="font-bold font-num text-sm">{customPreviewNutrition.perServing.fiber}g</div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-[#5A665C]">
                {lang === 'ar'
                  ? 'أضف المكونات بالغرام لحساب السعرات والقيم الغذائية تلقائياً.'
                  : 'Ajoutez des ingrédients pour calculer les valeurs nutritionnelles.'}
              </p>
            )}

            <div className="divide-y divide-[#EFE8DA] max-h-52 overflow-y-auto">
              {customIngs.map((ing) => {
                const food = FOODS_BY_ID[ing.foodId];
                return (
                  <div key={ing.foodId} className="py-2 flex items-center justify-between text-sm">
                    <span>{food ? (lang === 'ar' ? food.nameAr : food.nameFr) : ing.foodId}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-num text-xs text-[#5A665C]">{ing.grams}g</span>
                      <button
                        onClick={() =>
                          setCustomIngs((prev) => prev.filter((x) => x.foodId !== ing.foodId))
                        }
                        className="text-red-600 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              disabled={!customNameAr.trim() || customIngs.length === 0}
              onClick={handleSaveCustom}
              className="w-full py-3 rounded-xl bg-[#1C3122] hover:bg-[#142519] disabled:opacity-40 text-white text-sm font-semibold min-h-[44px] cursor-pointer"
            >
              {lang === 'ar' ? 'حفظ الوصفة الخاصة' : 'Enregistrer la recette'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
