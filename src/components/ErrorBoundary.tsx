import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  IonPage,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonIcon,
  IonText
} from '@ionic/react';
import { alertCircleOutline, refreshOutline, homeOutline } from 'ionicons/icons';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught an error:', error);
      console.error('Component stack:', errorInfo.componentStack);
    }
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleGoHome = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/tabs/home';
  };

  handleReload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <IonPage>
          <IonContent className="ion-padding">
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              minHeight: '100%',
              padding: '20px'
            }}>
              <IonCard style={{ maxWidth: '500px', width: '100%' }}>
                <IonCardHeader className="ion-text-center">
                  <IonIcon 
                    icon={alertCircleOutline} 
                    style={{ fontSize: '64px', color: 'var(--ion-color-danger)' }} 
                  />
                  <IonCardTitle style={{ marginTop: '16px' }}>
                    Something went wrong
                  </IonCardTitle>
                </IonCardHeader>
                <IonCardContent className="ion-text-center">
                  <IonText color="medium">
                    <p>We apologize for the inconvenience. An unexpected error has occurred.</p>
                  </IonText>
                  
                  {import.meta.env.DEV && this.state.error && (
                    <div style={{ 
                      marginTop: '16px', 
                      padding: '12px', 
                      backgroundColor: 'var(--ion-color-light)', 
                      borderRadius: '8px',
                      textAlign: 'left',
                      overflow: 'auto',
                      maxHeight: '200px'
                    }}>
                      <IonText color="danger">
                        <strong>{this.state.error.name}:</strong> {this.state.error.message}
                      </IonText>
                      {this.state.errorInfo && (
                        <pre style={{ 
                          fontSize: '12px', 
                          marginTop: '8px',
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word'
                        }}>
                          {this.state.errorInfo.componentStack}
                        </pre>
                      )}
                    </div>
                  )}

                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '12px', 
                    marginTop: '24px' 
                  }}>
                    <IonButton expand="block" onClick={this.handleRetry}>
                      <IonIcon slot="start" icon={refreshOutline} />
                      Try Again
                    </IonButton>
                    <IonButton expand="block" fill="outline" onClick={this.handleGoHome}>
                      <IonIcon slot="start" icon={homeOutline} />
                      Go to Home
                    </IonButton>
                    <IonButton expand="block" fill="clear" onClick={this.handleReload}>
                      Reload Page
                    </IonButton>
                  </div>
                </IonCardContent>
              </IonCard>
            </div>
          </IonContent>
        </IonPage>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
