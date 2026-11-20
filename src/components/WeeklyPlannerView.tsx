import React, { useState } from 'react';
import {
  BookmarkCheck,
  CalendarDays,
  Printer,
  RefreshCw,
  ShoppingBasket,
  Sparkles,
  X,
} from 'lucide-react';
import {
  Language,
  MealSlot,
  PlanMode,
  Recipe,
  UserProfile,
  WeeklyPlan,
} from '../types/mizan';
import { UI_COPY } from '../i18n/translations';
import { calculateRecipeNutrition, sumNutrition } from '../utils/nutrition';
import { getMealAlternatives } from '../utils/mealPlanner';
import { FOODS_BY_ID } from '../data/moroccanFoods';
import { resolveRecipeAssetImage } from '../data/moroccanRecipes';
import { FoodImage } from './MizanLogo';

interface WeeklyPlannerViewProps {
  lang: Language;
  isOnline: boolean;
  profile: UserProfile;
  activePlan: WeeklyPlan | null;
  savedPlans: WeeklyPlan[];
  allRecipes: Recipe[];
  onGeneratePlan: (mode: PlanMode) => void;
  onSavePlan: (plan: WeeklyPlan) => void;
  onSwapMeal: (dayIndex: number, slot: MealSlot, newRecipeId: string) => void;
  onSyncShopping: (plan: WeeklyPlan) => void;
  onAttachInsight: (planId: string, insight: string) => void;
  onLogRecipe: (recipe: Recipe, slot: MealSlot) => void;
}

export const WeeklyPlannerView: React.FC<WeeklyPlannerViewProps> = ({
  lang,
  isOnline,
  profile,
  activePlan,
  savedPlans,
  allRecipes,
  onGeneratePlan,
  onSavePlan,
  onSwapMeal,
  onSyncShopping,
  onAttachInsight,
  onLogRecipe,
}) => {
  const copy = UI_COPY[lang];
  const [selectedMode, setSelectedMode] = useState<PlanMode>(activePlan?.mode || 'balanced');
  const [viewMode, setViewMode] = useState<'week' | 'day'>('day');
  const [selectedDay, setSelectedDay] = useState(0);
  const [swapTarget, setSwapTarget] = useState<{ dayIndex: number; slot: MealSlot; recipeId: string } | null>(null);
  const [detailRecipe, setDetailRecipe] = useState<Recipe | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const recipeMap = Object.fromEntries(allRecipes.map((r) => [r.id, r]));
  const slots: MealSlot[] = ['breakfast', 'morning_snack', 'lunch', 'afternoon_snack', 'dinner'];

  const isSaved = activePlan ? savedPlans.some((p) => p.id === activePlan.id) : false;

  const showToast = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const handleRequestAiInsight = async () => {
    if (!activePlan || !isOnline) return;
    setAiLoading(true);
    try {
      const sampleNames = Array.from(
        new Set(
          activePlan.days.flatMap((d) =>
            [d.meals.breakfast, d.meals.lunch, d.meals.dinner].map((id) => {
              const r = recipeMap[id];
              return r ? (lang === 'ar' ? r.nameAr : r.nameFr) : '';
            })
          )
        )
      )
        .filter(Boolean)
        .slice(0, 8);

      const res = await fetch('/api/ai/plan-insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: lang,
          mode: activePlan.mode,
          profileSummary: `${profile.dietaryPreference}, ${profile.healthInterests.join(', ')}`,
          sampleMeals: sampleNames,
        }),
      });
      const data = await res.json();
      if (res.ok && data.insight) {
        onAttachInsight(activePlan.id, data.insight);
      }
    } catch {
      // ignore gracefully
    } finally {
      setAiLoading(false);
    }
  };

  const currentDayPlan = activePlan?.days.find((d) => d.dayIndex === selectedDay);

  const dayTotals = currentDayPlan
    ? sumNutrition(
        slots.map((s) => {
          const r = recipeMap[currentDayPlan.meals[s]];
          return r
            ? calculateRecipeNutrition(r).perServing
            : { kcal: 0, protein: 0, fat: 0, carbs: 0, fiber: 0 };
        })
      )
    : null;

  return (
    <div className="space-y-6">
      {/* Header & Mode Generator */}
      <section className="no-print rounded-2xl bg-white border border-[#E2D9C8] p-5 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#1C3122]">{copy.nav.planner}</h1>
            <p className="text-sm text-[#5A665C]">
              {lang === 'ar'
                ? 'توليد ذكي لبرنامج 7 أيام يراعي الميزانية، الحساسية، الموسم وتنوع المطبخ المغربي.'
                : 'Génération intelligente sur 7 jours adaptée à votre budget, vos allergies et la saison.'}
            </p>
          </div>
          <button
            onClick={() => onGeneratePlan(selectedMode)}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#1C3122] hover:bg-[#142519] text-white text-sm font-bold min-h-[48px] transition-colors cursor-pointer shrink-0"
          >
            <CalendarDays className="w-4 h-4 text-[#C69C43]" />
            <span>
              {lang === 'ar' ? 'أنشئ برنامجي الغذائي لهذا الأسبوع' : 'Générer mon programme de la semaine'}
            </span>
          </button>
        </div>

        {/* 3 Modes */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(['economic', 'balanced', 'varied'] as PlanMode[]).map((mode) => {
            const active = selectedMode === mode;
            return (
              <button
                key={mode}
                type="button"
                onClick={() => setSelectedMode(mode)}
                className={`p-4 rounded-xl border text-start transition-colors cursor-pointer ${
                  active
                    ? 'bg-[#4F6D3A]/10 border-[#4F6D3A] text-[#1C3122]'
                    : 'bg-[#FBF9F5] border-[#E2D9C8] text-[#5A665C] hover:bg-[#F7F3EC]'
                }`}
              >
                <div className="font-bold text-sm text-[#1C3122]">{copy.planModes[mode].title}</div>
                <div className="text-xs mt-1 leading-relaxed">{copy.planModes[mode].desc}</div>
              </button>
            );
          })}
        </div>
      </section>

      {feedbackMsg && (
        <div className="no-print rounded-xl bg-[#1C3122] text-white px-4 py-3 text-sm font-medium">
          {feedbackMsg}
        </div>
      )}

      {activePlan ? (
        <>
          {/* Plan Action Toolbar */}
          <div className="no-print flex flex-wrap items-center justify-between gap-3 bg-white border border-[#E2D9C8] rounded-2xl p-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 p-1 bg-[#F7F3EC] rounded-xl">
                <button
                  onClick={() => setViewMode('day')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold min-h-[36px] cursor-pointer ${
                    viewMode === 'day' ? 'bg-white text-[#1C3122] shadow-xs' : 'text-[#5A665C]'
                  }`}
                >
                  {lang === 'ar' ? 'عرض يوم بيوم' : 'Jour par jour'}
                </button>
                <button
                  onClick={() => setViewMode('week')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold min-h-[36px] cursor-pointer ${
                    viewMode === 'week' ? 'bg-white text-[#1C3122] shadow-xs' : 'text-[#5A665C]'
                  }`}
                >
                  {lang === 'ar' ? 'عرض الأسبوع كاملاً' : 'Toute la semaine'}
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  onSavePlan(activePlan);
                  showToast(lang === 'ar' ? 'تم حفظ البرنامج في السجل' : 'Programme enregistré');
                }}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold min-h-[40px] border cursor-pointer ${
                  isSaved
                    ? 'bg-[#4F6D3A]/15 border-[#4F6D3A] text-[#1C3122]'
                    : 'bg-white border-[#D8CEBC] text-[#1C281E] hover:bg-[#F7F3EC]'
                }`}
              >
                <BookmarkCheck className="w-4 h-4" />
                <span>{isSaved ? (lang === 'ar' ? 'محفوظ' : 'Enregistré') : (lang === 'ar' ? 'حفظ البرنامج' : 'Sauvegarder')}</span>
              </button>

              <button
                onClick={() => {
                  onSyncShopping(activePlan);
                  showToast(lang === 'ar' ? 'تم تحديث قائمة المشتريات الأسبوعية' : 'Liste de courses mise à jour');
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold min-h-[40px] bg-[#EFE8DA] text-[#1C3122] hover:bg-[#e5dcc9] cursor-pointer"
              >
                <ShoppingBasket className="w-4 h-4" />
                <span>{lang === 'ar' ? 'تحديث قائمة المشتريات' : 'Liste de courses'}</span>
              </button>

              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold min-h-[40px] border border-[#D8CEBC] text-[#1C281E] hover:bg-[#F7F3EC] cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>{lang === 'ar' ? 'طباعة / تصدير PDF' : 'Imprimer / PDF'}</span>
              </button>

              {isOnline && (
                <button
                  onClick={handleRequestAiInsight}
                  disabled={aiLoading}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold min-h-[40px] bg-[#4F6D3A] text-white hover:bg-[#40592f] disabled:opacity-60 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {aiLoading
                      ? lang === 'ar'
                        ? 'جاري التحليل...'
                        : 'Analyse...'
                      : lang === 'ar'
                      ? 'ملاحظة MIZAN AI'
                      : 'Avis MIZAN AI'}
                  </span>
                </button>
              )}
            </div>
          </div>

          {activePlan.aiInsight && (
            <div className="rounded-2xl bg-[#FBF9F5] border border-[#C69C43]/50 p-4 text-sm text-[#1C281E] whitespace-pre-line leading-relaxed">
              <div className="text-xs font-bold text-[#8A671F] mb-1">
                {lang === 'ar' ? 'ملخص MIZAN AI للبرنامج' : 'Note nutritionnelle MIZAN AI'}
              </div>
              {activePlan.aiInsight}
            </div>
          )}

          {/* Day-by-Day View */}
          {viewMode === 'day' && currentDayPlan && (
            <div className="space-y-4">
              {/* Day Tabs */}
              <div className="no-print flex items-center gap-2 overflow-x-auto pb-1">
                {copy.days.map((dayName, idx) => (
                  <button
                    key={dayName}
                    onClick={() => setSelectedDay(idx)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 min-h-[44px] transition-colors cursor-pointer ${
                      selectedDay === idx
                        ? 'bg-[#1C3122] text-white'
                        : 'bg-white border border-[#E2D9C8] text-[#1C281E] hover:bg-[#EFE8DA]'
                    }`}
                  >
                    {dayName}
                  </button>
                ))}
              </div>

              {dayTotals && (
                <div className="rounded-2xl bg-white border border-[#E2D9C8] p-4 flex flex-wrap items-center justify-between gap-4">
                  <div className="font-bold text-base text-[#1C3122]">
                    {copy.days[selectedDay]} — {lang === 'ar' ? activePlan.titleAr : activePlan.titleFr}
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-xs font-num text-[#5A665C]">
                    <span className="font-bold text-[#1C3122]">{dayTotals.kcal} {copy.kcal}</span>
                    <span>{copy.protein}: {dayTotals.protein}g</span>
                    <span>{copy.carbs}: {dayTotals.carbs}g</span>
                    <span>{copy.fat}: {dayTotals.fat}g</span>
                    <span>{copy.fiber}: {dayTotals.fiber}g</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {slots.map((slot) => {
                  const recipe = recipeMap[currentDayPlan.meals[slot]];
                  if (!recipe) return null;
                  const { perServing } = calculateRecipeNutrition(recipe);

                  return (
                    <div
                      key={slot}
                      className="group print-break-avoid rounded-2xl bg-white border border-[#E2D9C8] overflow-hidden flex flex-col sm:flex-row hover:border-[#4F6D3A] transition-colors"
                    >
                      <div className="sm:w-36 h-36 sm:h-auto shrink-0 overflow-hidden bg-[#EFE8DA]">
                        <FoodImage
                          src={resolveRecipeAssetImage(recipe)}
                          alt={lang === 'ar' ? recipe.nameAr : recipe.nameFr}
                          className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-105 will-change-transform"
                        />
                      </div>
                      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                        <div>
                          <div className="text-xs font-semibold text-[#4F6D3A]">
                            {copy.mealSlots[slot]} · {recipe.prepMinutes} {copy.minutes}
                          </div>
                          <h3 className="text-base font-bold text-[#1C3122] mt-0.5">
                            {lang === 'ar' ? recipe.nameAr : recipe.nameFr}
                          </h3>
                          <div className="text-xs text-[#5A665C] font-num mt-1.5">
                            {perServing.kcal} {copy.kcal} · {copy.protein} {perServing.protein}g · {copy.fat} {perServing.fat}g · {copy.carbs} {perServing.carbs}g · {copy.fiber} {perServing.fiber}g
                          </div>
                        </div>

                        <div className="no-print flex flex-wrap items-center gap-2 pt-1">
                          <button
                            onClick={() => setDetailRecipe(recipe)}
                            className="px-3 py-1.5 rounded-lg bg-[#F7F3EC] hover:bg-[#EFE8DA] text-xs font-semibold text-[#1C3122] min-h-[36px] cursor-pointer"
                          >
                            {lang === 'ar' ? 'المكونات والتحضير' : 'Recette & détails'}
                          </button>
                          <button
                            onClick={() =>
                              setSwapTarget({ dayIndex: selectedDay, slot, recipeId: recipe.id })
                            }
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#D8CEBC] hover:bg-[#F7F3EC] text-xs font-semibold text-[#1C281E] min-h-[36px] cursor-pointer"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>{lang === 'ar' ? 'استبدال وجبة' : 'Remplacer'}</span>
                          </button>
                          <button
                            onClick={() => {
                              onLogRecipe(recipe, slot);
                              showToast(lang === 'ar' ? 'سُجلت الوجبة في يومك' : 'Repas enregistré');
                            }}
                            className="px-3 py-1.5 rounded-lg bg-[#4F6D3A]/15 text-[#1C3122] hover:bg-[#4F6D3A]/25 text-xs font-semibold min-h-[36px] cursor-pointer"
                          >
                            {lang === 'ar' ? 'تسجيل اليوم' : 'Logger'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Full Week View (also used for clean print/PDF) */}
          {viewMode === 'week' && (
            <div className="space-y-4">
              <div className="print-only hidden mb-4">
                <h1 className="text-xl font-bold">
                  MIZAN – ميزان | {lang === 'ar' ? activePlan.titleAr : activePlan.titleFr}
                </h1>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {activePlan.days.map((day) => {
                  const totals = sumNutrition(
                    slots.map((s) => {
                      const r = recipeMap[day.meals[s]];
                      return r
                        ? calculateRecipeNutrition(r).perServing
                        : { kcal: 0, protein: 0, fat: 0, carbs: 0, fiber: 0 };
                    })
                  );
                  return (
                    <div
                      key={day.dayIndex}
                      className="print-break-avoid rounded-2xl bg-white border border-[#E2D9C8] p-5 space-y-3"
                    >
                      <div className="flex items-center justify-between border-b border-[#EFE8DA] pb-2.5">
                        <h3 className="font-bold text-base text-[#1C3122]">
                          {copy.days[day.dayIndex]}
                        </h3>
                        <span className="text-xs font-num font-semibold text-[#4F6D3A]">
                          {totals.kcal} {copy.kcal}
                        </span>
                      </div>

                      <div className="divide-y divide-[#F5EFE4]">
                        {slots.map((slot) => {
                          const recipe = recipeMap[day.meals[slot]];
                          if (!recipe) return null;
                          const { perServing } = calculateRecipeNutrition(recipe);
                          return (
                            <div
                              key={slot}
                              className="py-2 flex items-center justify-between gap-2 text-sm"
                            >
                              <div className="min-w-0">
                                <span className="text-xs text-[#5A665C] me-2">
                                  {copy.mealSlots[slot]}:
                                </span>
                                <button
                                  onClick={() => setDetailRecipe(recipe)}
                                  className="font-semibold text-[#1C281E] hover:text-[#4F6D3A] text-start cursor-pointer"
                                >
                                  {lang === 'ar' ? recipe.nameAr : recipe.nameFr}
                                </button>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-xs font-num text-[#5A665C]">
                                  {perServing.kcal} {copy.kcal}
                                </span>
                                <button
                                  onClick={() =>
                                    setSwapTarget({
                                      dayIndex: day.dayIndex,
                                      slot,
                                      recipeId: recipe.id,
                                    })
                                  }
                                  className="no-print p-1.5 rounded-lg hover:bg-[#F7F3EC] text-[#5A665C] cursor-pointer"
                                  title={lang === 'ar' ? 'استبدال' : 'Remplacer'}
                                >
                                  <RefreshCw className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="rounded-2xl bg-white border border-[#E2D9C8] p-8 text-center space-y-3">
          <CalendarDays className="w-10 h-10 text-[#4F6D3A] mx-auto" />
          <h3 className="text-base font-bold text-[#1C3122]">
            {lang === 'ar' ? 'ابدأ بإنشاء برنامجك الأول' : 'Créez votre premier programme'}
          </h3>
          <p className="text-sm text-[#5A665C] max-w-md mx-auto">
            {lang === 'ar'
              ? 'اختر النمط المناسب (اقتصادي، متوازن، أو متنوع) واضغط على الزر أعلاه لتوليد 7 أيام من الوجبات المغربية الصحية.'
              : 'Choisissez un mode (Économique, Équilibré ou Varié) et générez 7 jours de repas marocains.'}
          </p>
        </div>
      )}

      {/* Swap Meal Modal */}
      {swapTarget && (
        <div className="no-print fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg max-h-[85vh] bg-white rounded-2xl border border-[#E2D9C8] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-[#EFE8DA] flex items-center justify-between">
              <h3 className="font-bold text-base text-[#1C3122]">
                {lang === 'ar' ? 'اختر وجبة بديلة' : 'Choisir une alternative'} · {copy.mealSlots[swapTarget.slot]}
              </h3>
              <button
                onClick={() => setSwapTarget(null)}
                className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl hover:bg-[#F7F3EC] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
              {getMealAlternatives(swapTarget.slot, swapTarget.recipeId, profile, allRecipes).map((alt) => {
                const { perServing } = calculateRecipeNutrition(alt);
                return (
                  <button
                    key={alt.id}
                    onClick={() => {
                      onSwapMeal(swapTarget.dayIndex, swapTarget.slot, alt.id);
                      setSwapTarget(null);
                      showToast(lang === 'ar' ? 'تم استبدال الوجبة' : 'Repas remplacé');
                    }}
                    className="w-full flex items-center justify-between gap-3 p-3.5 rounded-xl border border-[#E2D9C8] hover:border-[#4F6D3A] hover:bg-[#F7F3EC] text-start transition-colors cursor-pointer"
                  >
                    <div className="min-w-0">
                      <div className="font-bold text-sm text-[#1C3122]">
                        {lang === 'ar' ? alt.nameAr : alt.nameFr}
                      </div>
                      <div className="text-xs text-[#5A665C] font-num mt-0.5">
                        {perServing.kcal} {copy.kcal} · {copy.protein} {perServing.protein}g · {copy.fiber} {perServing.fiber}g
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-[#4F6D3A] shrink-0">
                      {lang === 'ar' ? 'اختيار' : 'Choisir'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Recipe Details Modal */}
      {detailRecipe && (
        <div className="no-print fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl max-h-[90vh] bg-white rounded-3xl border border-[#E2D9C8] flex flex-col overflow-hidden">
            <div className="relative h-48 shrink-0">
              <FoodImage
                src={resolveRecipeAssetImage(detailRecipe)}
                alt={lang === 'ar' ? detailRecipe.nameAr : detailRecipe.nameFr}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setDetailRecipe(null)}
                className="absolute top-3 end-3 w-10 h-10 rounded-full bg-white/90 text-[#1C3122] flex items-center justify-center shadow-sm cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              <div>
                <h3 className="text-xl font-bold text-[#1C3122]">
                  {lang === 'ar' ? detailRecipe.nameAr : detailRecipe.nameFr}
                </h3>
                <p className="text-xs text-[#5A665C] mt-1">
                  {detailRecipe.prepMinutes} {copy.minutes} · {detailRecipe.servings} {copy.servings}
                </p>
              </div>

              {(() => {
                const { perServing } = calculateRecipeNutrition(detailRecipe);
                return (
                  <div className="grid grid-cols-5 gap-2 bg-[#F7F3EC] rounded-xl p-3 text-center">
                    <div>
                      <div className="text-xs text-[#5A665C]">{copy.kcal}</div>
                      <div className="font-bold font-num text-[#1C3122]">{perServing.kcal}</div>
                    </div>
                    <div>
                      <div className="text-xs text-[#5A665C]">{copy.protein}</div>
                      <div className="font-bold font-num text-[#1C3122]">{perServing.protein}g</div>
                    </div>
                    <div>
                      <div className="text-xs text-[#5A665C]">{copy.fat}</div>
                      <div className="font-bold font-num text-[#1C3122]">{perServing.fat}g</div>
                    </div>
                    <div>
                      <div className="text-xs text-[#5A665C]">{copy.carbs}</div>
                      <div className="font-bold font-num text-[#1C3122]">{perServing.carbs}g</div>
                    </div>
                    <div>
                      <div className="text-xs text-[#5A665C]">{copy.fiber}</div>
                      <div className="font-bold font-num text-[#1C3122]">{perServing.fiber}g</div>
                    </div>
                  </div>
                );
              })()}

              <div>
                <h4 className="font-bold text-sm text-[#1C3122] mb-2">
                  {lang === 'ar' ? 'المكونات (لكامل الوصفة)' : 'Ingrédients (recette complète)'}
                </h4>
                <ul className="space-y-1.5 text-sm text-[#1C281E]">
                  {detailRecipe.ingredients.map((ing) => {
                    const food = FOODS_BY_ID[ing.foodId];
                    return (
                      <li key={ing.foodId} className="flex items-center justify-between border-b border-[#F5EFE4] pb-1">
                        <span>{food ? (lang === 'ar' ? food.nameAr : food.nameFr) : ing.foodId}</span>
                        <span className="font-num text-xs text-[#5A665C]">{ing.grams} {copy.grams}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-sm text-[#1C3122] mb-2">
                  {lang === 'ar' ? 'طريقة التحضير' : 'Préparation'}
                </h4>
                <ol className="space-y-2 text-sm text-[#1C281E] list-decimal list-inside">
                  {(lang === 'ar' ? detailRecipe.stepsAr : detailRecipe.stepsFr).map((st, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {st}
                    </li>
                  ))}
                </ol>
              </div>

              <div className="rounded-xl bg-[#4F6D3A]/10 p-3.5 text-xs text-[#1C3122] leading-relaxed">
                <strong>{lang === 'ar' ? 'نصيحة غذائية: ' : 'Conseil nutrition : '}</strong>
                {lang === 'ar' ? detailRecipe.healthyTipAr : detailRecipe.healthyTipFr}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
