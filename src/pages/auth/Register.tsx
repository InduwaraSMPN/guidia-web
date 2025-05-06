import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '../../components/ui/input';
import { API_URL } from '../../config';
import { Skeleton } from '@/components/ui/skeleton';

type UserType = 'Student' | 'Counselor' | 'Company';

export function RegisterAs() {
  const [selectedType, setSelectedType] = useState<UserType | null>(null);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const navigate = useNavigate();

  // Simulate loading delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email && selectedType) {
      try {
        setLoading(true);
        setError(null);

        // Send OTP request
        const response = await fetch(`${API_URL}/auth/register/send-otp`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, userType: selectedType })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to send OTP');
        }

        // Store the user type and email in localStorage for the flow
        localStorage.setItem('registrationData', JSON.stringify({
          userType: selectedType,
          email: email
        }));

        // Navigate to email verification
        navigate('/auth/email-verification');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to send OTP');
      } finally {
        setLoading(false);
      }
    }
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-white pt-16 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <Skeleton className="h-10 w-48 mb-8" />

          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center mb-6 sm:mb-8">
              {[...Array(3)].map((_, index) => (
                <Skeleton key={index} className="h-10 w-full sm:w-28 rounded-md" />
              ))}
            </div>

            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-10 w-full" />
            </div>

            <Skeleton className="h-12 w-full rounded-md" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-16 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-brand mb-8">Register As</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center mb-6 sm:mb-8">
            {(['Student', 'Counselor', 'Company'] as UserType[]).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setSelectedType(type)}
                className={`px-4 sm:px-6 py-2 rounded-md text-sm sm:text-base font-medium transition-colors w-full sm:w-auto ${
                  selectedType === type
                    ? 'bg-brand text-white'
                    : 'border border-brand text-brand hover:bg-brand-dark hover:text-white'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground text-left">
              Email Address<span className="text-brand">*</span>
            </label>
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm mt-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!selectedType || !email || loading}
            className="w-full bg-brand text-white py-3 rounded-md font-medium hover:bg-brand-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Sending OTP...' : 'Verify'}
          </button>
        </form>
      </div>
    </div>
  );
}


