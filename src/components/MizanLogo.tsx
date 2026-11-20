import React, { useState } from 'react';
import { Utensils } from 'lucide-react';
import { Language } from '../types/mizan';
import { UI_COPY } from '../i18n/translations';

export const MizanEmblem: React.FC<{ className?: string }> = ({ className = 'w-9 h-9' }) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <rect width="64" height="64" rx="16" fill="#1C3122" />
    <path d="M32 13V49" stroke="#C69C43" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M22 49H42" stroke="#C69C43" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M17 22H47" stroke="#C69C43" strokeWidth="2.2" strokeLinecap="round" />
    <circle cx="32" cy="14" r="2.2" fill="#C69C43" />
    <path d="M17 22L12 34C12 37.5 14.8 40 18.5 40C22.2 40 25 37.5 25 34L20 22" stroke="#C69C43" strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M47 22L42 34C42 37.5 44.8 40 48.5 40C52.2 40 55 37.5 55 34L50 22" stroke="#C69C43" strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M32 42C32 34 37 28 42 25" stroke="#7A9D58" strokeWidth="2" strokeLinecap="round" />
    <ellipse cx="37" cy="30" rx="2.8" ry="1.5" transform="rotate(-35 37 30)" fill="#7A9D58" />
    <ellipse cx="40.5" cy="27" rx="2.5" ry="1.4" transform="rotate(-25 40.5 27)" fill="#7A9D58" />
    <ellipse cx="34.5" cy="34" rx="2.5" ry="1.4" transform="rotate(-45 34.5 34)" fill="#7A9D58" />
  </svg>
);

export const SplashScreen: React.FC<{
  lang: Language;
  onEnter: () => void;
}> = ({ lang, onEnter }) => {
  const copy = UI_COPY[lang];
  return (
    <div className="min-h-screen bg-[#1C3122] text-[#F7F3EC] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="max-w-md w-full text-center space-y-8 relative z-10">
        <div className="flex justify-center">
          <div className="p-2 rounded-3xl border border-[#C69C43]/30 bg-[#15251A]">
            <img
              src="/src/assets/images/mizan_app_icon_1795133718426.jpg"
              alt="MIZAN"
              referrerPolicy="no-referrer"
              className="w-24 h-24 rounded-2xl object-cover"
            />
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-4xl font-bold tracking-tight text-white">MIZAN – ميزان</h1>
          <p className="text-lg text-[#E5D7B8] font-medium text-balance">{copy.slogan}</p>
          <p className="text-sm text-[#B7C4B9] leading-relaxed">
            {lang === 'ar'
              ? 'منصة ذكية لتنظيم التغذية اليومية، واكتشاف الوجبات الصحية، وإنشاء برامج غذائية أسبوعية مستوحاة من المطبخ المغربي.'
              : 'Plateforme intelligente pour organiser votre alimentation quotidienne et créer des programmes hebdomadaires inspirés de la cuisine marocaine.'}
          </p>
        </div>

        <button
          onClick={onEnter}
          className="w-full py-3.5 px-6 rounded-xl bg-[#C69C43] hover:bg-[#b58b35] text-[#1C3122] font-bold text-base transition-colors active:scale-[0.98] min-h-[48px] cursor-pointer"
        >
          {lang === 'ar' ? 'ابدأ رحلتك الغذائية' : 'Commencer mon parcours'}
        </button>
      </div>
    </div>
  );
};

export const FoodImage: React.FC<{
  src: string;
  alt: string;
  className?: string;
}> = ({ src, alt, className = 'w-full h-44 object-cover' }) => {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-[#EFE8DA] text-[#4F6D3A] ${className}`}
        role="img"
        aria-label={alt}
      >
        <Utensils className="w-8 h-8 opacity-60 mb-1.5" />
        <span className="text-xs font-medium px-3 text-center line-clamp-2">{alt}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
};
