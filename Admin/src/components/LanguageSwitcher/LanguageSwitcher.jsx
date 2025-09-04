import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import 'flag-icons/css/flag-icons.min.css';
import './LanguageSwitcher.css';

const LanguageSwitcher = () => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setIsOpen(false);
  };

  const getCurrentLanguageDisplay = () => {
    switch (i18n.language) {
      case 'vi': return { flag: 'fi fi-vn', code: 'VI', name: t('language.vietnamese') };
      case 'en': return { flag: 'fi fi-us', code: 'EN', name: t('language.english') };
      case 'sk': return { flag: 'fi fi-sk', code: 'SK', name: t('language.slovak') };
      default: return { flag: 'fi fi-us', code: 'EN', name: t('language.english') };
    }
  };

  const currentLang = getCurrentLanguageDisplay();

  return (
    <div className="language-switcher">
      <button 
        className="language-button"
        onClick={() => setIsOpen(!isOpen)}
        onBlur={() => setTimeout(() => setIsOpen(false), 150)}
      >
        <span className={currentLang.flag}></span>
        <span className="language-code">{currentLang.code}</span>
      </button>
      
      {isOpen && (
        <div className="language-dropdown">
          <button
            className={`language-option ${i18n.language === 'vi' ? 'active' : ''}`}
            onClick={() => changeLanguage('vi')}
          >
            <span className="fi fi-vn"></span>
            <span className="language-name">{t('language.vietnamese')}</span>
          </button>
          <button
            className={`language-option ${i18n.language === 'en' ? 'active' : ''}`}
            onClick={() => changeLanguage('en')}
          >
            <span className="fi fi-us"></span>
            <span className="language-name">{t('language.english')}</span>
          </button>
          <button
            className={`language-option ${i18n.language === 'sk' ? 'active' : ''}`}
            onClick={() => changeLanguage('sk')}
          >
            <span className="fi fi-sk"></span>
            <span className="language-name">{t('language.slovak')}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher; 