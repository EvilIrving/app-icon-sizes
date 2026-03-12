import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import JSZip from 'jszip';
import {
  PRESETS,
  IMAGE_SET_PLATFORMS,
  type PlatformPreset,
  getImageDimensions,
  toZipPath,
  loadSizeConfig,
  type SizeConfig,
  type IconIdiom,
  getAppIconExportEntriesFromConfig,
  getAndroidExportEntriesFromConfig,
  getStoresExportEntriesFromConfig,
  getFaviconExportEntriesFromConfig,
  generateAppIconContentsJsonFromConfig,
  getImageSetPlatformsFromConfig,
} from './core';
import { resizeImage, blobToArrayBuffer, saveZipWithDialog } from './core';
import { createIcoFile, blobToUint8Array } from './utils/icoEncoder';
import { useI18n } from './i18n';
import { LanguageSwitcher } from './i18n';
import SourceImageUploader from './components/SourceImageUploader';
import ModeSelector from './components/ModeSelector';
import PlatformSelector from './components/PlatformSelector';
import CustomSizeManager from './components/CustomSizeManager';
import PreviewGrid from './components/PreviewGrid';
import ExportFooter from './components/ExportFooter';
import ImageSetConfig from './components/ImageSetConfig';
import type { AppMode, CustomSizeEntry, ExportProgress } from './types';
import './App.css';

const ALL_PLATFORMS: { id: string; preset: PlatformPreset }[] = PRESETS
  .filter(p => p.id !== 'image-sets')
  .map(p => ({ id: p.id, preset: p }));

export default function App() {
  const { t } = useI18n();
  const [sourceImage, setSourceImage] = useState<Blob | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const previewBlobUrlRef = useRef<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    return () => {
      if (previewBlobUrlRef.current) URL.revokeObjectURL(previewBlobUrlRef.current);
    };
  }, []);

  const [mode, setMode] = useState<AppMode>('icons');

  // App Icons
  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<string>>(new Set(['ios']));
  const [androidFilename, setAndroidFilename] = useState('ic_launcher');

  // Image Sets
  const [imageSetFilename, setImageSetFilename] = useState('image');
  const [imageSetPlatforms, setImageSetPlatforms] = useState<Set<string>>(new Set(['ios', 'android']));

  // Custom Sizes
  const [customSizes, setCustomSizes] = useState<CustomSizeEntry[]>([]);
  const [customOutputName, setCustomOutputName] = useState('icon');

  // Export
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<ExportProgress | null>(null);
  const [exportComplete, setExportComplete] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  // New: Store images toggle
  const [includeStoreImages, setIncludeStoreImages] = useState(true);

  // New: Excluded sizes (user can remove individual sizes from preview)
  const [excludedSizes, setExcludedSizes] = useState<Set<string>>(new Set());

  // size.json config
  const [sizeConfig, setSizeConfig] = useState<SizeConfig | null>(null);
  const [sizeConfigLoaded, setSizeConfigLoaded] = useState(false);
  useEffect(() => {
    loadSizeConfig().then((c) => {
      console.log('size.json loaded:', c?.[0]?.favicon?.length ? `favicon has ${c[0].favicon.length} entries` : 'no favicon');
      setSizeConfig(c);
      setSizeConfigLoaded(true);
    });
  }, []);

  // ── Computed ──

  const selectedPresets = useMemo(
    () => PRESETS.filter(p => selectedPlatforms.has(p.id) && p.id !== 'image-sets'),
    [selectedPlatforms],
  );

  const imageSetPlatformsResolved = useMemo(() => {
    if (sizeConfig) return getImageSetPlatformsFromConfig(sizeConfig[1]);
    return IMAGE_SET_PLATFORMS;
  }, [sizeConfig]);

  const imageSetBase = sizeConfig?.[1]?.base ?? 128;

  const applePresetIdToIdiom: Record<string, IconIdiom | undefined> = useMemo(() => ({
    'ios': 'iphone',
    'ipados': 'ipad',
    'macos': 'mac',
    'watchos': 'watch',
  }), []);

  const totalCount = useMemo(() => {
    if (mode === 'icons') {
      const [icons] = sizeConfig ?? [];
      let iconsCount = selectedPresets.reduce((a, p) => {
        const idiom = applePresetIdToIdiom[p.id];
        if (idiom && icons) return a + getAppIconExportEntriesFromConfig(icons, idiom).length;
        if (p.id === 'android' && icons) return a + getAndroidExportEntriesFromConfig(icons, androidFilename).length;
        return a + p.sizes.length;
      }, 0);

      // Add favicon count (1 ico file) if favicon platform is selected
      const [iconsConfig] = sizeConfig ?? [];
      if (selectedPlatforms.has('favicon') && iconsConfig?.favicon?.length) {
        iconsCount += 1;
      }

      // Add store images count
      if (includeStoreImages && iconsConfig?.stores?.length) {
        iconsCount += iconsConfig.stores.length;
      }

      return iconsCount;
    }
    if (mode === 'imagesets') {
      const n = Array.from(imageSetPlatforms).reduce(
        (sum, id) => sum + (imageSetPlatformsResolved[id]?.length ?? 0),
        0
      );
      return n;
    }
    return customSizes.length;
  }, [mode, selectedPresets, customSizes, imageSetPlatforms, androidFilename, sizeConfig, imageSetPlatformsResolved, applePresetIdToIdiom, includeStoreImages]);

  const imageSetPreviewItems = useMemo(() => {
    if (!imageDimensions) return [];
    return Array.from(imageSetPlatforms).flatMap((platformId) =>
      (imageSetPlatformsResolved[platformId] ?? []).map((entry, i) => {
        const pixelSize = Math.round(imageSetBase * entry.scale);
        return {
          key: `${platformId}-${i}`,
          width: pixelSize,
          height: pixelSize,
          label: entry.postfix || '1x',
          filename: `${imageSetFilename}${pixelSize}${entry.postfix}.png`,
          folder: entry.folder,
        };
      })
    );
  }, [imageSetPlatforms, imageDimensions, imageSetFilename, imageSetPlatformsResolved, imageSetBase]);

  const faviconPreviewItems = useMemo(() => {
    if (!imageDimensions || !selectedPlatforms.has('favicon')) return [];
    const [iconsConfig] = sizeConfig ?? [];
    if (!iconsConfig?.favicon?.length) return [];
    // Show only one favicon.ico entry
    return [{
      key: 'favicon-ico',
      width: 64,
      height: 64,
      label: 'ICO',
      filename: 'favicon.ico',
      folder: iconsConfig.favicon[0].folder || 'favicon',
    }];
  }, [imageDimensions, selectedPlatforms, sizeConfig]);

  const canExport = !!sourceImage && totalCount > 0 && !isExporting;

  // ── File Handling ──

  const handleImageSelect = useCallback(async (file: File) => {
    const accepted = file.type.startsWith('image/');
    if (!accepted) return;

    setExportComplete(false);

    let blob: Blob = file;
    if (file.type === 'image/svg+xml' || file.type === 'text/xml' || /\.svgz?$/i.test(file.name)) {
      try {
        const buf = await file.arrayBuffer();
        blob = new Blob([buf], { type: 'image/svg+xml' });
      } catch {
        blob = file;
      }
    }

    setSourceImage(blob);

    if (previewBlobUrlRef.current) {
      URL.revokeObjectURL(previewBlobUrlRef.current);
      previewBlobUrlRef.current = null;
    }

    let previewUrl: string;
    if (blob.type === 'image/svg+xml') {
      const text = await blob.text();
      previewUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(text);
    } else {
      previewUrl = URL.createObjectURL(blob);
      previewBlobUrlRef.current = previewUrl;
    }
    setImagePreview(previewUrl);

    try {
      const dims = await getImageDimensions(blob);
      setImageDimensions(dims);
    } catch { /* ignore */ }
  }, []);

  const togglePlatform = useCallback((id: string) => {
    setSelectedPlatforms(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const addCustomSize = useCallback((w: number, h: number) => {
    if (w <= 0 || h <= 0 || w > 8192 || h > 8192) return;
    setCustomSizes(prev => {
      if (prev.some(s => s.width === w && s.height === h)) return prev;
      return [...prev, { id: `${w}x${h}-${Date.now()}`, width: w, height: h }];
    });
  }, []);

  const removeCustomSize = useCallback((id: string) => {
    setCustomSizes(prev => prev.filter(s => s.id !== id));
  }, []);

  const clearCustomSizes = useCallback(() => setCustomSizes([]), []);

  // ── Excluded Sizes ──

  const excludeSize = useCallback((key: string) => {
    setExcludedSizes(prev => new Set(prev).add(key));
  }, []);

  const clearExcludedSizes = useCallback(() => setExcludedSizes(new Set()), []);

  // Reset excluded sizes when source image changes
  useEffect(() => {
    clearExcludedSizes();
  }, [sourceImage, clearExcludedSizes]);

  // ── Export ──

  const handleExport = useCallback(async () => {
    if (!sourceImage) return;

    setIsExporting(true);
    setExportComplete(false);
    setExportError(null);
    setExportProgress(null);

    try {
      const zip = new JSZip();
      let total = totalCount;
      let current = 0;
      const [icons] = sizeConfig ?? [];

      if (mode === 'icons') {
        for (const preset of selectedPresets) {
          if (applePresetIdToIdiom[preset.id] && icons) {
            const idiom = applePresetIdToIdiom[preset.id]!;
            const entries = getAppIconExportEntriesFromConfig(icons, idiom);
            let firstEntryFolder = '';
            for (let i = 0; i < entries.length; i++) {
              const entry = entries[i];
              const key = `${preset.id}-${i}`;
              if (excludedSizes.has(key)) continue;

              const resized = await resizeImage(sourceImage, entry.expectedSize, entry.expectedSize);
              const data = await blobToArrayBuffer(resized);
              const zipPath = toZipPath(entry.folder, entry.filename);
              zip.file(zipPath, data);
              current++;
              setExportProgress({ current, total, filename: zipPath });
              if (!firstEntryFolder) firstEntryFolder = entry.folder;
            }
            const contentsJson = generateAppIconContentsJsonFromConfig(icons, idiom);
            if (entries.length > 0) {
              const contentsFolder = firstEntryFolder.replace(/\/[^/]+$/, '');
              zip.file(toZipPath(contentsFolder, 'Contents.json'), contentsJson);
            }
          } else if (preset.id === 'android' && icons) {
            const entries = getAndroidExportEntriesFromConfig(icons, androidFilename);
            for (let i = 0; i < entries.length; i++) {
              const entry = entries[i];
              const key = `${preset.id}-${i}`;
              if (excludedSizes.has(key)) continue;

              const resized = await resizeImage(sourceImage, entry.expectedSize, entry.expectedSize);
              const data = await blobToArrayBuffer(resized);
              const zipPath = toZipPath(entry.folder, entry.filename);
              zip.file(zipPath, data);
              current++;
              setExportProgress({ current, total, filename: zipPath });
            }
          } else {
            for (let i = 0; i < preset.sizes.length; i++) {
              const size = preset.sizes[i];
              const key = `${preset.id}-${i}`;
              if (excludedSizes.has(key)) continue;

              const filename = `${size.name}.png`;
              const scale = size.scale ? parseFloat(size.scale.replace('x', '')) : 1;
              const expectedSize = Math.round(size.width * scale);
              const resized = await resizeImage(sourceImage, expectedSize, expectedSize);
              const data = await blobToArrayBuffer(resized);
              const zipPath = toZipPath(preset.outputDir, filename);
              zip.file(zipPath, data);
              current++;
              setExportProgress({ current, total, filename: zipPath });
            }
          }
        }

        // Export favicon if configured and selected
        if (selectedPlatforms.has('favicon') && icons?.favicon?.length) {
          const faviconEntries = getFaviconExportEntriesFromConfig(icons);
          const pngBlobs: Blob[] = [];

          // Generate PNGs for ICO encoding (not exported separately)
          for (let i = 0; i < faviconEntries.length; i++) {
            const entry = faviconEntries[i];
            const resized = await resizeImage(sourceImage, entry.expectedSize, entry.expectedSize);
            pngBlobs.push(resized);
          }

          // Generate favicon.ico using browser-compatible encoder
          if (pngBlobs.length > 0) {
            try {
              // Convert PNG blobs to Uint8Arrays with their sizes
              const pngImages = await Promise.all(
                faviconEntries.map(async (entry, i) => {
                  if (!pngBlobs[i]) return null;
                  return {
                    width: entry.expectedSize,
                    height: entry.expectedSize,
                    pngData: await blobToUint8Array(pngBlobs[i]),
                  };
                })
              );

              const validImages = pngImages.filter((img): img is { width: number; height: number; pngData: Uint8Array } => img !== null);

              if (validImages.length > 0) {
                const icoBuffer = await createIcoFile(validImages);
                zip.file(toZipPath(icons.favicon[0].folder || 'favicon', 'favicon.ico'), icoBuffer);
                current++;
                setExportProgress({ current, total, filename: 'favicon.ico' });
              }
            } catch (err) {
              console.error('Failed to generate favicon.ico:', err);
            }
          }
        }

        // Export store images if enabled
        if (includeStoreImages && icons?.stores?.length) {
          const storeEntries = getStoresExportEntriesFromConfig(icons);
          for (const entry of storeEntries) {
            const resized = await resizeImage(sourceImage, entry.expectedSize, entry.expectedSize);
            const data = await blobToArrayBuffer(resized);
            zip.file(toZipPath(entry.folder || '', entry.filename), data);
            current++;
            setExportProgress({ current, total, filename: toZipPath(entry.folder || '', entry.filename) });
          }
        }
      } else if (mode === 'imagesets' && imageDimensions) {
        const base = imageSetBase;
        for (let platformIdx = 0; platformIdx < Array.from(imageSetPlatforms).length; platformIdx++) {
          const platformId = Array.from(imageSetPlatforms)[platformIdx];
          const entries = imageSetPlatformsResolved[platformId];
          if (!entries) continue;
          for (let entryIdx = 0; entryIdx < entries.length; entryIdx++) {
            const { postfix, folder, scale } = entries[entryIdx];
            const key = `${platformId}-${entryIdx}`;
            if (excludedSizes.has(key)) continue;

            const pixelSize = Math.round(base * scale);
            const resized = await resizeImage(sourceImage, pixelSize, pixelSize);
            const data = await blobToArrayBuffer(resized);
            const filename = `${imageSetFilename}${pixelSize}${postfix}.png`;
            const zipPath = toZipPath(folder, filename);
            zip.file(zipPath, data);
            current++;
            setExportProgress({ current, total, filename: zipPath });
          }
        }
      } else if (mode === 'custom') {
        for (let i = 0; i < customSizes.length; i++) {
          const size = customSizes[i];
          const key = `custom-${size.id}`;
          if (excludedSizes.has(key)) continue;

          const resized = await resizeImage(sourceImage, size.width, size.height);
          const data = await blobToArrayBuffer(resized);
          const filename = `${customOutputName}-${size.width}x${size.height}.png`;
          zip.file(filename, data);
          current++;
          setExportProgress({ current, total, filename });
        }
      }

      const zipData = await zip.generateAsync({ type: 'arraybuffer' });
      const random6 = String(Math.floor(Math.random() * 1e6)).padStart(6, '0');
      const zipPrefix = mode === 'icons' ? 'appicons' : mode === 'imagesets' ? 'imagesets' : 'custom';
      const result = await saveZipWithDialog(zipData, `${zipPrefix}-${random6}.zip`);

      if (result.saved) {
        setExportComplete(true);
        if (result.path) {
          try {
            const { revealItemInDir } = await import('@tauri-apps/plugin-opener');
            await revealItemInDir(result.path);
          } catch (_) { /* opener not available */ }
          try {
            const { isPermissionGranted, requestPermission, sendNotification } = await import('@tauri-apps/plugin-notification');
            if (!(await isPermissionGranted())) await requestPermission();
            sendNotification({ title: t('appTitle'), body: t('exportSuccessBody') });
          } catch (_) { /* notification not available */ }
        }
      }
    } catch (err) {
      console.error('Export failed:', err);
      setExportError(t('exportFailed'));
    } finally {
      setIsExporting(false);
      setExportProgress(null);
    }
  }, [sourceImage, mode, selectedPresets, androidFilename, imageSetPlatforms, imageDimensions, imageSetFilename, imageSetBase, customSizes, customOutputName, totalCount, sizeConfig, imageSetPlatformsResolved, applePresetIdToIdiom, includeStoreImages, t]);

  // ── Render ──

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-scroll">
          <LanguageSwitcher />
          <div className="sb-divider" />

          <SourceImageUploader
            imagePreview={imagePreview}
            imageDimensions={imageDimensions}
            onImageSelect={handleImageSelect}
          />

          <div className="sb-divider" />

          <ModeSelector mode={mode} onModeChange={setMode} />

          <div className="sb-divider" />

          {mode === 'icons' && (
            <>
              <PlatformSelector
                selectedPlatforms={selectedPlatforms}
                platforms={ALL_PLATFORMS}
                onToggle={togglePlatform}
                androidFilename={androidFilename}
                onAndroidFilenameChange={setAndroidFilename}
              />

              {/* Favicon option - shown if size.json has favicon entries */}
              {!sizeConfigLoaded ? (
                <div className="hint-text">Loading sizes...</div>
              ) : sizeConfig?.[0]?.favicon?.length ? (
                <div className="mt-4">
                  <label className={`platform-item${selectedPlatforms.has('favicon') ? ' selected' : ''}`}>
                    <input
                      type="checkbox"
                      checked={selectedPlatforms.has('favicon')}
                      onChange={() => {
                        setSelectedPlatforms(prev => {
                          const next = new Set(prev);
                          next.has('favicon') ? next.delete('favicon') : next.add('favicon');
                          return next;
                        });
                      }}
                    />
                    <span className="cb" />
                    <span className="platform-name">Favicon</span>
                    <span className="platform-count">{sizeConfig[0].favicon.length}</span>
                  </label>
                  {excludedSizes.size > 0 && (
                    <button className="link-btn mt-2" onClick={clearExcludedSizes}>
                      Restore {excludedSizes.size} removed item{excludedSizes.size > 1 ? 's' : ''}
                    </button>
                  )}
                </div>
              ) : (
                <div className="hint-text">No favicon configured in size.json</div>
              )}

              {/* Store Images Toggle */}
              <div className="mt-4">
                <label className={`platform-item${includeStoreImages ? ' selected' : ''}`}>
                  <input
                    type="checkbox"
                    checked={includeStoreImages}
                    onChange={(e) => setIncludeStoreImages(e.target.checked)}
                  />
                  <span className="cb" />
                  <span className="platform-name">{t('includeStoreImages')}</span>
                  <span className="platform-count">{sizeConfig?.[0]?.stores?.length ?? 2}</span>
                </label>
                <div className="hint-text mt-6">App Store (1024×1024) and Play Store (512×512)</div>
              </div>
            </>
          )}

          {mode === 'imagesets' && (
            <ImageSetConfig
              imageSetPlatforms={imageSetPlatforms}
              imageSetFilename={imageSetFilename}
              platformEntries={imageSetPlatformsResolved}
              onPlatformToggle={(id) => {
                setImageSetPlatforms(prev => {
                  const next = new Set(prev);
                  next.has(id) ? next.delete(id) : next.add(id);
                  return next;
                });
              }}
              onFilenameChange={setImageSetFilename}
            />
          )}

          {mode === 'custom' && (
            <CustomSizeManager
              customSizes={customSizes}
              customOutputName={customOutputName}
              onAddSize={(w, h) => addCustomSize(w, h)}
              onRemoveSize={removeCustomSize}
              onClearAll={clearCustomSizes}
              onOutputNameChange={setCustomOutputName}
            />
          )}
        </div>

        <ExportFooter
          mode={mode}
          presetCount={selectedPresets.length}
          totalCount={totalCount}
          canExport={canExport}
          isExporting={isExporting}
          exportComplete={exportComplete}
          exportError={exportError}
          exportProgress={exportProgress}
          onExport={handleExport}
        />
      </aside>

      <main className="content">
        {!sourceImage && (
          <div className="empty-state">
            <svg className="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="3" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="m21 15-5-5L5 21" />
            </svg>
            <h3>{t('noImageSelected')}</h3>
            <p>{t('uploadImageHint')}</p>
          </div>
        )}

        {sourceImage && mode === 'icons' && selectedPresets.length === 0 && selectedPlatforms.has('favicon') === false && (
          <div className="empty-state">
            <h3>{t('noPlatformsSelected')}</h3>
            <p>{t('selectPlatformsHint')}</p>
          </div>
        )}

        {sourceImage && (
          <PreviewGrid
            key={mode}
            imagePreview={imagePreview}
            sourceImage={sourceImage}
            mode={mode}
            presets={mode === 'icons' ? selectedPresets : undefined}
            androidFilename={mode === 'icons' ? androidFilename : undefined}
            faviconPreviewItems={mode === 'icons' ? faviconPreviewItems : undefined}
            previewItems={mode === 'imagesets' ? imageSetPreviewItems : undefined}
            customSizes={mode === 'custom' ? customSizes : undefined}
            outputName={mode === 'custom' ? customOutputName : undefined}
            excludedSizes={excludedSizes}
            onExcludeSize={excludeSize}
          />
        )}
      </main>
    </div>
  );
}
