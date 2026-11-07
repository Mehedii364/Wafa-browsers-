import React, { useState, useEffect } from 'react';
import {
  Lock,
  Unlock,
  ShieldAlert,
  Key,
  FolderLock,
  FileText,
  Image as ImageIcon,
  Video,
  FileCode,
  Bookmark,
  Trash2,
  Plus,
  Upload,
  Download,
  Eye,
  Star,
  RefreshCw,
  X,
  AlertCircle,
  Check,
  Search,
  HardDrive,
  Copy,
  Info,
} from 'lucide-react';
import { Language, VaultCategory, VaultItem } from '../../types/browser';
import { translations } from '../../i18n/translations';
import { cryptoVault, EncryptedEnvelope } from '../../security/cryptoVault';
import { storageService } from '../../services/storageService';

interface VaultDashboardProps {
  language: Language;
  onClose: () => void;
}

export const VaultDashboard: React.FC<VaultDashboardProps> = ({ language, onClose }) => {
  const t = translations[language];

  const [envelope, setEnvelope] = useState<EncryptedEnvelope | null>(null);
  const [recoveryEnvelope, setRecoveryEnvelope] = useState<EncryptedEnvelope | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(cryptoVault.getIsUnlocked());

  // Input states
  const [passwordInput, setPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [recoveryKeyInput, setRecoveryKeyInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [displayedRecoveryKey, setDisplayedRecoveryKey] = useState<string | null>(null);
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);

  // Vault Content states
  const [items, setItems] = useState<VaultItem[]>([]);
  const [currentCategory, setCurrentCategory] = useState<VaultCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Note creation modal
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteBody, setNoteBody] = useState('');

  // Preview modal
  const [previewItem, setPreviewItem] = useState<{ item: VaultItem; decryptedContent: string } | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);

  useEffect(() => {
    const loadedEnvelope = storageService.getVaultEnvelope();
    const loadedRecovery = storageService.getVaultRecoveryEnvelope();
    setEnvelope(loadedEnvelope);
    setRecoveryEnvelope(loadedRecovery);

    if (cryptoVault.getIsUnlocked()) {
      setIsUnlocked(true);
      loadVaultItems();
    }

    cryptoVault.onLock(() => {
      setIsUnlocked(false);
      setPreviewItem(null);
    });
  }, []);

  const loadVaultItems = () => {
    const stored = storageService.getVaultItems();
    setItems(stored);
  };

  const handleSetupVault = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (passwordInput.length < 8) {
      setErrorMessage('Master Password must be at least 8 characters.');
      return;
    }
    if (passwordInput !== confirmPasswordInput) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    try {
      const res = await cryptoVault.initializeVault(passwordInput);
      storageService.saveVaultEnvelope(res.envelope);
      storageService.saveVaultRecoveryEnvelope(res.recoveryEnvelope);
      setEnvelope(res.envelope);
      setRecoveryEnvelope(res.recoveryEnvelope);
      setDisplayedRecoveryKey(res.recoveryKey);
      setIsUnlocked(true);
      setPasswordInput('');
      setConfirmPasswordInput('');

      // Create initial sample encrypted welcome note
      const enc = await cryptoVault.encryptData(
        'Welcome to your WAFA Encrypted Private Vault.\nAll files, photos, and notes are encrypted with AES-256-GCM before hitting disk storage.',
        'INITIAL_NOTE'
      );
      const initialItem: VaultItem = {
        id: 'vault-item-1',
        title: 'Vault Security Brief',
        category: 'notes',
        mimeType: 'text/plain',
        sizeBytes: 256,
        createdAt: Date.now(),
        encryptedBlobBase64: enc.ciphertextBase64,
        ivBase64: enc.ivBase64,
        aadBase64: enc.aadBase64,
        isFavorite: true,
        isTrashed: false,
      };
      storageService.saveVaultItems([initialItem]);
      setItems([initialItem]);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to initialize Vault.');
    }
  };

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!envelope) return;

    const ok = await cryptoVault.unlockWithPassword(passwordInput, envelope);
    if (ok) {
      setIsUnlocked(true);
      setPasswordInput('');
      loadVaultItems();
    } else {
      setErrorMessage(t.wrongPassword);
    }
  };

  const handleUnlockWithRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!recoveryEnvelope) {
      setErrorMessage('No recovery envelope found.');
      return;
    }
    const ok = await cryptoVault.unlockWithRecoveryKey(recoveryKeyInput, recoveryEnvelope);
    if (ok) {
      setIsUnlocked(true);
      setRecoveryKeyInput('');
      setIsRecoveryMode(false);
      loadVaultItems();
    } else {
      setErrorMessage('Invalid recovery key.');
    }
  };

  const handleLockNow = () => {
    cryptoVault.lock();
    setIsUnlocked(false);
    setPreviewItem(null);
  };

  // Upload and encrypt file
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      const itemId = 'vault-' + Date.now();
      const enc = await cryptoVault.encryptData(bytes, itemId);

      let cat: VaultCategory = 'documents';
      if (file.type.startsWith('image/')) cat = 'photos';
      else if (file.type.startsWith('video/')) cat = 'videos';
      else if (file.type === 'application/pdf') cat = 'pdfs';

      const newItem: VaultItem = {
        id: itemId,
        title: file.name,
        category: cat,
        mimeType: file.type || 'application/octet-stream',
        sizeBytes: file.size,
        createdAt: Date.now(),
        encryptedBlobBase64: enc.ciphertextBase64,
        ivBase64: enc.ivBase64,
        aadBase64: enc.aadBase64,
        isFavorite: false,
        isTrashed: false,
      };

      const updated = [newItem, ...items];
      storageService.saveVaultItems(updated);
      setItems(updated);
      e.target.value = '';
    } catch (err: any) {
      alert('Encryption failed: ' + err.message);
    }
  };

  // Create Encrypted Note
  const handleSaveNote = async () => {
    if (!noteTitle.trim()) return;
    try {
      const itemId = 'vault-note-' + Date.now();
      const enc = await cryptoVault.encryptData(noteBody, itemId);
      const newItem: VaultItem = {
        id: itemId,
        title: noteTitle.trim(),
        category: 'notes',
        mimeType: 'text/plain',
        sizeBytes: noteBody.length,
        createdAt: Date.now(),
        encryptedBlobBase64: enc.ciphertextBase64,
        ivBase64: enc.ivBase64,
        aadBase64: enc.aadBase64,
        isFavorite: false,
        isTrashed: false,
      };
      const updated = [newItem, ...items];
      storageService.saveVaultItems(updated);
      setItems(updated);
      setNoteTitle('');
      setNoteBody('');
      setShowNoteModal(false);
    } catch (err: any) {
      alert('Failed to save encrypted note: ' + err.message);
    }
  };

  // Preview or Decrypt Item
  const handlePreview = async (item: VaultItem) => {
    if (!item.encryptedBlobBase64 || !item.ivBase64) return;
    setIsDecrypting(true);
    try {
      if (item.category === 'notes') {
        const text = await cryptoVault.decryptText(item.encryptedBlobBase64, item.ivBase64, item.aadBase64);
        setPreviewItem({ item, decryptedContent: text });
      } else {
        const bytes = await cryptoVault.decryptData(item.encryptedBlobBase64, item.ivBase64, item.aadBase64);
        const blob = new Blob([bytes as unknown as BlobPart], { type: item.mimeType });
        const url = URL.createObjectURL(blob);
        setPreviewItem({ item, decryptedContent: url });
      }
    } catch (err: any) {
      alert('Decryption failed: ' + err.message);
    } finally {
      setIsDecrypting(false);
    }
  };

  const handleToggleFavorite = (id: string) => {
    const updated = items.map((i) => (i.id === id ? { ...i, isFavorite: !i.isFavorite } : i));
    storageService.saveVaultItems(updated);
    setItems(updated);
  };

  const handleMoveToTrash = (id: string) => {
    const updated = items.map((i) => (i.id === id ? { ...i, isTrashed: true } : i));
    storageService.saveVaultItems(updated);
    setItems(updated);
  };

  const handleRestoreFromTrash = (id: string) => {
    const updated = items.map((i) => (i.id === id ? { ...i, isTrashed: false } : i));
    storageService.saveVaultItems(updated);
    setItems(updated);
  };

  const handleDeletePermanent = (id: string) => {
    const updated = items.filter((i) => i.id !== id);
    storageService.saveVaultItems(updated);
    setItems(updated);
  };

  // Filter items
  const filteredItems = items.filter((item) => {
    if (currentCategory === 'trash') {
      if (!item.isTrashed) return false;
    } else {
      if (item.isTrashed) return false;
      if (currentCategory !== 'all' && item.category !== currentCategory) return false;
    }
    if (searchQuery.trim()) {
      return item.title.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const totalBytes = items.reduce((acc, curr) => acc + (curr.sizeBytes || 0), 0);
  const totalMb = (totalBytes / (1024 * 1024)).toFixed(2);

  return (
    <div className="fixed inset-0 z-50 bg-[#070b0e] flex flex-col text-slate-100 overflow-hidden animate-in fade-in duration-200">
      {/* Top Bar */}
      <div className="h-14 px-4 md:px-6 bg-[#0a0f12] border-b border-white/5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm md:text-base font-bold text-white flex items-center gap-2">
              <span>{t.vaultTitle}</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                AES-256-GCM
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isUnlocked && (
            <button
              onClick={handleLockNow}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-semibold transition-colors"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{t.lockNow}</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Body */}
      {!isUnlocked ? (
        /* LOCKED / SETUP SCREEN */
        <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
          <div className="max-w-md w-full p-8 rounded-3xl bg-[#0c1317] border border-white/10 shadow-2xl relative">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6 text-emerald-400">
              <Lock className="w-8 h-8" />
            </div>

            <h2 className="text-xl font-bold text-center text-white mb-2">
              {!envelope ? t.setupVault : t.vaultLocked}
            </h2>
            <p className="text-xs text-slate-400 text-center mb-6 leading-relaxed">
              {!envelope
                ? 'Create a Master Password. All keys and data are encrypted client-side using PBKDF2 (100k rounds) & AES-256-GCM envelope encryption.'
                : t.vaultSubtitle}
            </p>

            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-xs text-red-400">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {!envelope ? (
              /* Setup Form */
              <form onSubmit={handleSetupVault} className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1.5">{t.enterPassword}</label>
                  <input
                    type="password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="At least 8 characters..."
                    className="w-full px-3 py-2.5 rounded-xl bg-[#131b20] border border-white/10 focus:border-emerald-500/60 focus:outline-none text-sm text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1.5">{t.confirmPassword}</label>
                  <input
                    type="password"
                    value={confirmPasswordInput}
                    onChange={(e) => setConfirmPasswordInput(e.target.value)}
                    placeholder="Repeat password..."
                    className="w-full px-3 py-2.5 rounded-xl bg-[#131b20] border border-white/10 focus:border-emerald-500/60 focus:outline-none text-sm text-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-black font-semibold text-sm transition-all"
                >
                  {t.setupVault}
                </button>
              </form>
            ) : isRecoveryMode ? (
              /* Recovery Form */
              <form onSubmit={handleUnlockWithRecovery} className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1.5">{t.recoveryKey}</label>
                  <input
                    type="text"
                    value={recoveryKeyInput}
                    onChange={(e) => setRecoveryKeyInput(e.target.value)}
                    placeholder="XXXXX-XXXXX-XXXXX-XXXXX"
                    className="w-full px-3 py-2.5 rounded-xl bg-[#131b20] border border-white/10 focus:border-emerald-500/60 focus:outline-none text-sm text-white font-mono uppercase"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm transition-all"
                >
                  {t.verifyRecoveryKey}
                </button>

                <button
                  type="button"
                  onClick={() => setIsRecoveryMode(false)}
                  className="w-full text-xs text-slate-400 hover:text-white text-center pt-2"
                >
                  Back to Password Unlock
                </button>
              </form>
            ) : (
              /* Unlock Form */
              <form onSubmit={handleUnlock} className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1.5">{t.enterPassword}</label>
                  <input
                    type="password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="••••••••••••"
                    autoFocus
                    className="w-full px-3 py-2.5 rounded-xl bg-[#131b20] border border-white/10 focus:border-emerald-500/60 focus:outline-none text-sm text-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-black font-semibold text-sm transition-all flex items-center justify-center gap-2"
                >
                  <Unlock className="w-4 h-4" />
                  <span>{t.unlockVault}</span>
                </button>

                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => setIsRecoveryMode(true)}
                    className="text-xs text-emerald-400 hover:underline"
                  >
                    Forgot Password? Use Recovery Key
                  </button>
                </div>
              </form>
            )}

            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500">
              <span>{t.autoLockNotice}</span>
              <span className="font-mono text-emerald-400">Zero-Knowledge</span>
            </div>
          </div>
        </div>
      ) : (
        /* UNLOCKED VAULT INTERFACE */
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar Categories */}
          <aside className="w-56 bg-[#090e12] border-r border-white/5 p-4 flex flex-col justify-between shrink-0 hidden md:flex">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 px-3">
                Storage Categories
              </span>

              {[
                { cat: 'all', label: t.allFiles, icon: FolderLock },
                { cat: 'photos', label: t.photos, icon: ImageIcon },
                { cat: 'videos', label: t.videos, icon: Video },
                { cat: 'documents', label: t.documents, icon: FileCode },
                { cat: 'notes', label: t.secureNotes, icon: FileText },
                { cat: 'trash', label: t.trash, icon: Trash2 },
              ].map((item) => {
                const IconComponent = item.icon;
                const active = currentCategory === item.cat;
                return (
                  <button
                    key={item.cat}
                    onClick={() => setCurrentCategory(item.cat as VaultCategory)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                      active
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <IconComponent className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Storage Metric */}
            <div className="p-3 rounded-2xl bg-[#0c1317] border border-white/5 space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t.storageUsed}</span>
              </div>
              <p className="text-xs font-mono text-emerald-400 font-semibold">{totalMb} MB encrypted</p>
              <p className="text-[10px] text-slate-500">{items.length} items preserved</p>
            </div>
          </aside>

          {/* Main Vault Workspace */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Action Bar */}
            <div className="p-4 border-b border-white/5 flex flex-wrap items-center justify-between gap-3 bg-[#0a0f12]">
              <div className="flex items-center gap-2 flex-1 max-w-md">
                <div className="relative w-full">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search encrypted items..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#11181d] border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Upload File Button */}
                <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-black text-xs font-semibold cursor-pointer transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{t.uploadToVault}</span>
                  <input type="file" onChange={handleFileUpload} className="hidden" />
                </label>

                {/* Create Note Button */}
                <button
                  onClick={() => setShowNoteModal(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#131c22] hover:bg-[#18232b] text-slate-200 border border-white/10 text-xs font-semibold transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{t.newSecureNote}</span>
                </button>
              </div>
            </div>

            {/* Display Recovery Key Notice if freshly initialized */}
            {displayedRecoveryKey && (
              <div className="m-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-xs text-amber-300">
                <Info className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold text-amber-200">Your Vault Recovery Key (Save this now!):</p>
                  <p className="font-mono text-sm font-semibold tracking-wider my-1 bg-black/40 p-2 rounded border border-amber-500/30 text-white select-all">
                    {displayedRecoveryKey}
                  </p>
                  <p className="text-[11px] text-amber-300/80">{t.recoveryWarning}</p>
                </div>
                <button
                  onClick={() => setDisplayedRecoveryKey(null)}
                  className="text-amber-400 hover:text-white p-1"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Items Grid */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              {filteredItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500">
                  <FolderLock className="w-12 h-12 mb-3 text-slate-600" />
                  <p className="text-sm font-medium text-slate-400">{t.emptyVault}</p>
                  <p className="text-xs text-slate-600 mt-1">Files are encrypted with AES-256-GCM before write.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {filteredItems.map((item) => (
                    <div
                      key={item.id}
                      className="group p-4 rounded-2xl bg-[#0c1317] border border-white/5 hover:border-emerald-500/30 hover:bg-[#10181d] transition-all flex flex-col justify-between"
                    >
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                          {item.category === 'photos' ? (
                            <ImageIcon className="w-4 h-4" />
                          ) : item.category === 'notes' ? (
                            <FileText className="w-4 h-4" />
                          ) : (
                            <FileCode className="w-4 h-4" />
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleToggleFavorite(item.id)}
                            className={`p-1 rounded hover:bg-white/5 ${item.isFavorite ? 'text-amber-400' : 'text-slate-600'}`}
                          >
                            <Star className="w-3.5 h-3.5 fill-current" />
                          </button>
                          {item.isTrashed ? (
                            <>
                              <button
                                onClick={() => handleRestoreFromTrash(item.id)}
                                title={t.restoreItem}
                                className="p-1 rounded text-emerald-400 hover:bg-emerald-500/10"
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeletePermanent(item.id)}
                                title={t.deletePermanent}
                                className="p-1 rounded text-red-400 hover:bg-red-500/10"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleMoveToTrash(item.id)}
                              title={t.delete}
                              className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-red-500/10"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="mb-3">
                        <h4 className="text-xs font-semibold text-slate-200 truncate">{item.title}</h4>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                          {(item.sizeBytes / 1024).toFixed(1)} KB · {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <button
                        onClick={() => handlePreview(item)}
                        className="w-full py-1.5 rounded-lg bg-white/5 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-300 text-xs font-medium border border-white/5 flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Decrypt & View</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Note Creation Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full p-6 rounded-2xl bg-[#0d1418] border border-white/10 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-400" />
                <span>{t.newSecureNote}</span>
              </h3>
              <button onClick={() => setShowNoteModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1">{t.noteTitle}</label>
              <input
                type="text"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                placeholder="E.g. Bank Wire PINs or Recovery Phrase"
                className="w-full px-3 py-2 rounded-xl bg-[#131b20] border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1">{t.noteContent}</label>
              <textarea
                value={noteBody}
                onChange={(e) => setNoteBody(e.target.value)}
                rows={5}
                placeholder="Write confidential notes..."
                className="w-full px-3 py-2 rounded-xl bg-[#131b20] border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500/50 font-mono"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowNoteModal(false)}
                className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleSaveNote}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-black text-xs font-semibold"
              >
                {t.saveNote}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Decrypted File Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-xl w-full p-6 rounded-2xl bg-[#0d1418] border border-white/10 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white truncate max-w-sm">{previewItem.item.title}</h3>
              </div>
              <button onClick={() => setPreviewItem(null)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 rounded-xl bg-[#080d10] border border-white/5 font-mono text-xs text-slate-200">
              {previewItem.item.category === 'notes' ? (
                <p className="whitespace-pre-wrap leading-relaxed">{previewItem.decryptedContent}</p>
              ) : previewItem.item.category === 'photos' ? (
                <img
                  src={previewItem.decryptedContent}
                  alt={previewItem.item.title}
                  className="max-h-96 mx-auto rounded-lg object-contain"
                />
              ) : (
                <div className="text-center p-6 space-y-3">
                  <FileCode className="w-12 h-12 text-emerald-400 mx-auto" />
                  <p>Binary decrypted successfully into browser memory.</p>
                  <a
                    href={previewItem.decryptedContent}
                    download={previewItem.item.title}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-black font-semibold text-xs"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Plaintext File</span>
                  </a>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-white/5">
              <span>Decrypted using AES-256-GCM Master Key</span>
              <button
                onClick={() => setPreviewItem(null)}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
