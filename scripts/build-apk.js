// Cross-platform (Windows/macOS/Linux) APK builder.
// Usage:  npm install && npm run apk
// Needs: Node 20+, JDK 21, Android SDK (ANDROID_HOME set). Easiest: Android Studio.
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const win = process.platform === "win32";
const run = (cmd, args, cwd = root) => {
    console.log(`\n> ${cmd} ${args.join(" ")}`);
    const r = spawnSync(cmd, args, { cwd, stdio: "inherit", shell: win });
    if (r.status !== 0) { console.error(`\nFailed: ${cmd} ${args.join(" ")}`); process.exit(r.status || 1); }
};

if (!fs.existsSync(path.join(root, "android"))) run("npx", ["cap", "add", "android"]);

// Generate launcher icons from assets/ (non-fatal if it can't)
spawnSync("npx", ["capacitor-assets", "generate", "--android"], { cwd: root, stdio: "inherit", shell: win });

run("npx", ["cap", "sync", "android"]);
run(win ? "gradlew.bat" : "./gradlew", ["assembleDebug"], path.join(root, "android"));

const apk = path.join(root, "android", "app", "build", "outputs", "apk", "debug", "app-debug.apk");
console.log(fs.existsSync(apk) ? `\nDone! APK: ${apk}` : "\nBuild finished but APK not found at the expected path.");
