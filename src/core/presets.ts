/**
 * Icon size configuration for a single icon
 */
export interface IconSize {
  /** Width in pixels */
  width: number;
  /** Height in pixels */
  height: number;
  /** Output filename (without extension) */
  name: string;
  /** Optional scale factor for naming */
  scale?: string;
  /** Optional density folder name for Android */
  density?: string;
  /** Target device/platform for organization */
  target?: string;
}

/**
 * Platform preset configuration
 */
export interface PlatformPreset {
  /** Unique identifier */
  id: string;
  /** Display name */
  name: string;
  /** Description */
  description: string;
  /** Root directory name for output */
  outputDir: string;
  /** Icon sizes to generate */
  sizes: IconSize[];
  /** Whether to generate Contents.json for asset catalogs */
  generateContentsJson?: boolean;
  /** Whether to allow custom filename */
  allowCustomFilename?: boolean;
  /** Default filename */
  defaultFilename?: string;
  /** Grouped by target device */
  groupedByTarget?: boolean;
}

/**
 * Scale preset for image sets generator
 */
export interface ScalePreset {
  id: '3x' | '4x';
  name: string;
  scales: { scale: string; label: string }[];
}

export const SCALE_PRESETS: ScalePreset[] = [
  {
    id: '3x',
    name: '3x',
    scales: [
      { scale: '1x', label: '1x (base)' },
      { scale: '2x', label: '2x' },
      { scale: '3x', label: '3x' },
    ],
  },
  {
    id: '4x',
    name: '4x',
    scales: [
      { scale: '1x', label: '1x (base)' },
      { scale: '2x', label: '2x' },
      { scale: '3x', label: '3x' },
      { scale: '4x', label: '4x' },
    ],
  },
];

/**
 * Image set export structure (matches your module.exports):
 * ios: folder "ios", postfix @3x/@2x/"", scale 3/2/1
 * android: folder drawable-mdpi/hdpi/xhdpi/xxhdpi/xxxhdpi, scale 1/1.5/2/3/4
 */
export interface ImageSetPlatformEntry {
  postfix: string;
  folder: string;
  scale: number;
}

export const IMAGE_SET_PLATFORMS: Record<string, ImageSetPlatformEntry[]> = {
  ios: [
    { postfix: '@3x', folder: 'ios', scale: 3 },
    { postfix: '@2x', folder: 'ios', scale: 2 },
    { postfix: '', folder: 'ios', scale: 1 },
  ],
  android: [
    { postfix: '', folder: 'android/drawable-mdpi', scale: 1 },
    { postfix: '', folder: 'android/drawable-hdpi', scale: 1.5 },
    { postfix: '', folder: 'android/drawable-xhdpi', scale: 2 },
    { postfix: '', folder: 'android/drawable-xxhdpi', scale: 3 },
    { postfix: '', folder: 'android/drawable-xxxhdpi', scale: 4 },
  ],
};

/** Single export file entry: exact folder path and filename in zip, with pixel size to generate */
export interface ExportEntry {
  folder: string;
  filename: string;
  expectedSize: number;
}

/** Build a consistent zip entry path: forward slashes, no leading/double slashes */
export function toZipPath(folder: string, filename: string): string {
  const folderNorm = folder.replace(/\\/g, '/').replace(/\/+/g, '/').replace(/^\//, '').replace(/\/$/, '');
  const fileNorm = filename.replace(/\\/g, '/').replace(/^\//, '');
  return folderNorm ? `${folderNorm}/${fileNorm}` : fileNorm;
}

/** Parse "60x60" => 60, "83.5x83.5" => 83.5 */
function parseSizeNum(sizeStr: string): number {
  const n = sizeStr.split('x')[0];
  return n ? parseFloat(n) : 0;
}

/** Parse "3x" => 3, "2x" => 2, "1x" => 1 */
function parseScaleNum(scaleStr: string): number {
  const m = scaleStr?.replace('x', '');
  return m ? parseFloat(m) || 1 : 1;
}

/** Get actual pixel dimensions from IconSize: when scale is present, size is in points and we multiply by scale to get pixels (e.g. 512@2x => 1024). */
export function getExpectedPixelSize(size: IconSize): { width: number; height: number } {
  const scaleNum = size.scale ? parseScaleNum(size.scale) : 1;
  return {
    width: Math.round(size.width * scaleNum),
    height: Math.round(size.height * scaleNum),
  };
}

/**
 * All available platform presets
 */
export const PRESETS: PlatformPreset[] = [
  {
    id: 'ios',
    name: 'iOS',
    description: 'iPhone app icons',
    outputDir: 'ios',
    generateContentsJson: false,
    groupedByTarget: false,
    sizes: [
      // iPhone
      { width: 60, height: 60, name: 'icon-60', scale: '2x', target: 'iOS' },
      { width: 60, height: 60, name: 'icon-60', scale: '3x', target: 'iOS' },
      { width: 20, height: 20, name: 'icon-20', scale: '2x', target: 'iOS' },
      { width: 20, height: 20, name: 'icon-20', scale: '3x', target: 'iOS' },
      { width: 29, height: 29, name: 'icon-29', scale: '2x', target: 'iOS' },
      { width: 29, height: 29, name: 'icon-29', scale: '3x', target: 'iOS' },
      { width: 40, height: 40, name: 'icon-40', scale: '2x', target: 'iOS' },
      { width: 40, height: 40, name: 'icon-40', scale: '3x', target: 'iOS' },
    ],
  },
  {
    id: 'ipados',
    name: 'iPadOS',
    description: 'iPad app icons',
    outputDir: 'ipados',
    generateContentsJson: false,
    groupedByTarget: false,
    sizes: [
      // iPad
      { width: 76, height: 76, name: 'icon-76', scale: '1x', target: 'iPadOS' },
      { width: 76, height: 76, name: 'icon-76', scale: '2x', target: 'iPadOS' },
      { width: 83.5, height: 83.5, name: 'icon-83.5', scale: '2x', target: 'iPadOS' },
      { width: 20, height: 20, name: 'icon-20', scale: '1x', target: 'iPadOS' },
      { width: 20, height: 20, name: 'icon-20', scale: '2x', target: 'iPadOS' },
      { width: 29, height: 29, name: 'icon-29', scale: '1x', target: 'iPadOS' },
      { width: 29, height: 29, name: 'icon-29', scale: '2x', target: 'iPadOS' },
      { width: 40, height: 40, name: 'icon-40', scale: '1x', target: 'iPadOS' },
      { width: 40, height: 40, name: 'icon-40', scale: '2x', target: 'iPadOS' },
    ],
  },
  {
    id: 'macos',
    name: 'macOS',
    description: 'macOS app icons',
    outputDir: 'macos',
    generateContentsJson: false,
    groupedByTarget: false,
    sizes: [
      { width: 16, height: 16, name: 'icon-16', scale: '1x', target: 'macOS' },
      { width: 16, height: 16, name: 'icon-16', scale: '2x', target: 'macOS' },
      { width: 32, height: 32, name: 'icon-32', scale: '1x', target: 'macOS' },
      { width: 32, height: 32, name: 'icon-32', scale: '2x', target: 'macOS' },
      { width: 64, height: 64, name: 'icon-64', scale: '1x', target: 'macOS' },
      { width: 64, height: 64, name: 'icon-64', scale: '2x', target: 'macOS' },
      { width: 128, height: 128, name: 'icon-128', scale: '1x', target: 'macOS' },
      { width: 128, height: 128, name: 'icon-128', scale: '2x', target: 'macOS' },
      { width: 256, height: 256, name: 'icon-256', scale: '1x', target: 'macOS' },
      { width: 256, height: 256, name: 'icon-256', scale: '2x', target: 'macOS' },
      { width: 512, height: 512, name: 'icon-512', scale: '1x', target: 'macOS' },
      { width: 512, height: 512, name: 'icon-512', scale: '2x', target: 'macOS' },
      { width: 1024, height: 1024, name: 'icon-1024', scale: '1x', target: 'macOS' },
    ],
  },
  {
    id: 'watchos',
    name: 'watchOS',
    description: 'Apple Watch app icons',
    outputDir: 'watchos',
    generateContentsJson: false,
    groupedByTarget: false,
    sizes: [
      { width: 40, height: 40, name: 'icon-40', scale: '2x', target: 'watchOS' },
      { width: 44, height: 44, name: 'icon-44', scale: '2x', target: 'watchOS' },
      { width: 50, height: 50, name: 'icon-50', scale: '2x', target: 'watchOS' },
      { width: 86, height: 86, name: 'icon-86', scale: '2x', target: 'watchOS' },
      { width: 98, height: 98, name: 'icon-98', scale: '2x', target: 'watchOS' },
      { width: 108, height: 108, name: 'icon-108', scale: '2x', target: 'watchOS' },
      { width: 1024, height: 1024, name: 'icon-1024', scale: '1x', target: 'watchOS' },
    ],
  },
  {
    id: 'image-sets',
    name: 'Image Sets',
    description: 'Generate 1x/2x/3x or 1x/2x/3x/4x image sets',
    outputDir: 'images',
    generateContentsJson: true,
    allowCustomFilename: true,
    defaultFilename: 'image',
    sizes: [], // Will be populated based on selected scale preset
  },
  // Other Group
  {
    id: 'chrome',
    name: 'Chrome',
    description: 'Chrome extension icons',
    outputDir: 'chrome-extension',
    generateContentsJson: false,
    sizes: [
      { width: 16, height: 16, name: 'icon16' },
      { width: 32, height: 32, name: 'icon32' },
      { width: 48, height: 48, name: 'icon48' },
      { width: 128, height: 128, name: 'icon128' },
    ],
  },
  {
    id: 'android',
    name: 'Android',
    description: 'Android adaptive and legacy icons',
    outputDir: 'android',
    generateContentsJson: false,
    allowCustomFilename: true,
    defaultFilename: 'ic_launcher',
    sizes: [
      { width: 48, height: 48, name: 'ic_launcher', density: 'mdpi' },
      { width: 72, height: 72, name: 'ic_launcher', density: 'hdpi' },
      { width: 96, height: 96, name: 'ic_launcher', density: 'xhdpi' },
      { width: 144, height: 144, name: 'ic_launcher', density: 'xxhdpi' },
      { width: 192, height: 192, name: 'ic_launcher', density: 'xxxhdpi' },
    ],
  },
];

/**
 * Platform groups for UI organization
 */
export const PLATFORM_GROUPS = {
  apple: ['ios', 'ipados', 'macos', 'watchos', 'image-sets'],
  other: ['chrome', 'android'],
};

/**
 * Get preset by ID
 */
export function getPreset(id: string): PlatformPreset | undefined {
  return PRESETS.find(p => p.id === id);
}

/**
 * Get output filename for an icon size
 */
export function getOutputFilename(size: IconSize, preset: PlatformPreset, customFilename?: string): string {
  // Android uses density folders
  if (preset.id === 'android') {
    const filename = customFilename || preset.defaultFilename || size.name;
    return `${filename}.png`;
  }
  
  // Image Sets
  if (preset.id === 'image-sets') {
    const filename = customFilename || preset.defaultFilename || 'image';
    if (size.scale) {
      return `${filename}@${size.scale}.png`;
    }
    return `${filename}.png`;
  }
  
  // Chrome Extension and others
  return `${size.name}.png`;
}

/**
 * Get Android density folder
 */
export function getAndroidDensityFolder(density?: string): string {
  if (!density) return 'mipmap-mdpi';
  return `mipmap-${density}`;
}

/**
 * Get target devices from sizes
 */
export function getTargetDevices(preset: PlatformPreset): string[] {
  if (!preset.groupedByTarget) return [];
  const targets = new Set<string>();
  preset.sizes.forEach(size => {
    if (size.target) targets.add(size.target);
  });
  return Array.from(targets);
}

/**
 * Generate Contents.json for iOS asset catalog
 */
export function generateContentsJson(preset: PlatformPreset, customFilename?: string): string {
  const images = preset.sizes.map(size => {
    const scale = size.scale || '1x';
    let filename: string;
    
    if (preset.id === 'image-sets') {
      filename = `${customFilename || preset.defaultFilename || 'image'}@${scale}.png`;
    } else {
      filename = `${size.name}${scale !== '1x' ? '@' + scale : ''}.png`;
    }
    
    return {
      filename,
      idioms: ['universal'],
      scale: scale === '1x' ? '1x' : scale === '2x' ? '2x' : '3x',
    };
  });

  const contents = {
    images: images,
    info: {
      author: 'xcode',
      version: 1,
    },
  };

  return JSON.stringify(contents, null, 2);
}

/**
 * Generate Contents.json for image sets with scale preset
 */
export function generateImageSetsContentsJson(scalePreset: ScalePreset, customFilename: string): string {
  const images = scalePreset.scales.map(({ scale }) => ({
    filename: `${customFilename}@${scale}.png`,
    idioms: ['universal'],
    scale,
  }));

  const contents = {
    images,
    info: {
      author: 'xcode',
      version: 1,
    },
  };

  return JSON.stringify(contents, null, 2);
}

/** Xcode AppIcon.appiconset entries: idiom, size, scale, filename (matches your app size config) */
const APPICON_CONTENTS_ENTRIES: { idiom: string; size: string; scale: string; filename: string; subtype?: string; role?: string }[] = [
  { size: '60x60', idiom: 'iphone', scale: '3x', filename: '180.png' },
  { size: '40x40', idiom: 'iphone', scale: '2x', filename: '80.png' },
  { size: '40x40', idiom: 'iphone', scale: '3x', filename: '120.png' },
  { size: '60x60', idiom: 'iphone', scale: '2x', filename: '120.png' },
  { size: '57x57', idiom: 'iphone', scale: '1x', filename: '57.png' },
  { size: '29x29', idiom: 'iphone', scale: '2x', filename: '58.png' },
  { size: '29x29', idiom: 'iphone', scale: '1x', filename: '29.png' },
  { size: '29x29', idiom: 'iphone', scale: '3x', filename: '87.png' },
  { size: '57x57', idiom: 'iphone', scale: '2x', filename: '114.png' },
  { size: '20x20', idiom: 'iphone', scale: '2x', filename: '40.png' },
  { size: '20x20', idiom: 'iphone', scale: '3x', filename: '60.png' },
  { size: '1024x1024', idiom: 'ios-marketing', scale: '1x', filename: '1024.png' },
  { size: '40x40', idiom: 'ipad', scale: '2x', filename: '80.png' },
  { size: '72x72', idiom: 'ipad', scale: '1x', filename: '72.png' },
  { size: '76x76', idiom: 'ipad', scale: '2x', filename: '152.png' },
  { size: '50x50', idiom: 'ipad', scale: '2x', filename: '100.png' },
  { size: '29x29', idiom: 'ipad', scale: '2x', filename: '58.png' },
  { size: '76x76', idiom: 'ipad', scale: '1x', filename: '76.png' },
  { size: '29x29', idiom: 'ipad', scale: '1x', filename: '29.png' },
  { size: '50x50', idiom: 'ipad', scale: '1x', filename: '50.png' },
  { size: '72x72', idiom: 'ipad', scale: '2x', filename: '144.png' },
  { size: '40x40', idiom: 'ipad', scale: '1x', filename: '40.png' },
  { size: '83.5x83.5', idiom: 'ipad', scale: '2x', filename: '167.png' },
  { size: '20x20', idiom: 'ipad', scale: '1x', filename: '20.png' },
  { size: '20x20', idiom: 'ipad', scale: '2x', filename: '40.png' },
  { size: '86x86', idiom: 'watch', scale: '2x', filename: '172.png', subtype: '38mm', role: 'quickLook' },
  { size: '40x40', idiom: 'watch', scale: '2x', filename: '80.png', subtype: '38mm', role: 'appLauncher' },
  { size: '44x44', idiom: 'watch', scale: '2x', filename: '88.png', subtype: '40mm', role: 'appLauncher' },
  { size: '51x51', idiom: 'watch', scale: '2x', filename: '102.png', subtype: '45mm', role: 'appLauncher' },
  { size: '54x54', idiom: 'watch', scale: '2x', filename: '108.png', subtype: '49mm', role: 'appLauncher' },
  { size: '46x46', idiom: 'watch', scale: '2x', filename: '92.png', subtype: '41mm', role: 'appLauncher' },
  { size: '50x50', idiom: 'watch', scale: '2x', filename: '100.png', subtype: '44mm', role: 'appLauncher' },
  { size: '98x98', idiom: 'watch', scale: '2x', filename: '196.png', subtype: '42mm', role: 'quickLook' },
  { size: '108x108', idiom: 'watch', scale: '2x', filename: '216.png', subtype: '44mm', role: 'quickLook' },
  { size: '117x117', idiom: 'watch', scale: '2x', filename: '234.png', subtype: '45mm', role: 'quickLook' },
  { size: '129x129', idiom: 'watch', scale: '2x', filename: '258.png', subtype: '49mm', role: 'quickLook' },
  { size: '24x24', idiom: 'watch', scale: '2x', filename: '48.png', subtype: '38mm', role: 'notificationCenter' },
  { size: '27.5x27.5', idiom: 'watch', scale: '2x', filename: '55.png', subtype: '42mm', role: 'notificationCenter' },
  { size: '33x33', idiom: 'watch', scale: '2x', filename: '66.png', subtype: '45mm', role: 'notificationCenter' },
  { size: '29x29', idiom: 'watch', scale: '3x', filename: '87.png', role: 'companionSettings' },
  { size: '29x29', idiom: 'watch', scale: '2x', filename: '58.png', role: 'companionSettings' },
  { size: '1024x1024', idiom: 'watch-marketing', scale: '1x', filename: '1024.png' },
  { size: '128x128', idiom: 'mac', scale: '1x', filename: '128.png' },
  { size: '256x256', idiom: 'mac', scale: '1x', filename: '256.png' },
  { size: '128x128', idiom: 'mac', scale: '2x', filename: '256.png' },
  { size: '256x256', idiom: 'mac', scale: '2x', filename: '512.png' },
  { size: '32x32', idiom: 'mac', scale: '1x', filename: '32.png' },
  { size: '512x512', idiom: 'mac', scale: '1x', filename: '512.png' },
  { size: '16x16', idiom: 'mac', scale: '1x', filename: '16.png' },
  { size: '16x16', idiom: 'mac', scale: '2x', filename: '32.png' },
  { size: '32x32', idiom: 'mac', scale: '2x', filename: '64.png' },
  { size: '512x512', idiom: 'mac', scale: '2x', filename: '1024.png' },
];

/**
 * Generate Contents.json for Xcode AppIcon.appiconset (matches your app size config)
 */
export function generateAppIconContentsJson(): string {
  const images = APPICON_CONTENTS_ENTRIES.map(({ subtype, role, ...rest }) =>
    role || subtype ? { ...rest, ...(subtype && { subtype }), ...(role && { role }) } : rest
  );
  const contents = { images, info: { author: 'xcode', version: 1 } };
  return JSON.stringify(contents, null, 2);
}

const APPICON_FOLDER = 'Assets.xcassets/AppIcon.appiconset';

/** Export entries for iOS App Icon: folder + filename + expectedSize (deduplicated by path) */
export function getAppIconExportEntries(): ExportEntry[] {
  const seen = new Set<string>();
  const entries: ExportEntry[] = [];
  for (const e of APPICON_CONTENTS_ENTRIES) {
    const base = parseSizeNum(e.size);
    const scale = parseScaleNum(e.scale);
    const expectedSize = Math.round(base * scale);
    const folder = APPICON_FOLDER;
    const filename = e.filename;
    const key = `${folder}/${filename}`;
    if (seen.has(key)) continue;
    seen.add(key);
    entries.push({ folder, filename, expectedSize });
  }
  return entries;
}

/** Export entries for Android: folder = android/mipmap-{density}, filename = customName.png */
export function getAndroidExportEntries(customFilename: string): ExportEntry[] {
  const densityToFolder: Record<string, string> = {
    mdpi: 'android/mipmap-mdpi',
    hdpi: 'android/mipmap-hdpi',
    xhdpi: 'android/mipmap-xhdpi',
    xxhdpi: 'android/mipmap-xxhdpi',
    xxxhdpi: 'android/mipmap-xxxhdpi',
  };
  return (PRESETS.find(p => p.id === 'android')?.sizes ?? []).map((size) => ({
    folder: size.density ? densityToFolder[size.density] ?? `android/mipmap-${size.density}` : 'android',
    filename: `${customFilename}.png`,
    expectedSize: size.width,
  }));
}

/**
 * Get sizes for a specific target
 */
export function getSizesForTarget(preset: PlatformPreset, target: string): IconSize[] {
  return preset.sizes.filter(size => size.target === target);
}

/**
 * Get base size for image sets generator
 */
export function getBaseSizeForScale(scale: string, baseSize: number): number {
  const scaleNum = parseFloat(scale.replace('x', ''));
  return Math.round(baseSize / scaleNum);
}
