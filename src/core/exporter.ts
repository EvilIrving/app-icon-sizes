import JSZip from 'jszip';
import type { PlatformPreset, IconSize, ScalePreset } from './presets';
import { 
  getOutputFilename, 
  getExpectedPixelSize,
  generateImageSetsContentsJson,
  getAndroidExportEntries,
  toZipPath,
} from './presets';
import { resizeImage, blobToArrayBuffer } from './resize';

/**
 * Progress callback type
 */
export type ProgressCallback = (current: number, total: number, filename: string) => void;

/**
 * Export options
 */
export interface ExportOptions {
  /** Source image blob */
  sourceImage: Blob;
  /** Platform preset to use */
  preset: PlatformPreset;
  /** Custom filename for Android/Image Sets */
  customFilename?: string;
  /** Scale preset for image sets */
  scalePreset?: ScalePreset;
  /** Optional progress callback */
  onProgress?: ProgressCallback;
}

/**
 * Export result
 */
export interface ExportResult {
  /** ZIP file as ArrayBuffer */
  zipData: ArrayBuffer;
  /** Total number of icons generated */
  iconCount: number;
  /** List of generated filenames */
  filenames: string[];
}

/**
 * Generate all icons and package them into a ZIP file
 */
export async function exportIcons(options: ExportOptions): Promise<ExportResult> {
  const { sourceImage, preset, customFilename, scalePreset, onProgress } = options;
  
  const zip = new JSZip();
  const filenames: string[] = [];
  
  // Android: use explicit folder + filename from export entries
  if (preset.id === 'android') {
    const entries = getAndroidExportEntries(customFilename || preset.defaultFilename || 'ic_launcher');
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      const resizedBlob = await resizeImage(sourceImage, entry.expectedSize, entry.expectedSize);
      const imageData = await blobToArrayBuffer(resizedBlob);
      const zipPath = toZipPath(entry.folder, entry.filename);
      zip.file(zipPath, imageData);
      filenames.push(zipPath);
      if (onProgress) onProgress(i + 1, entries.length, zipPath);
    }
  } else {
    // Other presets: use sizes + outputDir
    let sizesToGenerate: IconSize[] = preset.sizes;
    if (preset.id === 'image-sets' && scalePreset) {
      sizesToGenerate = scalePreset.scales.map(({ scale }) => ({
        width: 0,
        height: 0,
        name: customFilename || preset.defaultFilename || 'image',
        scale,
      }));
    }
    const totalIcons = sizesToGenerate.length;
    for (let i = 0; i < sizesToGenerate.length; i++) {
      const size = sizesToGenerate[i];
      const filename = getOutputFilename(size, preset, customFilename);
      const { width: pxW, height: pxH } = getExpectedPixelSize(size);
      const resizedBlob = await resizeImage(sourceImage, pxW, pxH);
      const imageData = await blobToArrayBuffer(resizedBlob);
      const zipPath = toZipPath(preset.outputDir, filename);
      zip.file(zipPath, imageData);
      filenames.push(zipPath);
      if (onProgress) onProgress(i + 1, totalIcons, zipPath);
    }
    if (preset.id === 'image-sets' && scalePreset && preset.generateContentsJson) {
      const contentsJson = generateImageSetsContentsJson(scalePreset, customFilename || preset.defaultFilename || 'image');
      zip.file(toZipPath(preset.outputDir, 'Contents.json'), contentsJson);
    }
  }
  
  // Generate the ZIP file
  const zipBlob = await zip.generateAsync({ type: 'arraybuffer' });
  
  return {
    zipData: zipBlob,
    iconCount: filenames.length,
    filenames,
  };
}

/**
 * Download a ZIP file to the user's downloads folder
 */
export function downloadZip(zipData: ArrayBuffer, filename: string): void {
  const blob = new Blob([zipData], { type: 'application/zip' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * Check if running inside Tauri (desktop) so plugin APIs are available
 */
function isTauri(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

/**
 * Save ZIP file: use Tauri save dialog in desktop app, otherwise trigger browser download
 */
export async function saveZipWithDialog(zipData: ArrayBuffer, defaultFilename: string): Promise<boolean> {
  if (!isTauri()) {
    downloadZip(zipData, defaultFilename);
    return true;
  }

  const { save } = await import('@tauri-apps/plugin-dialog');
  const { writeFile } = await import('@tauri-apps/plugin-fs');

  const filePath = await save({
    defaultPath: defaultFilename,
    filters: [{
      name: 'ZIP File',
      extensions: ['zip'],
    }],
  });

  if (!filePath) {
    return false;
  }

  const uint8Array = new Uint8Array(zipData);
  await writeFile(filePath, uint8Array);

  return true;
}
