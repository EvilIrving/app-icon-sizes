import { useI18n } from '../i18n';
import type { ImageSetEntry } from '../types';

export interface ImageSetConfigProps {
  imageSetPlatforms: Set<string>;
  imageSetFilename: string;
  platformEntries: Record<string, ImageSetEntry[]>;
  onPlatformToggle: (platform: string) => void;
  onFilenameChange: (filename: string) => void;
}

export default function ImageSetConfig({
  imageSetPlatforms,
  imageSetFilename,
  platformEntries,
  onPlatformToggle,
  onFilenameChange,
}: ImageSetConfigProps) {
  const { t } = useI18n();

  return (
    <>
      <div>
        <div className="sb-label">{t('platformsLabel')}</div>
        <div className="platform-list">
          {['ios', 'android'].map((id) => (
            <label
              key={id}
              className={`platform-item${imageSetPlatforms.has(id) ? ' selected' : ''}`}
            >
              <input
                type="checkbox"
                checked={imageSetPlatforms.has(id)}
                onChange={() => onPlatformToggle(id)}
              />
              <span className="cb" />
              <span className="platform-name">{id === 'ios' ? 'iOS' : 'Android'}</span>
              <span className="platform-count">{platformEntries[id]?.length ?? 0}</span>
            </label>
          ))}
        </div>
        <div className="hint-text mt-6">{t('imageSetsHint')}</div>
      </div>

      <div>
        <div className="sb-label">{t('filename')}</div>
        <input
          type="text"
          className="text-input"
          value={imageSetFilename}
          onChange={(e) => onFilenameChange(e.target.value)}
          placeholder="image"
        />
      </div>
    </>
  );
}
