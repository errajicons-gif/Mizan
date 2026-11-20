import React from 'react';
import {
  Activity,
  ArrowUpLeft,
  ArrowUpRight,
  CalendarDays,
  ChefHat,
  MessageSquareHeart,
  Plus,
  Scale,
} from 'lucide-react';
import {
  LabEntry,
  Language,
  MealLogEntry,
  NavTab,
  Recipe,
  UserProfile,
  WeeklyPlan,
  WeightEntry,
} from '../types/mizan';
import { UI_COPY } from '../i18n/translations';
import { IMG_HERO_TABLE } from '../data/moroccanRecipes';
import { calculateDailyReference, sumNutrition } from '../utils/nutrition';
import { FoodImage } from './MizanLogo';
import { RecipeCard } from './RecipeCard';

interface HomeDashboardProps {
  lang: Language;
  profile: UserProfile;
  activePlan: WeeklyPlan | null;
  todayLogs: MealLogEntry[];
  weights: WeightEntry[];
  labs: LabEntry[];
  allRecipes: Recipe[];
  onNavigate: (tab: NavTab, subTab?: string) => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  lang,
  profile,
  activePlan,
  todayLogs,
  weights,
  labs,
  allRecipes,
  onNavigate,
}) => {
  const copy = UI_COPY[lang];
  const ref = calculateDailyReference(profile);
  const totals = sumNutrition(todayLogs.map((l) => l.nutrition));
  const recipeMap = Object.fromEntries(allRecipes.map((r) => [r.id, r]));

  const latestWeight = weights.length > 0 ? weights[weights.length - 1] : null;
  const latestLab = labs.length > 0 ? labs[labs.length - 1] : null;

  const jsDay = new Date().getDay(); // 0=Sun..6=Sat
  const mondayBasedDay = jsDay === 0 ? 6 : jsDay - 1;
  const todayPlan = activePlan?.days.find((d) => d.dayIndex === mondayBasedDay) || activePlan?.days[0];

  const ArrowIcon = lang === 'ar' ? ArrowUpLeft : ArrowUpRight;

  const pct = (val: number, target: number) =>
    Math.min(100, Math.round((val / Math.max(1, target)) * 100));

  return (
    <div className="space-y-6">
      {/* Hero Banner Split */}
      <section className="rounded-3xl bg-white border border-[#E2D9C8] overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch">
        <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-5">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-[#4F6D3A]">
              {copy.brandName} · {copy.slogan}
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1C3122] text-balance">
              {lang === 'ar'
                ? `مرحباً ${profile.name || 'بك'}، لنجعل يومك متوازناً`
                : `Bonjour ${profile.name || ''}, cultivons l’équilibre aujourd’hui`}
            </h1>
            <p className="text-sm text-[#5A665C] leading-relaxed max-w-xl">
              {lang === 'ar'
                ? 'تابع وجباتك المغربية، احسب القيم الغذائية بدقة من قاعدة البيانات، أو أنشئ برنامجك الأسبوعي بضغطة واحدة.'
                : 'Suivez vos repas marocains, calculez vos apports depuis notre base vérifiée ou générez votre programme hebdomadaire.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('planner')}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#1C3122] hover:bg-[#142519] text-white text-sm font-semibold min-h-[44px] transition-colors cursor-pointer"
            >
              <CalendarDays className="w-4 h-4 text-[#C69C43]" />
              <span>{lang === 'ar' ? 'أنشئ برنامجي الأسبوعي' : 'Créer mon programme'}</span>
            </button>

            <button
              onClick={() => onNavigate('nutrition', 'kitchen')}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#EFE8DA] hover:bg-[#e5dcc9] text-[#1C3122] text-sm font-semibold min-h-[44px] transition-colors cursor-pointer"
            >
              <ChefHat className="w-4 h-4 text-[#4F6D3A]" />
              <span>{lang === 'ar' ? 'ماذا أطبخ اليوم؟' : 'Que cuisiner ?'}</span>
            </button>

            <button
              onClick={() => onNavigate('ai')}
              className="flex items-center gap-2 px-4 py-3 rounded-xl border border-[#D8CEBC] hover:bg-[#F7F3EC] text-[#1C3122] text-sm font-semibold min-h-[44px] transition-colors cursor-pointer"
            >
              <MessageSquareHeart className="w-4 h-4 text-[#4F6D3A]" />
              <span>{copy.nav.ai}</span>
            </button>
          </div>
        </div>

        <div className="lg:col-span-5 relative min-h-[200px] lg:min-h-full">
          <FoodImage
            src={IMG_HERO_TABLE}
            alt={lang === 'ar' ? 'المائدة المغربية الصحية' : 'Table marocaine équilibrée'}
            className="w-full h-full object-cover lg:absolute lg:inset-0"
          />
        </div>
      </section>

      {/* Daily Nutrition Summary + Progress */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7 rounded-2xl bg-white border border-[#E2D9C8] p-5 sm:p-6 space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-[#1C3122]">
                {lang === 'ar' ? 'ملخص تغذية اليوم' : 'Synthèse nutritionnelle du jour'}
              </h2>
              <p className="text-xs text-[#5A665C]">
                {lang === 'ar'
                  ? `${todayLogs.length} وجبات مسجلة · المرجع التقديري ${ref.kcal} ${copy.kcal}`
                  : `${todayLogs.length} repas enregistrés · Référence estimée ${ref.kcal} ${copy.kcal}`}
              </p>
            </div>
            <button
              onClick={() => onNavigate('nutrition', 'log')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#4F6D3A] hover:bg-[#40592f] text-white text-xs font-semibold min-h-[40px] cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>{lang === 'ar' ? 'تسجيل وجبة' : 'Ajouter un repas'}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { label: copy.kcal, val: totals.kcal, target: ref.kcal, unit: '' },
              { label: copy.protein, val: totals.protein, target: ref.protein, unit: copy.grams },
              { label: copy.carbs, val: totals.carbs, target: ref.carbs, unit: copy.grams },
              { label: copy.fat, val: totals.fat, target: ref.fat, unit: copy.grams },
              { label: copy.fiber, val: totals.fiber, target: ref.fiber, unit: copy.grams },
            ].map((m) => (
              <div key={m.label} className="rounded-xl bg-[#F7F3EC] p-3 space-y-2">
                <div className="text-xs text-[#5A665C] font-medium">{m.label}</div>
                <div className="text-lg font-bold text-[#1C3122] font-num">
                  {m.val}
                  <span className="text-xs font-normal text-[#5A665C] ms-1">
                    / {m.target}{m.unit}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-[#E2D9C8] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#4F6D3A] transition-all"
                    style={{ width: `${pct(m.val, m.target)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {todayLogs.length > 0 ? (
            <div className="divide-y divide-[#EFE8DA]">
              {todayLogs.slice(0, 4).map((entry) => (
                <div key={entry.id} className="py-2.5 flex items-center justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <div className="font-semibold text-[#1C281E] truncate">
                      {lang === 'ar' ? entry.nameAr : entry.nameFr}
                    </div>
                    <div className="text-xs text-[#5A665C]">
                      {copy.mealSlots[entry.slot]} · {entry.amount}{' '}
                      {lang === 'ar' ? entry.unitLabelAr : entry.unitLabelFr}
                    </div>
                  </div>
                  <div className="font-num text-sm font-semibold text-[#1C3122] shrink-0">
                    {entry.nutrition.kcal} {copy.kcal}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-[#D8CEBC] p-4 text-center text-sm text-[#5A665C]">
              {lang === 'ar'
                ? 'لم تُسجل وجبات بعد لهذا اليوم. يمكنك تسجيل وجبة من حاسبة السعرات أو من برنامجك اليومي.'
                : 'Aucun repas enregistré aujourd’hui. Ajoutez un aliment ou une recette depuis votre programme.'}
            </div>
          )}
        </div>

        {/* Weight & Health Indicators Shortcut */}
        <div className="lg:col-span-5 space-y-5">
          <div className="rounded-2xl bg-white border border-[#E2D9C8] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-[#4F6D3A]" />
                <h2 className="text-base font-bold text-[#1C3122]">
                  {lang === 'ar' ? 'آخر وزن مسجل' : 'Dernier poids enregistré'}
                </h2>
              </div>
              <button
                onClick={() => onNavigate('health', 'weight')}
                className="text-xs font-semibold text-[#4F6D3A] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>{lang === 'ar' ? 'متابعة تطوري' : 'Mon suivi'}</span>
                <ArrowIcon className="w-3.5 h-3.5" />
              </button>
            </div>

            {latestWeight ? (
              <div className="flex items-baseline justify-between bg-[#F7F3EC] rounded-xl p-4">
                <div className="text-2xl font-bold text-[#1C3122] font-num">
                  {latestWeight.weightKg} <span className="text-sm font-normal">kg</span>
                </div>
                <div className="text-xs text-[#5A665C] font-num">{latestWeight.date}</div>
              </div>
            ) : (
              <p className="text-sm text-[#5A665C]">
                {lang === 'ar'
                  ? `الوزن المبدئي بالملف: ${profile.weightKg} كغ`
                  : `Poids initial du profil : ${profile.weightKg} kg`}
              </p>
            )}
          </div>

          <div className="rounded-2xl bg-white border border-[#E2D9C8] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#C69C43]" />
                <h2 className="text-base font-bold text-[#1C3122]">
                  {lang === 'ar' ? 'المؤشرات الصحية' : 'Indicateurs de santé'}
                </h2>
              </div>
              <button
                onClick={() => onNavigate('health', 'labs')}
                className="text-xs font-semibold text-[#4F6D3A] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>{copy.nav.health}</span>
                <ArrowIcon className="w-3.5 h-3.5" />
              </button>
            </div>

            {latestLab ? (
              <div className="bg-[#F7F3EC] rounded-xl p-4 flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-[#1C281E]">
                    {copy.labLabels[latestLab.metric].name}
                  </div>
                  <div className="text-xs text-[#5A665C] font-num">{latestLab.date}</div>
                </div>
                <div className="text-lg font-bold text-[#1C3122] font-num">
                  {latestLab.value} <span className="text-xs font-normal">{latestLab.unit}</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-[#5A665C]">
                {lang === 'ar'
                  ? 'يمكنك حفظ نتائج تحاليلك (الكوليسترول، سكر الصائم، HbA1c) ومتابعتها بأمان على جهازك.'
                  : 'Enregistrez vos analyses (cholestérol, glycémie, HbA1c) en toute confidentialité sur votre appareil.'}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Today's Program Preview */}
      <section className="rounded-2xl bg-white border border-[#E2D9C8] p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-[#1C3122]">
              {lang === 'ar' ? 'برنامج اليوم المقترح' : 'Programme du jour'}
            </h2>
            <p className="text-xs text-[#5A665C]">
              {activePlan
                ? lang === 'ar'
                  ? activePlan.titleAr
                  : activePlan.titleFr
                : lang === 'ar'
                ? 'لم يتم إنشاء برنامج أسبوعي بعد'
                : 'Aucun programme hebdomadaire actif'}
            </p>
          </div>
          <button
            onClick={() => onNavigate('planner')}
            className="text-xs font-semibold text-[#4F6D3A] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>{lang === 'ar' ? 'عرض الأسبوع كاملاً' : 'Voir toute la semaine'}</span>
            <ArrowIcon className="w-3.5 h-3.5" />
          </button>
        </div>

        {todayPlan ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {(['breakfast', 'lunch', 'dinner'] as const).map((slot) => {
              const recipe = recipeMap[todayPlan.meals[slot]];
              if (!recipe) return null;
              return (
                <RecipeCard
                  key={slot}
                  recipe={recipe}
                  lang={lang}
                  kicker={copy.mealSlots[slot]}
                  imageHeightClass="h-36"
                  onClick={() => onNavigate('planner')}
                />
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl bg-[#F7F3EC] p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-[#5A665C]">
              {lang === 'ar'
                ? 'أنشئ برنامجك الغذائي الأسبوعي المتجدد مع قائمة مشتريات جاهزة.'
                : 'Générez votre programme marocain de 7 jours avec liste de courses automatique.'}
            </p>
            <button
              onClick={() => onNavigate('planner')}
              className="px-4 py-2.5 rounded-xl bg-[#4F6D3A] text-white text-sm font-semibold min-h-[44px] whitespace-nowrap cursor-pointer"
            >
              {lang === 'ar' ? 'أنشئ برنامجي الغذائي لهذا الأسبوع' : 'Générer mon programme'}
            </button>
          </div>
        )}
      </section>
    </div>
  );
};
