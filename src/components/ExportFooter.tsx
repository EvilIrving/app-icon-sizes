import { useI18n } from '../i18n';
import type { ExportProgress } from '../types';

export interface ExportFooterProps {
  mode: 'icons' | 'imagesets' | 'custom';
  presetCount: number;
  totalCount: number;
  canExport: boolean;
  isExporting: boolean;
  exportComplete: boolean;
  exportError: string | null;
  exportProgress: ExportProgress | null;
  onExport: () => void;
}

export default function ExportFooter({
  mode,
  presetCount,
  totalCount,
  canExport,
  isExporting,
  exportComplete,
  exportError,
  exportProgress,
  onExport,
}: ExportFooterProps) {
  const { t } = useI18n();

  const renderSummary = () => {
    if (mode === 'icons') {
      return (
        <>
          {presetCount} {presetCount !== 1 ? t('platforms') : t('platform')} ·{' '}
          <strong>{totalCount}</strong> {t('sizes')}
        </>
      );
    }
    if (mode === 'imagesets') {
      return (
        <>
          <strong>{totalCount}</strong> {t('images')}
        </>
      );
    }
    return (
      <>
        <strong>{totalCount}</strong> {t('sizes')}
      </>
    );
  };

  return (
    <div className="sidebar-footer">
      <div className="export-summary">{renderSummary()}</div>
      <button className="export-btn" disabled={!canExport} onClick={onExport}>
        {isExporting ? t('exporting') : t('export')}
      </button>
      {isExporting && exportProgress && (
        <div className="export-progress">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${(exportProgress.current / exportProgress.total) * 100}%` }}
            />
          </div>
          <div className="progress-text">
            {exportProgress.current}/{exportProgress.total}
          </div>
        </div>
      )}
      {exportComplete && <div className="export-success">{t('exportComplete')}</div>}
      {exportError && <div className="export-error">{exportError}</div>}
    </div>
  );
}
