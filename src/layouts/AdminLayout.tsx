import React, { ReactNode } from 'react';
import { IonPage, IonSplitPane, IonMenu, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonIcon, IonMenuToggle } from '@ionic/react';
import { home, people, car, list, settings, logOut } from 'ionicons/icons';
import { useAuth } from '../contexts/AuthContext';
import './AdminLayout.css';

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title }) => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

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
              <IonTitle>{title}</IonTitle>
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

export default AdminLayout;
