import React, { useState } from 'react';
import {
  Bell,
  Download,
  Lock,
  Smartphone,
  Trash2,
  Upload,
  UserCog,
} from 'lucide-react';
import { UI_COPY } from '../i18n/translations';
import {
  Language,
  ReminderSetting,
  UserProfile,
} from '../types/mizan';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface SettingsViewProps {
  lang: Language;
  profile: UserProfile;
  reminders: ReminderSetting[];
  onChangeLang: (lang: Language) => void;
  onEditOnboarding: () => void;
  onUpdateProfile: (p: UserProfile) => void;
  onUpdateReminders: (r: ReminderSetting[]) => void;
  onExportBackup: () => void;
  onImportBackup: (jsonStr: string) => boolean;
  onClearAllData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  lang,
  profile,
  reminders,
  onChangeLang,
  onEditOnboarding,
  onUpdateProfile,
  onUpdateReminders,
  onExportBackup,
  onImportBackup,
  onClearAllData,
}) => {
  const copy = UI_COPY[lang];
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [confirmClear, setConfirmClear] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const notify = (msg: string) => {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(null), 3200);
  };

  const reminderLabels: Record<ReminderSetting['type'], { ar: string; fr: string }> = {
    meals: { ar: 'تذكير بتسجيل الوجبات اليومية', fr: 'Rappel d’enregistrement des repas' },
    weekly_plan: { ar: 'تذكير بمراجعة البرنامج الأسبوعي', fr: 'Revue du programme hebdomadaire' },
    weight: { ar: 'تذكير لطيف بتسجيل الوزن', fr: 'Rappel de suivi du poids' },
    water: { ar: 'تذكير مرن بشرب الماء', fr: 'Rappel flexible d’hydratation' },
    labs: { ar: 'تذكير بمواعيد التحاليل الدورية', fr: 'Rappel des bilans périodiques' },
  };

  const toggleReminder = async (id: string) => {
    const target = reminders.find((r) => r.id === id);
    if (target && !target.enabled && 'Notification' in window && Notification.permission === 'default') {
      try {
        await Notification.requestPermission();
      } catch {
        // ignore
      }
    }
    onUpdateReminders(
      reminders.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const ok = onImportBackup(String(reader.result || ''));
      notify(
        ok
          ? lang === 'ar'
            ? 'تم استرجاع النسخة الاحتياطية بنجاح'
            : 'Sauvegarde restaurée avec succès'
          : lang === 'ar'
          ? 'ملف النسخة الاحتياطية غير صالح'
          : 'Fichier de sauvegarde invalide'
      );
    };
    reader.readAsText(file);
  };

  const downloadCapacitorConfig = () => {
    const config = {
      appId: 'ma.mizan.nutrition',
      appName: 'MIZAN',
      webDir: 'dist',
      bundledWebRuntime: false,
      android: {
        backgroundColor: '#F7F3EC',
      },
    };
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'capacitor.config.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-xl sm:text-2xl font-bold text-[#1C3122]">{copy.nav.settings}</h1>

      {statusMsg && (
        <div className="rounded-xl bg-[#1C3122] text-white px-4 py-3 text-sm font-medium">
          {statusMsg}
        </div>
      )}

      {/* Profile & Language */}
      <section className="rounded-2xl bg-white border border-[#E2D9C8] p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <UserCog className="w-5 h-5 text-[#4F6D3A]" />
            <h2 className="font-bold text-base text-[#1C3122]">
              {lang === 'ar' ? 'الملف الشخصي واللغة' : 'Profil & Langue'}
            </h2>
          </div>
          <button
            onClick={onEditOnboarding}
            className="px-4 py-2 rounded-xl bg-[#1C3122] text-white text-xs font-semibold min-h-[40px] cursor-pointer"
          >
            {lang === 'ar' ? 'تعديل بيانات الملف الشخصي' : 'Modifier mon profil'}
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-[#F7F3EC] rounded-xl p-4">
          <div>
            <span className="text-[#5A665C] block">{lang === 'ar' ? 'الاسم' : 'Nom'}</span>
            <strong className="text-[#1C3122]">{profile.name || '—'}</strong>
          </div>
          <div>
            <span className="text-[#5A665C] block">{lang === 'ar' ? 'العمر / الوزن' : 'Âge / Poids'}</span>
            <strong className="text-[#1C3122] font-num">
              {profile.age} · {profile.weightKg}kg
            </strong>
          </div>
          <div>
            <span className="text-[#5A665C] block">{lang === 'ar' ? 'الميزانية' : 'Budget'}</span>
            <strong className="text-[#1C3122]">{copy.budgetLabels[profile.budgetTier]}</strong>
          </div>
          <div>
            <span className="text-[#5A665C] block">{lang === 'ar' ? 'البلد' : 'Pays'}</span>
            <strong className="text-[#1C3122]">{profile.country}</strong>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-sm font-semibold text-[#1C281E]">
            {lang === 'ar' ? 'لغة التطبيق واتجاه الكتابة' : 'Langue et direction'}
          </span>
          <div className="flex items-center gap-1 p-1 bg-[#F7F3EC] rounded-xl">
            <button
              onClick={() => onChangeLang('ar')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                lang === 'ar' ? 'bg-white text-[#1C3122]' : 'text-[#5A665C]'
              }`}
            >
              العربية (RTL)
            </button>
            <button
              onClick={() => onChangeLang('fr')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                lang === 'fr' ? 'bg-white text-[#1C3122]' : 'text-[#5A665C]'
              }`}
            >
              Français (LTR)
            </button>
          </div>
        </div>
      </section>

      {/* Reminders */}
      <section className="rounded-2xl bg-white border border-[#E2D9C8] p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2.5">
          <Bell className="w-5 h-5 text-[#C69C43]" />
          <h2 className="font-bold text-base text-[#1C3122]">
            {lang === 'ar' ? 'التنبيهات الاختيارية' : 'Rappels optionnels'}
          </h2>
        </div>

        <div className="divide-y divide-[#EFE8DA]">
          {reminders.map((r) => (
            <div key={r.id} className="py-3 flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-[#1C281E]">
                {lang === 'ar' ? reminderLabels[r.type].ar : reminderLabels[r.type].fr}
              </span>
              <div className="flex items-center gap-3 shrink-0">
                <input
                  type="time"
                  value={r.time}
                  onChange={(e) =>
                    onUpdateReminders(
                      reminders.map((x) => (x.id === r.id ? { ...x, time: e.target.value } : x))
                    )
                  }
                  className="rounded-lg border border-[#D8CEBC] bg-[#FBF9F5] px-2 py-1 text-xs font-num"
                />
                <button
                  type="button"
                  onClick={() => toggleReminder(r.id)}
                  className={`w-11 h-6 rounded-full transition-colors p-0.5 cursor-pointer ${
                    r.enabled ? 'bg-[#4F6D3A]' : 'bg-[#D8CEBC]'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      r.enabled
                        ? lang === 'ar'
                          ? '-translate-x-5'
                          : 'translate-x-5'
                        : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Privacy, Encryption & Backup */}
      <section className="rounded-2xl bg-white border border-[#E2D9C8] p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2.5">
          <Lock className="w-5 h-5 text-[#4F6D3A]" />
          <h2 className="font-bold text-base text-[#1C3122]">
            {lang === 'ar' ? 'الخصوصية، التشفير والنسخ الاحتياطي' : 'Confidentialité & Sauvegarde'}
          </h2>
        </div>

        <label className="flex items-start gap-3 p-3.5 rounded-xl bg-[#F7F3EC] cursor-pointer">
          <input
            type="checkbox"
            checked={profile.aiContextConsent}
            onChange={(e) =>
              onUpdateProfile({ ...profile, aiContextConsent: e.target.checked })
            }
            className="mt-1 w-4 h-4 accent-[#4F6D3A]"
          />
          <span className="text-xs text-[#1C281E] leading-relaxed">
            {lang === 'ar'
              ? 'السماح بإرسال تفضيلاتي الغذائية (بدون اسم أو تحاليل) إلى MIZAN AI عند الدردشة. يتم تشفير التحاليل والوزن محلياً على الجهاز عبر Web Crypto AES-GCM.'
              : 'Autoriser l’envoi des préférences alimentaires (sans données médicales) à MIZAN AI. Vos analyses restent chiffrées localement.'}
          </span>
        </label>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onExportBackup}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#EFE8DA] hover:bg-[#e4dac5] text-[#1C3122] text-xs font-bold min-h-[44px] cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{lang === 'ar' ? 'تصدير نسخة احتياطية (JSON)' : 'Exporter sauvegarde (JSON)'}</span>
          </button>

          <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#D8CEBC] hover:bg-[#F7F3EC] text-[#1C3122] text-xs font-bold min-h-[44px] cursor-pointer">
            <Upload className="w-4 h-4" />
            <span>{lang === 'ar' ? 'استرجاع نسخة احتياطية' : 'Restaurer sauvegarde'}</span>
            <input type="file" accept="application/json" onChange={handleFileImport} className="hidden" />
          </label>

          {!confirmClear ? (
            <button
              onClick={() => setConfirmClear(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 text-red-700 hover:bg-red-50 text-xs font-bold min-h-[44px] cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>{lang === 'ar' ? 'حذف جميع بياناتي' : 'Effacer mes données'}</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onClearAllData();
                  setConfirmClear(false);
                }}
                className="px-4 py-2.5 rounded-xl bg-red-700 text-white text-xs font-bold min-h-[44px] cursor-pointer"
              >
                {lang === 'ar' ? 'تأكيد الحذف النهائي' : 'Confirmer la suppression'}
              </button>
              <button
                onClick={() => setConfirmClear(false)}
                className="px-3 py-2.5 rounded-xl border border-[#D8CEBC] text-xs font-semibold min-h-[44px] cursor-pointer"
              >
                {lang === 'ar' ? 'إلغاء' : 'Annuler'}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Android & APK Packaging Guide */}
      <section className="rounded-2xl bg-white border border-[#E2D9C8] p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2.5">
          <Smartphone className="w-5 h-5 text-[#1C3122]" />
          <h2 className="font-bold text-base text-[#1C3122]">
            {lang === 'ar'
              ? 'التثبيت على Android وإنتاج ملف APK'
              : 'Installation Android & Génération APK'}
          </h2>
        </div>

        <p className="text-xs text-[#5A665C] leading-relaxed">
          {lang === 'ar'
            ? 'التطبيق مبني كمنصة ويب تقدمية (PWA) متوافقة مع العمل دون إنترنت، ويمكن تثبيته فوراً على هاتفك Android من المتصفح، أو تغليفه عبر Capacitor لإنتاج ملف APK قابل للتثبيت محلياً.'
            : 'L’application est une PWA hors ligne installable directement sur Android, et peut être empaquetée avec Capacitor pour générer un fichier APK.'}
        </p>

        <div className="flex flex-wrap items-center gap-3">
          {!isInstalled && isInstallable && (
            <button
              onClick={install}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#4F6D3A] text-white text-xs font-bold min-h-[44px] cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{copy.installApp}</span>
            </button>
          )}
          <button
            onClick={downloadCapacitorConfig}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#D8CEBC] hover:bg-[#F7F3EC] text-[#1C3122] text-xs font-bold min-h-[44px] cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>
              {lang === 'ar' ? 'تنزيل إعدادات Capacitor Android' : 'Télécharger capacitor.config.json'}
            </span>
          </button>
        </div>

        <div className="rounded-xl bg-[#1C3122] text-[#E5D7B8] p-4 text-xs font-mono space-y-1 overflow-x-auto" dir="ltr">
          <div>npm run build</div>
          <div>npm install @capacitor/core @capacitor/cli @capacitor/android</div>
          <div>npx cap add android && npx cap sync android</div>
          <div>cd android && ./gradlew assembleRelease</div>
        </div>
      </section>
    </div>
  );
};
