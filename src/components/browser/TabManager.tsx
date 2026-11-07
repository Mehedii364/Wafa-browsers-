import React from 'react';
import {
  X,
  Plus,
  Pin,
  PinOff,
  Copy,
  Moon,
  Zap,
  Globe,
  Trash2,
  FolderPlus,
  Check,
} from 'lucide-react';
import { BrowserTab, Language, TabGroup } from '../../types/browser';
import { translations } from '../../i18n/translations';

interface TabManagerProps {
  tabs: BrowserTab[];
  activeTabId: string;
  tabGroups: TabGroup[];
  language: Language;
  lowRamMode: boolean;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string) => void;
  onCloseAll: () => void;
  onNewTab: () => void;
  onTogglePin: (id: string) => void;
  onDuplicateTab: (id: string) => void;
  onToggleSuspend: (id: string) => void;
  onCloseManager: () => void;
}

export const TabManager: React.FC<TabManagerProps> = ({
  tabs,
  activeTabId,
  tabGroups,
  language,
  lowRamMode,
  onSelectTab,
  onCloseTab,
  onCloseAll,
  onNewTab,
  onTogglePin,
  onDuplicateTab,
  onToggleSuspend,
  onCloseManager,
}) => {
  const t = translations[language];

  const suspendedCount = tabs.filter((t) => t.isSuspended).length;
  const estimatedRamSavedMb = suspendedCount * 45;

  return (
    <div className="fixed inset-0 z-50 bg-[#070b0e]/95 backdrop-blur-xl flex flex-col p-4 md:p-6 overflow-hidden animate-in fade-in duration-200">
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>{t.tabs}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
              {tabs.length} open
            </span>
          </h2>
          {suspendedCount > 0 && (
            <span className="text-xs text-amber-400 font-mono bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              {suspendedCount} suspended (~{estimatedRamSavedMb}MB RAM saved)
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onNewTab}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-black font-semibold text-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>{t.newTab}</span>
          </button>

          {tabs.length > 1 && (
            <button
              onClick={onCloseAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t.closeAllTabs}</span>
            </button>
          )}

          <button
            onClick={onCloseManager}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tabs Visual Grid */}
      <div className="flex-1 overflow-y-auto py-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          let hostname = 'unknown';
          try {
            hostname = new URL(tab.url).hostname;
          } catch {
            hostname = tab.url;
          }

          return (
            <div
              key={tab.id}
              onClick={() => {
                onSelectTab(tab.id);
                onCloseManager();
              }}
              className={`group relative flex flex-col rounded-2xl p-4 cursor-pointer transition-all border ${
                isActive
                  ? 'bg-[#121c22] border-emerald-500/70 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/30'
                  : 'bg-[#0d1418] border-white/5 hover:border-white/20 hover:bg-[#10181e]'
              } ${tab.isSuspended ? 'opacity-70' : 'opacity-100'}`}
            >
              {/* Card Header */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2 min-w-0">
                  <Globe className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-xs font-semibold text-slate-200 truncate">
                    {tab.title || hostname}
                  </span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onTogglePin(tab.id);
                    }}
                    title={tab.isPinned ? t.unpinTab : t.pinTab}
                    className={`p-1 rounded hover:bg-white/10 ${tab.isPinned ? 'text-amber-400' : 'text-slate-500'}`}
                  >
                    {tab.isPinned ? <Pin className="w-3.5 h-3.5 fill-current" /> : <Pin className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCloseTab(tab.id);
                    }}
                    title={t.closeTab}
                    className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Card Preview Window */}
              <div className="flex-1 min-h-[110px] rounded-xl bg-[#090e11] border border-white/5 p-3 flex flex-col justify-between mb-3 text-xs text-slate-400">
                <div className="space-y-1">
                  <p className="font-mono text-[11px] text-emerald-400/90 truncate">{tab.url}</p>
                  <p className="text-[11px] text-slate-500 line-clamp-2">
                    {tab.isSuspended
                      ? 'Tab suspended to preserve memory. Click to restore session.'
                      : 'Active tab memory instance.'}
                  </p>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-2 border-t border-white/5">
                  <span>Trackers: {tab.trackersBlocked}</span>
                  {tab.isSuspended ? (
                    <span className="text-amber-400 flex items-center gap-1">
                      <Moon className="w-3 h-3" /> Suspended
                    </span>
                  ) : (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <Zap className="w-3 h-3" /> Live
                    </span>
                  )}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleSuspend(tab.id);
                  }}
                  title={t.suspendTab}
                  className={`text-[11px] flex items-center gap-1 px-2 py-1 rounded transition-colors ${
                    tab.isSuspended
                      ? 'text-amber-400 bg-amber-500/10 border border-amber-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <Moon className="w-3 h-3" />
                  <span>{tab.isSuspended ? 'Awaken' : 'Suspend'}</span>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDuplicateTab(tab.id);
                  }}
                  title={t.duplicateTab}
                  className="text-[11px] text-slate-400 hover:text-slate-200 p-1 rounded hover:bg-white/5"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
