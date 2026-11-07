import React from 'react';
import {
  Home,
  Layers,
  Bookmark,
  Download,
  Lock,
  Key,
  QrCode,
  FileText,
  BookOpen,
  Shield,
  Cpu,
  Settings,
  Smartphone,
  Languages,
  X,
  Share2,
  Copy,
  ChevronRight,
  Monitor,
  Smartphone as PhoneIcon,
} from 'lucide-react';
import { Language } from '../../types/browser';
import { translations } from '../../i18n/translations';

interface BrowserMenuDrawerProps {
  language: Language;
  desktopMode: boolean;
  onNavigateHome: () => void;
  onOpenTabs: () => void;
  onOpenVault: () => void;
  onOpenPasswords: () => void;
  onOpenQr: () => void;
  onOpenPdf: () => void;
  onOpenOffline: () => void;
  onOpenPrivacy: () => void;
  onOpenPerformance: () => void;
  onOpenSettings: () => void;
  onOpenAndroid: () => void;
  onToggleDesktopMode: () => void;
  onToggleLanguage: () => void;
  onClose: () => void;
}

interface MenuItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  highlight?: boolean;
  badge?: string;
}

interface MenuSection {
  group: string;
  items: MenuItem[];
}

export const BrowserMenuDrawer: React.FC<BrowserMenuDrawerProps> = ({
  language,
  desktopMode,
  onNavigateHome,
  onOpenTabs,
  onOpenVault,
  onOpenPasswords,
  onOpenQr,
  onOpenPdf,
  onOpenOffline,
  onOpenPrivacy,
  onOpenPerformance,
  onOpenSettings,
  onOpenAndroid,
  onToggleDesktopMode,
  onToggleLanguage,
  onClose,
}) => {
  const t = translations[language];

  const menuSections: MenuSection[] = [
    {
      group: 'Browsing & Tabs',
      items: [
        { label: t.home, icon: Home, action: onNavigateHome },
        { label: t.tabs, icon: Layers, action: onOpenTabs },
        {
          label: desktopMode ? t.mobileMode : t.desktopMode,
          icon: desktopMode ? PhoneIcon : Monitor,
          action: onToggleDesktopMode,
        },
      ],
    },
    {
      group: 'Security & Private Vault',
      items: [
        { label: t.vault, icon: Lock, action: onOpenVault, highlight: true },
        { label: t.passwords, icon: Key, action: onOpenPasswords },
        { label: t.privacy, icon: Shield, action: onOpenPrivacy },
      ],
    },
    {
      group: 'Productivity & Utilities',
      items: [
        { label: t.qrTools, icon: QrCode, action: onOpenQr },
        { label: t.pdfTools, icon: FileText, action: onOpenPdf },
        { label: t.offline, icon: BookOpen, action: onOpenOffline },
        { label: t.performance, icon: Cpu, action: onOpenPerformance },
      ],
    },
    {
      group: 'System & Codebase',
      items: [
        { label: t.androidCode, icon: Smartphone, action: onOpenAndroid, badge: 'Kotlin' },
        { label: t.settings, icon: Settings, action: onOpenSettings },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end animate-in fade-in duration-150">
      <div className="w-80 h-full bg-[#0a0f12] border-l border-white/10 flex flex-col p-4 shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
          <div>
            <h3 className="text-sm font-bold text-white">{t.appName}</h3>
            <p className="text-[11px] text-emerald-400 font-mono">{t.appEdition}</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Language Toggle */}
        <div className="py-3 border-b border-white/10 shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <Languages className="w-4 h-4 text-emerald-400" />
            <span>Language: {language === 'en' ? 'English' : 'বাংলা'}</span>
          </div>
          <button
            onClick={onToggleLanguage}
            className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-semibold transition-colors"
          >
            {language === 'en' ? 'বাংলা' : 'English'}
          </button>
        </div>

        {/* Menu Groups */}
        <div className="flex-1 space-y-5 py-3">
          {menuSections.map((sec) => (
            <div key={sec.group} className="space-y-1">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider px-2">
                {sec.group}
              </span>
              <div className="space-y-0.5">
                {sec.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.label}
                      onClick={() => {
                        item.action();
                        onClose();
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                        item.highlight
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25'
                          : 'text-slate-300 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${item.highlight ? 'text-emerald-400' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge ? (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                          {item.badge}
                        </span>
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Drawer Footer */}
        <div className="pt-3 border-t border-white/5 text-[11px] text-slate-500 font-mono space-y-1 shrink-0">
          <p>Dev: Md. Mehedi Hasan</p>
          <p>Package: site.wafazone.browser</p>
        </div>
      </div>
    </div>
  );
};
