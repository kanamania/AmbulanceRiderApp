import React, { useState, useEffect } from 'react';
import { 
  IonContent, 
  IonPage, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonButtons, 
  IonButton, 
  IonIcon, 
  useIonToast,
  useIonLoading,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonToggle,
  IonList,
  IonTextarea,
  IonAvatar,
  IonChip,
  IonSpinner,
  IonText,
  IonDatetime,
  IonGrid,
  IonRow,
  IonCol
} from '@ionic/react';
import { 
  arrowBack, 
  save, 
  trash, 
  car, 
  checkmarkCircle,
  alertCircle,
  camera,
  closeCircle,
  calendar,
  speedometer,
  barcode,
  construct,
  documentText,
  informationCircle,
  add
} from 'ionicons/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Vehicle, VehicleStatus, VehicleType } from '../../types/vehicle.types';
import { vehicleService } from '../../services';
import AdminLayout from '../../layouts/AdminLayout';
import './AdminPages.css';

// Validation schema
const vehicleSchema = yup.object().shape({
  licensePlate: yup.string().required('License plate is required'),
  make: yup.string().required('Make is required'),
  model: yup.string().required('Model is required'),
  year: yup
    .number()
    .typeError('Year must be a number')
    .min(1900, 'Year must be after 1900')
    .max(new Date().getFullYear() + 1, 'Year cannot be in the future')
    .required('Year is required'),
  color: yup.string().optional(),
  vehicleTypeId: yup.number().required('Vehicle type is required'),
  status: yup.string().required('Status is required'),
  capacity: yup.number().min(1, 'Capacity must be at least 1').required('Capacity is required'),
  mileage: yup.number().min(0, 'Mileage cannot be negative').optional(),
  lastMaintenanceDate: yup.string().nullable().optional(),
  nextMaintenanceDate: yup.string().nullable().optional(),
  notes: yup.string().optional(),
  isActive: yup.boolean().default(true)
});

interface VehicleFormData {
  licensePlate: string;
  make: string;
  model: string;
  year: number;
  color?: string;
  vehicleTypeId: number;
  status: string;
  capacity: number;
  mileage?: number;
  lastMaintenanceDate?: string | null;
  nextMaintenanceDate?: string | null;
  notes?: string;
  isActive: boolean;
}

const VehicleEdit: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [presentToast] = useIonToast();
  const [presentLoading, dismissLoading] = useIonLoading();
  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [vehicle, setVehicle] = useState<Partial<Vehicle> | null>(null);
  
  const { 
    control, 
    handleSubmit, 
    formState: { errors }, 
    reset,
    setValue,
    watch
  } = useForm<VehicleFormData>({
    resolver: yupResolver(vehicleSchema) as any,
    defaultValues: {
      licensePlate: '',
      make: '',
      model: '',
      year: new Date().getFullYear(),
      color: '',
      vehicleTypeId: undefined,
      status: 'available',
      capacity: 4,
      mileage: 0,
      lastMaintenanceDate: null,
      nextMaintenanceDate: null,
      notes: '',
      isActive: true
    }
  });

  const status = watch('status');

  // Load vehicle data if in edit mode
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Load vehicle types
        const types = await vehicleService.getVehicleTypes();
        setVehicleTypes(types);
        
        if (isEdit && id) {
          // Load vehicle data
          const vehicleData = await vehicleService.getVehicle(parseInt(id!));
          setVehicle(vehicleData);
          
          // Set form values
          reset({
            licensePlate: vehicleData.licensePlate,
            make: vehicleData.make,
            model: vehicleData.model,
            year: vehicleData.year,
            color: vehicleData.color || '',
            vehicleTypeId: vehicleData.vehicleTypeId,
            status: vehicleData.status,
            capacity: vehicleData.capacity || 4,
            mileage: vehicleData.mileage || 0,
            lastMaintenanceDate: vehicleData.lastMaintenanceDate || null,
            nextMaintenanceDate: vehicleData.nextMaintenanceDate || null,
            notes: vehicleData.notes || '',
            isActive: vehicleData.isActive !== false
          });
          
          // Set image preview if available
          if (vehicleData.imageUrl) {
            setImagePreview(vehicleData.imageUrl);
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
        presentToast({
          message: 'Failed to load vehicle data',
          duration: 3000,
          color: 'danger'
        });
        navigate('/admin/vehicles');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [id, isEdit, navigate, presentToast, reset]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      // TODO: Upload image to server
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    // TODO: Remove image from server
  };

  const onSubmit = async (data: VehicleFormData) => {
    try {
      setIsSubmitting(true);
      
      const vehicleData = {
        ...data,
        status: data.status as any,
        // Add any additional fields or transformations here
      };
      
      if (isEdit && id) {
        // Update existing vehicle
        await vehicleService.updateVehicle(parseInt(id!), vehicleData as any);
        presentToast({
          message: 'Vehicle updated successfully',
          duration: 3000,
          color: 'success',
          icon: checkmarkCircle
        });
      } else {
        // Create new vehicle
        await vehicleService.createVehicle(vehicleData as any);
        presentToast({
          message: 'Vehicle created successfully',
          duration: 3000,
          color: 'success',
          icon: checkmarkCircle
        });
      }
      
      navigate('/admin/vehicles');
    } catch (error: any) {
      console.error('Error saving vehicle:', error);
      presentToast({
        message: error.response?.data?.message || 'Failed to save vehicle',
        duration: 3000,
        color: 'danger',
        icon: alertCircle
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!isEdit || !id) return;
    
    try {
      await presentLoading('Deleting vehicle...');
      await vehicleService.deleteVehicle(parseInt(id!));
      
      presentToast({
        message: 'Vehicle deleted successfully',
        duration: 3000,
        color: 'success',
        icon: checkmarkCircle
      });
      
      navigate('/admin/vehicles');
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      presentToast({
        message: 'Failed to delete vehicle',
        duration: 3000,
        color: 'danger',
        icon: alertCircle
      });
    } finally {
      await dismissLoading();
    }
  };

  if (isLoading) {
    return (
      <AdminLayout title={isEdit ? 'Edit Vehicle' : 'Add Vehicle'}>
        <div className="loading-container">
          <IonSpinner name="crescent" />
          <p>Loading vehicle data...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={isEdit ? 'Edit Vehicle' : 'Add Vehicle'}>
      <IonContent className="ion-padding">
        <form onSubmit={handleSubmit(onSubmit)} className="form-container">
          <IonList lines="full" className="ion-margin-bottom">
            {/* Vehicle Image */}
            <div className="ion-text-center ion-margin-vertical">
              <div className="image-upload-container">
                <IonAvatar className="vehicle-image-preview">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Vehicle" />
                  ) : (
                    <IonIcon icon={car} className="placeholder-icon" />
                  )}
                  
                  <div className="image-actions">
                    <IonButton 
                      fill="clear" 
                      color="light" 
                      className="upload-button"
                      onClick={() => document.getElementById('vehicle-image-upload')?.click()}
                    >
                      <IonIcon icon={camera} slot="icon-only" />
                    </IonButton>
                    
                    {imagePreview && (
                      <IonButton 
                        fill="clear" 
                        color="light" 
                        className="remove-button"
                        onClick={removeImage}
                      >
                        <IonIcon icon={closeCircle} slot="icon-only" />
                      </IonButton>
                    )}
                  </div>
                  
                  <input 
                    type="file" 
                    id="vehicle-image-upload" 
                    accept="image/*" 
                    style={{ display: 'none' }}
                    onChange={handleImageUpload}
                  />
                </IonAvatar>
              </div>
            </div>

            {/* Basic Information */}
            <h3 className="section-title">
              <IonIcon icon={informationCircle} className="section-icon" />
              Basic Information
            </h3>
            
            <IonGrid>
              <IonRow>
                <IonCol size="12" sizeSm="6">
                  <IonItem className={`form-group ${errors.licensePlate ? 'ion-invalid' : ''}`}>
                    <IonLabel position="floating">License Plate <span className="required">*</span></IonLabel>
                    <IonIcon icon={barcode} slot="start" className="input-icon" />
                    <Controller
                      name="licensePlate"
                      control={control}
                      render={({ field }: any) => (
                        <IonInput 
                          value={field.value} 
                          onIonChange={e => field.onChange(e.detail.value)}
                          type="text"
                          placeholder="ABC-1234"
                        />
                      )}
                    />
                    {errors.licensePlate && (
                      <IonText color="danger" className="ion-padding-start">
                        <small>{errors.licensePlate.message}</small>
                      </IonText>
                    )}
                  </IonItem>
                </IonCol>
                
                <IonCol size="12" sizeSm="6">
                  <IonItem className={`form-group ${errors.vehicleTypeId ? 'ion-invalid' : ''}`}>
                    <IonLabel>Vehicle Type <span className="required">*</span></IonLabel>
                    <Controller
                      name="vehicleTypeId"
                      control={control}
                      render={({ field: { onChange, value } }: any) => (
                        <IonSelect 
                          value={value}
                          onIonChange={e => onChange(e.detail.value)}
                          interface="action-sheet"
                        >
                          {vehicleTypes.map(type => (
                            <IonSelectOption key={type.id} value={type.id}>
                              {type.name}
                            </IonSelectOption>
                          ))}
                        </IonSelect>
                      )}
                    />
                    {errors.vehicleTypeId && (
                      <IonText color="danger" className="ion-padding-start">
                        <small>{errors.vehicleTypeId.message}</small>
                      </IonText>
                    )}
                  </IonItem>
                </IonCol>
              </IonRow>
              
              <IonRow>
                <IonCol size="12" sizeSm="6">
                  <IonItem className={`form-group ${errors.make ? 'ion-invalid' : ''}`}>
                    <IonLabel position="floating">Make <span className="required">*</span></IonLabel>
                    <Controller
                      name="make"
                      control={control}
                      render={({ field }: any) => (
                        <IonInput 
                          value={field.value} 
                          onIonChange={e => field.onChange(e.detail.value)}
                          type="text"
                        />
                      )}
                    />
                    {errors.make && (
                      <IonText color="danger" className="ion-padding-start">
                        <small>{errors.make.message}</small>
                      </IonText>
                    )}
                  </IonItem>
                </IonCol>
                
                <IonCol size="12" sizeSm="6">
                  <IonItem className={`form-group ${errors.model ? 'ion-invalid' : ''}`}>
                    <IonLabel position="floating">Model <span className="required">*</span></IonLabel>
                    <Controller
                      name="model"
                      control={control}
                      render={({ field }: any) => (
                        <IonInput 
                          value={field.value} 
                          onIonChange={e => field.onChange(e.detail.value)}
                          type="text"
                        />
                      )}
                    />
                    {errors.model && (
                      <IonText color="danger" className="ion-padding-start">
                        <small>{errors.model.message}</small>
                      </IonText>
                    )}
                  </IonItem>
                </IonCol>
              </IonRow>
              
              <IonRow>
                <IonCol size="12" sizeSm="6">
                  <IonItem className={`form-group ${errors.year ? 'ion-invalid' : ''}`}>
                    <IonLabel position="floating">Year <span className="required">*</span></IonLabel>
                    <IonIcon icon={calendar} slot="start" className="input-icon" />
                    <Controller
                      name="year"
                      control={control}
                      render={({ field }: any) => (
                        <IonInput 
                          value={field.value} 
                          onIonChange={e => field.onChange(parseInt(e.detail.value || '0'))}
                          type="number"
                        />
                      )}
                    />
                    {errors.year && (
                      <IonText color="danger" className="ion-padding-start">
                        <small>{errors.year.message}</small>
                      </IonText>
                    )}
                  </IonItem>
                </IonCol>
                
                <IonCol size="12" sizeSm="6">
                  <IonItem className={`form-group ${errors.color ? 'ion-invalid' : ''}`}>
                    <IonLabel position="floating">Color</IonLabel>
                    <div 
                      slot="start" 
                      className="color-preview"
                      style={{ backgroundColor: watch('color') || '#cccccc' }}
                    />
                    <Controller
                      name="color"
                      control={control}
                      render={({ field }: any) => (
                        <IonInput 
                          value={field.value} 
                          onIonChange={e => field.onChange(e.detail.value)}
                          type="text"
                        />
                      )}
                    />
                  </IonItem>
                </IonCol>
              </IonRow>
            </IonGrid>

            {/* Status & Capacity */}
            <h3 className="section-title">
              <IonIcon icon={speedometer} className="section-icon" />
              Status & Capacity
            </h3>
            
            <IonGrid>
              <IonRow>
                <IonCol size="12" sizeSm="6">
                  <IonItem className={`form-group ${errors.status ? 'ion-invalid' : ''}`}>
                    <IonLabel>Status <span className="required">*</span></IonLabel>
                    <Controller
                      name="status"
                      control={control}
                      render={({ field: { onChange, value } }: { field: { onChange: (val: any) => void, value: any } }) => (
                        <IonSelect 
                          value={value}
                          onIonChange={e => onChange(e.detail.value)}
                          interface="action-sheet"
                        >
                          <IonSelectOption value="available">Available</IonSelectOption>
                          <IonSelectOption value="in_use">In Use</IonSelectOption>
                          <IonSelectOption value="maintenance">Maintenance</IonSelectOption>
                          <IonSelectOption value="out_of_service">Out of Service</IonSelectOption>
                        </IonSelect>
                      )}
                    />
                  </IonItem>
                </IonCol>
                
                <IonCol size="12" sizeSm="6">
                  <IonItem className={`form-group ${errors.capacity ? 'ion-invalid' : ''}`}>
                    <IonLabel position="floating">Passenger Capacity <span className="required">*</span></IonLabel>
                    <Controller
                      name="capacity"
                      control={control}
                      render={({ field }: any) => (
                        <IonInput 
                          value={field.value} 
                          onIonChange={e => field.onChange(parseInt(e.detail.value || '0'))}
                          type="number"
                          min="1"
                        />
                      )}
                    />
                    {errors.capacity && (
                      <IonText color="danger" className="ion-padding-start">
                        <small>{errors.capacity.message}</small>
                      </IonText>
                    )}
                  </IonItem>
                </IonCol>
              </IonRow>
              
              <IonRow>
                <IonCol size="12" sizeSm="6">
                  <IonItem className={`form-group ${errors.mileage ? 'ion-invalid' : ''}`}>
                    <IonLabel position="floating">Current Mileage</IonLabel>
                    <IonIcon icon={speedometer} slot="start" className="input-icon" />
                    <Controller
                      name="mileage"
                      control={control}
                      render={({ field }: any) => (
                        <IonInput 
                          value={field.value} 
                          onIonChange={e => field.onChange(parseInt(e.detail.value || '0'))}
                          type="number"
                          min="0"
                        />
                      )}
                    />
                    <IonText slot="end" color="medium">mi</IonText>
                  </IonItem>
                </IonCol>
                
                <IonCol size="12" sizeSm="6">
                  <IonItem className="form-group">
                    <IonLabel>Active</IonLabel>
                    <Controller
                      name="isActive"
                      control={control}
                      render={({ field: { value, onChange } }: any) => (
                        <IonToggle 
                          checked={value} 
                          onIonChange={e => onChange(e.detail.checked)}
                          slot="end"
                        />
                      )}
                    />
                  </IonItem>
                </IonCol>
              </IonRow>
            </IonGrid>

            {/* Maintenance Information */}
            <h3 className="section-title">
              <IonIcon icon={construct} className="section-icon" />
              Maintenance
            </h3>
            
            <IonGrid>
              <IonRow>
                <IonCol size="12" sizeSm="6">
                  <IonItem className="form-group">
                    <IonLabel>Last Maintenance</IonLabel>
                    <IonIcon icon={calendar} slot="start" className="input-icon" />
                    <Controller
                      name="lastMaintenanceDate"
                      control={control}
                      render={({ field: { value, onChange } }: any) => (
                        <IonDatetime
                          presentation="date"
                          value={value || undefined}
                          onIonChange={e => onChange(e.detail.value?.toString() || null)}
                        />
                      )}
                    />
                  </IonItem>
                </IonCol>
                
                <IonCol size="12" sizeSm="6">
                  <IonItem className="form-group">
                    <IonLabel>Next Maintenance Due</IonLabel>
                    <IonIcon icon={calendar} slot="start" className="input-icon" />
                    <Controller
                      name="nextMaintenanceDate"
                      control={control}
                      render={({ field: { value, onChange } }: any) => (
                        <IonDatetime
                          presentation="date"
                          value={value || undefined}
                          onIonChange={e => onChange(e.detail.value?.toString() || null)}
                        />
                      )}
                    />
                  </IonItem>
                </IonCol>
              </IonRow>
              
              <IonRow>
                <IonCol>
                  <IonItem className="form-group">
                    <IonLabel position="stacked">Notes</IonLabel>
                    <IonIcon icon={documentText} slot="start" className="input-icon" />
                    <Controller
                      name="notes"
                      control={control}
                      render={({ field }: any) => (
                        <IonTextarea 
                          value={field.value} 
                          onIonChange={e => field.onChange(e.detail.value)}
                          rows={4}
                          placeholder="Any additional notes about this vehicle..."
                        />
                      )}
                    />
                  </IonItem>
                </IonCol>
              </IonRow>
            </IonGrid>
          </IonList>

          {/* Form Actions */}
          <div className="form-actions">
            <IonButton 
              type="button" 
              fill="clear" 
              color="medium"
              onClick={() => navigate(-1)}
              disabled={isSubmitting}
            >
              Cancel
            </IonButton>
            
            {isEdit && (
              <IonButton 
                type="button" 
                fill="clear" 
                color="danger"
                onClick={handleDelete}
                disabled={isSubmitting}
              >
                <IonIcon icon={trash} slot="start" />
                Delete
              </IonButton>
            )}
            
            <IonButton 
              type="submit" 
              color="primary" 
              disabled={isSubmitting}
            >
              <IonIcon icon={isEdit ? save : add} slot="start" />
              {isEdit ? 'Update Vehicle' : 'Add Vehicle'}
              {isSubmitting && <IonSpinner name="dots" className="ion-margin-start" />}
            </IonButton>
          </div>
        </form>
      </IonContent>
    </AdminLayout>
  );
};

export default VehicleEdit;
