import React, { useEffect, useRef, useState } from 'react';
import { MessageSquareHeart, Send, ShieldAlert, Trash2, WifiOff } from 'lucide-react';
import { MOROCCAN_FOODS } from '../data/moroccanFoods';
import { UI_COPY } from '../i18n/translations';
import { ChatMessage, Language, MealLogEntry, UserProfile } from '../types/mizan';
import { sumNutrition } from '../utils/nutrition';

interface MizanAiViewProps {
  lang: Language;
  isOnline: boolean;
  profile: UserProfile;
  todayLogs: MealLogEntry[];
  messages: ChatMessage[];
  onAddMessage: (msg: ChatMessage) => void;
  onClearChat: () => void;
}

const STARTER_PROMPTS_AR = [
  'ماذا أتناول اليوم؟',
  'هل خبز الشعير خيار جيد؟',
  'ما الفرق بين زيت الزيتون والزبدة؟',
  'كيف أحضر طاجيناً مغربياً متوازناً؟',
  'ما الأطعمة الغنية بالألياف؟',
  'لدي بيض وطماطم وسردين، ماذا أطبخ؟',
  'هل وجبتي متوازنة؟',
  'كيف أقرأ القيم الغذائية؟',
  'كيف أفهم نتائج تحاليلي؟',
];

const STARTER_PROMPTS_FR = [
  'Que manger aujourd’hui ?',
  'Le pain d’orge est-il un bon choix ?',
  'Différence entre huile d’olive et beurre ?',
  'Comment préparer un tajine marocain équilibré ?',
  'Quels aliments sont riches en fibres ?',
  'Comment lire les valeurs nutritionnelles ?',
  'Comment comprendre mes résultats d’analyses ?',
];

export const MizanAiView: React.FC<MizanAiViewProps> = ({
  lang,
  isOnline,
  profile,
  todayLogs,
  messages,
  onAddMessage,
  onClearChat,
}) => {
  const copy = UI_COPY[lang];
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const buildMatchedFoodsContext = (query: string): string => {
    const q = query.toLowerCase();
    const matched = MOROCCAN_FOODS.filter(
      (f) =>
        q.includes(f.nameAr.split(' ')[0]) ||
        f.nameAr.split(' ').some((w) => w.length > 2 && q.includes(w)) ||
        f.nameFr.toLowerCase().split(' ').some((w) => w.length > 3 && q.includes(w))
    ).slice(0, 6);

    if (matched.length === 0) return 'None matched directly';
    return matched
      .map(
        (f) =>
          `${f.nameAr} (${f.nameFr}, ${f.state}): ${f.kcal} kcal, P ${f.protein}g, F ${f.fat}g, C ${f.carbs}g, Fiber ${f.fiber}g per 100g [${f.dataSource}]`
      )
      .join(' | ');
  };

  const sendMessage = async (textToSend?: string) => {
    const text = (textToSend ?? input).trim();
    if (!text || loading || !isOnline) return;

    setErrorMsg(null);
    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      role: 'user',
      text,
      timestamp: new Date().toISOString(),
    };
    onAddMessage(userMsg);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const totals = sumNutrition(todayLogs.map((l) => l.nutrition));
      const profileSummary = profile.aiContextConsent
        ? `Age: ${profile.age}, Diet: ${profile.dietaryPreference}, Allergies: ${profile.allergies.join(', ') || 'none'}, Interests: ${profile.healthInterests.join(', ')}`
        : 'User chose not to share profile details.';

      const todayTotals =
        todayLogs.length > 0
          ? `${totals.kcal} kcal, Protein ${totals.protein}g, Fat ${totals.fat}g, Carbs ${totals.carbs}g, Fiber ${totals.fiber}g (${todayLogs
              .map((l) => l.nameAr)
              .join(', ')})`
          : 'No meals logged yet today.';

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          language: lang,
          history: messages.slice(-8).map((m) => ({ role: m.role, text: m.text })),
          context: {
            profileSummary,
            todayTotals,
            matchedFoods: buildMatchedFoodsContext(text),
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to connect to MIZAN AI');
      }

      const aiMsg: ChatMessage = {
        id: `a_${Date.now()}`,
        role: 'assistant',
        text: data.reply,
        timestamp: new Date().toISOString(),
      };
      onAddMessage(aiMsg);
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : lang === 'ar'
          ? 'تعذر الاتصال بالمساعد الذكي حالياً.'
          : 'Impossible de contacter MIZAN AI pour le moment.'
      );
    } finally {
      setLoading(false);
    }
  };

  const starters = lang === 'ar' ? STARTER_PROMPTS_AR : STARTER_PROMPTS_FR;

  return (
    <div className="flex flex-col h-[calc(100vh-11rem)] lg:h-[calc(100vh-5rem)] bg-white rounded-3xl border border-[#E2D9C8] overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-[#EFE8DA] flex items-center justify-between gap-3 bg-[#FBF9F5]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#1C3122] text-[#C69C43] flex items-center justify-center shrink-0">
            <MessageSquareHeart className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-base text-[#1C3122]">
              {lang === 'ar' ? 'MIZAN AI – مستشارك الغذائي الذكي' : 'MIZAN AI – Conseiller Nutrition'}
            </h1>
            <p className="text-xs text-[#5A665C]">
              {lang === 'ar'
                ? 'تثقيف غذائي علمي مستند إلى قاعدة البيانات المغربية'
                : 'Éducation nutritionnelle basée sur la base alimentaire marocaine'}
            </p>
          </div>
        </div>

        {messages.length > 0 && (
          <button
            onClick={onClearChat}
            className="p-2 rounded-xl text-[#5A665C] hover:text-red-700 hover:bg-red-50 min-w-[40px] min-h-[40px] flex items-center justify-center cursor-pointer"
            title={lang === 'ar' ? 'مسح المحادثة' : 'Effacer'}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Medical Boundary Notice */}
      <div className="px-4 py-2.5 bg-[#EFE8DA]/70 border-b border-[#E2D9C8] flex items-center gap-2 text-[11px] text-[#1C281E]">
        <ShieldAlert className="w-4 h-4 text-[#8A671F] shrink-0" />
        <span>
          {lang === 'ar'
            ? 'يقدم MIZAN AI تثقيفاً غذائياً عاماً فقط، ولا يشخص الأمراض أو يغني عن استشارة الطبيب أو أخصائي التغذية.'
            : 'MIZAN AI fournit une information éducative uniquement et ne remplace pas un avis médical.'}
        </span>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
        {messages.length === 0 && (
          <div className="space-y-4 py-4">
            <div className="rounded-2xl bg-[#F7F3EC] p-4 text-sm text-[#1C281E] leading-relaxed">
              {lang === 'ar'
                ? 'مرحباً بك في MIZAN AI! اسألني عن الأطباق المغربية، بدائل الطبخ الصحي، الألياف، أو قراءة القيم الغذائية والتحاليل.'
                : 'Bienvenue sur MIZAN AI ! Posez-moi vos questions sur la cuisine marocaine, les fibres, ou la lecture des valeurs nutritionnelles.'}
            </div>

            <div>
              <div className="text-xs font-semibold text-[#5A665C] mb-2">
                {lang === 'ar' ? 'أسئلة مقترحة:' : 'Questions fréquentes :'}
              </div>
              <div className="flex flex-wrap gap-2">
                {starters.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    disabled={!isOnline || loading}
                    className="px-3 py-2 rounded-xl border border-[#D8CEBC] bg-[#FBF9F5] hover:bg-[#EFE8DA] text-xs font-medium text-[#1C3122] transition-colors text-start disabled:opacity-50 cursor-pointer"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                m.role === 'user'
                  ? 'bg-[#1C3122] text-white'
                  : 'bg-[#F7F3EC] text-[#1C281E] border border-[#E2D9C8]'
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl px-4 py-3 bg-[#F7F3EC] border border-[#E2D9C8] text-xs text-[#5A665C]">
              {lang === 'ar' ? 'جاري إعداد الإجابة...' : 'Réflexion en cours...'}
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-800">
            {errorMsg}
          </div>
        )}

        <div ref={endRef} />
      </div>

      {/* Input Footer */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
        className="p-3 sm:p-4 border-t border-[#EFE8DA] bg-white"
      >
        {!isOnline ? (
          <div className="flex items-center justify-center gap-2 py-2.5 text-xs font-semibold text-[#8A671F] bg-[#F7F3EC] rounded-xl">
            <WifiOff className="w-4 h-4" />
            <span>
              {lang === 'ar'
                ? 'المحادثة الذكية تتطلب اتصالاً بالإنترنت. يمكنك تصفح المحادثات السابقة.'
                : 'Le chat nécessite une connexion Internet.'}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                lang === 'ar'
                  ? 'اكتب سؤالك الغذائي بالعربية أو الفرنسية...'
                  : 'Posez votre question en français ou en arabe...'
              }
              className="flex-1 rounded-xl border border-[#D8CEBC] bg-[#FBF9F5] px-4 py-3 text-sm focus:outline-none focus:border-[#4F6D3A]"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="min-w-[48px] min-h-[48px] px-4 rounded-xl bg-[#4F6D3A] hover:bg-[#40592f] disabled:opacity-40 text-white flex items-center justify-center cursor-pointer"
              aria-label={copy.nav.ai}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        )}
      </form>
    </div>
  );
};
