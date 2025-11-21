import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { App } from '@capacitor/app';
import {
  IonContent,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  IonSpinner,
  IonBadge,
  IonChip,
  IonLabel,
  IonItem,
  IonIcon,
  IonButton,
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonList,
  IonSelect,
  IonSelectOption,
  IonSearchbar,
  useIonToast,
  useIonAlert,
} from '@ionic/react';
import {
  list,
  time,
  car,
  checkmarkCircle,
  closeCircle,
  alertCircle,
  hourglass,
  close,
  person
} from 'ionicons/icons';
import { useTranslation } from 'react-i18next';
import AppHeader from '../components/AppHeader';
import TripMap from '../components/TripMap';
import { tripService, vehicleService, notificationService } from '../services';
import { Trip, Vehicle } from '../types';
import './Activity.css';
import {useAuth} from "../contexts/useAuth";

const Activity: React.FC = () => {
  const { t } = useTranslation();
  const { hasRole } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [filteredTrips, setFilteredTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [showTripModal, setShowTripModal] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | undefined>();
  const [updating, setUpdating] = useState(false);
  const [presentToast] = useIonToast();
  const [presentAlert] = useIonAlert();
  const [estKm, setEstKm] = useState<number | null>(null);
  const [estMin, setEstMin] = useState<number | null>(null);
  const [estimating, setEstimating] = useState(false);
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [vehicleSearchText, setVehicleSearchText] = useState('');

  const isAdminOrDispatcher = hasRole('Admin', 'Dispatcher');

  const normalizeStatus = useCallback((status: string) => {
    const s = (status || '').toLowerCase();
    if (s === 'accepted') return 'approved';
    if (s === 'inprogress') return 'in_progress';
    return s;
  }, []);

  const filterTrips = useCallback((tripsData: Trip[], status: string) => {
    if (status === 'all') {
      setFilteredTrips(tripsData);
    } else {
      setFilteredTrips(tripsData.filter((trip) => normalizeStatus(trip.status) === normalizeStatus(status)));
    }
  }, [normalizeStatus]);

  const loadTrips = useCallback(async () => {
    try {
      setLoading(true);
      const response = await tripService.getAllTrips();
      setTrips(response);
      filterTrips(response, statusFilter);
    } catch (error) {
      console.error('Error loading trips:', error);
      presentToast({
        message: t('messages.loadError'),
        duration: 3000,
        color: 'danger',
      });
    } finally {
      setLoading(false);
    }
  }, [statusFilter, t, presentToast, filterTrips]);

  const loadVehicles = async () => {
    try {
      const vehiclesData = await vehicleService.getVehicles({ status: 'available' });
      setVehicles(vehiclesData.data);
    } catch (error) {
      console.error('Error loading vehicles:', error);
    }
  };

  const handleRefresh = async (event: CustomEvent) => {
    await loadTrips();
    event.detail.complete();
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    filterTrips(trips, status);
  };

  const handleTripClick = (trip: Trip) => {
    console.log(trip);
    setSelectedTrip(trip);
    setSelectedVehicleId(trip.vehicleId);
    setShowTripModal(true);
    // Reset estimation state for new trip
    setEstKm(null);
    setEstMin(null);
    setEstimating(false);
  };

  // Filter vehicles based on search text
  const filteredVehicles = useMemo(() => {
    if (!vehicleSearchText.trim()) return vehicles;
    const searchLower = vehicleSearchText.toLowerCase();
    return vehicles.filter(vehicle => 
      vehicle.make?.toLowerCase().includes(searchLower) ||
      vehicle.model?.toLowerCase().includes(searchLower) ||
      vehicle.licensePlate?.toLowerCase().includes(searchLower) ||
      vehicle.name?.toLowerCase().includes(searchLower)
    );
  }, [vehicles, vehicleSearchText]);

  const handleAcceptTrip = () => {
    if (!selectedTrip) return;
    // Show vehicle selection modal
    setVehicleSearchText('');
    setShowVehicleModal(true);
  };

  const handleVehicleSelect = async (vehicleId: number) => {
    if (!selectedTrip) return;
    
    setShowVehicleModal(false);
    setSelectedVehicleId(vehicleId);
    
    try {
      setUpdating(true);
      
      await tripService.updateTripStatus({
        id: selectedTrip.id,
        status: 1, // Accepted
        vehicleId: vehicleId,
      });
      
      // Send notification via backend (will broadcast via SignalR)
      try {
        await notificationService.notifyTripStatusChanged(selectedTrip.id, 'accepted');
      } catch (notifError) {
        console.error('Failed to send notification:', notifError);
        // Don't fail the status update if notification fails
      }
      
      presentToast({
        message: 'Trip accepted successfully',
        duration: 3000,
        color: 'success',
        icon: checkmarkCircle
      });
      
      setShowTripModal(false);
      // Reload trips
      await loadTrips();
    } catch (error) {
      console.error('Error accepting trip:', error);
      presentToast({
        message: 'Failed to accept trip',
        duration: 3000,
        color: 'danger',
        icon: alertCircle
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!selectedTrip) return;
    
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
                id: selectedTrip.id,
                status: statusMap[newStatus],
                vehicleId: selectedVehicleId,
                notes: data?.reason || undefined
              });
              
              // Send notification via backend (will broadcast via SignalR)
              try {
                await notificationService.notifyTripStatusChanged(selectedTrip.id, newStatus);
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
              
              setShowTripModal(false);
              // Reload trips
              await loadTrips();
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

  const getStatusIcon = (status: string) => {
    switch (normalizeStatus(status)) {
      case 'pending':
        return hourglass;
      case 'approved':
        return checkmarkCircle;
      case 'in_progress':
        return car;
      case 'rejected':
        return closeCircle;
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
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

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
    if (!selectedTrip) return;
    if (estimating) return;
    if (estKm !== null && estMin !== null) return;
    try {
      setEstimating(true);
      const cur = await getCurrentPos();
      const leg1 = await fetchLeg(cur, { lat: selectedTrip.fromLatitude, lng: selectedTrip.fromLongitude });
      const leg2 = await fetchLeg({ lat: selectedTrip.fromLatitude, lng: selectedTrip.fromLongitude }, { lat: selectedTrip.toLatitude, lng: selectedTrip.toLongitude });
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
    if (!selectedTrip) return [] as { lat: number; lng: number }[];
    const encoded = selectedTrip.routePolyline || selectedTrip.optimizedRoute || '';
    if (!encoded) return [] as { lat: number; lng: number }[];
    return decodePolyline(encoded).map(([la, ln]) => ({ lat: la, lng: ln }));
  }, [selectedTrip]);

  useEffect(() => {
    loadTrips();
    if (isAdminOrDispatcher) {
      loadVehicles();
    }
  }, [isAdminOrDispatcher, loadTrips]);

  const tripCounts = {
    all: trips.length,
    pending: trips.filter((t) => normalizeStatus(t.status) === 'pending').length,
    accepted: trips.filter((t) => normalizeStatus(t.status) === 'approved').length,
    in_progress: trips.filter((t) => normalizeStatus(t.status) === 'in_progress').length,
    completed: trips.filter((t) => normalizeStatus(t.status) === 'completed').length,
    cancelled: trips.filter((t) => normalizeStatus(t.status) === 'cancelled').length,
  };

  return (
    <IonPage>
      <AppHeader title={t('navigation.trips')} />

      <IonContent className="ion-padding">
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>

        <div className="status-filters" style={{ marginBottom: '16px', overflowX: 'auto', whiteSpace: 'nowrap' }}>
          <IonChip
            outline={statusFilter !== 'all'}
            color={statusFilter === 'all' ? 'primary' : 'medium'}
            onClick={() => handleStatusFilter('all')}
          >
            <IonLabel>{t('common.all')}</IonLabel>
            <IonBadge color={statusFilter === 'all' ? 'primary' : 'medium'}>{tripCounts.all}</IonBadge>
          </IonChip>

          <IonChip
            outline={statusFilter !== 'pending'}
            color={statusFilter === 'pending' ? 'warning' : 'medium'}
            onClick={() => handleStatusFilter('pending')}
          >
            <IonLabel>{t('trip.pending')}</IonLabel>
            <IonBadge color={statusFilter === 'pending' ? 'warning' : 'medium'}>{tripCounts.pending}</IonBadge>
          </IonChip>

          <IonChip
            outline={statusFilter !== 'accepted'}
            color={statusFilter === 'accepted' ? 'primary' : 'medium'}
            onClick={() => handleStatusFilter('accepted')}
          >
            <IonLabel>{t('trip.approved')}</IonLabel>
            <IonBadge color={statusFilter === 'accepted' ? 'primary' : 'medium'}>{tripCounts.accepted}</IonBadge>
          </IonChip>

          <IonChip
            outline={statusFilter !== 'in_progress'}
            color={statusFilter === 'in_progress' ? 'tertiary' : 'medium'}
            onClick={() => handleStatusFilter('in_progress')}
          >
            <IonLabel>{t('trip.inProgress')}</IonLabel>
            <IonBadge color={statusFilter === 'in_progress' ? 'tertiary' : 'medium'}>{tripCounts.in_progress}</IonBadge>
          </IonChip>

          <IonChip
            outline={statusFilter !== 'completed'}
            color={statusFilter === 'completed' ? 'success' : 'medium'}
            onClick={() => handleStatusFilter('completed')}
          >
            <IonLabel>{t('trip.completed')}</IonLabel>
            <IonBadge color={statusFilter === 'completed' ? 'success' : 'medium'}>{tripCounts.completed}</IonBadge>
          </IonChip>

          <IonChip
            outline={statusFilter !== 'cancelled'}
            color={statusFilter === 'cancelled' ? 'danger' : 'medium'}
            onClick={() => handleStatusFilter('cancelled')}
          >
            <IonLabel>{t('trip.cancelled')}</IonLabel>
            <IonBadge color={statusFilter === 'cancelled' ? 'danger' : 'medium'}>{tripCounts.cancelled}</IonBadge>
          </IonChip>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <IonSpinner name="crescent" />
          </div>
        ) : filteredTrips.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <IonIcon icon={list} style={{ fontSize: '64px', color: '#ccc' }} />
            <h3>{t('trip.noTrips')}</h3>
            <p>{t('trip.noTripsMessage')}</p>
          </div>
        ) : (
          <div>
            {filteredTrips.map((trip) => (
              <IonCard key={trip.id} button onClick={() => handleTripClick(trip)}>
                <IonCardContent>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <IonIcon icon={getStatusIcon(trip.status)} color={trip.status === 'completed' ? 'success' : trip.status === 'cancelled' ? 'danger' : 'primary'} />
                      <strong>Trip #{trip.id} - {trip.name}</strong>
                      {trip.estimatedDistance != null && (
                        <small style={{ color: '#666' }}>
                          {(trip.estimatedDistance / 1000).toFixed(1)} km
                        </small>
                      )}
                    </div>
                    {getStatusBadge(trip.status)}
                  </div>

                  {trip.vehicle && (
                    <IonItem lines="none">
                      <IonIcon icon={car} slot="start" color="success" />
                      <IonLabel>
                        <p style={{ fontSize: '12px', color: '#666' }}>{t('trip.vehicle')}</p>
                        <h3 style={{ fontSize: '14px', margin: '4px 0' }}>
                          {trip.vehicle.name}
                        </h3>
                      </IonLabel>
                    </IonItem>
                  )}

                  {trip.driver && (
                    <IonItem lines="none">
                      <IonIcon icon={person} slot="start" color="primary" />
                      <IonLabel>
                        <p style={{ fontSize: '12px', color: '#666' }}>Driver</p>
                        <h3 style={{ fontSize: '14px', margin: '4px 0' }}>
                          {trip.driver.firstName} {trip.driver.lastName}
                        </h3>
                      </IonLabel>
                    </IonItem>
                  )}

                  <IonItem lines="none">
                    <IonIcon icon={time} slot="start" color="medium" />
                    <IonLabel>
                      <h3 style={{ fontSize: '14px', margin: '4px 0' }}>{formatDate(trip.createdAt)}</h3>
                    </IonLabel>
                  </IonItem>
                </IonCardContent>
              </IonCard>
            ))}
          </div>
        )}

        {/* Trip Summary Modal */}
        <IonModal isOpen={showTripModal} onDidDismiss={() => setShowTripModal(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>{t('trip.tripDetails')}</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowTripModal(false)}>
                  <IonIcon icon={close} />
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-no-padding">
            {selectedTrip && (
              <>
                <IonCard>
                  <IonCardHeader>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexDirection: 'column' }}>
                      <IonCardTitle>Trip #{selectedTrip.id} - {selectedTrip.name}</IonCardTitle>
                      <small>{getStatusBadge(selectedTrip.status)}</small>
                      <p>{formatDate(selectedTrip.createdAt)}</p>
                    </div>
                  </IonCardHeader>
                  <IonCardContent>
                    <IonList lines="none">
                      {/* Route Preview */}
                      <div style={{ marginBottom: '16px' }}>
                        <h3 style={{ marginTop: 0, marginBottom: '12px', fontSize: '16px', fontWeight: 'bold' }}>
                          Route Preview
                        </h3>
                        <TripMap
                          fromLocation={{
                            lat: selectedTrip.fromLatitude,
                            lng: selectedTrip.fromLongitude,
                            name: selectedTrip.fromLocationName
                          }}
                          toLocation={{
                            lat: selectedTrip.toLatitude,
                            lng: selectedTrip.toLongitude,
                            name: selectedTrip.toLocationName
                          }}
                          route={routePath}
                        />

                        {(selectedTrip.estimatedDistance != null || selectedTrip.estimatedDuration != null) && (
                          <div style={{ marginTop: 12, marginBottom: 6, fontSize: 14 }}>
                            Server estimate: 
                            {selectedTrip.estimatedDistance != null && (
                              <> {(selectedTrip.estimatedDistance / 1000).toFixed(1)} km</>
                            )}
                            {selectedTrip.estimatedDuration != null && (
                              <> {selectedTrip.estimatedDistance != null ? ', ' : ''}{Math.round(selectedTrip.estimatedDuration / 60)} min</>
                            )}
                          </div>
                        )}
                        {estKm !== null && estMin !== null && (
                          <div style={{ marginBottom: 12, fontSize: 14 }}>
                            From my location: {estKm.toFixed(1)} km, {Math.round(estMin)} min
                          </div>
                        )}
                        
                        <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <IonButton 
                            onClick={() => openDirections(selectedTrip.fromLatitude, selectedTrip.fromLongitude, selectedTrip.toLatitude, selectedTrip.toLongitude)}
                          >
                            Open Directions
                          </IonButton>
                          <IonButton 
                            fill="outline" 
                            onClick={computeFromCurrent} 
                            disabled={estimating}
                          >
                            {estimating ? 'Computing…' : 'Use My Location'}
                          </IonButton>
                        </div>
                      </div>

                      {selectedTrip.description && (
                        <IonItem>
                          <IonLabel>
                            <h3>Notes</h3>
                            <p>{selectedTrip.description}</p>
                          </IonLabel>
                        </IonItem>
                      )}

                      {/* Vehicle Selection for Admin/Dispatcher */}
                      {isAdminOrDispatcher && selectedTrip.status === 'pending' && (
                        <IonItem>
                          <IonLabel position="stacked">{t('trip.selectVehicle')} *</IonLabel>
                          <IonSelect
                            value={selectedVehicleId}
                            onIonChange={(e) => setSelectedVehicleId(e.detail.value)}
                            placeholder={t('trip.selectVehicle')}
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
                      {selectedTrip.vehicle && (
                        <IonItem>
                          <IonIcon icon={car} slot="start" color="primary" />
                          <IonLabel>
                            <h3>{t('trip.assignedVehicle')}</h3>
                            <p>
                              {selectedTrip.vehicle.name}
                            </p>
                          </IonLabel>
                        </IonItem>
                      )}

                      {/* Display assigned driver */}
                      {selectedTrip.driver && (
                        <IonItem>
                          <IonIcon icon={person} slot="start" color="tertiary" />
                          <IonLabel>
                            <h3>Assigned Driver</h3>
                            <p>
                              {selectedTrip.driver.firstName} {selectedTrip.driver.lastName}
                            </p>
                            {selectedTrip.driver.email && (
                              <p style={{ fontSize: '12px', color: '#666' }}>
                                {selectedTrip.driver.email}
                              </p>
                            )}
                          </IonLabel>
                        </IonItem>
                      )}
                    </IonList>
                  </IonCardContent>
                </IonCard>

                {/* Action Buttons */}
                <div style={{ marginTop: '16px', padding: '0 16px 16px' }}>
                  {normalizeStatus(selectedTrip.status) === 'pending' && isAdminOrDispatcher && (
                    <>
                      <IonButton 
                        expand="block" 
                        color="success"
                        onClick={handleAcceptTrip}
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
                  
                  {normalizeStatus(selectedTrip.status) === 'approved' && (
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
                  
                  {normalizeStatus(selectedTrip.status) === 'in_progress' && (
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
                  
                  {['pending', 'approved', 'in_progress'].includes(normalizeStatus(selectedTrip.status)) && (
                    <IonButton 
                      expand="block" 
                      color="danger"
                      fill="outline"
                      onClick={() => handleStatusUpdate('cancelled')}
                      disabled={updating}
                      style={{ marginTop: '8px' }}
                    >
                      <IonIcon icon={closeCircle} slot="start" />
                      Cancel Trip
                    </IonButton>
                  )}
                </div>
              </>
            )}
          </IonContent>
        </IonModal>

        {/* Vehicle Selection Modal */}
        <IonModal isOpen={showVehicleModal} onDidDismiss={() => setShowVehicleModal(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Select Vehicle</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowVehicleModal(false)}>
                  <IonIcon icon={close} />
                </IonButton>
              </IonButtons>
            </IonToolbar>
            <IonToolbar>
              <IonSearchbar
                value={vehicleSearchText}
                onIonInput={(e) => setVehicleSearchText(e.detail.value || '')}
                placeholder="Search by make, model, or license plate"
                debounce={300}
              />
            </IonToolbar>
          </IonHeader>
          <IonContent>
            {updating && (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
                <IonSpinner />
              </div>
            )}
            {!updating && filteredVehicles.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#666' }}>
                <IonIcon icon={car} style={{ fontSize: '64px', color: '#ccc' }} />
                <h3>No vehicles found</h3>
                <p>{vehicleSearchText ? 'Try a different search term' : 'No available vehicles'}</p>
              </div>
            )}
            {!updating && filteredVehicles.length > 0 && (
              <IonList>
                {filteredVehicles.map((vehicle) => (
                  <IonItem 
                    key={vehicle.id} 
                    button 
                    onClick={() => handleVehicleSelect(vehicle.id)}
                    detail={true}
                  >
                    <IonIcon icon={car} slot="start" color="primary" />
                    <IonLabel>
                      <h2>{vehicle.make} {vehicle.model}</h2>
                      <p>License Plate: {vehicle.licensePlate}</p>
                      {vehicle.name && <p>Name: {vehicle.name}</p>}
                    </IonLabel>
                  </IonItem>
                ))}
              </IonList>
            )}
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default Activity;
