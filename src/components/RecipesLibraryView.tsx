import React, { useMemo, useState } from 'react';
import { Clock, Plus, Search, Users, X } from 'lucide-react';
import { FOODS_BY_ID } from '../data/moroccanFoods';
import { resolveRecipeAssetImage } from '../data/moroccanRecipes';
import { UI_COPY } from '../i18n/translations';
import { Language, MealSlot, Recipe, RecipeTag } from '../types/mizan';
import { calculateRecipeNutrition } from '../utils/nutrition';
import { FoodImage } from './MizanLogo';
import { RecipeCard } from './RecipeCard';

interface RecipesLibraryViewProps {
  lang: Language;
  recipes: Recipe[];
  onLogRecipe: (recipe: Recipe, slot: MealSlot) => void;
}

const ALL_TAGS: RecipeTag[] = [
  'balanced',
  'economic',
  'quick',
  'seasonal',
  'breakfast',
  'lunch',
  'dinner',
  'vegetarian',
  'high_fiber',
];

export const RecipesLibraryView: React.FC<RecipesLibraryViewProps> = ({
  lang,
  recipes,
  onLogRecipe,
}) => {
  const copy = UI_COPY[lang];
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState<RecipeTag | 'all'>('all');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [loggedFeedback, setLoggedFeedback] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return recipes.filter((r) => {
      const tagMatch = activeTag === 'all' || r.tags.includes(activeTag);
      const qMatch =
        !q || r.nameAr.toLowerCase().includes(q) || r.nameFr.toLowerCase().includes(q);
      return tagMatch && qMatch;
    });
  }, [recipes, search, activeTag]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1C3122]">{copy.nav.recipes}</h1>
          <p className="text-sm text-[#5A665C]">
            {lang === 'ar'
              ? `${recipes.length} وصفة مغربية أصلية محسوبة القيم الغذائية من قاعدة البيانات`
              : `${recipes.length} recettes marocaines authentiques calculées depuis la base nutritionnelle`}
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-[#5A665C] absolute top-3 start-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={lang === 'ar' ? 'ابحث عن طبق...' : 'Rechercher un plat...'}
            className="w-full rounded-xl border border-[#D8CEBC] bg-white ps-10 pe-4 py-2.5 text-sm"
          />
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTag('all')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 min-h-[40px] cursor-pointer ${
            activeTag === 'all'
              ? 'bg-[#1C3122] text-white'
              : 'bg-white border border-[#E2D9C8] text-[#5A665C]'
          }`}
        >
          {lang === 'ar' ? 'الكل' : 'Toutes'}
        </button>
        {ALL_TAGS.map((tag) => (
          <button
            key={tag}
            onClick={() => setActiveTag(tag)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 min-h-[40px] cursor-pointer ${
              activeTag === tag
                ? 'bg-[#4F6D3A] text-white'
                : 'bg-white border border-[#E2D9C8] text-[#5A665C]'
            }`}
          >
            {copy.recipeTags[tag]}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((recipe) => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            lang={lang}
            onClick={() => {
              setSelectedRecipe(recipe);
              setLoggedFeedback(false);
            }}
          />
        ))}
      </div>

      {/* Detail Modal */}
      {selectedRecipe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl max-h-[90vh] bg-white rounded-3xl border border-[#E2D9C8] flex flex-col overflow-hidden">
            <div className="relative h-52 shrink-0">
              <FoodImage
                src={resolveRecipeAssetImage(selectedRecipe)}
                alt={lang === 'ar' ? selectedRecipe.nameAr : selectedRecipe.nameFr}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedRecipe(null)}
                className="absolute top-3 end-3 w-10 h-10 rounded-full bg-white/90 text-[#1C3122] flex items-center justify-center shadow-sm cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-xl font-bold text-[#1C3122]">
                    {lang === 'ar' ? selectedRecipe.nameAr : selectedRecipe.nameFr}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-[#5A665C] mt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {selectedRecipe.prepMinutes} {copy.minutes}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {selectedRecipe.servings} {copy.servings}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onLogRecipe(selectedRecipe, selectedRecipe.mealSlots[0] || 'lunch');
                    setLoggedFeedback(true);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#4F6D3A] text-white text-xs font-semibold min-h-[40px] cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>
                    {loggedFeedback
                      ? lang === 'ar'
                        ? 'تم التسجيل!'
                        : 'Enregistré !'
                      : lang === 'ar'
                      ? 'تسجيل كوجبة اليوم'
                      : 'Logger aujourd’hui'}
                  </span>
                </button>
              </div>

              {(() => {
                const { perServing } = calculateRecipeNutrition(selectedRecipe);
                return (
                  <div className="grid grid-cols-5 gap-2 bg-[#F7F3EC] rounded-xl p-3 text-center">
                    <div>
                      <div className="text-xs text-[#5A665C]">{copy.kcal}</div>
                      <div className="font-bold font-num">{perServing.kcal}</div>
                    </div>
                    <div>
                      <div className="text-xs text-[#5A665C]">{copy.protein}</div>
                      <div className="font-bold font-num">{perServing.protein}g</div>
                    </div>
                    <div>
                      <div className="text-xs text-[#5A665C]">{copy.fat}</div>
                      <div className="font-bold font-num">{perServing.fat}g</div>
                    </div>
                    <div>
                      <div className="text-xs text-[#5A665C]">{copy.carbs}</div>
                      <div className="font-bold font-num">{perServing.carbs}g</div>
                    </div>
                    <div>
                      <div className="text-xs text-[#5A665C]">{copy.fiber}</div>
                      <div className="font-bold font-num">{perServing.fiber}g</div>
                    </div>
                  </div>
                );
              })()}

              <div>
                <h4 className="font-bold text-sm text-[#1C3122] mb-2">
                  {lang === 'ar' ? 'المكونات الدقيقة' : 'Ingrédients exacts'}
                </h4>
                <ul className="space-y-1.5 text-sm">
                  {selectedRecipe.ingredients.map((ing) => {
                    const food = FOODS_BY_ID[ing.foodId];
                    return (
                      <li
                        key={ing.foodId}
                        className="flex items-center justify-between border-b border-[#F5EFE4] pb-1"
                      >
                        <span>{food ? (lang === 'ar' ? food.nameAr : food.nameFr) : ing.foodId}</span>
                        <span className="font-num text-xs text-[#5A665C]">
                          {ing.grams} {copy.grams}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-sm text-[#1C3122] mb-2">
                  {lang === 'ar' ? 'خطوات التحضير' : 'Étapes de préparation'}
                </h4>
                <ol className="space-y-2 text-sm list-decimal list-inside">
                  {(lang === 'ar' ? selectedRecipe.stepsAr : selectedRecipe.stepsFr).map(
                    (step, i) => (
                      <li key={i} className="leading-relaxed">
                        {step}
                      </li>
                    )
                  )}
                </ol>
              </div>

              <div className="rounded-xl bg-[#4F6D3A]/10 p-3.5 text-xs text-[#1C3122] leading-relaxed">
                <strong>{lang === 'ar' ? 'بديل ونصيحة صحية: ' : 'Astuce santé : '}</strong>
                {lang === 'ar' ? selectedRecipe.healthyTipAr : selectedRecipe.healthyTipFr}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
