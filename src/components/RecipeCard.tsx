import React, { useState } from 'react';
import { Utensils } from 'lucide-react';
import { resolveRecipeAssetImage } from '../data/moroccanRecipes';
import { UI_COPY } from '../i18n/translations';
import { Language, Recipe } from '../types/mizan';
import { calculateRecipeNutrition } from '../utils/nutrition';

interface RecipeCardProps {
  recipe: Recipe;
  lang: Language;
  kicker?: string;
  imageHeightClass?: string;
  onClick?: () => void;
  footerExtra?: React.ReactNode;
  children?: React.ReactNode;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  lang,
  kicker,
  imageHeightClass = 'h-44',
  onClick,
  footerExtra,
  children,
}) => {
  const copy = UI_COPY[lang];
  const [imgFailed, setImgFailed] = useState(false);
  const { perServing } = calculateRecipeNutrition(recipe);

  const title = lang === 'ar' ? recipe.nameAr : recipe.nameFr;
  const imageSrc = resolveRecipeAssetImage(recipe);
  const defaultKicker = recipe.tags
    .slice(0, 2)
    .map((t) => copy.recipeTags[t])
    .join(' · ');

  return (
    <article
      onClick={onClick}
      className={`group rounded-2xl bg-white border border-[#E2D9C8] overflow-hidden flex flex-col transition-colors ${
        onClick ? 'hover:border-[#4F6D3A] cursor-pointer' : ''
      }`}
    >
      <div className={`relative w-full ${imageHeightClass} overflow-hidden bg-[#EFE8DA]`}>
        {!imgFailed && imageSrc ? (
          <img
            src={imageSrc}
            alt={title}
            referrerPolicy="no-referrer"
            onError={() => setImgFailed(true)}
            className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-105 will-change-transform"
          />
        ) : (
          <div
            className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#EFE8DA] via-[#F7F3EC] to-[#E2D9C8] text-[#4F6D3A] p-4 transition-transform duration-300 ease-out group-hover:scale-105 will-change-transform"
            role="img"
            aria-label={title}
          >
            <div className="w-11 h-11 rounded-2xl bg-white/80 border border-[#D8CEBC] flex items-center justify-center mb-2">
              <Utensils className="w-5 h-5 text-[#4F6D3A]" />
            </div>
            <span className="text-xs font-semibold text-[#1C3122] text-center line-clamp-2 max-w-[85%]">
              {title}
            </span>
          </div>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="text-xs text-[#4F6D3A] font-semibold">
            {kicker || defaultKicker}
          </div>
          <h3 className="text-base font-bold text-[#1C3122] mt-1 line-clamp-2">
            {title}
          </h3>
        </div>

        {children}

        <div className="pt-2 border-t border-[#F5EFE4] flex items-center justify-between gap-2 text-xs text-[#5A665C] font-num">
          <span>
            {recipe.prepMinutes} {copy.minutes} · {recipe.servings} {copy.servings}
          </span>
          <span className="font-bold text-[#1C3122]">
            {perServing.kcal} {copy.kcal}
          </span>
        </div>

        {footerExtra}
      </div>
    </article>
  );
};
