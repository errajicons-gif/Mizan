import React, { useState } from 'react';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  ActivityLevel,
  AllergyType,
  BudgetTier,
  DietaryPreference,
  HealthInterest,
  Language,
  Sex,
  UserProfile,
} from '../types/mizan';
import { UI_COPY } from '../i18n/translations';
import { MizanEmblem } from './MizanLogo';

interface OnboardingWizardProps {
  lang: Language;
  initialProfile: UserProfile;
  onComplete: (profile: UserProfile) => void;
  onChangeLang: (lang: Language) => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  lang,
  initialProfile,
  onComplete,
  onChangeLang,
}) => {
  const copy = UI_COPY[lang];
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<UserProfile>({
    ...initialProfile,
    country: initialProfile.country || (lang === 'ar' ? 'المغرب' : 'Maroc'),
  });
  const [favInput, setFavInput] = useState(initialProfile.favoriteFoods.join('، '));
  const [dislikeInput, setDislikeInput] = useState(initialProfile.dislikedFoods.join('، '));

  const toggleAllergy = (a: AllergyType) => {
    setForm((prev) => ({
      ...prev,
      allergies: prev.allergies.includes(a)
        ? prev.allergies.filter((x) => x !== a)
        : [...prev.allergies, a],
    }));
  };

  const toggleInterest = (i: HealthInterest) => {
    setForm((prev) => ({
      ...prev,
      healthInterests: prev.healthInterests.includes(i)
        ? prev.healthInterests.filter((x) => x !== i)
        : [...prev.healthInterests, i],
    }));
  };

  const finish = () => {
    const parseList = (str: string) =>
      str
        .split(/[،,;]+/)
        .map((s) => s.trim())
        .filter(Boolean);

    onComplete({
      ...form,
      completedOnboarding: true,
      favoriteFoods: parseList(favInput),
      dislikedFoods: parseList(dislikeInput),
    });
  };

  const totalSteps = 3;

  return (
    <div className="min-h-screen bg-[#F7F3EC] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-2xl bg-white rounded-3xl border border-[#E2D9C8] p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between gap-4 border-b border-[#EFE8DA] pb-4">
          <div className="flex items-center gap-3">
            <MizanEmblem className="w-10 h-10 shrink-0" />
            <div>
              <h2 className="text-lg font-bold text-[#1C3122]">
                {lang === 'ar' ? 'إعداد ملفك الغذائي' : 'Configuration de votre profil'}
              </h2>
              <p className="text-xs text-[#5A665C]">
                {lang === 'ar'
                  ? `الخطوة ${step + 1} من ${totalSteps}`
                  : `Étape ${step + 1} sur ${totalSteps}`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onChangeLang(lang === 'ar' ? 'fr' : 'ar')}
            className="px-3 py-2 text-xs font-semibold rounded-lg border border-[#E2D9C8] text-[#1C3122] hover:bg-[#F7F3EC] transition-colors min-h-[40px] whitespace-nowrap cursor-pointer"
          >
            {lang === 'ar' ? 'Français' : 'العربية'}
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="grid grid-cols-3 gap-2">
          {[0, 1, 2].map((idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-colors ${
                idx <= step ? 'bg-[#4F6D3A]' : 'bg-[#EFE8DA]'
              }`}
            />
          ))}
        </div>

        {step === 0 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#1C281E] mb-1.5">
                {lang === 'ar' ? 'الاسم أو اللقب' : 'Prénom ou pseudo'}
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder={lang === 'ar' ? 'مثال: أمين / سلمى' : 'Ex : Amine / Salma'}
                className="w-full rounded-xl border border-[#D8CEBC] bg-[#FBF9F5] px-4 py-2.5 text-sm focus:outline-none focus:border-[#4F6D3A]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#1C281E] mb-1.5">
                  {lang === 'ar' ? 'العمر (سنة)' : 'Âge (ans)'}
                </label>
                <input
                  type="number"
                  min={10}
                  max={100}
                  value={form.age}
                  onChange={(e) => setForm({ ...form, age: Number(e.target.value) || 25 })}
                  className="w-full rounded-xl border border-[#D8CEBC] bg-[#FBF9F5] px-4 py-2.5 text-sm font-num"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1C281E] mb-1.5">
                  {lang === 'ar' ? 'الطول (سم)' : 'Taille (cm)'}
                </label>
                <input
                  type="number"
                  min={110}
                  max={230}
                  value={form.heightCm}
                  onChange={(e) => setForm({ ...form, heightCm: Number(e.target.value) || 168 })}
                  className="w-full rounded-xl border border-[#D8CEBC] bg-[#FBF9F5] px-4 py-2.5 text-sm font-num"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1C281E] mb-1.5">
                  {lang === 'ar' ? 'الوزن (كغ)' : 'Poids (kg)'}
                </label>
                <input
                  type="number"
                  min={30}
                  max={220}
                  step="0.5"
                  value={form.weightKg}
                  onChange={(e) => setForm({ ...form, weightKg: Number(e.target.value) || 68 })}
                  className="w-full rounded-xl border border-[#D8CEBC] bg-[#FBF9F5] px-4 py-2.5 text-sm font-num"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#1C281E] mb-1.5">
                  {lang === 'ar' ? 'الجنس (للحسابات الغذائية عند الحاجة)' : 'Sexe (pour les calculs nutritionnels)'}
                </label>
                <select
                  value={form.sex}
                  onChange={(e) => setForm({ ...form, sex: e.target.value as Sex })}
                  className="w-full rounded-xl border border-[#D8CEBC] bg-[#FBF9F5] px-4 py-2.5 text-sm"
                >
                  {(Object.keys(copy.sexLabels) as Sex[]).map((s) => (
                    <option key={s} value={s}>
                      {copy.sexLabels[s]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1C281E] mb-1.5">
                  {lang === 'ar' ? 'البلد' : 'Pays'}
                </label>
                <input
                  type="text"
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                  className="w-full rounded-xl border border-[#D8CEBC] bg-[#FBF9F5] px-4 py-2.5 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1C281E] mb-1.5">
                {lang === 'ar' ? 'مستوى النشاط البدني' : 'Niveau d’activité physique'}
              </label>
              <select
                value={form.activityLevel}
                onChange={(e) =>
                  setForm({ ...form, activityLevel: e.target.value as ActivityLevel })
                }
                className="w-full rounded-xl border border-[#D8CEBC] bg-[#FBF9F5] px-4 py-2.5 text-sm"
              >
                {(Object.keys(copy.activityLabels) as ActivityLevel[]).map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {copy.activityLabels[lvl]}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#1C281E] mb-1.5">
                  {lang === 'ar' ? 'التفضيل الغذائي' : 'Préférence alimentaire'}
                </label>
                <select
                  value={form.dietaryPreference}
                  onChange={(e) =>
                    setForm({ ...form, dietaryPreference: e.target.value as DietaryPreference })
                  }
                  className="w-full rounded-xl border border-[#D8CEBC] bg-[#FBF9F5] px-4 py-2.5 text-sm"
                >
                  {(Object.keys(copy.dietLabels) as DietaryPreference[]).map((d) => (
                    <option key={d} value={d}>
                      {copy.dietLabels[d]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1C281E] mb-1.5">
                  {lang === 'ar' ? 'الميزانية الغذائية' : 'Budget alimentaire'}
                </label>
                <select
                  value={form.budgetTier}
                  onChange={(e) => setForm({ ...form, budgetTier: e.target.value as BudgetTier })}
                  className="w-full rounded-xl border border-[#D8CEBC] bg-[#FBF9F5] px-4 py-2.5 text-sm"
                >
                  {(Object.keys(copy.budgetLabels) as BudgetTier[]).map((b) => (
                    <option key={b} value={b}>
                      {copy.budgetLabels[b]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1C281E] mb-1.5">
                {lang === 'ar' ? 'عدد الوجبات المعتاد يومياً' : 'Nombre habituel de repas par jour'}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {([3, 4, 5] as const).map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setForm({ ...form, mealsPerDay: n })}
                    className={`py-2.5 px-3 rounded-xl text-sm font-semibold border transition-colors min-h-[44px] cursor-pointer ${
                      form.mealsPerDay === n
                        ? 'bg-[#1C3122] text-white border-[#1C3122]'
                        : 'bg-[#FBF9F5] text-[#1C281E] border-[#D8CEBC] hover:bg-[#EFE8DA]'
                    }`}
                  >
                    {n} {lang === 'ar' ? 'وجبات' : 'repas'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1C281E] mb-2">
                {lang === 'ar' ? 'الحساسية الغذائية (إن وُجدت)' : 'Allergies alimentaires (si applicable)'}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(Object.keys(copy.allergyLabels) as AllergyType[]).map((a) => {
                  const active = form.allergies.includes(a);
                  return (
                    <button
                      key={a}
                      type="button"
                      onClick={() => toggleAllergy(a)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium border transition-colors min-h-[44px] cursor-pointer ${
                        active
                          ? 'bg-[#4F6D3A]/15 border-[#4F6D3A] text-[#1C3122]'
                          : 'bg-[#FBF9F5] border-[#D8CEBC] text-[#5A665C]'
                      }`}
                    >
                      <span>{copy.allergyLabels[a]}</span>
                      {active && <Check className="w-4 h-4 text-[#4F6D3A] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#1C281E] mb-1.5">
                  {lang === 'ar' ? 'أطعمة مفضلة' : 'Aliments préférés'}
                </label>
                <input
                  type="text"
                  value={favInput}
                  onChange={(e) => setFavInput(e.target.value)}
                  placeholder={lang === 'ar' ? 'مثال: السردين، العدس، التمر' : 'Ex : sardines, lentilles, dattes'}
                  className="w-full rounded-xl border border-[#D8CEBC] bg-[#FBF9F5] px-4 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1C281E] mb-1.5">
                  {lang === 'ar' ? 'أطعمة غير مرغوبة' : 'Aliments à éviter'}
                </label>
                <input
                  type="text"
                  value={dislikeInput}
                  onChange={(e) => setDislikeInput(e.target.value)}
                  placeholder={lang === 'ar' ? 'اختياري...' : 'Optionnel...'}
                  className="w-full rounded-xl border border-[#D8CEBC] bg-[#FBF9F5] px-4 py-2.5 text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-[#1C281E] mb-1">
                {lang === 'ar' ? 'اهتماماتك الغذائية والصحية' : 'Vos priorités nutritionnelles'}
              </h3>
              <p className="text-xs text-[#5A665C] mb-3">
                {lang === 'ar'
                  ? 'نحترم احتياجاتك حسب عمرك وحالتك دون فرض أهداف قاسية أو حميات تقييدية.'
                  : 'Nous adaptons les conseils à votre âge et vos besoins, sans régimes restrictifs.'}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {(Object.keys(copy.interestLabels) as HealthInterest[]).map((item) => {
                  const active = form.healthInterests.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleInterest(item)}
                      className={`flex items-center justify-between gap-2 px-4 py-3 rounded-xl text-sm font-medium border text-start transition-colors min-h-[48px] cursor-pointer ${
                        active
                          ? 'bg-[#1C3122] text-white border-[#1C3122]'
                          : 'bg-[#FBF9F5] text-[#1C281E] border-[#D8CEBC] hover:bg-[#EFE8DA]'
                      }`}
                    >
                      <span>{copy.interestLabels[item]}</span>
                      {active && <Check className="w-4 h-4 text-[#C69C43] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl bg-[#F7F3EC] border border-[#E2D9C8] p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.aiContextConsent}
                  onChange={(e) => setForm({ ...form, aiContextConsent: e.target.checked })}
                  className="mt-1 w-4 h-4 accent-[#4F6D3A]"
                />
                <span className="text-xs text-[#1C281E] leading-relaxed">
                  {lang === 'ar'
                    ? 'أوافق على استخدام تفضيلاتي الغذائية (العمر، الحساسية، الاهتمامات) محلياً لتحسين ردود المساعد الذكي MIZAN AI عند الاتصال بالإنترنت. تُحفظ بياناتي الصحية على جهازي فقط.'
                    : 'J’autorise l’utilisation locale de mes préférences (âge, allergies, priorités) pour personnaliser MIZAN AI en ligne. Mes données restent stockées localement sur cet appareil.'}
                </span>
              </label>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between gap-3 pt-4 border-t border-[#EFE8DA]">
          {step > 0 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#D8CEBC] text-sm font-semibold text-[#1C281E] hover:bg-[#F7F3EC] min-h-[44px] cursor-pointer"
            >
              {lang === 'ar' ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              <span>{lang === 'ar' ? 'السابق' : 'Précédent'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={finish}
              className="text-xs font-medium text-[#5A665C] hover:text-[#1C281E] underline px-2 py-2 min-h-[44px] cursor-pointer"
            >
              {lang === 'ar' ? 'تخطي والإعداد لاحقاً' : 'Configurer plus tard'}
            </button>
          )}

          {step < totalSteps - 1 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-[#4F6D3A] hover:bg-[#40592f] text-white text-sm font-semibold min-h-[44px] cursor-pointer"
            >
              <span>{lang === 'ar' ? 'التالي' : 'Suivant'}</span>
              {lang === 'ar' ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          ) : (
            <button
              type="button"
              onClick={finish}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#1C3122] hover:bg-[#142519] text-white text-sm font-semibold min-h-[44px] cursor-pointer"
            >
              <Check className="w-4 h-4 text-[#C69C43]" />
              <span>{lang === 'ar' ? 'حفظ والدخول للتطبيق' : 'Enregistrer et accéder'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
