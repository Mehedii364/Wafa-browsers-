import React from 'react';
import {
  Settings,
  Languages,
  Search,
  Lock,
  Moon,
  Trash2,
  ShieldCheck,
  User,
  X,
  Check,
  Smartphone,
} from 'lucide-react';
import { Language, SearchEngine } from '../../types/browser';
import { translations } from '../../i18n/translations';
import { cryptoVault } from '../../security/cryptoVault';
import { storageService } from '../../services/storageService';

interface SettingsModalProps {
  language: Language;
  searchEngine: SearchEngine;
  onLanguageChange: (lang: Language) => void;
  onSearchEngineChange: (engine: SearchEngine) => void;
  onClose: () => void;
  onOpenAndroidExport: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  language,
  searchEngine,
  onLanguageChange,
  onSearchEngineChange,
  onClose,
  onOpenAndroidExport,
}) => {
  const t = translations[language];

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="max-w-xl w-full p-6 rounded-3xl bg-[#0c1317] border border-white/10 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Settings className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-white">{t.settings}</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Language Selection */}
        <div className="space-y-2">
          <label className="text-xs font-mono uppercase text-emerald-400 tracking-wider flex items-center gap-1.5">
            <Languages className="w-3.5 h-3.5" />
            <span>{t.language}</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onLanguageChange('en')}
              className={`p-3 rounded-2xl border text-xs font-semibold flex items-center justify-between transition-colors ${
                language === 'en'
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                  : 'bg-[#11181d] border-white/5 text-slate-400 hover:text-white'
              }`}
            >
              <span>{t.english}</span>
              {language === 'en' && <Check className="w-4 h-4 text-emerald-400" />}
            </button>

            <button
              onClick={() => onLanguageChange('bn')}
              className={`p-3 rounded-2xl border text-xs font-semibold flex items-center justify-between transition-colors ${
                language === 'bn'
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                  : 'bg-[#11181d] border-white/5 text-slate-400 hover:text-white'
              }`}
            >
              <span className="font-bengali">{t.bengali}</span>
              {language === 'bn' && <Check className="w-4 h-4 text-emerald-400" />}
            </button>
          </div>
        </div>

        {/* Search Engine Selection */}
        <div className="space-y-2">
          <label className="text-xs font-mono uppercase text-emerald-400 tracking-wider flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5" />
            <span>Default Search Engine</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'duckduckgo', label: 'DuckDuckGo' },
              { id: 'google', label: 'Google' },
              { id: 'bing', label: 'Bing' },
              { id: 'startpage', label: 'Startpage' },
            ].map((eng) => {
              const active = searchEngine === eng.id;
              return (
                <button
                  key={eng.id}
                  onClick={() => onSearchEngineChange(eng.id as SearchEngine)}
                  className={`p-2.5 rounded-xl border text-xs font-medium text-center transition-colors ${
                    active
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-semibold'
                      : 'bg-[#11181d] border-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  {eng.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Auto Lock Duration */}
        <div className="space-y-2">
          <label className="text-xs font-mono uppercase text-emerald-400 tracking-wider flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" />
            <span>Private Vault Auto-Lock</span>
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[1, 5, 15, 30].map((mins) => {
              const currentMins = cryptoVault.getAutoLockMinutes();
              const active = currentMins === mins;
              return (
                <button
                  key={mins}
                  onClick={() => cryptoVault.setAutoLockMinutes(mins)}
                  className={`p-2 rounded-xl border text-xs font-mono text-center transition-colors ${
                    active
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-bold'
                      : 'bg-[#11181d] border-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  {mins} min
                </button>
              );
            })}
          </div>
        </div>

        {/* Android Native Project Link */}
        <div className="p-4 rounded-2xl bg-[#11181d] border border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Smartphone className="w-5 h-5 text-emerald-400" />
            <div>
              <p className="text-xs font-bold text-white">{t.androidExportTitle}</p>
              <p className="text-[11px] text-slate-400">Kotlin, Jetpack Compose, Room, Keystore</p>
            </div>
          </div>
          <button
            onClick={() => {
              onClose();
              onOpenAndroidExport();
            }}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-black text-xs font-semibold"
          >
            Inspect
          </button>
        </div>

        {/* Developer Attribution Card */}
        <div className="p-4 rounded-2xl bg-[#090e12] border border-white/5 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
            <User className="w-4 h-4" />
            <span>Developer Identity & Compliance</span>
          </div>
          <div className="text-xs text-slate-300 space-y-1 font-mono">
            <p>Product: WAFA Browser (Complete Edition)</p>
            <p>Developer: Md. Mehedi Hasan</p>
            <p>Developer ID: Mehedi364</p>
            <p>Package ID: site.wafazone.browser</p>
            <p className="text-emerald-400/90 pt-1">
              Architecture: AES-256-GCM · PBKDF2-100K · Android Keystore · Zero Cloud Leaks
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
