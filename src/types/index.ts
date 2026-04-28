/**
 * Centralized type definitions for Icon Sizes
 * Re-exports from core modules and defines app-level types
 */

// Re-export from core/presets.ts
export type {
  IconSize,
  PlatformPreset,
  ScalePreset,
  ImageSetPlatformEntry,
  ExportEntry,
} from '../core/presets';

// Re-export from core/sizeConfig.ts
export type {
  IconEntry,
  AndroidIconEntry,
  StoreEntry,
  IconsConfig,
  ImageSetEntry,
  ImageSetsConfig,
  SizeConfig,
  IconIdiom,
} from '../core/sizeConfig';

// Re-export from core/exporter.ts
export type { ProgressCallback, ExportOptions, ExportResult, SaveZipResult } from '../core/exporter';

/**
 * Application mode
 */
export type AppMode = 'icons' | 'imagesets' | 'custom';

/**
 * Custom size entry for user-defined dimensions
 */
export interface CustomSizeEntry {
  id: string;
  width: number;
  height: number;
}

/**
 * Export progress state
 */
export interface ExportProgress {
  current: number;
  total: number;
  filename: string;
}

/**
 * Image set preview item
 */
export interface ImageSetPreviewItem {
  key: string;
  width: number;
  height: number;
  label: string;
  filename: string;
  folder: string;
}

/**
 * Platform info for UI display
 */
export interface PlatformInfo {
  id: string;
  name: string;
  count: number;
}
