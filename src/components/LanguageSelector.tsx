import React, { useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './LanguageSelector.css';

const LanguageSelector: React.FC = () => {
  const { i18n } = useTranslation();
  const selectorRef = useRef<HTMLDivElement>(null);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    const updatePosition = () => {
      if (selectorRef.current) {
        const rect = selectorRef.current.getBoundingClientRect();
        setDropdownStyle({
          top: `${rect.bottom + 4}px`,
          right: `${window.innerWidth - rect.right}px`,
        });
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, []);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const getCurrentFlag = () => {
    return i18n.language === 'sw' ? 
      <img src="/tz.svg" alt="Tanzania" className="language-flag" /> : 
      <img src="/uk.svg" alt="United Kingdom" className="language-flag" />;
  };

  return (
    <div className="language-selector" ref={selectorRef}>
      <div className="current-flag">
        {getCurrentFlag()}
      </div>
      <div className="language-options" style={dropdownStyle}>
        <button 
          onClick={() => changeLanguage('sw')} 
          className={`language-option ${i18n.language === 'sw' ? 'active' : ''}`}
          aria-label="Switch to Swahili"
        >
          <img src="/tz.svg" alt="Tanzania" className="language-flag" />
        </button>
        <button 
          onClick={() => changeLanguage('en')} 
          className={`language-option ${i18n.language === 'en' ? 'active' : ''}`}
          aria-label="Switch to English"
        >
          <img src="/uk.svg" alt="United Kingdom" className="language-flag" />
        </button>
      </div>
    </div>
  );
};

export default LanguageSelector;
