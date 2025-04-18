import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useCounselorRegistration } from '@/contexts/CounselorRegistrationContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MultipleInput } from '@/components/ui/MultipleInput';
import { motion } from 'framer-motion';
import { ChevronLeft, Check, Plus, X } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const AVAILABLE_SPECIALIZATIONS = [
  'Technology Career Paths',
  'Business Development',
  'Professional Growth',
  'Industry Transitions',
  'Leadership Development',
  'Career Transition',
  'Resume Building',
  'Interview Preparation',
  'Job Search Strategy',
  'Networking Skills',
  'Work-Life Balance',
  'Salary Negotiation',
];

export function WelcomeEditSpecializations() {
  const navigate = useNavigate();
  const { user, isVerifyingToken, updateUser } = useAuth();
  const { registrationData, updateRegistrationData } = useCounselorRegistration();
  const token = localStorage.getItem('token');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSpecializations, setSelectedSpecializations] = useState<string[]>(
    registrationData.specializations || []
  );
  const [initialLoad, setInitialLoad] = useState(true);
  const [pageLoading, setPageLoading] = useState(true);

  // Verify authentication and simulate loading
  useEffect(() => {
    if (!isVerifyingToken && (!token || !user)) {
      toast.error('Please login to continue');
      navigate('/auth/login');
    }

    // Simulate loading delay
    const loadingTimer = setTimeout(() => {
      setPageLoading(false);
      setInitialLoad(false);
    }, 1000);

    return () => clearTimeout(loadingTimer);
  }, [token, user, isVerifyingToken, navigate]);

  const handleAddSpecialization = (specialization: string) => {
    if (!selectedSpecializations.includes(specialization)) {
      setSelectedSpecializations(prev => [...prev, specialization]);
    }
  };

  // Filter suggestions to only show ones not already selected
  const filteredSuggestions = AVAILABLE_SPECIALIZATIONS.filter(
    spec => !selectedSpecializations.includes(spec)
  );

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  const handleSave = async () => {
    if (!token || !user?.userID) {
      toast.error('Please login to continue');
      navigate('/auth/login');
      return;
    }

    try {
      setIsLoading(true);

      // Save to context first for state persistence
      updateRegistrationData({
        specializations: selectedSpecializations,
        steps: {
          ...registrationData.steps,
          specializations: true
        }
      });

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

      // Ensure hasProfile flag is set to true in user context
      updateUser({ hasProfile: true });
      console.log('Updated user context with hasProfile: true');

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

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-secondary pt-32 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Back navigation skeleton */}
          <Skeleton className="h-10 w-32 mb-4" />

          {/* Header skeleton */}
          <div className="mb-8">
            <Skeleton className="h-10 w-64" />
          </div>

          {/* Main content skeleton */}
          <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
            {/* Selected specializations section skeleton */}
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

            {/* Actions footer skeleton */}
            <div className="px-6 py-4 bg-secondary border-t border-border flex justify-between items-center">
              <Skeleton className="h-5 w-32" />
              <div className="flex gap-3">
                <Skeleton className="h-10 w-24 rounded-md" />
                <Skeleton className="h-10 w-32 rounded-md" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary pt-32 pb-32 px-4 sm:px-6 lg:px-8">
      <motion.div
        className="max-w-3xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Back navigation */}
        <Button
          variant="ghost"
          className="mb-4 flex items-center size-sm"
          onClick={() => navigate('/welcome/counselor')}
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Profile
        </Button>

        <header className="mb-8">
          <h1 className="text-3xl font-bold text-brand">
            Select Your Specializations
          </h1>
          <p className="text-lg text-muted-foreground mt-2">
            Choose the areas you specialize in counseling
          </p>
        </header>

        <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
          {/* Selected specializations section */}
          <div className="p-6 border-b border-border">
            <label className="block text-sm font-medium text-foreground mb-4">
              Your Selected Specializations {selectedSpecializations.length > 0 &&
                <span className="text-muted-foreground font-normal">
                  ({selectedSpecializations.length}/10)
                </span>
              }
            </label>

            {initialLoad ? (
              <div className="h-20 flex items-center justify-center">
                <div className="animate-pulse h-4 w-32 bg-secondary-dark rounded"></div>
              </div>
            ) : (
              <div className="mb-4">
                {selectedSpecializations.length === 0 && (
                  <div className="py-4 mb-4 text-center border border-dashed border-border rounded-lg bg-secondary">
                    <p className="text-muted-foreground">No specializations selected yet</p>
                    <p className="text-sm text-muted-foreground mt-1">Choose from suggestions below or add your own</p>
                  </div>
                )}
                <MultipleInput
                  items={selectedSpecializations}
                  onItemsChange={(specializations) => {
                    setSelectedSpecializations(specializations);
                    // Also update the context for state persistence
                    updateRegistrationData({ specializations });
                  }}
                  placeholder="Enter a specialization"
                  allowDuplicates={false}
                  maxItems={10}
                  className="w-full"
                />
              </div>
            )}
          </div>

          {/* Suggestions section */}
          <div className="p-6">
            <h3 className="text-sm font-medium text-foreground mb-4">
              Suggested Specializations:
            </h3>

            {filteredSuggestions.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">
                All suggested specializations have been selected. You can add custom specializations above.
              </p>
            ) : (
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {filteredSuggestions.map((specialization) => (
                  <motion.div
                    key={specialization}
                    variants={itemVariants}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddSpecialization(specialization)}
                      disabled={selectedSpecializations.length >= 10}
                      className="text-sm text-brand hover:bg-brand-dark hover:text-white w-full text-left h-auto py-3 px-4 justify-between group transition-all duration-200"
                    >
                      <span>{specialization}</span>
                      <Plus
                        className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                    </Button>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>

          {/* Actions footer */}
          <div className="px-6 py-4 bg-secondary border-t border-border flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              {selectedSpecializations.length === 10 ? (
                <span className="text-amber-600 flex items-center">
                  <span className="bg-amber-100 p-1 rounded-full mr-2">
                    <X className="h-3 w-3" />
                  </span>
                  Maximum limit reached (10/10)
                </span>
              ) : selectedSpecializations.length > 0 ? (
                <span className="flex items-center">
                  <span className="bg-emerald-100 p-1 rounded-full mr-2">
                    <Check className="h-3 w-3 text-emerald-500" />
                  </span>
                  {10 - selectedSpecializations.length} more available
                </span>
              ) : null}
            </div>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/welcome/counselor')}
                className="transition-all duration-200"
              >
                Back
              </Button>
              <Button
                onClick={handleSave}
                disabled={isLoading}
                className="transition-all duration-200 relative"
              >
                {isLoading ? (
                  <>
                    <span className="opacity-0">Continue to Profile</span>
                    <span className="absolute inset-0 flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </span>
                  </>
                ) : (
                  'Continue to Profile'
                )}
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}



