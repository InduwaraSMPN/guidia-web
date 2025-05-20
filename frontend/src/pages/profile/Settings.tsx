import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChangePassword } from '@/components/ChangePassword';
import { useAuth } from '@/contexts/AuthContext';
import { createAuthHeaders } from '@/lib/csrfToken';
import { toast } from "sonner";
import { refreshAllTokens } from '@/lib/tokenHelper';

/**
 * Settings Page
 * UX Refactored for:
 * - Visual hierarchy (semantic headings, ARIA roles)
 * - Consistent spacing/layout (4/8/16/24/32px scale)
 * - Skeleton loader for loading state
 * - Micro-interactions (transitions, focus/hover/active states)
 * - Accessibility (ARIA, keyboard nav, error roles)
 * - Comments explain each improvement
 */
export function Settings() {
  const { user, updateUser } = useAuth();
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
      fetchUserDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Skeleton loader state for perceived performance
  const [showSkeleton, setShowSkeleton] = useState(true);
  useEffect(() => {
    if (isLoading) {
      setShowSkeleton(true);
    } else {
      // Delay hiding skeleton for smoothness
      const timeout = setTimeout(() => setShowSkeleton(false), 400);
      return () => clearTimeout(timeout);
    }
  }, [isLoading]);

  const fetchUserDetails = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      let endpoint = '';
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
      const headers = createAuthHeaders();
      const response = await fetch(endpoint, { headers });
      if (!response.ok) throw new Error('Failed to fetch user details');
      const data = await response.json();
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
      setFormData({ username, email });
    } catch (error) {
      setError('Failed to load user details');
    } finally {
      setIsLoading(false);
    }
  };

  // Input change handler
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Form submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const headers = await createAuthHeaders();
      let endpoint = '/api/users/profile';
      let payload = {};
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
      toast.success('Profile updated successfully', {
        description: 'Your changes have been saved'
      });

      // Update the user context with the new email
      if (data.user && user) {
        updateUser({
          email: data.user.email
        });
        console.log('User context updated with new email:', data.user.email);
      }

      // After successful update, refresh the token to ensure it contains the updated user info
      try {
        await refreshAllTokens();
      } catch (refreshError) {
        console.error('Failed to refresh tokens after profile update:', refreshError);
      }

      setSuccess('Profile updated successfully');
      setError(null);
    } catch (error) {
      toast.error('Failed to update profile', {
        description: error instanceof Error ? error.message : 'Please try again later'
      });
      setError(error instanceof Error ? error.message : 'Failed to update profile');
      setSuccess(null);
    }
  };

  // Accessibility: ARIA live region for feedback
  // Visual hierarchy: semantic headings, ARIA roles
  // Layout: consistent spacing, card grouping, responsive grid
  // Micro-interactions: transitions, focus/hover/active states
  // Skeleton loader for loading state

  return (
    <main
      className="container mx-auto py-8 px-4 pt-32 pb-32"
      aria-labelledby="settings-title"
      role="main"
    >
      {/* H1: Page Title */}
      <header className="mb-10">
        <h1
          id="settings-title"
          className="text-4xl font-extrabold tracking-tight mb-2"
          tabIndex={-1}
        >
          Login Account Settings
        </h1>
        {/* Breadcrumbs for navigation clarity (if needed in future) */}
        {/* <nav aria-label="Breadcrumb" className="mb-2">
          <ol className="flex space-x-2 text-sm text-muted-foreground">
            <li>Home</li>
            <li aria-current="page" className="font-semibold text-foreground">Settings</li>
          </ol>
        </nav> */}
      </header>

      <section
        className="grid grid-cols-1 md:grid-cols-2 gap-8"
        aria-label="Settings Sections"
      >
        {/* Profile Card */}
        <section
          className="bg-white p-8 rounded-2xl shadow-lg flex flex-col gap-6 transition-shadow duration-300 focus-within:shadow-xl"
          aria-labelledby="profile-info-title"
          tabIndex={-1}
        >
          {/* H2: Profile Info */}
          <h2
            id="profile-info-title"
            className="text-2xl font-bold mb-2"
          >
            Profile Information
          </h2>

          {/* ARIA live region for error only (success handled by sonner) */}
          <div aria-live="polite" aria-atomic="true">
            {error && (
              <div
                className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded transition-all duration-300"
                role="alert"
                tabIndex={0}
              >
                {error}
              </div>
            )}
          </div>

          {/* Skeleton loader for loading state */}
          {showSkeleton && isLoading && !error ? (
            <div className="flex flex-col gap-4 animate-pulse py-8">
              <div className="h-6 w-1/2 bg-gray-200 rounded" />
              <div className="h-12 w-full bg-gray-200 rounded" />
              <div className="h-6 w-1/2 bg-gray-200 rounded" />
              <div className="h-12 w-full bg-gray-200 rounded" />
              <div className="h-12 w-full bg-gray-200 rounded" />
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="space-y-6"
              aria-describedby={error ? "profile-error" : undefined}
              autoComplete="off"
            >
              {/* Username */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="username"
                  className="block text-base font-medium text-foreground"
                >
                  {user?.userType === 'Student' ? 'Student Username' :
                    user?.userType === 'Counselor' ? 'Counselor Username' :
                      user?.userType === 'Company' ? 'Company Username' : 'Username'}
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
                  className="transition-shadow duration-300 focus:ring-2 focus:ring-[#800020] focus:border-[#800020] min-h-[44px]"
                  aria-required="true"
                  aria-label="Username"
                  autoComplete="name"
                />
              </div>

              {/* Email */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="email"
                  className="block text-base font-medium text-foreground"
                >
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
                  className="transition-shadow duration-300 focus:ring-2 focus:ring-[#800020] focus:border-[#800020] min-h-[44px]"
                  aria-required="true"
                  aria-label="Email Address"
                  autoComplete="email"
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full py-3 text-lg font-semibold rounded-lg transition-all duration-300 focus:ring-2 focus:ring-[#800020] focus:outline-none active:scale-95"
                disabled={isLoading}
                aria-busy={isLoading}
                aria-label={isLoading ? "Updating Profile" : "Update Profile"}
                style={{ minHeight: 48 }}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-5 h-5 border-2 border-border border-t-[#800020] rounded-full animate-spin" />
                    Updating Profile...
                  </span>
                ) : (
                  "Update Profile"
                )}
              </Button>
            </form>
          )}
        </section>

        {/* Change Password Card */}
        <section
          className="bg-white p-8 rounded-2xl shadow-lg flex flex-col gap-6 transition-shadow duration-300 focus-within:shadow-xl"
          aria-labelledby="change-password-title"
          tabIndex={-1}
        >
          <ChangePassword />
        </section>
      </section>
    </main>
  );
}
