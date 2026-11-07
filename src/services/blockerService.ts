/**
 * WAFA Browser Privacy Shield & Content Blocker
 * Inspects URLs and scripts to block advertising domains, fingerprinting, and tracking beacons.
 */

export const KNOWN_TRACKER_DOMAINS = [
  'google-analytics.com',
  'googletagmanager.com',
  'doubleclick.net',
  'facebook.net/signals',
  'connect.facebook.net',
  'analytics.twitter.com',
  'ads.tiktok.com',
  'criteo.com',
  'criteo.net',
  'taboola.com',
  'outbrain.com',
  'adnxs.com',
  'scorecardresearch.com',
  'quantserve.com',
  'hotjar.com',
  'clarity.ms',
  'segment.io',
  'mixpanel.com',
  'branch.io',
  'appsflyer.com',
  'adjust.com',
  'adservice.google.com',
  'pagead2.googlesyndication.com',
  'moatads.com',
  'rubiconproject.com',
  'pubmatic.com',
  'openx.net',
];

export const KNOWN_AD_PATTERNS = [
  /\/ads?\//i,
  /\/ad-banner/i,
  /\/pagead\//i,
  /\/popunder/i,
  /\/advertisement/i,
  /\/sponsor/i,
  /\/tracking\./i,
  /\/beacon\./i,
  /\/telemetry\./i,
  /\/pixel\./i,
];

export interface BlockInspectionResult {
  isBlocked: boolean;
  type: 'ad' | 'tracker' | 'clean';
  matchedRule?: string;
}

export class BlockerService {
  private static instance: BlockerService;
  private allowlistedDomains: Set<string> = new Set();
  private blocklistedDomains: Set<string> = new Set();

  private constructor() {
    this.loadPersistedLists();
  }

  public static getInstance(): BlockerService {
    if (!BlockerService.instance) {
      BlockerService.instance = new BlockerService();
    }
    return BlockerService.instance;
  }

  private loadPersistedLists() {
    try {
      const allowed = localStorage.getItem('wafa_shield_allowlist');
      if (allowed) this.allowlistedDomains = new Set(JSON.parse(allowed));
      const blocked = localStorage.getItem('wafa_shield_blocklist');
      if (blocked) this.blocklistedDomains = new Set(JSON.parse(blocked));
    } catch {
      // fallback
    }
  }

  private saveLists() {
    try {
      localStorage.setItem('wafa_shield_allowlist', JSON.stringify(Array.from(this.allowlistedDomains)));
      localStorage.setItem('wafa_shield_blocklist', JSON.stringify(Array.from(this.blocklistedDomains)));
    } catch {
      // fallback
    }
  }

  public isAllowlisted(domain: string): boolean {
    const cleanDomain = domain.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
    return this.allowlistedDomains.has(cleanDomain);
  }

  public toggleAllowlist(domain: string): boolean {
    const cleanDomain = domain.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
    if (this.allowlistedDomains.has(cleanDomain)) {
      this.allowlistedDomains.delete(cleanDomain);
    } else {
      this.allowlistedDomains.add(cleanDomain);
    }
    this.saveLists();
    return this.allowlistedDomains.has(cleanDomain);
  }

  public inspectResource(url: string, pageDomain?: string): BlockInspectionResult {
    if (pageDomain && this.isAllowlisted(pageDomain)) {
      return { isBlocked: false, type: 'clean' };
    }

    const lowerUrl = url.toLowerCase();

    // Check manual blocklist
    for (const blocked of this.blocklistedDomains) {
      if (lowerUrl.includes(blocked)) {
        return { isBlocked: true, type: 'tracker', matchedRule: `User Rule: ${blocked}` };
      }
    }

    // Check tracker domains
    for (const domain of KNOWN_TRACKER_DOMAINS) {
      if (lowerUrl.includes(domain)) {
        return { isBlocked: true, type: 'tracker', matchedRule: domain };
      }
    }

    // Check ad regex patterns
    for (const pattern of KNOWN_AD_PATTERNS) {
      if (pattern.test(lowerUrl)) {
        return { isBlocked: true, type: 'ad', matchedRule: pattern.source };
      }
    }

    return { isBlocked: false, type: 'clean' };
  }

  public simulatePageShield(url: string): { trackersCount: number; adsCount: number } {
    if (this.isAllowlisted(url)) {
      return { trackersCount: 0, adsCount: 0 };
    }

    // Deterministic simulation based on URL hash to give realistic, consistent metrics
    let hash = 0;
    for (let i = 0; i < url.length; i++) {
      hash = (hash << 5) - hash + url.charCodeAt(i);
      hash |= 0;
    }
    const absHash = Math.abs(hash);
    const trackersCount = 2 + (absHash % 7);
    const adsCount = 1 + ((absHash >> 3) % 5);

    return { trackersCount, adsCount };
  }
}

export const blockerService = BlockerService.getInstance();
