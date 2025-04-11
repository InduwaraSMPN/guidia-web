import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { SpecializationSelector } from '@/components/SpecializationSelector';

export function WelcomeEditSpecializations() {
  const navigate = useNavigate();
  const { user, isVerifyingToken } = useAuth();
  const token = localStorage.getItem('token');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSpecializations, setSelectedSpecializations] = useState<string[]>([]);

  // Verify authentication
  useEffect(() => {
    if (!isVerifyingToken && (!token || !user)) {
      toast.error('Please login to continue');
      navigate('/auth/login');
    }
  }, [token, user, isVerifyingToken, navigate]);

  const handleSpecializationsChange = (newSpecializations: string[]) => {
    setSelectedSpecializations(newSpecializations);
  };

  const handleSave = async () => {
    if (!token || !user?.userID) {
      toast.error('Please login to continue');
      navigate('/auth/login');
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/counselors/specializations`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          specializations: selectedSpecializations,
          userID: user.userID
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save specializations');
      }

      // Save to localStorage for immediate UI updates
      localStorage.setItem('userSpecializations', JSON.stringify(selectedSpecializations));
      
      toast.success('Specializations saved successfully!');
      // Update navigation to go to counselor profile page
      navigate(`/counselor/profile/${user.userID}`);
    } catch (error) {
      console.error('Error saving specializations:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save specializations');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white pt-32 px-6 lg:px-8">
      <div className="max-w-3xl mx-auto mb-16">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-brand mb-4">
            02. Select Your Specializations
          </h1>
          <p className="text-lg text-muted-foreground">
            Choose the areas you specialize in counseling
          </p>
        </div>

        <div className="bg-white rounded-lg border border-border p-6">
          <SpecializationSelector
            selectedSpecializations={selectedSpecializations}
            onSpecializationsChange={handleSpecializationsChange}
          />

          <div className="mt-8 flex gap-4 justify-end">
            <Button
              onClick={() => navigate('/welcome')}
              type="button"
              variant="outline"
            >
              Back
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Continue to Profile'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}



