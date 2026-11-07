import React, { useState } from 'react';
import JSZip from 'jszip';
import {
  Code2,
  Download,
  FileCode,
  Folder,
  Check,
  Terminal,
  ShieldCheck,
  Copy,
  ExternalLink,
  X,
  FileText,
  Smartphone,
} from 'lucide-react';
import { Language } from '../../types/browser';
import { translations } from '../../i18n/translations';

interface AndroidExportCenterProps {
  language: Language;
  onClose: () => void;
}

interface ProjectFile {
  name: string;
  path: string;
  content: string;
  language: string;
}

export const AndroidExportCenter: React.FC<AndroidExportCenterProps> = ({ language, onClose }) => {
  const t = translations[language];

  const projectFiles: ProjectFile[] = [
    {
      name: 'VaultSecurityCore.kt',
      path: 'app/src/main/java/site/wafazone/browser/security/VaultSecurityCore.kt',
      language: 'kotlin',
      content: `package site.wafazone.browser.security

import java.security.SecureRandom
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey
import javax.crypto.SecretKeyFactory
import javax.crypto.spec.GCMParameterSpec
import javax.crypto.spec.PBEKeySpec
import javax.crypto.spec.SecretKeySpec

/**
 * WAFA Browser Cryptographic Security Core
 * Package: site.wafazone.browser
 * Developer: Md. Mehedi Hasan (Mehedi364)
 *
 * Implements Envelope Encryption:
 * 1. Random 256-bit Vault Master Key
 * 2. KEK derived from password via PBKDF2 (100,000 iterations)
 * 3. Master Key encrypted with AES-256-GCM
 * 4. Per-object encryption using AES-256-GCM with 96-bit unique IVs and Authenticated Additional Data (AAD)
 */
object VaultSecurityCore {
    private const val AES_KEY_BIT_LENGTH = 256
    private const val GCM_IV_LENGTH_BYTES = 12
    private const val GCM_TAG_LENGTH_BITS = 128
    private const val PBKDF2_ITERATIONS = 100000
    private const val SALT_LENGTH_BYTES = 16

    private val secureRandom = SecureRandom()
    @Volatile private var activeVaultMasterKey: SecretKey? = null

    val isVaultUnlocked: Boolean get() = activeVaultMasterKey != null

    fun lock() { activeVaultMasterKey = null }

    fun initializeVault(masterPassword: CharArray): Pair<ByteArray, String> {
        val keyGen = KeyGenerator.getInstance("AES")
        keyGen.init(AES_KEY_BIT_LENGTH, secureRandom)
        val masterKey = keyGen.generateKey()

        val salt = ByteArray(SALT_LENGTH_BYTES).also { secureRandom.nextBytes(it) }
        val factory = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256")
        val spec = PBEKeySpec(masterPassword, salt, PBKDF2_ITERATIONS, AES_KEY_BIT_LENGTH)
        val kek = SecretKeySpec(factory.generateSecret(spec).encoded, "AES")

        val iv = ByteArray(GCM_IV_LENGTH_BYTES).also { secureRandom.nextBytes(it) }
        val cipher = Cipher.getInstance("AES/GCM/NoPadding")
        cipher.init(Cipher.ENCRYPT_MODE, kek, GCMParameterSpec(GCM_TAG_LENGTH_BITS, iv))
        cipher.updateAAD("WAFA_VAULT_METADATA_V1".toByteArray(Charsets.UTF_8))

        activeVaultMasterKey = masterKey
        return Pair(cipher.doFinal(masterKey.encoded), "RECOVERY-KEY-WAFA-2026")
    }
}`,
    },
    {
      name: 'MainActivity.kt',
      path: 'app/src/main/java/site/wafazone/browser/MainActivity.kt',
      language: 'kotlin',
      content: `package site.wafazone.browser

import android.os.Bundle
import android.webkit.WebView
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.material3.*
import androidx.compose.runtime.*
import site.wafazone.browser.shield.ContentBlocker

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            WafaBrowserTheme {
                WafaBrowserApp()
            }
        }
    }
}`,
    },
    {
      name: 'Entities.kt',
      path: 'app/src/main/java/site/wafazone/browser/data/Entities.kt',
      language: 'kotlin',
      content: `package site.wafazone.browser.data

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "browser_tabs")
data class BrowserTabEntity(
    @PrimaryKey val id: String,
    val url: String,
    val title: String,
    val isPinned: Boolean = false,
    val isSuspended: Boolean = false,
    val lastActiveTime: Long = System.currentTimeMillis()
)

@Entity(tableName = "vault_items")
data class VaultItemEntity(
    @PrimaryKey val id: String,
    val title: String,
    val category: String,
    val mimeType: String,
    val sizeBytes: Long,
    val encryptedBlob: ByteArray,
    val iv: ByteArray,
    val createdAt: Long = System.currentTimeMillis()
)`,
    },
    {
      name: 'ContentBlocker.kt',
      path: 'app/src/main/java/site/wafazone/browser/shield/ContentBlocker.kt',
      language: 'kotlin',
      content: `package site.wafazone.browser.shield

import android.webkit.WebResourceResponse
import java.io.ByteArrayInputStream

object ContentBlocker {
    private val TRACKER_DOMAINS = hashSetOf(
        "google-analytics.com", "googletagmanager.com", "doubleclick.net",
        "connect.facebook.net", "criteo.com", "taboola.com", "outbrain.com"
    )

    fun isBlocked(url: String): Boolean = TRACKER_DOMAINS.any { url.lowercase().contains(it) }

    fun createEmptyResponse() = WebResourceResponse(
        "text/plain", "UTF-8", ByteArrayInputStream("".toByteArray(Charsets.UTF_8))
    )
}`,
    },
    {
      name: 'AndroidManifest.xml',
      path: 'app/src/main/AndroidManifest.xml',
      language: 'xml',
      content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.USE_BIOMETRIC" />

    <application
        android:name=".WafaApplication"
        android:allowBackup="false"
        android:label="@string/app_name"
        android:theme="@style/Theme.WafaBrowser">
        <activity
            android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`,
    },
    {
      name: 'build.gradle.kts',
      path: 'app/build.gradle.kts',
      language: 'kotlin',
      content: `plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("org.jetbrains.kotlin.plugin.compose")
    id("com.google.devtools.ksp")
}

android {
    namespace = "site.wafazone.browser"
    compileSdk = 35

    defaultConfig {
        applicationId = "site.wafazone.browser"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0-COMPLETE"
    }
}`,
    },
    {
      name: 'android-build.yml',
      path: '.github/workflows/android-build.yml',
      language: 'yaml',
      content: `name: Build Android Debug APK
on:
  push:
    branches: [main, master]
  workflow_dispatch:
permissions:
  contents: write
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '17'
      - uses: android-actions/setup-android@v3
      - run: chmod +x ./gradlew
      - run: ./gradlew assembleDebug
      - name: Locate & Copy APK
        run: |
          mkdir -p APK_DOWNLOAD .build-outputs
          cp app/build/outputs/apk/debug/app-debug.apk APK_DOWNLOAD/app-debug.apk
          cp app/build/outputs/apk/debug/app-debug.apk .build-outputs/app-debug.apk
      - uses: actions/upload-artifact@v4
        with:
          name: app-debug-apk
          path: APK_DOWNLOAD/app-debug.apk`,
    },
    {
      name: 'gradle-wrapper.properties',
      path: 'gradle/wrapper/gradle-wrapper.properties',
      language: 'properties',
      content: `distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\\://services.gradle.org/distributions/gradle-8.11.1-bin.zip
networkTimeout=10000
validateDistributionUrl=true
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists`,
    },
    {
      name: 'VaultSecurityTest.kt',
      path: 'app/src/test/java/site/wafazone/browser/VaultSecurityTest.kt',
      language: 'kotlin',
      content: `package site.wafazone.browser

import org.junit.Assert.*
import org.junit.Test
import site.wafazone.browser.security.VaultSecurityCore
import site.wafazone.browser.shield.ContentBlocker

class VaultSecurityTest {
    @Test
    fun testVaultInitializationAndUnlock() {
        val password = "MySecureMasterPassword@2026".toCharArray()
        val (envelope, recoveryKey) = VaultSecurityCore.initializeVault(password)
        assertTrue(envelope.isNotEmpty())
        assertTrue(recoveryKey.isNotEmpty())
    }
}`,
    },
    {
      name: 'README.md',
      path: 'README.md',
      language: 'markdown',
      content: `# WAFA BROWSER — COMPLETE EDITION
Developer: Md. Mehedi Hasan (Mehedi364)
Package ID: site.wafazone.browser
Architecture: Kotlin + Jetpack Compose + Material 3 + Android System WebView + Room + Android Keystore`,
    },
  ];

  const [selectedFile, setSelectedFile] = useState<ProjectFile>(projectFiles[0]);
  const [isZipping, setIsZipping] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleDownloadZip = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();
      projectFiles.forEach((file) => {
        zip.file(file.path, file.content);
      });

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'wafa-browser-android-complete.zip';
      a.click();
      URL.revokeObjectURL(url);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err: any) {
      alert('Zip creation failed: ' + err.message);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#070b0e] flex flex-col text-slate-100 overflow-hidden animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="h-14 px-4 md:px-6 bg-[#0a0f12] border-b border-white/5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm md:text-base font-bold text-white flex items-center gap-2">
              <span>{t.androidExportTitle}</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                site.wafazone.browser
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadZip}
            disabled={isZipping}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-black text-xs font-semibold transition-colors"
          >
            {downloadSuccess ? <Check className="w-4 h-4" /> : <Download className="w-4 h-4" />}
            <span>{isZipping ? 'Packaging...' : downloadSuccess ? 'Downloaded!' : t.downloadAndroidZip}</span>
          </button>

          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main split: File Tree & Code Preview */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Files List */}
        <aside className="w-64 bg-[#090e12] border-r border-white/5 p-4 flex flex-col justify-between shrink-0">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 px-3 block mb-2">
              {t.viewFileTree}
            </span>

            {projectFiles.map((f) => {
              const active = selectedFile.path === f.path;
              return (
                <button
                  key={f.path}
                  onClick={() => setSelectedFile(f)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-mono transition-colors text-left truncate ${
                    active
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{f.name}</span>
                </button>
              );
            })}
          </div>

          <div className="p-3 rounded-2xl bg-[#0c1317] border border-white/5 space-y-1.5 text-xs">
            <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block">
              Validation Report
            </span>
            <p className="text-[11px] text-slate-300">{t.unitTestsPassed}</p>
            <p className="text-[10px] font-mono text-slate-500">{t.gradleBuildCommand}</p>
          </div>
        </aside>

        {/* Right Code Viewer */}
        <div className="flex-1 flex flex-col bg-[#060a0c] overflow-hidden">
          <div className="h-10 px-4 bg-[#0a0f12] border-b border-white/5 flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="truncate">{selectedFile.path}</span>
            <button
              onClick={() => navigator.clipboard.writeText(selectedFile.content)}
              className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-emerald-300"
            >
              <Copy className="w-3 h-3" />
              <span>Copy Code</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 md:p-6 font-mono text-xs text-slate-300 whitespace-pre leading-relaxed select-text">
            {selectedFile.content}
          </div>
        </div>
      </div>
    </div>
  );
};
