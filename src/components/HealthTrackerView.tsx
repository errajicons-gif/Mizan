import React, { useMemo, useState } from 'react';
import { Activity, Info, Plus, Scale, Trash2 } from 'lucide-react';
import { UI_COPY } from '../i18n/translations';
import {
  LabEntry,
  LabMetricType,
  Language,
  UserProfile,
  WeightEntry,
} from '../types/mizan';
import { calculateAdultBMI } from '../utils/nutrition';

interface HealthTrackerViewProps {
  lang: Language;
  profile: UserProfile;
  weights: WeightEntry[];
  labs: LabEntry[];
  initialSubTab?: string;
  onAddWeight: (entry: Omit<WeightEntry, 'id'>) => void;
  onDeleteWeight: (id: string) => void;
  onAddLab: (entry: Omit<LabEntry, 'id'>) => void;
  onDeleteLab: (id: string) => void;
}

const SimpleLineChart: React.FC<{
  points: { label: string; value: number }[];
  unit: string;
}> = ({ points, unit }) => {
  if (points.length === 0) return null;
  if (points.length === 1) {
    return (
      <div className="rounded-xl bg-[#F7F3EC] p-4 text-center text-sm text-[#5A665C]">
        {points[0].label}: <strong className="font-num text-[#1C3122]">{points[0].value} {unit}</strong>
      </div>
    );
  }

  const w = 520;
  const h = 160;
  const padX = 36;
  const padY = 24;
  const vals = points.map((p) => p.value);
  const minV = Math.min(...vals);
  const maxV = Math.max(...vals);
  const range = Math.max(0.5, maxV - minV);

  const coords = points.map((p, i) => {
    const x = padX + (i / (points.length - 1)) * (w - padX * 2);
    const y = h - padY - ((p.value - minV) / range) * (h - padY * 2);
    return { ...p, x, y };
  });

  const polyline = coords.map((c) => `${c.x},${c.y}`).join(' ');

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-40 min-w-[320px]">
        <line x1={padX} y1={padY} x2={w - padX} y2={padY} stroke="#EFE8DA" strokeDasharray="3 3" />
        <line x1={padX} y1={h - padY} x2={w - padX} y2={h - padY} stroke="#EFE8DA" />
        <polyline
          fill="none"
          stroke="#4F6D3A"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={polyline}
        />
        {coords.map((c, idx) => (
          <g key={idx}>
            <circle cx={c.x} cy={c.y} r="5" fill="#1C3122" stroke="#F7F3EC" strokeWidth="2" />
            <text
              x={c.x}
              y={c.y - 10}
              textAnchor="middle"
              fontSize="10"
              fill="#1C3122"
              className="font-num font-bold"
            >
              {c.value}
            </text>
            <text x={c.x} y={h - 6} textAnchor="middle" fontSize="9" fill="#5A665C">
              {c.label.slice(5)}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};

export const HealthTrackerView: React.FC<HealthTrackerViewProps> = ({
  lang,
  profile,
  weights,
  labs,
  initialSubTab,
  onAddWeight,
  onDeleteWeight,
  onAddLab,
  onDeleteLab,
}) => {
  const copy = UI_COPY[lang];
  const [subTab, setSubTab] = useState<'weight' | 'labs'>(
    initialSubTab === 'labs' ? 'labs' : 'weight'
  );

  // Weight state
  const today = new Date().toISOString().slice(0, 10);
  const [wVal, setWVal] = useState<number>(profile.weightKg || 68);
  const [wDate, setWDate] = useState(today);
  const [wNote, setWNote] = useState('');

  // Labs state
  const [metric, setMetric] = useState<LabMetricType>('fastingGlucose');
  const [labVal, setLabVal] = useState<string>('');
  const [labUnit, setLabUnit] = useState<string>(copy.labLabels.fastingGlucose.defaultUnit);
  const [labDate, setLabDate] = useState(today);
  const [labNote, setLabNote] = useState('');

  const sortedWeights = useMemo(
    () => [...weights].sort((a, b) => a.date.localeCompare(b.date)),
    [weights]
  );

  const latestWeight = sortedWeights[sortedWeights.length - 1];
  const adultBmi = calculateAdultBMI(
    latestWeight?.weightKg || profile.weightKg,
    profile.heightCm,
    profile.age
  );

  const weightDiffs = useMemo(() => {
    if (sortedWeights.length < 2) return null;
    const latest = sortedWeights[sortedWeights.length - 1];
    const nowMs = new Date(latest.date).getTime();
    const weekAgo = [...sortedWeights]
      .reverse()
      .find((w) => nowMs - new Date(w.date).getTime() >= 6 * 86400000);
    const monthAgo = [...sortedWeights]
      .reverse()
      .find((w) => nowMs - new Date(w.date).getTime() >= 25 * 86400000);

    return {
      weekDelta: weekAgo ? Math.round((latest.weightKg - weekAgo.weightKg) * 10) / 10 : null,
      monthDelta: monthAgo ? Math.round((latest.weightKg - monthAgo.weightKg) * 10) / 10 : null,
    };
  }, [sortedWeights]);

  const metricInfo = copy.labLabels[metric];
  const metricLogs = useMemo(
    () =>
      labs
        .filter((l) => l.metric === metric)
        .sort((a, b) => a.date.localeCompare(b.date)),
    [labs, metric]
  );

  const handleMetricChange = (m: LabMetricType) => {
    setMetric(m);
    setLabUnit(copy.labLabels[m].defaultUnit);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-[#1C3122]">{copy.nav.health}</h1>
        <div className="flex items-center gap-1 p-1 bg-white border border-[#E2D9C8] rounded-xl">
          <button
            onClick={() => setSubTab('weight')}
            className={`px-4 py-2 rounded-lg text-xs font-bold min-h-[38px] cursor-pointer ${
              subTab === 'weight' ? 'bg-[#1C3122] text-white' : 'text-[#5A665C]'
            }`}
          >
            {lang === 'ar' ? 'متابعة تطوري (الوزن)' : 'Mon suivi (Poids)'}
          </button>
          <button
            onClick={() => setSubTab('labs')}
            className={`px-4 py-2 rounded-lg text-xs font-bold min-h-[38px] cursor-pointer ${
              subTab === 'labs' ? 'bg-[#1C3122] text-white' : 'text-[#5A665C]'
            }`}
          >
            {lang === 'ar' ? 'التحاليل والمؤشرات' : 'Analyses médicales'}
          </button>
        </div>
      </div>

      {/* WEIGHT TRACKER */}
      {subTab === 'weight' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 rounded-2xl bg-white border border-[#E2D9C8] p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-[#4F6D3A]" />
              <h2 className="font-bold text-base text-[#1C3122]">
                {lang === 'ar' ? 'تسجيل قياس جديد' : 'Nouvelle mesure'}
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#5A665C] mb-1">
                  {lang === 'ar' ? 'الوزن (كغ)' : 'Poids (kg)'}
                </label>
                <input
                  type="number"
                  step="0.1"
                  min={25}
                  max={250}
                  value={wVal}
                  onChange={(e) => setWVal(Number(e.target.value) || 0)}
                  className="w-full rounded-xl border border-[#D8CEBC] bg-[#FBF9F5] px-3 py-2 text-sm font-num"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#5A665C] mb-1">
                  {lang === 'ar' ? 'التاريخ' : 'Date'}
                </label>
                <input
                  type="date"
                  value={wDate}
                  onChange={(e) => setWDate(e.target.value)}
                  className="w-full rounded-xl border border-[#D8CEBC] bg-[#FBF9F5] px-3 py-2 text-sm font-num"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5A665C] mb-1">
                {lang === 'ar' ? 'ملاحظات (اختياري)' : 'Notes (optionnel)'}
              </label>
              <input
                type="text"
                value={wNote}
                onChange={(e) => setWNote(e.target.value)}
                placeholder={lang === 'ar' ? 'صباحاً قبل الفطور...' : 'Le matin à jeun...'}
                className="w-full rounded-xl border border-[#D8CEBC] bg-[#FBF9F5] px-3 py-2 text-sm"
              />
            </div>

            <button
              onClick={() => {
                if (wVal > 20) {
                  onAddWeight({ date: wDate, weightKg: wVal, note: wNote.trim() });
                  setWNote('');
                }
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#4F6D3A] hover:bg-[#40592f] text-white text-sm font-semibold min-h-[44px] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{lang === 'ar' ? 'حفظ القياس' : 'Enregistrer'}</span>
            </button>

            {adultBmi ? (
              <div className="rounded-xl bg-[#F7F3EC] p-4 space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold text-[#5A665C]">
                  <span>{lang === 'ar' ? 'مؤشر كتلة الجسم (BMI) للبالغين' : 'IMC (Adulte)'}</span>
                  <span className="font-num text-sm font-bold text-[#1C3122]">{adultBmi.value}</span>
                </div>
                <p className="text-xs text-[#5A665C]">
                  {lang === 'ar' ? adultBmi.categoryAr : adultBmi.categoryFr}
                </p>
              </div>
            ) : (
              <div className="rounded-xl bg-[#F7F3EC] p-3 text-xs text-[#5A665C]">
                {lang === 'ar'
                  ? 'مؤشر كتلة الجسم للبالغين لا يُعرض لمن هم دون 18 عاماً لأن التقييم لدى اليافعين يتطلب منحنيات نمو خاصة.'
                  : 'L’IMC adulte n’est pas affiché avant 18 ans.'}
              </div>
            )}
          </div>

          <div className="lg:col-span-7 rounded-2xl bg-white border border-[#E2D9C8] p-5 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-bold text-base text-[#1C3122]">
                {lang === 'ar' ? 'تطور القياسات' : 'Évolution des mesures'}
              </h2>
              {weightDiffs && (
                <div className="flex items-center gap-3 text-xs font-num text-[#5A665C]">
                  {weightDiffs.weekDelta !== null && (
                    <span>
                      {lang === 'ar' ? 'أسبوعياً:' : '7j:'}{' '}
                      <strong>
                        {weightDiffs.weekDelta > 0 ? `+${weightDiffs.weekDelta}` : weightDiffs.weekDelta} kg
                      </strong>
                    </span>
                  )}
                  {weightDiffs.monthDelta !== null && (
                    <span>
                      {lang === 'ar' ? 'شهرياً:' : '30j:'}{' '}
                      <strong>
                        {weightDiffs.monthDelta > 0 ? `+${weightDiffs.monthDelta}` : weightDiffs.monthDelta} kg
                      </strong>
                    </span>
                  )}
                </div>
              )}
            </div>

            {sortedWeights.length > 0 ? (
              <>
                <SimpleLineChart
                  points={sortedWeights.slice(-12).map((w) => ({ label: w.date, value: w.weightKg }))}
                  unit="kg"
                />
                <div className="divide-y divide-[#EFE8DA] max-h-60 overflow-y-auto">
                  {[...sortedWeights].reverse().map((w) => (
                    <div key={w.id} className="py-2.5 flex items-center justify-between gap-3 text-sm">
                      <div>
                        <span className="font-bold font-num text-[#1C3122]">{w.weightKg} kg</span>
                        <span className="text-xs text-[#5A665C] font-num ms-2">· {w.date}</span>
                        {w.note && <div className="text-xs text-[#5A665C]">{w.note}</div>}
                      </div>
                      <button
                        onClick={() => onDeleteWeight(w.id)}
                        className="p-2 text-[#5A665C] hover:text-red-700 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="rounded-xl border border-dashed border-[#D8CEBC] p-6 text-center text-sm text-[#5A665C]">
                {lang === 'ar'
                  ? 'سجّل قياساتك بانتظام لمتابعة تطورك بهدوء وبدون ضغط.'
                  : 'Enregistrez vos mesures à votre rythme pour suivre votre évolution.'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* LABS TRACKER */}
      {subTab === 'labs' && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-[#EFE8DA] border border-[#D8CEBC] p-4 flex items-start gap-3 text-xs text-[#1C3122] leading-relaxed">
            <Info className="w-4 h-4 text-[#4F6D3A] shrink-0 mt-0.5" />
            <span>
              {lang === 'ar'
                ? 'ملاحظة تثقيفية: حفظ التحاليل هنا مخصص للمتابعة الشخصية والوعي الغذائي فقط، ولا يُعد تشخيصاً طبياً. لا تغير أدويتك أو جرعاتك أبداً دون استشارة طبيبك.'
                : 'Information éducative : cet espace sert au suivi personnel uniquement et ne remplace pas un diagnostic médical. Ne modifiez jamais votre traitement sans avis médical.'}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 rounded-2xl bg-white border border-[#E2D9C8] p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#C69C43]" />
                <h2 className="font-bold text-base text-[#1C3122]">
                  {lang === 'ar' ? 'تسجيل نتيجة تحليل' : 'Enregistrer une analyse'}
                </h2>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5A665C] mb-1">
                  {lang === 'ar' ? 'المؤشر الصحي' : 'Indicateur'}
                </label>
                <select
                  value={metric}
                  onChange={(e) => handleMetricChange(e.target.value as LabMetricType)}
                  className="w-full rounded-xl border border-[#D8CEBC] bg-[#FBF9F5] px-3 py-2.5 text-sm font-semibold"
                >
                  {(Object.keys(copy.labLabels) as LabMetricType[]).map((m) => (
                    <option key={m} value={m}>
                      {copy.labLabels[m].name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#5A665C] mb-1">
                    {lang === 'ar' ? 'النتيجة' : 'Valeur'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={labVal}
                    onChange={(e) => setLabVal(e.target.value)}
                    placeholder="0.90"
                    className="w-full rounded-xl border border-[#D8CEBC] bg-[#FBF9F5] px-3 py-2 text-sm font-num"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#5A665C] mb-1">
                    {lang === 'ar' ? 'الوحدة' : 'Unité'}
                  </label>
                  <select
                    value={labUnit}
                    onChange={(e) => setLabUnit(e.target.value)}
                    className="w-full rounded-xl border border-[#D8CEBC] bg-[#FBF9F5] px-3 py-2 text-sm font-num"
                  >
                    {metricInfo.units.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5A665C] mb-1">
                  {lang === 'ar' ? 'تاريخ التحليل' : 'Date'}
                </label>
                <input
                  type="date"
                  value={labDate}
                  onChange={(e) => setLabDate(e.target.value)}
                  className="w-full rounded-xl border border-[#D8CEBC] bg-[#FBF9F5] px-3 py-2 text-sm font-num"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5A665C] mb-1">
                  {lang === 'ar' ? 'ملاحظات' : 'Notes'}
                </label>
                <input
                  type="text"
                  value={labNote}
                  onChange={(e) => setLabNote(e.target.value)}
                  className="w-full rounded-xl border border-[#D8CEBC] bg-[#FBF9F5] px-3 py-2 text-sm"
                />
              </div>

              <button
                onClick={() => {
                  const num = Number(labVal);
                  if (!Number.isNaN(num) && num > 0) {
                    onAddLab({
                      metric,
                      value: num,
                      unit: labUnit,
                      date: labDate,
                      note: labNote.trim(),
                    });
                    setLabVal('');
                    setLabNote('');
                  }
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#1C3122] text-white text-sm font-semibold min-h-[44px] cursor-pointer"
              >
                <Plus className="w-4 h-4 text-[#C69C43]" />
                <span>{lang === 'ar' ? 'حفظ النتيجة مشفرة محلياً' : 'Enregistrer (chiffré localement)'}</span>
              </button>
            </div>

            <div className="lg:col-span-7 rounded-2xl bg-white border border-[#E2D9C8] p-5 space-y-4">
              <div>
                <h2 className="font-bold text-base text-[#1C3122]">{metricInfo.name}</h2>
                <p className="text-xs text-[#4F6D3A] font-semibold mt-0.5">
                  {metricInfo.refTextByUnit[labUnit] || Object.values(metricInfo.refTextByUnit)[0]}
                </p>
                <p className="text-xs text-[#5A665C] mt-1.5 leading-relaxed">
                  {metricInfo.education}
                </p>
              </div>

              {metricLogs.length > 0 ? (
                <>
                  <SimpleLineChart
                    points={metricLogs.map((l) => ({ label: l.date, value: l.value }))}
                    unit={metricLogs[metricLogs.length - 1].unit}
                  />
                  <div className="divide-y divide-[#EFE8DA] max-h-56 overflow-y-auto">
                    {[...metricLogs].reverse().map((l) => (
                      <div key={l.id} className="py-2.5 flex items-center justify-between text-sm">
                        <div>
                          <span className="font-bold font-num text-[#1C3122]">
                            {l.value} {l.unit}
                          </span>
                          <span className="text-xs text-[#5A665C] font-num ms-2">· {l.date}</span>
                          {l.note && <div className="text-xs text-[#5A665C]">{l.note}</div>}
                        </div>
                        <button
                          onClick={() => onDeleteLab(l.id)}
                          className="p-2 text-[#5A665C] hover:text-red-700 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="rounded-xl border border-dashed border-[#D8CEBC] p-6 text-center text-sm text-[#5A665C]">
                  {lang === 'ar'
                    ? `لا توجد نتائج مسجلة بعد لمؤشر ${metricInfo.name}.`
                    : `Aucune mesure enregistrée pour ${metricInfo.name}.`}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
