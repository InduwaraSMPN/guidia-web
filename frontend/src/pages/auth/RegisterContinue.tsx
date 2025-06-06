import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Input } from '../../components/ui/input';
import { API_URL } from '../../config';
import { Skeleton } from '@/components/ui/skeleton';

export function RegisterContinue() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    retypePassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showRetypePassword, setShowRetypePassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    // Check if we have the required data
    const storedData = localStorage.getItem('registrationData');
    if (!storedData) {
      navigate('/auth/register');
    }

    // Simulate loading delay
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [navigate]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pageLoading, setPageLoading] = useState(true);

  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/[a-z]/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/[0-9]/.test(password)) {
      return 'Password must contain at least one number';
    }
    if (!/[!@#$%^&*]/.test(password)) {
      return 'Password must contain at least one special character (!@#$%^&*)';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate password
    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (formData.password !== formData.retypePassword) {
      setError('Passwords do not match');
      return;
    }

    const storedData = localStorage.getItem('registrationData');
    if (storedData) {
      try {
        setLoading(true);
        setError(null);
        const { email } = JSON.parse(storedData);

        // Register user
        const response = await fetch(`${API_URL}/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            username: formData.username,
            password: formData.password
          })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Registration failed');
        }

        // Handle pending registration state
        if (data.status === 'pending') {
          // Clear registration data
          localStorage.removeItem('registrationData');
          // Show success page with pending message
          navigate('/auth/registration-pending');
          return;
        }

        // For direct registrations (students)
        localStorage.setItem('token', data.token);
        await login({
          email: data.email,
          password: formData.password
        });

        // Clear registration data
        localStorage.removeItem('registrationData');

        // Navigate to welcome profile setup instead of student profile
        navigate('/welcome');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Registration failed');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-white pt-16 flex items-center justify-center px-4">
        <div className="w-full max-w-sm px-4 sm:px-6">
          <Skeleton className="h-10 w-48 mb-8" />

          <div className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-5 w-32 mb-1" />
              <Skeleton className="h-10 w-full" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-5 w-32 mb-1" />
              <Skeleton className="h-10 w-full" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-5 w-48 mb-1" />
              <Skeleton className="h-10 w-full" />
            </div>

            <Skeleton className="h-12 w-full rounded-md" />

            <div className="mt-4">
              <Skeleton className="h-5 w-48 mb-2" />
              <div className="space-y-1">
                {[...Array(5)].map((_, index) => (
                  <Skeleton key={index} className="h-4 w-full" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-16 flex items-center justify-center px-4">
      <div className="w-full max-w-sm px-4 sm:px-6">
        <h1 className="text-3xl font-bold text-brand mb-8">Register</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground text-left mb-1">
              Username<span className="text-brand">*</span>
            </label>
            <Input
              type="text"
              name="username"
              required
              value={formData.username}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground text-left mb-1">
              Password<span className="text-brand">*</span>
            </label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <Eye className="h-5 w-5 text-muted-foreground" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground text-left mb-1">
              Retype Password<span className="text-brand">*</span>
            </label>
            <div className="relative">
              <Input
                type={showRetypePassword ? "text" : "password"}
                name="retypePassword"
                required
                value={formData.retypePassword}
                onChange={handleChange}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2"
                onClick={() => setShowRetypePassword(!showRetypePassword)}
              >
                {showRetypePassword ? (
                  <EyeOff className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <Eye className="h-5 w-5 text-muted-foreground" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm mt-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand text-white py-3 rounded-md font-medium hover:bg-brand-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>

          <div className="mt-4 text-sm text-muted-foreground">
            <p>Password must contain:</p>
            <ul className="list-disc list-inside">
              <li>At least 8 characters</li>
              <li>One uppercase letter</li>
              <li>One lowercase letter</li>
              <li>One number</li>
              <li>One special character (!@#$%^&*)</li>
            </ul>
          </div>
        </form>
      </div>
    </div>
  );
}



