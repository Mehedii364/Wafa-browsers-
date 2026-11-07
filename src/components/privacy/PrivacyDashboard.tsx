import React, { useState, useEffect } from 'react';
import {
  Shield,
  Trash2,
  Lock,
  Globe,
  Cookie,
  Camera,
  Mic,
  MapPin,
  Bell,
  Check,
  X,
  AlertTriangle,
  RotateCw,
} from 'lucide-react';
import { Language, ShieldStats, SitePermission } from '../../types/browser';
import { translations } from '../../i18n/translations';
import { storageService } from '../../services/storageService';
import { blockerService, KNOWN_TRACKER_DOMAINS } from '../../services/blockerService';

interface PrivacyDashboardProps {
  language: Language;
  onClose: () => void;
}

export const PrivacyDashboard: React.FC<PrivacyDashboardProps> = ({ language, onClose }) => {
  const t = translations[language];

  const [stats, setStats] = useState<ShieldStats>(storageService.getShieldStats());
  const [clearedNotice, setClearedNotice] = useState(false);

  // Site Permissions
  const [sitePermissions, setSitePermissions] = useState<SitePermission[]>([
    { domain: 'duckduckgo.com', camera: 'block', microphone: 'block', geolocation: 'ask', notifications: 'block', shields: true },
    { domain: 'wikipedia.org', camera: 'block', microphone: 'block', geolocation: 'block', notifications: 'block', shields: true },
    { domain: 'wafazone.site', camera: 'allow', microphone: 'allow', geolocation: 'allow', notifications: 'allow', shields: true },
  ]);

  const handleClearData = () => {
    storageService.clearAllBrowsingData();
    setClearedNotice(true);
    setTimeout(() => setClearedNotice(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#070b0e] flex flex-col text-slate-100 overflow-hidden animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="h-14 px-4 md:px-6 bg-[#0a0f12] border-b border-white/5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Shield className="w-4 h-4" />
          </div>
          <h1 className="text-sm md:text-base font-bold text-white flex items-center gap-2">
            <span>{t.privacyDashboard}</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
              Active Interceptor
            </span>
          </h1>
        </div>

        <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main View */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 max-w-4xl mx-auto w-full space-y-6">
        {clearedNotice && (
          <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Browsing history, session cache, and temporary buffers successfully purged.</span>
          </div>
        )}

        {/* Aggregate KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-[#0c1317] border border-white/5">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
              Trackers Blocked
            </span>
            <p className="text-2xl font-bold font-mono text-emerald-400 mt-1 tabular-nums">
              {stats.totalTrackersBlocked}
            </p>
            <span className="text-[11px] text-slate-400">Analytics & beacons</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#0c1317] border border-white/5">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
              Ads Eliminated
            </span>
            <p className="text-2xl font-bold font-mono text-emerald-400 mt-1 tabular-nums">
              {stats.totalAdsBlocked}
            </p>
            <span className="text-[11px] text-slate-400">Intrusive popups</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#0c1317] border border-white/5">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
              HTTPS Upgrades
            </span>
            <p className="text-2xl font-bold font-mono text-amber-400 mt-1 tabular-nums">
              {stats.totalHttpsUpgrades}
            </p>
            <span className="text-[11px] text-slate-400">Insecure fallbacks stopped</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#0c1317] border border-white/5">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
              Bandwidth Saved
            </span>
            <p className="text-2xl font-bold font-mono text-white mt-1 tabular-nums">
              {(stats.totalBandwidthSavedKb / 1024).toFixed(1)} MB
            </p>
            <span className="text-[11px] text-slate-400">Data traffic reduced</span>
          </div>
        </div>

        {/* Site Permissions Table */}
        <div className="p-5 rounded-2xl bg-[#0c1317] border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-mono uppercase tracking-wider text-emerald-400">
                Site Permissions & Hardware Isolation
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Per-domain access rights for Camera, Microphone, Geolocation and Shields.
              </p>
            </div>
          </div>

          <div className="divide-y divide-white/5">
            {sitePermissions.map((perm) => (
              <div key={perm.domain} className="py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-emerald-400" />
                  <span className="font-semibold text-white">{perm.domain}</span>
                </div>

                <div className="flex items-center gap-4 text-slate-400">
                  <span className="flex items-center gap-1">
                    <Camera className="w-3.5 h-3.5" />
                    <span className="font-mono text-[11px] uppercase">{perm.camera}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Mic className="w-3.5 h-3.5" />
                    <span className="font-mono text-[11px] uppercase">{perm.microphone}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="font-mono text-[11px] uppercase">{perm.geolocation}</span>
                  </span>
                  <span className="flex items-center gap-1 text-emerald-400 font-mono text-[11px]">
                    Shield: ON
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Purge Browsing Data */}
        <div className="p-5 rounded-2xl bg-[#0c1317] border border-red-500/20 space-y-3">
          <h3 className="text-xs font-mono uppercase tracking-wider text-red-400 flex items-center gap-2">
            <Trash2 className="w-4 h-4" /> Purge Browsing & Ephemeral Data
          </h3>
          <p className="text-xs text-slate-400">
            Wipes all cached web assets, browsing history, and temporary DOM snapshots. Encrypted items inside your Private Vault will NOT be affected.
          </p>

          <button
            onClick={handleClearData}
            className="px-4 py-2 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/30 text-xs font-semibold transition-colors flex items-center gap-2"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{t.clearNow}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
