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
  useIonToast
} from '@ionic/react';
import { add, create, trash } from 'ionicons/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AdminLayout from '../../layouts/AdminLayout';
import { User } from '../../types/auth.types';
import { userService } from '../../services';
import { ROLES } from '../../utils/role.utils';
import './AdminPages.css';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [presentAlert] = useIonAlert();
  const [presentToast] = useIonToast();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const itemsPerPage = 10;

  const loadUsers = async (pageNum: number = 1, refresh: boolean = false) => {
    try {
      setLoading(true);
      const response = await userService.getUsers({
        page: pageNum,
        limit: itemsPerPage,
        search: searchTerm
      });
      
      if (refresh) {
        setUsers(response.data);
      } else {
        setUsers(prev => [...prev, ...response.data]);
      }
      
      setHasMore(response.data.length === itemsPerPage);
      setPage(pageNum);
    } catch (error) {
      console.error('Error loading users:', error);
      presentToast({
        message: 'Failed to load users. Please try again.',
        duration: 3000,
        color: 'danger'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = (event: CustomEvent) => {
    loadUsers(1, true).then(() => {
      event.detail.complete();
    });
  };

  const loadMore = (event: CustomEvent) => {
    loadUsers(page + 1).then(() => {
      (event.target as HTMLIonInfiniteScrollElement).complete();
    });
  };

  const handleSearch = (e: CustomEvent) => {
    const term = e.detail.value || '';
    setSearchTerm(term);
    
    if (term === '') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user => 
        user.firstName.toLowerCase().includes(term.toLowerCase()) ||
        user.lastName.toLowerCase().includes(term.toLowerCase()) ||
        user.email.toLowerCase().includes(term.toLowerCase()) ||
        user.phoneNumber.includes(term)
      );
      setFilteredUsers(filtered);
    }
  };

  const confirmDelete = (userId: number) => {
    if (currentUser?.id === userId) {
      presentToast({
        message: 'You cannot delete your own account',
        duration: 3000,
        color: 'warning'
      });
      return;
    }

    presentAlert({
      header: 'Confirm Delete',
      message: 'Are you sure you want to delete this user? This action cannot be undone.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          handler: () => deleteUser(userId)
        }
      ]
    });
  };

  const deleteUser = async (userId: number) => {
    try {
      await userService.deleteUser(userId);
      setUsers(users.filter(user => user.id !== userId));
      presentToast({
        message: 'User deleted successfully',
        duration: 3000,
        color: 'success'
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      presentToast({
        message: 'Failed to delete user. Please try again.',
        duration: 3000,
        color: 'danger'
      });
    }
  };

  const getRoleBadge = (roles: string[]) => {
    if (roles.includes(ROLES.ADMIN)) {
      return <span className="status-badge status-admin">Admin</span>;
    } else if (roles.includes(ROLES.DISPATCHER)) {
      return <span className="status-badge status-dispatcher">Dispatcher</span>;
    } else if (roles.includes(ROLES.DRIVER)) {
      return <span className="status-badge status-driver">Driver</span>;
    }
    return <span className="status-badge status-user">User</span>;
  };

  useEffect(() => {
    loadUsers(1, true);
  }, []);

  useEffect(() => {
    setFilteredUsers(users);
  }, [users]);

  return (
    <AdminLayout title="User Management">
      <IonContent className="ion-padding">
        <div className="page-header">
          <h1>User Management</h1>
          <IonButton 
            routerLink="/admin/users/new" 
            color="primary"
          >
            <IonIcon slot="start" icon={add} />
            Add User
          </IonButton>
        </div>

        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>

        <div className="search-container">
          <IonSearchbar 
            placeholder="Search users..." 
            onIonChange={handleSearch}
            value={searchTerm}
            animated
            debounce={300}
          />
        </div>

        {loading && users.length === 0 ? (
          <div className="loading-container">
            <IonSpinner name="crescent" />
            <p>Loading users...</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.id}>
                    <td>
                      <div className="user-info">
                        <div className="user-avatar">
                          {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                        </div>
                        <div>
                          {user.firstName} {user.lastName}
                          {currentUser?.id === user.id && (
                            <div className="current-user-badge">You</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>{user.phoneNumber || 'N/A'}</td>
                    <td>{getRoleBadge(user.roles)}</td>
                    <td>
                      <span className={`status-badge ${user.isActive ? 'status-active' : 'status-inactive'}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <IonButton 
                          fill="clear" 
                          color="primary" 
                          size="small"
                          routerLink={`/admin/users/${user.id}`}
                        >
                          <IonIcon icon={create} />
                        </IonButton>
                        <IonButton 
                          fill="clear" 
                          color="danger" 
                          size="small"
                          onClick={() => confirmDelete(user.id)}
                          disabled={currentUser?.id === user.id}
                        >
                          <IonIcon icon={trash} />
                        </IonButton>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <IonInfiniteScroll
          onIonInfinite={loadMore}
          threshold="100px"
          disabled={!hasMore || loading}
        >
          <IonInfiniteScrollContent
            loadingText="Loading more users..."
            loadingSpinner="bubbles"
          />
        </IonInfiniteScroll>
      </IonContent>
    </AdminLayout>
  );
};

export default UserManagement;
