import React, { useEffect, useState } from 'react';
import { 
  IonContent, 
  IonPage, 
  IonGrid, 
  IonRow, 
  IonCol, 
  IonCard, 
  IonCardHeader, 
  IonCardSubtitle, 
  IonCardTitle, 
  IonCardContent,
  IonIcon,
  IonSpinner
} from '@ionic/react';
import { 
  people, 
  car, 
  list, 
  time, 
  alertCircle, 
  checkmarkCircle, 
  speedometer,
  navigate
} from 'ionicons/icons';
import AdminLayout from '../../layouts/AdminLayout';
import { useAuth } from '../../contexts/AuthContext';
import { getDashboardStats } from '../../services/dashboard.service';
import './AdminPages.css';

interface DashboardStats {
  totalUsers: number;
  activeTrips: number;
  completedTrips: number;
  totalVehicles: number;
  pendingRequests: number;
  availableDrivers: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const data = await getDashboardStats();
        setStats(data);
        setError(null);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const StatCard = ({ 
    icon, 
    title, 
    value, 
    color = 'primary' 
  }: { 
    icon: any; 
    title: string; 
    value: number | string;
    color?: string;
  }) => (
    <IonCol size="12" sizeSm="6" sizeMd="4" sizeLg="3">
      <IonCard className="stat-card">
        <IonCardHeader>
          <div className="stat-header">
            <IonIcon 
              icon={icon} 
              color={color} 
              className="stat-icon" 
            />
            <IonCardSubtitle>{title}</IonCardSubtitle>
          </div>
          <IonCardTitle>{value}</IonCardTitle>
        </IonCardHeader>
      </IonCard>
    </IonCol>
  );

  return (
    <AdminLayout title="Admin Dashboard">
      <IonContent className="ion-padding">
        <h1>Welcome back, {user?.firstName}!</h1>
        <p className="page-description">
          Here's what's happening with your platform today.
        </p>

        {loading ? (
          <div className="loading-container">
            <IonSpinner name="crescent" />
            <p>Loading dashboard data...</p>
          </div>
        ) : error ? (
          <div className="error-message">
            <IonIcon icon={alertCircle} color="danger" />
            <p>{error}</p>
          </div>
        ) : (
          <IonGrid className="dashboard-grid">
            <IonRow>
              <StatCard 
                icon={people} 
                title="Total Users" 
                value={stats?.totalUsers || 0} 
                color="primary"
              />
              <StatCard 
                icon={car} 
                title="Active Vehicles" 
                value={stats?.totalVehicles || 0} 
                color="secondary"
              />
              <StatCard 
                icon={navigate} 
                title="Active Trips" 
                value={stats?.activeTrips || 0} 
                color="tertiary"
              />
              <StatCard 
                icon={checkmarkCircle} 
                title="Completed Trips" 
                value={stats?.completedTrips || 0} 
                color="success"
              />
            </IonRow>
            
            <IonRow>
              <StatCard 
                icon={time} 
                title="Pending Requests" 
                value={stats?.pendingRequests || 0} 
                color="warning"
              />
              <StatCard 
                icon={speedometer} 
                title="Available Drivers" 
                value={stats?.availableDrivers || 0} 
                color="success"
              />
            </IonRow>
          </IonGrid>
        )}

        {/* Quick Actions Section */}
        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <IonGrid>
            <IonRow>
              <IonCol size="12" sizeSm="6" sizeMd="4">
                <IonCard button routerLink="/admin/users/new" className="action-card">
                  <IonCardHeader>
                    <IonIcon icon={people} />
                    <IonCardSubtitle>Add New User</IonCardSubtitle>
                  </IonCardHeader>
                </IonCard>
              </IonCol>
              <IonCol size="12" sizeSm="6" sizeMd="4">
                <IonCard button routerLink="/admin/vehicles/new" className="action-card">
                  <IonCardHeader>
                    <IonIcon icon={car} />
                    <IonCardSubtitle>Add New Vehicle</IonCardSubtitle>
                  </IonCardHeader>
                </IonCard>
              </IonCol>
              <IonCol size="12" sizeSm="6" sizeMd="4">
                <IonCard button routerLink="/admin/trips" className="action-card">
                  <IonCardHeader>
                    <IonIcon icon={list} />
                    <IonCardSubtitle>View All Trips</IonCardSubtitle>
                  </IonCardHeader>
                </IonCard>
              </IonCol>
            </IonRow>
          </IonGrid>
        </div>
      </IonContent>
    </AdminLayout>
  );
};

export default Dashboard;
