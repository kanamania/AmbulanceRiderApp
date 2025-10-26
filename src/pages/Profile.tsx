import React, { useState } from 'react';
import {
  IonContent,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButton,
  IonButtons,
  IonBackButton,
  IonCard,
  IonCardContent,
  IonItem,
  IonLabel,
  IonInput,
  IonAvatar,
  IonToast,
  IonSpinner,
  IonIcon,
} from '@ionic/react';
import { logOutOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Profile.css';

const Profile: React.FC = () => {
  const history = useHistory();
  const { user, updateUser, logout } = useAuth();
  
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState<'danger' | 'success'>('success');

  const handleSave = async () => {
    if (!name || !email) {
      setToastMessage('Name and email are required');
      setToastColor('danger');
      setShowToast(true);
      return;
    }

    setIsLoading(true);

    try {
      // Here you would call your API to update the profile
      // For now, we'll just update the local state
      const updatedUser = {
        ...user!,
        name,
        email,
        phone,
      };
      
      updateUser(updatedUser);
      
      setToastMessage('Profile updated successfully');
      setToastColor('success');
      setShowToast(true);
      setIsEditing(false);
    } catch (error: any) {
      setToastMessage(error.message || 'Failed to update profile');
      setToastColor('danger');
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setName(user?.name || '');
    setEmail(user?.email || '');
    setPhone(user?.phone || '');
    setIsEditing(false);
  };

  const handleLogout = async () => {
    await logout();
    history.replace('/login');
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/tab1" />
          </IonButtons>
          <IonTitle>Profile</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handleLogout}>
              <IonIcon icon={logOutOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <div className="profile-container">
          <IonCard>
            <IonCardContent>
              <div className="profile-avatar-container">
                <IonAvatar className="profile-avatar-large">
                  <img 
                    src={user?.avatar || 'https://ionicframework.com/docs/img/demos/avatar.svg'} 
                    alt="Profile" 
                  />
                </IonAvatar>
              </div>

              <IonItem>
                <IonLabel position="stacked">Full Name</IonLabel>
                <IonInput
                  value={name}
                  onIonInput={(e) => setName(e.detail.value!)}
                  disabled={!isEditing}
                />
              </IonItem>

              <IonItem>
                <IonLabel position="stacked">Email</IonLabel>
                <IonInput
                  type="email"
                  value={email}
                  onIonInput={(e) => setEmail(e.detail.value!)}
                  disabled={!isEditing}
                />
              </IonItem>

              <IonItem>
                <IonLabel position="stacked">Phone Number</IonLabel>
                <IonInput
                  type="tel"
                  value={phone}
                  onIonInput={(e) => setPhone(e.detail.value!)}
                  disabled={!isEditing}
                />
              </IonItem>

              <IonItem>
                <IonLabel position="stacked">Role</IonLabel>
                <IonInput
                  value={user?.role || 'User'}
                  disabled
                />
              </IonItem>

              <div className="button-container">
                {!isEditing ? (
                  <IonButton
                    expand="block"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit Profile
                  </IonButton>
                ) : (
                  <>
                    <IonButton
                      expand="block"
                      onClick={handleSave}
                      disabled={isLoading}
                    >
                      {isLoading ? <IonSpinner name="crescent" /> : 'Save Changes'}
                    </IonButton>
                    <IonButton
                      expand="block"
                      fill="outline"
                      onClick={handleCancel}
                      disabled={isLoading}
                    >
                      Cancel
                    </IonButton>
                  </>
                )}
              </div>
            </IonCardContent>
          </IonCard>
        </div>

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={3000}
          color={toastColor}
        />
      </IonContent>
    </IonPage>
  );
};

export default Profile;
