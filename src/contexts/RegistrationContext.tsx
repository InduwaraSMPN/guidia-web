import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import axiosInstance from '../lib/axios';

// Define the structure of our registration data
interface StudentRegistrationData {
  // Personal details (first step)
  studentNumber?: string;
  studentName?: string;
  title?: string;
  contactNumber?: string;
  studentMail?: string;
  description?: string;
  studyLevel?: string;
  courseLevel?: string;
  image?: File | null;
  profileImagePath?: string;

  // Career pathways (second step)
  pathways?: any[];

  // Documents (third step)
  documents?: Array<{
    stuDocType: string;
    stuDocName: string;
    stuDocURL: string;
  }>;

  // Track completion status of each step
  steps: {
    profile: boolean;
    career: boolean;
    documents: boolean;
  };
}

interface RegistrationContextType {
  registrationData: StudentRegistrationData;
  updateRegistrationData: (data: Partial<StudentRegistrationData>) => void;
  saveProfileData: () => Promise<void>;
  saveCareerData: () => Promise<void>;
  saveDocumentsData: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
  fetchExistingData: () => Promise<void>;
}

const RegistrationContext = createContext<RegistrationContextType | undefined>(undefined);

export function RegistrationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [registrationData, setRegistrationData] = useState<StudentRegistrationData>({
    steps: {
      profile: false,
      career: false,
      documents: false
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update registration data
  const updateRegistrationData = (data: Partial<StudentRegistrationData>) => {
    setRegistrationData(prev => {
      // Create a deep copy for arrays to avoid reference issues
      const newData = { ...data };

      // Handle pathways array specially to ensure it's a deep copy
      if (data.pathways) {
        console.log('Updating pathways in context:', data.pathways);
        newData.pathways = [...data.pathways];
      }

      // Handle documents array specially to ensure it's a deep copy
      if (data.documents) {
        newData.documents = [...data.documents];
      }

      return {
        ...prev,
        ...newData
      };
    });
  };

  // Clear error
  const clearError = () => setError(null);

  // Fetch existing data from the server
  const fetchExistingData = async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      // Fetch profile data
      try {
        const profileResponse = await axiosInstance.get(`/api/students/profile/${user.userID}`);
        if (profileResponse.data) {
          const profileData = profileResponse.data as any;

          updateRegistrationData({
            studentNumber: profileData.studentNumber,
            studentName: profileData.studentName,
            title: profileData.studentTitle,
            contactNumber: profileData.studentContactNumber,
            studentMail: profileData.studentEmail,
            description: profileData.studentDescription,
            profileImagePath: profileData.studentProfileImagePath,
            studyLevel: profileData.studentCategory,
            courseLevel: profileData.studentLevel,
            steps: {
              ...registrationData.steps,
              profile: true
            }
          });
        }
      } catch (profileError) {
        console.log('No existing profile data or error fetching profile:', profileError);
      }

      // Fetch career pathways
      try {
        const careerResponse = await axiosInstance.get(`/api/students/career-pathways/${user.userID}`);
        const responseData = careerResponse.data as any;

        // Only update if the API returns non-empty pathways
        if (responseData && Array.isArray(responseData.pathways) && responseData.pathways.length > 0) {
          console.log('Fetched career pathways from API:', responseData.pathways);
          updateRegistrationData({
            pathways: [...responseData.pathways],
            steps: {
              ...registrationData.steps,
              career: true
            }
          });
        } else {
          console.log('API returned empty pathways, keeping existing pathways:', registrationData.pathways);
          // If we already have pathways in the context, mark the step as completed
          if (registrationData.pathways && registrationData.pathways.length > 0) {
            updateRegistrationData({
              steps: {
                ...registrationData.steps,
                career: true
              }
            });
          }
        }
      } catch (careerError) {
        console.log('No existing career data or error fetching career pathways:', careerError);
      }

      // Fetch documents
      try {
        const documentsResponse = await axiosInstance.get('/api/students/documents');
        const docsData = documentsResponse.data as any;
        if (docsData && Array.isArray(docsData.studentDocuments)) {
          updateRegistrationData({
            documents: [...docsData.studentDocuments],
            steps: {
              ...registrationData.steps,
              documents: true
            }
          });
        }
      } catch (documentsError) {
        console.log('No existing documents or error fetching documents:', documentsError);
      }
    } catch (error) {
      console.error('Error fetching registration data:', error);
      setError('Failed to fetch existing registration data');
    } finally {
      setIsLoading(false);
    }
  };

  // Save profile data
  const saveProfileData = async (): Promise<void> => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const profileData = {
        studentNumber: registrationData.studentNumber,
        studentName: registrationData.studentName,
        studentTitle: registrationData.title,
        studentContactNumber: registrationData.contactNumber,
        studentEmail: registrationData.studentMail,
        studentDescription: registrationData.description,
        studentProfileImagePath: registrationData.profileImagePath,
        studentCategory: registrationData.studyLevel,
        studentLevel: registrationData.courseLevel,
        userID: user.userID
      };

      // Check if profile step was already completed
      const method = registrationData.steps.profile ? 'PUT' : 'POST';
      const endpoint = registrationData.steps.profile
        ? `/api/students/${user.userID}`
        : '/api/students/profile';

      await axiosInstance({
        method,
        url: endpoint,
        data: profileData
      });

      // Update step completion status
      updateRegistrationData({
        steps: {
          ...registrationData.steps,
          profile: true
        }
      });
    } catch (error) {
      console.error('Error saving profile data:', error);
      setError('Failed to save profile data');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Save career data
  const saveCareerData = async (): Promise<void> => {
    if (!user || !registrationData.pathways) return;

    setIsLoading(true);
    setError(null);

    try {
      await axiosInstance({
        method: 'PATCH',
        url: '/api/students/career-pathways',
        data: {
          pathways: registrationData.pathways
        }
      });

      // Update step completion status
      updateRegistrationData({
        steps: {
          ...registrationData.steps,
          career: true
        }
      });
    } catch (error) {
      console.error('Error saving career data:', error);
      setError('Failed to save career pathways');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Save documents data
  const saveDocumentsData = async (): Promise<void> => {
    if (!user || !registrationData.documents) return;

    setIsLoading(true);
    setError(null);

    try {
      await axiosInstance({
        method: 'POST',
        url: '/api/students/update-documents',
        data: {
          documents: registrationData.documents
        }
      });

      // Update step completion status
      updateRegistrationData({
        steps: {
          ...registrationData.steps,
          documents: true
        }
      });
    } catch (error) {
      console.error('Error saving documents:', error);
      setError('Failed to save documents');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Load existing data when the component mounts and user is available
  useEffect(() => {
    if (user) {
      fetchExistingData();
    }
  }, [user?.userID]);

  return (
    <RegistrationContext.Provider
      value={{
        registrationData,
        updateRegistrationData,
        saveProfileData,
        saveCareerData,
        saveDocumentsData,
        isLoading,
        error,
        clearError,
        fetchExistingData
      }}
    >
      {children}
    </RegistrationContext.Provider>
  );
}

export const useRegistration = () => {
  const context = useContext(RegistrationContext);
  if (context === undefined) {
    throw new Error('useRegistration must be used within a RegistrationProvider');
  }
  return context;
};
