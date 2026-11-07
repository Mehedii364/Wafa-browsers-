import React, { useState, useEffect } from 'react';
import {
  Lock,
  Unlock,
  X,
  Plus,
  Bookmark,
  FileText,
  Key,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Eye,
} from 'lucide-react';
import { Language, VaultItem } from '../../types/browser';
import { translations } from '../../i18n/translations';
import { cryptoVault } from '../../security/cryptoVault';
import { storageService } from '../../services/storageService';

interface IntegratedVaultSidebarProps {
  currentUrl: string;
  currentTitle: string;
  language: Language;
  onClose: () => void;
  onOpenStandaloneVault: () => void;
}

export const IntegratedVaultSidebar: React.FC<IntegratedVaultSidebarProps> = ({
  currentUrl,
  currentTitle,
  language,
  onClose,
  onOpenStandaloneVault,
}) => {
  const t = translations[language];
  const [isUnlocked, setIsUnlocked] = useState(cryptoVault.getIsUnlocked());
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [recentItems, setRecentItems] = useState<VaultItem[]>([]);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (cryptoVault.getIsUnlocked()) {
      setIsUnlocked(true);
      setRecentItems(storageService.getVaultItems().slice(0, 5));
    }
  }, []);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const env = storageService.getVaultEnvelope();
    if (!env) {
      setError('Vault is not initialized yet. Open full Vault first.');
      return;
    }
    const ok = await cryptoVault.unlockWithPassword(password, env);
    if (ok) {
      setIsUnlocked(true);
      setPassword('');
      setRecentItems(storageService.getVaultItems().slice(0, 5));
    } else {
      setError(t.wrongPassword);
    }
  };

  const handleQuickSaveCurrentPage = async () => {
    if (!isUnlocked) {
      setError('Unlock vault to save.');
      return;
    }
    try {
      const id = 'vault-bm-' + Date.now();
      const payload = JSON.stringify({ url: currentUrl, title: currentTitle, savedAt: Date.now() });
      const enc = await cryptoVault.encryptData(payload, id);

      const newItem: VaultItem = {
        id,
        title: `Private Bookmark: ${currentTitle || currentUrl}`,
        category: 'bookmarks',
        mimeType: 'application/json',
        sizeBytes: payload.length,
        createdAt: Date.now(),
        encryptedBlobBase64: enc.ciphertextBase64,
        ivBase64: enc.ivBase64,
        aadBase64: enc.aadBase64,
        isFavorite: false,
        isTrashed: false,
      };

      const existing = storageService.getVaultItems();
      const updated = [newItem, ...existing];
      storageService.saveVaultItems(updated);
      setRecentItems(updated.slice(0, 5));
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <aside className="fixed top-0 right-0 bottom-0 w-80 bg-[#090e12]/95 backdrop-blur-2xl border-l border-white/10 z-40 flex flex-col shadow-2xl p-4 animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Lock className="w-3.5 h-3.5" />
          </div>
          <span className="text-sm font-bold text-white">Integrated Vault</span>
        </div>

        <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>

      {!isUnlocked ? (
        /* Sidebar Quick Unlock */
        <div className="flex-1 flex flex-col justify-center p-2 text-center">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-3 text-emerald-400">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-xs font-bold text-white mb-1">{t.vaultLocked}</h3>
          <p className="text-[11px] text-slate-400 mb-4">{t.enterPassword} to access quick private storage.</p>

          {error && <p className="text-xs text-red-400 mb-3">{error}</p>}

          <form onSubmit={handleUnlock} className="space-y-3">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3 py-2 rounded-xl bg-[#131b20] border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500/50"
            />
            <button
              type="submit"
              className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-black font-semibold text-xs transition-colors"
            >
              {t.unlockVault}
            </button>
          </form>

          <button
            onClick={onOpenStandaloneVault}
            className="text-[11px] text-emerald-400 hover:underline mt-4"
          >
            Open Standalone Vault Dashboard →
          </button>
        </div>
      ) : (
        /* Sidebar Quick Actions */
        <div className="flex-1 flex flex-col justify-between overflow-y-auto py-3">
          <div className="space-y-4">
            {/* Quick Save Current Page */}
            <div className="p-3 rounded-xl bg-[#0f171d] border border-white/5 space-y-2">
              <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider">Active Tab</span>
              <p className="text-xs font-semibold text-slate-200 truncate">{currentTitle || currentUrl}</p>
              <button
                onClick={handleQuickSaveCurrentPage}
                className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-black text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>{savedSuccess ? 'Saved to Encrypted Vault!' : 'Save Private Bookmark'}</span>
              </button>
            </div>

            {/* Recent Vault Items */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                Recent Vault Items
              </span>
              {recentItems.length === 0 ? (
                <p className="text-xs text-slate-500 italic p-2">No recent items in vault.</p>
              ) : (
                recentItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-2 rounded-lg bg-[#0d1418] border border-white/5 flex items-center justify-between text-xs"
                  >
                    <span className="text-slate-300 truncate max-w-[170px]">{item.title}</span>
                    <span className="text-[10px] font-mono text-slate-500 uppercase">{item.category}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="pt-3 border-t border-white/5 space-y-2">
            <button
              onClick={onOpenStandaloneVault}
              className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Full Vault Dashboard</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => {
                cryptoVault.lock();
                setIsUnlocked(false);
              }}
              className="w-full py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{t.quickLock}</span>
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};
