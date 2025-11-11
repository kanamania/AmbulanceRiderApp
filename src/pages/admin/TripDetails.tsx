import React, { useEffect, useState } from 'react';
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

  const loadTripDetails = async () => {
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
  };

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const openInMaps = (latitude: number, longitude: number) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    window.open(url, '_blank');
  };

  useEffect(() => {
    loadTripDetails();
  }, [id]);

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
                        <p>{trip.fromAddress}</p>
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
                        <p>{trip.toAddress}</p>
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
                    
                    {trip.emergencyType && (
                      <IonItem>
                        <IonIcon icon={alertCircle} slot="start" color="warning" />
                        <IonLabel>
                          <h3>Emergency Type</h3>
                          <p>{trip.emergencyType}</p>
                        </IonLabel>
                      </IonItem>
                    )}
                    
                    {trip.notes && (
                      <IonItem>
                        <IonLabel>
                          <h3>Notes</h3>
                          <p>{trip.notes}</p>
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
                    
                    <IonItem>
                      <IonIcon icon={time} slot="start" color="medium" />
                      <IonLabel>
                        <h3>Last Updated</h3>
                        <p>{formatDate(trip.updatedAt)}</p>
                      </IonLabel>
                    </IonItem>
                  </IonList>
                </IonCardContent>
              </IonCard>

              {/* Dynamic Attributes */}
              {trip.attributeValues && Object.keys(trip.attributeValues).length > 0 && (
                <IonCard>
                  <IonCardHeader>
                    <IonCardTitle>Additional Information</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <IonList lines="none">
                      {Object.entries(trip.attributeValues).map(([key, value]) => (
                        <IonItem key={key}>
                          <IonLabel>
                            <h3>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h3>
                            <p>{String(value)}</p>
                          </IonLabel>
                        </IonItem>
                      ))}
                    </IonList>
                  </IonCardContent>
                </IonCard>
              )}

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
                          <p>{trip.vehicle.make} {trip.vehicle.model}</p>
                          <p>{trip.vehicle.licensePlate}</p>
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

              {/* User Information */}
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>
                    <IonIcon icon={person} className="section-icon" />
                    User Information
                  </IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <IonList lines="none">
                    <IonItem>
                      <IonLabel>
                        <h3>User ID</h3>
                        <p>{trip.userId}</p>
                      </IonLabel>
                    </IonItem>
                  </IonList>
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
