import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import JSZip from 'jszip';
import {
  PRESETS,
  IMAGE_SET_PLATFORMS,
  type PlatformPreset,
  getImageDimensions,
  getOutputFilename,
  getExpectedPixelSize,
  generateAppIconContentsJson,
  getAndroidExportEntries,
  toZipPath,
  loadSizeConfig,
  getAppIconExportEntriesFromConfig,
  getAndroidExportEntriesFromConfig,
  getImageSetPlatformsFromConfig,
  generateAppIconContentsJsonFromConfig,
  IDIOM_FOLDERS,
  type SizeConfig,
  type IconIdiom,
} from './core';
import { resizeImage, blobToArrayBuffer } from './core';
import { saveZipWithDialog } from './core';
import './App.css';

type AppMode = 'icons' | 'imagesets' | 'custom';

interface CustomSizeEntry {
  id: string;
  width: number;
  height: number;
}

const QUICK_SIZES = [16, 32, 48, 64, 128, 256, 512, 1024];

const ALL_PLATFORMS: { id: string; preset: PlatformPreset }[] = PRESETS
  .filter(p => p.id !== 'image-sets')
  .map(p => ({ id: p.id, preset: p }));

export default function App() {
  const [sourceImage, setSourceImage] = useState<Blob | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const previewBlobUrlRef = useRef<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
  const [dragOver, setDragOver] = useState(false);

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
  const [newWidth, setNewWidth] = useState('');
  const [newHeight, setNewHeight] = useState('');
  const [customOutputName, setCustomOutputName] = useState('icon');

  // Export
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<{ current: number; total: number; filename: string } | null>(null);
  const [exportComplete, setExportComplete] = useState(false);

  // size.json config (single source of truth for paths and filenames)
  const [sizeConfig, setSizeConfig] = useState<SizeConfig | null>(null);
  useEffect(() => {
    loadSizeConfig().then((c) => setSizeConfig(c));
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

  /** 多倍图基础尺寸（pt），实际像素 = imageSetBase * scale，输出如 image384@3x.png */
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
      const iconsCount = selectedPresets.reduce((a, p) => {
        const idiom = applePresetIdToIdiom[p.id];
        if (idiom && icons) return a + getAppIconExportEntriesFromConfig(icons, idiom).length;
        if (p.id === 'android') return a + (icons ? getAndroidExportEntriesFromConfig(icons, androidFilename).length : getAndroidExportEntries(androidFilename).length);
        return a + p.sizes.length;
      }, 0);
      let roots = 0;
      for (const p of selectedPresets) {
        if (applePresetIdToIdiom[p.id] || p.id === 'android') roots++;
      }
      return iconsCount + 2 * (roots || 1);
    }
    if (mode === 'imagesets') {
      const n = Array.from(imageSetPlatforms).reduce(
        (sum, id) => sum + (imageSetPlatformsResolved[id]?.length ?? 0),
        0
      );
      return n + 2 * Math.max(1, imageSetPlatforms.size);
    }
    return customSizes.length + 2;
  }, [mode, selectedPresets, customSizes, imageSetPlatforms, androidFilename, sizeConfig, imageSetPlatformsResolved, applePresetIdToIdiom]);

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

  const canExport = sourceImage && totalCount > 0 && !isExporting;

  // ── File Handling ──

  const isSvgFile = useCallback((file: File) =>
    file.type === 'image/svg+xml' || file.type === 'text/xml' || /\.svgz?$/i.test(file.name),
  []);

  const handleFileSelect = useCallback(async (file: File) => {
    const accepted = file.type.startsWith('image/') || isSvgFile(file);
    if (!accepted) return;
    setExportComplete(false);
    // Normalize SVG blob so preview and resize get correct MIME (some systems report "" or text/xml)
    let blob: Blob = file;
    if (isSvgFile(file) && file.type !== 'image/svg+xml') {
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
    // SVG in <img> often fails with blob URL; use data URL so preview renders reliably
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
  }, [isSvgFile]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const openFilePicker = useCallback(() => {
    document.getElementById('file-input')?.click();
  }, []);

  // ── Platform Toggle ──

  const togglePlatform = useCallback((id: string) => {
    setSelectedPlatforms(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  // ── Custom Sizes ──

  const addCustomSize = useCallback((w: number, h: number) => {
    if (w <= 0 || h <= 0 || w > 8192 || h > 8192) return;
    setCustomSizes(prev => {
      if (prev.some(s => s.width === w && s.height === h)) return prev;
      return [...prev, { id: `${w}x${h}-${Date.now()}`, width: w, height: h }];
    });
  }, []);

  const handleAddCustom = useCallback(() => {
    const w = parseInt(newWidth);
    const h = newHeight ? parseInt(newHeight) : w;
    if (!isNaN(w) && w > 0) {
      addCustomSize(w, isNaN(h) ? w : h);
      setNewWidth('');
      setNewHeight('');
    }
  }, [newWidth, newHeight, addCustomSize]);

  const removeCustomSize = useCallback((id: string) => {
    setCustomSizes(prev => prev.filter(s => s.id !== id));
  }, []);

  const clearCustomSizes = useCallback(() => setCustomSizes([]), []);

  const customSizeSet = useMemo(
    () => new Set(customSizes.map(s => `${s.width}x${s.height}`)),
    [customSizes],
  );

  // ── Export ──

  const handleExport = useCallback(async () => {
    if (!sourceImage) return;
    setIsExporting(true);
    setExportComplete(false);
    setExportProgress(null);

    try {
      const zip = new JSZip();
      let total = totalCount;
      let current = 0;
      const [icons] = sizeConfig ?? [];

      if (mode === 'icons') {
        const applePresetIds = new Set(['ios', 'ipados', 'macos', 'watchos']);
        for (const preset of selectedPresets) {
          if (applePresetIdToIdiom[preset.id] && icons) {
            const idiom = applePresetIdToIdiom[preset.id]!;
            const entries = getAppIconExportEntriesFromConfig(icons, idiom);
            for (const entry of entries) {
              const resized = await resizeImage(sourceImage, entry.expectedSize, entry.expectedSize);
              const data = await blobToArrayBuffer(resized);
              const zipPath = toZipPath(entry.folder, entry.filename);
              zip.file(zipPath, data);
              current++;
              setExportProgress({ current, total, filename: zipPath });
            }
            const contentsJson = generateAppIconContentsJsonFromConfig(icons, idiom);
            if (entries.length > 0) {
              zip.file(toZipPath(entries[0].folder, 'Contents.json'), contentsJson);
            }
          } else if (preset.id === 'android') {
            const entries = icons ? getAndroidExportEntriesFromConfig(icons, androidFilename) : getAndroidExportEntries(androidFilename);
            for (const entry of entries) {
              const resized = await resizeImage(sourceImage, entry.expectedSize, entry.expectedSize);
              const data = await blobToArrayBuffer(resized);
              const zipPath = toZipPath(entry.folder, entry.filename);
              zip.file(zipPath, data);
              current++;
              setExportProgress({ current, total, filename: zipPath });
            }
          } else {
            for (const size of preset.sizes) {
              const fn = preset.id === 'android' ? androidFilename : undefined;
              const filename = getOutputFilename(size, preset, fn);
              const { width: pxW, height: pxH } = getExpectedPixelSize(size);
              const resized = await resizeImage(sourceImage, pxW, pxH);
              const data = await blobToArrayBuffer(resized);
              const zipPath = toZipPath(preset.outputDir, filename);
              zip.file(zipPath, data);
              current++;
              setExportProgress({ current, total, filename: zipPath });
            }
          }
        }
        if (selectedPresets.some((p) => applePresetIds.has(p.id)) && !icons) {
          const contentsJson = generateAppIconContentsJson();
          zip.file(toZipPath('Assets.xcassets/AppIcon.appiconset', 'Contents.json'), contentsJson);
        }
      } else if (mode === 'imagesets' && imageDimensions) {
        const base = imageSetBase;
        for (const platformId of imageSetPlatforms) {
          const entries = imageSetPlatformsResolved[platformId];
          if (!entries) continue;
          for (const { postfix, folder, scale } of entries) {
            const pixelSize = Math.round(base * scale);
            const w = pixelSize;
            const h = pixelSize;
            const resized = await resizeImage(sourceImage, w, h);
            const data = await blobToArrayBuffer(resized);
            const filename = `${imageSetFilename}${pixelSize}${postfix}.png`;
            const zipPath = toZipPath(folder, filename);
            zip.file(zipPath, data);
            current++;
            setExportProgress({ current, total, filename: zipPath });
          }
        }
      } else if (mode === 'custom') {
        for (const size of customSizes) {
          const resized = await resizeImage(sourceImage, size.width, size.height);
          const data = await blobToArrayBuffer(resized);
          const filename = `${customOutputName}-${size.width}x${size.height}.png`;
          zip.file(filename, data);
          current++;
          setExportProgress({ current, total, filename });
        }
      }

      // 默认在每个平台根目录下放 appstore.png (1024) 和 playstore.png (512)，与 Assets.xcassets / mipmap-xhdpi 同级
      const platformRoots: string[] = [];
      if (mode === 'icons') {
        for (const p of selectedPresets) {
          const idiom = applePresetIdToIdiom[p.id];
          if (idiom) platformRoots.push(IDIOM_FOLDERS[idiom]);
          else if (p.id === 'android') platformRoots.push('android');
        }
      } else if (mode === 'imagesets') {
        platformRoots.push(...Array.from(imageSetPlatforms));
      }
      if (platformRoots.length === 0) platformRoots.push('');

      const appstoreBlob = await resizeImage(sourceImage, 1024, 1024);
      const playstoreBlob = await resizeImage(sourceImage, 512, 512);
      const appstoreData = await blobToArrayBuffer(appstoreBlob);
      const playstoreData = await blobToArrayBuffer(playstoreBlob);

      for (const root of platformRoots) {
        const appstorePath = toZipPath(root, 'appstore.png');
        const playstorePath = toZipPath(root, 'playstore.png');
        zip.file(appstorePath, appstoreData);
        current++;
        setExportProgress({ current, total, filename: appstorePath });
        zip.file(playstorePath, playstoreData);
        current++;
        setExportProgress({ current, total, filename: playstorePath });
      }

      const zipData = await zip.generateAsync({ type: 'arraybuffer' });
      const random6 = String(Math.floor(Math.random() * 1e6)).padStart(6, '0');
      const zipPrefix = mode === 'icons' ? 'appicons' : mode === 'imagesets' ? 'imagesets' : 'custom';
      await saveZipWithDialog(zipData, `${zipPrefix}-${random6}.zip`);
      setExportComplete(true);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsExporting(false);
      setExportProgress(null);
    }
  }, [sourceImage, mode, selectedPresets, androidFilename, imageSetPlatforms, imageDimensions, imageSetFilename, imageSetBase, customSizes, customOutputName, totalCount, sizeConfig, imageSetPlatformsResolved, applePresetIdToIdiom]);

  // ── Render helpers ──

  const renderSummary = () => {
    if (mode === 'icons') {
      return <>{selectedPresets.length} platform{selectedPresets.length !== 1 ? 's' : ''} · <strong>{totalCount}</strong> sizes</>;
    }
    if (mode === 'imagesets') {
      return <><strong>{totalCount}</strong> images</>;
    }
    return <><strong>{customSizes.length}</strong> sizes</>;
  };

  const getIconFilename = (size: { name: string; scale?: string; density?: string }, preset: PlatformPreset) => {
    if (preset.id === 'android') {
      return `${androidFilename}.png`;
    }
    if (size.scale) return `${size.name}@${size.scale}.png`;
    return `${size.name}.png`;
  };

  // ── Render ──

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-scroll">
          {/* Source */}
          <div>
            <div className="sb-label">SOURCE</div>
            <div
              className={`source-zone${dragOver ? ' drag-over' : ''}${imagePreview ? ' has-image' : ''}`}
              onDrop={handleDrop}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onClick={openFilePicker}
            >
              {imagePreview ? (
                <div className="source-preview">
                  <div className="source-thumb">
                    <img src={imagePreview} alt="Source" />
                  </div>
                  <div className="source-meta">
                    <div className="source-dims">
                      {imageDimensions?.width} × {imageDimensions?.height}
                    </div>
                    <div className="source-change">Click to change</div>
                  </div>
                </div>
              ) : (
                <div className="source-empty">
                  <svg className="source-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="3" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="m21 15-5-5L5 21" />
                  </svg>
                  <p>Drop image here</p>
                  <p className="hint">支持 PNG、SVG 等，拖入或点击选择</p>
                </div>
              )}
            </div>
            <input
              id="file-input"
              type="file"
              accept="image/*,.svg,image/svg+xml"
              className="hidden-input"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }}
            />
          </div>

          {/* Mode */}
          <div>
            <div className="segmented">
              <button className={`seg${mode === 'icons' ? ' active' : ''}`} onClick={() => setMode('icons')}>App Icons</button>
              <button className={`seg${mode === 'imagesets' ? ' active' : ''}`} onClick={() => setMode('imagesets')}>Image Sets</button>
              <button className={`seg${mode === 'custom' ? ' active' : ''}`} onClick={() => setMode('custom')}>Custom</button>
            </div>
          </div>

          <div className="sb-divider" />

          {/* ── App Icons Mode ── */}
          {mode === 'icons' && (
            <>
              <div>
                <div className="sb-label">PLATFORMS</div>
                <div className="platform-list">
                  {ALL_PLATFORMS.map(({ id, preset }) => (
                    <label
                      key={id}
                      className={`platform-item${selectedPlatforms.has(id) ? ' selected' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedPlatforms.has(id)}
                        onChange={() => togglePlatform(id)}
                      />
                      <span className="cb" />
                      <span className="platform-name">{preset.name}</span>
                      <span className="platform-count">{preset.sizes.length}</span>
                    </label>
                  ))}
                </div>
              </div>

              {selectedPlatforms.has('android') && (
                <div>
                  <div className="sb-label">ANDROID FILENAME</div>
                  <input
                    type="text"
                    className="text-input"
                    value={androidFilename}
                    onChange={e => setAndroidFilename(e.target.value)}
                    placeholder="ic_launcher"
                  />
                  <div className="hint-text">{androidFilename}.png</div>
                </div>
              )}
            </>
          )}

          {/* ── Image Sets Mode ── */}
          {mode === 'imagesets' && (
            <>
              <div>
                <div className="sb-label">PLATFORMS</div>
                <div className="platform-list">
                  {['ios', 'android'].map((id) => (
                    <label
                      key={id}
                      className={`platform-item${imageSetPlatforms.has(id) ? ' selected' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={imageSetPlatforms.has(id)}
                        onChange={() => {
                          setImageSetPlatforms((prev) => {
                            const next = new Set(prev);
                            next.has(id) ? next.delete(id) : next.add(id);
                            return next;
                          });
                        }}
                      />
                      <span className="cb" />
                      <span className="platform-name">{id === 'ios' ? 'iOS' : 'Android'}</span>
                      <span className="platform-count">{imageSetPlatformsResolved[id]?.length ?? 0}</span>
                    </label>
                  ))}
                </div>
                <div className="hint-text mt-6">
                  iOS: ios/ (1x, @2x, @3x). Android: drawable-*dpi (1x, 1.5x, 2x, 3x)
                </div>
              </div>

              <div>
                <div className="sb-label">FILENAME</div>
                <input
                  type="text"
                  className="text-input"
                  value={imageSetFilename}
                  onChange={e => setImageSetFilename(e.target.value)}
                  placeholder="image"
                />
              </div>
            </>
          )}

          {/* ── Custom Mode ── */}
          {mode === 'custom' && (
            <>
              <div>
                <div className="sb-label-row">
                  <div className="sb-label">SIZES</div>
                  {customSizes.length > 0 && (
                    <button className="link-btn" onClick={clearCustomSizes}>Clear all</button>
                  )}
                </div>

                <div className="quick-sizes">
                  {QUICK_SIZES.map(s => (
                    <button
                      key={s}
                      className={`chip${customSizeSet.has(`${s}x${s}`) ? ' in-list' : ''}`}
                      onClick={() => addCustomSize(s, s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>

                <div className="size-input-row">
                  <input
                    type="number"
                    className="text-input"
                    placeholder="W"
                    value={newWidth}
                    min={1}
                    max={8192}
                    onChange={e => setNewWidth(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddCustom()}
                  />
                  <span className="sep">×</span>
                  <input
                    type="number"
                    className="text-input"
                    placeholder="H"
                    value={newHeight}
                    min={1}
                    max={8192}
                    onChange={e => setNewHeight(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddCustom()}
                  />
                  <button
                    className="add-btn"
                    onClick={handleAddCustom}
                    disabled={!newWidth || parseInt(newWidth) <= 0}
                  >
                    +
                  </button>
                </div>

                <div className="size-list">
                  {customSizes.length === 0 ? (
                    <div className="size-list-empty">No sizes added</div>
                  ) : (
                    customSizes.map(s => (
                      <div key={s.id} className="size-row">
                        <span>{s.width} × {s.height}</span>
                        <button className="remove-btn" onClick={() => removeCustomSize(s.id)}>×</button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div>
                <div className="sb-label">OUTPUT FILENAME</div>
                <input
                  type="text"
                  className="text-input"
                  value={customOutputName}
                  onChange={e => setCustomOutputName(e.target.value)}
                  placeholder="icon"
                />
                <div className="hint-text mt-4">{customOutputName}-{'{'}<em>w</em>{'}'}x{'{'}<em>h</em>{'}'}.png</div>
              </div>
            </>
          )}
        </div>

        {/* Export Footer */}
        <div className="sidebar-footer">
          <div className="export-summary">{renderSummary()}</div>
          <button className="export-btn" disabled={!canExport} onClick={handleExport}>
            {isExporting ? 'Exporting…' : 'Export'}
          </button>
          {isExporting && exportProgress && (
            <div className="export-progress">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${(exportProgress.current / exportProgress.total) * 100}%` }} />
              </div>
              <div className="progress-text">{exportProgress.current}/{exportProgress.total}</div>
            </div>
          )}
          {exportComplete && <div className="export-success">Export complete</div>}
        </div>
      </aside>

      {/* ── Content ── */}
      <main className="content">
        {!sourceImage && (
          <div className="empty-state">
            <svg className="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="3" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="m21 15-5-5L5 21" />
            </svg>
            <h3>No image selected</h3>
            <p>Upload a source image to preview generated icons</p>
          </div>
        )}

        {/* App Icons preview */}
        {sourceImage && mode === 'icons' && selectedPresets.length === 0 && (
          <div className="empty-state">
            <h3>No platforms selected</h3>
            <p>Select platforms from the sidebar to preview</p>
          </div>
        )}

        {sourceImage && mode === 'icons' && selectedPresets.length > 0 && (
          <div className="preview-groups">
            {selectedPresets.map(preset => (
              <div key={preset.id}>
                <div className="group-header">
                  <h3>{preset.name}</h3>
                  <span className="group-count">{preset.sizes.length} sizes</span>
                </div>
                <div className="preview-grid">
                  {preset.sizes.map((size, i) => {
                    const fn = getIconFilename(size, preset);
                    const { width: pxW, height: pxH } = getExpectedPixelSize(size);
                    const sizeLabel = size.density
                      ? `${size.width}×${size.height} · ${size.density}`
                      : `${pxW}×${pxH}`;
                    return (
                      <div key={i} className="preview-card">
                        <div className="card-icon" style={{ width: Math.min(80, pxW), height: Math.min(80, pxH), margin: '0 auto 8px' }}>
                          <img src={imagePreview!} alt={fn} />
                        </div>
                        <div className="card-name">{fn}</div>
                        <div className="card-size">{sizeLabel}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Image Sets preview */}
        {sourceImage && mode === 'imagesets' && (
          <div className="preview-groups">
            <div>
              <div className="group-header">
                <h3>Image Sets</h3>
                <span className="group-count">{imageSetPreviewItems.length} images</span>
              </div>
              {imageSetPreviewItems.length > 0 ? (
                <div className="preview-grid">
                  {imageSetPreviewItems.map((s) => (
                    <div key={s.key} className="preview-card">
                      <div className="card-icon" style={{ width: Math.min(80, s.width), height: Math.min(80, s.height)}}>
                        <img src={imagePreview!} alt={s.label} />
                      </div>
                      <div className="card-name">{s.folder}/{s.filename}</div>
                      <div className="card-size">{s.width} × {s.height}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state" style={{ minHeight: 200 }}>
                  <p>Select iOS and/or Android and upload an image</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Custom Sizes preview */}
        {sourceImage && mode === 'custom' && customSizes.length === 0 && (
          <div className="empty-state">
            <h3>No sizes defined</h3>
            <p>Add sizes from the sidebar to preview</p>
          </div>
        )}

        {sourceImage && mode === 'custom' && customSizes.length > 0 && (
          <div className="preview-groups">
            <div>
              <div className="group-header">
                <h3>Custom Sizes</h3>
                <span className="group-count">{customSizes.length} sizes</span>
              </div>
              <div className="preview-grid">
                {customSizes.map(s => (
                  <div key={s.id} className="preview-card">
                    <div className="card-icon" style={{ width: Math.min(80, s.width), height: Math.min(80, s.height)}}>
                      <img src={imagePreview!} alt={`${s.width}x${s.height}`} />
                    </div>
                    <div className="card-name">{customOutputName}-{s.width}x{s.height}.png</div>
                    <div className="card-size">{s.width} × {s.height}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
