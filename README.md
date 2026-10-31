# EduPortal – Android app

Android version of the **Student Registration** web app: same look, same three screens
(registration form → success/profile → admin dashboard), packaged with
[Capacitor](https://capacitorjs.com).

The app runs fully on the phone – no server needed. Registrations are stored on the
device, so they are still there after you close the app.

```
www/index.html, app.js, style.css   the app (your original CSS + the server logic ported to the client)
assets/                             launcher icon sources
capacitor.config.json               app id / name
scripts/build-apk.js                one-command build
.github/workflows/build-apk.yml     build the APK in the cloud (no local setup)
```

## Get the APK – pick one

### A) GitHub Actions (nothing to install)
1. Push this folder to a GitHub repo (your project already has a `main` branch + remote).
2. Open the repo → **Actions → Build Android APK → Run workflow** (it also runs on every push to `main`).
3. When it finishes, download **EduPortal-apk** from the run page → unzip → `app-debug.apk`.

### B) Command line (needs Node 20+, JDK 21, Android SDK with `ANDROID_HOME` set)
```
npm install
npm run apk
```
APK: `android/app/build/outputs/apk/debug/app-debug.apk`

### C) Android Studio
```
npm install
npx cap add android
npx capacitor-assets generate --android
npx cap sync android
npx cap open android
```
Then **Build → Build APK(s)**.

## Install on a phone
Copy `app-debug.apk` to the phone, open it, and allow "Install unknown apps" when asked.
(Or: `adb install app-debug.apk`.)

This is a *debug-signed* APK – perfect for testing and sharing directly. For the Play Store you
need a release build signed with your own keystore (Android Studio: **Build → Generate Signed Bundle / APK**).

## Changing things
Edit files in `www/`, then rebuild (`npm run apk`). Package name is in `capacitor.config.json`.
