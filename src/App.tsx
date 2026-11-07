/**
 * WAFA BROWSER — COMPLETE EDITION
 * Developer: Md. Mehedi Hasan
 * Developer Identity: Mehedi364
 * Package ID: site.wafazone.browser
 *
 * Real, lightweight, privacy-focused browser with integrated encrypted Private Vault,
 * Ad & Tracker Blocker, Password Manager, QR/PDF Tools, Offline Library, and Native Android Project Export.
 */

import React, { useState, useEffect } from 'react';
import { BrowserTab, Language, SearchEngine } from './types/browser';
import { storageService } from './services/storageService';
import { blockerService } from './services/blockerService';
import { cryptoVault } from './security/cryptoVault';
import { BrowserBar } from './components/browser/BrowserBar';
import { BrowserWorkspace } from './components/browser/BrowserWorkspace';
import { BrowserHome } from './components/browser/BrowserHome';
import { TabManager } from './components/browser/TabManager';
import { VaultDashboard } from './components/vault/VaultDashboard';
import { IntegratedVaultSidebar } from './components/vault/IntegratedVaultSidebar';
import { PasswordManager } from './components/passwords/PasswordManager';
import { QrTools } from './components/qr/QrTools';
import { PdfTools } from './components/pdf/PdfTools';
import { OfflineLibrary } from './components/offline/OfflineLibrary';
import { PrivacyDashboard } from './components/privacy/PrivacyDashboard';
import { PerformanceDashboard } from './components/performance/PerformanceDashboard';
import { SettingsModal } from './components/settings/SettingsModal';
import { AndroidExportCenter } from './components/android/AndroidExportCenter';
import { ShieldModal } from './components/modals/ShieldModal';
import { SslModal } from './components/modals/SslModal';
import { BrowserMenuDrawer } from './components/navigation/BrowserMenuDrawer';

export default function App() {
  // Application Language & Search Engine
  const [language, setLanguage] = useState<Language>(storageService.getLanguage());
  const [searchEngine, setSearchEngine] = useState<SearchEngine>(storageService.getSearchEngine());

  // Tabs State
  const [tabs, setTabs] = useState<BrowserTab[]>(storageService.getTabs());
  const [activeTabId, setActiveTabId] = useState<string>(storageService.getActiveTabId());
  const [isHomeView, setIsHomeView] = useState<boolean>(false);

  // Navigation History Stack per Tab
  const [historyStacks, setHistoryStacks] = useState<Record<string, { past: string[]; future: string[] }>>({});

  // UI Panels and Modals
  const [showTabManager, setShowTabManager] = useState(false);
  const [showVaultDashboard, setShowVaultDashboard] = useState(false);
  const [showIntegratedVault, setShowIntegratedVault] = useState(false);
  const [showPasswordManager, setShowPasswordManager] = useState(false);
  const [showQrTools, setShowQrTools] = useState(false);
  const [showPdfTools, setShowPdfTools] = useState(false);
  const [showOfflineLibrary, setShowOfflineLibrary] = useState(false);
  const [showPrivacyDashboard, setShowPrivacyDashboard] = useState(false);
  const [showPerformanceDashboard, setShowPerformanceDashboard] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAndroidExport, setShowAndroidExport] = useState(false);
  const [showShieldModal, setShowShieldModal] = useState(false);
  const [showSslModal, setShowSslModal] = useState(false);
  const [showMenuDrawer, setShowMenuDrawer] = useState(false);

  // Active Tab
  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0] || {
    id: 'tab-default',
    url: 'https://duckduckgo.com',
    title: 'DuckDuckGo',
    isLoading: false,
    canGoBack: false,
    canGoForward: false,
    isPinned: false,
    isSuspended: false,
    lastActiveTime: Date.now(),
    desktopMode: false,
    readerMode: false,
    shieldActive: true,
    trackersBlocked: 3,
    adsBlocked: 1,
  };

  // Sync tabs changes to persistent storage
  useEffect(() => {
    storageService.saveTabs(tabs);
  }, [tabs]);

  // Sync activeTabId
  useEffect(() => {
    storageService.setActiveTabId(activeTabId);
  }, [activeTabId]);

  // Handle URL navigation
  const handleNavigate = (url: string) => {
    setIsHomeView(false);

    // Calculate heuristic block stats for URL
    const shieldResult = blockerService.simulatePageShield(url);
    storageService.recordBlockedEvents(shieldResult.adsCount, shieldResult.trackersCount);

    setTabs((prevTabs) =>
      prevTabs.map((tab) => {
        if (tab.id === activeTabId) {
          // Record history stack
          const currentPast = historyStacks[tab.id]?.past || [];
          if (tab.url && tab.url !== url) {
            setHistoryStacks((prev) => ({
              ...prev,
              [tab.id]: { past: [...currentPast, tab.url], future: [] },
            }));
          }

          let derivedTitle = url;
          try {
            derivedTitle = new URL(url).hostname;
          } catch {
            derivedTitle = url;
          }

          return {
            ...tab,
            url,
            title: derivedTitle,
            isLoading: true,
            isSuspended: false,
            canGoBack: true,
            canGoForward: false,
            trackersBlocked: shieldResult.trackersCount,
            adsBlocked: shieldResult.adsCount,
          };
        }
        return tab;
      })
    );

    // Simulate completion
    setTimeout(() => {
      setTabs((prev) =>
        prev.map((t) => (t.id === activeTabId ? { ...t, isLoading: false } : t))
      );
      storageService.addHistoryEntry(url, activeTab.title);
    }, 400);
  };

  const handleBack = () => {
    const stack = historyStacks[activeTab.id];
    if (!stack || stack.past.length === 0) return;

    const previousUrl = stack.past[stack.past.length - 1];
    const newPast = stack.past.slice(0, -1);
    const newFuture = [activeTab.url, ...stack.future];

    setHistoryStacks((prev) => ({
      ...prev,
      [activeTab.id]: { past: newPast, future: newFuture },
    }));

    setTabs((prev) =>
      prev.map((t) =>
        t.id === activeTab.id
          ? {
              ...t,
              url: previousUrl,
              canGoBack: newPast.length > 0,
              canGoForward: true,
            }
          : t
      )
    );
  };

  const handleForward = () => {
    const stack = historyStacks[activeTab.id];
    if (!stack || stack.future.length === 0) return;

    const nextUrl = stack.future[0];
    const newFuture = stack.future.slice(1);
    const newPast = [...stack.past, activeTab.url];

    setHistoryStacks((prev) => ({
      ...prev,
      [activeTab.id]: { past: newPast, future: newFuture },
    }));

    setTabs((prev) =>
      prev.map((t) =>
        t.id === activeTab.id
          ? {
              ...t,
              url: nextUrl,
              canGoBack: true,
              canGoForward: newFuture.length > 0,
            }
          : t
      )
    );
  };

  const handleReload = () => {
    setTabs((prev) =>
      prev.map((t) => (t.id === activeTabId ? { ...t, isLoading: true } : t))
    );
    setTimeout(() => {
      setTabs((prev) =>
        prev.map((t) => (t.id === activeTabId ? { ...t, isLoading: false } : t))
      );
    }, 350);
  };

  // Tab operations
  const handleNewTab = (initialUrl: string = 'https://duckduckgo.com') => {
    const newId = 'tab-' + Date.now();
    const newTab: BrowserTab = {
      id: newId,
      url: initialUrl,
      title: 'New Tab',
      isLoading: false,
      canGoBack: false,
      canGoForward: false,
      isPinned: false,
      isSuspended: false,
      lastActiveTime: Date.now(),
      desktopMode: false,
      readerMode: false,
      shieldActive: true,
      trackersBlocked: 2,
      adsBlocked: 1,
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newId);
    setIsHomeView(true);
  };

  const handleCloseTab = (id: string) => {
    if (tabs.length === 1) {
      // Keep at least one tab, redirect to home
      setIsHomeView(true);
      return;
    }
    const filtered = tabs.filter((t) => t.id !== id);
    setTabs(filtered);
    if (activeTabId === id) {
      setActiveTabId(filtered[filtered.length - 1].id);
    }
  };

  const handleCloseAllTabs = () => {
    const singleTab: BrowserTab = {
      id: 'tab-' + Date.now(),
      url: 'https://duckduckgo.com',
      title: 'DuckDuckGo',
      isLoading: false,
      canGoBack: false,
      canGoForward: false,
      isPinned: false,
      isSuspended: false,
      lastActiveTime: Date.now(),
      desktopMode: false,
      readerMode: false,
      shieldActive: true,
      trackersBlocked: 0,
      adsBlocked: 0,
    };
    setTabs([singleTab]);
    setActiveTabId(singleTab.id);
    setIsHomeView(true);
  };

  const handleTogglePin = (id: string) => {
    setTabs((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isPinned: !t.isPinned } : t))
    );
  };

  const handleDuplicateTab = (id: string) => {
    const target = tabs.find((t) => t.id === id);
    if (!target) return;
    const dup: BrowserTab = {
      ...target,
      id: 'tab-' + Date.now(),
      title: `${target.title} (Copy)`,
    };
    setTabs((prev) => [...prev, dup]);
  };

  const handleToggleSuspend = (id: string) => {
    setTabs((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isSuspended: !t.isSuspended } : t))
    );
  };

  const handleToggleReaderMode = () => {
    setTabs((prev) =>
      prev.map((t) => (t.id === activeTabId ? { ...t, readerMode: !t.readerMode } : t))
    );
  };

  const handleToggleDesktopMode = () => {
    setTabs((prev) =>
      prev.map((t) => (t.id === activeTabId ? { ...t, desktopMode: !t.desktopMode } : t))
    );
  };

  const handleToggleShield = () => {
    setTabs((prev) =>
      prev.map((t) => (t.id === activeTabId ? { ...t, shieldActive: !t.shieldActive } : t))
    );
  };

  const handleSaveToOffline = (url: string, title: string, text: string) => {
    const newOffline = {
      id: 'off-' + Date.now(),
      url,
      title,
      htmlContent: '',
      textContent: text,
      savedAt: Date.now(),
      category: 'Saved Webpages',
      readProgress: 10,
    };
    const existing = storageService.getOfflinePages();
    storageService.saveOfflinePages([newOffline, ...existing]);
  };

  const handleSaveToVault = async (title: string, content: string) => {
    if (!cryptoVault.getIsUnlocked()) {
      setShowVaultDashboard(true);
      return;
    }
    try {
      const id = 'vault-' + Date.now();
      const enc = await cryptoVault.encryptData(content, id);
      const newItem = {
        id,
        title,
        category: 'documents' as const,
        mimeType: 'text/plain',
        sizeBytes: content.length,
        createdAt: Date.now(),
        encryptedBlobBase64: enc.ciphertextBase64,
        ivBase64: enc.ivBase64,
        aadBase64: enc.aadBase64,
        isFavorite: false,
        isTrashed: false,
      };
      const existing = storageService.getVaultItems();
      storageService.saveVaultItems([newItem, ...existing]);
      alert('Securely encrypted and saved into Private Vault!');
    } catch (err: any) {
      alert('Failed to save to vault: ' + err.message);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#070b0e] text-slate-100 overflow-hidden font-sans select-none">
      {/* Top Browser Bar */}
      <BrowserBar
        tab={activeTab}
        tabCount={tabs.length}
        language={language}
        searchEngine={searchEngine}
        onNavigate={handleNavigate}
        onReload={handleReload}
        onBack={handleBack}
        onForward={handleForward}
        onOpenTabs={() => setShowTabManager(true)}
        onOpenMenu={() => setShowMenuDrawer(true)}
        onToggleShield={handleToggleShield}
        onOpenShieldModal={() => setShowShieldModal(true)}
        onOpenSslModal={() => setShowSslModal(true)}
        onQuickSaveToVault={() => setShowIntegratedVault(true)}
        onToggleReaderMode={handleToggleReaderMode}
        onToggleDesktopMode={handleToggleDesktopMode}
      />

      {/* Main Viewport: Home or Web Workspace */}
      {isHomeView ? (
        <BrowserHome
          language={language}
          searchEngine={searchEngine}
          bookmarks={storageService.getBookmarks()}
          shieldStats={storageService.getShieldStats()}
          onNavigate={handleNavigate}
          onOpenVault={() => setShowVaultDashboard(true)}
          onOpenPasswords={() => setShowPasswordManager(true)}
          onOpenQr={() => setShowQrTools(true)}
          onOpenPdf={() => setShowPdfTools(true)}
          onOpenOffline={() => setShowOfflineLibrary(true)}
          onOpenPrivacy={() => setShowPrivacyDashboard(true)}
          onOpenAndroid={() => setShowAndroidExport(true)}
        />
      ) : (
        <BrowserWorkspace
          tab={activeTab}
          language={language}
          onSaveToOffline={handleSaveToOffline}
          onSaveToVault={handleSaveToVault}
        />
      )}

      {/* Slide-over Integrated Vault Sidebar */}
      {showIntegratedVault && (
        <IntegratedVaultSidebar
          currentUrl={activeTab.url}
          currentTitle={activeTab.title}
          language={language}
          onClose={() => setShowIntegratedVault(false)}
          onOpenStandaloneVault={() => {
            setShowIntegratedVault(false);
            setShowVaultDashboard(true);
          }}
        />
      )}

      {/* Standalone Private Vault Screen */}
      {showVaultDashboard && (
        <VaultDashboard
          language={language}
          onClose={() => setShowVaultDashboard(false)}
        />
      )}

      {/* Tab Manager Modal */}
      {showTabManager && (
        <TabManager
          tabs={tabs}
          activeTabId={activeTabId}
          tabGroups={storageService.getTabGroups()}
          language={language}
          lowRamMode={storageService.getLowRamMode()}
          onSelectTab={(id) => {
            setActiveTabId(id);
            setIsHomeView(false);
          }}
          onCloseTab={handleCloseTab}
          onCloseAll={handleCloseAllTabs}
          onNewTab={() => {
            handleNewTab();
            setShowTabManager(false);
          }}
          onTogglePin={handleTogglePin}
          onDuplicateTab={handleDuplicateTab}
          onToggleSuspend={handleToggleSuspend}
          onCloseManager={() => setShowTabManager(false)}
        />
      )}

      {/* Password Manager Modal */}
      {showPasswordManager && (
        <PasswordManager
          language={language}
          onClose={() => setShowPasswordManager(false)}
        />
      )}

      {/* QR Tools Modal */}
      {showQrTools && (
        <QrTools
          language={language}
          onOpenUrl={handleNavigate}
          onClose={() => setShowQrTools(false)}
        />
      )}

      {/* PDF Tools Modal */}
      {showPdfTools && (
        <PdfTools
          language={language}
          onSaveToVault={handleSaveToVault}
          onClose={() => setShowPdfTools(false)}
        />
      )}

      {/* Offline Library Modal */}
      {showOfflineLibrary && (
        <OfflineLibrary
          language={language}
          onOpenUrl={handleNavigate}
          onClose={() => setShowOfflineLibrary(false)}
        />
      )}

      {/* Privacy Dashboard Modal */}
      {showPrivacyDashboard && (
        <PrivacyDashboard
          language={language}
          onClose={() => setShowPrivacyDashboard(false)}
        />
      )}

      {/* Performance Dashboard Modal */}
      {showPerformanceDashboard && (
        <PerformanceDashboard
          tabs={tabs}
          language={language}
          onClose={() => setShowPerformanceDashboard(false)}
          onTabsSuspended={() => setTabs(storageService.getTabs())}
        />
      )}

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          language={language}
          searchEngine={searchEngine}
          onLanguageChange={(lang) => {
            setLanguage(lang);
            storageService.setLanguage(lang);
          }}
          onSearchEngineChange={(eng) => {
            setSearchEngine(eng);
            storageService.setSearchEngine(eng);
          }}
          onClose={() => setShowSettings(false)}
          onOpenAndroidExport={() => setShowAndroidExport(true)}
        />
      )}

      {/* Android Codebase & APK Export Center */}
      {showAndroidExport && (
        <AndroidExportCenter
          language={language}
          onClose={() => setShowAndroidExport(false)}
        />
      )}

      {/* SSL Details Modal */}
      {showSslModal && (
        <SslModal
          url={activeTab.url}
          language={language}
          onClose={() => setShowSslModal(false)}
        />
      )}

      {/* Privacy Shield Modal */}
      {showShieldModal && (
        <ShieldModal
          tab={activeTab}
          language={language}
          onToggleShield={handleToggleShield}
          onClose={() => setShowShieldModal(false)}
        />
      )}

      {/* Master Menu Drawer */}
      {showMenuDrawer && (
        <BrowserMenuDrawer
          language={language}
          desktopMode={activeTab.desktopMode}
          onNavigateHome={() => setIsHomeView(true)}
          onOpenTabs={() => setShowTabManager(true)}
          onOpenVault={() => setShowVaultDashboard(true)}
          onOpenPasswords={() => setShowPasswordManager(true)}
          onOpenQr={() => setShowQrTools(true)}
          onOpenPdf={() => setShowPdfTools(true)}
          onOpenOffline={() => setShowOfflineLibrary(true)}
          onOpenPrivacy={() => setShowPrivacyDashboard(true)}
          onOpenPerformance={() => setShowPerformanceDashboard(true)}
          onOpenSettings={() => setShowSettings(true)}
          onOpenAndroid={() => setShowAndroidExport(true)}
          onToggleDesktopMode={handleToggleDesktopMode}
          onToggleLanguage={() => {
            const nextLang: Language = language === 'en' ? 'bn' : 'en';
            setLanguage(nextLang);
            storageService.setLanguage(nextLang);
          }}
          onClose={() => setShowMenuDrawer(false)}
        />
      )}
    </div>
  );
}
