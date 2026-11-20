import { FOODS_BY_ID } from '../data/moroccanFoods';
import { MOROCCAN_RECIPES } from '../data/moroccanRecipes';
import {
  DayPlan,
  FoodCategory,
  MealSlot,
  PlanMode,
  Recipe,
  Season,
  ShoppingItem,
  UserProfile,
  WeeklyPlan,
} from '../types/mizan';

export function getCurrentSeason(): Season {
  const month = new Date().getMonth() + 1;
  if (month === 12 || month <= 2) return 'winter';
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  return 'autumn';
}

export function isRecipeCompatible(recipe: Recipe, profile: UserProfile): boolean {
  // Check allergens
  for (const ing of recipe.ingredients) {
    const food = FOODS_BY_ID[ing.foodId];
    if (!food) continue;
    for (const allergen of food.allergens) {
      if (profile.allergies.includes(allergen)) {
        return false;
      }
    }
    if (
      profile.dislikedFoods.some(
        (d) =>
          d.trim() &&
          (food.nameAr.includes(d.trim()) ||
            food.nameFr.toLowerCase().includes(d.trim().toLowerCase()))
      )
    ) {
      return false;
    }
  }

  // Dietary preference checks
  if (profile.dietaryPreference === 'vegetarian') {
    const hasAnimalMeatOrFish = recipe.ingredients.some((i) =>
      ['chicken_cooked', 'chicken_raw', 'beef_lean_cooked', 'sardine_grilled', 'sardine_raw', 'white_fish_cooked'].includes(
        i.foodId
      )
    );
    if (hasAnimalMeatOrFish) return false;
  }

  if (profile.dietaryPreference === 'pescatarian') {
    const hasMeat = recipe.ingredients.some((i) =>
      ['chicken_cooked', 'chicken_raw', 'beef_lean_cooked'].includes(i.foodId)
    );
    if (hasMeat) return false;
  }

  return true;
}

function scoreRecipeForPlan(
  recipe: Recipe,
  mode: PlanMode,
  season: Season,
  profile: UserProfile,
  recentRecipeIds: Set<string>,
  usedThisWeekCount: Record<string, number>
): number {
  let score = 100;

  // Strongly penalize over-repetition within the same week and across recent plans
  const weekCount = usedThisWeekCount[recipe.id] || 0;
  score -= weekCount * 45;
  if (recentRecipeIds.has(recipe.id)) {
    score -= mode === 'varied' ? 40 : 25;
  }

  // Seasonal bonus
  if (recipe.season === season) {
    score += 22;
  } else if (recipe.season === 'all') {
    score += 8;
  }

  // Mode preferences
  if (mode === 'economic') {
    if (recipe.budgetTier === 'economic') score += 30;
    if (recipe.budgetTier === 'premium') score -= 35;
  } else if (mode === 'balanced') {
    if (recipe.tags.includes('balanced') || recipe.tags.includes('high_fiber')) score += 20;
  } else if (mode === 'varied') {
    score -= weekCount * 35; // extra diversity push
    if (recipe.tags.includes('seasonal')) score += 15;
  }

  // Respect user budget tier
  if (profile.budgetTier === 'economic' && recipe.budgetTier === 'premium') {
    score -= 25;
  }

  // Favorite food boost
  for (const ing of recipe.ingredients) {
    const food = FOODS_BY_ID[ing.foodId];
    if (
      food &&
      profile.favoriteFoods.some(
        (fav) =>
          fav.trim() &&
          (food.nameAr.includes(fav.trim()) ||
            food.nameFr.toLowerCase().includes(fav.trim().toLowerCase()))
      )
    ) {
      score += 12;
    }
  }

  // Random jitter for fresh non-identical plans each generation
  score += Math.random() * 18;
  return score;
}

export function generateWeeklyPlan(
  profile: UserProfile,
  mode: PlanMode,
  previousPlans: WeeklyPlan[],
  allRecipes: Recipe[] = MOROCCAN_RECIPES
): WeeklyPlan {
  const season = getCurrentSeason();

  // Gather recipe IDs from the last 2 saved plans to avoid excessive repetition
  const recentRecipeIds = new Set<string>();
  previousPlans.slice(0, 2).forEach((plan) => {
    plan.days.forEach((d) => {
      Object.values(d.meals).forEach((rid) => recentRecipeIds.add(rid));
    });
  });

  const compatibleRecipes = allRecipes.filter((r) => isRecipeCompatible(r, profile));
  const pool = compatibleRecipes.length >= 6 ? compatibleRecipes : allRecipes;

  const usedThisWeekCount: Record<string, number> = {};
  const slots: MealSlot[] = ['breakfast', 'morning_snack', 'lunch', 'afternoon_snack', 'dinner'];

  const days: DayPlan[] = Array.from({ length: 7 }, (_, dayIndex) => {
    const meals = {} as Record<MealSlot, string>;
    const usedToday = new Set<string>();

    for (const slot of slots) {
      let candidates = pool.filter(
        (r) => r.mealSlots.includes(slot) && !usedToday.has(r.id)
      );
      if (candidates.length === 0) {
        candidates = pool.filter((r) => r.mealSlots.includes(slot));
      }
      if (candidates.length === 0) {
        candidates = pool;
      }

      const ranked = [...candidates].sort(
        (a, b) =>
          scoreRecipeForPlan(b, mode, season, profile, recentRecipeIds, usedThisWeekCount) -
          scoreRecipeForPlan(a, mode, season, profile, recentRecipeIds, usedThisWeekCount)
      );

      const chosen = ranked[0];
      meals[slot] = chosen.id;
      usedToday.add(chosen.id);
      usedThisWeekCount[chosen.id] = (usedThisWeekCount[chosen.id] || 0) + 1;
    }

    return { dayIndex, meals };
  });

  const now = new Date();
  const dateLabel = now.toLocaleDateString('ar-MA', { day: 'numeric', month: 'short' });
  const dateLabelFr = now.toLocaleDateString('fr-MA', { day: 'numeric', month: 'short' });

  const modeTitleAr: Record<PlanMode, string> = {
    economic: 'البرنامج الاقتصادي',
    balanced: 'البرنامج المتوازن',
    varied: 'البرنامج المتنوع',
  };
  const modeTitleFr: Record<PlanMode, string> = {
    economic: 'Programme Économique',
    balanced: 'Programme Équilibré',
    varied: 'Programme Varié',
  };

  return {
    id: `plan_${Date.now()}`,
    titleAr: `${modeTitleAr[mode]} — ${dateLabel}`,
    titleFr: `${modeTitleFr[mode]} — ${dateLabelFr}`,
    mode,
    createdAt: now.toISOString(),
    season,
    days,
  };
}

export function getMealAlternatives(
  slot: MealSlot,
  currentRecipeId: string,
  profile: UserProfile,
  allRecipes: Recipe[] = MOROCCAN_RECIPES
): Recipe[] {
  const compatible = allRecipes.filter(
    (r) =>
      r.id !== currentRecipeId &&
      r.mealSlots.includes(slot) &&
      isRecipeCompatible(r, profile)
  );
  if (compatible.length > 0) return compatible;
  return allRecipes.filter((r) => r.id !== currentRecipeId && r.mealSlots.includes(slot));
}

export function aggregateShoppingList(
  plan: WeeklyPlan,
  allRecipes: Recipe[] = MOROCCAN_RECIPES
): ShoppingItem[] {
  const recipeMap = Object.fromEntries(allRecipes.map((r) => [r.id, r]));
  const totalsByFoodId: Record<string, number> = {};

  for (const day of plan.days) {
    for (const recipeId of Object.values(day.meals)) {
      const recipe = recipeMap[recipeId];
      if (!recipe) continue;
      const perServingFactor = 1 / Math.max(1, recipe.servings);
      for (const ing of recipe.ingredients) {
        const portionGrams = Math.round(ing.grams * perServingFactor);
        totalsByFoodId[ing.foodId] = (totalsByFoodId[ing.foodId] || 0) + portionGrams;
      }
    }
  }

  const items: ShoppingItem[] = [];
  for (const [foodId, grams] of Object.entries(totalsByFoodId)) {
    const food = FOODS_BY_ID[foodId];
    if (!food) continue;
    items.push({
      id: `shop_${foodId}`,
      foodId,
      nameAr: food.nameAr,
      nameFr: food.nameFr,
      category: food.category as FoodCategory,
      grams: Math.max(10, Math.round(grams / 5) * 5),
      checked: false,
      isManual: false,
    });
  }

  return items.sort((a, b) => a.category.localeCompare(b.category));
}
