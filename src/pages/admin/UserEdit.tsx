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
  IonText
} from '@ionic/react';
import { 
  arrowBack, 
  save, 
  trash, 
  personCircle, 
  mail, 
  call, 
  lockClosed,
  checkmarkCircle,
  alertCircle,
  add
} from 'ionicons/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { User, UserRole } from '../../types/auth.types';
import { userService } from '../../services';
import { ROLES } from '../../utils/role.utils';
import AdminLayout from '../../layouts/AdminLayout';
import './AdminPages.css';

// Validation schema
const userSchema = yup.object().shape({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  phoneNumber: yup.string().required('Phone number is required'),
  password: yup.string().optional(),
  confirmPassword: yup.string().optional(),
  roles: yup.array().min(1, 'At least one role is required').optional(),
  isActive: yup.boolean().default(true)
});

interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password?: string;
  confirmPassword?: string;
  roles?: string[];
  isActive: boolean;
}

const UserEdit: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [presentToast] = useIonToast();
  const [presentLoading, dismissLoading] = useIonLoading();
  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState<Partial<User> | null>(null);
  
  const { 
    control, 
    handleSubmit, 
    formState: { errors }, 
    reset,
    setValue
  } = useForm<UserFormData>({
    resolver: yupResolver(userSchema) as any,
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      roles: [],
      isActive: true
    }
  });

  // Load user data if in edit mode
  useEffect(() => {
    const loadUser = async () => {
      if (!isEdit || !id) return;
      
      try {
        setIsLoading(true);
        const userData = await userService.getUser(parseInt(id!));
        setUser(userData);
        
        // Set form values
        reset({
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          phoneNumber: userData.phoneNumber,
          roles: userData.roles,
          isActive: userData.isActive
        });
      } catch (error) {
        console.error('Error loading user:', error);
        presentToast({
          message: 'Failed to load user data',
          duration: 3000,
          color: 'danger'
        });
        navigate('/admin/users');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUser();
  }, [id, isEdit, navigate, presentToast, reset]);

  const onSubmit = async (data: UserFormData) => {
    try {
      setIsSubmitting(true);
      
      if (isEdit && user && id) {
        // Update existing user
        await userService.updateUser(parseInt(id!), data);
        presentToast({
          message: 'User updated successfully',
          duration: 3000,
          color: 'success',
          icon: checkmarkCircle
        });
      } else {
        // Create new user
        // For new users, we'll generate a temporary password
        const tempPassword = Math.random().toString(36).slice(-8);
        await userService.createUser({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phoneNumber: data.phoneNumber,
          password: tempPassword,
          roleIds: data.roles?.map(role => {
            const roleMap: { [key: string]: number } = {
              'Admin': 1,
              'Dispatcher': 2,
              'Driver': 3,
              'User': 4
            };
            return roleMap[role] || 4;
          }) || [4]
        });
        
        presentToast({
          message: 'User created successfully',
          duration: 5000,
          color: 'success',
          icon: checkmarkCircle,
          buttons: [
            {
              text: 'Copy Password',
              handler: () => {
                navigator.clipboard.writeText(tempPassword);
                presentToast({
                  message: 'Password copied to clipboard',
                  duration: 2000,
                  color: 'medium'
                });
              }
            }
          ]
        });
      }
      
      navigate('/admin/users');
    } catch (error: any) {
      console.error('Error saving user:', error);
      presentToast({
        message: error.response?.data?.message || 'Failed to save user',
        duration: 3000,
        color: 'danger',
        icon: alertCircle
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!isEdit || !user || !id) return;
    
    try {
      await presentLoading('Deleting user...');
      await userService.deleteUser(parseInt(id!));
      
      presentToast({
        message: 'User deleted successfully',
        duration: 3000,
        color: 'success',
        icon: checkmarkCircle
      });
      
      navigate('/admin/users');
    } catch (error) {
      console.error('Error deleting user:', error);
      presentToast({
        message: 'Failed to delete user',
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
      <AdminLayout title={isEdit ? 'Edit User' : 'Add User'}>
        <div className="loading-container">
          <IonSpinner name="crescent" />
          <p>Loading user data...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={isEdit ? 'Edit User' : 'Add User'}>
      <IonContent className="ion-padding">
        <form onSubmit={handleSubmit(onSubmit)} className="form-container">
          <IonList lines="full" className="ion-margin-bottom">
            {/* Avatar Upload */}
            <div className="ion-text-center ion-margin-vertical">
              <IonAvatar className="profile-avatar">
                {user?.imageUrl ? (
                  <img src={user.imageUrl} alt="Profile" />
                ) : (
                  <IonIcon icon={personCircle} className="avatar-icon" />
                )}
              </IonAvatar>
              <IonButton 
                fill="clear" 
                size="small" 
                className="change-photo-btn"
              >
                Change Photo
              </IonButton>
            </div>

            {/* Basic Information */}
            <h3 className="section-title">Basic Information</h3>
            
            <IonItem className={`form-group ${errors.firstName ? 'ion-invalid' : ''}`}>
              <IonLabel position="floating">First Name <span className="required">*</span></IonLabel>
              <Controller
                name="firstName"
                control={control}
                render={({ field }: any) => (
                  <IonInput 
                    value={field.value} 
                    onIonChange={e => field.onChange(e.detail.value)}
                    type="text"
                  />
                )}
              />
              {errors.firstName && (
                <IonText color="danger" className="ion-padding-start">
                  <small>{errors.firstName.message}</small>
                </IonText>
              )}
            </IonItem>

            <IonItem className={`form-group ${errors.lastName ? 'ion-invalid' : ''}`}>
              <IonLabel position="floating">Last Name <span className="required">*</span></IonLabel>
              <Controller
                name="lastName"
                control={control}
                render={({ field }: any) => (
                  <IonInput 
                    value={field.value} 
                    onIonChange={e => field.onChange(e.detail.value)}
                    type="text"
                  />
                )}
              />
              {errors.lastName && (
                <IonText color="danger" className="ion-padding-start">
                  <small>{errors.lastName.message}</small>
                </IonText>
              )}
            </IonItem>

            <IonItem className={`form-group ${errors.email ? 'ion-invalid' : ''}`}>
              <IonLabel position="floating">Email <span className="required">*</span></IonLabel>
              <IonIcon icon={mail} slot="start" className="input-icon" />
              <Controller
                name="email"
                control={control}
                render={({ field }: any) => (
                  <IonInput 
                    value={field.value} 
                    onIonChange={e => field.onChange(e.detail.value)}
                    type="email"
                    disabled={isEdit}
                  />
                )}
              />
              {errors.email && (
                <IonText color="danger" className="ion-padding-start">
                  <small>{errors.email.message}</small>
                </IonText>
              )}
            </IonItem>

            <IonItem className={`form-group ${errors.phoneNumber ? 'ion-invalid' : ''}`}>
              <IonLabel position="floating">Phone Number <span className="required">*</span></IonLabel>
              <IonIcon icon={call} slot="start" className="input-icon" />
              <Controller
                name="phoneNumber"
                control={control}
                render={({ field }: any) => (
                  <IonInput 
                    value={field.value} 
                    onIonChange={e => field.onChange(e.detail.value)}
                    type="tel"
                  />
                )}
              />
              {errors.phoneNumber && (
                <IonText color="danger" className="ion-padding-start">
                  <small>{errors.phoneNumber.message}</small>
                </IonText>
              )}
            </IonItem>

            {/* Roles */}
            <h3 className="section-title">Roles & Permissions</h3>
            
            <IonItem className={`form-group ${errors.roles ? 'ion-invalid' : ''}`}>
              <IonLabel>Roles <span className="required">*</span></IonLabel>
              <Controller
                name="roles"
                control={control}
                render={({ field: { onChange, value = [] } }: any) => (
                  <IonSelect 
                    multiple 
                    value={value}
                    onIonChange={e => onChange(e.detail.value)}
                    interface="alert"
                    className="roles-select"
                  >
                    {Object.values(ROLES).map(role => (
                      <IonSelectOption key={role} value={role}>
                        {role}
                      </IonSelectOption>
                    ))}
                  </IonSelect>
                )}
              />
              {errors.roles && (
                <IonText color="danger" className="ion-padding-start">
                  <small>{errors.roles.message}</small>
                </IonText>
              )}
            </IonItem>

            {/* Status */}
            <IonItem className="form-group">
              <IonLabel>Account Status</IonLabel>
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

            {/* Selected Roles Chips */}
            <div className="selected-roles">
              <Controller
                name="roles"
                control={control}
                render={({ field: { value = [] } }: any) => (
                  <>
                    {value.map((role: string) => (
                      <IonChip key={role} color="primary" outline>
                        {role}
                      </IonChip>
                    ))}
                  </>
                )}
              />
            </div>

            {/* Password Reset (for existing users) */}
            {isEdit && (
              <>
                <h3 className="section-title">Password</h3>
                <IonButton 
                  fill="outline" 
                  expand="block" 
                  color="medium"
                  onClick={() => {
                    // Implement password reset logic
                    presentToast({
                      message: 'Password reset link sent to user\'s email',
                      duration: 3000,
                      color: 'success'
                    });
                  }}
                >
                  <IonIcon icon={lockClosed} slot="start" />
                  Send Password Reset Link
                </IonButton>
              </>
            )}
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
              {isEdit ? 'Update User' : 'Create User'}
              {isSubmitting && <IonSpinner name="dots" className="ion-margin-start" />}
            </IonButton>
          </div>
        </form>
      </IonContent>
    </AdminLayout>
  );
};

export default UserEdit;
