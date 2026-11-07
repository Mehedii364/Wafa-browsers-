import React, { useState } from 'react';
import {
  FileText,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Download,
  Lock,
  Upload,
  Search,
  Check,
  X,
  FileCheck,
} from 'lucide-react';
import { Language } from '../../types/browser';
import { translations } from '../../i18n/translations';

interface PdfToolsProps {
  language: Language;
  onSaveToVault: (title: string, content: string) => void;
  onClose: () => void;
}

export const PdfTools: React.FC<PdfToolsProps> = ({ language, onSaveToVault, onClose }) => {
  const t = translations[language];

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(4);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [searchQuery, setSearchQuery] = useState('');
  const [docTitle, setDocTitle] = useState('WAFA_Security_Architecture_v1.0.pdf');
  const [savedToVault, setSavedToVault] = useState(false);

  // Sample PDF pages content
  const pagesContent = [
    {
      page: 1,
      title: 'WAFA BROWSER — ARCHITECTURE WHITE PAPER',
      subtitle: 'Native Android Engine & Envelope Encryption Specification',
      body: `
1. INTRODUCTION & SCOPE
WAFA Browser is engineered by Md. Mehedi Hasan (Mehedi364) under package ID site.wafazone.browser.
The system provides a real, lightweight, privacy-focused browser coupled with a zero-knowledge hardware-isolated Private Vault.

2. CRYPTOGRAPHIC ENVELOPE DESIGN
All sensitive data within the Private Vault is protected through envelope encryption:
• Master Key: 256-bit AES-GCM key generated via SecureRandom.
• Key Encryption Key (KEK): Derived from user password using PBKDF2 with 100,000 iterations and 16-byte random salt.
• Authenticated Additional Data (AAD): Cryptographically binds object record ID and version to prevent tampering or replay attacks.
      `.trim(),
    },
    {
      page: 2,
      title: 'SECTION 2: CONTENT FILTERING & SHIELDS',
      subtitle: 'Heuristic Tracker & Advertising Network Interception',
      body: `
3. REQUEST INTERCEPTION PIPELINE
WAFA Browser intercepts WebView network resource requests:
• Tracker blocklists detect invasive analytics, fingerprinting beacons, and telemetry.
• Malicious redirect protection ensures secure HTTPS upgrades across navigation events.
• Zero-cloud privacy guarantee: Browsing history, private files, and credentials never transmit to external servers.

4. LOCALIZATION & ACCESSIBILITY
Dual-language support for English and Bengali (বাংলা) guarantees native usability for regional users, featuring custom font fallbacks and RTL/LTR text engines.
      `.trim(),
    },
    {
      page: 3,
      title: 'SECTION 3: LOW-RAM PERFORMANCE OPTIMIZATION',
      subtitle: 'Background Tab Suspension & Memory Pressure Management',
      body: `
5. LOW-RAM MANAGEMENT
On resource-constrained devices:
• Inactive tabs are automatically transitioned into low-memory suspended states.
• DOM trees are safely preserved in serialized snapshots, releasing heavy WebView rendering surfaces.
• Memory pressure listener terminates background worker threads and flushes cached bitmaps.
      `.trim(),
    },
    {
      page: 4,
      title: 'SECTION 4: COMPLIANCE & LEGAL INVARIANTS',
      subtitle: 'Audit Verification and Recovery Protocols',
      body: `
6. ZERO-BACKDOOR POLICY
The Private Vault does not contain any master keys, developer backdoors, or unencrypted bypasses.
Losing both the Master Password and Recovery Key results in irrevocable cryptographic loss.

Developer Identity: Md. Mehedi Hasan (Mehedi364)
Edition: Complete Edition
Application ID: site.wafazone.browser
      `.trim(),
    },
  ];

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 15, 160));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 15, 70));
  const handleFitWidth = () => setZoomLevel(100);

  const handleSaveDocToVault = () => {
    const fullText = pagesContent.map((p) => `${p.title}\n\n${p.body}`).join('\n\n--- PAGE BREAK ---\n\n');
    onSaveToVault(docTitle, fullText);
    setSavedToVault(true);
    setTimeout(() => setSavedToVault(false), 2500);
  };

  const activePageData = pagesContent[currentPage - 1] || pagesContent[0];

  return (
    <div className="fixed inset-0 z-50 bg-[#070b0e] flex flex-col text-slate-100 overflow-hidden animate-in fade-in duration-200">
      {/* Top Controls Bar */}
      <div className="h-14 px-4 md:px-6 bg-[#0a0f12] border-b border-white/5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm md:text-base font-bold text-white truncate max-w-xs">{docTitle}</h1>
            <p className="text-[10px] text-slate-500 font-mono">Android PdfRenderer Engine</p>
          </div>
        </div>

        {/* Zoom & Page Nav in Center */}
        <div className="hidden sm:flex items-center gap-2 bg-[#121a20] px-3 py-1.5 rounded-xl border border-white/5">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage <= 1}
            className="p-1 text-slate-400 hover:text-white disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono text-slate-300">
            {t.pageOf} {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage >= totalPages}
            className="p-1 text-slate-400 hover:text-white disabled:opacity-30"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-white/10 mx-1"></div>

          <button onClick={handleZoomOut} className="p-1 text-slate-400 hover:text-white">
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] font-mono text-emerald-400">{zoomLevel}%</span>
          <button onClick={handleZoomIn} className="p-1 text-slate-400 hover:text-white">
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleSaveDocToVault}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-black text-xs font-semibold transition-colors"
          >
            {savedToVault ? <Check className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
            <span>{savedToVault ? 'Saved to Vault!' : t.savePdfToVault}</span>
          </button>

          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Canvas / Page Viewport */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 flex justify-center bg-[#05080a]">
        <div
          style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
          className="w-full max-w-2xl bg-[#0c1317] border border-white/10 rounded-2xl shadow-2xl p-8 sm:p-12 text-slate-200 min-h-[750px] flex flex-col justify-between transition-transform duration-150"
        >
          <div>
            <div className="flex items-center justify-between pb-6 border-b border-white/10 mb-6">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400">
                  WAFA PDF ENGINE
                </span>
                <h2 className="text-xl font-bold text-white mt-1">{activePageData.title}</h2>
                <p className="text-xs text-slate-400 font-mono mt-0.5">{activePageData.subtitle}</p>
              </div>
              <FileCheck className="w-8 h-8 text-emerald-400/50" />
            </div>

            <div className="prose prose-invert text-slate-300 text-xs sm:text-sm leading-relaxed whitespace-pre-line font-sans">
              {activePageData.body}
            </div>
          </div>

          <div className="pt-6 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span>WAFA Browser — site.wafazone.browser</span>
            <span>
              Page {currentPage} of {totalPages}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
