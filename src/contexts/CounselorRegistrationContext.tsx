import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

// Define the structure of our counselor registration data
interface CounselorRegistrationData {
  // Personal details (first step)
  counselorName: string;
  position: string;
  education: string;
  contactNumber: string;
  emailMail: string;
  description: string;
  yearsOfExperience: string;
  location: string;
  languages: string[];
  image: File | null;
  profileImagePath?: string;

  // Specializations (second step)
  specializations: string[];

  // Track completion status of each step
  steps: {
    profile: boolean;
    specializations: boolean;
  };
}

interface CounselorRegistrationContextType {
  registrationData: CounselorRegistrationData;
  updateRegistrationData: (data: Partial<CounselorRegistrationData>) => void;
  clearRegistrationData: () => void;
}

const CounselorRegistrationContext = createContext<CounselorRegistrationContextType | undefined>(undefined);

// Default empty state
const defaultRegistrationData: CounselorRegistrationData = {
  counselorName: '',
  position: '',
  education: '',
  contactNumber: '',
  emailMail: '',
  description: '',
  yearsOfExperience: '',
  location: '',
  languages: [],
  image: null,
  specializations: [],
  steps: {
    profile: false,
    specializations: false
  }
};

export function CounselorRegistrationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [registrationData, setRegistrationData] = useState<CounselorRegistrationData>(() => {
    // Try to load from sessionStorage on initial render
    try {
      const savedData = sessionStorage.getItem('counselorRegistrationData');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        // We can't store File objects in sessionStorage, so image will always be null when loaded
        return {
          ...parsedData,
          image: null,
          emailMail: user?.email || parsedData.emailMail || ''
        };
      }
    } catch (error) {
      console.warn('Error loading counselor registration data from sessionStorage:', error);
    }
    
    // Return default state if nothing in sessionStorage
    return {
      ...defaultRegistrationData,
      emailMail: user?.email || ''
    };
  });

  // Update registration data
  const updateRegistrationData = (data: Partial<CounselorRegistrationData>) => {
    setRegistrationData(prev => {
      // Create a deep copy for arrays to avoid reference issues
      const newData = { ...data };

      // Handle languages array specially to ensure it's a deep copy
      if (data.languages) {
        newData.languages = [...data.languages];
      }

      // Handle specializations array specially to ensure it's a deep copy
      if (data.specializations) {
        newData.specializations = [...data.specializations];
      }

      const updatedData = {
        ...prev,
        ...newData
      };

      // Save to sessionStorage (excluding the File object)
      try {
        const dataForStorage = {
          ...updatedData,
          image: null // Don't store File objects
        };
        sessionStorage.setItem('counselorRegistrationData', JSON.stringify(dataForStorage));
      } catch (error) {
        console.warn('Error saving counselor registration data to sessionStorage:', error);
      }

      return updatedData;
    });
  };

  // Clear registration data
  const clearRegistrationData = () => {
    setRegistrationData({
      ...defaultRegistrationData,
      emailMail: user?.email || ''
    });
    sessionStorage.removeItem('counselorRegistrationData');
  };

  // Update email when user changes
  useEffect(() => {
    if (user?.email && user.email !== registrationData.emailMail) {
      updateRegistrationData({ emailMail: user.email });
    }
  }, [user?.email]);

  return (
    <CounselorRegistrationContext.Provider
      value={{
        registrationData,
        updateRegistrationData,
        clearRegistrationData
      }}
    >
      {children}
    </CounselorRegistrationContext.Provider>
  );
}

export const useCounselorRegistration = () => {
  const context = useContext(CounselorRegistrationContext);
  if (context === undefined) {
    throw new Error('useCounselorRegistration must be used within a CounselorRegistrationProvider');
  }
  return context;
};
