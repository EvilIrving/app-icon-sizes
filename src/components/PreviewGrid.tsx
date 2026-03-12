import { useI18n } from '../i18n';
import type { PlatformPreset, IconSize, ImageSetPreviewItem, CustomSizeEntry, AppMode } from '../types';
import { resizeImage } from '../core';

export interface PreviewGridBaseProps {
  imagePreview: string | null;
  sourceImage: Blob | null;
}

export interface IconsPreviewProps extends PreviewGridBaseProps {
  mode: 'icons';
  presets: PlatformPreset[];
  androidFilename?: string;
  faviconPreviewItems?: ImageSetPreviewItem[];
  excludedSizes: Set<string>;
  onExcludeSize: (key: string) => void;
}

export interface ImageSetsPreviewProps extends PreviewGridBaseProps {
  mode: 'imagesets';
  previewItems: ImageSetPreviewItem[];
  excludedSizes: Set<string>;
  onExcludeSize: (key: string) => void;
  onIncludeSize: (key: string) => void;
}

export interface CustomPreviewProps extends PreviewGridBaseProps {
  mode: 'custom';
  customSizes: CustomSizeEntry[];
  outputName: string;
  excludedSizes: Set<string>;
  onExcludeSize: (key: string) => void;
  onIncludeSize: (key: string) => void;
}

export type PreviewGridComponentProps = IconsPreviewProps | ImageSetsPreviewProps | CustomPreviewProps;

export interface PreviewGridProps extends PreviewGridBaseProps {
  mode: AppMode;
  presets?: PlatformPreset[];
  androidFilename?: string;
  faviconPreviewItems?: ImageSetPreviewItem[];
  previewItems?: ImageSetPreviewItem[];
  customSizes?: CustomSizeEntry[];
  outputName?: string;
  excludedSizes: Set<string>;
  onExcludeSize: (key: string) => void;
}

function getIconFilename(size: IconSize, preset: PlatformPreset, androidFilename?: string): string {
  if (preset.id === 'android') {
    return `${androidFilename || 'ic_launcher'}.png`;
  }
  if (size.scale) return `${size.name}@${size.scale}.png`;
  return `${size.name}.png`;
}

function getExpectedPixelSize(size: IconSize): { width: number; height: number } {
  const scale = size.scale ? parseFloat(size.scale.replace('x', '')) : 1;
  return {
    width: Math.round(size.width * scale),
    height: Math.round(size.height * scale),
  };
}

function getScaleSortValue(size: IconSize): number {
  return size.scale ? parseFloat(size.scale.replace('x', '')) || 1 : 1;
}

function sortSizesAscending(sizes: IconSize[]): Array<{ size: IconSize; originalIndex: number }> {
  return sizes
    .map((size, originalIndex) => ({ size, originalIndex }))
    .sort((a, b) => {
      const aPixels = getExpectedPixelSize(a.size);
      const bPixels = getExpectedPixelSize(b.size);
      const aArea = aPixels.width * aPixels.height;
      const bArea = bPixels.width * bPixels.height;

      if (aArea !== bArea) return aArea - bArea;
      if (a.size.width !== b.size.width) return a.size.width - b.size.width;
      if (a.size.height !== b.size.height) return a.size.height - b.size.height;
      return getScaleSortValue(a.size) - getScaleSortValue(b.size);
    });
}

/**
 * Download a single resized image
 */
async function downloadSingleImage(
  sourceImage: Blob,
  width: number,
  height: number,
  filename: string
) {
  try {
    const resized = await resizeImage(sourceImage, width, height);
    const url = URL.createObjectURL(resized);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Failed to download image:', err);
  }
}

export default function PreviewGrid(props: PreviewGridProps) {
  const { t } = useI18n();
  const { imagePreview, sourceImage, mode, excludedSizes, onExcludeSize } = props;

  if (!imagePreview || !sourceImage) return null;

  const handleDownload = async (width: number, height: number, filename: string) => {
    await downloadSingleImage(sourceImage, width, height, filename);
  };

  if (mode === 'icons') {
    const { presets = [], androidFilename, faviconPreviewItems = [] } = props;
    if (presets.length === 0) return null;

    return (
      <div className="preview-groups">
        {presets.map(preset => (
          <div key={preset.id}>
            <div className="group-header">
              <h3>{preset.name}</h3>
              <span className="group-count">{preset.sizes.length} {t('sizes')}</span>
            </div>
            <div className="preview-grid">
              {sortSizesAscending(preset.sizes).map(({ size, originalIndex }) => {
                const fn = getIconFilename(size, preset, androidFilename);
                const { width: pxW, height: pxH } = getExpectedPixelSize(size);
                const sizeLabel = size.density
                  ? `${size.width}×${size.height} · ${size.density}`
                  : `${pxW}×${pxH}`;
                const key = `${preset.id}-${originalIndex}`;
                const isExcluded = excludedSizes.has(key);

                if (isExcluded) return null;

                return (
                  <div key={key} className="preview-card">
                    <button
                      className="card-remove-btn"
                      onClick={() => onExcludeSize(key)}
                      title={t('remove')}
                    >
                      ✕
                    </button>
                    <div className="card-icon" style={{ width: Math.min(80, pxW), height: Math.min(80, pxH), margin: '0 auto 8px' }}>
                      <img src={imagePreview} alt={fn} />
                    </div>
                    <div className="card-name">{fn}</div>
                    <div className="card-size">{sizeLabel}</div>
                    <button
                      className="card-download-btn"
                      onClick={() => handleDownload(pxW, pxH, fn)}
                      title={t('download')}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7 10 12 15 17 10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Favicon Preview */}
        {faviconPreviewItems.length > 0 && (
          <div>
            <div className="group-header">
              <h3>Favicon</h3>
              <span className="group-count">1 {t('sizes')}</span>
            </div>
            <div className="preview-grid">
              {faviconPreviewItems.map((s) => (
                <div key={s.key} className="preview-card">
                  <div className="card-icon" style={{ width: Math.min(80, s.width), height: Math.min(80, s.height) }}>
                    <img src={imagePreview} alt={s.label} />
                  </div>
                  <div className="card-name">{s.folder}/{s.filename}</div>
                  <div className="card-size">Multi-size ICO</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (mode === 'imagesets') {
    const { previewItems = [] } = props;

    return (
      <div className="preview-groups">
        <div>
          <div className="group-header">
            <h3>{t('imageSets')}</h3>
            <span className="group-count">{previewItems.length} {t('images')}</span>
          </div>
          {previewItems.length > 0 ? (
            <div className="preview-grid">
              {previewItems.map((s) => {
                const key = s.key;
                const isExcluded = excludedSizes.has(key);

                if (isExcluded) return null;

                return (
                  <div key={key} className="preview-card">
                    <button
                      className="card-remove-btn"
                      onClick={() => onExcludeSize(key)}
                      title={t('remove')}
                    >
                      ✕
                    </button>
                    <div className="card-icon" style={{ width: Math.min(80, s.width), height: Math.min(80, s.height) }}>
                      <img src={imagePreview} alt={s.label} />
                    </div>
                    <div className="card-name">{s.folder}/{s.filename}</div>
                    <div className="card-size">{s.width} × {s.height}</div>
                    <button
                      className="card-download-btn"
                      onClick={() => handleDownload(s.width, s.height, s.filename)}
                      title={t('download')}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7 10 12 15 17 10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state" style={{ minHeight: 200 }}>
              <p>{t('selectPlatformHint')}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (mode === 'custom') {
    const { customSizes = [], outputName = '' } = props;

    if (customSizes.length === 0) {
      return (
        <div className="empty-state">
          <h3>{t('noSizesDefined')}</h3>
          <p>{t('addSizesHint')}</p>
        </div>
      );
    }

    return (
      <div className="preview-groups">
        <div>
          <div className="group-header">
            <h3>{t('customSizes')}</h3>
            <span className="group-count">{customSizes.length} {t('sizes')}</span>
          </div>
          <div className="preview-grid">
            {customSizes.map(s => {
              const key = `custom-${s.id}`;
              const isExcluded = excludedSizes.has(key);

              if (isExcluded) return null;

              return (
                <div key={s.id} className="preview-card">
                  <button
                    className="card-remove-btn"
                    onClick={() => onExcludeSize(key)}
                    title={t('remove')}
                  >
                    ✕
                  </button>
                  <div className="card-icon" style={{ width: Math.min(80, s.width), height: Math.min(80, s.height) }}>
                    <img src={imagePreview} alt={`${s.width}x${s.height}`} />
                  </div>
                  <div className="card-name">{outputName}-{s.width}x{s.height}.png</div>
                  <div className="card-size">{s.width} × {s.height}</div>
                  <button
                    className="card-download-btn"
                    onClick={() => handleDownload(s.width, s.height, `${outputName}-${s.width}x${s.height}.png`)}
                    title={t('download')}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="7 10 12 15 17 10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
