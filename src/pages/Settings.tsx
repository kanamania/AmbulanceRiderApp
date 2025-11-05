import React, { useRef } from 'react';
import {
  IonContent,
  IonPage,
  IonList,
  IonItem,
  IonLabel,
  IonToggle,
  IonSelect,
  IonSelectOption,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonAvatar,
  IonText,
} from '@ionic/react';
import {
  personCircle,
  moon,
  language,
  notifications,
  logOutOutline,
  chevronForward,
  informationCircle,
  speedometer,
  people,
  car,
  map,
  settings as settingsIcon,
  location as locationIcon,
  list,
} from 'ionicons/icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AppHeader from '../components/AppHeader';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { getUserAvatar } from '../utils/avatar.utils';
import './Settings.css';

const Settings: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, logout, hasRole } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const languageSelectRef = useRef<HTMLIonSelectElement>(null);

  const isAdminOrDispatcher = hasRole('Admin', 'Dispatcher');
  const isAdmin = hasRole('Admin');

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  const openLanguageSelect = () => {
    languageSelectRef.current?.open();
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <IonPage>
      <AppHeader title={t('navigation.settings')} />

      <IonContent className="ion-padding">
        {/* Profile Section */}
        <IonCard button onClick={() => navigate('/tabs/profile')}>
          <IonCardContent>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <IonAvatar style={{ width: '60px', height: '60px' }}>
                <img
                  src={getUserAvatar(user?.imageUrl, user?.firstName, user?.lastName, 120)}
                  alt="Profile"
                />
              </IonAvatar>
              <div style={{ flex: 1 }}>
                <h2 style={{ margin: '0 0 4px 0' }}>
                  {user?.firstName} {user?.lastName}
                </h2>
                <IonText color="medium">
                  <p style={{ margin: 0, fontSize: '14px' }}>{user?.email}</p>
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px' }}>
                    {user?.roles?.[0] || 'User'}
                  </p>
                </IonText>
              </div>
              <IonIcon icon={chevronForward} color="medium" />
            </div>
          </IonCardContent>
        </IonCard>

        {/* Admin/Dispatcher Controls */}
        {isAdminOrDispatcher && (
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>{t('settings.adminControls')}</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonList lines="full">
                <IonItem button onClick={() => navigate('/admin/dashboard')}>
                  <IonIcon icon={speedometer} slot="start" color="primary" />
                  <IonLabel>
                    <h2>{t('navigation.dashboard')}</h2>
                    <p>{t('settings.dashboardDescription')}</p>
                  </IonLabel>
                  <IonIcon icon={chevronForward} slot="end" color="medium" />
                </IonItem>

                {isAdmin && (
                  <IonItem button onClick={() => navigate('/admin/users')}>
                    <IonIcon icon={people} slot="start" color="primary" />
                    <IonLabel>
                      <h2>{t('user.users')}</h2>
                      <p>{t('settings.usersDescription')}</p>
                    </IonLabel>
                    <IonIcon icon={chevronForward} slot="end" color="medium" />
                  </IonItem>
                )}

                <IonItem button onClick={() => navigate('/admin/vehicles')}>
                  <IonIcon icon={car} slot="start" color="primary" />
                  <IonLabel>
                    <h2>{t('vehicle.vehicles')}</h2>
                    <p>{t('settings.vehiclesDescription')}</p>
                  </IonLabel>
                  <IonIcon icon={chevronForward} slot="end" color="medium" />
                </IonItem>

                <IonItem button onClick={() => navigate('/admin/trips')}>
                  <IonIcon icon={map} slot="start" color="primary" />
                  <IonLabel>
                    <h2>{t('settings.tripManagement')}</h2>
                    <p>{t('settings.tripManagementDescription')}</p>
                  </IonLabel>
                  <IonIcon icon={chevronForward} slot="end" color="medium" />
                </IonItem>

                {isAdmin && (
                  <>
                    <IonItem button onClick={() => navigate('/admin/locations')}>
                      <IonIcon icon={locationIcon} slot="start" color="primary" />
                      <IonLabel>
                        <h2>{t('settings.locations')}</h2>
                        <p>{t('settings.locationsDescription')}</p>
                      </IonLabel>
                      <IonIcon icon={chevronForward} slot="end" color="medium" />
                    </IonItem>

                    <IonItem button onClick={() => navigate('/admin/trip-types')}>
                      <IonIcon icon={list} slot="start" color="primary" />
                      <IonLabel>
                        <h2>{t('settings.tripTypes')}</h2>
                        <p>{t('settings.tripTypesDescription')}</p>
                      </IonLabel>
                      <IonIcon icon={chevronForward} slot="end" color="medium" />
                    </IonItem>

                    <IonItem button onClick={() => navigate('/admin/settings')}>
                      <IonIcon icon={settingsIcon} slot="start" color="primary" />
                      <IonLabel>
                        <h2>{t('settings.systemSettings')}</h2>
                        <p>{t('settings.systemSettingsDescription')}</p>
                      </IonLabel>
                      <IonIcon icon={chevronForward} slot="end" color="medium" />
                    </IonItem>
                  </>
                )}
              </IonList>
            </IonCardContent>
          </IonCard>
        )}

        {/* Appearance Settings */}
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>{t('settings.appearance')}</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonList lines="full">
              <IonItem>
                <IonIcon icon={moon} slot="start" color="primary" />
                <IonLabel>
                  <h2>{t('common.darkMode')}</h2>
                  <p>{t('settings.darkModeDescription')}</p>
                </IonLabel>
                <IonToggle
                  checked={isDark}
                  onIonChange={() => toggleTheme()}
                  slot="end"
                />
              </IonItem>

              <IonItem button onClick={openLanguageSelect}>
                <IonIcon icon={language} slot="start" color="primary" />
                <IonLabel>
                  <h2>{t('common.language')}</h2>
                  <p>{i18n.language === 'en' ? 'English' : 'Kiswahili'}</p>
                </IonLabel>
                <IonIcon icon={chevronForward} slot="end" color="medium" />
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
              </IonItem>
            </IonList>
          </IonCardContent>
        </IonCard>

        {/* Notifications Settings */}
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>{t('notifications.title')}</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonList lines="full">
              <IonItem button onClick={() => navigate('/notifications-history')}>
                <IonIcon icon={notifications} slot="start" color="primary" />
                <IonLabel>
                  <h2>{t('notifications.history')}</h2>
                  <p>{t('notifications.viewHistory')}</p>
                </IonLabel>
                <IonIcon icon={chevronForward} slot="end" color="medium" />
              </IonItem>

              <IonItem>
                <IonIcon icon={notifications} slot="start" color="primary" />
                <IonLabel>
                  <h2>{t('notifications.pushNotifications')}</h2>
                  <p>{t('notifications.pushNotificationsDescription')}</p>
                </IonLabel>
                <IonToggle checked={true} slot="end" />
              </IonItem>
            </IonList>
          </IonCardContent>
        </IonCard>

        {/* About Section */}
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>{t('settings.about')}</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonList lines="full">
              <IonItem>
                <IonIcon icon={informationCircle} slot="start" color="primary" />
                <IonLabel>
                  <h2>{t('settings.version')}</h2>
                  <p>1.0.0</p>
                </IonLabel>
              </IonItem>
            </IonList>
          </IonCardContent>
        </IonCard>

        {/* Logout Button */}
        <IonButton
          expand="block"
          color="danger"
          fill="outline"
          onClick={handleLogout}
          style={{ marginTop: '24px' }}
        >
          <IonIcon icon={logOutOutline} slot="start" />
          {t('common.logout')}
        </IonButton>

        <div style={{ textAlign: 'center', marginTop: '24px', marginBottom: '24px' }}>
          <IonText color="medium">
            <p style={{ fontSize: '12px' }}>
              © 2025 Ambulance Rider App
            </p>
          </IonText>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Settings;
