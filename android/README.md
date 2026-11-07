# WAFA BROWSER — COMPLETE EDITION

**Developer:** Md. Mehedi Hasan  
**Developer Identity:** Mehedi364  
**Package ID:** `site.wafazone.browser`  
**Edition:** Complete Edition  
**Platform:** Native Android (Kotlin + Jetpack Compose)

---

## 1. Overview
WAFA Browser is a lightweight, privacy-focused native Android browser engineered with an integrated and standalone encrypted Private Vault, built-in tracker & ad blocker, encrypted password manager, offline library, QR tools, and PDF viewer.

## 2. Technical Stack
- **Language:** Kotlin 2.0+
- **UI Framework:** Jetpack Compose with Material 3 (Obsidian Dark & Emerald Green theme)
- **Engine:** Android System WebView with custom content interceptor
- **Database:** Room / SQLite with encrypted payloads
- **Cryptography:** AES-256-GCM, PBKDF2-HMAC-SHA256 (100,000 iterations), HKDF, Android Keystore
- **Architecture:** Single Activity, MVVM + Repository pattern, Kotlin Coroutines & Flow
- **Localization:** English and Bengali (বাংলা)

## 3. Cryptographic Architecture
WAFA Browser employs an **Envelope Encryption** architecture:
1. Random 256-bit Vault Master Key generated via cryptographically secure RNG.
2. User's Master Password derives a Key Encryption Key (KEK) using PBKDF2 (100,000 iterations).
3. The Vault Master Key is encrypted using AES-256-GCM with a 96-bit unique IV and Authenticated Additional Data (`WAFA_VAULT_METADATA_V1`).
4. Individual files and credentials in Room DB are encrypted with independent IVs and record-specific AAD.
5. In-memory zeroization on auto-lock (5-minute inactivity timer).

## 4. Building the Project
### Prerequisites
- Android Studio Ladybug / Meerkat or later
- JDK 17
- Android SDK 35 (compileSdk 35, minSdk 26)

### Command Line Build
```bash
# Clone or extract repository
cd android

# Build debug APK
./gradlew assembleDebug

# Run unit tests
./gradlew testDebugUnitTest

# Install on connected device or emulator
./gradlew installDebug
```

The resulting debug APK will be generated at:
`app/build/outputs/apk/debug/app-debug.apk`

---
© 2026 Md. Mehedi Hasan (Mehedi364). All rights reserved.
