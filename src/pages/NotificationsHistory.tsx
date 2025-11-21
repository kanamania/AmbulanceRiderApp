import React, { useState } from 'react';
import {
  IonContent,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonList,
  IonIcon,
  IonBadge,
  IonText,
  IonRefresher,
  IonRefresherContent,
  IonCard,
  IonCardContent,
} from '@ionic/react';
import {
  notifications as notificationsIcon,
  checkmarkCircle,
  closeCircle,
  informationCircle,
  time,
  car,
} from 'ionicons/icons';
import { useTranslation } from 'react-i18next';
import './NotificationsHistory.css';

interface Notification {
  id: number;
  title: string;
  body: string;
  type: string;
  read: boolean;
  createdAt: string;
  data?: Record<string, unknown>;
}

const NotificationsHistory: React.FC = () => {
  const { t } = useTranslation();
  
  // Mock notifications - in real app, fetch from backend
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      title: t('notifications.newTrip'),
      body: t('trip.newTripNotification'),
      type: 'trip_created',
      read: false,
      createdAt: new Date().toISOString(),
      data: { tripId: 123 },
    },
    {
      id: 2,
      title: t('notifications.tripStatusChanged'),
      body: t('notifications.tripAccepted'),
      type: 'trip_status_changed',
      read: true,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      data: { tripId: 122, status: 'accepted' },
    },
    {
      id: 3,
      title: t('notifications.tripStatusChanged'),
      body: t('notifications.tripCompleted'),
      type: 'trip_status_changed',
      read: true,
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      data: { tripId: 121, status: 'completed' },
    },
  ]);

  const handleRefresh = async (event: CustomEvent) => {
    // In real app, fetch notifications from backend
    setTimeout(() => {
      event.detail.complete();
    }, 1000);
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    setNotifications((prev) =>
      prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
    );

    // Navigate to relevant page based on notification type
    if (notification.data?.tripId) {
      // Navigate to trip details
      console.log('Navigate to trip:', notification.data.tripId);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'trip_created':
        return car;
      case 'trip_status_changed':
        return informationCircle;
      case 'trip_accepted':
        return checkmarkCircle;
      case 'trip_rejected':
        return closeCircle;
      default:
        return notificationsIcon;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMins = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);

    if (diffInMins < 1) {
      return t('notifications.justNow');
    } else if (diffInMins < 60) {
      return `${diffInMins}${t('notifications.minutesAgo')}`;
    } else if (diffInHours < 24) {
      return `${diffInHours}${t('notifications.hoursAgo')}`;
    } else if (diffInDays < 7) {
      return `${diffInDays}${t('notifications.daysAgo')}`;
    } else {
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/tabs/settings" />
          </IonButtons>
          <IonTitle>{t('notifications.title')}</IonTitle>
          {unreadCount > 0 && (
            <IonBadge slot="end" color="danger" style={{ marginRight: '16px' }}>
              {unreadCount}
            </IonBadge>
          )}
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>

        {notifications.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: '50px', padding: '20px' }}>
            <IonIcon
              icon={notificationsIcon}
              style={{ fontSize: '64px', color: '#ccc' }}
            />
            <h3>{t('notifications.noNotifications')}</h3>
            <p>{t('notifications.noNotificationsMessage')}</p>
          </div>
        ) : (
          <IonList>
            {notifications.map((notification) => (
              <IonCard
                key={notification.id}
                button
                onClick={() => handleNotificationClick(notification)}
                style={{
                  margin: '8px',
                  backgroundColor: notification.read ? 'transparent' : 'var(--ion-color-light)',
                }}
              >
                <IonCardContent>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <IonIcon
                      icon={getNotificationIcon(notification.type)}
                      style={{ fontSize: '24px', marginTop: '4px' }}
                      color="primary"
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <strong>{notification.title}</strong>
                        {!notification.read && (
                          <IonBadge color="primary" style={{ fontSize: '8px' }}>
                            {t('notifications.new')}
                          </IonBadge>
                        )}
                      </div>
                      <IonText color="medium">
                        <p style={{ margin: '4px 0', fontSize: '14px' }}>{notification.body}</p>
                      </IonText>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px' }}>
                        <IonIcon icon={time} style={{ fontSize: '14px' }} color="medium" />
                        <IonText color="medium" style={{ fontSize: '12px' }}>
                          {formatDate(notification.createdAt)}
                        </IonText>
                      </div>
                    </div>
                  </div>
                </IonCardContent>
              </IonCard>
            ))}
          </IonList>
        )}
      </IonContent>
    </IonPage>
  );
};

export default NotificationsHistory;
