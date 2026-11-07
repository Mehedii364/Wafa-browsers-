import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Trash2,
  ExternalLink,
  Volume2,
  VolumeX,
  Search,
  Clock,
  FileText,
  X,
  Check,
} from 'lucide-react';
import { Language, OfflinePage } from '../../types/browser';
import { translations } from '../../i18n/translations';
import { storageService } from '../../services/storageService';

interface OfflineLibraryProps {
  language: Language;
  onOpenUrl: (url: string) => void;
  onClose: () => void;
}

export const OfflineLibrary: React.FC<OfflineLibraryProps> = ({ language, onOpenUrl, onClose }) => {
  const t = translations[language];

  const [pages, setPages] = useState<OfflinePage[]>([]);
  const [selectedPage, setSelectedPage] = useState<OfflinePage | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    const loaded = storageService.getOfflinePages();
    if (loaded.length === 0) {
      // Seed sample saved page
      const sample: OfflinePage = {
        id: 'off-1',
        url: 'https://en.wikipedia.org/wiki/Zero-knowledge_proof',
        title: 'Zero-knowledge proof — Wikipedia Offline Snapshot',
        htmlContent: '',
        textContent: `In cryptography, a zero-knowledge proof or zero-knowledge protocol is a method by which one party (the prover) can prove to another party (the verifier) that a given statement is true, without conveying any information apart from the fact that the statement is indeed true.\n\nThe essence of zero-knowledge proofs is that it is trivial to prove that one possesses knowledge of certain information by simply revealing it; the challenge is to prove such possession without revealing the information itself or any additional information.`,
        savedAt: Date.now() - 86400000,
        category: 'Cryptography',
        readProgress: 60,
      };
      storageService.saveOfflinePages([sample]);
      setPages([sample]);
    } else {
      setPages(loaded);
    }

    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleDelete = (id: string) => {
    const updated = pages.filter((p) => p.id !== id);
    storageService.saveOfflinePages(updated);
    setPages(updated);
    if (selectedPage?.id === id) {
      setSelectedPage(null);
    }
  };

  const handleTts = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const utter = new SpeechSynthesisUtterance(text);
      utter.rate = 1.0;
      utter.onend = () => setIsSpeaking(false);
      utter.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utter);
      setIsSpeaking(true);
    }
  };

  const filtered = pages.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-[#070b0e] flex flex-col text-slate-100 overflow-hidden animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="h-14 px-4 md:px-6 bg-[#0a0f12] border-b border-white/5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <BookOpen className="w-4 h-4" />
          </div>
          <h1 className="text-sm md:text-base font-bold text-white flex items-center gap-2">
            <span>{t.offlineTitle}</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
              {pages.length} Saved
            </span>
          </h1>
        </div>

        <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main split */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left List */}
        <div className="w-full md:w-80 bg-[#090e12] border-r border-white/5 flex flex-col p-4 shrink-0 overflow-y-auto space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search offline articles..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#11181d] border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            {filtered.map((p) => {
              const active = selectedPage?.id === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedPage(p)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    active
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                      : 'bg-[#0c1317] border-white/5 hover:border-white/20 text-slate-300'
                  }`}
                >
                  <h4 className="text-xs font-semibold truncate">{p.title}</h4>
                  <p className="text-[10px] text-slate-500 font-mono truncate mt-0.5">{p.url}</p>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-white/5 mt-2">
                    <span>{new Date(p.savedAt).toLocaleDateString()}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(p.id);
                      }}
                      className="p-1 hover:text-red-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Reader Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 bg-[#060a0c]">
          {selectedPage ? (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedPage.title}</h2>
                  <p className="text-xs text-emerald-400 font-mono mt-1">{selectedPage.url}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleTts(selectedPage.textContent)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-black text-xs font-semibold transition-colors"
                  >
                    {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    <span>{isSpeaking ? t.ttsStop : t.ttsReadAloud}</span>
                  </button>
                  <button
                    onClick={() => {
                      onOpenUrl(selectedPage.url);
                      onClose();
                    }}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs"
                    title="Open Live URL"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <article className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed whitespace-pre-wrap font-sans">
                {selectedPage.textContent}
              </article>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-500">
              <FileText className="w-12 h-12 mb-3 text-slate-600" />
              <p className="text-sm font-medium text-slate-400">Select an offline article to read</p>
              <p className="text-xs text-slate-600 mt-1">Saved pages are accessible without internet connectivity.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
