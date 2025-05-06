import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { useAuth } from '../../contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

export function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { login, user } = useAuth();

  // Simulate loading delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Clear any existing errors

    if (!formData.email || !formData.password) {
      setError('Email and password are required');
      return;
    }

    try {
      const userData = await login(formData);
      console.log('Login successful, user data:', userData);

    // Construct dynamic profile URLs based on user type and numeric ID
      const userTypeToPath: Record<string, string> = {
        Admin: '/admin',
        Student: userData.hasProfile
          ? `/students/profile/${userData.userID}`
          : '/welcome/profile',  // Redirect to welcome profile for students without profiles
        Counselor: userData.hasProfile
          ? `/counselor/profile/${userData.userID}`
          : '/welcome/counselor',
        Company: userData.hasProfile
          ? `/company/profile/${userData.userID}`
          : '/welcome/company'
      };

      const redirectPath = userTypeToPath[userData.userType];
      if (!redirectPath) {
        console.error('Invalid user type:', userData.userType);
        setError('Invalid user type received');
        return;
      }

      // Log navigation details
      console.log('Navigating to:', {
        userType: userData.userType,
        userID: userData.userID,
        hasProfile: userData.hasProfile,
        redirectPath
      });

      navigate(redirectPath);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-12 sm:pt-16 flex items-center justify-center px-4 sm:px-6">
        <div className="w-full max-w-sm">
          <div>
            <Skeleton className="h-8 sm:h-10 w-28 sm:w-32 mb-6" />

            <div className="mt-6 sm:mt-8">
              <div className="space-y-5 sm:space-y-6">
                <div>
                  <Skeleton className="h-4 sm:h-5 w-28 sm:w-32 mb-1" />
                  <Skeleton className="h-9 sm:h-10 w-full" />
                </div>

                <div>
                  <Skeleton className="h-4 sm:h-5 w-28 sm:w-32 mb-1" />
                  <Skeleton className="h-9 sm:h-10 w-full" />
                  <div className="mt-1 text-right">
                    <Skeleton className="h-3 sm:h-4 w-24 sm:w-32 inline-block" />
                  </div>
                </div>

                <Skeleton className="h-10 sm:h-12 w-full rounded-md" />

                <div className="mt-5 sm:mt-6">
                  <Skeleton className="h-4 sm:h-5 w-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-12 sm:pt-16 flex items-center justify-center px-4 sm:px-6">
      <div className="w-full max-w-sm">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-brand text-left">Login</h2>

          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
              {error}
            </div>
          )}

          <div className="mt-6 sm:mt-8">
            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground text-left mb-1">
                  Email Address<span className="text-brand">*</span>
                </label>
                <div className="mt-1">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-foreground text-left mb-1">
                  Password<span className="text-brand">*</span>
                </label>
                <div className="mt-1 relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                    )}
                  </button>
                </div>
                <div className="mt-1 text-right">
                  <Link
                    to="/auth/forgot-password"
                    className="text-xs sm:text-sm text-brand hover:text-brand-dark"
                  >
                    forgot password?
                  </Link>
                </div>
              </div>

              <Button type="submit" size="lg" className="w-full py-2 sm:py-3 h-auto text-sm sm:text-base">
                Login
              </Button>
            </form>

            <div className="mt-5 sm:mt-6">
              <p className="text-xs sm:text-sm text-muted-foreground">
                Don't Have an account?{' '}
                <Link
                  to="/auth/register"
                  className="font-medium text-brand hover:text-brand-dark"
                >
                  Register Now
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


