import {
  ActivityLevel,
  AllergyType,
  BudgetTier,
  DietaryPreference,
  FoodCategory,
  FoodState,
  HealthInterest,
  LabMetricType,
  Language,
  MealSlot,
  PlanMode,
  RecipeTag,
  Sex,
} from '../types/mizan';

export const UI_COPY: Record<
  Language,
  {
    brandName: string;
    slogan: string;
    nav: {
      home: string;
      planner: string;
      nutrition: string;
      health: string;
      ai: string;
      recipes: string;
      foods: string;
      shopping: string;
      history: string;
      settings: string;
      more: string;
    };
    days: string[];
    mealSlots: Record<MealSlot, string>;
    categories: Record<FoodCategory, string>;
    foodStates: Record<FoodState, string>;
    planModes: Record<PlanMode, { title: string; desc: string }>;
    recipeTags: Record<RecipeTag, string>;
    sexLabels: Record<Sex, string>;
    activityLabels: Record<ActivityLevel, string>;
    dietLabels: Record<DietaryPreference, string>;
    allergyLabels: Record<AllergyType, string>;
    budgetLabels: Record<BudgetTier, string>;
    interestLabels: Record<HealthInterest, string>;
    labLabels: Record<
      LabMetricType,
      {
        name: string;
        units: string[];
        defaultUnit: string;
        refTextByUnit: Record<string, string>;
        education: string;
      }
    >;
    offlineBanner: string;
    installApp: string;
    installIOS: string;
    kcal: string;
    protein: string;
    fat: string;
    carbs: string;
    fiber: string;
    grams: string;
    serving: string;
    servings: string;
    minutes: string;
  }
> = {
  ar: {
    brandName: 'MIZAN – ميزان',
    slogan: 'توازن في غذائك، صحة في حياتك',
    nav: {
      home: 'الرئيسية',
      planner: 'برنامجي الأسبوعي',
      nutrition: 'التغذية والسعرات',
      health: 'ملفي الصحي',
      ai: 'MIZAN AI',
      recipes: 'مكتبة الوصفات',
      foods: 'قاعدة الأغذية',
      shopping: 'قائمة المشتريات',
      history: 'سجل البرامج السابقة',
      settings: 'الإعدادات',
      more: 'المزيد',
    },
    days: ['الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت', 'الأحد'],
    mealSlots: {
      breakfast: 'الفطور',
      morning_snack: 'وجبة خفيفة صباحية',
      lunch: 'الغداء',
      afternoon_snack: 'وجبة خفيفة مسائية',
      dinner: 'العشاء',
    },
    categories: {
      grains: 'الخبز والحبوب',
      legumes: 'البقوليات',
      vegetables: 'الخضراوات',
      fruits: 'الفواكه',
      proteins: 'البروتينات',
      fats_nuts: 'الدهون والمكسرات',
    },
    foodStates: {
      raw: 'نيئ',
      cooked: 'مطبوخ',
      dried: 'مجفف',
    },
    planModes: {
      economic: {
        title: 'البرنامج الاقتصادي',
        desc: 'أطباق مغربية مغذية بمكونات يومية ميسورة التكلفة.',
      },
      balanced: {
        title: 'البرنامج المتوازن',
        desc: 'توزيع متناغم للبروتينات والألياف والدهون الصحية.',
      },
      varied: {
        title: 'البرنامج المتنوع',
        desc: 'تجدد أسبوعي واسع يستفيد من الخضر والفواكه الموسمية.',
      },
    },
    recipeTags: {
      economic: 'وصفات اقتصادية',
      quick: 'وصفات سريعة',
      seasonal: 'وصفات موسمية',
      breakfast: 'وجبات الفطور',
      lunch: 'وجبات الغداء',
      dinner: 'وجبات العشاء',
      snack: 'وجبات خفيفة',
      vegetarian: 'وجبات نباتية',
      high_fiber: 'غنية بالألياف',
      balanced: 'وصفات مغربية متوازنة',
    },
    sexLabels: {
      female: 'أنثى',
      male: 'ذكر',
      unspecified: 'أفضل عدم التحديد',
    },
    activityLabels: {
      sedentary: 'نشاط خفيف جداً (عمل مكتبي)',
      light: 'نشاط خفيف (مشي بسيط يومياً)',
      moderate: 'نشاط معتدل (حركة منتظمة 3-4 أيام)',
      active: 'نشاط مرتفع (رياضة أو عمل بدني)',
      very_active: 'نشاط عالٍ جداً',
    },
    dietLabels: {
      traditional_balanced: 'مطبخ مغربي متوازن',
      mediterranean: 'تغذية متوسطية بزيت الزيتون',
      pescatarian: 'نباتي مع الأسماك (السردين والسمك الأبيض)',
      vegetarian: 'نباتي (مع الحليب والبيض أو بدونهما)',
      high_fiber: 'غني بالألياف والحبوب الكاملة',
    },
    allergyLabels: {
      gluten: 'الغلوتين / القمح',
      dairy: 'منتجات الحليب',
      nuts: 'المكسرات',
      fish: 'الأسماك والمأكولات البحرية',
      eggs: 'البيض',
      legumes: 'البقوليات',
    },
    budgetLabels: {
      economic: 'اقتصادية',
      moderate: 'متوسطة',
      flexible: 'مرنة',
    },
    interestLabels: {
      balanced_nutrition: 'التغذية المتوازنة',
      heart_health: 'دعم صحة القلب',
      cholesterol_care: 'الاهتمام بالكوليسترول',
      blood_sugar_stability: 'تنظيم الوجبات للمساعدة على استقرار السكر',
      food_variety: 'تنويع الطعام',
      healthy_habits: 'المحافظة على عادات غذائية صحية',
    },
    labLabels: {
      totalCholesterol: {
        name: 'الكوليسترول الكلي',
        units: ['mg/dL', 'mmol/L'],
        defaultUnit: 'mg/dL',
        refTextByUnit: {
          'mg/dL': 'النطاق المرجعي الشائع للبالغين: أقل من 200 mg/dL',
          'mmol/L': 'النطاق المرجعي الشائع للبالغين: أقل من 5.2 mmol/L',
        },
        education:
          'مؤشر إجمالي لدهون الدم. التركيز على زيت الزيتون، الأسماك، والشعير والبقوليات يدعم توازنه الغذائي، وتُقرأ النتيجة دائماً مع الطبيب.',
      },
      ldl: {
        name: 'كوليسترول LDL',
        units: ['mg/dL', 'mmol/L'],
        defaultUnit: 'mg/dL',
        refTextByUnit: {
          'mg/dL': 'النطاق المرجعي العام: غالباً أقل من 100–130 mg/dL حسب الحالة',
          'mmol/L': 'النطاق المرجعي العام: غالباً أقل من 2.6–3.4 mmol/L حسب الحالة',
        },
        education:
          'يُعرف بالكوليسترول منخفض الكثافة. تختلف القيمة المستهدفة من شخص لآخر وفق تقييم الطبيب والألياف الذائبة مثل الشعير والشوفان تدعم توازنه.',
      },
      hdl: {
        name: 'كوليسترول HDL',
        units: ['mg/dL', 'mmol/L'],
        defaultUnit: 'mg/dL',
        refTextByUnit: {
          'mg/dL': 'النطاق المرجعي الشائع: عادةً 40 mg/dL فأكثر للرجال، 50 فأكثر للنساء',
          'mmol/L': 'النطاق المرجعي الشائع: عادةً 1.0 mmol/L فأكثر للرجال، 1.3 فأكثر للنساء',
        },
        education:
          'يُعرف بالكوليسترول عالي الكثافة. النشاط البدني المنتظم والدهون غير المشبعة مثل زيت الزيتون والجوز والسردين ترتبط بدعمه.',
      },
      triglycerides: {
        name: 'الدهون الثلاثية',
        units: ['mg/dL', 'mmol/L'],
        defaultUnit: 'mg/dL',
        refTextByUnit: {
          'mg/dL': 'النطاق المرجعي الصائم: أقل من 150 mg/dL',
          'mmol/L': 'النطاق المرجعي الصائم: أقل من 1.7 mmol/L',
        },
        education:
          'تتأثر بتوازن السكريات المضافة، النشاط الحركي، وتناول الأسماك الدهنية كالسردين المغربي.',
      },
      fastingGlucose: {
        name: 'سكر الدم الصائم',
        units: ['mg/dL', 'g/L', 'mmol/L'],
        defaultUnit: 'g/L',
        refTextByUnit: {
          'mg/dL': 'النطاق المرجعي الصائم المعتاد: 70 – 99 mg/dL',
          'g/L': 'النطاق المرجعي الصائم المعتاد بالمغرب: 0.70 – 0.99 g/L',
          'mmol/L': 'النطاق المرجعي الصائم المعتاد: 3.9 – 5.5 mmol/L',
        },
        education:
          'يعكس مستوى الغلوكوز بعد صيام 8 ساعات. انتظام مواعيد الوجبات وتفضيل الحبوب الكاملة والألياف يساعد على استقرار الطاقة. هذا عرض تثقيفي وليس تشخيصاً.',
      },
      hba1c: {
        name: 'الخضاب السكري (HbA1c)',
        units: ['%', 'mmol/mol'],
        defaultUnit: '%',
        refTextByUnit: {
          '%': 'النطاق المرجعي العام: أقل من 5.7%',
          'mmol/mol': 'النطاق المرجعي العام: أقل من 39 mmol/mol',
        },
        education:
          'يعطي فكرة عامة عن متوسط سكر الدم خلال قرابة 3 أشهر. يُناقش دائماً مع الطبيب المعالج لتقييمه وفق السياق الشخصي.',
      },
    },
    offlineBanner: 'وضع عدم الاتصال — تعمل البيانات المحلية والوصفات والبرامج المحفوظة بشكل طبيعي',
    installApp: 'تثبيت التطبيق على الجهاز',
    installIOS: 'تثبيت على iPhone / iPad',
    kcal: 'سعرة',
    protein: 'بروتين',
    fat: 'دهون',
    carbs: 'كربوهيدرات',
    fiber: 'ألياف',
    grams: 'غ',
    serving: 'حصة',
    servings: 'حصص',
    minutes: 'دقيقة',
  },
  fr: {
    brandName: 'MIZAN – ميزان',
    slogan: 'L’équilibre dans votre alimentation, la santé dans votre vie',
    nav: {
      home: 'Accueil',
      planner: 'Programme',
      nutrition: 'Nutrition',
      health: 'Santé',
      ai: 'MIZAN AI',
      recipes: 'Recettes',
      foods: 'Aliments',
      shopping: 'Courses',
      history: 'Historique',
      settings: 'Paramètres',
      more: 'Menu',
    },
    days: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'],
    mealSlots: {
      breakfast: 'Petit-déjeuner',
      morning_snack: 'Collation matin',
      lunch: 'Déjeuner',
      afternoon_snack: 'Collation après-midi',
      dinner: 'Dîner',
    },
    categories: {
      grains: 'Pains & Céréales',
      legumes: 'Légumineuses',
      vegetables: 'Légumes',
      fruits: 'Fruits',
      proteins: 'Protéines',
      fats_nuts: 'Huiles & Oléagineux',
    },
    foodStates: {
      raw: 'Cru',
      cooked: 'Cuit',
      dried: 'Sec',
    },
    planModes: {
      economic: {
        title: 'Programme Économique',
        desc: 'Plats marocains nutritifs avec des ingrédients du quotidien accessibles.',
      },
      balanced: {
        title: 'Programme Équilibré',
        desc: 'Répartition harmonieuse en protéines, fibres et bons lipides.',
      },
      varied: {
        title: 'Programme Varié',
        desc: 'Large variété hebdomadaire valorisant les produits de saison.',
      },
    },
    recipeTags: {
      economic: 'Économiques',
      quick: 'Rapides',
      seasonal: 'De saison',
      breakfast: 'Petit-déjeuner',
      lunch: 'Déjeuner',
      dinner: 'Dîner',
      snack: 'Collations',
      vegetarian: 'Végétariennes',
      high_fiber: 'Riches en fibres',
      balanced: 'Équilibrées',
    },
    sexLabels: {
      female: 'Femme',
      male: 'Homme',
      unspecified: 'Non précisé',
    },
    activityLabels: {
      sedentary: 'Sédentaire (travail de bureau)',
      light: 'Légèrement actif (marche quotidienne)',
      moderate: 'Modérément actif (3–4 fois/sem.)',
      active: 'Actif (sport ou métier physique)',
      very_active: 'Très actif',
    },
    dietLabels: {
      traditional_balanced: 'Cuisine marocaine équilibrée',
      mediterranean: 'Méditerranéenne à l’huile d’olive',
      pescatarian: 'Pescétarienne (poissons & végétaux)',
      vegetarian: 'Végétarienne',
      high_fiber: 'Riche en fibres et céréales complètes',
    },
    allergyLabels: {
      gluten: 'Gluten / Blé',
      dairy: 'Produits laitiers',
      nuts: 'Fruits à coque',
      fish: 'Poissons & fruits de mer',
      eggs: 'Œufs',
      legumes: 'Légumineuses',
    },
    budgetLabels: {
      economic: 'Économique',
      moderate: 'Modéré',
      flexible: 'Flexible',
    },
    interestLabels: {
      balanced_nutrition: 'Nutrition équilibrée',
      heart_health: 'Soutien cardiovasculaire',
      cholesterol_care: 'Attention au cholestérol',
      blood_sugar_stability: 'Régularité des repas & glycémie',
      food_variety: 'Variété alimentaire',
      healthy_habits: 'Maintien d’habitudes saines',
    },
    labLabels: {
      totalCholesterol: {
        name: 'Cholestérol total',
        units: ['mg/dL', 'mmol/L'],
        defaultUnit: 'mg/dL',
        refTextByUnit: {
          'mg/dL': 'Référence adulte usuelle : < 200 mg/dL',
          'mmol/L': 'Référence adulte usuelle : < 5,2 mmol/L',
        },
        education:
          'Reflet global des lipides sanguins. L’huile d’olive, les poissons et les fibres de légumineuses soutiennent son équilibre alimentaire.',
      },
      ldl: {
        name: 'Cholestérol LDL',
        units: ['mg/dL', 'mmol/L'],
        defaultUnit: 'mg/dL',
        refTextByUnit: {
          'mg/dL': 'Référence générale : souvent < 100–130 mg/dL selon le profil',
          'mmol/L': 'Référence générale : souvent < 2,6–3,4 mmol/L selon le profil',
        },
        education:
          'Les objectifs varient selon le médecin. Les fibres solubles (orge, avoine) participent à une alimentation favorable.',
      },
      hdl: {
        name: 'Cholestérol HDL',
        units: ['mg/dL', 'mmol/L'],
        defaultUnit: 'mg/dL',
        refTextByUnit: {
          'mg/dL': 'Référence usuelle : ≥ 40 mg/dL (H) / ≥ 50 mg/dL (F)',
          'mmol/L': 'Référence usuelle : ≥ 1,0 mmol/L (H) / ≥ 1,3 mmol/L (F)',
        },
        education:
          'L’activité physique régulière et les graisses insaturées (huile d’olive, noix, sardines) contribuent à son maintien.',
      },
      triglycerides: {
        name: 'Triglycérides',
        units: ['mg/dL', 'mmol/L'],
        defaultUnit: 'mg/dL',
        refTextByUnit: {
          'mg/dL': 'Référence à jeun : < 150 mg/dL',
          'mmol/L': 'Référence à jeun : < 1,7 mmol/L',
        },
        education:
          'Sensibles à l’équilibre des sucres ajoutés, à l’activité physique et aux apports en oméga-3.',
      },
      fastingGlucose: {
        name: 'Glycémie à jeun',
        units: ['g/L', 'mg/dL', 'mmol/L'],
        defaultUnit: 'g/L',
        refTextByUnit: {
          'g/L': 'Référence à jeun usuelle (Maroc) : 0,70 – 0,99 g/L',
          'mg/dL': 'Référence à jeun usuelle : 70 – 99 mg/dL',
          'mmol/L': 'Référence à jeun usuelle : 3,9 – 5,5 mmol/L',
        },
        education:
          'Mesure le glucose après 8h de jeûne. Des repas réguliers riches en céréales complètes favorisent la stabilité. Information éducative uniquement.',
      },
      hba1c: {
        name: 'Hémoglobine glyquée (HbA1c)',
        units: ['%', 'mmol/mol'],
        defaultUnit: '%',
        refTextByUnit: {
          '%': 'Référence générale : < 5,7 %',
          'mmol/mol': 'Référence générale : < 39 mmol/mol',
        },
        education:
          'Reflète la glycémie moyenne sur ~3 mois. À interpréter exclusivement avec votre médecin.',
      },
    },
    offlineBanner: 'Mode hors ligne — vos données locales, recettes et programmes restent disponibles',
    installApp: 'Installer l’application',
    installIOS: 'Installer sur iOS',
    kcal: 'kcal',
    protein: 'Protéines',
    fat: 'Lipides',
    carbs: 'Glucides',
    fiber: 'Fibres',
    grams: 'g',
    serving: 'portion',
    servings: 'portions',
    minutes: 'min',
  },
};
