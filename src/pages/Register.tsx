import React, { useState } from 'react';
import {
  IonContent,
  IonPage,
  IonInput,
  IonButton,
  IonItem,
  IonLabel,
  IonText,
  IonToast,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonSpinner,
} from '@ionic/react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/auth.service';
import './Register.css';

const Register: React.FC = () => {
  const navigate = useNavigate();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState<'danger' | 'success'>('danger');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !password || !confirmPassword) {
      setToastMessage('Please fill in all required fields');
      setToastColor('danger');
      setShowToast(true);
      return;
    }

    if (password !== confirmPassword) {
      setToastMessage('Passwords do not match');
      setToastColor('danger');
      setShowToast(true);
      return;
    }

    if (password.length < 6) {
      setToastMessage('Password must be at least 6 characters');
      setToastColor('danger');
      setShowToast(true);
      return;
    }

    setIsLoading(true);

    try {
      const [firstName, ...lastNameParts] = name.split(' ');
      await authService.register({
        firstName,
        lastName: lastNameParts.join(' ') || '',
        email,
        phoneNumber: phone,
        password,
        roleIds: [4] // Default to User role
      });
      setToastMessage('Registration successful!');
      setToastColor('success');
      setShowToast(true);
      
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 1500);
    } catch (error: any) {
      setToastMessage(error.message || 'Registration failed. Please try again.');
      setToastColor('danger');
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <IonPage>
      <IonContent className="ion-padding register-content">
        <div className="register-container">
          <IonCard className="register-card">
            <IonCardHeader>
              <IonCardTitle className="ion-text-center">
                <h1>Create Account</h1>
                <p>Join Global Express today</p>
              </IonCardTitle>
            </IonCardHeader>
            
            <IonCardContent>
              <form onSubmit={handleRegister}>
                <IonItem>
                  <IonLabel position="floating">Full Name *</IonLabel>
                  <IonInput
                    type="text"
                    value={name}
                    onIonInput={(e) => setName(e.detail.value!)}
                    required
                    disabled={isLoading}
                  />
                </IonItem>

                <IonItem>
                  <IonLabel position="floating">Email *</IonLabel>
                  <IonInput
                    type="email"
                    value={email}
                    onIonInput={(e) => setEmail(e.detail.value!)}
                    required
                    disabled={isLoading}
                  />
                </IonItem>

                <IonItem>
                  <IonLabel position="floating">Phone Number</IonLabel>
                  <IonInput
                    type="tel"
                    value={phone}
                    onIonInput={(e) => setPhone(e.detail.value!)}
                    disabled={isLoading}
                  />
                </IonItem>

                <IonItem>
                  <IonLabel position="floating">Password *</IonLabel>
                  <IonInput
                    type="password"
                    value={password}
                    onIonInput={(e) => setPassword(e.detail.value!)}
                    required
                    disabled={isLoading}
                  />
                </IonItem>

                <IonItem>
                  <IonLabel position="floating">Confirm Password *</IonLabel>
                  <IonInput
                    type="password"
                    value={confirmPassword}
                    onIonInput={(e) => setConfirmPassword(e.detail.value!)}
                    required
                    disabled={isLoading}
                  />
                </IonItem>

                <IonButton
                  expand="block"
                  type="submit"
                  className="ion-margin-top"
                  disabled={isLoading}
                >
                  {isLoading ? <IonSpinner name="crescent" /> : 'Register'}
                </IonButton>

                <div className="ion-text-center ion-margin-top">
                  <IonText color="medium">
                    Already have an account?{' '}
                    <IonText
                      color="primary"
                      style={{ cursor: 'pointer', textDecoration: 'underline' }}
                      onClick={() => navigate('/login')}
                    >
                      Login here
                    </IonText>
                  </IonText>
                </div>
              </form>
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

export default Register;
