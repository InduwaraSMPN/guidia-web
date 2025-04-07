import { useState, useEffect } from 'react';
import { PageHeading } from '../../components/PageHeading';
import { toast } from '../../components/ui/sonner';
import { SearchBar } from '../../components/SearchBar';
import { AdminsTable } from '../../components/admin/AdminsTable';
import { AdminFormModal } from '../../components/admin/AdminFormModal';
import StudentsTable from '../../components/admin/StudentsTable';
import CounselorsTable from '../../components/admin/CounselorsTable';
import CompaniesTable from '../../components/admin/CompaniesTable';

interface AdminUsersPageProps {
  userType: 'admin' | 'student' | 'counselor' | 'company';
}

interface User {
  userID: string;
  email: string;
  username: string;
  roleID: number;
  status: string;
}

const getEndpoint = (userType: string): string => {
  // Ensure we're using plural form consistently as expected by the backend
  switch (userType) {
    case 'admin': return 'admins';
    case 'student': return 'students';
    case 'counselor': return 'counselors';
    case 'company': return 'companies';
    default:
      throw new Error(`Invalid user type: ${userType}`);
  }
};

export function AdminUsersPage({ userType }: AdminUsersPageProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const filtered = users.filter(user => 
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [users, searchQuery]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      const endpoint = getEndpoint(userType);
      // Updated endpoint URL structure
      const response = await fetch(`/api/admin/users/${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch users: ${response.status} - ${errorText}`);
      }
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load users';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [userType]);

  const handleAddUser = () => {
    setSelectedUser(null);
    setModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  const handleDeleteUser = async (userId: string) => {
    // Show confirmation toast
    toast('Are you sure you want to delete this user?', {
      position: 'top-center',
      action: {
        label: 'Delete',
        onClick: async () => {
          try {
            const token = localStorage.getItem('token');
            if (!token) {
              throw new Error('No authentication token found');
            }

            const endpoint = getEndpoint(userType);
            console.log(`Deleting user: ${userId} from ${endpoint}`);
            const response = await fetch(`/api/admin/users/${endpoint}/${userId}`, {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
            });
            
            if (!response.ok) {
              const data = await response.json();
              throw new Error(data.error || data.message || `Failed to delete ${userType}`);
            }
            
            setUsers(users.filter(user => user.userID !== userId));
            toast.success(`${userType.charAt(0).toUpperCase() + userType.slice(1)} deleted successfully`);
          } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to delete user';
            setError(errorMessage);
            toast.error(errorMessage);
          }
        },
      },
      cancel: {
        label: 'Cancel',
        onClick: () => {},
        className: 'bg-transparent text-white hover:bg-transparent'
      },
    });
  };

  const handleStatusChange = async (userId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      const endpoint = getEndpoint(userType);
      const response = await fetch(`/api/admin/users/${userType}/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update user status');
      }

      const updatedUser = await response.json();
      setUsers(users.map(user => 
        user.userID === userId ? updatedUser : user
      ));
      toast.success('User status updated successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update user status';
      setError(errorMessage);
      fetchUsers();
      toast.error(errorMessage);
    }
  };

  const handleSubmit = async (formData: { email: string; username: string; password?: string }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      const endpoint = getEndpoint(userType);

      if (selectedUser) {
        // Update existing user
        const response = await fetch(`/api/admin/users/${endpoint}/${selectedUser.userID}`, {
          method: 'PATCH',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to update user');
        }
        
        const updatedUser = await response.json();
        setUsers(users.map(user => 
          user.userID === selectedUser.userID ? updatedUser : user
        ));
        toast.success(`${userType.charAt(0).toUpperCase() + userType.slice(1)} user updated successfully`);
      } else {
        // Create new user
        const response = await fetch(`/api/admin/users/${endpoint}`, {  // Using plural endpoint here
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...formData,
            roleId: getRoleId(userType)  // Add roleId to the request
          }),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to create user');
        }
        
        const newUser = await response.json();
        setUsers([...users, newUser]);
        toast.success(`${userType.charAt(0).toUpperCase() + userType.slice(1)} user created successfully`);
      }
      
      setModalOpen(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save user';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  // Add this helper function to get the correct roleId
  const getRoleId = (userType: string): number => {
    switch (userType) {
      case 'admin': return 1;
      case 'student': return 2;
      case 'counselor': return 3;
      case 'company': return 4;
      default: throw new Error(`Invalid user type: ${userType}`);
    }
  };

  return (
    <div className="p-6 max-w-[1216px] mx-auto">
      <PageHeading title={`${userType.charAt(0).toUpperCase() + userType.slice(1)} Users`} />
      <div className="">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={`Search`}
          className="max-w-lg mb-6"
        />
        {(() => {
          if (userType === 'student') {
            return (
              <StudentsTable
                users={filteredUsers}
                roleID={2}
                onAdd={handleAddUser}
                onEdit={handleEditUser}
                onDelete={handleDeleteUser}
                onStatusChange={handleStatusChange}
                isLoading={isLoading}
              />
            );
          } else if (userType === 'counselor') {
            return (
              <CounselorsTable
                users={filteredUsers}
                roleID={3}
                onAdd={handleAddUser}
                onEdit={handleEditUser}
                onDelete={handleDeleteUser}
                onStatusChange={handleStatusChange}
                isLoading={isLoading}
              />
            );
          } else if (userType === 'company') {
            return (
              <CompaniesTable
                users={filteredUsers}
                roleID={4}
                onAdd={handleAddUser}
                onEdit={handleEditUser}
                onDelete={handleDeleteUser}
                onStatusChange={handleStatusChange}
                isLoading={isLoading}
              />
            );
          } else {
            return (
              <AdminsTable
                users={filteredUsers}
                roleID={1} // Admin roleID
                onAdd={handleAddUser}
                onEdit={handleEditUser}
                onDelete={handleDeleteUser}
                onStatusChange={handleStatusChange}
                isLoading={isLoading}
              />
            );
          }
        })()}
      </div>
      <AdminFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={selectedUser || undefined}
        title={selectedUser ? `Edit ${userType.charAt(0).toUpperCase() + userType.slice(1)} User` : `Add ${userType.charAt(0).toUpperCase() + userType.slice(1)} User`}
      />
    </div>
  );
}
