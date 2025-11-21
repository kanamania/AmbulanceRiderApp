import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { App } from '@capacitor/app';
import { 
  IonContent, 
  IonButton,
  IonIcon, 
  IonSpinner,
  useIonAlert,
  useIonToast,
  IonBadge,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonText,
  IonGrid,
  IonRow,
  IonCol,
  IonList,
  IonSelect,
  IonSelectOption,
} from '@ionic/react';
import { 
  arrowBack,
  location,
  person,
  time,
  car,
  checkmarkCircle,
  closeCircle,
  alertCircle,
  informationCircle,
  calendar,
  navigate as navigateIcon,
} from 'ionicons/icons';
import { useNavigate, useParams } from 'react-router-dom';
import {AdminLayout} from '../../layouts/AdminLayout';
import TripMap from '../../components/TripMap';
import { Trip, TripStatusLog, Vehicle } from '../../types';
import { tripService, vehicleService, notificationService } from '../../services';
import './AdminPages.css';

const TripDetails: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [statusLogs, setStatusLogs] = useState<TripStatusLog[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | undefined>();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [presentAlert] = useIonAlert();
  const [presentToast] = useIonToast();
  const navigate = useNavigate();

  const loadTripDetails = useCallback(async () => {
    if (!id) {
      presentToast({
        message: 'Invalid trip ID',
        duration: 3000,
        color: 'danger'
      });
      navigate(-1);
      return;
    }
    
    try {
      setLoading(true);
      const tripData = await tripService.getTripById(parseInt(id!));
      setTrip(tripData);
      setSelectedVehicleId(tripData.vehicleId);
      
      // Load available vehicles
      try {
        const vehiclesData = await vehicleService.getVehicles({ status: 'available' });
        setVehicles(vehiclesData.data);
      } catch (error) {
        console.error('Error loading vehicles:', error);
      }
      
      // Load status logs
      try {
        const logs = await tripService.getTripStatusLogs(parseInt(id!));
        setStatusLogs(logs);
      } catch (error) {
        console.error('Error loading status logs:', error);
      }
    } catch (error) {
      console.error('Error loading trip details:', error);
      presentToast({
        message: 'Failed to load trip details',
        duration: 3000,
        color: 'danger'
      });
      navigate(-1);
    } finally {
      setLoading(false);
    }
  }, [id, presentToast, navigate]);

  const handleStatusUpdate = async (newStatus: string) => {
    if (!trip) return;
    
    // For accepting trips, validate vehicle selection
    if (newStatus === 'accepted' && !selectedVehicleId) {
      presentToast({
        message: 'Please select a vehicle before accepting the trip',
        duration: 3000,
        color: 'warning'
      });
      return;
    }
    
    presentAlert({
      header: 'Update Trip Status',
      message: `Are you sure you want to change the status to ${newStatus}?`,
      inputs: newStatus === 'cancelled' ? [
        {
          name: 'reason',
          type: 'textarea',
          placeholder: 'Cancellation reason (optional)'
        }
      ] : [],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Confirm',
          handler: async (data) => {
            try {
              setUpdating(true);
              
              // Map status to numeric value
              const statusMap: { [key: string]: number } = {
                'pending': 0,
                'accepted': 1,
                'rejected': 2,
                'in_progress': 3,
                'completed': 4,
                'cancelled': 5
              };
              
              await tripService.updateTripStatus({
                id: trip.id,
                status: statusMap[newStatus],
                vehicleId: selectedVehicleId,
                notes: data?.reason || undefined
              });
              
              // Send notification via backend (will broadcast via SignalR)
              try {
                await notificationService.notifyTripStatusChanged(trip.id, newStatus);
              } catch (notifError) {
                console.error('Failed to send notification:', notifError);
                // Don't fail the status update if notification fails
              }
              
              presentToast({
                message: 'Trip status updated successfully',
                duration: 3000,
                color: 'success',
                icon: checkmarkCircle
              });
              
              // Reload trip details
              await loadTripDetails();
            } catch (error) {
              console.error('Error updating trip status:', error);
              presentToast({
                message: 'Failed to update trip status',
                duration: 3000,
                color: 'danger',
                icon: alertCircle
              });
            } finally {
              setUpdating(false);
            }
          }
        }
      ]
    });
  };

  const getStatusBadge = (status: string) => {
    const normalizeStatus = (s: string) => {
      const v = (s || '').toLowerCase();
      if (v === 'accepted' || v === 'approved') return 'approved';
      if (v === 'inprogress' || v === 'in_progress') return 'in_progress';
      return v;
    };
    switch (normalizeStatus(status)) {
      case 'pending':
        return <IonBadge color="warning">Pending</IonBadge>;
      case 'approved':
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

  const openInMaps = (latitude: number, longitude: number) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    window.open(url, '_blank');
  };

  const [estKm, setEstKm] = useState<number | null>(null);
  const [estMin, setEstMin] = useState<number | null>(null);
  const [estimating, setEstimating] = useState(false);

  const getCurrentPos = (): Promise<{ lat: number; lng: number }> =>
    new Promise((resolve, reject) => {
      if (!navigator.geolocation) return reject(new Error('Geolocation not supported'));
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => {
          if ((err as GeolocationPositionError)?.code === 1) {
            App.exitApp();
            return;
          }
          reject(err);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });

  const fetchLeg = async (a: { lat: number; lng: number }, b: { lat: number; lng: number }): Promise<{ dist: number; dur: number } | null> => {
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${a.lng},${a.lat};${b.lng},${b.lat}?overview=false&alternatives=false`;
      const res = await fetch(url);
      if (!res.ok) return null;
      const data = await res.json();
      const r = data?.routes?.[0];
      if (!r) return null;
      return { dist: r.distance || 0, dur: r.duration || 0 };
    } catch {
      return null;
    }
  };

  const computeFromCurrent = async () => {
    if (!trip) return;
    if (estimating) return;
    if (estKm !== null && estMin !== null) return;
    try {
      setEstimating(true);
      const cur = await getCurrentPos();
      const leg1 = await fetchLeg(cur, { lat: trip.fromLatitude, lng: trip.fromLongitude });
      const leg2 = await fetchLeg({ lat: trip.fromLatitude, lng: trip.fromLongitude }, { lat: trip.toLatitude, lng: trip.toLongitude });
      if (leg1 && leg2) {
        setEstKm((leg1.dist + leg2.dist) / 1000);
        setEstMin((leg1.dur + leg2.dur) / 60);
      }
    } finally {
      setEstimating(false);
    }
  };

  const openDirections = async (fromLat: number, fromLng: number, toLat: number, toLng: number) => {
    let originParam = 'Current+Location';
    try {
      const cur = await getCurrentPos();
      originParam = `${cur.lat},${cur.lng}`;
      if (estKm === null || estMin === null) {
        computeFromCurrent();
      }
    } catch (e){
      console.error('Error getting current position:', e);
    }
    const url = `https://www.google.com/maps/dir/?api=1&origin=${originParam}&destination=${toLat},${toLng}&waypoints=${fromLat},${fromLng}&travelmode=driving`;
    window.open(url, '_blank');
  };

  const decodePolyline = (str: string): [number, number][] => {
    let index = 0, lat = 0, lng = 0;
    const coordinates: [number, number][] = [];
    const len = str.length;
    while (index < len) {
      let b = 0, shift = 0, result = 0;
      do {
        b = str.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlat = (result & 1) ? ~(result >> 1) : (result >> 1);
      lat += dlat;
      shift = 0;
      result = 0;
      do {
        b = str.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlng = (result & 1) ? ~(result >> 1) : (result >> 1);
      lng += dlng;
      coordinates.push([lat / 1e5, lng / 1e5]);
    }
    return coordinates;
  };

  const routePath = useMemo(() => {
    if (!trip) return [] as { lat: number; lng: number }[];
    const encoded = trip.routePolyline || trip.optimizedRoute || '';
    if (!encoded) return [] as { lat: number; lng: number }[];
    return decodePolyline(encoded).map(([la, ln]) => ({ lat: la, lng: ln }));
  }, [trip]);

  useEffect(() => {
    loadTripDetails();
  }, [id, loadTripDetails]);

  if (loading) {
    return (
      <AdminLayout title="Trip Details">
        <div className="loading-container">
          <IonSpinner name="crescent" />
          <p>Loading trip details...</p>
        </div>
      </AdminLayout>
    );
  }

  if (!trip) {
    return (
      <AdminLayout title="Trip Details">
        <div className="error-message">
          <IonIcon icon={alertCircle} />
          <h3>Trip not found</h3>
          <IonButton routerLink="/admin/trips">Back to Trips</IonButton>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Trip Details">
      <IonContent className="ion-padding">
        <div className="page-header">
          <div>
            <h1>Trip #{trip.id}</h1>
            <p>View and manage trip details</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {getStatusBadge(trip.status)}
            <IonButton 
              fill="outline" 
              color="medium"
              onClick={() => navigate(-1)}
            >
              <IonIcon icon={arrowBack} slot="start" />
              Back
            </IonButton>
          </div>
        </div>

        <IonGrid>
          <IonRow>
            <IonCol size="12" sizeMd="8">
              {/* Trip Information */}
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>
                    <IonIcon icon={informationCircle} className="section-icon" />
                    Trip Information
                  </IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <IonList lines="none">
                    <IonItem>
                      <IonIcon icon={location} slot="start" color="primary" />
                      <IonLabel>
                        <h3>Pickup Location</h3>
                        <p>{trip.fromLocationName}</p>
                        <IonButton 
                          size="small" 
                          fill="clear" 
                          onClick={() => openInMaps(trip.fromLatitude, trip.fromLongitude)}
                        >
                          <IonIcon icon={navigateIcon} slot="start" />
                          Open in Maps
                        </IonButton>
                      </IonLabel>
                    </IonItem>
                    
                    <IonItem>
                      <IonIcon icon={location} slot="start" color="danger" />
                      <IonLabel>
                        <h3>Destination</h3>
                        <p>{trip.toLocationName}</p>
                        <IonButton 
                          size="small" 
                          fill="clear" 
                          onClick={() => openInMaps(trip.toLatitude, trip.toLongitude)}
                        >
                          <IonIcon icon={navigateIcon} slot="start" />
                          Open in Maps
                        </IonButton>
                      </IonLabel>
                    </IonItem>
                    
                    {trip.name && (
                      <IonItem>
                        <IonIcon icon={person} slot="start" color="tertiary" />
                        <IonLabel>
                          <h3>Trip Name</h3>
                          <p>{trip.name}</p>
                        </IonLabel>
                      </IonItem>
                    )}
                    
                    {trip.description && (
                      <IonItem>
                        <IonLabel>
                          <h3>Description</h3>
                          <p>{trip.description}</p>
                        </IonLabel>
                      </IonItem>
                    )}
                    
                    <IonItem>
                      <IonIcon icon={time} slot="start" color="medium" />
                      <IonLabel>
                        <h3>Created At</h3>
                        <p>{formatDate(trip.createdAt)}</p>
                      </IonLabel>
                    </IonItem>
                    
                    
                  </IonList>
                </IonCardContent>
              </IonCard>

              {/* Dynamic Attributes */}
              {Array.isArray(trip.attributeValues) && trip.attributeValues.length > 0 && (
                <IonCard>
                  <IonCardHeader>
                    <IonCardTitle>Additional Information</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <IonList lines="none">
                      {trip.attributeValues.map((av) => (
                        <IonItem key={av.tripTypeAttributeId}>
                          <IonLabel>
                            <h3>{trip.tripType?.attributes.find(a => a.id === av.tripTypeAttributeId)?.label || `Attribute ${av.tripTypeAttributeId}`}</h3>
                            <p>{av.value}</p>
                          </IonLabel>
                        </IonItem>
                      ))}
                    </IonList>
                  </IonCardContent>
                </IonCard>
              )}

              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>Route Preview</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <div style={{ marginBottom: 12 }}>
                    <TripMap
                      fromLocation={{ lat: trip.fromLatitude, lng: trip.fromLongitude, name: trip.fromLocationName || 'From' }}
                      toLocation={{ lat: trip.toLatitude, lng: trip.toLongitude, name: trip.toLocationName || 'To' }}
                      route={routePath}
                    />
                  </div>
                  {(trip.estimatedDistance != null || trip.estimatedDuration != null) && (
                    <div style={{ marginBottom: 6, fontSize: 14 }}>
                      Server estimate: 
                      {trip.estimatedDistance != null && (
                        <> {(trip.estimatedDistance / 1000).toFixed(1)} km</>
                      )}
                      {trip.estimatedDuration != null && (
                        <> {trip.estimatedDistance != null ? ', ' : ''}{Math.round(trip.estimatedDuration / 60)} min</>
                      )}
                    </div>
                  )}
                  {estKm !== null && estMin !== null && (
                    <div style={{ marginBottom: 12, fontSize: 14 }}>
                      From my location: {estKm.toFixed(1)} km, {Math.round(estMin)} min
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <IonButton onClick={() => openDirections(trip.fromLatitude, trip.fromLongitude, trip.toLatitude, trip.toLongitude)}>Open Directions</IonButton>
                    <IonButton fill="outline" onClick={computeFromCurrent} disabled={estimating}>{estimating ? 'Computing…' : 'Use My Location'}</IonButton>
                  </div>
                </IonCardContent>
              </IonCard>

              {/* Status History */}
              {statusLogs.length > 0 && (
                <IonCard>
                  <IonCardHeader>
                    <IonCardTitle>
                      <IonIcon icon={calendar} className="section-icon" />
                      Status History
                    </IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <div className="status-timeline">
                      {statusLogs.map((log) => (
                        <div key={log.id} className="timeline-item">
                          <div className="timeline-marker"></div>
                          <div className="timeline-content">
                            <div className="timeline-header">
                              <IonText color="dark">
                                <strong>{log.toStatus.replace('_', ' ').toUpperCase()}</strong>
                              </IonText>
                              <IonText color="medium">
                                <small>{formatDate(log.changedAt)}</small>
                              </IonText>
                            </div>
                            <IonText color="medium">
                              <p>Changed by {log.userName} ({log.userRole})</p>
                            </IonText>
                            {log.notes && (
                              <IonText>
                                <p className="timeline-notes">{log.notes}</p>
                              </IonText>
                            )}
                            {log.rejectionReason && (
                              <IonText color="danger">
                                <p><strong>Reason:</strong> {log.rejectionReason}</p>
                              </IonText>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </IonCardContent>
                </IonCard>
              )}
            </IonCol>
            
            <IonCol size="12" sizeMd="4">
              {/* Status Management */}
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>Status Management</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <IonList lines="full">
                    <IonItem>
                      <IonLabel>Current Status</IonLabel>
                      {getStatusBadge(trip.status)}
                    </IonItem>
                    
                    {/* Vehicle Selection */}
                    {trip.status === 'pending' && (
                      <IonItem>
                        <IonLabel position="stacked">Select Vehicle *</IonLabel>
                        <IonSelect
                          value={selectedVehicleId}
                          onIonChange={(e) => setSelectedVehicleId(e.detail.value)}
                          placeholder="Choose a vehicle"
                          interface="action-sheet"
                        >
                          {vehicles.map((vehicle) => (
                            <IonSelectOption key={vehicle.id} value={vehicle.id}>
                              {vehicle.make} {vehicle.model} - {vehicle.licensePlate}
                            </IonSelectOption>
                          ))}
                        </IonSelect>
                      </IonItem>
                    )}
                    
                    {/* Display assigned vehicle */}
                    {trip.vehicle && (
                      <IonItem>
                        <IonIcon icon={car} slot="start" color="primary" />
                        <IonLabel>
                          <h3>Assigned Vehicle</h3>
                          <p>{trip.vehicle.name}</p>
                        </IonLabel>
                      </IonItem>
                    )}
                  </IonList>
                  
                  <div className="status-actions">
                    <h4>Quick Actions</h4>
                    
                    {trip.status === 'pending' && (
                      <>
                        <IonButton 
                          expand="block" 
                          color="success"
                          onClick={() => handleStatusUpdate('accepted')}
                          disabled={updating}
                        >
                          <IonIcon icon={checkmarkCircle} slot="start" />
                          Accept Trip
                        </IonButton>
                        <IonButton 
                          expand="block" 
                          color="danger"
                          fill="outline"
                          onClick={() => handleStatusUpdate('cancelled')}
                          disabled={updating}
                        >
                          <IonIcon icon={closeCircle} slot="start" />
                          Reject Trip
                        </IonButton>
                      </>
                    )}
                    
                    {trip.status === 'accepted' && (
                      <IonButton 
                        expand="block" 
                        color="primary"
                        onClick={() => handleStatusUpdate('in_progress')}
                        disabled={updating}
                      >
                        <IonIcon icon={car} slot="start" />
                        Start Trip
                      </IonButton>
                    )}
                    
                    {trip.status === 'in_progress' && (
                      <IonButton 
                        expand="block" 
                        color="success"
                        onClick={() => handleStatusUpdate('completed')}
                        disabled={updating}
                      >
                        <IonIcon icon={checkmarkCircle} slot="start" />
                        Complete Trip
                      </IonButton>
                    )}
                    
                    {['pending', 'accepted', 'in_progress'].includes(trip.status) && (
                      <IonButton 
                        expand="block" 
                        color="danger"
                        fill="outline"
                        onClick={() => handleStatusUpdate('cancelled')}
                        disabled={updating}
                      >
                        <IonIcon icon={closeCircle} slot="start" />
                        Cancel Trip
                      </IonButton>
                    )}
                  </div>
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </AdminLayout>
  );
};

export default TripDetails;
