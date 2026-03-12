import { useI18n } from '../i18n';
import type { AppMode } from '../types';

export interface ModeSelectorProps {
  mode: AppMode;
  onModeChange: (mode: AppMode) => void;
}

export default function ModeSelector({ mode, onModeChange }: ModeSelectorProps) {
  const { t } = useI18n();

  return (
    <div>
      <div className="segmented">
        <button
          className={`seg${mode === 'icons' ? ' active' : ''}`}
          onClick={() => onModeChange('icons')}
        >
          {t('modeIcons')}
        </button>
        <button
          className={`seg${mode === 'imagesets' ? ' active' : ''}`}
          onClick={() => onModeChange('imagesets')}
        >
          {t('modeImageSets')}
        </button>
        <button
          className={`seg${mode === 'custom' ? ' active' : ''}`}
          onClick={() => onModeChange('custom')}
        >
          {t('modeCustom')}
        </button>
      </div>
    </div>
  );
}
