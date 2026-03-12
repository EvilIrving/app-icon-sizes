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
