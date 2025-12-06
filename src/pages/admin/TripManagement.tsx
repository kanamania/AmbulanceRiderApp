import React, { useEffect, useState, useCallback } from 'react';
import { 
  IonContent, 
  IonSearchbar,
  IonRefresher, 
  IonRefresherContent, 
  IonSpinner,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  useIonToast,
  IonBadge,
  IonChip,
  IonLabel,
  IonItem,
  IonText,
  IonIcon,
  IonButton
} from '@ionic/react';
import { 
  list, 
  time, 
  location, 
  car,
  checkmarkCircle,
  closeCircle,
  alertCircle,
  hourglass,
  eye,
  sync,
  wifi,
  wifiOutline
} from 'ionicons/icons';
import {AdminLayout} from '../../layouts/AdminLayout';
import { Trip } from '../../types';
import tripService from '../../services/trip.service';
import './AdminPages.css';
import {useSync} from "../../contexts/useSync";
import {getNormalizedStatus, getStatusStyle} from '../../utils/statusStyles';

const TripManagement: React.FC = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [filteredTrips, setFilteredTrips] = useState<Trip[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [presentToast] = useIonToast();
  const { syncStatus, forceSync } = useSync();
  const itemsPerPage = 10;

  const loadTrips = useCallback(async (pageNum: number = 1, refresh: boolean = false) => {
    try {
      setLoading(true);
      
      // Use sync-aware trip service
      let response;
      if (statusFilter === 'all') {
        response = await tripService.getTripsWithSync();
      } else {
        const toApiStatus = (s: string) => {
          const normalized = getNormalizedStatus(s);
          switch (normalized) {
            case 'pending':
              return 'Pending';
            case 'approved':
              return 'Approved';
            case 'rejected':
              return 'Rejected';
            case 'in_progress':
              return 'InProgress';
            case 'completed':
              return 'Completed';
            case 'cancelled':
              return 'Cancelled';
            default:
              return s;
          }
        };
        response = await tripService.getTripsByStatus(toApiStatus(statusFilter));
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
  }, [statusFilter, presentToast]);

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
      const lc = term.toLowerCase();
      const filtered = trips.filter(trip => {
        const fromName = (trip.fromLocationName || '').toLowerCase();
        const toName = (trip.toLocationName || '').toLowerCase();
        const tripName = (trip.name || '').toLowerCase();
        const attrHit = Array.isArray(trip.attributeValues)
          ? trip.attributeValues.some(av => (av.value || '').toLowerCase().includes(lc))
          : false;
        return fromName.includes(lc) || toName.includes(lc) || tripName.includes(lc) || attrHit || trip.id.toString().includes(term);
      });
      setFilteredTrips(filtered);
    }
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    setTrips([]);
    setPage(1);
  };

  const getStatusBadge = (status: string) => {
    const normalized = getNormalizedStatus(status);
    const { background, color } = getStatusStyle(normalized);
    const style = {
      '--background': background,
      '--color': color
    } as React.CSSProperties;

    switch (normalized) {
      case 'pending':
        return <IonBadge style={style}>Pending</IonBadge>;
      case 'approved':
        return <IonBadge style={style}>Accepted</IonBadge>;
      case 'in_progress':
        return <IonBadge style={style}>In Progress</IonBadge>;
      case 'completed':
        return <IonBadge style={style}>Completed</IonBadge>;
      case 'cancelled':
        return <IonBadge style={style}>Cancelled</IonBadge>;
      case 'rejected':
        return <IonBadge style={style}>Rejected</IonBadge>;
      default:
        return <IonBadge style={style}>{status}</IonBadge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (getNormalizedStatus(status)) {
      case 'pending':
        return hourglass;
      case 'approved':
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

  const getStatusColor = (status: string) => getStatusStyle(getNormalizedStatus(status)).background;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    // Less than a minute
    if (diffInSeconds < 60) {
      return 'Just now';
    }
    
    // Less than an hour
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return diffInMinutes === 1 ? '1 minute ago' : `${diffInMinutes} minutes ago`;
    }
    
    // Less than a day
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return diffInHours === 1 ? '1 hour ago' : `${diffInHours} hours ago`;
    }
    
    // Less than a week
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      if (diffInDays === 1) {
        return 'Yesterday at ' + date.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
      }
      return diffInDays === 1 ? '1 day ago' : `${diffInDays} days ago`;
    }
    
    // More than a week - show formatted date
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    loadTrips(1, true);
  }, [statusFilter, loadTrips]);

  useEffect(() => {
    setFilteredTrips(trips);
  }, [trips]);

  const tripCounts = {
    all: trips.length,
    pending: trips.filter(t => getNormalizedStatus(t.status) === 'pending').length,
    accepted: trips.filter(t => getNormalizedStatus(t.status) === 'approved').length,
    in_progress: trips.filter(t => getNormalizedStatus(t.status) === 'in_progress').length,
    completed: trips.filter(t => getNormalizedStatus(t.status) === 'completed').length,
    cancelled: trips.filter(t => getNormalizedStatus(t.status) === 'cancelled').length
  };

  const renderStatusChip = (
    statusKey: string,
    label: string,
    count: number
  ) => {
    if (count <= 0) return null;
    const normalized = getNormalizedStatus(statusKey);
    const { background, color } = getStatusStyle(normalized);
    const isSelected = getNormalizedStatus(statusFilter) === normalized;

    const chipStyle = {
      border: `1px solid ${background}`,
      '--background': isSelected ? background : 'transparent',
      '--color': isSelected ? color : background
    } as React.CSSProperties;

    const badgeStyle = {
      '--background': background,
      '--color': color,
      marginLeft: '8px'
    } as React.CSSProperties;

    return (
      <IonChip
        key={statusKey}
        outline={!isSelected}
        style={chipStyle}
        onClick={() => handleStatusFilter(statusKey)}
      >
        <IonLabel>{label}</IonLabel>
        <IonBadge style={badgeStyle}>{count}</IonBadge>
      </IonChip>
    );
  };

  return (
    <AdminLayout title="Trip Management">
      <IonContent className="ion-padding">
        <div className="page-header">
          <div>
            <h1>Trip Management</h1>
            <p>Monitor and manage all trips in the system</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {/* Sync Status Indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginRight: '0.5rem' }}>
              <IonIcon 
                icon={syncStatus.isOnline ? wifi : wifiOutline} 
                color={syncStatus.isOnline ? 'success' : 'danger'}
                style={{ fontSize: '1.2rem' }}
              />
              {syncStatus.syncInProgress && (
                <IonIcon 
                  icon={sync} 
                  color="primary"
                  style={{ fontSize: '1.2rem', animation: 'spin 1s linear infinite' }}
                />
              )}
            </div>
            
            {/* Force Sync Button */}
            <IonButton 
              fill="outline" 
              size="small"
              onClick={forceSync}
              disabled={syncStatus.syncInProgress || !syncStatus.isOnline}
            >
              <IonIcon icon={sync} slot="start" />
              Sync
            </IonButton>
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
            
            {renderStatusChip('pending', 'Pending', tripCounts.pending)}
            
            {renderStatusChip('accepted', 'Accepted', tripCounts.accepted)}
            
            {renderStatusChip('in_progress', 'In Progress', tripCounts.in_progress)}
            
            {renderStatusChip('completed', 'Completed', tripCounts.completed)}
            
            {renderStatusChip('cancelled', 'Cancelled', tripCounts.cancelled)}
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
                        style={{ color: getStatusColor(trip.status) }}
                        className={`status-icon status-${(trip.status || '').toLowerCase().replace('inprogress','in_progress').replace('accepted','approved')}`}
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
                            <IonText className="detail-value">{trip.fromLocationName}</IonText>
                          </div>
                        </div>
                        
                        <div className="trip-detail-item">
                          <IonIcon icon={location} className="detail-icon" />
                          <div className="detail-text">
                            <IonText color="medium" className="detail-label">To</IonText>
                            <IonText className="detail-value">{trip.toLocationName}</IonText>
                          </div>
                        </div>

                        
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
