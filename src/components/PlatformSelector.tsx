import { useI18n } from '../i18n';
import type { PlatformPreset } from '../types';

export interface PlatformSelectorProps {
  selectedPlatforms: Set<string>;
  platforms: { id: string; preset: PlatformPreset }[];
  onToggle: (id: string) => void;
  androidFilename?: string;
  onAndroidFilenameChange?: (filename: string) => void;
}

export default function PlatformSelector({
  selectedPlatforms,
  platforms,
  onToggle,
  androidFilename,
  onAndroidFilenameChange,
}: PlatformSelectorProps) {
  const { t } = useI18n();

  return (
    <div>
      <div className="sb-label">{t('platformsLabel')}</div>
      <div className="platform-list">
        {platforms.map(({ id, preset }) => (
          <label
            key={id}
            className={`platform-item${selectedPlatforms.has(id) ? ' selected' : ''}`}
          >
            <input
              type="checkbox"
              checked={selectedPlatforms.has(id)}
              onChange={() => onToggle(id)}
            />
            <span className="cb" />
            <span className="platform-name">{preset.name}</span>
            <span className="platform-count">{preset.sizes.length}</span>
          </label>
        ))}
      </div>

      {selectedPlatforms.has('android') && androidFilename !== undefined && onAndroidFilenameChange && (
        <div>
          <div className="sb-label">{t('androidFilename')}</div>
          <input
            type="text"
            className="text-input"
            value={androidFilename}
            onChange={(e) => onAndroidFilenameChange(e.target.value)}
            placeholder="ic_launcher"
          />
          <div className="hint-text">{androidFilename}.png</div>
        </div>
      )}
    </div>
  );
}
