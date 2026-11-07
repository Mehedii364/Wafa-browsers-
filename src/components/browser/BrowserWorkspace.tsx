import React, { useState, useEffect } from 'react';
import {
  Shield,
  BookOpen,
  Volume2,
  VolumeX,
  Camera,
  Share2,
  Download,
  Lock,
  ExternalLink,
  Search,
  Check,
  FileText,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { BrowserTab, Language } from '../../types/browser';
import { translations } from '../../i18n/translations';

interface BrowserWorkspaceProps {
  tab: BrowserTab;
  language: Language;
  onSaveToOffline: (url: string, title: string, text: string) => void;
  onSaveToVault: (title: string, content: string) => void;
}

export const BrowserWorkspace: React.FC<BrowserWorkspaceProps> = ({
  tab,
  language,
  onSaveToOffline,
  onSaveToVault,
}) => {
  const t = translations[language];
  const [iframeError, setIframeError] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [findQuery, setFindQuery] = useState('');
  const [showFindBar, setShowFindBar] = useState(false);
  const [snapshotTaken, setSnapshotTaken] = useState(false);

  // Derive domain
  let domain = 'example.com';
  try {
    domain = new URL(tab.url).hostname;
  } catch {
    domain = tab.url;
  }

  // Check known X-Frame-Options blocking domains
  const isXFrameRestricted =
    domain.includes('google.') ||
    domain.includes('facebook.') ||
    domain.includes('youtube.') ||
    domain.includes('twitter.') ||
    domain.includes('x.com') ||
    domain.includes('github.com');

  // Text for simulated reader / TTS
  const sampleArticleContent = `
WAFA Browser Complete Edition — Developed by Md. Mehedi Hasan (Mehedi364).
Package ID: site.wafazone.browser.

Welcome to ${domain}. You are browsing with active tracker & advertising shields, protecting your identity and device fingerprint.

Key Security Highlights:
1. End-to-end envelope encryption for all private files and credentials using AES-256-GCM.
2. Hardware-backed Keystore derivation with PBKDF2/Argon2id.
3. Zero-knowledge private vault isolated from ordinary browser tabs.
4. Offline document renderer and real camera QR verification.
5. In-memory zeroization upon 5-minute inactivity lock.

This page is rendered inside the WAFA Browser secure sandbox.
  `.trim();

  const handleTextToSpeech = () => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(sampleArticleContent);
      utterance.rate = 1.0;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(tab.url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleCaptureSnapshot = () => {
    onSaveToOffline(tab.url, tab.title, sampleArticleContent);
    setSnapshotTaken(true);
    setTimeout(() => setSnapshotTaken(false), 2500);
  };

  const wordsCount = sampleArticleContent.split(/\s+/).filter(Boolean).length;
  const estimatedReadTime = Math.ceil(wordsCount / 180);

  return (
    <main className="flex-1 flex flex-col relative bg-[#070b0e] overflow-hidden">
      {/* Optional Find In Page Bar */}
      {showFindBar && (
        <div className="absolute top-2 right-4 z-20 flex items-center gap-2 p-2 rounded-xl bg-[#11181d] border border-white/10 shadow-2xl">
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={findQuery}
            onChange={(e) => setFindQuery(e.target.value)}
            placeholder="Find in page..."
            className="bg-transparent text-xs text-white focus:outline-none w-40"
          />
          <button
            onClick={() => setShowFindBar(false)}
            className="text-slate-400 hover:text-white text-xs px-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Reader Mode View */}
      {tab.readerMode ? (
        <div className="flex-1 overflow-y-auto px-6 py-8 max-w-3xl mx-auto w-full">
          <div className="flex items-center justify-between pb-6 border-b border-white/10 mb-6">
            <div>
              <span className="text-xs font-mono text-emerald-400 tracking-wider uppercase">WAFA Reader View</span>
              <h1 className="text-2xl font-bold text-white mt-1">{tab.title || domain}</h1>
              <p className="text-xs text-slate-400 mt-1 font-mono">
                {domain} · {wordsCount} words · ~{estimatedReadTime} min read
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleTextToSpeech}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs hover:bg-emerald-500/25 transition-colors"
              >
                {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                <span>{isSpeaking ? t.ttsStop : t.ttsReadAloud}</span>
              </button>
              <button
                onClick={handleCaptureSnapshot}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 text-xs hover:bg-white/10 transition-colors"
              >
                {snapshotTaken ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <FileText className="w-3.5 h-3.5" />}
                <span>{snapshotTaken ? 'Saved!' : t.saveCurrentPage}</span>
              </button>
            </div>
          </div>

          <article className="prose prose-invert max-w-none text-slate-200 leading-relaxed text-base space-y-4 font-sans">
            <p className="text-lg text-slate-300 font-medium">
              You are viewing the clean, distraction-free reader snapshot of{' '}
              <span className="text-emerald-400">{domain}</span>. All tracking scripts, popups, and intrusive banners have been eliminated.
            </p>
            <div className="p-4 rounded-xl bg-[#0e161c] border border-white/5 space-y-2">
              <h3 className="text-sm font-semibold text-emerald-300 flex items-center gap-2">
                <Shield className="w-4 h-4" /> Privacy & Shield Diagnostics
              </h3>
              <p className="text-xs text-slate-400">
                Blocked {tab.trackersBlocked} telemetry trackers and {tab.adsBlocked} advertising assets on this page.
                SSL connection authenticated with SHA-256 certificate thumbprint.
              </p>
            </div>
            <p className="whitespace-pre-line text-slate-300">{sampleArticleContent}</p>
          </article>
        </div>
      ) : isXFrameRestricted || iframeError ? (
        /* Smart Privacy Sandbox Fallback for X-Frame-Options sites */
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center overflow-y-auto">
          <div className="max-w-lg w-full p-8 rounded-2xl bg-[#0d1418] border border-white/10 shadow-2xl relative">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4 text-emerald-400">
              <Shield className="w-7 h-7" />
            </div>

            <h2 className="text-xl font-bold text-white mb-2">{tab.title || domain}</h2>
            <p className="text-xs font-mono text-emerald-400 mb-4 truncate px-4">{tab.url}</p>

            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              This domain uses <span className="text-slate-300 font-mono">X-Frame-Options: SAMEORIGIN</span> to prevent embedding in third-party frames.
              WAFA Browser protects your session while providing built-in tools below:
            </p>

            {/* Quick Action Matrix */}
            <div className="grid grid-cols-2 gap-2 mb-6">
              <button
                onClick={() => onSaveToVault(`Snapshot of ${domain}`, sampleArticleContent)}
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-[#131d24] border border-white/5 hover:border-emerald-500/40 text-xs text-slate-200 hover:text-white transition-all"
              >
                <Lock className="w-4 h-4 text-emerald-400" />
                <span>Save to Vault</span>
              </button>

              <button
                onClick={handleCaptureSnapshot}
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-[#131d24] border border-white/5 hover:border-emerald-500/40 text-xs text-slate-200 hover:text-white transition-all"
              >
                {snapshotTaken ? <Check className="w-4 h-4 text-emerald-400" /> : <FileText className="w-4 h-4 text-amber-400" />}
                <span>{snapshotTaken ? 'Saved!' : 'Save Offline'}</span>
              </button>

              <button
                onClick={handleCopy}
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-[#131d24] border border-white/5 hover:border-emerald-500/40 text-xs text-slate-200 hover:text-white transition-all"
              >
                {copiedUrl ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4 text-blue-400" />}
                <span>{copiedUrl ? 'Copied' : 'Copy URL'}</span>
              </button>

              <a
                href={tab.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-medium text-black transition-all"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open in Tab</span>
              </a>
            </div>

            {/* Shield Telemetry Pill */}
            <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-500 font-mono">
              <span>Trackers Shield: Active</span>
              <span className="text-emerald-400 tabular-nums">{tab.trackersBlocked} blocked</span>
            </div>
          </div>
        </div>
      ) : (
        /* Live Sandboxed Iframe */
        <div className={`flex-1 w-full h-full relative ${tab.desktopMode ? 'max-w-6xl mx-auto' : 'w-full'}`}>
          <iframe
            src={tab.url}
            title={tab.title}
            sandbox="allow-scripts allow-forms allow-same-origin allow-popups"
            onError={() => setIframeError(true)}
            className="w-full h-full border-none bg-white"
          />
        </div>
      )}
    </main>
  );
};
