import { Capacitor } from '@capacitor/core'

/** True inside the Android app (Capacitor), false in a browser or the installed web app. */
export const isNative = Capacitor.isNativePlatform()

/** The app's version, from package.json (set in vite.config.ts). */
export const APP_VERSION = __APP_VERSION__
