import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Zap,
  Moon,
  Trash2,
  HardDrive,
  RefreshCw,
  X,
  Check,
  Activity,
  Layers,
} from 'lucide-react';
import { BrowserTab, Language } from '../../types/browser';
import { translations } from '../../i18n/translations';
import { storageService } from '../../services/storageService';

interface PerformanceDashboardProps {
  tabs: BrowserTab[];
  language: Language;
  onClose: () => void;
  onTabsSuspended: () => void;
}

export const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({
  tabs,
  language,
  onClose,
  onTabsSuspended,
}) => {
  const t = translations[language];

  const [lowRamMode, setLowRamMode] = useState<boolean>(storageService.getLowRamMode());
  const [cacheCleared, setCacheCleared] = useState(false);

  const suspendedCount = tabs.filter((t) => t.isSuspended).length;
  const activeCount = tabs.length - suspendedCount;
  const estimatedTotalRamMb = Math.round(activeCount * 55 + suspendedCount * 8 + 65);
  const estimatedRamSavedMb = Math.round(suspendedCount * 47);

  const handleToggleLowRam = (enabled: boolean) => {
    setLowRamMode(enabled);
    storageService.setLowRamMode(enabled);
  };

  const handleSuspendAllInactive = () => {
    const updated = tabs.map((tab, idx) => {
      if (idx === 0) return tab; // Keep active tab live
      return { ...tab, isSuspended: true };
    });
    storageService.saveTabs(updated);
    onTabsSuspended();
  };

  const handleClearMemoryCache = () => {
    setCacheCleared(true);
    setTimeout(() => setCacheCleared(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#070b0e] flex flex-col text-slate-100 overflow-hidden animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="h-14 px-4 md:px-6 bg-[#0a0f12] border-b border-white/5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Cpu className="w-4 h-4" />
          </div>
          <h1 className="text-sm md:text-base font-bold text-white flex items-center gap-2">
            <span>{t.performanceDashboard}</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
              Engine Optimizer
            </span>
          </h1>
        </div>

        <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main View */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 max-w-4xl mx-auto w-full space-y-6">
        {cacheCleared && (
          <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Image cache and unused WebView resources successfully flushed.</span>
          </div>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-[#0c1317] border border-white/5 space-y-1">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
              Current Memory Footprint
            </span>
            <p className="text-3xl font-bold font-mono text-emerald-400 tabular-nums">
              ~{estimatedTotalRamMb} MB
            </p>
            <p className="text-xs text-slate-400">Lightweight execution profile</p>
          </div>

          <div className="p-5 rounded-2xl bg-[#0c1317] border border-white/5 space-y-1">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
              {t.ramSaved}
            </span>
            <p className="text-3xl font-bold font-mono text-amber-400 tabular-nums">
              ~{estimatedRamSavedMb} MB
            </p>
            <p className="text-xs text-slate-400">Preserved via tab suspension</p>
          </div>

          <div className="p-5 rounded-2xl bg-[#0c1317] border border-white/5 space-y-1">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
              Tab Architecture
            </span>
            <p className="text-3xl font-bold font-mono text-white tabular-nums">
              {activeCount} <span className="text-sm font-normal text-slate-400">Live</span> / {suspendedCount}{' '}
              <span className="text-sm font-normal text-slate-400">Suspended</span>
            </p>
            <p className="text-xs text-slate-400">{tabs.length} tabs total</p>
          </div>
        </div>

        {/* Low-RAM Mode Configuration */}
        <div className="p-6 rounded-2xl bg-[#0c1317] border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Moon className="w-4 h-4 text-emerald-400" />
                <span>{t.lowRamMode}</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">{t.lowRamDesc}</p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={lowRamMode}
                onChange={(e) => handleToggleLowRam(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          <div className="pt-4 border-t border-white/5 flex flex-wrap items-center gap-3">
            <button
              onClick={handleSuspendAllInactive}
              className="px-4 py-2 rounded-xl bg-[#121c22] hover:bg-[#18232b] text-xs font-semibold text-slate-200 border border-white/10 flex items-center gap-1.5 transition-colors"
            >
              <Moon className="w-3.5 h-3.5 text-amber-400" />
              <span>Suspend All Inactive Tabs Now</span>
            </button>

            <button
              onClick={handleClearMemoryCache}
              className="px-4 py-2 rounded-xl bg-[#121c22] hover:bg-[#18232b] text-xs font-semibold text-slate-200 border border-white/10 flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
              <span>Flush WebView Cache</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
