import React, { useState } from 'react';
import {
  Activity,
  BookOpen,
  CalendarDays,
  Calculator,
  Database,
  Download,
  History,
  Home,
  Menu,
  MessageSquareHeart,
  Settings,
  ShoppingBasket,
  WifiOff,
  X,
} from 'lucide-react';
import { Language, NavTab } from '../types/mizan';
import { UI_COPY } from '../i18n/translations';
import { MizanEmblem } from './MizanLogo';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface NavigationShellProps {
  lang: Language;
  activeTab: NavTab;
  isOnline: boolean;
  onSelectTab: (tab: NavTab) => void;
  onToggleLang: () => void;
  children: React.ReactNode;
}

export const NavigationShell: React.FC<NavigationShellProps> = ({
  lang,
  activeTab,
  isOnline,
  onSelectTab,
  onToggleLang,
  children,
}) => {
  const copy = UI_COPY[lang];
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();

  const primaryTabs: { id: NavTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'home', label: copy.nav.home, icon: Home },
    { id: 'planner', label: copy.nav.planner, icon: CalendarDays },
    { id: 'nutrition', label: copy.nav.nutrition, icon: Calculator },
    { id: 'health', label: copy.nav.health, icon: Activity },
    { id: 'ai', label: copy.nav.ai, icon: MessageSquareHeart },
  ];

  const secondaryTabs: { id: NavTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'recipes', label: copy.nav.recipes, icon: BookOpen },
    { id: 'foods', label: copy.nav.foods, icon: Database },
    { id: 'shopping', label: copy.nav.shopping, icon: ShoppingBasket },
    { id: 'history', label: copy.nav.history, icon: History },
    { id: 'settings', label: copy.nav.settings, icon: Settings },
  ];

  const handleSelect = (tab: NavTab) => {
    onSelectTab(tab);
    setDrawerOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#F7F3EC] text-[#1C281E]">
      {/* Desktop Sidebar */}
      <aside className="no-print hidden lg:flex lg:flex-col lg:w-68 lg:shrink-0 bg-[#1C3122] text-[#F7F3EC] border-e border-[#2B4632] sticky top-0 h-screen">
        <div className="p-5 flex items-center gap-3 border-b border-white/10">
          <MizanEmblem className="w-10 h-10 shrink-0" />
          <div className="min-w-0">
            <div className="font-bold text-base tracking-tight text-white truncate">MIZAN – ميزان</div>
            <div className="text-xs text-[#C69C43] truncate">{copy.slogan}</div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          <div className="space-y-1">
            {primaryTabs.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                    active
                      ? 'bg-[#C69C43] text-[#1C3122] font-bold'
                      : 'text-[#DCE4DD] hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-4 border-t border-white/10 space-y-1">
            {secondaryTabs.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                    active
                      ? 'bg-white/15 text-white font-semibold'
                      : 'text-[#B8C6BA] hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        <div className="p-4 border-t border-white/10 space-y-2.5">
          {!isInstalled && isInstallable && (
            <button
              onClick={install}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#4F6D3A] hover:bg-[#5f8246] text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 shrink-0" />
              <span>{copy.installApp}</span>
            </button>
          )}
          {!isInstalled && !isInstallable && isIOS && (
            <button
              onClick={() => setShowIOSGuide(true)}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-white/20 text-white text-xs font-medium hover:bg-white/10 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 shrink-0" />
              <span>{copy.installIOS}</span>
            </button>
          )}
          <button
            onClick={onToggleLang}
            className="w-full py-2 px-3 rounded-xl border border-white/15 text-xs font-semibold text-[#E5D7B8] hover:bg-white/10 transition-colors cursor-pointer"
          >
            {lang === 'ar' ? 'التبديل إلى الفرنسية (FR)' : 'Passer en Arabe (العربية)'}
          </button>
        </div>
      </aside>

      {/* Main Content Column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Sticky Compact Header (52px) */}
        <header className="no-print lg:hidden sticky top-0 z-30 h-[52px] bg-white/95 backdrop-blur-md border-b border-[#E2D9C8] px-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <MizanEmblem className="w-8 h-8 shrink-0" />
            <span className="font-bold text-base text-[#1C3122] whitespace-nowrap truncate">
              MIZAN – ميزان
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onToggleLang}
              className="px-2.5 py-1.5 rounded-lg border border-[#D8CEBC] text-xs font-bold text-[#1C3122] min-h-[36px] whitespace-nowrap cursor-pointer"
            >
              {lang === 'ar' ? 'FR' : 'AR'}
            </button>
            <button
              onClick={() => setDrawerOpen(true)}
              aria-label={copy.nav.more}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-[#1C3122] hover:bg-[#F7F3EC] cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Offline Connectivity Notice */}
        {!isOnline && (
          <div className="no-print bg-[#C69C43]/20 border-b border-[#C69C43]/40 px-4 py-2 text-xs font-medium text-[#1C3122] flex items-center justify-center gap-2">
            <WifiOff className="w-4 h-4 shrink-0 text-[#8A671F]" />
            <span>{copy.offlineBanner}</span>
          </div>
        )}

        {/* Viewport Content */}
        <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7 pb-24 lg:pb-10">
          {children}
        </main>
      </div>

      {/* Mobile Fixed 5-Tab Bottom Navigation (64px) */}
      <nav
        aria-label="Primary mobile navigation"
        className="no-print lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E2D9C8] pb-safe"
      >
        <div className="grid grid-cols-5 h-16 items-center">
          {primaryTabs.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`flex flex-col items-center justify-center h-full px-1 transition-colors cursor-pointer ${
                  active ? 'text-[#4F6D3A]' : 'text-[#5A665C]'
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? 'stroke-[2.4]' : 'stroke-[1.8]'}`} />
                <span className="text-[10px] font-semibold mt-1 truncate max-w-full">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Mobile Secondary Menu Drawer */}
      {drawerOpen && (
        <div className="no-print fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="relative z-10 w-72 max-w-[85vw] bg-white h-full flex flex-col border-e border-[#E2D9C8] ms-auto">
            <div className="p-4 border-b border-[#EFE8DA] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <MizanEmblem className="w-8 h-8" />
                <span className="font-bold text-[#1C3122]">{copy.nav.more}</span>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-[#5A665C] hover:bg-[#F7F3EC] cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              {secondaryTabs.map((item) => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium min-h-[48px] transition-colors cursor-pointer ${
                      active
                        ? 'bg-[#1C3122] text-white'
                        : 'text-[#1C281E] hover:bg-[#F7F3EC]'
                    }`}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="p-4 border-t border-[#EFE8DA] space-y-2">
              {!isInstalled && isInstallable && (
                <button
                  onClick={() => {
                    install();
                    setDrawerOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#4F6D3A] text-white text-sm font-semibold min-h-[44px] cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>{copy.installApp}</span>
                </button>
              )}
              {!isInstalled && !isInstallable && isIOS && (
                <button
                  onClick={() => {
                    setDrawerOpen(false);
                    setShowIOSGuide(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-[#D8CEBC] text-[#1C3122] text-sm font-semibold min-h-[44px] cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>{copy.installIOS}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* iOS Safari Install Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 border border-[#E2D9C8] space-y-4">
            <h3 className="text-lg font-bold text-[#1C3122]">{copy.installIOS}</h3>
            <p className="text-sm text-[#5A665C] leading-relaxed">
              {lang === 'ar' ? (
                <>
                  1. اضغط على زر <strong>المشاركة (Share)</strong> في شريط Safari.
                  <br />
                  2. مرر للأسفل واختر <strong>إضافة إلى الشاشة الرئيسية</strong>.
                </>
              ) : (
                <>
                  1. Appuyez sur le bouton <strong>Partager</strong> dans Safari.
                  <br />
                  2. Faites défiler et choisissez <strong>Sur l’écran d’accueil</strong>.
                </>
              )}
            </p>
            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2.5 rounded-xl bg-[#1C3122] text-white text-sm font-semibold min-h-[44px] cursor-pointer"
            >
              {lang === 'ar' ? 'حسناً' : 'Fermer'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
