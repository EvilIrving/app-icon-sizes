import { useState, useCallback, useMemo } from 'react';
import { useI18n } from '../i18n';
import type { CustomSizeEntry } from '../types';

const QUICK_SIZES = [16, 32, 48, 64, 128, 256, 512, 1024];

export interface CustomSizeManagerProps {
  customSizes: CustomSizeEntry[];
  customOutputName: string;
  onAddSize: (width: number, height: number) => void;
  onRemoveSize: (id: string) => void;
  onClearAll: () => void;
  onOutputNameChange: (name: string) => void;
}

export default function CustomSizeManager({
  customSizes,
  customOutputName,
  onAddSize,
  onRemoveSize,
  onClearAll,
  onOutputNameChange,
}: CustomSizeManagerProps) {
  const { t } = useI18n();
  const [newWidth, setNewWidth] = useState('');
  const [newHeight, setNewHeight] = useState('');

  const addCustomSize = useCallback((w: number, h: number) => {
    if (w <= 0 || h <= 0 || w > 8192 || h > 8192) return;
    onAddSize(w, h);
  }, [onAddSize]);

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
    onRemoveSize(id);
  }, [onRemoveSize]);

  const clearCustomSizes = useCallback(() => {
    onClearAll();
  }, [onClearAll]);

  const customSizeSet = useMemo(
    () => new Set(customSizes.map(s => `${s.width}x${s.height}`)),
    [customSizes]
  );

  return (
    <>
      <div>
        <div className="sb-label-row">
          <div className="sb-label">{t('sizesLabel')}</div>
          {customSizes.length > 0 && (
            <button className="link-btn" onClick={clearCustomSizes}>{t('clearAll')}</button>
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
            onChange={(e) => setNewWidth(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddCustom()}
          />
          <span className="sep">×</span>
          <input
            type="number"
            className="text-input"
            placeholder="H"
            value={newHeight}
            min={1}
            max={8192}
            onChange={(e) => setNewHeight(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddCustom()}
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
            <div className="size-list-empty">{t('noSizesAdded')}</div>
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
        <div className="sb-label">{t('outputFilename')}</div>
        <input
          type="text"
          className="text-input"
          value={customOutputName}
          onChange={(e) => onOutputNameChange(e.target.value)}
          placeholder="icon"
        />
        <div className="hint-text mt-4">{customOutputName}-{'{'}<em>w</em>{'}'}x{'{'}<em>h</em>{'}'}.png</div>
      </div>
    </>
  );
}
