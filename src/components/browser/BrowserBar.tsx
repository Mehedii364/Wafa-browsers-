import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  RotateCw,
  X,
  Lock,
  Shield,
  Layers,
  Menu,
  Vault,
  Search,
  ExternalLink,
  BookOpen,
  Smartphone,
  Monitor,
} from 'lucide-react';
import { BrowserTab, Language, SearchEngine } from '../../types/browser';
import { translations } from '../../i18n/translations';

interface BrowserBarProps {
  tab: BrowserTab;
  tabCount: number;
  language: Language;
  searchEngine: SearchEngine;
  onNavigate: (url: string) => void;
  onReload: () => void;
  onBack: () => void;
  onForward: () => void;
  onOpenTabs: () => void;
  onOpenMenu: () => void;
  onToggleShield: () => void;
  onOpenShieldModal: () => void;
  onOpenSslModal: () => void;
  onQuickSaveToVault: () => void;
  onToggleReaderMode: () => void;
  onToggleDesktopMode: () => void;
}

export const BrowserBar: React.FC<BrowserBarProps> = ({
  tab,
  tabCount,
  language,
  searchEngine,
  onNavigate,
  onReload,
  onBack,
  onForward,
  onOpenTabs,
  onOpenMenu,
  onToggleShield,
  onOpenShieldModal,
  onOpenSslModal,
  onQuickSaveToVault,
  onToggleReaderMode,
  onToggleDesktopMode,
}) => {
  const t = translations[language];
  const [inputVal, setInputVal] = useState(tab.url);
  const [isFocused, setIsFocused] = useState(false);

  // Sync input when tab URL changes unless currently editing
  React.useEffect(() => {
    if (!isFocused) {
      setInputVal(tab.url);
    }
  }, [tab.url, isFocused]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let target = inputVal.trim();
    if (!target) return;

    if (!target.startsWith('http://') && !target.startsWith('https://')) {
      if (target.includes('.') && !target.includes(' ')) {
        target = 'https://' + target;
      } else {
        const query = encodeURIComponent(target);
        switch (searchEngine) {
          case 'google':
            target = `https://www.google.com/search?q=${query}`;
            break;
          case 'bing':
            target = `https://www.bing.com/search?q=${query}`;
            break;
          case 'startpage':
            target = `https://www.startpage.com/sp/search?query=${query}`;
            break;
          case 'duckduckgo':
          default:
            target = `https://duckduckgo.com/?q=${query}`;
            break;
        }
      }
    }
    onNavigate(target);
    (document.activeElement as HTMLElement)?.blur();
  };

  return (
    <header className="flex flex-col bg-[#090d10] border-b border-white/5 shrink-0 z-30 select-none">
      {/* Top Action Row */}
      <div className="flex items-center gap-1.5 px-3 py-2">
        {/* Navigation Controls */}
        <div className="flex items-center gap-0.5">
          <button
            onClick={onBack}
            disabled={!tab.canGoBack}
            title={t.back}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            onClick={onForward}
            disabled={!tab.canGoForward}
            title={t.forward}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onReload}
            title={t.reload}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            {tab.isLoading ? <X className="w-4 h-4 text-amber-400" /> : <RotateCw className="w-4 h-4" />}
          </button>
        </div>

        {/* Omnibox / Address Bar */}
        <form onSubmit={handleSubmit} className="flex-1 flex items-center min-w-0">
          <div
            className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#11181d] border transition-all ${
              isFocused ? 'border-emerald-500/60 ring-2 ring-emerald-500/20 bg-[#141d24]' : 'border-white/10 hover:border-white/20'
            }`}
          >
            {/* SSL Badge */}
            <button
              type="button"
              onClick={onOpenSslModal}
              title={t.connectionSecure}
              className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 shrink-0"
            >
              <Lock className="w-3.5 h-3.5" />
            </button>

            {/* Input field */}
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={t.searchOrEnterUrl}
              className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none truncate font-sans"
            />

            {/* Shield Indicator Badge */}
            <button
              type="button"
              onClick={onOpenShieldModal}
              title={`${t.shieldActive}: ${tab.trackersBlocked + tab.adsBlocked} blocked`}
              className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-md font-mono shrink-0 transition-colors ${
                tab.shieldActive
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}
            >
              <Shield className="w-3 h-3 text-emerald-400" />
              <span className="tabular-nums font-semibold">{tab.trackersBlocked + tab.adsBlocked}</span>
            </button>
          </div>
        </form>

        {/* Right utility buttons */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Reader Mode Toggle */}
          <button
            type="button"
            onClick={onToggleReaderMode}
            title={t.readerMode}
            className={`p-2 rounded-lg transition-colors ${
              tab.readerMode
                ? 'text-amber-300 bg-amber-500/15 border border-amber-500/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <BookOpen className="w-4 h-4" />
          </button>

          {/* Quick Save to Vault */}
          <button
            type="button"
            onClick={onQuickSaveToVault}
            title={t.saveToVault}
            className="p-2 rounded-lg text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition-colors"
          >
            <Vault className="w-4 h-4" />
          </button>

          {/* Tabs Count Indicator */}
          <button
            type="button"
            onClick={onOpenTabs}
            title={t.tabs}
            className="relative p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
          >
            <div className="w-5 h-5 rounded border border-slate-400 flex items-center justify-center font-mono text-[11px] font-bold">
              {tabCount}
            </div>
          </button>

          {/* Master Menu Drawer */}
          <button
            type="button"
            onClick={onOpenMenu}
            title={t.settings}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress Bar when loading */}
      {tab.isLoading && (
        <div className="h-0.5 w-full bg-slate-800 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-emerald-500 to-amber-400 animate-pulse w-3/4"></div>
        </div>
      )}
    </header>
  );
};
