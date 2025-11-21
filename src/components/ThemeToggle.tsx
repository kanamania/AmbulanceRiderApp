import React from 'react';
import { IonIcon, IonButton } from '@ionic/react';
import { moonOutline, sunnyOutline } from 'ionicons/icons';
import { useTheme } from '../contexts/useTheme';
import { useTranslation } from 'react-i18next';
import './ThemeToggle.css';

const ThemeToggle: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();
  const { t } = useTranslation();

  return (
    <IonButton
      fill="clear"
      onClick={toggleTheme}
      className="theme-toggle"
      title={isDark ? t('common.lightMode') : t('common.darkMode')}
    >
      <IonIcon
        slot="icon-only"
        icon={isDark ? sunnyOutline : moonOutline}
        className="theme-icon"
      />
    </IonButton>
  );
};

export default ThemeToggle;
