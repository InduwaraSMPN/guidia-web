import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { useAuth } from '../../contexts/AuthContext';

export function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login, user } = useAuth();

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
        Student: `/students/profile/${userData.userID}`,
        Counselor: userData.hasProfile 
          ? `/counselor/profile/${userData.userID}`
          : '/welcome/counselor',
        Company: userData.hasProfile 
          ? `/company/profile/${userData.userID}`
          : '/welcome/company'  // Add this condition for companies
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

  return (
    <div className="min-h-screen bg-white pt-16 flex items-center justify-center">
      <div className="w-full max-w-sm px-4 sm:px-6">
        <div>
          <h2 className="text-3xl font-extrabold text-[#800020] text-left">Login</h2>
          
          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <div className="mt-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 text-left mb-1">
                  Email Address<span className="text-[#800020]">*</span>
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
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 text-left mb-1">
                  Password<span className="text-[#800020]">*</span>
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
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                <div className="mt-1 text-right">
                  <Link 
                    to="/auth/forgot-password" 
                    className="text-sm text-[#800020] hover:text-rose-800"
                  >
                    forgot password?
                  </Link>
                </div>
              </div>

              <Button type="submit" size="lg" className="w-full">
                Login
              </Button>
            </form>

            <div className="mt-6">
              <p className="text-sm text-gray-600">
                Don't Have an account?{' '}
                <Link 
                  to="/auth/register" 
                  className="font-medium text-[#800020] hover:text-rose-800"
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
