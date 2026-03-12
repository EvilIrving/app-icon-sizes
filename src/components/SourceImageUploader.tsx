import { useState, useCallback, useRef, useEffect } from 'react';
import { useI18n } from '../i18n';

export interface SourceImageUploaderProps {
  imagePreview: string | null;
  imageDimensions: { width: number; height: number } | null;
  onImageSelect: (file: File) => void;
}

export default function SourceImageUploader({
  imagePreview,
  imageDimensions,
  onImageSelect,
}: SourceImageUploaderProps) {
  const { t } = useI18n();
  const [dragOver, setDragOver] = useState(false);
  const previewBlobUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewBlobUrlRef.current) URL.revokeObjectURL(previewBlobUrlRef.current);
    };
  }, []);

  const isSvgFile = useCallback((file: File) =>
    file.type === 'image/svg+xml' || file.type === 'text/xml' || /\.svgz?$/i.test(file.name),
  []);

  const getMimeTypeFromPath = useCallback((path: string) => {
    const normalized = path.toLowerCase();

    if (normalized.endsWith('.png')) return 'image/png';
    if (normalized.endsWith('.jpg') || normalized.endsWith('.jpeg')) return 'image/jpeg';
    if (normalized.endsWith('.webp')) return 'image/webp';
    if (normalized.endsWith('.gif')) return 'image/gif';
    if (normalized.endsWith('.bmp')) return 'image/bmp';
    if (normalized.endsWith('.ico')) return 'image/x-icon';
    if (normalized.endsWith('.svg') || normalized.endsWith('.svgz')) return 'image/svg+xml';

    return 'application/octet-stream';
  }, []);

  const getFilenameFromPath = useCallback((path: string) => {
    const segments = path.split(/[/\\]/);
    return segments[segments.length - 1] || 'image';
  }, []);

  const handleFileSelect = useCallback(async (file: File) => {
    const accepted = file.type.startsWith('image/') || isSvgFile(file);
    if (!accepted) return;

    // Normalize SVG blob so preview and resize get correct MIME
    if (isSvgFile(file) && file.type !== 'image/svg+xml') {
      try {
        const buf = await file.arrayBuffer();
        file = new File([buf], file.name, { type: 'image/svg+xml' });
      } catch {
        // ignore
      }
    }

    onImageSelect(file);
  }, [isSvgFile, onImageSelect]);

  const handleNativeDropPath = useCallback(async (path: string) => {
    try {
      const [{ readFile }, { convertFileSrc }] = await Promise.all([
        import('@tauri-apps/plugin-fs'),
        import('@tauri-apps/api/core'),
      ]);
      const bytes = await readFile(path);
      const filename = getFilenameFromPath(path);
      const mimeType = getMimeTypeFromPath(path);
      const file = new File([bytes], filename, { type: mimeType });

      if (mimeType === 'application/octet-stream') {
        const previewUrl = convertFileSrc(path);
        if (!/\.(png|jpe?g|webp|gif|bmp|ico|svgz?)$/i.test(previewUrl)) return;
      }

      await handleFileSelect(file);
    } catch (error) {
      console.error('Failed to load dropped file from native path:', error);
    }
  }, [getFilenameFromPath, getMimeTypeFromPath, handleFileSelect]);

  useEffect(() => {
    let unlisten: (() => void) | undefined;
    let disposed = false;

    const registerNativeDrop = async () => {
      try {
        const { getCurrentWindow } = await import('@tauri-apps/api/window');
        unlisten = await getCurrentWindow().onDragDropEvent(async (event) => {
          if (disposed) return;

          if (event.payload.type === 'enter' || event.payload.type === 'over') {
            setDragOver(true);
            return;
          }

          if (event.payload.type === 'leave') {
            setDragOver(false);
            return;
          }

          if (event.payload.type === 'drop') {
            setDragOver(false);
            const path = event.payload.paths[0];
            if (path) {
              await handleNativeDropPath(path);
            }
          }
        });
      } catch {
        // Browser mode or unsupported runtime: keep HTML5 drag-and-drop only.
      }
    };

    void registerNativeDrop();

    return () => {
      disposed = true;
      unlisten?.();
    };
  }, [handleNativeDropPath]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const openFilePicker = useCallback(() => {
    document.getElementById('file-input')?.click();
  }, []);

  return (
    <div>
      <div className="sb-label">{t('source')}</div>
      <div
        className={`source-zone${dragOver ? ' drag-over' : ''}${imagePreview ? ' has-image' : ''}`}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
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
              <div className="source-change">{t('clickToChange')}</div>
            </div>
          </div>
        ) : (
          <div className="source-empty">
            <svg className="source-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="3" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="m21 15-5-5L5 21" />
            </svg>
            <p>{t('dropImage')}</p>
            <p className="hint">{t('supportedFormats')}</p>
          </div>
        )}
      </div>
      <input
        id="file-input"
        type="file"
        accept="image/*,.svg,image/svg+xml"
        className="hidden-input"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }}
      />
    </div>
  );
}
