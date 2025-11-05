import React, { useEffect, useState } from 'react';
import { 
  IonContent, 
  IonButton,
  IonIcon, 
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
  IonAvatar,
  IonText
} from '@ionic/react';
import { add, car, create, trash } from 'ionicons/icons';
import {AdminLayout} from '../../layouts/AdminLayout';
import { Vehicle, VehicleStatus } from '../../types/vehicle.types';
import { vehicleService } from '../../services';
import './AdminPages.css';

const VehicleManagement: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [presentAlert] = useIonAlert();
  const [presentToast] = useIonToast();
  const itemsPerPage = 10;

  const loadVehicles = async (pageNum: number = 1, refresh: boolean = false) => {
    try {
      setLoading(true);
      const response = await vehicleService.getVehicles({
        page: pageNum,
        limit: itemsPerPage,
        search: searchTerm,
        status: statusFilter !== 'all' ? (statusFilter as VehicleStatus) : undefined
      });
      
      const vehicleData = Array.isArray(response) ? response : (response.data || []);
      
      if (refresh) {
        setVehicles(vehicleData);
      } else {
        setVehicles(prev => [...prev, ...vehicleData]);
      }
      
      setHasMore(vehicleData.length === itemsPerPage);
      setPage(pageNum);
    } catch (error) {
      console.error('Error loading vehicles:', error);
      presentToast({
        message: 'Failed to load vehicles. Please try again.',
        duration: 3000,
        color: 'danger'
      });
      // Set empty array on error to prevent undefined issues
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = (event: CustomEvent) => {
    loadVehicles(1, true).then(() => {
      event.detail.complete();
    });
  };

  const loadMore = (event: CustomEvent) => {
    loadVehicles(page + 1).then(() => {
      (event.target as HTMLIonInfiniteScrollElement).complete();
    });
  };

  const handleSearch = (e: CustomEvent) => {
    const term = e.detail.value || '';
    setSearchTerm(term);
    
    if (term === '') {
      setFilteredVehicles(vehicles);
    } else {
      const filtered = vehicles.filter(vehicle => 
        vehicle.licensePlate.toLowerCase().includes(term.toLowerCase()) ||
        vehicle.make?.toLowerCase().includes(term.toLowerCase()) ||
        vehicle.model?.toLowerCase().includes(term.toLowerCase()) ||
        vehicle.vehicleType?.name.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredVehicles(filtered);
    }
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    loadVehicles(1, true);
  };

  const confirmDelete = (vehicleId: number) => {
    presentAlert({
      header: 'Confirm Delete',
      message: 'Are you sure you want to delete this vehicle? This action cannot be undone.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          handler: () => deleteVehicle(vehicleId)
        }
      ]
    });
  };

  const deleteVehicle = async (vehicleId: number) => {
    try {
      await vehicleService.deleteVehicle(vehicleId);
      setVehicles(vehicles.filter(vehicle => vehicle.id !== vehicleId));
      presentToast({
        message: 'Vehicle deleted successfully',
        duration: 3000,
        color: 'success'
      });
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      presentToast({
        message: 'Failed to delete vehicle. Please try again.',
        duration: 3000,
        color: 'danger'
      });
    }
  };

  const getStatusBadge = (status: VehicleStatus) => {
    switch (status) {
      case 'available':
        return <IonBadge color="success">Available</IonBadge>;
      case 'in_use':
        return <IonBadge color="warning">In Use</IonBadge>;
      case 'maintenance':
        return <IonBadge color="danger">Maintenance</IonBadge>;
      case 'out_of_service':
        return <IonBadge color="medium">Out of Service</IonBadge>;
      default:
        return <IonBadge>{status}</IonBadge>;
    }
  };

  useEffect(() => {
    loadVehicles(1, true);
  }, [statusFilter]);

  useEffect(() => {
    setFilteredVehicles(vehicles);
  }, [vehicles]);

  return (
    <AdminLayout title="Vehicle Management">
      <IonContent className="ion-padding">
        <div className="page-header">
          <div>
            <h1>Vehicle Management</h1>
            <p>Manage your fleet of vehicles and their status</p>
          </div>
          <IonButton 
            routerLink="/admin/vehicles/new" 
            color="primary"
          >
            <IonIcon slot="start" icon={add} />
            Add Vehicle
          </IonButton>
        </div>

        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>

        <div className="search-filter-container">
          <IonSearchbar 
            placeholder="Search vehicles..." 
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
              <IonLabel>All Vehicles</IonLabel>
              <IonBadge color={statusFilter === 'all' ? 'primary' : 'medium'}>{vehicles.length}</IonBadge>
            </IonChip>
            
            <IonChip 
              outline={statusFilter !== 'available'}
              color={statusFilter === 'available' ? 'success' : 'medium'}
              onClick={() => handleStatusFilter('available')}
            >
              <IonLabel>Available</IonLabel>
              <IonBadge color={statusFilter === 'available' ? 'success' : 'medium'}>
                {vehicles.filter(v => v.status === 'available').length}
              </IonBadge>
            </IonChip>
            
            <IonChip 
              outline={statusFilter !== 'in_use'}
              color={statusFilter === 'in_use' ? 'warning' : 'medium'}
              onClick={() => handleStatusFilter('in_use')}
            >
              <IonLabel>In Use</IonLabel>
              <IonBadge color={statusFilter === 'in_use' ? 'warning' : 'medium'}>
                {vehicles.filter(v => v.status === 'in_use').length}
              </IonBadge>
            </IonChip>
            
            <IonChip 
              outline={statusFilter !== 'maintenance'}
              color={statusFilter === 'maintenance' ? 'danger' : 'medium'}
              onClick={() => handleStatusFilter('maintenance')}
            >
              <IonLabel>Maintenance</IonLabel>
              <IonBadge color={statusFilter === 'maintenance' ? 'danger' : 'medium'}>
                {vehicles.filter(v => v.status === 'maintenance').length}
              </IonBadge>
            </IonChip>
          </div>
        </div>

        {loading && vehicles.length === 0 ? (
          <div className="loading-container">
            <IonSpinner name="crescent" />
            <p>Loading vehicles...</p>
          </div>
        ) : (
          <div className="vehicle-list">
            {filteredVehicles.length === 0 ? (
              <div className="empty-state">
                <IonIcon icon={car} className="empty-icon" />
                <h3>No vehicles found</h3>
                <p>Try adjusting your search or add a new vehicle</p>
                <IonButton 
                  routerLink="/admin/vehicles/new" 
                  color="primary"
                  className="ion-margin-top"
                >
                  <IonIcon icon={add} slot="start" />
                  Add Vehicle
                </IonButton>
              </div>
            ) : (
              <>
                {filteredVehicles.map(vehicle => (
                  <IonItem 
                    key={vehicle.id} 
                    className="vehicle-item"
                    button
                    detail
                    routerLink={`/admin/vehicles/${vehicle.id}`}
                  >
                    <IonAvatar slot="start" className="vehicle-avatar">
                      {vehicle.imageUrl ? (
                        <img src={vehicle.imageUrl} alt={vehicle.licensePlate} />
                      ) : (
                        <IonIcon icon={car} className="vehicle-icon" />
                      )}
                    </IonAvatar>
                    
                    <div className="vehicle-info">
                      <h3>
                        {vehicle.make} {vehicle.model} 
                        <span className="license-plate">{vehicle.licensePlate}</span>
                      </h3>
                      <p className="vehicle-type">
                        {vehicle.vehicleType?.name || 'N/A'}
                        {vehicle.year && ` • ${vehicle.year}`}
                      </p>
                      <div className="vehicle-status">
                        {getStatusBadge(vehicle.status)}
                        {vehicle.inServiceSince && (
                          <IonText color="medium" className="in-service-since">
                            In service since {new Date(vehicle.inServiceSince).getFullYear()}
                          </IonText>
                        )}
                      </div>
                    </div>
                    
                    <div className="vehicle-actions" slot="end" onClick={e => e.stopPropagation()}>
                      <IonButton 
                        fill="clear" 
                        color="primary" 
                        routerLink={`/admin/vehicles/${vehicle.id}`}
                      >
                        <IonIcon icon={create} />
                      </IonButton>
                      <IonButton 
                        fill="clear" 
                        color="danger" 
                        onClick={() => confirmDelete(vehicle.id)}
                      >
                        <IonIcon icon={trash} />
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
                    loadingText="Loading more vehicles..."
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

export default VehicleManagement;
