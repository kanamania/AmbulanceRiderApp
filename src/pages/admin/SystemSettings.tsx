import React, { useState } from 'react';
import { 
  IonContent, 
  IonPage, 
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonToggle,
  IonButton,
  IonIcon,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  useIonToast,
  IonGrid,
  IonRow,
  IonCol,
  IonText,
  IonChip
} from '@ionic/react';
import { 
  settings,
  notifications,
  mail,
  save,
  refresh,
  download,
  cloudUpload,
  shield,
  informationCircle,
  checkmarkCircle,
  alertCircle
} from 'ionicons/icons';
import AdminLayout from '../../layouts/AdminLayout';
import './AdminPages.css';

interface SystemSettings {
  general: {
    siteName: string;
    siteUrl: string;
    adminEmail: string;
    timezone: string;
    dateFormat: string;
  };
  notifications: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
    tripStatusUpdates: boolean;
    newUserRegistrations: boolean;
  };
  email: {
    smtpHost: string;
    smtpPort: number;
    smtpUsername: string;
    smtpPassword: string;
    fromEmail: string;
    fromName: string;
  };
  security: {
    requireEmailVerification: boolean;
    passwordMinLength: number;
    sessionTimeout: number;
    maxLoginAttempts: number;
    enableTwoFactor: boolean;
  };
}

const SystemSettings: React.FC = () => {
  const [presentToast] = useIonToast();
  const [isSaving, setIsSaving] = useState(false);
  
  const [settings, setSettings] = useState<SystemSettings>({
    general: {
      siteName: 'Ambulance Rider',
      siteUrl: 'https://ambulancerider.com',
      adminEmail: 'admin@ambulancerider.com',
      timezone: 'UTC',
      dateFormat: 'MM/DD/YYYY'
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      tripStatusUpdates: true,
      newUserRegistrations: true
    },
    email: {
      smtpHost: 'smtp.gmail.com',
      smtpPort: 587,
      smtpUsername: '',
      smtpPassword: '',
      fromEmail: 'noreply@ambulancerider.com',
      fromName: 'Ambulance Rider'
    },
    security: {
      requireEmailVerification: true,
      passwordMinLength: 8,
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      enableTwoFactor: false
    }
  });

  const handleSaveSettings = async () => {
    try {
      setIsSaving(true);
      
      // TODO: Implement API call to save settings
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      presentToast({
        message: 'Settings saved successfully',
        duration: 3000,
        color: 'success',
        icon: checkmarkCircle
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      presentToast({
        message: 'Failed to save settings',
        duration: 3000,
        color: 'danger',
        icon: alertCircle
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleBackup = async () => {
    try {
      presentToast({
        message: 'Backup initiated. You will be notified when complete.',
        duration: 3000,
        color: 'primary',
        icon: informationCircle
      });
      
      // TODO: Implement backup functionality
    } catch (error) {
      console.error('Error creating backup:', error);
      presentToast({
        message: 'Failed to create backup',
        duration: 3000,
        color: 'danger'
      });
    }
  };

  const handleRestore = () => {
    // TODO: Implement restore functionality
    presentToast({
      message: 'Restore functionality coming soon',
      duration: 3000,
      color: 'warning'
    });
  };

  return (
    <AdminLayout title="System Settings">
      <IonContent className="ion-padding">
        <div className="page-header">
          <div>
            <h1>System Settings</h1>
            <p>Configure platform settings and preferences</p>
          </div>
          <IonButton 
            color="primary"
            onClick={handleSaveSettings}
            disabled={isSaving}
          >
            <IonIcon icon={save} slot="start" />
            Save Changes
          </IonButton>
        </div>

        <IonGrid>
          <IonRow>
            <IonCol size="12" sizeMd="6">
              {/* General Settings */}
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>
                    <IonIcon icon={settings as any} className="section-icon" />
                    General Settings
                  </IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <IonList lines="full">
                    <IonItem>
                      <IonLabel position="stacked">Site Name</IonLabel>
                      <IonInput 
                        value={settings.general.siteName}
                        onIonChange={e => setSettings({
                          ...settings,
                          general: { ...settings.general, siteName: e.detail.value || '' }
                        })}
                      />
                    </IonItem>
                    
                    <IonItem>
                      <IonLabel position="stacked">Site URL</IonLabel>
                      <IonInput 
                        type="url"
                        value={settings.general.siteUrl}
                        onIonChange={e => setSettings({
                          ...settings,
                          general: { ...settings.general, siteUrl: e.detail.value || '' }
                        })}
                      />
                    </IonItem>
                    
                    <IonItem>
                      <IonLabel position="stacked">Admin Email</IonLabel>
                      <IonInput 
                        type="email"
                        value={settings.general.adminEmail}
                        onIonChange={e => setSettings({
                          ...settings,
                          general: { ...settings.general, adminEmail: e.detail.value || '' }
                        })}
                      />
                    </IonItem>
                    
                    <IonItem>
                      <IonLabel>Timezone</IonLabel>
                      <IonSelect 
                        value={settings.general.timezone}
                        onIonChange={e => setSettings({
                          ...settings,
                          general: { ...settings.general, timezone: e.detail.value }
                        })}
                      >
                        <IonSelectOption value="UTC">UTC</IonSelectOption>
                        <IonSelectOption value="America/New_York">Eastern Time</IonSelectOption>
                        <IonSelectOption value="America/Chicago">Central Time</IonSelectOption>
                        <IonSelectOption value="America/Denver">Mountain Time</IonSelectOption>
                        <IonSelectOption value="America/Los_Angeles">Pacific Time</IonSelectOption>
                      </IonSelect>
                    </IonItem>
                    
                    <IonItem>
                      <IonLabel>Date Format</IonLabel>
                      <IonSelect 
                        value={settings.general.dateFormat}
                        onIonChange={e => setSettings({
                          ...settings,
                          general: { ...settings.general, dateFormat: e.detail.value }
                        })}
                      >
                        <IonSelectOption value="MM/DD/YYYY">MM/DD/YYYY</IonSelectOption>
                        <IonSelectOption value="DD/MM/YYYY">DD/MM/YYYY</IonSelectOption>
                        <IonSelectOption value="YYYY-MM-DD">YYYY-MM-DD</IonSelectOption>
                      </IonSelect>
                    </IonItem>
                  </IonList>
                </IonCardContent>
              </IonCard>

              {/* Email Settings */}
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>
                    <IonIcon icon={mail} className="section-icon" />
                    Email Configuration
                  </IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <IonList lines="full">
                    <IonItem>
                      <IonLabel position="stacked">SMTP Host</IonLabel>
                      <IonInput 
                        value={settings.email.smtpHost}
                        onIonChange={e => setSettings({
                          ...settings,
                          email: { ...settings.email, smtpHost: e.detail.value || '' }
                        })}
                      />
                    </IonItem>
                    
                    <IonItem>
                      <IonLabel position="stacked">SMTP Port</IonLabel>
                      <IonInput 
                        type="number"
                        value={settings.email.smtpPort}
                        onIonChange={e => setSettings({
                          ...settings,
                          email: { ...settings.email, smtpPort: parseInt(e.detail.value || '587') }
                        })}
                      />
                    </IonItem>
                    
                    <IonItem>
                      <IonLabel position="stacked">SMTP Username</IonLabel>
                      <IonInput 
                        value={settings.email.smtpUsername}
                        onIonChange={e => setSettings({
                          ...settings,
                          email: { ...settings.email, smtpUsername: e.detail.value || '' }
                        })}
                      />
                    </IonItem>
                    
                    <IonItem>
                      <IonLabel position="stacked">SMTP Password</IonLabel>
                      <IonInput 
                        type="password"
                        value={settings.email.smtpPassword}
                        onIonChange={e => setSettings({
                          ...settings,
                          email: { ...settings.email, smtpPassword: e.detail.value || '' }
                        })}
                      />
                    </IonItem>
                    
                    <IonItem>
                      <IonLabel position="stacked">From Email</IonLabel>
                      <IonInput 
                        type="email"
                        value={settings.email.fromEmail}
                        onIonChange={e => setSettings({
                          ...settings,
                          email: { ...settings.email, fromEmail: e.detail.value || '' }
                        })}
                      />
                    </IonItem>
                    
                    <IonItem>
                      <IonLabel position="stacked">From Name</IonLabel>
                      <IonInput 
                        value={settings.email.fromName}
                        onIonChange={e => setSettings({
                          ...settings,
                          email: { ...settings.email, fromName: e.detail.value || '' }
                        })}
                      />
                    </IonItem>
                  </IonList>
                </IonCardContent>
              </IonCard>
            </IonCol>
            
            <IonCol size="12" sizeMd="6">
              {/* Notification Settings */}
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>
                    <IonIcon icon={notifications} className="section-icon" />
                    Notification Settings
                  </IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <IonList lines="full">
                    <IonItem>
                      <IonLabel>Email Notifications</IonLabel>
                      <IonToggle 
                        checked={settings.notifications.emailNotifications}
                        onIonChange={e => setSettings({
                          ...settings,
                          notifications: { ...settings.notifications, emailNotifications: e.detail.checked }
                        })}
                      />
                    </IonItem>
                    
                    <IonItem>
                      <IonLabel>SMS Notifications</IonLabel>
                      <IonToggle 
                        checked={settings.notifications.smsNotifications}
                        onIonChange={e => setSettings({
                          ...settings,
                          notifications: { ...settings.notifications, smsNotifications: e.detail.checked }
                        })}
                      />
                    </IonItem>
                    
                    <IonItem>
                      <IonLabel>Push Notifications</IonLabel>
                      <IonToggle 
                        checked={settings.notifications.pushNotifications}
                        onIonChange={e => setSettings({
                          ...settings,
                          notifications: { ...settings.notifications, pushNotifications: e.detail.checked }
                        })}
                      />
                    </IonItem>
                    
                    <IonItem>
                      <IonLabel>Trip Status Updates</IonLabel>
                      <IonToggle 
                        checked={settings.notifications.tripStatusUpdates}
                        onIonChange={e => setSettings({
                          ...settings,
                          notifications: { ...settings.notifications, tripStatusUpdates: e.detail.checked }
                        })}
                      />
                    </IonItem>
                    
                    <IonItem>
                      <IonLabel>New User Registrations</IonLabel>
                      <IonToggle 
                        checked={settings.notifications.newUserRegistrations}
                        onIonChange={e => setSettings({
                          ...settings,
                          notifications: { ...settings.notifications, newUserRegistrations: e.detail.checked }
                        })}
                      />
                    </IonItem>
                  </IonList>
                </IonCardContent>
              </IonCard>

              {/* Security Settings */}
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>
                    <IonIcon icon={shield} className="section-icon" />
                    Security Settings
                  </IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <IonList lines="full">
                    <IonItem>
                      <IonLabel>Require Email Verification</IonLabel>
                      <IonToggle 
                        checked={settings.security.requireEmailVerification}
                        onIonChange={e => setSettings({
                          ...settings,
                          security: { ...settings.security, requireEmailVerification: e.detail.checked }
                        })}
                      />
                    </IonItem>
                    
                    <IonItem>
                      <IonLabel>Enable Two-Factor Auth</IonLabel>
                      <IonToggle 
                        checked={settings.security.enableTwoFactor}
                        onIonChange={e => setSettings({
                          ...settings,
                          security: { ...settings.security, enableTwoFactor: e.detail.checked }
                        })}
                      />
                    </IonItem>
                    
                    <IonItem>
                      <IonLabel position="stacked">Min Password Length</IonLabel>
                      <IonInput 
                        type="number"
                        value={settings.security.passwordMinLength}
                        onIonChange={e => setSettings({
                          ...settings,
                          security: { ...settings.security, passwordMinLength: parseInt(e.detail.value || '8') }
                        })}
                      />
                    </IonItem>
                    
                    <IonItem>
                      <IonLabel position="stacked">Session Timeout (minutes)</IonLabel>
                      <IonInput 
                        type="number"
                        value={settings.security.sessionTimeout}
                        onIonChange={e => setSettings({
                          ...settings,
                          security: { ...settings.security, sessionTimeout: parseInt(e.detail.value || '30') }
                        })}
                      />
                    </IonItem>
                    
                    <IonItem>
                      <IonLabel position="stacked">Max Login Attempts</IonLabel>
                      <IonInput 
                        type="number"
                        value={settings.security.maxLoginAttempts}
                        onIonChange={e => setSettings({
                          ...settings,
                          security: { ...settings.security, maxLoginAttempts: parseInt(e.detail.value || '5') }
                        })}
                      />
                    </IonItem>
                  </IonList>
                </IonCardContent>
              </IonCard>

              {/* Backup & Restore */}
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>
                    <IonIcon icon={cloudUpload} className="section-icon" />
                    Backup & Restore
                  </IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <IonText color="medium">
                    <p>Create backups of your system data and restore from previous backups.</p>
                  </IonText>
                  
                  <div className="backup-actions">
                    <IonButton 
                      expand="block" 
                      color="primary"
                      onClick={handleBackup}
                    >
                      <IonIcon icon={download} slot="start" />
                      Create Backup
                    </IonButton>
                    
                    <IonButton 
                      expand="block" 
                      color="secondary"
                      fill="outline"
                      onClick={handleRestore}
                    >
                      <IonIcon icon={cloudUpload} slot="start" />
                      Restore from Backup
                    </IonButton>
                  </div>
                  
                  <IonText color="medium">
                    <p className="ion-margin-top">
                      <small>Last backup: Never</small>
                    </p>
                  </IonText>
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </AdminLayout>
  );
};

export default SystemSettings;
