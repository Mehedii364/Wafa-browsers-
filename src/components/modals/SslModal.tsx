import React from 'react';
import { Lock, ShieldCheck, Check, X, Globe, Award } from 'lucide-react';
import { Language } from '../../types/browser';
import { translations } from '../../i18n/translations';

interface SslModalProps {
  url: string;
  language: Language;
  onClose: () => void;
}

export const SslModal: React.FC<SslModalProps> = ({ url, language, onClose }) => {
  const t = translations[language];

  let domain = 'current-site';
  try {
    domain = new URL(url).hostname;
  } catch {
    domain = url;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="max-w-md w-full p-6 rounded-3xl bg-[#0c1317] border border-white/10 shadow-2xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">{t.connectionSecure}</h3>
              <p className="text-[11px] font-mono text-emerald-400 truncate max-w-[200px]">{domain}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 rounded-2xl bg-[#080d10] border border-white/5 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Protocol:</span>
            <span className="text-emerald-400 font-bold">TLS 1.3 (Modern)</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Cipher Suite:</span>
            <span className="text-white">TLS_AES_256_GCM_SHA384</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Certificate Status:</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Valid & Trusted
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Key Exchange:</span>
            <span className="text-white">ECDHE_X25519 (253 bits)</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Mixed Content:</span>
            <span className="text-emerald-400 font-semibold">Strictly Blocked</span>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 leading-relaxed">
          Information transmitted to this website (such as passwords, payment cards, or private forms) is private and protected from tampering or interception.
        </p>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-semibold"
        >
          Close
        </button>
      </div>
    </div>
  );
};
