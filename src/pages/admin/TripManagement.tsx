import React, { useEffect, useState } from 'react';
import { 
  IonContent, 
  IonPage, 
  IonSearchbar, 
  IonRefresher, 
  IonRefresherContent, 
  IonSpinner,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  useIonAlert,
  useIonToast,
  IonBadge,
  IonChip,
  IonLabel,
  IonItem,
  IonText,
  IonIcon,
  IonButton,
  IonSelect,
  IonSelectOption,
  IonGrid,
  IonRow,
  IonCol
} from '@ionic/react';
import { 
  list, 
  time, 
  location, 
  person,
  car,
  checkmarkCircle,
  closeCircle,
  alertCircle,
  hourglass,
  eye,
  create
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';
import { Trip } from '../../types';
import { tripService } from '../../services';
import './AdminPages.css';

const TripManagement: React.FC = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [filteredTrips, setFilteredTrips] = useState<Trip[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [presentAlert] = useIonAlert();
  const [presentToast] = useIonToast();
  const history = useHistory();
  const itemsPerPage = 10;

  const loadTrips = async (pageNum: number = 1, refresh: boolean = false) => {
    try {
      setLoading(true);
      
      // Fetch trips based on status filter
      let response;
      if (statusFilter === 'all') {
        response = await tripService.getAllTrips();
      } else {
        response = await tripService.getTripsByStatus(statusFilter);
      }
      
      // Simulate pagination (if API doesn't support it)
      const startIndex = (pageNum - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedTrips = response.slice(startIndex, endIndex);
      
      if (refresh) {
        setTrips(paginatedTrips);
      } else {
        setTrips(prev => [...prev, ...paginatedTrips]);
      }
      
      setHasMore(paginatedTrips.length === itemsPerPage);
      setPage(pageNum);
    } catch (error) {
      console.error('Error loading trips:', error);
      presentToast({
        message: 'Failed to load trips. Please try again.',
        duration: 3000,
        color: 'danger'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = (event: CustomEvent) => {
    loadTrips(1, true).then(() => {
      event.detail.complete();
    });
  };

  const loadMore = (event: CustomEvent) => {
    loadTrips(page + 1).then(() => {
      (event.target as HTMLIonInfiniteScrollElement).complete();
    });
  };

  const handleSearch = (e: CustomEvent) => {
    const term = e.detail.value || '';
    setSearchTerm(term);
    
    if (term === '') {
      setFilteredTrips(trips);
    } else {
      const filtered = trips.filter(trip => 
        trip.fromAddress.toLowerCase().includes(term.toLowerCase()) ||
        trip.toAddress.toLowerCase().includes(term.toLowerCase()) ||
        trip.patientName?.toLowerCase().includes(term.toLowerCase()) ||
        trip.id.toString().includes(term)
      );
      setFilteredTrips(filtered);
    }
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    setTrips([]);
    setPage(1);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <IonBadge color="warning">Pending</IonBadge>;
      case 'accepted':
        return <IonBadge color="primary">Accepted</IonBadge>;
      case 'in_progress':
        return <IonBadge color="tertiary">In Progress</IonBadge>;
      case 'completed':
        return <IonBadge color="success">Completed</IonBadge>;
      case 'cancelled':
        return <IonBadge color="danger">Cancelled</IonBadge>;
      default:
        return <IonBadge>{status}</IonBadge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return hourglass;
      case 'accepted':
        return checkmarkCircle;
      case 'in_progress':
        return car;
      case 'completed':
        return checkmarkCircle;
      case 'cancelled':
        return closeCircle;
      default:
        return alertCircle;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    loadTrips(1, true);
  }, [statusFilter]);

  useEffect(() => {
    setFilteredTrips(trips);
  }, [trips]);

  const tripCounts = {
    all: trips.length,
    pending: trips.filter(t => t.status === 'pending').length,
    accepted: trips.filter(t => t.status === 'accepted').length,
    in_progress: trips.filter(t => t.status === 'in_progress').length,
    completed: trips.filter(t => t.status === 'completed').length,
    cancelled: trips.filter(t => t.status === 'cancelled').length
  };

  return (
    <AdminLayout title="Trip Management">
      <IonContent className="ion-padding">
        <div className="page-header">
          <div>
            <h1>Trip Management</h1>
            <p>Monitor and manage all trips in the system</p>
          </div>
        </div>

        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>

        <div className="search-filter-container">
          <IonSearchbar 
            placeholder="Search trips..." 
            onIonChange={handleSearch}
            value={searchTerm}
            animated
            debounce={300}
            className="search-bar"
          />
          
          <div className="status-filters">
            <IonChip 
              outline={statusFilter !== 'all'}
              color={statusFilter === 'all' ? 'primary' : 'medium'}
              onClick={() => handleStatusFilter('all')}
            >
              <IonLabel>All Trips</IonLabel>
              <IonBadge color={statusFilter === 'all' ? 'primary' : 'medium'}>{tripCounts.all}</IonBadge>
            </IonChip>
            
            <IonChip 
              outline={statusFilter !== 'pending'}
              color={statusFilter === 'pending' ? 'warning' : 'medium'}
              onClick={() => handleStatusFilter('pending')}
            >
              <IonLabel>Pending</IonLabel>
              <IonBadge color={statusFilter === 'pending' ? 'warning' : 'medium'}>{tripCounts.pending}</IonBadge>
            </IonChip>
            
            <IonChip 
              outline={statusFilter !== 'accepted'}
              color={statusFilter === 'accepted' ? 'primary' : 'medium'}
              onClick={() => handleStatusFilter('accepted')}
            >
              <IonLabel>Accepted</IonLabel>
              <IonBadge color={statusFilter === 'accepted' ? 'primary' : 'medium'}>{tripCounts.accepted}</IonBadge>
            </IonChip>
            
            <IonChip 
              outline={statusFilter !== 'in_progress'}
              color={statusFilter === 'in_progress' ? 'tertiary' : 'medium'}
              onClick={() => handleStatusFilter('in_progress')}
            >
              <IonLabel>In Progress</IonLabel>
              <IonBadge color={statusFilter === 'in_progress' ? 'tertiary' : 'medium'}>{tripCounts.in_progress}</IonBadge>
            </IonChip>
            
            <IonChip 
              outline={statusFilter !== 'completed'}
              color={statusFilter === 'completed' ? 'success' : 'medium'}
              onClick={() => handleStatusFilter('completed')}
            >
              <IonLabel>Completed</IonLabel>
              <IonBadge color={statusFilter === 'completed' ? 'success' : 'medium'}>{tripCounts.completed}</IonBadge>
            </IonChip>
            
            <IonChip 
              outline={statusFilter !== 'cancelled'}
              color={statusFilter === 'cancelled' ? 'danger' : 'medium'}
              onClick={() => handleStatusFilter('cancelled')}
            >
              <IonLabel>Cancelled</IonLabel>
              <IonBadge color={statusFilter === 'cancelled' ? 'danger' : 'medium'}>{tripCounts.cancelled}</IonBadge>
            </IonChip>
          </div>
        </div>

        {loading && trips.length === 0 ? (
          <div className="loading-container">
            <IonSpinner name="crescent" />
            <p>Loading trips...</p>
          </div>
        ) : (
          <div className="trip-list">
            {filteredTrips.length === 0 ? (
              <div className="empty-state">
                <IonIcon icon={list} className="empty-icon" />
                <h3>No trips found</h3>
                <p>Try adjusting your search or filter criteria</p>
              </div>
            ) : (
              <>
                {filteredTrips.map(trip => (
                  <IonItem 
                    key={trip.id} 
                    className="trip-item"
                    button
                    detail
                    routerLink={`/admin/trips/${trip.id}`}
                  >
                    <div className="trip-status-indicator" slot="start">
                      <IonIcon 
                        icon={getStatusIcon(trip.status)} 
                        className={`status-icon status-${trip.status}`}
                      />
                    </div>
                    
                    <div className="trip-info">
                      <div className="trip-header">
                        <h3>Trip #{trip.id}</h3>
                        {getStatusBadge(trip.status)}
                      </div>
                      
                      <div className="trip-details">
                        <div className="trip-detail-item">
                          <IonIcon icon={location} className="detail-icon" />
                          <div className="detail-text">
                            <IonText color="medium" className="detail-label">From</IonText>
                            <IonText className="detail-value">{trip.fromAddress}</IonText>
                          </div>
                        </div>
                        
                        <div className="trip-detail-item">
                          <IonIcon icon={location} className="detail-icon" />
                          <div className="detail-text">
                            <IonText color="medium" className="detail-label">To</IonText>
                            <IonText className="detail-value">{trip.toAddress}</IonText>
                          </div>
                        </div>
                        
                        {trip.patientName && (
                          <div className="trip-detail-item">
                            <IonIcon icon={person} className="detail-icon" />
                            <div className="detail-text">
                              <IonText color="medium" className="detail-label">Patient</IonText>
                              <IonText className="detail-value">{trip.patientName}</IonText>
                            </div>
                          </div>
                        )}
                        
                        <div className="trip-detail-item">
                          <IonIcon icon={time} className="detail-icon" />
                          <div className="detail-text">
                            <IonText color="medium" className="detail-label">Created</IonText>
                            <IonText className="detail-value">{formatDate(trip.createdAt)}</IonText>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="trip-actions" slot="end" onClick={e => e.stopPropagation()}>
                      <IonButton 
                        fill="clear" 
                        color="primary" 
                        routerLink={`/admin/trips/${trip.id}`}
                      >
                        <IonIcon icon={eye} />
                      </IonButton>
                    </div>
                  </IonItem>
                ))}
                
                <IonInfiniteScroll
                  onIonInfinite={loadMore}
                  threshold="100px"
                  disabled={!hasMore || loading}
                >
                  <IonInfiniteScrollContent
                    loadingText="Loading more trips..."
                    loadingSpinner="bubbles"
                  />
                </IonInfiniteScroll>
              </>
            )}
          </div>
        )}
      </IonContent>
    </AdminLayout>
  );
};

export default TripManagement;
