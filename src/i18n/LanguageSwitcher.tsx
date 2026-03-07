import { useI18n } from './I18nContext';

export function LanguageSwitcher() {
  const { language, setLanguage } = useI18n();

  return (
    <div className="language-switcher segmented">
      <button
        className={`seg${language === 'en' ? ' active' : ''}`}
        onClick={() => setLanguage('en')}
        type="button"
      >
        EN
      </button>
      <button
        className={`seg${language === 'zh' ? ' active' : ''}`}
        onClick={() => setLanguage('zh')}
        type="button"
      >
        中文
      </button>
    </div>
  );
}
