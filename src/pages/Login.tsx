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
import { useTranslation } from 'react-i18next';
import AppHeader from '../components/AppHeader';
import { useAuth } from '../contexts/AuthContext';
import { TelemetryCollector } from '../utils/telemetry.util';
import './Login.css';

const Login: React.FC = () => {
  const { t } = useTranslation();
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
      setToastMessage(t('validation.required'));
      setToastColor('danger');
      setShowToast(true);
      return;
    }

    setIsLoading(true);

    try {
      // Collect telemetry data
      const telemetry = await TelemetryCollector.collectBasicTelemetry();
      
      await login({ email, password, telemetry });
      setToastMessage(t('auth.loginSuccess'));
      setToastColor('success');
      
      setTimeout(() => {
        history.replace('/tabs/home');
      }, 500);
    } catch (error: any) {
      setToastMessage(error.message || t('auth.loginError'));
      setToastColor('danger');
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <IonPage>
      <AppHeader title={t('auth.loginTitle')} />
      <IonContent className="ion-padding login-content">
        <div className="login-container">
          <IonCard className="login-card">
            <IonCardHeader>
              <IonCardTitle className="ion-text-center">
                <h1>Ambulance Rider</h1>
                <p>{t('auth.loginTitle')}</p>
              </IonCardTitle>
            </IonCardHeader>
            
            <IonCardContent>
              <form onSubmit={handleLogin}>
                <IonItem>
                  <IonLabel position="floating">{t('auth.email')}</IonLabel>
                  <IonInput
                    type="email"
                    value={email}
                    onIonInput={(e) => setEmail(e.detail.value!)}
                    required
                    disabled={isLoading}
                  />
                </IonItem>

                <IonItem>
                  <IonLabel position="floating">{t('auth.password')}</IonLabel>
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
                    {t('auth.forgotPassword')}
                  </IonText>
                </div>

                <IonButton
                  expand="block"
                  type="submit"
                  className="ion-margin-top"
                  disabled={isLoading}
                >
                  {isLoading ? <IonSpinner name="crescent" /> : t('common.login')}
                </IonButton>

                <div className="ion-text-center ion-margin-top">
                  <IonText color="medium">
                    {t('auth.dontHaveAccount')}{' '}
                    <IonText
                      color="primary"
                      style={{ cursor: 'pointer', textDecoration: 'underline' }}
                      onClick={() => history.push('/register')}
                    >
                      {t('auth.registerHere')}
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
