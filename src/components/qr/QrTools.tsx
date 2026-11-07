import React, { useState, useRef, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  QrCode,
  Camera,
  Download,
  Share2,
  ExternalLink,
  Wifi,
  User,
  Globe,
  FileText,
  X,
  Check,
  AlertCircle,
  Copy,
} from 'lucide-react';
import { Language } from '../../types/browser';
import { translations } from '../../i18n/translations';

interface QrToolsProps {
  language: Language;
  onOpenUrl: (url: string) => void;
  onClose: () => void;
}

export const QrTools: React.FC<QrToolsProps> = ({ language, onOpenUrl, onClose }) => {
  const t = translations[language];

  const [activeTab, setActiveTab] = useState<'generate' | 'scan'>('generate');

  // Generator states
  const [qrType, setQrType] = useState<'url' | 'text' | 'wifi' | 'contact'>('url');
  const [urlInput, setUrlInput] = useState('https://site.wafazone.browser');
  const [textInput, setTextInput] = useState('');
  const [wifiSsid, setWifiSsid] = useState('');
  const [wifiPassword, setWifiPassword] = useState('');
  const [wifiAuth, setWifiAuth] = useState('WPA');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // Scanner states
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Generate QR on input change
  useEffect(() => {
    let payload = '';
    switch (qrType) {
      case 'url':
        payload = urlInput.trim();
        break;
      case 'text':
        payload = textInput.trim();
        break;
      case 'wifi':
        payload = `WIFI:S:${wifiSsid};T:${wifiAuth};P:${wifiPassword};;`;
        break;
      case 'contact':
        payload = `BEGIN:VCARD\nVERSION:3.0\nN:${contactName}\nTEL:${contactPhone}\nEMAIL:${contactEmail}\nEND:VCARD`;
        break;
    }

    if (!payload) {
      payload = 'WAFA Browser Complete Edition';
    }

    QRCode.toDataURL(
      payload,
      {
        width: 400,
        margin: 2,
        color: {
          dark: '#070b0e',
          light: '#ffffff',
        },
      },
      (err, url) => {
        if (!err && url) {
          setQrDataUrl(url);
        }
      }
    );
  }, [qrType, urlInput, textInput, wifiSsid, wifiPassword, wifiAuth, contactName, contactPhone, contactEmail]);

  // Clean up camera on unmount or tab switch
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setCameraError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: any) {
      setCameraError(err.message || 'Camera permission denied or camera unavailable.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `wafa_qr_${Date.now()}.png`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#070b0e] flex flex-col text-slate-100 overflow-hidden animate-in fade-in duration-200">
      {/* Header */}
      <div className="h-14 px-4 md:px-6 bg-[#0a0f12] border-b border-white/5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <QrCode className="w-4 h-4" />
          </div>
          <h1 className="text-sm md:text-base font-bold text-white flex items-center gap-2">
            <span>{t.qrTitle}</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
              CameraX & Generator
            </span>
          </h1>
        </div>

        <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs Switcher */}
      <div className="p-4 bg-[#090d10] border-b border-white/5 flex items-center justify-center">
        <div className="flex items-center p-1 rounded-xl bg-[#11181d] border border-white/5 max-w-xs w-full">
          <button
            onClick={() => {
              setActiveTab('generate');
              stopCamera();
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'generate' ? 'bg-emerald-600 text-black shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            {t.generateQr}
          </button>
          <button
            onClick={() => setActiveTab('scan')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'scan' ? 'bg-emerald-600 text-black shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            {t.scanQr}
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 max-w-4xl mx-auto w-full">
        {activeTab === 'generate' ? (
          /* GENERATOR VIEW */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Input Controls */}
            <div className="p-5 rounded-2xl bg-[#0c1317] border border-white/5 space-y-4">
              <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block">
                QR Payload Configuration
              </span>

              {/* Type Switcher */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'url', label: t.qrTypeUrl, icon: Globe },
                  { id: 'text', label: t.qrTypeText, icon: FileText },
                  { id: 'wifi', label: t.qrTypeWifi, icon: Wifi },
                  { id: 'contact', label: t.qrTypeContact, icon: User },
                ].map((item) => {
                  const Icon = item.icon;
                  const active = qrType === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setQrType(item.id as any)}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition-colors ${
                        active
                          ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                          : 'bg-[#11181d] border-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4 mb-1" />
                      <span className="text-[11px] truncate w-full text-center">{item.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Inputs */}
              {qrType === 'url' && (
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Target URL</label>
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-xl bg-[#131b20] border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
              )}

              {qrType === 'text' && (
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Plain Text</label>
                  <textarea
                    rows={4}
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Enter any text or notes..."
                    className="w-full px-3 py-2 rounded-xl bg-[#131b20] border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
              )}

              {qrType === 'wifi' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-slate-300 block mb-1">Network SSID</label>
                    <input
                      type="text"
                      value={wifiSsid}
                      onChange={(e) => setWifiSsid(e.target.value)}
                      placeholder="MyHomeWiFi"
                      className="w-full px-3 py-2 rounded-xl bg-[#131b20] border border-white/10 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-300 block mb-1">Password</label>
                    <input
                      type="text"
                      value={wifiPassword}
                      onChange={(e) => setWifiPassword(e.target.value)}
                      placeholder="Wi-Fi Password..."
                      className="w-full px-3 py-2 rounded-xl bg-[#131b20] border border-white/10 text-xs text-white"
                    />
                  </div>
                </div>
              )}

              {qrType === 'contact' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-slate-300 block mb-1">Full Name</label>
                    <input
                      type="text"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full px-3 py-2 rounded-xl bg-[#131b20] border border-white/10 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-300 block mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full px-3 py-2 rounded-xl bg-[#131b20] border border-white/10 text-xs text-white"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Preview & Download Card */}
            <div className="p-6 rounded-2xl bg-[#0c1317] border border-white/5 flex flex-col items-center justify-center text-center space-y-4">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                High-Resolution QR Code
              </span>

              {qrDataUrl && (
                <div className="p-4 rounded-2xl bg-white shadow-xl">
                  <img src={qrDataUrl} alt="Generated QR" className="w-56 h-56 object-contain" />
                </div>
              )}

              <div className="flex items-center gap-2 pt-2 w-full max-w-xs">
                <button
                  onClick={handleDownloadQr}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-black text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>{t.downloadQr}</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* SCANNER VIEW */
          <div className="max-w-md mx-auto p-6 rounded-2xl bg-[#0c1317] border border-white/5 space-y-4 text-center">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <Camera className="w-4 h-4 text-emerald-400" />
                <span>{t.scanQr}</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">CameraX API</span>
            </div>

            <p className="text-xs text-slate-400 text-left">{t.cameraPermissionNote}</p>

            {cameraError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-center gap-2 text-left">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{cameraError}</span>
              </div>
            )}

            {/* Video Preview Frame */}
            <div className="w-full h-64 rounded-2xl bg-[#080d10] border border-white/10 relative overflow-hidden flex items-center justify-center">
              <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
              {!isCameraActive && (
                <div className="text-center p-4">
                  <Camera className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                  <p className="text-xs text-slate-500">Camera preview inactive</p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {!isCameraActive ? (
                <button
                  onClick={startCamera}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-black font-semibold text-xs transition-colors flex items-center justify-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  <span>{t.startCamera}</span>
                </button>
              ) : (
                <button
                  onClick={stopCamera}
                  className="w-full py-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 font-semibold text-xs border border-red-500/30 transition-colors"
                >
                  {t.stopCamera}
                </button>
              )}
            </div>

            {/* Simulated Scan Trigger for testing in sandbox */}
            <div className="pt-2 border-t border-white/5 text-left">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">
                Test QR Recognition
              </span>
              <button
                onClick={() => setScannedResult('https://site.wafazone.browser')}
                className="text-xs text-emerald-400 hover:underline"
              >
                Simulate QR Scan: https://site.wafazone.browser
              </button>
            </div>

            {scannedResult && (
              <div className="p-4 rounded-xl bg-[#11181d] border border-emerald-500/30 text-left space-y-2">
                <span className="text-[10px] text-emerald-400 font-mono">{t.scanResult}</span>
                <p className="text-xs font-mono text-white break-all">{scannedResult}</p>
                <button
                  onClick={() => {
                    onOpenUrl(scannedResult);
                    onClose();
                  }}
                  className="w-full py-2 rounded-lg bg-emerald-600 text-black text-xs font-semibold flex items-center justify-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>{t.openUrl}</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
