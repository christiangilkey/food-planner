# Releasing Health Tracker (web and Android)

Checked against the "Legal for Apps" and "Security for Apps" notes in Notion (Dev Ideas), 9 November 2026.
This is not legal advice: have a lawyer review the documents before the app charges money or is listed in a store.

## Build the Android app (APK)

One-time setup:

- **Java 21.** Capacitor 8 needs it. Microsoft Build of OpenJDK 21 is installed at `C:\Program Files\Microsoft\jdk-21.0.13.21-hotspot`. Point `JAVA_HOME` at it for the build (the default Java on this PC is still 17).
- **Signing key.** It's already made, outside the code: `C:\Users\chris\.keys\health-tracker\` (`release.p12` plus `signing.properties` with its password). **Back this folder up somewhere private.** Without it, Android won't let a new version update an installed one. Never commit it or paste the password into a chat.

Each release:

```bash
npm test
npm run build
npx cap sync android
cd android && ./gradlew assembleRelease bundleRelease
```

- APK (to sideload): `android/app/build/outputs/apk/release/app-release.apk`
- AAB (for Google Play): `android/app/build/outputs/bundle/release/app-release.aab`
- Copies named by version go in `release/` (not committed).

The version comes from `package.json` (1.8.0 becomes versionCode 10800). After changing `public/icon.svg`, run `node scripts/android-icons.mjs`. After changing dependencies, run `npm run licenses`.

## What's done

Legal:
- Privacy Policy, Terms of Service and Cookie and Storage Notice, one source (`src/data/legal.ts`). The app shows them under Profile → About & legal, and the build publishes `privacy.html`, `terms.html` and `storage.html` next to the app (needed for a store listing).
- The first screen says "By continuing, you agree…" with both documents a tap away. People who set up the app earlier see a one-time "Terms and privacy" screen. Changing `LEGAL_VERSION` shows it again.
- Every outside service is named, with what it receives: Anthropic (only with the person's own key, on "Find ideas"), Open Food Facts (only the barcode number), Google Tasks (web only), Onyx (the person's own computer), GitHub Pages (hosting).
- Health-data honesty (Washington My Health My Data Act, not HIPAA-covered), 16+ (matching the age field), Anthropic's 18+ rule on the AI key screen, allergen warning, crisis numbers (911 and 988), no-warranty and liability cap, consumer rights kept, no affiliation with the services named.
- Open-source licence list (43 packages with licence texts) plus data credits (USDA, Open Food Facts ODbL, Tesseract, ZXing). A test keeps it in step with `package.json`.
- An "AI" label on Claude's ideas, and an Open Food Facts credit on scanned products.

Security:
- Backups: tokens are left out, a restore keeps this device's own token and agreement, and every field of an incoming backup is checked and capped. Unknown fields are dropped and special names like `__proto__` are refused (this fixed a real prototype-pollution hole through a product's "matches" field).
- "Erase everything" also removes the AI key, the timer and any backup copy left in the Android app's cache.
- The Onyx address must be a plain http(s) address.
- A Content Security Policy is written into every release build: scripts only from the app itself plus Google's sign-in, no eval, no plugins. The legal pages have their own locked-down policy.
- The scanners' engines (Tesseract OCR, English data, ZXing) ship with the app instead of coming from a CDN, so no outside code arrives after release and scanning works offline.
- Android: no cloud backup of app data, no plain-http traffic, permissions limited to internet and camera, file sharing narrowed to the app's own camera folder and cache, label photos deleted after they're read, release builds not debuggable, signed with a key kept outside the code.
- `src/lib/security.test.ts`: hostile backups, prototype pollution, oversized files, leaked tokens, address schemes, CSP rules, no CDN or unsafe HTML, legal coverage, licence list, Android release settings.

## Still to do before a public release

Business and legal:
- [ ] **Choose who provides the app.** Set `PROVIDER` in `src/data/legal.ts` (a separate LLC or a registered trade name, kept apart from Caliber Products LLC) and bump `LEGAL_VERSION`. Until then the documents say "the developer of Health Tracker".
- [ ] **A contact email** for help and privacy requests: set `CONTACT_EMAIL`. Today the documents point to GitHub issues, which is public.
- [ ] Have a lawyer review the Terms and Privacy Policy, especially the health and medical wording.
- [ ] Name check: "VENA" is used by other companies (finance software, energy). Ask the lawyer before marketing under it. "Health Tracker" alone is too generic to protect.
- [ ] Register for Android developer verification before it reaches the US (worldwide in 2027) if the APK is sideloaded.
- [ ] Google Play, if listed: the Data safety form (answers: no data collected by the developer; optional sharing with Anthropic, Open Food Facts and Google at the user's request), a health-app declaration, and the privacy policy URL (`privacy.html`).

Security and hosting:
- [ ] Move the web app off `christiangilkey.github.io` to its own address. Today other sites published there could read what this app stores in the browser, including the AI key (the Privacy Policy says so honestly). The Android app isn't affected.
- [ ] Turn on two-step sign-in for the GitHub account that hosts the code and the web app.
- [ ] Reports of AI or data mistakes: there's no in-app "report a problem" yet (email once `CONTACT_EMAIL` is set).

Android limits (by design, explained in the app):
- Google Tasks and Onyx export only work in the web app. Android's app view blocks Google sign-in, and Android blocks plain-http connections to a computer. The Android app shares the checklist instead.
