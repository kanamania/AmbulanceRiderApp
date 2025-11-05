import React, { useEffect, useState } from 'react';
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
  IonTextarea,
  IonToggle,
  IonList,
  IonBadge,
} from '@ionic/react';
import { add, list as listIcon, create, trash, close, save } from 'ionicons/icons';
import { useTranslation } from 'react-i18next';
import {AdminLayout} from '../../layouts/AdminLayout';
import { TripType } from '../../types';
import { tripTypeService } from '../../services';
import './AdminPages.css';

const TripTypeManagement: React.FC = () => {
  const { t } = useTranslation();
  const [tripTypes, setTripTypes] = useState<TripType[]>([]);
  const [filteredTripTypes, setFilteredTripTypes] = useState<TripType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTripType, setEditingTripType] = useState<TripType | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3880ff',
    icon: 'car',
    isActive: true,
    displayOrder: 0,
  });
  const [saving, setSaving] = useState(false);
  const [presentAlert] = useIonAlert();
  const [presentToast] = useIonToast();

  const loadTripTypes = async () => {
    try {
      setLoading(true);
      const response = await tripTypeService.getAllTripTypes();
      setTripTypes(response);
      setFilteredTripTypes(response);
    } catch (error) {
      console.error('Error loading trip types:', error);
      presentToast({
        message: t('messages.loadError'),
        duration: 3000,
        color: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async (event: CustomEvent) => {
    await loadTripTypes();
    event.detail.complete();
  };

  const handleSearch = (e: CustomEvent) => {
    const term = e.detail.value || '';
    setSearchTerm(term);

    if (term === '') {
      setFilteredTripTypes(tripTypes);
    } else {
      const filtered = tripTypes.filter((tripType) =>
        tripType.name.toLowerCase().includes(term.toLowerCase()) ||
        tripType.description?.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredTripTypes(filtered);
    }
  };

  const handleAdd = () => {
    setEditingTripType(null);
    setFormData({
      name: '',
      description: '',
      color: '#3880ff',
      icon: 'car',
      isActive: true,
      displayOrder: tripTypes.length,
    });
    setShowModal(true);
  };

  const handleEdit = (tripType: TripType) => {
    setEditingTripType(tripType);
    setFormData({
      name: tripType.name,
      description: tripType.description || '',
      color: tripType.color || '#3880ff',
      icon: tripType.icon || 'car',
      isActive: tripType.isActive,
      displayOrder: tripType.displayOrder,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      presentToast({
        message: t('validation.required'),
        duration: 3000,
        color: 'warning',
      });
      return;
    }

    try {
      setSaving(true);

      if (editingTripType) {
        await tripTypeService.updateTripType(editingTripType.id, formData);
        presentToast({
          message: t('messages.updateSuccess'),
          duration: 3000,
          color: 'success',
        });
      } else {
        await tripTypeService.createTripType(formData);
        presentToast({
          message: t('messages.saveSuccess'),
          duration: 3000,
          color: 'success',
        });
      }

      setShowModal(false);
      await loadTripTypes();
    } catch (error) {
      console.error('Error saving trip type:', error);
      presentToast({
        message: t('messages.saveError'),
        duration: 3000,
        color: 'danger',
      });
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (tripType: TripType) => {
    presentAlert({
      header: t('messages.confirmDelete'),
      message: `Delete trip type: ${tripType.name}?`,
      buttons: [
        {
          text: t('common.cancel'),
          role: 'cancel',
        },
        {
          text: t('common.delete'),
          handler: () => deleteTripType(tripType.id),
        },
      ],
    });
  };

  const deleteTripType = async (tripTypeId: number) => {
    try {
      await tripTypeService.deleteTripType(tripTypeId);
      setTripTypes(tripTypes.filter((tt) => tt.id !== tripTypeId));
      presentToast({
        message: t('messages.deleteSuccess'),
        duration: 3000,
        color: 'success',
      });
    } catch (error) {
      console.error('Error deleting trip type:', error);
      presentToast({
        message: t('messages.deleteError'),
        duration: 3000,
        color: 'danger',
      });
    }
  };

  useEffect(() => {
    loadTripTypes();
  }, []);

  return (
    <AdminLayout title={t('settings.tripTypes')}>
      <IonContent className="ion-padding">
        <div className="page-header">
          <div>
            <h1>{t('settings.tripTypes')}</h1>
            <p>{t('settings.tripTypesDescription')}</p>
          </div>
          <IonButton color="primary" onClick={handleAdd}>
            <IonIcon slot="start" icon={add} />
            {t('tripType.addTripType')}
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
          <div className="trip-type-list">
            {filteredTripTypes.length === 0 ? (
              <div className="empty-state">
                <IonIcon icon={listIcon} className="empty-icon" />
                <h3>{t('tripType.noTripTypes')}</h3>
                <p>{t('tripType.noTripTypesMessage')}</p>
                <IonButton color="primary" onClick={handleAdd} className="ion-margin-top">
                  <IonIcon icon={add} slot="start" />
                  {t('tripType.addTripType')}
                </IonButton>
              </div>
            ) : (
              <>
                {filteredTripTypes.map((tripType) => (
                  <IonCard key={tripType.id}>
                    <IonCardContent>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                          <div
                            style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '8px',
                              backgroundColor: tripType.color || '#3880ff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <IonIcon icon={listIcon} style={{ fontSize: '24px', color: 'white' }} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <h3 style={{ margin: 0 }}>{tripType.name}</h3>
                              <IonBadge color={tripType.isActive ? 'success' : 'medium'}>
                                {tripType.isActive ? t('user.active') : t('user.inactive')}
                              </IonBadge>
                            </div>
                            {tripType.description && (
                              <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#666' }}>
                                {tripType.description}
                              </p>
                            )}
                            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#999' }}>
                              {tripType.attributes?.length || 0} {t('tripType.attributes')} • {t('tripType.displayOrder')}: {tripType.displayOrder}
                            </p>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <IonButton fill="clear" color="primary" onClick={() => handleEdit(tripType)}>
                            <IonIcon icon={create} />
                          </IonButton>
                          <IonButton fill="clear" color="danger" onClick={() => confirmDelete(tripType)}>
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
                {editingTripType ? t('tripType.editTripType') : t('tripType.addTripType')}
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
                <IonLabel position="stacked">{t('tripType.tripTypeName')} *</IonLabel>
                <IonInput
                  value={formData.name}
                  onIonInput={(e) => setFormData({ ...formData, name: e.detail.value || '' })}
                  placeholder={t('tripType.tripTypeName')}
                />
              </IonItem>

              <IonItem>
                <IonLabel position="stacked">{t('tripType.tripTypeDescription')}</IonLabel>
                <IonTextarea
                  value={formData.description}
                  onIonInput={(e) => setFormData({ ...formData, description: e.detail.value || '' })}
                  placeholder={t('tripType.tripTypeDescription')}
                  rows={3}
                />
              </IonItem>

              <IonItem>
                <IonLabel position="stacked">{t('tripType.tripTypeColor')}</IonLabel>
                <input 
                  type="color" 
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value || '#3880ff' })}
                  style={{
                    width: '100%',
                    height: '40px',
                    padding: '4px',
                    borderRadius: '4px',
                    border: '1px solid var(--ion-color-medium)'
                  }}
                />
              </IonItem>

              <IonItem>
                <IonLabel position="stacked">{t('tripType.displayOrder')}</IonLabel>
                <IonInput
                  type="number"
                  value={formData.displayOrder}
                  onIonInput={(e) => setFormData({ ...formData, displayOrder: parseInt(e.detail.value || '0') })}
                />
              </IonItem>

              <IonItem>
                <IonLabel>{t('user.active')}</IonLabel>
                <IonToggle
                  checked={formData.isActive}
                  onIonChange={(e) => setFormData({ ...formData, isActive: e.detail.checked })}
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

export default TripTypeManagement;
