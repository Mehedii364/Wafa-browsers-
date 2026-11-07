import React, { useState, useEffect } from 'react';
import {
  Key,
  Plus,
  Copy,
  Check,
  Eye,
  EyeOff,
  Trash2,
  Search,
  ShieldCheck,
  RefreshCw,
  Lock,
  X,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { EncryptedCredential, Language } from '../../types/browser';
import { translations } from '../../i18n/translations';
import { cryptoVault } from '../../security/cryptoVault';
import { storageService } from '../../services/storageService';

interface PasswordManagerProps {
  language: Language;
  onClose: () => void;
}

export const PasswordManager: React.FC<PasswordManagerProps> = ({ language, onClose }) => {
  const t = translations[language];

  const [credentials, setCredentials] = useState<EncryptedCredential[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(cryptoVault.getIsUnlocked());

  // Password Generator States
  const [genLength, setGenLength] = useState(16);
  const [genIncludeSymbols, setGenIncludeSymbols] = useState(true);
  const [genIncludeNumbers, setGenIncludeNumbers] = useState(true);
  const [generatedPassword, setGeneratedPassword] = useState('');

  // Add Credential Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [siteInput, setSiteInput] = useState('');
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [categoryInput, setCategoryInput] = useState('Logins');

  // Clipboard auto-clear state
  const [copyCountdown, setCopyCountdown] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Decrypted values in view
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, string>>({});

  useEffect(() => {
    if (cryptoVault.getIsUnlocked()) {
      setIsUnlocked(true);
      setCredentials(storageService.getCredentials());
    }
    generateNewPassword();
  }, []);

  // Countdown timer for clipboard auto-clear
  useEffect(() => {
    if (copyCountdown === null) return;
    if (copyCountdown <= 0) {
      navigator.clipboard.writeText('');
      setCopyCountdown(null);
      setCopiedId(null);
      return;
    }
    const timer = setTimeout(() => {
      setCopyCountdown((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);
    return () => clearTimeout(timer);
  }, [copyCountdown]);

  const generateNewPassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const nums = '0123456789';
    const syms = '!@#$%^&*()-_=+[]{}|;:,.<>?';

    let pool = chars;
    if (genIncludeNumbers) pool += nums;
    if (genIncludeSymbols) pool += syms;

    const randomBytes = crypto.getRandomValues(new Uint8Array(genLength));
    let pw = '';
    for (let i = 0; i < genLength; i++) {
      pw += pool[randomBytes[i] % pool.length];
    }
    setGeneratedPassword(pw);
  };

  const calculateStrength = (pw: string): { label: string; score: number; color: string } => {
    if (!pw) return { label: 'Empty', score: 0, color: 'text-slate-500' };
    let score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 14) score++;
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;

    if (score <= 2) return { label: 'Weak', score, color: 'text-red-400' };
    if (score <= 4) return { label: 'Strong', score, color: 'text-amber-400' };
    return { label: 'Very Strong', score: 5, color: 'text-emerald-400' };
  };

  const handleSaveCredential = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteInput.trim() || !passwordInput.trim()) return;

    if (!cryptoVault.getIsUnlocked()) {
      alert('Please unlock your Private Vault first to encrypt passwords.');
      return;
    }

    try {
      const id = 'cred-' + Date.now();
      const enc = await cryptoVault.encryptData(passwordInput, id);

      const newCred: EncryptedCredential = {
        id,
        title: siteInput.trim(),
        website: siteInput.trim(),
        username: usernameInput.trim(),
        encryptedPasswordBase64: enc.ciphertextBase64,
        ivBase64: enc.ivBase64,
        category: categoryInput,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const updated = [newCred, ...credentials];
      storageService.saveCredentials(updated);
      setCredentials(updated);
      setSiteInput('');
      setUsernameInput('');
      setPasswordInput('');
      setShowAddModal(false);
    } catch (err: any) {
      alert('Encryption error: ' + err.message);
    }
  };

  const handleRevealPassword = async (cred: EncryptedCredential) => {
    if (revealedPasswords[cred.id]) {
      // Hide
      const copy = { ...revealedPasswords };
      delete copy[cred.id];
      setRevealedPasswords(copy);
      return;
    }

    if (!cryptoVault.getIsUnlocked()) {
      alert('Unlock Private Vault to decrypt passwords.');
      return;
    }

    try {
      const plain = await cryptoVault.decryptText(cred.encryptedPasswordBase64, cred.ivBase64);
      setRevealedPasswords((prev) => ({ ...prev, [cred.id]: plain }));
    } catch (err: any) {
      alert('Decryption error: ' + err.message);
    }
  };

  const handleCopyPassword = async (cred: EncryptedCredential) => {
    if (!cryptoVault.getIsUnlocked()) {
      alert('Unlock Private Vault to copy passwords.');
      return;
    }

    try {
      let plain = revealedPasswords[cred.id];
      if (!plain) {
        plain = await cryptoVault.decryptText(cred.encryptedPasswordBase64, cred.ivBase64);
      }
      await navigator.clipboard.writeText(plain);
      setCopiedId(cred.id);
      setCopyCountdown(30); // 30s auto-clear
    } catch (err: any) {
      alert('Copy error: ' + err.message);
    }
  };

  const handleDelete = (id: string) => {
    const updated = credentials.filter((c) => c.id !== id);
    storageService.saveCredentials(updated);
    setCredentials(updated);
  };

  const filteredCredentials = credentials.filter(
    (c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-[#070b0e] flex flex-col text-slate-100 overflow-hidden animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="h-14 px-4 md:px-6 bg-[#0a0f12] border-b border-white/5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Key className="w-4 h-4" />
          </div>
          <h1 className="text-sm md:text-base font-bold text-white flex items-center gap-2">
            <span>{t.passwordManagerTitle}</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
              Hardware-Backed
            </span>
          </h1>
        </div>

        <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Container */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 max-w-5xl mx-auto w-full space-y-6">
        {/* Security Auto-Clear Banner if active */}
        {copyCountdown !== null && (
          <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-between text-xs text-emerald-300">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 animate-spin text-emerald-400" />
              <span>{t.copiedPasswordNotice}</span>
            </div>
            <span className="font-mono font-bold bg-black/40 px-2.5 py-1 rounded">
              {copyCountdown}s remaining
            </span>
          </div>
        )}

        {/* Generator Card */}
        <div className="p-5 rounded-2xl bg-[#0c1317] border border-white/5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> Strong Password Generator
            </h3>
            <button
              onClick={generateNewPassword}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-emerald-300"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Generate New
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex-1 p-3 rounded-xl bg-[#121a20] border border-white/10 font-mono text-sm text-emerald-300 select-all truncate">
              {generatedPassword}
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(generatedPassword);
                setCopyCountdown(30);
              }}
              className="px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-black text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
            >
              <Copy className="w-4 h-4" />
              <span>Copy</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300 pt-1">
            <div className="flex items-center gap-2">
              <span>Length: {genLength}</span>
              <input
                type="range"
                min={8}
                max={32}
                value={genLength}
                onChange={(e) => {
                  setGenLength(Number(e.target.value));
                  generateNewPassword();
                }}
                className="w-full accent-emerald-500"
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={genIncludeNumbers}
                onChange={(e) => {
                  setGenIncludeNumbers(e.target.checked);
                  generateNewPassword();
                }}
                className="accent-emerald-500 rounded"
              />
              <span>Include Numbers (0-9)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={genIncludeSymbols}
                onChange={(e) => {
                  setGenIncludeSymbols(e.target.checked);
                  generateNewPassword();
                }}
                className="accent-emerald-500 rounded"
              />
              <span>Include Symbols (!@#$)</span>
            </label>
          </div>
        </div>

        {/* Credentials List Section */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search websites or logins..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#0c1317] border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-black text-xs font-semibold transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>{t.addCredential}</span>
            </button>
          </div>

          {filteredCredentials.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-[#0c1317] border border-white/5 text-slate-500 space-y-2">
              <Key className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-sm font-medium text-slate-400">{t.noCredentials}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredCredentials.map((cred) => (
                <div
                  key={cred.id}
                  className="p-4 rounded-2xl bg-[#0c1317] border border-white/5 hover:border-emerald-500/30 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">{cred.title}</h4>
                      <p className="text-xs text-slate-400 font-mono">{cred.username || 'No username'}</p>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-400">
                      {cred.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <div className="flex-1 p-2 rounded-lg bg-[#11191f] border border-white/5 font-mono text-xs text-emerald-300">
                      {revealedPasswords[cred.id] ? revealedPasswords[cred.id] : '••••••••••••••••'}
                    </div>

                    <button
                      onClick={() => handleRevealPassword(cred)}
                      title="Reveal Password"
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                    >
                      {revealedPasswords[cred.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={() => handleCopyPassword(cred)}
                      title={t.copyPassword}
                      className="p-2 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 transition-colors"
                    >
                      {copiedId === cred.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={() => handleDelete(cred.id)}
                      title="Delete Login"
                      className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Credential Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveCredential}
            className="max-w-md w-full p-6 rounded-2xl bg-[#0d1418] border border-white/10 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Key className="w-4 h-4 text-emerald-400" />
                <span>{t.addCredential}</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1">{t.websiteLabel}</label>
              <input
                type="text"
                value={siteInput}
                onChange={(e) => setSiteInput(e.target.value)}
                placeholder="e.g. google.com or GitHub"
                required
                className="w-full px-3 py-2 rounded-xl bg-[#131b20] border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1">{t.usernameLabel}</label>
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="e.g. user@example.com"
                className="w-full px-3 py-2 rounded-xl bg-[#131b20] border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs text-slate-300">{t.passwordLabel}</label>
                <button
                  type="button"
                  onClick={() => setPasswordInput(generatedPassword)}
                  className="text-[11px] text-emerald-400 hover:underline"
                >
                  Use Generated
                </button>
              </div>
              <input
                type="text"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Password..."
                required
                className="w-full px-3 py-2 rounded-xl bg-[#131b20] border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-black text-xs font-semibold"
              >
                {t.save}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
