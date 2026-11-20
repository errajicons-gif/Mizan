export type Language = 'ar' | 'fr';

export type Sex = 'female' | 'male' | 'unspecified';

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';

export type BudgetTier = 'economic' | 'moderate' | 'flexible';

export type DietaryPreference =
  | 'traditional_balanced'
  | 'vegetarian'
  | 'pescatarian'
  | 'high_fiber'
  | 'mediterranean';

export type AllergyType = 'gluten' | 'dairy' | 'nuts' | 'fish' | 'eggs' | 'legumes';

export type HealthInterest =
  | 'balanced_nutrition'
  | 'heart_health'
  | 'cholesterol_care'
  | 'blood_sugar_stability'
  | 'food_variety'
  | 'healthy_habits';

export interface UserProfile {
  completedOnboarding: boolean;
  name: string;
  age: number;
  sex: Sex;
  heightCm: number;
  weightKg: number;
  activityLevel: ActivityLevel;
  dietaryPreference: DietaryPreference;
  allergies: AllergyType[];
  favoriteFoods: string[];
  dislikedFoods: string[];
  budgetTier: BudgetTier;
  mealsPerDay: 3 | 4 | 5;
  country: string;
  healthInterests: HealthInterest[];
  aiContextConsent: boolean;
}

export type FoodCategory =
  | 'grains'
  | 'legumes'
  | 'vegetables'
  | 'fruits'
  | 'proteins'
  | 'fats_nuts';

export type FoodState = 'raw' | 'cooked' | 'dried';

export type Season = 'all' | 'winter' | 'spring' | 'summer' | 'autumn';

export interface FoodItem {
  id: string;
  nameAr: string;
  nameFr: string;
  category: FoodCategory;
  state: FoodState;
  kcal: number; // per 100g
  protein: number; // g per 100g
  fat: number; // g per 100g
  carbs: number; // g per 100g
  fiber: number; // g per 100g
  dataSource: string;
  season: Season;
  budgetTier: 'economic' | 'moderate' | 'premium';
  allergens: AllergyType[];
}

export type MealSlot = 'breakfast' | 'morning_snack' | 'lunch' | 'afternoon_snack' | 'dinner';

export type RecipeTag =
  | 'economic'
  | 'quick'
  | 'seasonal'
  | 'breakfast'
  | 'lunch'
  | 'dinner'
  | 'snack'
  | 'vegetarian'
  | 'high_fiber'
  | 'balanced';

export interface RecipeIngredient {
  foodId: string;
  grams: number;
  noteAr?: string;
  noteFr?: string;
}

export interface Recipe {
  id: string;
  nameAr: string;
  nameFr: string;
  tags: RecipeTag[];
  mealSlots: MealSlot[];
  prepMinutes: number;
  servings: number;
  budgetTier: 'economic' | 'moderate' | 'premium';
  season: Season;
  imageUrl: string;
  ingredients: RecipeIngredient[];
  stepsAr: string[];
  stepsFr: string[];
  healthyTipAr: string;
  healthyTipFr: string;
  isCustom?: boolean;
}

export interface NutritionTotals {
  kcal: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber: number;
}

export type PlanMode = 'economic' | 'balanced' | 'varied';

export interface DayPlan {
  dayIndex: number; // 0 = Monday .. 6 = Sunday
  meals: Record<MealSlot, string>; // recipe IDs
}

export interface WeeklyPlan {
  id: string;
  titleAr: string;
  titleFr: string;
  mode: PlanMode;
  createdAt: string;
  season: Season;
  days: DayPlan[];
  aiInsight?: string;
}

export interface MealLogEntry {
  id: string;
  date: string; // YYYY-MM-DD
  slot: MealSlot;
  type: 'food' | 'recipe';
  refId: string;
  nameAr: string;
  nameFr: string;
  amount: number; // grams if food, servings if recipe
  unitLabelAr: string;
  unitLabelFr: string;
  nutrition: NutritionTotals;
  createdAt: string;
}

export interface WeightEntry {
  id: string;
  date: string; // YYYY-MM-DD
  weightKg: number;
  note: string;
}

export type LabMetricType =
  | 'totalCholesterol'
  | 'ldl'
  | 'hdl'
  | 'triglycerides'
  | 'fastingGlucose'
  | 'hba1c';

export interface LabEntry {
  id: string;
  metric: LabMetricType;
  value: number;
  unit: string;
  date: string;
  note: string;
}

export interface ShoppingItem {
  id: string;
  foodId?: string;
  nameAr: string;
  nameFr: string;
  category: FoodCategory;
  grams: number;
  checked: boolean;
  isManual: boolean;
}

export interface ReminderSetting {
  id: string;
  type: 'meals' | 'weekly_plan' | 'weight' | 'water' | 'labs';
  enabled: boolean;
  time: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export type NavTab =
  | 'home'
  | 'planner'
  | 'nutrition'
  | 'health'
  | 'ai'
  | 'recipes'
  | 'foods'
  | 'shopping'
  | 'history'
  | 'settings';
