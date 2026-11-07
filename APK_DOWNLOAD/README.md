# APK DOWNLOAD DIRECTORY

This directory is the automated target for the real Android debug APK built by the GitHub Actions workflow (`.github/workflows/android-build.yml`).

## Workflow Pipeline
1. **GitHub Push** → Triggers `.github/workflows/android-build.yml`
2. **Real Build** → Executes `./gradlew assembleDebug` in standard Ubuntu environment with JDK 17 & Android SDK 35
3. **Integrity Validation** → Validates ZIP structure (`unzip -t`), minimum size threshold, and SHA256 consistency
4. **Automated Commit** → The real generated `app-debug.apk` and its checksum `app-debug.apk.sha256` are committed directly to this folder:
   ```
   APK_DOWNLOAD/app-debug.apk
   APK_DOWNLOAD/app-debug.apk.sha256
   ```

## Download from GitHub Code Browser
Once GitHub Actions completes the build:
1. Open GitHub repository
2. Navigate to `APK_DOWNLOAD`
3. Click `app-debug.apk`
4. Click **Download** to install on any Android phone or emulator.
