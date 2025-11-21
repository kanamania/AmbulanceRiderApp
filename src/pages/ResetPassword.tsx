import React, { useState, useEffect } from 'react';
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
  IonIcon,
} from '@ionic/react';
import { lockClosedOutline, checkmarkCircleOutline } from 'ionicons/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthService from '../services/auth.service';
import { validators } from '../utils';
import { TelemetryCollector } from '../utils/telemetry.util';
import './ResetPassword.css';

export const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState<'danger' | 'success'>('danger');
  const [resetSuccess, setResetSuccess] = useState(false);

  useEffect(() => {
    // Extract token and email from URL query parameters
    const params = new URLSearchParams(location.search);
    const resetToken = params.get('token');
    const resetEmail = params.get('email');
    
    if (resetToken) {
      setToken(resetToken);
    } else {
      setToastMessage('Invalid or missing reset token');
      setToastColor('danger');
      setShowToast(true);
    }
    
    if (resetEmail) {
      setEmail(resetEmail);
    }
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setToastMessage('Invalid reset token');
      setToastColor('danger');
      setShowToast(true);
      return;
    }

    if (!password || !confirmPassword) {
      setToastMessage('Please fill in all fields');
      setToastColor('danger');
      setShowToast(true);
      return;
    }

    if (!validators.isValidPassword(password)) {
      setToastMessage('Password must be at least 6 characters');
      setToastColor('danger');
      setShowToast(true);
      return;
    }

    if (!validators.matches(password, confirmPassword)) {
      setToastMessage('Passwords do not match');
      setToastColor('danger');
      setShowToast(true);
      return;
    }

    setIsLoading(true);

    try {
      // Collect telemetry data
      const telemetry = await TelemetryCollector.collectBasicTelemetry();
      
      await AuthService.resetPassword(token, password, email, telemetry);
      setResetSuccess(true);
      setToastMessage('Password reset successfully!');
      setToastColor('success');
      setShowToast(true);
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      const error = err as Error;
      setToastMessage(error.message || 'Failed to reset password. Please try again.');
      setToastColor('danger');
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <IonPage>
      <IonContent className="ion-padding reset-password-content">
        <div className="reset-password-container">
          <IonCard className="reset-password-card">
            <IonCardHeader>
              <IonCardTitle className="ion-text-center">
                <div className="icon-container">
                  <IonIcon 
                    icon={resetSuccess ? checkmarkCircleOutline : lockClosedOutline} 
                    className={resetSuccess ? "success-icon" : "lock-icon"}
                  />
                </div>
                <h1>{resetSuccess ? 'Password Reset!' : 'Reset Password'}</h1>
                <p>
                  {resetSuccess
                    ? 'Your password has been successfully reset'
                    : 'Enter your new password below'}
                </p>
              </IonCardTitle>
            </IonCardHeader>
            
            <IonCardContent>
              {!resetSuccess ? (
                <form onSubmit={handleSubmit}>
                  <IonItem>
                    <IonLabel position="floating">New Password</IonLabel>
                    <IonInput
                      type="password"
                      value={password}
                      onIonInput={(e) => setPassword(e.detail.value!)}
                      required
                      disabled={isLoading}
                      placeholder="Min 6 characters"
                    />
                  </IonItem>

                  <IonItem>
                    <IonLabel position="floating">Confirm New Password</IonLabel>
                    <IonInput
                      type="password"
                      value={confirmPassword}
                      onIonInput={(e) => setConfirmPassword(e.detail.value!)}
                      required
                      disabled={isLoading}
                      placeholder="Re-enter password"
                    />
                  </IonItem>

                  <div className="password-requirements">
                    <IonText color="medium">
                      <small>
                        Password must be at least 6 characters long
                      </small>
                    </IonText>
                  </div>

                  <IonButton
                    expand="block"
                    type="submit"
                    className="ion-margin-top"
                    disabled={isLoading || !token}
                  >
                    {isLoading ? <IonSpinner name="crescent" /> : 'Reset Password'}
                  </IonButton>

                  <div className="ion-text-center ion-margin-top">
                    <IonText color="medium">
                      Remember your password?{' '}
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
              ) : (
                <div className="success-message">
                  <IonText color="success">
                    <h3>Success!</h3>
                  </IonText>
                  <p>
                    Your password has been reset successfully. You can now login with your new password.
                  </p>
                  <p className="ion-margin-top">
                    <IonText color="medium">
                      <small>Redirecting to login page...</small>
                    </IonText>
                  </p>
                  <IonButton
                    expand="block"
                    onClick={() => navigate('/login')}
                    className="ion-margin-top"
                  >
                    Go to Login
                  </IonButton>
                </div>
              )}
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