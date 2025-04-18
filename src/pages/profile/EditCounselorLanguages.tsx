import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { MultipleInput } from '@/components/ui/MultipleInput';
import { motion } from 'framer-motion';
import { ChevronLeft, Check, Plus, X } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const SUGGESTED_LANGUAGES = [
  'Sinhala',
  'English',
  'Tamil',
  'Pali',
  'Hindi',
  'Arabic',
  'French',
  'Bengali',
  'Portuguese',
  'Russian',
  'Japanese',
  'German',
  'Korean',
];

export function EditCounselorLanguages() {
  const [languages, setLanguages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [pageLoading, setPageLoading] = useState(true);
  const navigate = useNavigate();
  const { userID } = useParams();
  const { user } = useAuth();
  const token = localStorage.getItem('token');

  useEffect(() => {
    // Simulate loading delay
    const loadingTimer = setTimeout(() => {
      setPageLoading(false);
    }, 1000);

    const fetchLanguages = async () => {
      if (!userID || !token) {
        setPageLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/counselors/${userID}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch counselor data');
        }

        const data = await response.json();
        const fetchedLanguages = data.counselorLanguages || [];
        setLanguages(fetchedLanguages);
        setInitialLoad(false);
      } catch (error) {
        console.error('Error fetching languages:', error);
        toast.error('Failed to load languages');
        setInitialLoad(false);
      } finally {
        setPageLoading(false);
        clearTimeout(loadingTimer); // Clear the timer if fetch completes before timeout
      }
    };

    fetchLanguages();

    return () => clearTimeout(loadingTimer);
  }, [userID, token]);

  const handleAddLanguage = (language: string) => {
    if (!languages.includes(language)) {
      setLanguages(prev => [...prev, language]);
    }
  };

  const handleSubmit = async () => {
    if (!user?.userID || !token) {
      toast.error('Please login to continue');
      return;
    }

    setIsLoading(true);

    try {
      const profileData = {
        counselorName: null,
        position: null,
        education: null,
        contactNumber: null,
        yearsOfExperience: null,
        location: null,
        languages: languages,
        description: null,
        profileImagePath: null,
        userID: user.userID
      };

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/counselors/${userID}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        throw new Error('Failed to update languages');
      }

      toast.success('Languages updated successfully');
      navigate(`/counselor/profile/${userID}`);
    } catch (error) {
      console.error('Error updating languages:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update languages');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter suggestions to only show ones not already selected
  const filteredSuggestions = SUGGESTED_LANGUAGES.filter(
    lang => !languages.includes(lang)
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
            {/* Selected languages section skeleton */}
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
        <Button
          variant="ghost"
          className="mb-4 flex items-center size-sm"
          onClick={() => navigate(`/counselor/profile/${userID}`)}
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Profile
        </Button>

        <header className="mb-8">
          <h1 className="text-3xl font-bold text-brand">
            Your Languages
          </h1>
        </header>

        <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
          <div className="p-6 border-b border-border">
            <label className="block text-sm font-medium text-foreground mb-4">
              Your Selected Languages {languages.length > 0 &&
                <span className="text-muted-foreground font-normal">
                  ({languages.length}/10)
                </span>
              }
            </label>

            {initialLoad ? (
              <div className="h-20 flex items-center justify-center">
                <div className="animate-pulse h-4 w-32 bg-secondary-dark rounded"></div>
              </div>
            ) : (
              <div className="mb-4">
                {languages.length === 0 && (
                  <div className="py-4 mb-4 text-center border border-dashed border-border rounded-lg bg-secondary">
                    <p className="text-muted-foreground">No languages selected yet</p>
                    <p className="text-sm text-muted-foreground mt-1">Choose from suggestions below or add your own</p>
                  </div>
                )}
                <MultipleInput
                  items={languages}
                  onItemsChange={setLanguages}
                  placeholder="Enter a language"
                  allowDuplicates={false}
                  maxItems={10}
                  className="w-full"
                />
              </div>
            )}
          </div>

          <div className="p-6">
            <h3 className="text-sm font-medium text-foreground mb-4">
              Suggested Languages:
            </h3>

            {filteredSuggestions.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">
                All suggested languages have been selected. You can add custom languages above.
              </p>
            ) : (
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {filteredSuggestions.map((language) => (
                  <motion.div
                    key={language}
                    variants={itemVariants}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddLanguage(language)}
                      disabled={languages.length >= 10}
                      className="text-sm text-brand hover:bg-brand-dark hover:text-white w-full text-left h-auto py-3 px-4 justify-between group transition-all duration-200"
                    >
                      <span>{language}</span>
                      <Plus
                        className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                    </Button>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>

          <div className="px-6 py-4 bg-secondary border-t border-border flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              {languages.length === 10 ? (
                <span className="text-amber-600 flex items-center">
                  <span className="bg-amber-100 p-1 rounded-full mr-2">
                    <X className="h-3 w-3" />
                  </span>
                  Maximum limit reached (10/10)
                </span>
              ) : languages.length > 0 ? (
                <span className="flex items-center">
                  <span className="bg-emerald-100 p-1 rounded-full mr-2">
                    <Check className="h-3 w-3 text-emerald-500" />
                  </span>
                  {10 - languages.length} more available
                </span>
              ) : null}
            </div>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/counselor/profile/${userID}`)}
                className="transition-all duration-200"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="transition-all duration-200 relative"
              >
                {isLoading ? (
                  <>
                    <span className="opacity-0">Save Changes</span>
                    <span className="absolute inset-0 flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </span>
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}




