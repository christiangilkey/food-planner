import { isNative } from './platform'

/**
 * Saving a backup. A browser downloads the file. Android's app view can't download, so the app
 * writes the file to its private cache and opens Android's share sheet, where the person picks
 * where it goes (Files, Drive, email…). The app itself never sends it anywhere.
 */
export async function saveBackupFile(name: string, text: string): Promise<void> {
  if (isNative) {
    const [{ Filesystem, Directory, Encoding }, { Share }] = await Promise.all([import('@capacitor/filesystem'), import('@capacitor/share')])
    // Keep at most the newest copy in the app's private cache: the app it was shared to may still
    // be reading it, so older ones are removed next time rather than right away.
    await clearAppCache()
    const { uri } = await Filesystem.writeFile({ path: name, data: text, directory: Directory.Cache, encoding: Encoding.UTF8 })
    await Share.share({ title: 'Health Tracker backup', files: [uri], dialogTitle: 'Save your backup' })
    return
  }
  const blob = new Blob([text], { type: 'application/json' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = name
  a.click()
  URL.revokeObjectURL(a.href)
}

/** "Erase everything": also remove any backup copy left in the Android app's cache. */
export async function clearAppCache(): Promise<void> {
  if (!isNative) return
  const { Filesystem, Directory } = await import('@capacitor/filesystem')
  const old = await Filesystem.readdir({ path: '', directory: Directory.Cache }).catch(() => ({ files: [] }))
  for (const f of old.files) if (f.name.startsWith('health-tracker-backup-')) await Filesystem.deleteFile({ path: f.name, directory: Directory.Cache }).catch(() => {})
}

/**
 * A label photo taken from the Android app goes through a temporary file in the app's own
 * Pictures folder. Delete it once it has been read (and any left over), so photos are never kept.
 */
export async function clearCameraCopies(): Promise<void> {
  if (!isNative) return
  const { Filesystem, Directory } = await import('@capacitor/filesystem')
  const dir = await Filesystem.readdir({ path: 'Pictures', directory: Directory.External }).catch(() => ({ files: [] }))
  for (const f of dir.files) if (/^JPEG_.*\.jpg$/i.test(f.name)) await Filesystem.deleteFile({ path: `Pictures/${f.name}`, directory: Directory.External }).catch(() => {})
}

/** Android's share sheet for plain text (the checklist), so it can go to any notes or tasks app. */
export async function shareText(title: string, text: string): Promise<boolean> {
  if (!isNative) return false
  const { Share } = await import('@capacitor/share')
  await Share.share({ title, text, dialogTitle: title })
  return true
}
