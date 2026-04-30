import { useTranslation } from 'react-i18next';
import './LanguageSwitcher.css';

function LanguageSwitcher() {
    const { i18n } = useTranslation();

    const languages = [
        { code: 'en', name: 'English', flag: '🇺🇸' },
        { code: 'tel', name: 'తెలుగు', flag: '🇮🇳' },
        { code: 'ml', name: 'മലയാളം', flag: '🇮🇳' },
        { code: 'kn', name: 'ಕನ್ನಡ', flag: '🇮🇳' },
        { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' },
        { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' }
    ];

    const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

    const changeLanguage = (langCode) => {
        i18n.changeLanguage(langCode);
    };

    return (
        <div className="language-switcher">
            <button className="language-button" title="Change Language">
                <span className="language-flag">{currentLanguage.flag}</span>
                <span className="language-code">{currentLanguage.code.toUpperCase()}</span>
            </button>
            <div className="language-dropdown">
                {languages.map((lang) => (
                    <button
                        key={lang.code}
                        className={`language-option ${i18n.language === lang.code ? 'active' : ''}`}
                        onClick={() => changeLanguage(lang.code)}
                    >
                        <span className="language-flag">{lang.flag}</span>
                        <span className="language-name">{lang.name}</span>
                        {i18n.language === lang.code && <span className="check-mark">✓</span>}
                    </button>
                ))}
            </div>
        </div>
    );
}

export default LanguageSwitcher;
