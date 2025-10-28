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
  IonIcon,
} from '@ionic/react';
import { arrowBackOutline, mailOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import AuthService from '../services/auth.service';
import { validators } from '../utils/validators';
import { TelemetryCollector } from '../utils/telemetry.util';
import './ForgotPassword.css';

const ForgotPassword: React.FC = () => {
  const history = useHistory();
  
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState<'danger' | 'success'>('danger');
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setToastMessage('Please enter your email address');
      setToastColor('danger');
      setShowToast(true);
      return;
    }

    if (!validators.isValidEmail(email)) {
      setToastMessage('Please enter a valid email address');
      setToastColor('danger');
      setShowToast(true);
      return;
    }

    setIsLoading(true);

    try {
      // Collect telemetry data
      const telemetry = await TelemetryCollector.collectBasicTelemetry();
      
      await AuthService.forgotPassword(email, telemetry);
      setEmailSent(true);
      setToastMessage('Password reset instructions sent to your email');
      setToastColor('success');
      setShowToast(true);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send reset email. Please try again.';
      setToastMessage(errorMessage);
      setToastColor('danger');
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <IonPage>
      <IonContent className="ion-padding forgot-password-content">
        <div className="forgot-password-container">
          <IonCard className="forgot-password-card">
            <IonCardHeader>
              <IonButton
                fill="clear"
                size="small"
                onClick={() => history.goBack()}
                className="back-button"
              >
                <IonIcon icon={arrowBackOutline} slot="start" />
                Back
              </IonButton>
              
              <IonCardTitle className="ion-text-center">
                <div className="icon-container">
                  <IonIcon icon={mailOutline} className="mail-icon" />
                </div>
                <h1>Forgot Password?</h1>
                <p>
                  {emailSent
                    ? 'Check your email for reset instructions'
                    : 'Enter your email to receive password reset instructions'}
                </p>
              </IonCardTitle>
            </IonCardHeader>
            
            <IonCardContent>
              {!emailSent ? (
                <form onSubmit={handleSubmit}>
                  <IonItem>
                    <IonLabel position="floating">Email Address</IonLabel>
                    <IonInput
                      type="email"
                      value={email}
                      onIonInput={(e) => setEmail(e.detail.value!)}
                      required
                      disabled={isLoading}
                      placeholder="your.email@example.com"
                    />
                  </IonItem>

                  <IonButton
                    expand="block"
                    type="submit"
                    className="ion-margin-top"
                    disabled={isLoading}
                  >
                    {isLoading ? <IonSpinner name="crescent" /> : 'Send Reset Link'}
                  </IonButton>

                  <div className="ion-text-center ion-margin-top">
                    <IonText color="medium">
                      Remember your password?{' '}
                      <IonText
                        color="primary"
                        style={{ cursor: 'pointer', textDecoration: 'underline' }}
                        onClick={() => history.push('/login')}
                      >
                        Login here
                      </IonText>
                    </IonText>
                  </div>
                </form>
              ) : (
                <div className="success-message">
                  <IonText color="success">
                    <h3>Email Sent Successfully!</h3>
                  </IonText>
                  <p>
                    We've sent password reset instructions to <strong>{email}</strong>.
                    Please check your inbox and follow the link to reset your password.
                  </p>
                  <p className="ion-margin-top">
                    <IonText color="medium">
                      Didn't receive the email? Check your spam folder or{' '}
                      <IonText
                        color="primary"
                        style={{ cursor: 'pointer', textDecoration: 'underline' }}
                        onClick={() => setEmailSent(false)}
                      >
                        try again
                      </IonText>
                    </IonText>
                  </p>
                  <IonButton
                    expand="block"
                    onClick={() => history.push('/login')}
                    className="ion-margin-top"
                  >
                    Back to Login
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

export default ForgotPassword;
