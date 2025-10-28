import React from 'react';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon
} from '@ionic/react';
import { menuOutline } from 'ionicons/icons';
import LanguageSelector from './LanguageSelector';
import ThemeToggle from './ThemeToggle';
import './AppHeader.css';

interface AppHeaderProps {
  title: string;
  showMenu?: boolean;
  onMenuClick?: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({ title, showMenu = false, onMenuClick }) => {
  return (
    <IonHeader>
      <IonToolbar>
        {showMenu && (
          <IonButtons slot="start">
            <IonButton onClick={onMenuClick}>
              <IonIcon slot="icon-only" icon={menuOutline} />
            </IonButton>
          </IonButtons>
        )}
        
        <IonTitle>{title}</IonTitle>
        
        <IonButtons slot="end" className="header-controls">
          <LanguageSelector />
          <ThemeToggle />
        </IonButtons>
      </IonToolbar>
    </IonHeader>
  );
};

export default AppHeader;
