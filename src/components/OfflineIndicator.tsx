import React from 'react';
import { IonChip, IonIcon, IonLabel } from '@ionic/react';
import { cloudOfflineOutline, syncOutline, cloudDoneOutline } from 'ionicons/icons';
import { useOffline } from '../contexts/OfflineContext';

interface OfflineIndicatorProps {
  showWhenOnline?: boolean;
  compact?: boolean;
}

const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ 
  showWhenOnline = false,
  compact = false 
}) => {
  const { isOnline, pendingActions } = useOffline();

  if (isOnline && !showWhenOnline && pendingActions === 0) {
    return null;
  }

  if (compact) {
    return (
      <IonIcon 
        icon={isOnline ? (pendingActions > 0 ? syncOutline : cloudDoneOutline) : cloudOfflineOutline}
        color={isOnline ? (pendingActions > 0 ? 'warning' : 'success') : 'danger'}
        style={{ fontSize: '20px' }}
      />
    );
  }

  return (
    <IonChip 
      color={isOnline ? (pendingActions > 0 ? 'warning' : 'success') : 'danger'}
      style={{ margin: '8px' }}
    >
      <IonIcon 
        icon={isOnline ? (pendingActions > 0 ? syncOutline : cloudDoneOutline) : cloudOfflineOutline} 
      />
      <IonLabel>
        {isOnline 
          ? (pendingActions > 0 ? `Syncing (${pendingActions})` : 'Online') 
          : 'Offline'}
      </IonLabel>
    </IonChip>
  );
};

export default OfflineIndicator;
