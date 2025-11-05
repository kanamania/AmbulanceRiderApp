import React, { ReactNode } from 'react';
import { IonPage, IonSplitPane, IonMenu, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonIcon, IonMenuToggle, IonButtons, IonButton, IonBackButton, IonAvatar } from '@ionic/react';
import { home, people, car, list, settings, logOut, arrowBack, settingsOutline, location as locationIcon, listCircle } from 'ionicons/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserAvatar } from '../utils/avatar.utils';
import './AdminLayout.css';

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
  showBackButton?: boolean;
  showSettingsButton?: boolean;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title, showBackButton = true, showSettingsButton = true }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleSettingsClick = () => {
    navigate('/tabs/settings');
  };

  // Don't show back button on dashboard
  const isDashboard = location.pathname === '/admin/dashboard' || location.pathname === '/admin';
  const shouldShowBackButton = showBackButton && !isDashboard;

  return (
    <IonPage>
      <IonSplitPane contentId="main-content">
        {/* Sidebar Menu */}
        <IonMenu contentId="main-content" type="overlay">
          <IonHeader>
            <IonToolbar color="primary">
              <IonTitle>Admin Panel</IonTitle>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <IonList>
              <IonMenuToggle auto-hide="false">
                <IonItem button routerLink="/admin/dashboard" routerDirection="none">
                  <IonIcon slot="start" icon={home} />
                  <IonLabel>Dashboard</IonLabel>
                </IonItem>
              </IonMenuToggle>

              <IonMenuToggle auto-hide="false">
                <IonItem button routerLink="/admin/users" routerDirection="none">
                  <IonIcon slot="start" icon={people} />
                  <IonLabel>User Management</IonLabel>
                </IonItem>
              </IonMenuToggle>

              <IonMenuToggle auto-hide="false">
                <IonItem button routerLink="/admin/vehicles" routerDirection="none">
                  <IonIcon slot="start" icon={car} />
                  <IonLabel>Vehicle Management</IonLabel>
                </IonItem>
              </IonMenuToggle>

              <IonMenuToggle auto-hide="false">
                <IonItem button routerLink="/admin/trips" routerDirection="none">
                  <IonIcon slot="start" icon={list} />
                  <IonLabel>Trip Management</IonLabel>
                </IonItem>
              </IonMenuToggle>

              <IonMenuToggle auto-hide="false">
                <IonItem button routerLink="/admin/locations" routerDirection="none">
                  <IonIcon slot="start" icon={locationIcon} />
                  <IonLabel>Locations</IonLabel>
                </IonItem>
              </IonMenuToggle>

              <IonMenuToggle auto-hide="false">
                <IonItem button routerLink="/admin/trip-types" routerDirection="none">
                  <IonIcon slot="start" icon={listCircle} />
                  <IonLabel>Trip Types</IonLabel>
                </IonItem>
              </IonMenuToggle>

              <IonMenuToggle auto-hide="false">
                <IonItem button routerLink="/admin/settings" routerDirection="none">
                  <IonIcon slot="start" icon={settings} />
                  <IonLabel>System Settings</IonLabel>
                </IonItem>
              </IonMenuToggle>

              <IonMenuToggle auto-hide="false">
                <IonItem button onClick={handleLogout}>
                  <IonIcon slot="start" icon={logOut} />
                  <IonLabel>Logout</IonLabel>
                </IonItem>
              </IonMenuToggle>

              {/* User Info */}
              <div className="user-info">
                <IonItem lines="none">
                  <IonAvatar slot="start" style={{ width: '40px', height: '40px' }}>
                    <img 
                      src={getUserAvatar(user?.imageUrl, user?.firstName, user?.lastName, 80)} 
                      alt="Profile" 
                    />
                  </IonAvatar>
                  <IonLabel>
                    <h3>{user?.firstName} {user?.lastName}</h3>
                    <p>{user?.email}</p>
                    <p className="user-role">{user?.roles.join(', ')}</p>
                  </IonLabel>
                </IonItem>
              </div>
            </IonList>
          </IonContent>
        </IonMenu>

        {/* Main Content */}
        <div className="ion-page" id="main-content">
          <IonHeader>
            <IonToolbar color="primary">
              {shouldShowBackButton && (
                <IonButtons slot="start">
                  <IonButton onClick={handleBackClick}>
                    <IonIcon icon={arrowBack} slot="icon-only" />
                  </IonButton>
                </IonButtons>
              )}
              <IonTitle>{title}</IonTitle>
              {showSettingsButton && (
                <IonButtons slot="end">
                  <IonButton onClick={handleSettingsClick}>
                    <IonIcon icon={settingsOutline} slot="icon-only" />
                  </IonButton>
                </IonButtons>
              )}
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            {children}
          </IonContent>
        </div>
      </IonSplitPane>
    </IonPage>
  );
};


