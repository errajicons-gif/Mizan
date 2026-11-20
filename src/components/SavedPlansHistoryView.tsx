import React from 'react';
import { CalendarDays, CheckCircle2, Trash2 } from 'lucide-react';
import { UI_COPY } from '../i18n/translations';
import { Language, WeeklyPlan } from '../types/mizan';

interface SavedPlansHistoryViewProps {
  lang: Language;
  savedPlans: WeeklyPlan[];
  activePlanId: string | null;
  onActivatePlan: (plan: WeeklyPlan) => void;
  onDeletePlan: (id: string) => void;
}

export const SavedPlansHistoryView: React.FC<SavedPlansHistoryViewProps> = ({
  lang,
  savedPlans,
  activePlanId,
  onActivatePlan,
  onDeletePlan,
}) => {
  const copy = UI_COPY[lang];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#1C3122]">{copy.nav.history}</h1>
        <p className="text-sm text-[#5A665C]">
          {lang === 'ar'
            ? 'جميع البرامج الأسبوعية المحفوظة متاحة دون اتصال بالإنترنت.'
            : 'Tous vos programmes hebdomadaires enregistrés restent accessibles hors ligne.'}
        </p>
      </div>

      {savedPlans.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {savedPlans.map((plan) => {
            const isActive = plan.id === activePlanId;
            return (
              <div
                key={plan.id}
                className="rounded-2xl bg-white border border-[#E2D9C8] p-5 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-[#4F6D3A]">
                    {copy.planModes[plan.mode].title} ·{' '}
                    <span className="font-num">{plan.createdAt.slice(0, 10)}</span>
                  </div>
                  <h2 className="font-bold text-base text-[#1C3122]">
                    {lang === 'ar' ? plan.titleAr : plan.titleFr}
                  </h2>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#EFE8DA]">
                  <button
                    onClick={() => onActivatePlan(plan)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold min-h-[40px] cursor-pointer ${
                      isActive
                        ? 'bg-[#4F6D3A]/15 text-[#1C3122]'
                        : 'bg-[#1C3122] text-white hover:bg-[#142519]'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {isActive
                        ? lang === 'ar'
                          ? 'البرنامج النشط'
                          : 'Programme actif'
                        : lang === 'ar'
                        ? 'اعتماد وعرض البرنامج'
                        : 'Charger ce programme'}
                    </span>
                  </button>

                  <button
                    onClick={() => onDeletePlan(plan.id)}
                    className="p-2 rounded-xl text-[#5A665C] hover:text-red-700 hover:bg-red-50 min-w-[40px] min-h-[40px] flex items-center justify-center cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl bg-white border border-[#E2D9C8] p-8 text-center space-y-2">
          <CalendarDays className="w-10 h-10 text-[#4F6D3A] mx-auto" />
          <p className="text-sm text-[#5A665C]">
            {lang === 'ar'
              ? 'لا توجد برامج محفوظة بعد. يمكنك حفظ أي برنامج من صفحة "برنامجي الأسبوعي".'
              : 'Aucun programme sauvegardé pour l’instant.'}
          </p>
        </div>
      )}
    </div>
  );
};
