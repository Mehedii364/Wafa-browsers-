export type SearchEngine = 'google' | 'duckduckgo' | 'bing' | 'startpage';

export type Language = 'en' | 'bn';

export interface BrowserTab {
  id: string;
  url: string;
  title: string;
  favicon?: string;
  isLoading: boolean;
  canGoBack: boolean;
  canGoForward: boolean;
  isPinned: boolean;
  isSuspended: boolean;
  lastActiveTime: number;
  groupId?: string;
  desktopMode: boolean;
  readerMode: boolean;
  shieldActive: boolean;
  trackersBlocked: number;
  adsBlocked: number;
}

export interface TabGroup {
  id: string;
  name: string;
  color: string;
}

export interface Bookmark {
  id: string;
  url: string;
  title: string;
  folder: string;
  createdAt: number;
  favicon?: string;
}

export interface HistoryItem {
  id: string;
  url: string;
  title: string;
  visitedAt: number;
  visitCount: number;
}

export interface DownloadItem {
  id: string;
  filename: string;
  url: string;
  fileSize: number;
  downloadedBytes: number;
  status: 'downloading' | 'paused' | 'completed' | 'failed';
  mimeType: string;
  startedAt: number;
  savedToVault?: boolean;
}

export type VaultCategory = 'all' | 'photos' | 'videos' | 'documents' | 'pdfs' | 'notes' | 'bookmarks' | 'trash';

export interface VaultItem {
  id: string;
  title: string;
  category: VaultCategory;
  mimeType: string;
  sizeBytes: number;
  createdAt: number;
  encryptedBlobBase64?: string; // encrypted payload
  ivBase64?: string;
  aadBase64?: string;
  isFavorite: boolean;
  isTrashed: boolean;
  notes?: string;
  metadata?: Record<string, string>;
}

export interface EncryptedCredential {
  id: string;
  title: string;
  website: string;
  username: string;
  encryptedPasswordBase64: string;
  ivBase64: string;
  category: string;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface OfflinePage {
  id: string;
  url: string;
  title: string;
  htmlContent: string;
  textContent: string;
  savedAt: number;
  category: string;
  readProgress: number; // 0 to 100
}

export interface ShieldStats {
  totalAdsBlocked: number;
  totalTrackersBlocked: number;
  totalHttpsUpgrades: number;
  totalBandwidthSavedKb: number;
}

export interface SitePermission {
  domain: string;
  camera: 'allow' | 'block' | 'ask';
  microphone: 'allow' | 'block' | 'ask';
  geolocation: 'allow' | 'block' | 'ask';
  notifications: 'allow' | 'block' | 'ask';
  shields: boolean;
}
