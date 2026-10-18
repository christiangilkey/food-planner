/**
 * Camera helpers for the product scanner. Both run on the device: barcodes are read with the
 * browser's BarcodeDetector (or a WebAssembly fallback where it's missing, e.g. iPhone Safari),
 * and label photos are read with Tesseract OCR. Each library loads only when first used.
 */

interface Detector {
  detect(source: ImageBitmapSource): Promise<{ rawValue: string }[]>
}

const FORMATS = ['ean_13', 'ean_8', 'upc_a', 'upc_e']
let detector: Promise<Detector> | null = null

export function barcodeDetector(): Promise<Detector> {
  detector ??= (async () => {
    const Native = (globalThis as { BarcodeDetector?: { new (o: { formats: string[] }): Detector; getSupportedFormats(): Promise<string[]> } }).BarcodeDetector
    if (Native) {
      const supported = await Native.getSupportedFormats().catch(() => [] as string[])
      if (FORMATS.some((f) => supported.includes(f))) return new Native({ formats: FORMATS.filter((f) => supported.includes(f)) })
    }
    const { BarcodeDetector } = await import('barcode-detector/ponyfill')
    return new BarcodeDetector({ formats: FORMATS as never })
  })()
  return detector
}

/** First barcode in an image or video frame, or null. */
export async function readBarcode(source: ImageBitmapSource): Promise<string | null> {
  const found = await (await barcodeDetector()).detect(source)
  return found[0]?.rawValue ?? null
}

/** Load a photo, scale it to a size OCR reads well, and convert to high-contrast grayscale. */
export async function prepareForOcr(file: Blob): Promise<HTMLCanvasElement> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(2.5, 2000 / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  const img = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const d = img.data
  for (let i = 0; i < d.length; i += 4) {
    const y = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]
    const v = Math.max(0, Math.min(255, (y - 128) * 1.6 + 128))
    d[i] = d[i + 1] = d[i + 2] = v
  }
  ctx.putImageData(img, 0, 0)
  return canvas
}

/** Read the text in a label photo. `onProgress` gets 0–1. */
export async function ocrText(file: Blob, onProgress?: (p: number) => void): Promise<string> {
  const [{ createWorker }, canvas] = await Promise.all([import('tesseract.js'), prepareForOcr(file)])
  const worker = await createWorker('eng', 1, {
    logger: (m: { status: string; progress: number }) => m.status === 'recognizing text' && onProgress?.(m.progress),
  })
  try {
    const { data } = await worker.recognize(canvas)
    return data.text
  } finally {
    await worker.terminate()
  }
}
