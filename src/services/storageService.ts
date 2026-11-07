import {
  Bookmark,
  BrowserTab,
  DownloadItem,
  EncryptedCredential,
  HistoryItem,
  Language,
  OfflinePage,
  SearchEngine,
  ShieldStats,
  TabGroup,
  VaultItem,
} from '../types/browser';
import { EncryptedEnvelope } from '../security/cryptoVault';

const STORAGE_KEYS = {
  TABS: 'wafa_tabs',
  TAB_GROUPS: 'wafa_tab_groups',
  ACTIVE_TAB_ID: 'wafa_active_tab_id',
  BOOKMARKS: 'wafa_bookmarks',
  HISTORY: 'wafa_history',
  DOWNLOADS: 'wafa_downloads',
  VAULT_ENVELOPE: 'wafa_vault_envelope',
  VAULT_RECOVERY_ENVELOPE: 'wafa_vault_recovery_envelope',
  VAULT_ITEMS: 'wafa_vault_items',
  CREDENTIALS: 'wafa_credentials',
  OFFLINE_PAGES: 'wafa_offline_pages',
  SHIELD_STATS: 'wafa_shield_stats',
  LANGUAGE: 'wafa_lang',
  SEARCH_ENGINE: 'wafa_search_engine',
  LOW_RAM_MODE: 'wafa_low_ram_mode',
  TAB_LIMIT: 'wafa_tab_limit',
};

// Initial default bookmarks
const DEFAULT_BOOKMARKS: Bookmark[] = [
  { id: 'bm-1', title: 'Google', url: 'https://www.google.com', folder: 'Search', createdAt: Date.now() - 500000 },
  { id: 'bm-2', title: 'DuckDuckGo', url: 'https://duckduckgo.com', folder: 'Search', createdAt: Date.now() - 400000 },
  { id: 'bm-3', title: 'Wikipedia', url: 'https://en.wikipedia.org', folder: 'Knowledge', createdAt: Date.now() - 300000 },
  { id: 'bm-4', title: 'GitHub', url: 'https://github.com', folder: 'Dev', createdAt: Date.now() - 200000 },
  { id: 'bm-5', title: 'Prothom Alo', url: 'https://www.prothomalo.com', folder: 'News', createdAt: Date.now() - 100000 },
];

export class StorageService {
  private static instance: StorageService;

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  // --- TABS ---
  public getTabs(): BrowserTab[] {
    const raw = localStorage.getItem(STORAGE_KEYS.TABS);
    if (!raw) {
      const defaultTab: BrowserTab = {
        id: 'tab-default',
        url: 'https://duckduckgo.com',
        title: 'DuckDuckGo — Privacy, simplified.',
        isLoading: false,
        canGoBack: false,
        canGoForward: false,
        isPinned: false,
        isSuspended: false,
        lastActiveTime: Date.now(),
        desktopMode: false,
        readerMode: false,
        shieldActive: true,
        trackersBlocked: 4,
        adsBlocked: 2,
      };
      this.saveTabs([defaultTab]);
      return [defaultTab];
    }
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  public saveTabs(tabs: BrowserTab[]): void {
    localStorage.setItem(STORAGE_KEYS.TABS, JSON.stringify(tabs));
  }

  public getActiveTabId(): string {
    const id = localStorage.getItem(STORAGE_KEYS.ACTIVE_TAB_ID);
    if (id) return id;
    const tabs = this.getTabs();
    return tabs[0]?.id || 'tab-default';
  }

  public setActiveTabId(id: string): void {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_TAB_ID, id);
  }

  public getTabGroups(): TabGroup[] {
    const raw = localStorage.getItem(STORAGE_KEYS.TAB_GROUPS);
    if (!raw) {
      const defaults: TabGroup[] = [
        { id: 'grp-work', name: 'Work', color: '#10b981' },
        { id: 'grp-personal', name: 'Personal', color: '#f59e0b' },
      ];
      this.saveTabGroups(defaults);
      return defaults;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  public saveTabGroups(groups: TabGroup[]): void {
    localStorage.setItem(STORAGE_KEYS.TAB_GROUPS, JSON.stringify(groups));
  }

  // --- BOOKMARKS ---
  public getBookmarks(): Bookmark[] {
    const raw = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
    if (!raw) {
      this.saveBookmarks(DEFAULT_BOOKMARKS);
      return DEFAULT_BOOKMARKS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_BOOKMARKS;
    }
  }

  public saveBookmarks(bms: Bookmark[]): void {
    localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bms));
  }

  // --- HISTORY ---
  public getHistory(): HistoryItem[] {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (!raw) {
      const defaults: HistoryItem[] = [
        { id: 'h-1', title: 'DuckDuckGo — Privacy, simplified.', url: 'https://duckduckgo.com', visitedAt: Date.now() - 3600000, visitCount: 5 },
        { id: 'h-2', title: 'GitHub: Mehedi364 / WAFA Browser', url: 'https://github.com/Mehedi364', visitedAt: Date.now() - 7200000, visitCount: 3 },
      ];
      this.saveHistory(defaults);
      return defaults;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  public saveHistory(history: HistoryItem[]): void {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
  }

  public addHistoryEntry(url: string, title: string): void {
    const history = this.getHistory();
    const existingIndex = history.findIndex((h) => h.url === url);
    if (existingIndex >= 0) {
      history[existingIndex].visitedAt = Date.now();
      history[existingIndex].visitCount += 1;
      history[existingIndex].title = title || history[existingIndex].title;
    } else {
      history.unshift({
        id: 'hist-' + Date.now(),
        url,
        title: title || url,
        visitedAt: Date.now(),
        visitCount: 1,
      });
    }
    // Limit to 500 items
    if (history.length > 500) history.pop();
    this.saveHistory(history);
  }

  // --- DOWNLOADS ---
  public getDownloads(): DownloadItem[] {
    const raw = localStorage.getItem(STORAGE_KEYS.DOWNLOADS);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  public saveDownloads(downloads: DownloadItem[]): void {
    localStorage.setItem(STORAGE_KEYS.DOWNLOADS, JSON.stringify(downloads));
  }

  // --- VAULT ENVELOPE ---
  public getVaultEnvelope(): EncryptedEnvelope | null {
    const raw = localStorage.getItem(STORAGE_KEYS.VAULT_ENVELOPE);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  public saveVaultEnvelope(envelope: EncryptedEnvelope): void {
    localStorage.setItem(STORAGE_KEYS.VAULT_ENVELOPE, JSON.stringify(envelope));
  }

  public getVaultRecoveryEnvelope(): EncryptedEnvelope | null {
    const raw = localStorage.getItem(STORAGE_KEYS.VAULT_RECOVERY_ENVELOPE);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  public saveVaultRecoveryEnvelope(envelope: EncryptedEnvelope): void {
    localStorage.setItem(STORAGE_KEYS.VAULT_RECOVERY_ENVELOPE, JSON.stringify(envelope));
  }

  // --- VAULT ITEMS ---
  public getVaultItems(): VaultItem[] {
    const raw = localStorage.getItem(STORAGE_KEYS.VAULT_ITEMS);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  public saveVaultItems(items: VaultItem[]): void {
    localStorage.setItem(STORAGE_KEYS.VAULT_ITEMS, JSON.stringify(items));
  }

  // --- PASSWORDS ---
  public getCredentials(): EncryptedCredential[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CREDENTIALS);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  public saveCredentials(creds: EncryptedCredential[]): void {
    localStorage.setItem(STORAGE_KEYS.CREDENTIALS, JSON.stringify(creds));
  }

  // --- OFFLINE PAGES ---
  public getOfflinePages(): OfflinePage[] {
    const raw = localStorage.getItem(STORAGE_KEYS.OFFLINE_PAGES);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  public saveOfflinePages(pages: OfflinePage[]): void {
    localStorage.setItem(STORAGE_KEYS.OFFLINE_PAGES, JSON.stringify(pages));
  }

  // --- SHIELD STATS ---
  public getShieldStats(): ShieldStats {
    const raw = localStorage.getItem(STORAGE_KEYS.SHIELD_STATS);
    if (!raw) {
      const initial: ShieldStats = {
        totalAdsBlocked: 42,
        totalTrackersBlocked: 118,
        totalHttpsUpgrades: 35,
        totalBandwidthSavedKb: 4820,
      };
      this.saveShieldStats(initial);
      return initial;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return { totalAdsBlocked: 0, totalTrackersBlocked: 0, totalHttpsUpgrades: 0, totalBandwidthSavedKb: 0 };
    }
  }

  public saveShieldStats(stats: ShieldStats): void {
    localStorage.setItem(STORAGE_KEYS.SHIELD_STATS, JSON.stringify(stats));
  }

  public recordBlockedEvents(adsCount: number, trackersCount: number): void {
    const stats = this.getShieldStats();
    stats.totalAdsBlocked += adsCount;
    stats.totalTrackersBlocked += trackersCount;
    stats.totalBandwidthSavedKb += Math.round(adsCount * 140 + trackersCount * 30);
    this.saveShieldStats(stats);
  }

  // --- SETTINGS ---
  public getLanguage(): Language {
    return (localStorage.getItem(STORAGE_KEYS.LANGUAGE) as Language) || 'en';
  }

  public setLanguage(lang: Language): void {
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
  }

  public getSearchEngine(): SearchEngine {
    return (localStorage.getItem(STORAGE_KEYS.SEARCH_ENGINE) as SearchEngine) || 'duckduckgo';
  }

  public setSearchEngine(engine: SearchEngine): void {
    localStorage.setItem(STORAGE_KEYS.SEARCH_ENGINE, engine);
  }

  public getLowRamMode(): boolean {
    return localStorage.getItem(STORAGE_KEYS.LOW_RAM_MODE) === 'true';
  }

  public setLowRamMode(enabled: boolean): void {
    localStorage.setItem(STORAGE_KEYS.LOW_RAM_MODE, String(enabled));
  }

  public clearAllBrowsingData(): void {
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
    localStorage.removeItem(STORAGE_KEYS.OFFLINE_PAGES);
    // Keep active tabs but reset state
    const currentTabs = this.getTabs();
    if (currentTabs.length > 0) {
      this.saveTabs([
        {
          id: 'tab-1',
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
        },
      ]);
    }
  }
}

export const storageService = StorageService.getInstance();
