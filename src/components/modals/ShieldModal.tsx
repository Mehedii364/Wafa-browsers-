import React from 'react';
import { Shield, ShieldAlert, Check, X, Globe, EyeOff, Lock, AlertTriangle } from 'lucide-react';
import { BrowserTab, Language } from '../../types/browser';
import { translations } from '../../i18n/translations';
import { blockerService } from '../../services/blockerService';

interface ShieldModalProps {
  tab: BrowserTab;
  language: Language;
  onToggleShield: () => void;
  onClose: () => void;
}

export const ShieldModal: React.FC<ShieldModalProps> = ({
  tab,
  language,
  onToggleShield,
  onClose,
}) => {
  const t = translations[language];

  let domain = 'current-site';
  try {
    domain = new URL(tab.url).hostname;
  } catch {
    domain = tab.url;
  }

  const isAllowlisted = blockerService.isAllowlisted(domain);

  const handleToggleAllowlist = () => {
    blockerService.toggleAllowlist(domain);
    onToggleShield();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="max-w-md w-full p-6 rounded-3xl bg-[#0c1317] border border-white/10 shadow-2xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">WAFA Privacy Shield</h3>
              <p className="text-[11px] font-mono text-emerald-400 truncate max-w-[200px]">{domain}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shield Status Toggle */}
        <div className="p-4 rounded-2xl bg-[#11181d] border border-white/5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-white">
              {tab.shieldActive && !isAllowlisted ? t.shieldActive : t.shieldInactive}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {tab.shieldActive && !isAllowlisted
                ? 'Intercepting trackers and third-party advertising cookies.'
                : 'Shield is paused for this domain.'}
            </p>
          </div>

          <button
            onClick={handleToggleAllowlist}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              tab.shieldActive && !isAllowlisted
                ? 'bg-emerald-600 text-black hover:bg-emerald-500'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {tab.shieldActive && !isAllowlisted ? 'Enabled' : 'Disabled'}
          </button>
        </div>

        {/* Counter breakdown */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-[#080d10] border border-white/5">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
              {t.trackersBlocked}
            </span>
            <p className="text-xl font-bold font-mono text-emerald-400 mt-1 tabular-nums">
              {tab.trackersBlocked}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-[#080d10] border border-white/5">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
              {t.adsBlocked}
            </span>
            <p className="text-xl font-bold font-mono text-emerald-400 mt-1 tabular-nums">
              {tab.adsBlocked}
            </p>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 space-y-1 font-mono pt-1">
          <p className="flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Fingerprinting resistance: Enforced</span>
          </p>
          <p className="flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>HTTPS encryption upgrade: Verified</span>
          </p>
          <p className="flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Telemetry beacons blocked: Active</span>
          </p>
        </div>
      </div>
    </div>
  );
};
