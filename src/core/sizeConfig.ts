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
}

export interface ImageSetEntry {
  postfix: string;
  folder: string;
  scale: number;
}

export interface ImageSetsConfig {
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

/** Per-idiom output folder so iOS / iPadOS / macOS / watchOS are separate */
export const IDIOM_FOLDERS: Record<IconIdiom, string> = {
  iphone: 'ios',
  ipad: 'ipados',
  watch: 'watchos',
  mac: 'macos',
};

/** App Icon export entries from size.json icons. When idiom is set, only that device group; folder = platformPrefix + size.json folder so structure is preserved (e.g. ios/Assets.xcassets/AppIcon.appiconset/) */
export function getAppIconExportEntriesFromConfig(icons: IconsConfig, idiom?: IconIdiom): ExportEntry[] {
  const seen = new Set<string>();
  const out: ExportEntry[] = [];
  const groups = idiom && icons[idiom]?.length
    ? [icons[idiom]!]
    : [icons.iphone, icons.ipad, icons.watch, icons.mac].filter(Boolean) as IconEntry[][];
  const prefix = idiom ? IDIOM_FOLDERS[idiom] : '';
  for (const arr of groups) {
    for (const e of arr) {
      const innerFolder = (e.folder || '').replace(/\/$/, '');
      const folder = prefix ? (prefix + '/' + innerFolder) : innerFolder;
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
export function generateAppIconContentsJsonFromConfig(icons: IconsConfig, idiom?: IconIdiom): string {
  const images: { size: string; filename: string; idiom: string; scale: string; subtype?: string; role?: string }[] = [];
  const groups = idiom && icons[idiom]?.length
    ? [icons[idiom]!]
    : [icons.iphone, icons.ipad, icons.watch, icons.mac].filter(Boolean) as IconEntry[][];
  for (const arr of groups) {
    for (const e of arr) {
      const item = {
        size: e.size || '1024x1024',
        filename: e.filename || '',
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

/** Image set platforms from size.json imagesets (ios, android) */
export function getImageSetPlatformsFromConfig(imagesets: ImageSetsConfig): Record<string, ImageSetEntry[]> {
  return {
    ios: imagesets.ios ?? [],
    android: imagesets.android ?? [],
  };
}
