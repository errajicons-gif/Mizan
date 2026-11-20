import { FOODS_BY_ID } from '../data/moroccanFoods';
import {
  ActivityLevel,
  FoodItem,
  NutritionTotals,
  Recipe,
  UserProfile,
} from '../types/mizan';

export function round1(val: number): number {
  return Math.round(val * 10) / 10;
}

export function calculateFoodNutrition(food: FoodItem, grams: number): NutritionTotals {
  const factor = Math.max(0, grams) / 100;
  return {
    kcal: Math.round(food.kcal * factor),
    protein: round1(food.protein * factor),
    fat: round1(food.fat * factor),
    carbs: round1(food.carbs * factor),
    fiber: round1(food.fiber * factor),
  };
}

export function calculateRecipeNutrition(
  recipe: Recipe,
  extraFoods?: Record<string, FoodItem>
): { total: NutritionTotals; perServing: NutritionTotals } {
  const total: NutritionTotals = { kcal: 0, protein: 0, fat: 0, carbs: 0, fiber: 0 };

  for (const ing of recipe.ingredients) {
    const food = FOODS_BY_ID[ing.foodId] || extraFoods?.[ing.foodId];
    if (!food) continue;
    const item = calculateFoodNutrition(food, ing.grams);
    total.kcal += item.kcal;
    total.protein += item.protein;
    total.fat += item.fat;
    total.carbs += item.carbs;
    total.fiber += item.fiber;
  }

  const servings = Math.max(1, recipe.servings);
  const perServing: NutritionTotals = {
    kcal: Math.round(total.kcal / servings),
    protein: round1(total.protein / servings),
    fat: round1(total.fat / servings),
    carbs: round1(total.carbs / servings),
    fiber: round1(total.fiber / servings),
  };

  return {
    total: {
      kcal: Math.round(total.kcal),
      protein: round1(total.protein),
      fat: round1(total.fat),
      carbs: round1(total.carbs),
      fiber: round1(total.fiber),
    },
    perServing,
  };
}

export function sumNutrition(items: NutritionTotals[]): NutritionTotals {
  const sum = items.reduce(
    (acc, cur) => ({
      kcal: acc.kcal + cur.kcal,
      protein: acc.protein + cur.protein,
      fat: acc.fat + cur.fat,
      carbs: acc.carbs + cur.carbs,
      fiber: acc.fiber + cur.fiber,
    }),
    { kcal: 0, protein: 0, fat: 0, carbs: 0, fiber: 0 }
  );
  return {
    kcal: Math.round(sum.kcal),
    protein: round1(sum.protein),
    fat: round1(sum.fat),
    carbs: round1(sum.carbs),
    fiber: round1(sum.fiber),
  };
}

const ACTIVITY_FACTORS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

/**
 * Estimates daily maintenance energy & balanced macro reference using Mifflin-St Jeor.
 * Never forces restrictive deficits or assumes weight loss.
 */
export function calculateDailyReference(profile: UserProfile): NutritionTotals {
  const weight = Math.max(30, Math.min(250, profile.weightKg || 68));
  const height = Math.max(110, Math.min(230, profile.heightCm || 168));
  const age = Math.max(10, Math.min(100, profile.age || 30));

  let bmr = 10 * weight + 6.25 * height - 5 * age;
  if (profile.sex === 'male') {
    bmr += 5;
  } else if (profile.sex === 'female') {
    bmr -= 161;
  } else {
    bmr -= 78; // neutral midpoint when unspecified
  }

  // Youth / older adults get gentle balanced maintenance floor
  const factor = ACTIVITY_FACTORS[profile.activityLevel] || 1.45;
  const rawKcal = Math.round(bmr * factor);
  const kcal = Math.max(1400, Math.min(3600, rawKcal));

  // Balanced Mediterranean/Moroccan distribution: ~18% protein, ~30% healthy fats, ~52% carbs
  const protein = Math.round((kcal * 0.18) / 4);
  const fat = Math.round((kcal * 0.30) / 9);
  const carbs = Math.round((kcal * 0.52) / 4);
  const fiber = age >= 50 ? 28 : 30;

  return { kcal, protein, fat, carbs, fiber };
}

/**
 * BMI is only appropriate to display for adults (age >= 18).
 * Returns null for minors to adhere to age-sensitive guidance.
 */
export function calculateAdultBMI(
  weightKg: number,
  heightCm: number,
  age: number
): { value: number; categoryAr: string; categoryFr: string } | null {
  if (age < 18 || !weightKg || !heightCm || heightCm < 100) {
    return null;
  }
  const heightM = heightCm / 100;
  const bmi = round1(weightKg / (heightM * heightM));

  if (bmi < 18.5) {
    return {
      value: bmi,
      categoryAr: 'نطاق منخفض عن المعدل المرجعي العام',
      categoryFr: 'En dessous de la plage de référence générale',
    };
  }
  if (bmi < 25) {
    return {
      value: bmi,
      categoryAr: 'ضمن النطاق المرجعي العام للبالغين',
      categoryFr: 'Dans la plage de référence générale adulte',
    };
  }
  if (bmi < 30) {
    return {
      value: bmi,
      categoryAr: 'أعلى قليلاً من النطاق المرجعي العام (لا يعكس الكتلة العضلية وحدها)',
      categoryFr: 'Légèrement au-dessus de la référence (ne reflète pas la masse musculaire)',
    };
  }
  return {
    value: bmi,
    categoryAr: 'مؤشر إحصائي عام — يُستحسن تقييمه مع مختص تغذية',
    categoryFr: 'Indicateur statistique général — à interpréter avec un professionnel',
  };
}

export interface KitchenMatch {
  recipe: Recipe;
  matchedFoodIds: string[];
  missingFoodIds: string[];
  matchScore: number; // 0 to 100
  perServing: NutritionTotals;
}

export function findKitchenMatches(
  selectedFoodIds: string[],
  recipes: Recipe[]
): KitchenMatch[] {
  if (selectedFoodIds.length === 0) return [];
  const selectedSet = new Set(selectedFoodIds);

  const scored: KitchenMatch[] = recipes
    .filter((r) => !r.mealSlots.every((s) => s === 'morning_snack' || s === 'afternoon_snack'))
    .map((recipe) => {
      const uniqueIngs = Array.from(new Set(recipe.ingredients.map((i) => i.foodId)));
      const matchedFoodIds = uniqueIngs.filter((id) => selectedSet.has(id));
      const missingFoodIds = uniqueIngs.filter((id) => !selectedSet.has(id));
      const matchScore =
        uniqueIngs.length > 0 ? Math.round((matchedFoodIds.length / uniqueIngs.length) * 100) : 0;

      return {
        recipe,
        matchedFoodIds,
        missingFoodIds,
        matchScore,
        perServing: calculateRecipeNutrition(recipe).perServing,
      };
    })
    .filter((m) => m.matchedFoodIds.length > 0)
    .sort((a, b) => {
      if (b.matchedFoodIds.length !== a.matchedFoodIds.length) {
        return b.matchedFoodIds.length - a.matchedFoodIds.length;
      }
      return b.matchScore - a.matchScore;
    });

  return scored.slice(0, 3);
}
