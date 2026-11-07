import React, { useState } from 'react';
import {
  Search,
  Shield,
  Lock,
  Key,
  QrCode,
  FileText,
  BookOpen,
  Smartphone,
  Globe,
  Plus,
  ExternalLink,
  Cpu,
} from 'lucide-react';
import { Bookmark, Language, SearchEngine, ShieldStats } from '../../types/browser';
import { translations } from '../../i18n/translations';

interface BrowserHomeProps {
  language: Language;
  searchEngine: SearchEngine;
  bookmarks: Bookmark[];
  shieldStats: ShieldStats;
  onNavigate: (url: string) => void;
  onOpenVault: () => void;
  onOpenPasswords: () => void;
  onOpenQr: () => void;
  onOpenPdf: () => void;
  onOpenOffline: () => void;
  onOpenPrivacy: () => void;
  onOpenAndroid: () => void;
}

export const BrowserHome: React.FC<BrowserHomeProps> = ({
  language,
  searchEngine,
  bookmarks,
  shieldStats,
  onNavigate,
  onOpenVault,
  onOpenPasswords,
  onOpenQr,
  onOpenPdf,
  onOpenOffline,
  onOpenPrivacy,
  onOpenAndroid,
}) => {
  const t = translations[language];
  const [searchInput, setSearchInput] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchInput.trim();
    if (!query) return;

    if (!query.startsWith('http://') && !query.startsWith('https://')) {
      if (query.includes('.') && !query.includes(' ')) {
        onNavigate('https://' + query);
      } else {
        const encoded = encodeURIComponent(query);
        switch (searchEngine) {
          case 'google':
            onNavigate(`https://www.google.com/search?q=${encoded}`);
            break;
          case 'bing':
            onNavigate(`https://www.bing.com/search?q=${encoded}`);
            break;
          case 'startpage':
            onNavigate(`https://www.startpage.com/sp/search?query=${encoded}`);
            break;
          case 'duckduckgo':
          default:
            onNavigate(`https://duckduckgo.com/?q=${encoded}`);
            break;
        }
      }
    } else {
      onNavigate(query);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-8 md:py-12 flex flex-col items-center justify-start bg-gradient-to-b from-[#0a0f12] via-[#070b0e] to-[#040608] text-slate-100">
      <div className="max-w-3xl w-full flex flex-col items-center space-y-8">
        {/* Brand Lockup */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
            <Shield className="w-3.5 h-3.5" />
            <span>WAFA Browser — {t.appEdition}</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white font-sans">
            WAFA <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-amber-300">Browser</span>
          </h1>
          <p className="text-xs md:text-sm text-slate-400 max-w-md mx-auto">
            {t.tagline}
          </p>
        </div>

        {/* Central Search Bar */}
        <form onSubmit={handleSearch} className="w-full max-w-xl">
          <div className="relative group">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-emerald-400 transition-colors" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={t.searchOrEnterUrl}
              autoFocus
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-[#11181d] border border-white/10 hover:border-white/20 focus:border-emerald-500/60 focus:ring-4 focus:ring-emerald-500/10 text-sm text-white placeholder:text-slate-500 shadow-2xl focus:outline-none transition-all"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white/5 text-slate-400">
                {searchEngine}
              </span>
            </div>
          </div>
        </form>

        {/* Speed Dials / Bookmarks */}
        <div className="w-full">
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">
              Speed Dial & Top Sites
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {bookmarks.slice(0, 5).map((bm) => (
              <button
                key={bm.id}
                onClick={() => onNavigate(bm.url)}
                className="p-3 rounded-2xl bg-[#0c1317] border border-white/5 hover:border-emerald-500/30 hover:bg-[#10181e] flex flex-col items-center justify-center text-center transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-2 group-hover:scale-105 transition-transform">
                  <Globe className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-slate-200 truncate w-full">{bm.title}</span>
                <span className="text-[10px] text-slate-500 font-mono truncate w-full mt-0.5">
                  {bm.url.replace(/^https?:\/\/(www\.)?/, '')}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Quick Suite Modules */}
        <div className="w-full">
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">
              Integrated Security & Productivity Suite
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            <button
              onClick={onOpenVault}
              className="p-3.5 rounded-2xl bg-[#0c1317] border border-emerald-500/30 hover:border-emerald-500/60 hover:bg-emerald-500/10 flex flex-col items-center text-center transition-all"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 mb-2">
                <Lock className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-white">{t.vault}</span>
              <span className="text-[10px] text-emerald-400/80 font-mono mt-0.5">AES-256</span>
            </button>

            <button
              onClick={onOpenPasswords}
              className="p-3.5 rounded-2xl bg-[#0c1317] border border-white/5 hover:border-white/20 hover:bg-[#10181e] flex flex-col items-center text-center transition-all"
            >
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-400 mb-2">
                <Key className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-white">{t.passwords}</span>
              <span className="text-[10px] text-slate-500 font-mono mt-0.5">Zero-Knowledge</span>
            </button>

            <button
              onClick={onOpenQr}
              className="p-3.5 rounded-2xl bg-[#0c1317] border border-white/5 hover:border-white/20 hover:bg-[#10181e] flex flex-col items-center text-center transition-all"
            >
              <div className="w-9 h-9 rounded-xl bg-sky-500/15 flex items-center justify-center text-sky-400 mb-2">
                <QrCode className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-white">{t.qrTools}</span>
              <span className="text-[10px] text-slate-500 font-mono mt-0.5">CameraX</span>
            </button>

            <button
              onClick={onOpenPdf}
              className="p-3.5 rounded-2xl bg-[#0c1317] border border-white/5 hover:border-white/20 hover:bg-[#10181e] flex flex-col items-center text-center transition-all"
            >
              <div className="w-9 h-9 rounded-xl bg-purple-500/15 flex items-center justify-center text-purple-400 mb-2">
                <FileText className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-white">{t.pdfTools}</span>
              <span className="text-[10px] text-slate-500 font-mono mt-0.5">Renderer</span>
            </button>

            <button
              onClick={onOpenOffline}
              className="p-3.5 rounded-2xl bg-[#0c1317] border border-white/5 hover:border-white/20 hover:bg-[#10181e] flex flex-col items-center text-center transition-all"
            >
              <div className="w-9 h-9 rounded-xl bg-teal-500/15 flex items-center justify-center text-teal-400 mb-2">
                <BookOpen className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-white">{t.offline}</span>
              <span className="text-[10px] text-slate-500 font-mono mt-0.5">TTS Reader</span>
            </button>

            <button
              onClick={onOpenAndroid}
              className="p-3.5 rounded-2xl bg-[#0c1317] border border-emerald-500/20 hover:border-emerald-500/40 hover:bg-[#10181e] flex flex-col items-center text-center transition-all"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-400 mb-2">
                <Smartphone className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-white">Android Code</span>
              <span className="text-[10px] text-emerald-400 font-mono mt-0.5">Kotlin Export</span>
            </button>
          </div>
        </div>

        {/* Live Privacy Shield Status Footer */}
        <div className="w-full p-4 rounded-2xl bg-[#0c1317] border border-white/5 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <div>
              <span className="text-white font-semibold">WAFA Shield Engine Online</span>
              <p className="text-[11px] text-slate-400">
                {shieldStats.totalTrackersBlocked} trackers blocked · {shieldStats.totalAdsBlocked} ads eliminated
              </p>
            </div>
          </div>

          <button
            onClick={onOpenPrivacy}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-medium transition-colors"
          >
            Inspect Privacy →
          </button>
        </div>
      </div>
    </div>
  );
};
