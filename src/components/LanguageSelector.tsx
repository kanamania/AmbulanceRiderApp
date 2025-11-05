import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { IonButton, IonIcon, IonSelect, IonSelectOption } from '@ionic/react';
import { language } from 'ionicons/icons';
import './LanguageSelector.css';

const LanguageSelector: React.FC = () => {
  const { i18n } = useTranslation();
  const languageSelectRef = useRef<HTMLIonSelectElement>(null);

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  const openLanguageSelect = () => {
    languageSelectRef.current?.open();
  };

  return (
    <>
      <IonButton onClick={openLanguageSelect} fill="clear">
        <IonIcon slot="icon-only" icon={language} />
      </IonButton>
      <IonSelect
        ref={languageSelectRef}
        value={i18n.language}
        onIonChange={(e) => handleLanguageChange(e.detail.value)}
        interface="action-sheet"
        style={{ display: 'none' }}
      >
        <IonSelectOption value="en">English</IonSelectOption>
        <IonSelectOption value="sw">Kiswahili</IonSelectOption>
      </IonSelect>
    </>
  );
};

export default LanguageSelector;
