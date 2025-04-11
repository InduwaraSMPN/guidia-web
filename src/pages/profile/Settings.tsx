import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChangePassword } from '@/components/ChangePassword';
import { useAuth } from '@/contexts/AuthContext';
import { createAuthHeaders } from '@/lib/csrfToken';
import { toast } from "sonner";

export function Settings() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load user data
    if (user) {
      // Fetch user details from the API based on user type
      fetchUserDetails();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchUserDetails = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      let endpoint = '';

      // Determine the endpoint based on user type
      switch (user.userType) {
        case 'Student':
          endpoint = `/api/students/${user.userID}`;
          break;
        case 'Counselor':
          endpoint = `/api/counselors/${user.userID}`;
          break;
        case 'Company':
          endpoint = `/api/companies/profile/${user.userID}`;
          break;
        default:
          setError('Unsupported user type');
          return;
      }

      // Create headers with auth token
      const headers = createAuthHeaders();

      // Fetch user details
      const response = await fetch(endpoint, {
        headers
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user details');
      }

      const data = await response.json();

      // Set form data based on user type
      let username = '';
      let email = '';

      if (user.userType === 'Student') {
        username = data.studentName || '';
        email = data.studentEmail || data.email || user.email || '';
      } else if (user.userType === 'Counselor') {
        username = data.counselorName || '';
        email = data.counselorEmail || data.email || user.email || '';
      } else if (user.userType === 'Company') {
        username = data.companyName || '';
        email = data.companyEmail || data.email || user.email || '';
      }

      console.log('Received data:', data);
      console.log('Setting form data:', { username, email });

      setFormData({
        username,
        email,
      });
    } catch (error) {
      console.error('Error fetching user details:', error);
      setError('Failed to load user details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Show loading toast
    const loadingToast = toast.loading('Updating profile...', {
      duration: Infinity // Keep showing until we get a response
    });

    try {
      const headers = await createAuthHeaders();
      let endpoint = '/api/users/profile';
      let payload = {};

      // For company users, use the companies endpoint and structure
      if (user?.userType === 'Company') {
        endpoint = `/api/companies/profile/${user.userID}`;
        payload = {
          companyName: formData.username,
          companyEmail: formData.email
        };
      } else {
        payload = {
          username: formData.username,
          email: formData.email
        };
      }

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to update profile');
      }

      // Dismiss loading toast and show success
      toast.dismiss(loadingToast);
      toast.success('Profile updated successfully', {
        description: 'Your changes have been saved'
      });
      
      // Update local user data
      if (user?.userType === 'Company') {
        user.companyName = formData.username;
        user.companyEmail = formData.email;
      } else {
        user.username = formData.username;
        user.email = formData.email;
      }

    } catch (error) {
      console.error('Profile update error:', error);
      
      // Dismiss loading toast and show error
      toast.dismiss(loadingToast);
      toast.error('Failed to update profile', {
        description: error instanceof Error ? error.message : 'Please try again later'
      });
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Account Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-6">Profile Information</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
              {success}
            </div>
          )}

          {isLoading && !error ? (
            <div className="flex justify-center items-center py-8">
              <div className="w-10 h-10 border-4 border-border border-t-[#800020] rounded-full animate-spin"></div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-foreground mb-1">
                  {user?.userType === 'Student' ? 'Full Name' :
                   user?.userType === 'Counselor' ? 'Counselor Name' :
                   user?.userType === 'Company' ? 'Company Name' : 'Username'}
                </label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  disabled={isLoading}
                  placeholder={user?.userType === 'Student' ? 'Enter your full name' :
                              user?.userType === 'Counselor' ? 'Enter counselor name' :
                              user?.userType === 'Company' ? 'Enter company name' : 'Enter username'}
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
                  Email Address
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                  placeholder="Enter your email address"
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Updating Profile...' : 'Update Profile'}
              </Button>
            </form>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <ChangePassword />
        </div>
      </div>
    </div>
  );
}



