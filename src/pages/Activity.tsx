import React, { useEffect, useState } from 'react';
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
  useIonToast,
  useIonAlert,
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
  close,
  navigate as navigateIcon,
} from 'ionicons/icons';
import { useTranslation } from 'react-i18next';
import AppHeader from '../components/AppHeader';
import { useAuth } from '../contexts/AuthContext';
import { tripService, vehicleService, notificationService } from '../services';
import { Trip, Vehicle } from '../types';
import './Activity.css';

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

  const isAdminOrDispatcher = hasRole('Admin', 'Dispatcher');

  const loadTrips = async () => {
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
  };

  const loadVehicles = async () => {
    try {
      const vehiclesData = await vehicleService.getVehicles({ status: 'available' });
      setVehicles(vehiclesData.data);
    } catch (error) {
      console.error('Error loading vehicles:', error);
    }
  };

  const filterTrips = (tripsData: Trip[], status: string) => {
    if (status === 'all') {
      setFilteredTrips(tripsData);
    } else {
      setFilteredTrips(tripsData.filter((trip) => trip.status === status));
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
    setSelectedTrip(trip);
    setSelectedVehicleId(trip.vehicleId);
    setShowTripModal(true);
  };

  const handleApproveTrip = async () => {
    if (!selectedTrip) return;

    if (!selectedVehicleId) {
      presentToast({
        message: t('trip.vehicleRequired'),
        duration: 3000,
        color: 'warning',
      });
      return;
    }

    presentAlert({
      header: t('trip.approved'),
      message: t('messages.confirm'),
      buttons: [
        {
          text: t('common.cancel'),
          role: 'cancel',
        },
        {
          text: t('common.confirm'),
          handler: async () => {
            try {
              setUpdating(true);
              await tripService.updateTripStatus({
                id: selectedTrip.id,
                status: 1, // Approved
                vehicleId: selectedVehicleId,
              });

              // Send notification via backend (will broadcast via SignalR)
              try {
                await notificationService.notifyTripStatusChanged(selectedTrip.id, 'accepted');
              } catch (notifError) {
                console.error('Failed to send notification:', notifError);
                // Don't fail the trip update if notification fails
              }

              presentToast({
                message: t('messages.updateSuccess'),
                duration: 3000,
                color: 'success',
              });

              setShowTripModal(false);
              await loadTrips();
            } catch (error) {
              console.error('Error approving trip:', error);
              presentToast({
                message: t('messages.updateError'),
                duration: 3000,
                color: 'danger',
              });
            } finally {
              setUpdating(false);
            }
          },
        },
      ],
    });
  };

  const handleRejectTrip = async () => {
    if (!selectedTrip) return;

    presentAlert({
      header: t('trip.rejected'),
      message: t('messages.confirm'),
      inputs: [
        {
          name: 'reason',
          type: 'textarea',
          placeholder: t('trip.notes'),
        },
      ],
      buttons: [
        {
          text: t('common.cancel'),
          role: 'cancel',
        },
        {
          text: t('common.confirm'),
          handler: async (data) => {
            try {
              setUpdating(true);
              await tripService.updateTripStatus({
                id: selectedTrip.id,
                status: 5, // Cancelled/Rejected
                notes: data.reason,
              });

              // Send notification via backend (will broadcast via SignalR)
              try {
                await notificationService.notifyTripStatusChanged(selectedTrip.id, 'cancelled');
              } catch (notifError) {
                console.error('Failed to send notification:', notifError);
                // Don't fail the trip update if notification fails
              }

              presentToast({
                message: t('messages.updateSuccess'),
                duration: 3000,
                color: 'success',
              });

              setShowTripModal(false);
              await loadTrips();
            } catch (error) {
              console.error('Error rejecting trip:', error);
              presentToast({
                message: t('messages.updateError'),
                duration: 3000,
                color: 'danger',
              });
            } finally {
              setUpdating(false);
            }
          },
        },
      ],
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <IonBadge color="warning">{t('trip.pending')}</IonBadge>;
      case 'accepted':
        return <IonBadge color="primary">{t('trip.approved')}</IonBadge>;
      case 'in_progress':
        return <IonBadge color="tertiary">{t('trip.inProgress')}</IonBadge>;
      case 'completed':
        return <IonBadge color="success">{t('trip.completed')}</IonBadge>;
      case 'cancelled':
        return <IonBadge color="danger">{t('trip.cancelled')}</IonBadge>;
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
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const openInMaps = (latitude: number, longitude: number) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    window.open(url, '_blank');
  };

  useEffect(() => {
    loadTrips();
    if (isAdminOrDispatcher) {
      loadVehicles();
    }
  }, []);

  const tripCounts = {
    all: trips.length,
    pending: trips.filter((t) => t.status === 'pending').length,
    accepted: trips.filter((t) => t.status === 'accepted').length,
    in_progress: trips.filter((t) => t.status === 'in_progress').length,
    completed: trips.filter((t) => t.status === 'completed').length,
    cancelled: trips.filter((t) => t.status === 'cancelled').length,
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <IonIcon icon={getStatusIcon(trip.status)} color={trip.status === 'completed' ? 'success' : trip.status === 'cancelled' ? 'danger' : 'primary'} />
                      <strong>Trip #{trip.id}</strong>
                    </div>
                    {getStatusBadge(trip.status)}
                  </div>

                  <IonItem lines="none">
                    <IonIcon icon={location} slot="start" color="primary" />
                    <IonLabel>
                      <p style={{ fontSize: '12px', color: '#666' }}>{t('trip.from')}</p>
                      <h3 style={{ fontSize: '14px', margin: '4px 0' }}>{trip.fromAddress}</h3>
                    </IonLabel>
                  </IonItem>

                  <IonItem lines="none">
                    <IonIcon icon={navigateIcon} slot="start" color="danger" />
                    <IonLabel>
                      <p style={{ fontSize: '12px', color: '#666' }}>{t('trip.to')}</p>
                      <h3 style={{ fontSize: '14px', margin: '4px 0' }}>{trip.toAddress}</h3>
                    </IonLabel>
                  </IonItem>

                  {trip.name && (
                    <IonItem lines="none">
                      <IonIcon icon={person} slot="start" color="tertiary" />
                      <IonLabel>
                        <p style={{ fontSize: '12px', color: '#666' }}>Patient</p>
                        <h3 style={{ fontSize: '14px', margin: '4px 0' }}>{trip.name}</h3>
                      </IonLabel>
                    </IonItem>
                  )}

                  {trip.vehicle && (
                    <IonItem lines="none">
                      <IonIcon icon={car} slot="start" color="success" />
                      <IonLabel>
                        <p style={{ fontSize: '12px', color: '#666' }}>{t('trip.vehicle')}</p>
                        <h3 style={{ fontSize: '14px', margin: '4px 0' }}>
                          {trip.vehicle.make} {trip.vehicle.model} - {trip.vehicle.licensePlate}
                        </h3>
                      </IonLabel>
                    </IonItem>
                  )}

                  <IonItem lines="none">
                    <IonIcon icon={time} slot="start" color="medium" />
                    <IonLabel>
                      <p style={{ fontSize: '12px', color: '#666' }}>{t('user.createdAt')}</p>
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
          <IonContent className="ion-padding">
            {selectedTrip && (
              <>
                <IonCard>
                  <IonCardHeader>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <IonCardTitle>Trip #{selectedTrip.id}</IonCardTitle>
                      {getStatusBadge(selectedTrip.status)}
                    </div>
                  </IonCardHeader>
                  <IonCardContent>
                    <IonList lines="none">
                      <IonItem>
                        <IonIcon icon={location} slot="start" color="primary" />
                        <IonLabel>
                          <h3>{t('trip.fromLocation')}</h3>
                          <p>{selectedTrip.fromAddress}</p>
                          <IonButton size="small" fill="clear" onClick={() => openInMaps(selectedTrip.fromLatitude, selectedTrip.fromLongitude)}>
                            <IonIcon icon={navigateIcon} slot="start" />
                            Open in Maps
                          </IonButton>
                        </IonLabel>
                      </IonItem>

                      <IonItem>
                        <IonIcon icon={navigateIcon} slot="start" color="danger" />
                        <IonLabel>
                          <h3>{t('trip.toLocation')}</h3>
                          <p>{selectedTrip.toAddress}</p>
                          <IonButton size="small" fill="clear" onClick={() => openInMaps(selectedTrip.toLatitude, selectedTrip.toLongitude)}>
                            <IonIcon icon={navigateIcon} slot="start" />
                            Open in Maps
                          </IonButton>
                        </IonLabel>
                      </IonItem>

                      {selectedTrip.name && (
                        <IonItem>
                          <IonIcon icon={person} slot="start" color="tertiary" />
                          <IonLabel>
                            <h3>Trip Name</h3>
                            <p>{selectedTrip.name}</p>
                          </IonLabel>
                        </IonItem>
                      )}

                      {selectedTrip.emergencyType && (
                        <IonItem>
                          <IonIcon icon={alertCircle} slot="start" color="warning" />
                          <IonLabel>
                            <h3>Emergency Type</h3>
                            <p>{selectedTrip.emergencyType}</p>
                          </IonLabel>
                        </IonItem>
                      )}

                      {selectedTrip.notes && (
                        <IonItem>
                          <IonLabel>
                            <h3>{t('trip.notes')}</h3>
                            <p>{selectedTrip.notes}</p>
                          </IonLabel>
                        </IonItem>
                      )}

                      <IonItem>
                        <IonIcon icon={time} slot="start" color="medium" />
                        <IonLabel>
                          <h3>{t('user.createdAt')}</h3>
                          <p>{formatDate(selectedTrip.createdAt)}</p>
                        </IonLabel>
                      </IonItem>

                      <IonItem>
                        <IonIcon icon={time} slot="start" color="medium" />
                        <IonLabel>
                          <h3>{t('user.updatedAt')}</h3>
                          <p>{formatDate(selectedTrip.updatedAt)}</p>
                        </IonLabel>
                      </IonItem>

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
                              {selectedTrip.vehicle.make} {selectedTrip.vehicle.model}
                            </p>
                            <p>{selectedTrip.vehicle.licensePlate}</p>
                          </IonLabel>
                        </IonItem>
                      )}
                    </IonList>
                  </IonCardContent>
                </IonCard>

                {/* Action Buttons for Admin/Dispatcher */}
                {isAdminOrDispatcher && selectedTrip.status === 'pending' && (
                  <div style={{ marginTop: '16px' }}>
                    <IonButton expand="block" color="success" onClick={handleApproveTrip} disabled={updating}>
                      <IonIcon icon={checkmarkCircle} slot="start" />
                      {t('trip.approved')}
                    </IonButton>
                    <IonButton expand="block" color="danger" fill="outline" onClick={handleRejectTrip} disabled={updating}>
                      <IonIcon icon={closeCircle} slot="start" />
                      {t('trip.rejected')}
                    </IonButton>
                  </div>
                )}
              </>
            )}
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default Activity;
