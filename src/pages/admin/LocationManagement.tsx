import React, { useEffect, useState, useCallback } from 'react';
import {
  IonContent,
  IonButton,
  IonIcon,
  IonSearchbar,
  IonRefresher,
  IonRefresherContent,
  IonSpinner,
  useIonAlert,
  useIonToast,
  IonItem,
  IonLabel,
  IonCard,
  IonCardContent,
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonInput,
  IonList,
} from '@ionic/react';
import { add, location as locationIcon, create, trash, close, save } from 'ionicons/icons';
import { useTranslation } from 'react-i18next';
import {AdminLayout} from '../../layouts/AdminLayout';
import { LocationPlace } from '../../types';
import { locationService } from '../../services';
import './AdminPages.css';

const LocationManagement: React.FC = () => {
  const { t } = useTranslation();
  const [locations, setLocations] = useState<LocationPlace[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<LocationPlace[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState<LocationPlace | null>(null);
  const [locationName, setLocationName] = useState('');
  const [longitude, setLongitude] = useState('');
  const [latitude, setLatitude] = useState('');
  const [saving, setSaving] = useState(false);
  const [presentAlert] = useIonAlert();
  const [presentToast] = useIonToast();

  const loadLocations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await locationService.getAllLocations();
      setLocations(response);
      setFilteredLocations(response);
    } catch (error) {
      console.error('Error loading locations:', error);
      presentToast({
        message: t('messages.loadError'),
        duration: 3000,
        color: 'danger',
      });
    } finally {
      setLoading(false);
    }
  }, [t, presentToast]);

  const handleRefresh = async (event: CustomEvent) => {
    await loadLocations();
    event.detail.complete();
  };

  const handleSearch = (e: CustomEvent) => {
    const term = e.detail.value || '';
    setSearchTerm(term);

    if (term === '') {
      setFilteredLocations(locations);
    } else {
      const filtered = locations.filter((location) =>
        location.name.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredLocations(filtered);
    }
  };

  const handleAdd = () => {
    setEditingLocation(null);
    setLocationName('');
    setLongitude('');
    setLatitude('');
    setShowModal(true);
  };

  const handleEdit = (location: LocationPlace) => {
    setEditingLocation(location);
    setLocationName(location.name);
    setLongitude(location.longitude.toString());
    setLatitude(location.latitude.toString());
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!locationName.trim()) {
      presentToast({
        message: t('validation.required'),
        duration: 3000,
        color: 'warning',
      });
      return;
    }

    if (!longitude.trim() || !latitude.trim()) {
      presentToast({
        message: 'Longitude and latitude are required',
        duration: 3000,
        color: 'warning',
      });
      return;
    }

    const lng = parseFloat(longitude);
    const lat = parseFloat(latitude);

    if (isNaN(lng) || isNaN(lat)) {
      presentToast({
        message: 'Invalid longitude or latitude values',
        duration: 3000,
        color: 'warning',
      });
      return;
    }

    try {
      setSaving(true);

      if (editingLocation) {
        await locationService.updateLocation(editingLocation.id, { 
          name: locationName,
          longitude: lng,
          latitude: lat
        });
        presentToast({
          message: t('location.locationUpdated'),
          duration: 3000,
          color: 'success',
        });
      } else {
        await locationService.createLocation({ 
          name: locationName,
          longitude: lng,
          latitude: lat
        });
        presentToast({
          message: t('location.locationCreated'),
          duration: 3000,
          color: 'success',
        });
      }

      setShowModal(false);
      await loadLocations();
    } catch (error) {
      console.error('Error saving location:', error);
      presentToast({
        message: t('messages.saveError'),
        duration: 3000,
        color: 'danger',
      });
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (location: LocationPlace) => {
    presentAlert({
      header: t('messages.confirmDelete'),
      message: `${t('location.deleteLocation')}: ${location.name}?`,
      buttons: [
        {
          text: t('common.cancel'),
          role: 'cancel',
        },
        {
          text: t('common.delete'),
          handler: () => deleteLocation(location.id),
        },
      ],
    });
  };

  const deleteLocation = async (locationId: number) => {
    try {
      await locationService.deleteLocation(locationId);
      setLocations(locations.filter((loc) => loc.id !== locationId));
      presentToast({
        message: t('location.locationDeleted'),
        duration: 3000,
        color: 'success',
      });
    } catch (error) {
      console.error('Error deleting location:', error);
      presentToast({
        message: t('messages.deleteError'),
        duration: 3000,
        color: 'danger',
      });
    }
  };

  useEffect(() => {
    loadLocations();
  }, [loadLocations]);

  return (
    <AdminLayout title={t('location.locations')}>
      <IonContent className="ion-padding">
        <div className="page-header">
          <div>
            <h1>{t('location.locations')}</h1>
            <p>{t('settings.locationsDescription')}</p>
          </div>
          <IonButton color="primary" onClick={handleAdd}>
            <IonIcon slot="start" icon={add} />
            {t('location.addLocation')}
          </IonButton>
        </div>

        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>

        <IonSearchbar
          placeholder={t('common.search')}
          onIonChange={handleSearch}
          value={searchTerm}
          animated
          debounce={300}
          className="search-bar"
        />

        {loading ? (
          <div className="loading-container">
            <IonSpinner name="crescent" />
            <p>{t('common.loading')}</p>
          </div>
        ) : (
          <div className="location-list">
            {filteredLocations.length === 0 ? (
              <div className="empty-state">
                <IonIcon icon={locationIcon} className="empty-icon" />
                <h3>{t('location.noLocations')}</h3>
                <p>{t('location.noLocationsMessage')}</p>
                <IonButton color="primary" onClick={handleAdd} className="ion-margin-top">
                  <IonIcon icon={add} slot="start" />
                  {t('location.addLocation')}
                </IonButton>
              </div>
            ) : (
              <>
                {filteredLocations.map((location) => (
                  <IonCard key={location.id}>
                    <IonCardContent>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                          <IonIcon icon={locationIcon} style={{ fontSize: '24px' }} color="primary" />
                          <div>
                            <h3 style={{ margin: 0 }}>{location.name}</h3>
                            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#666' }}>
                              {t('user.createdAt')}: {new Date(location.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <IonButton fill="clear" color="primary" onClick={() => handleEdit(location)}>
                            <IonIcon icon={create} />
                          </IonButton>
                          <IonButton fill="clear" color="danger" onClick={() => confirmDelete(location)}>
                            <IonIcon icon={trash} />
                          </IonButton>
                        </div>
                      </div>
                    </IonCardContent>
                  </IonCard>
                ))}
              </>
            )}
          </div>
        )}

        {/* Add/Edit Modal */}
        <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>
                {editingLocation ? t('location.editLocation') : t('location.addLocation')}
              </IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowModal(false)}>
                  <IonIcon icon={close} />
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            <IonList>
              <IonItem>
                <IonLabel position="stacked">{t('location.locationName')} *</IonLabel>
                <IonInput
                  value={locationName}
                  onIonInput={(e) => setLocationName(e.detail.value || '')}
                  placeholder={t('location.locationName')}
                />
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">Longitude *</IonLabel>
                <IonInput
                  value={longitude}
                  onIonInput={(e) => setLongitude(e.detail.value || '')}
                  placeholder="Enter longitude"
                  type="number"
                />
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">Latitude *</IonLabel>
                <IonInput
                  value={latitude}
                  onIonInput={(e) => setLatitude(e.detail.value || '')}
                  placeholder="Enter latitude"
                  type="number"
                />
              </IonItem>
            </IonList>

            <IonButton
              expand="block"
              onClick={handleSave}
              disabled={saving}
              style={{ marginTop: '24px' }}
            >
              <IonIcon icon={save} slot="start" />
              {saving ? t('common.loading') : t('common.save')}
            </IonButton>
          </IonContent>
        </IonModal>
      </IonContent>
    </AdminLayout>
  );
};

export default LocationManagement;
