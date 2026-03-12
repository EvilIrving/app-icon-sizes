/**
 * Types and loader for size.json — single source of truth for export paths and filenames.
 * Format: [ iconsObject, imagesetsObject ]
 * - iconsObject: { iphone?, ipad?, watch?, mac?, android?, stores? }
 * - imagesetsObject: { ios?, android? }
 */

export interface IconEntry {
  size: string;
  'expected-size': string;
  filename: string;
  folder: string;
  idiom?: string;
  scale?: string;
  subtype?: string;
  role?: string;
}

export interface AndroidIconEntry {
  size: string;
  'expected-size': string;
  filename: string;
  folder: string;
}

export interface StoreEntry {
  size: string;
  'expected-size': string;
  filename: string;
  folder: string;
}

export interface IconsConfig {
  iphone?: IconEntry[];
  ipad?: IconEntry[];
  watch?: IconEntry[];
  mac?: IconEntry[];
  android?: AndroidIconEntry[];
  stores?: StoreEntry[];
  favicon?: IconEntry[];
}

export interface ImageSetEntry {
  postfix: string;
  folder: string;
  scale: number;
}

export interface ImageSetsConfig {
  /** 基础尺寸（pt），实际像素 = base * scale，如 base=128、scale=3 → 384，输出 image384@3x.png */
  base?: number;
  ios?: ImageSetEntry[];
  android?: ImageSetEntry[];
}

export type SizeConfig = [IconsConfig, ImageSetsConfig];

const SIZE_JSON_URL = '/size.json';

/**
 * Load size.json (array [icons, imagesets]). Returns null on failure.
 */
export async function loadSizeConfig(): Promise<SizeConfig | null> {
  try {
    const res = await fetch(SIZE_JSON_URL);
    if (!res.ok) return null;
    const raw = await res.json();
    if (!Array.isArray(raw) || raw.length < 2) return null;
    return [raw[0] as IconsConfig, raw[1] as ImageSetsConfig];
  } catch {
    return null;
  }
}

// Re-use ExportEntry from presets to avoid circular deps
export interface ExportEntry {
  folder: string;
  filename: string;
  expectedSize: number;
}

function toExportEntry(folder: string, filename: string, expectedSize: number): ExportEntry {
  return { folder: folder.replace(/\/$/, ''), filename, expectedSize };
}

/** Idiom key in IconsConfig for filtering by device (iphone, ipad, watch, mac) */
export type IconIdiom = 'iphone' | 'ipad' | 'watch' | 'mac';

export type ApplePresetId = 'ios' | 'ipados' | 'macos' | 'watchos';

const APPICONSET_FOLDER_BY_PRESET: Record<ApplePresetId, string> = {
  ios: 'Assets.xcassets/AppIcon-iOS.appiconset',
  ipados: 'Assets.xcassets/AppIcon-iPadOS.appiconset',
  macos: 'Assets.xcassets/AppIcon-macOS.appiconset',
  watchos: 'Assets.xcassets/AppIcon-watchOS.appiconset',
};

const APPLE_PRESET_TO_IDIOM: Record<ApplePresetId, IconIdiom> = {
  ios: 'iphone',
  ipados: 'ipad',
  macos: 'mac',
  watchos: 'watch',
};

export function getApplePresetIdiom(presetId: ApplePresetId): IconIdiom {
  return APPLE_PRESET_TO_IDIOM[presetId];
}

export function getAppIconsetFolderByPresetId(presetId: ApplePresetId): string {
  return APPICONSET_FOLDER_BY_PRESET[presetId];
}

/** Favicon export folder */
export const FAVICON_FOLDER = 'favicon';

/** App Icon export entries from size.json icons. When idiom is set, only that device group. */
export function getAppIconExportEntriesFromConfig(icons: IconsConfig, idiom?: IconIdiom, outputFolder?: string): ExportEntry[] {
  const seen = new Set<string>();
  const out: ExportEntry[] = [];
  const groups = idiom && icons[idiom]?.length
    ? [icons[idiom]!]
    : [icons.iphone, icons.ipad, icons.watch, icons.mac].filter(Boolean) as IconEntry[][];
  for (const arr of groups) {
    for (const e of arr) {
      const folder = (outputFolder ?? e.folder ?? '').replace(/\/$/, '');
      const filename = e.filename || '';
      const key = `${folder}/${filename}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const expectedSize = parseInt(String(e['expected-size']), 10) || 0;
      if (expectedSize && filename) out.push(toExportEntry(folder, filename, expectedSize));
    }
  }
  return out;
}

/** Android export entries from size.json icons.android; optional customFilename overrides filename base */
export function getAndroidExportEntriesFromConfig(icons: IconsConfig, customFilename?: string): ExportEntry[] {
  const arr = icons.android;
  if (!arr?.length) return [];
  return arr.map((e) => {
    const folder = (e.folder || '').replace(/\/$/, '');
    const filename = customFilename ? `${customFilename}.png` : (e.filename || 'ic_launcher.png');
    const expectedSize = parseInt(String(e['expected-size']), 10) || 0;
    return toExportEntry(folder, filename, expectedSize);
  });
}

/** Store assets (appstore, playstore) from size.json icons.stores */
export function getStoresExportEntriesFromConfig(icons: IconsConfig): ExportEntry[] {
  const arr = icons.stores;
  if (!arr?.length) return [];
  return arr.map((e) => {
    const folder = (e.folder || '').replace(/\/$/, '');
    const expectedSize = parseInt(String(e['expected-size']), 10) || 0;
    return toExportEntry(folder, e.filename || '', expectedSize);
  });
}

/** Generate AppIcon Contents.json from size.json. When idiom is set, only that device's images; otherwise all */
export function generateAppIconContentsJsonFromConfig(icons: IconsConfig, idiom?: IconIdiom, includedFilenames?: Set<string>): string {
  const images: { size: string; filename: string; idiom: string; scale: string; subtype?: string; role?: string }[] = [];
  const groups = idiom && icons[idiom]?.length
    ? [icons[idiom]!]
    : [icons.iphone, icons.ipad, icons.watch, icons.mac].filter(Boolean) as IconEntry[][];
  for (const arr of groups) {
    for (const e of arr) {
      const filename = e.filename || '';
      if (!filename) continue;
      if (includedFilenames && !includedFilenames.has(filename)) continue;
      const item = {
        size: e.size || '1024x1024',
        filename,
        idiom: e.idiom || 'universal',
        scale: e.scale || '1x',
        ...(e.subtype && { subtype: e.subtype }),
        ...(e.role && { role: e.role }),
      };
      images.push(item);
    }
  }
  return JSON.stringify({ images, info: { author: 'xcode', version: 1 } }, null, 2);
}

export function generateAssetCatalogContentsJson(): string {
  return JSON.stringify({ info: { author: 'xcode', version: 1 } }, null, 2);
}

export interface ImageSetContentsImage {
  filename: string;
  scale: string;
}

export function generateImageSetContentsJson(images: ImageSetContentsImage[]): string {
  return JSON.stringify({
    images: images.map((image) => ({
      filename: image.filename,
      idiom: 'universal',
      scale: image.scale,
    })),
    info: { author: 'xcode', version: 1 },
  }, null, 2);
}

/** Image set platforms from size.json imagesets (ios, android) */
export function getImageSetPlatformsFromConfig(imagesets: ImageSetsConfig): Record<string, ImageSetEntry[]> {
  return {
    ios: imagesets.ios ?? [],
    android: imagesets.android ?? [],
  };
}

/** Favicon export entries from size.json icons.favicon */
export function getFaviconExportEntriesFromConfig(icons: IconsConfig): ExportEntry[] {
  const arr = icons.favicon;
  if (!arr?.length) return [];
  return arr.map((e) => {
    const folder = (e.folder || '').replace(/\/$/, '') || FAVICON_FOLDER;
    const filename = e.filename || '';
    const expectedSize = parseInt(String(e['expected-size']), 10) || 0;
    return toExportEntry(folder, filename, expectedSize);
  });
}
