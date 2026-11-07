# WAFA BROWSER — COMPLETE EDITION 🚀
### বাংলা ও English Master Technical Documentation

[![Android CI](https://github.com/Mehedi364/wafa-browser/actions/workflows/android-build.yml/badge.svg)](https://github.com/Mehedi364/wafa-browser/actions/workflows/android-build.yml)
[![Platform](https://img.shields.io/badge/Platform-Native%20Android%20%7C%20Web%20Simulator-10B981)](https://site.wafazone.browser)
[![Kotlin](https://img.shields.io/badge/Kotlin-2.0.21-purple)](https://kotlinlang.org)
[![Security](https://img.shields.io/badge/Security-AES--256--GCM%20%2B%20PBKDF2-F59E0B)](#cryptographic-architecture)

**Developer / প্রস্তুতকারক:** Md. Mehedi Hasan (Mehedi364)  
**Package Identifier / প্যাকেজ আইডি:** `site.wafazone.browser`  
**Application ID:** `site.wafazone.browser`  
**Edition:** Complete Edition  
**Repository Architecture:** Hybrid Production Android Gradle Repository + AI Studio Interactive Preview

---

## 1. Project Overview / প্রজেক্ট পরিচিতি

**English:**  
WAFA Browser is a lightweight, privacy-focused, production-ready native Android browser engineered with Kotlin, Jetpack Compose, Material 3, and Android System WebView. It features a zero-knowledge hardware-backed **Private Vault** with AES-256-GCM envelope encryption, an integrated **Ad & Tracker Blocker**, an encrypted **Password Manager**, **QR & Barcode Utilities** (CameraX), **Offline PDF Viewer** (Android PdfRenderer), and an **Offline Reading Library** with Text-to-Speech (TTS).

**বাংলা:**  
ওয়াফা ব্রাউজার (WAFA Browser) হলো একটি দ্রুত, হালকা এবং সর্বোচ্চ প্রাইভেসিসম্পন্ন নেটিভ অ্যান্ড্রয়েড ব্রাউজার। এতে রয়েছে হার্ডওয়্যার ব্যাকড এনক্রিপ্টেড প্রাইভেট ভল্ট (Private Vault), শক্তিশালী অ্যাড ও ট্র্যাকার ব্লকার, পাসওয়ার্ড ম্যানেজার, কিউআর স্ক্যানার (CameraX) ও অফলাইন পিডিএফ রিডার।

---

## 2. Technical Stack / প্রযুক্তিগত ভিত্তি

- **Language:** Kotlin 2.0.21
- **UI Framework:** Jetpack Compose (Material 3) with Obsidian Dark & Emerald Green visual direction
- **Architecture:** Single Activity, MVVM + Repository Pattern, StateFlow / Coroutines
- **Database:** AndroidX Room / SQLite with encrypted object payloads
- **Cryptography:** Android Keystore, AES-256-GCM, PBKDF2-HMAC-SHA256 (100,000 iterations), Authenticated Additional Data (AAD)
- **Scanning & Media:** CameraX & ZXing
- **Build System:** Gradle 8.11.1 with Kotlin DSL (`build.gradle.kts`)
- **CI/CD:** Automated GitHub Actions build pipeline

---

## 3. Cryptographic Architecture / এনক্রিপশন কাঠামো

1. **Vault Master Key Generation:** 256-bit cryptographic AES key generated via `java.security.SecureRandom`.
2. **Key Derivation (KEK):** Master Password derives a Key Encryption Key using PBKDF2-HMAC-SHA256 with 100,000 iterations and a 16-byte random salt.
3. **Envelope Encryption:** The Vault Master Key is wrapped in an AES-256-GCM envelope with unique 96-bit IVs and Authenticated Additional Data (`WAFA_VAULT_METADATA_V1`).
4. **Data Isolation:** Each file, photo, note, or credential receives unique IV nonces and record-specific AAD (`WAFA_RECORD_<ID>`).
5. **Memory Zeroization:** Sensitive keys are discarded and zeroed upon 5 minutes of user inactivity or explicit lock.
6. **Recovery Key:** 20-character alphanumeric recovery key for cryptographic restoration.

---

## 4. Repository Structure / রিপোজিটরির গঠন

```
.
├── .github/
│   └── workflows/
│       └── android-build.yml       # Automated GitHub Actions Gradle build & APK verification
├── .build-outputs/
│   └── app-debug.apk               # Local copy of built APK
├── APK_DOWNLOAD/
│   ├── app-debug.apk               # Real downloadable debug APK committed by CI/CD
│   ├── app-debug.apk.sha256        # Cryptographic SHA256 verification hash
│   └── README.md
├── app/
│   ├── src/
│   │   ├── main/
│   │   │   ├── AndroidManifest.xml # Permissions: INTERNET, CAMERA, USE_BIOMETRIC
│   │   │   ├── java/site/wafazone/browser/
│   │   │   │   ├── MainActivity.kt
│   │   │   │   ├── WafaApplication.kt
│   │   │   │   ├── data/ (Room DB, Entities, DAOs)
│   │   │   │   ├── security/ (VaultSecurityCore.kt)
│   │   │   │   └── shield/ (ContentBlocker.kt)
│   │   │   └── res/
│   │   │       ├── values/ (strings.xml, colors.xml, themes.xml)
│   │   │       └── values-bn/ (বাংলা লোকালাইজেশন strings.xml)
│   │   └── test/ (VaultSecurityTest.kt)
│   ├── build.gradle.kts            # App module build configuration
│   └── proguard-rules.pro
├── gradle/
│   └── wrapper/
│       ├── gradle-wrapper.jar      # Official Gradle wrapper binary (43 KB)
│       └── gradle-wrapper.properties
├── gradlew                         # POSIX Gradle wrapper executable
├── gradlew.bat                     # Windows Gradle wrapper script
├── build.gradle.kts                # Root project build configuration
├── settings.gradle.kts             # Gradle project settings
├── gradle.properties               # Memory & JVM parameters
└── README.md
```

---

## 5. Local Build Instructions / লোকাল বিল্ড নির্দেশিকা

### Prerequisites
- Android Studio Ladybug / Meerkat or later
- Java Development Kit (JDK) 17
- Android SDK Platform 35 (minSdk 26, compileSdk 35)

### Command Line Build
```bash
# Clone the repository
git clone https://github.com/Mehedi364/wafa-browser.git
cd wafa-browser

# Grant executable permission to Gradle wrapper
chmod +x gradlew

# Execute local Debug APK build
./gradlew assembleDebug

# Run unit and security tests
./gradlew testDebugUnitTest
```

The generated APK will be output to:
```
app/build/outputs/apk/debug/app-debug.apk
```

---

## 6. Automated GitHub Actions Build Pipeline / অটোমেটেড গিটহাব অ্যাকশনস

This repository contains an automated build and verification workflow in `.github/workflows/android-build.yml`.

### Build & Release Lifecycle
1. **Push Trigger:** Any push to `main` or `master` initiates the pipeline.
2. **Environment Setup:** Ubuntu latest runner initializes JDK 17 (Temurin) and Android SDK 35.
3. **Compilation:** Executes `./gradlew assembleDebug --stacktrace`.
4. **Locate & Copy:** Verifies generated APK and copies it to:
   - `.build-outputs/app-debug.apk`
   - `APK_DOWNLOAD/app-debug.apk`
5. **Rigorous Validation:**
   - File listing: `ls -lh APK_DOWNLOAD/app-debug.apk`
   - MIME inspection: `file APK_DOWNLOAD/app-debug.apk`
   - Size check: Verifies APK > 500 KB (fails on empty or dummy files)
   - Structural integrity: `unzip -t APK_DOWNLOAD/app-debug.apk`
   - Checksum matching: Computes and matches `sha256sum` across copies
6. **Artifact & Commit:**
   - Uploads `app-debug-apk` via `actions/upload-artifact@v4`.
   - Automatically commits the real `app-debug.apk` directly into the `APK_DOWNLOAD/` folder with `[skip ci]` tag.

### Downloading the APK from GitHub Code Browser
You can download the APK directly:
1. Open the repository on GitHub.
2. Navigate to `APK_DOWNLOAD/`.
3. Click on `app-debug.apk`.
4. Click **Download** and install on your Android device.

---

## 7. Troubleshooting / সাধারণ সমস্যার সমাধান

- **Permission Denied on `./gradlew`:**
  Run `chmod +x gradlew` before building.
- **Java Version Mismatch:**
  Ensure `JAVA_HOME` points to JDK 17 (`java -version`).
- **Android SDK Location:**
  Set `ANDROID_HOME` or create `local.properties` with:
  ```properties
  sdk.dir=/path/to/your/android-sdk
  ```

---

## 8. License & Attribution / কপিরাইট

Developed with pride by **Md. Mehedi Hasan (Mehedi364)**.  
Package ID: `site.wafazone.browser`.  
All rights reserved © 2026.
