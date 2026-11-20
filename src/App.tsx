import { useEffect, useMemo, useState } from 'react';
import { FOODS_BY_ID } from './data/moroccanFoods';
import { MOROCCAN_RECIPES } from './data/moroccanRecipes';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import {
  ChatMessage,
  FoodCategory,
  LabEntry,
  Language,
  MealLogEntry,
  MealSlot,
  NavTab,
  PlanMode,
  Recipe,
  ReminderSetting,
  ShoppingItem,
  UserProfile,
  WeeklyPlan,
  WeightEntry,
} from './types/mizan';
import {
  clearAllMizanData,
  loadEncryptedHealthVault,
  loadLocalJson,
  saveEncryptedHealthVault,
  saveLocalJson,
} from './utils/cryptoStorage';
import { aggregateShoppingList, generateWeeklyPlan } from './utils/mealPlanner';
import { calculateRecipeNutrition } from './utils/nutrition';
import { SplashScreen } from './components/MizanLogo';
import { OnboardingWizard } from './components/OnboardingWizard';
import { NavigationShell } from './components/NavigationShell';
import { HomeDashboard } from './components/HomeDashboard';
import { WeeklyPlannerView } from './components/WeeklyPlannerView';
import { NutritionView } from './components/NutritionView';
import { RecipesLibraryView } from './components/RecipesLibraryView';
import { FoodDatabaseView } from './components/FoodDatabaseView';
import { HealthTrackerView } from './components/HealthTrackerView';
import { MizanAiView } from './components/MizanAiView';
import { ShoppingListView } from './components/ShoppingListView';
import { SavedPlansHistoryView } from './components/SavedPlansHistoryView';
import { SettingsView } from './components/SettingsView';

const DEFAULT_PROFILE: UserProfile = {
  completedOnboarding: false,
  name: '',
  age: 30,
  sex: 'unspecified',
  heightCm: 168,
  weightKg: 68,
  activityLevel: 'moderate',
  dietaryPreference: 'traditional_balanced',
  allergies: [],
  favoriteFoods: [],
  dislikedFoods: [],
  budgetTier: 'moderate',
  mealsPerDay: 4,
  country: 'المغرب',
  healthInterests: ['balanced_nutrition', 'healthy_habits'],
  aiContextConsent: true,
};

const DEFAULT_REMINDERS: ReminderSetting[] = [
  { id: 'rem_meals', type: 'meals', enabled: false, time: '13:00' },
  { id: 'rem_plan', type: 'weekly_plan', enabled: false, time: '10:00' },
  { id: 'rem_weight', type: 'weight', enabled: false, time: '08:30' },
  { id: 'rem_water', type: 'water', enabled: false, time: '11:00' },
  { id: 'rem_labs', type: 'labs', enabled: false, time: '09:00' },
];

export default function App() {
  const isOnline = useOnlineStatus();

  const [lang, setLang] = useState<Language>(() => loadLocalJson<Language>('lang', 'ar'));
  const [profile, setProfile] = useState<UserProfile>(() =>
    loadLocalJson<UserProfile>('profile', DEFAULT_PROFILE)
  );
  const [showSplash, setShowSplash] = useState<boolean>(() => !profile.completedOnboarding);
  const [editingOnboarding, setEditingOnboarding] = useState<boolean>(false);

  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [subTabHint, setSubTabHint] = useState<string | undefined>(undefined);

  const [customRecipes, setCustomRecipes] = useState<Recipe[]>(() =>
    loadLocalJson<Recipe[]>('custom_recipes', [])
  );
  const [activePlan, setActivePlan] = useState<WeeklyPlan | null>(() =>
    loadLocalJson<WeeklyPlan | null>('active_plan', null)
  );
  const [savedPlans, setSavedPlans] = useState<WeeklyPlan[]>(() =>
    loadLocalJson<WeeklyPlan[]>('saved_plans', [])
  );
  const [mealLogs, setMealLogs] = useState<MealLogEntry[]>(() =>
    loadLocalJson<MealLogEntry[]>('meal_logs', [])
  );
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>(() =>
    loadLocalJson<ShoppingItem[]>('shopping_items', [])
  );
  const [reminders, setReminders] = useState<ReminderSetting[]>(() =>
    loadLocalJson<ReminderSetting[]>('reminders', DEFAULT_REMINDERS)
  );
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() =>
    loadLocalJson<ChatMessage[]>('chat_messages', [])
  );

  // Encrypted local health vault (weights & lab results)
  const [weights, setWeights] = useState<WeightEntry[]>([]);
  const [labs, setLabs] = useState<LabEntry[]>([]);
  const [vaultLoaded, setVaultLoaded] = useState(false);

  useEffect(() => {
    loadEncryptedHealthVault<{ weights: WeightEntry[]; labs: LabEntry[] }>({
      weights: [],
      labs: [],
    }).then((vault) => {
      setWeights(vault.weights || []);
      setLabs(vault.labs || []);
      setVaultLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (!vaultLoaded) return;
    saveEncryptedHealthVault({ weights, labs });
  }, [weights, labs, vaultLoaded]);

  // Sync HTML lang and dir attributes
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    saveLocalJson('lang', lang);
  }, [lang]);

  useEffect(() => saveLocalJson('profile', profile), [profile]);
  useEffect(() => saveLocalJson('custom_recipes', customRecipes), [customRecipes]);
  useEffect(() => saveLocalJson('active_plan', activePlan), [activePlan]);
  useEffect(() => saveLocalJson('saved_plans', savedPlans), [savedPlans]);
  useEffect(() => saveLocalJson('meal_logs', mealLogs), [mealLogs]);
  useEffect(() => saveLocalJson('shopping_items', shoppingItems), [shoppingItems]);
  useEffect(() => saveLocalJson('reminders', reminders), [reminders]);
  useEffect(() => saveLocalJson('chat_messages', chatMessages), [chatMessages]);

  // Check scheduled reminders softly once per minute
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const matched = reminders.filter((r) => r.enabled && r.time === hhmm);
      if (matched.length > 0 && 'Notification' in window && Notification.permission === 'granted') {
        matched.forEach((m) => {
          new Notification('MIZAN – ميزان', {
            body:
              lang === 'ar'
                ? `تذكير لطيف من ميزان (${m.type})`
                : `Rappel bienveillant MIZAN (${m.type})`,
            icon: '/pwa-192x192.png',
          });
        });
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [reminders, lang]);

  const allRecipes = useMemo(() => [...customRecipes, ...MOROCCAN_RECIPES], [customRecipes]);
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayLogs = useMemo(
    () => mealLogs.filter((l) => l.date === todayStr),
    [mealLogs, todayStr]
  );

  const handleNavigate = (tab: NavTab, subTab?: string) => {
    setSubTabHint(subTab);
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGeneratePlan = (mode: PlanMode) => {
    const newPlan = generateWeeklyPlan(profile, mode, savedPlans, allRecipes);
    setActivePlan(newPlan);
    const items = aggregateShoppingList(newPlan, allRecipes);
    setShoppingItems((prev) => {
      const manual = prev.filter((i) => i.isManual);
      return [...items, ...manual];
    });
  };

  const handleSavePlan = (plan: WeeklyPlan) => {
    setSavedPlans((prev) => {
      const exists = prev.some((p) => p.id === plan.id);
      if (exists) {
        return prev.map((p) => (p.id === plan.id ? plan : p));
      }
      return [plan, ...prev].slice(0, 20);
    });
  };

  const handleSwapMeal = (dayIndex: number, slot: MealSlot, newRecipeId: string) => {
    if (!activePlan) return;
    const updated: WeeklyPlan = {
      ...activePlan,
      days: activePlan.days.map((d) =>
        d.dayIndex === dayIndex
          ? { ...d, meals: { ...d.meals, [slot]: newRecipeId } }
          : d
      ),
    };
    setActivePlan(updated);
    if (savedPlans.some((p) => p.id === updated.id)) {
      setSavedPlans((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    }
  };

  const handleSyncShopping = (plan: WeeklyPlan) => {
    const items = aggregateShoppingList(plan, allRecipes);
    setShoppingItems((prev) => {
      const manual = prev.filter((i) => i.isManual);
      return [...items, ...manual];
    });
  };

  const handleAddMissingToShopping = (foodIds: string[]) => {
    setShoppingItems((prev) => {
      const existingFoodIds = new Set(prev.map((i) => i.foodId).filter(Boolean));
      const additions: ShoppingItem[] = [];
      for (const fid of foodIds) {
        if (existingFoodIds.has(fid)) continue;
        const food = FOODS_BY_ID[fid];
        if (!food) continue;
        additions.push({
          id: `shop_${fid}_${Date.now()}`,
          foodId: fid,
          nameAr: food.nameAr,
          nameFr: food.nameFr,
          category: food.category,
          grams: 250,
          checked: false,
          isManual: true,
        });
      }
      return [...prev, ...additions];
    });
  };

  const handleLogRecipe = (recipe: Recipe, slot: MealSlot) => {
    const { perServing } = calculateRecipeNutrition(recipe);
    const entry: MealLogEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      date: todayStr,
      slot,
      type: 'recipe',
      refId: recipe.id,
      nameAr: recipe.nameAr,
      nameFr: recipe.nameFr,
      amount: 1,
      unitLabelAr: lang === 'ar' ? 'حصة' : 'portion',
      unitLabelFr: 'portion',
      nutrition: perServing,
      createdAt: new Date().toISOString(),
    };
    setMealLogs((prev) => [entry, ...prev]);
  };

  const handleExportBackup = () => {
    const payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      lang,
      profile,
      activePlan,
      savedPlans,
      mealLogs,
      customRecipes,
      shoppingItems,
      reminders,
      weights,
      labs,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mizan-backup-${todayStr}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (!data || typeof data !== 'object' || !data.profile) return false;
      if (data.lang === 'ar' || data.lang === 'fr') setLang(data.lang);
      setProfile(data.profile);
      if (data.activePlan !== undefined) setActivePlan(data.activePlan);
      if (Array.isArray(data.savedPlans)) setSavedPlans(data.savedPlans);
      if (Array.isArray(data.mealLogs)) setMealLogs(data.mealLogs);
      if (Array.isArray(data.customRecipes)) setCustomRecipes(data.customRecipes);
      if (Array.isArray(data.shoppingItems)) setShoppingItems(data.shoppingItems);
      if (Array.isArray(data.reminders)) setReminders(data.reminders);
      if (Array.isArray(data.weights)) setWeights(data.weights);
      if (Array.isArray(data.labs)) setLabs(data.labs);
      return true;
    } catch {
      return false;
    }
  };

  const handleClearAll = () => {
    clearAllMizanData();
    setProfile(DEFAULT_PROFILE);
    setActivePlan(null);
    setSavedPlans([]);
    setMealLogs([]);
    setCustomRecipes([]);
    setShoppingItems([]);
    setWeights([]);
    setLabs([]);
    setChatMessages([]);
    setReminders(DEFAULT_REMINDERS);
    setShowSplash(true);
    setActiveTab('home');
  };

  if (showSplash) {
    return <SplashScreen lang={lang} onEnter={() => setShowSplash(false)} />;
  }

  if (!profile.completedOnboarding || editingOnboarding) {
    return (
      <OnboardingWizard
        lang={lang}
        initialProfile={profile}
        onChangeLang={setLang}
        onComplete={(updated) => {
          setProfile(updated);
          setEditingOnboarding(false);
          if (!activePlan) {
            const firstPlan = generateWeeklyPlan(updated, 'balanced', [], allRecipes);
            setActivePlan(firstPlan);
            setShoppingItems(aggregateShoppingList(firstPlan, allRecipes));
          }
        }}
      />
    );
  }

  return (
    <NavigationShell
      lang={lang}
      activeTab={activeTab}
      isOnline={isOnline}
      onSelectTab={(tab) => handleNavigate(tab)}
      onToggleLang={() => setLang((prev) => (prev === 'ar' ? 'fr' : 'ar'))}
    >
      {activeTab === 'home' && (
        <HomeDashboard
          lang={lang}
          profile={profile}
          activePlan={activePlan}
          todayLogs={todayLogs}
          weights={weights}
          labs={labs}
          allRecipes={allRecipes}
          onNavigate={handleNavigate}
        />
      )}

      {activeTab === 'planner' && (
        <WeeklyPlannerView
          lang={lang}
          isOnline={isOnline}
          profile={profile}
          activePlan={activePlan}
          savedPlans={savedPlans}
          allRecipes={allRecipes}
          onGeneratePlan={handleGeneratePlan}
          onSavePlan={handleSavePlan}
          onSwapMeal={handleSwapMeal}
          onSyncShopping={handleSyncShopping}
          onAttachInsight={(planId, insight) => {
            if (activePlan && activePlan.id === planId) {
              const updated = { ...activePlan, aiInsight: insight };
              setActivePlan(updated);
              setSavedPlans((prev) => prev.map((p) => (p.id === planId ? updated : p)));
            }
          }}
          onLogRecipe={handleLogRecipe}
        />
      )}

      {activeTab === 'nutrition' && (
        <NutritionView
          lang={lang}
          profile={profile}
          allRecipes={allRecipes}
          mealLogs={mealLogs}
          initialSubTab={subTabHint}
          onAddLog={(entry) =>
            setMealLogs((prev) => [
              {
                ...entry,
                id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                createdAt: new Date().toISOString(),
              },
              ...prev,
            ])
          }
          onDeleteLog={(id) => setMealLogs((prev) => prev.filter((l) => l.id !== id))}
          onSaveCustomRecipe={(r) => setCustomRecipes((prev) => [r, ...prev])}
          onAddMissingToShopping={handleAddMissingToShopping}
        />
      )}

      {activeTab === 'health' && (
        <HealthTrackerView
          lang={lang}
          profile={profile}
          weights={weights}
          labs={labs}
          initialSubTab={subTabHint}
          onAddWeight={(w) =>
            setWeights((prev) => [...prev, { ...w, id: `w_${Date.now()}` }])
          }
          onDeleteWeight={(id) => setWeights((prev) => prev.filter((w) => w.id !== id))}
          onAddLab={(l) => setLabs((prev) => [...prev, { ...l, id: `lab_${Date.now()}` }])}
          onDeleteLab={(id) => setLabs((prev) => prev.filter((l) => l.id !== id))}
        />
      )}

      {activeTab === 'ai' && (
        <MizanAiView
          lang={lang}
          isOnline={isOnline}
          profile={profile}
          todayLogs={todayLogs}
          messages={chatMessages}
          onAddMessage={(msg) => setChatMessages((prev) => [...prev, msg])}
          onClearChat={() => setChatMessages([])}
        />
      )}

      {activeTab === 'recipes' && (
        <RecipesLibraryView
          lang={lang}
          recipes={allRecipes}
          onLogRecipe={handleLogRecipe}
        />
      )}

      {activeTab === 'foods' && <FoodDatabaseView lang={lang} />}

      {activeTab === 'shopping' && (
        <ShoppingListView
          lang={lang}
          items={shoppingItems}
          onToggleItem={(id) =>
            setShoppingItems((prev) =>
              prev.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i))
            )
          }
          onAddManual={(name, category: FoodCategory, grams) =>
            setShoppingItems((prev) => [
              ...prev,
              {
                id: `shop_man_${Date.now()}`,
                nameAr: name,
                nameFr: name,
                category,
                grams,
                checked: false,
                isManual: true,
              },
            ])
          }
          onRemoveItem={(id) => setShoppingItems((prev) => prev.filter((i) => i.id !== id))}
          onClearChecked={() => setShoppingItems((prev) => prev.filter((i) => !i.checked))}
        />
      )}

      {activeTab === 'history' && (
        <SavedPlansHistoryView
          lang={lang}
          savedPlans={savedPlans}
          activePlanId={activePlan?.id || null}
          onActivatePlan={(plan) => {
            setActivePlan(plan);
            setActiveTab('planner');
          }}
          onDeletePlan={(id) => setSavedPlans((prev) => prev.filter((p) => p.id !== id))}
        />
      )}

      {activeTab === 'settings' && (
        <SettingsView
          lang={lang}
          profile={profile}
          reminders={reminders}
          onChangeLang={setLang}
          onEditOnboarding={() => setEditingOnboarding(true)}
          onUpdateProfile={setProfile}
          onUpdateReminders={setReminders}
          onExportBackup={handleExportBackup}
          onImportBackup={handleImportBackup}
          onClearAllData={handleClearAll}
        />
      )}
    </NavigationShell>
  );
}
