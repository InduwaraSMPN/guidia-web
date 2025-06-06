import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PathwaySelector } from '@/components/PathwaySelector';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useRegistration } from '@/contexts/RegistrationContext';
import { toast } from 'sonner';

export function WelcomeEditCareerPathways() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { registrationData, updateRegistrationData, isLoading, fetchExistingData } = useRegistration();
  const [selectedPaths, setSelectedPaths] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pageLoading, setPageLoading] = useState(true);

  // Simulate loading delay and fetch existing data
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (user) {
        // Only fetch data if we don't already have pathways
        if (!registrationData.pathways || registrationData.pathways.length === 0) {
          console.log('No existing pathways in context, fetching from API');
          await fetchExistingData();
        } else {
          console.log('Using existing pathways from context:', registrationData.pathways);
        }
      }
      setPageLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [user, registrationData.pathways]);

  // Update selected paths when registration data changes
  useEffect(() => {
    // Check if registrationData.pathways exists and is an array
    if (Array.isArray(registrationData.pathways) && registrationData.pathways.length > 0) {
      console.log('Setting career pathways from registration data:', registrationData.pathways);
      setSelectedPaths([...registrationData.pathways]);
    } else {
      console.log('No career pathways found in registration data, checking localStorage');

      // Try to load from localStorage as a fallback
      try {
        const savedPathways = localStorage.getItem('career_pathways');
        if (savedPathways) {
          const parsedPathways = JSON.parse(savedPathways);
          if (Array.isArray(parsedPathways) && parsedPathways.length > 0) {
            console.log('Loaded pathways from localStorage:', parsedPathways);
            setSelectedPaths(parsedPathways);

            // Also update the registration context
            updateRegistrationData({
              pathways: [...parsedPathways]
            });
            return;
          }
        }
      } catch (error) {
        console.warn('Error loading pathways from localStorage:', error);
      }

      console.log('No career pathways found in localStorage either');
    }
  }, [registrationData]);

  const handlePathwaysChange = (newPaths: string[]) => {
    console.log('Pathways changed to:', newPaths);
    // First update local state
    setSelectedPaths([...newPaths]);

    // Then update registration context with a deep copy
    updateRegistrationData({
      pathways: [...newPaths]
    });
  };

  const handleSave = async () => {
    try {
      setError(null);

      // First update the registration context to ensure we don't lose data
      // Make sure to create a deep copy of the selectedPaths array
      console.log('Saving pathways to context:', [...selectedPaths]);
      updateRegistrationData({
        pathways: [...selectedPaths],
        steps: {
          ...registrationData.steps,
          career: true
        }
      });

      // Then send data to the API
      const response = await fetch('/api/students/career-pathways', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          pathways: selectedPaths
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update career pathways');
      }

      toast.success('Career pathways saved successfully!');

      // Store pathways in localStorage as a backup
      try {
        localStorage.setItem('career_pathways', JSON.stringify(selectedPaths));
      } catch (storageError) {
        console.warn('Failed to store pathways in localStorage:', storageError);
      }

      navigate('/welcome/documents');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-white pt-32 px-6 lg:px-8 pb-32">
        <div className="max-w-3xl mx-auto mb-16">
          <div className="text-center mb-12">
            <Skeleton className="h-10 w-3/4 mx-auto mb-4" />
            <Skeleton className="h-6 w-2/3 mx-auto" />
          </div>

          <div className="space-y-8">
            {/* Selected pathways section skeleton */}
            <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
              <div className="p-6 border-b border-border">
                <Skeleton className="h-5 w-48 mb-4" />
                <div className="h-20 flex flex-col justify-center space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>

              {/* Suggestions section skeleton */}
              <div className="p-6">
                <Skeleton className="h-5 w-48 mb-4" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[...Array(8)].map((_, index) => (
                    <Skeleton key={index} className="h-12 w-full rounded-md" />
                  ))}
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-4 pt-4">
              <Skeleton className="h-10 w-24 rounded-md" />
              <Skeleton className="h-10 w-40 rounded-md" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-32 px-6 lg:px-8 pb-32">
      <div className="max-w-3xl mx-auto mb-16">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-brand mb-4">
            02. Select Your Career Pathways
          </h1>
          <p className="text-lg text-muted-foreground">
            Choose the career paths you're interested in pursuing
          </p>
        </div>

        <div>
          <PathwaySelector
            selectedPaths={selectedPaths}
            onPathwaysChange={handlePathwaysChange}
            onSave={undefined}
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
              type="button"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save & Continue'}
            </Button>
          </div>
          {error && (
            <div className="mt-4 text-red-600 text-center">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


