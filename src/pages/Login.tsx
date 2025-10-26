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
import { useHistory } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Login.css';

const Login: React.FC = () => {
  const history = useHistory();
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState<'danger' | 'success'>('danger');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setToastMessage('Please fill in all fields');
      setToastColor('danger');
      setShowToast(true);
      return;
    }

    setIsLoading(true);

    try {
      await login({ email, password });
      setToastMessage('Login successful!');
      setToastColor('success');
      setShowToast(true);
      
      setTimeout(() => {
        history.replace('/tab1');
      }, 500);
    } catch (error: any) {
      setToastMessage(error.message || 'Login failed. Please try again.');
      setToastColor('danger');
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <IonPage>
      <IonContent className="ion-padding login-content">
        <div className="login-container">
          <IonCard className="login-card">
            <IonCardHeader>
              <IonCardTitle className="ion-text-center">
                <h1>Ambulance Rider</h1>
                <p>Sign in to continue</p>
              </IonCardTitle>
            </IonCardHeader>
            
            <IonCardContent>
              <form onSubmit={handleLogin}>
                <IonItem>
                  <IonLabel position="floating">Email</IonLabel>
                  <IonInput
                    type="email"
                    value={email}
                    onIonInput={(e) => setEmail(e.detail.value!)}
                    required
                    disabled={isLoading}
                  />
                </IonItem>

                <IonItem>
                  <IonLabel position="floating">Password</IonLabel>
                  <IonInput
                    type="password"
                    value={password}
                    onIonInput={(e) => setPassword(e.detail.value!)}
                    required
                    disabled={isLoading}
                  />
                </IonItem>

                <div className="ion-text-end ion-margin-top">
                  <IonText
                    color="primary"
                    style={{ cursor: 'pointer', textDecoration: 'underline', fontSize: '14px' }}
                    onClick={() => history.push('/forgot-password')}
                  >
                    Forgot Password?
                  </IonText>
                </div>

                <IonButton
                  expand="block"
                  type="submit"
                  className="ion-margin-top"
                  disabled={isLoading}
                >
                  {isLoading ? <IonSpinner name="crescent" /> : 'Login'}
                </IonButton>

                <div className="ion-text-center ion-margin-top">
                  <IonText color="medium">
                    Don't have an account?{' '}
                    <IonText
                      color="primary"
                      style={{ cursor: 'pointer', textDecoration: 'underline' }}
                      onClick={() => history.push('/register')}
                    >
                      Register here
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

export default Login;
