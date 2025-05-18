import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { ProfileSection } from '@/interfaces/Profile';
import { Skeleton } from '@/components/ui/skeleton';
import { useRegistration } from '@/contexts/RegistrationContext';
import {
  validateEmail,
  validatePhoneNumber,
  validateText,
  validateStudentNumber
} from '@/utils/validationUtils';

export function WelcomeEditStudentProfile() {
  const navigate = useNavigate();
  const { user, isVerifyingToken, updateUser } = useAuth();
  const token = localStorage.getItem('token');
  const { registrationData, updateRegistrationData, isLoading, fetchExistingData } = useRegistration();
  const [initialData, setInitialData] = useState<Record<string, any>>({});
  const [selectedStudyLevel, setSelectedStudyLevel] = useState<string | null>(null);
  const [pageLoading, setPageLoading] = useState(true);

  // Simulate loading delay and fetch existing data
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (user) {
        await fetchExistingData();
      }
      setPageLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [user]);

  // Verify authentication
  useEffect(() => {
    if (!isVerifyingToken && (!token || !user)) {
      toast.error('Please login to continue');
      navigate('/auth/login');
    }
  }, [token, user, isVerifyingToken, navigate]);

  // State to track if we need to fetch the profile image
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Update initialData from registration data and when study level changes
  useEffect(() => {
    // Populate form with existing registration data if available
    if (registrationData) {
      const initialFormData: Record<string, any> = {
        studentNumber: registrationData.studentNumber || '',
        studentName: registrationData.studentName || '',
        title: registrationData.title || '',
        contactNumber: registrationData.contactNumber || '',
        studentMail: registrationData.studentMail || user?.email || '',
        description: registrationData.description || '',
        studyLevel: registrationData.studyLevel || selectedStudyLevel || '',
        courseLevel: registrationData.courseLevel || ''
      };

      // If we have a profile image path, add it to the initial form data
      if (registrationData.profileImagePath) {
        setPreviewUrl(registrationData.profileImagePath);
        initialFormData.profileImagePath = registrationData.profileImagePath;
      }

      setInitialData(initialFormData);

      // Update selected study level if it exists in registration data
      if (registrationData.studyLevel && !selectedStudyLevel) {
        setSelectedStudyLevel(registrationData.studyLevel);
      }
    }
  }, [registrationData, user]);

  // Update initialData when study level changes
  useEffect(() => {
    if (selectedStudyLevel) {
      setInitialData(prev => ({
        ...prev,
        studyLevel: selectedStudyLevel
      }));
    }
  }, [selectedStudyLevel]);

  // Handle form field changes
  const handleFieldChange = (name: string, value: any) => {
    if (name === 'studyLevel') {
      setSelectedStudyLevel(value);
    }
  };

  // Define course level options
  const courseLevelOptions = {
    Undergraduate: [
      { value: 'Level - 1', label: 'Level - 1' },
      { value: 'Level - 2', label: 'Level - 2' },
      { value: 'Level - 3', label: 'Level - 3' },
      { value: 'Level - 4', label: 'Level - 4' }
    ],
    Postgraduate: [
      { value: 'PGCert (Postgraduate Certificate)', label: 'PGCert (Postgraduate Certificate)' },
      { value: 'PGDip (Postgraduate Diploma)', label: 'PGDip (Postgraduate Diploma)' },
      { value: 'MA (Master of Arts)', label: 'MA (Master of Arts)' },
      { value: 'MSc (Master of Science)', label: 'MSc (Master of Science)' },
      { value: 'MBA (Master of Business Administration)', label: 'MBA (Master of Business Administration)' },
      { value: 'LLM (Master of Laws)', label: 'LLM (Master of Laws)' },
      { value: 'MEd (Master of Education)', label: 'MEd (Master of Education)' },
      { value: 'MArch (Master of Architecture)', label: 'MArch (Master of Architecture)' },
      { value: 'MFA (Master of Fine Arts)', label: 'MFA (Master of Fine Arts)' },
      { value: 'MASt (Master of Advanced Study)', label: 'MASt (Master of Advanced Study)' },
      { value: 'PGCE (Postgraduate Certificate in Education)', label: 'PGCE (Postgraduate Certificate in Education)' },
      { value: 'MPhil (Master of Philosophy)', label: 'MPhil (Master of Philosophy)' },
      { value: 'MRes (Master of Research)', label: 'MRes (Master of Research)' },
      { value: 'MLitt (Master of Letters)', label: 'MLitt (Master of Letters)' },
      { value: 'PhD (Doctor of Philosophy)', label: 'PhD (Doctor of Philosophy)' },
      { value: 'DPhil (Doctor of Philosophy)', label: 'DPhil (Doctor of Philosophy)' },
      { value: 'EdD (Doctor of Education)', label: 'EdD (Doctor of Education)' },
      { value: 'DBA (Doctor of Business Administration)', label: 'DBA (Doctor of Business Administration)' },
      { value: 'DM (Doctor of Medicine)', label: 'DM (Doctor of Medicine)' },
      { value: 'GradCert (Graduate Certificate)', label: 'GradCert (Graduate Certificate)' },
      { value: 'GradDip (Graduate Diploma)', label: 'GradDip (Graduate Diploma)' },
      { value: 'Conversion Courses', label: 'Conversion Courses' },
      { value: 'Pre-Master\'s Courses', label: 'Pre-Master\'s Courses' }
    ]
  };

  const formSections: ProfileSection[] = [
    {
      fields: [
        {
          name: 'studentNumber',
          label: 'Student Number',
          type: 'text',
          placeholder: 'Enter student number',
          required: true
        },
        {
          name: 'studentName',
          label: 'Student Name',
          type: 'text',
          placeholder: 'Enter student name',
          required: true
        },
        {
          name: 'title',
          label: 'Title',
          type: 'text',
          placeholder: 'Enter title',
          required: true,
          gridCols: 1
        },
        {
          name: 'contactNumber',
          label: 'Contact Number',
          type: 'tel',
          placeholder: 'Enter contact number',
          required: true,
          gridCols: 1
        },
        {
          name: 'studentMail',
          label: 'Student E-Mail',
          type: 'email',
          placeholder: 'Enter student email',
          required: true,
          gridCols: 2
        }
      ]
    },
    {
      title: 'Academic Details',
      fields: [
        {
          name: 'studyLevel',
          label: 'Study Level',
          type: 'select',
          required: true,
          options: [
            { value: 'Undergraduate', label: 'Undergraduate' },
            { value: 'Postgraduate', label: 'Postgraduate' }
          ],
          gridCols: 1
        },
        {
          name: 'courseLevel',
          label: 'Course Level',
          type: 'select',
          required: true,
          dependsOn: {
            field: 'studyLevel',
            options: courseLevelOptions,
            disableWhenUnavailable: true
          },
          gridCols: 1
        }
      ]
    },
    {
      title: 'Personal Details',
      fields: [
        {
          name: 'description',
          label: 'Tell us about yourself',
          type: 'richtext',
          required: true,
          placeholder: 'Share a brief introduction about yourself...',
          gridCols: 2
        },
        {
          name: 'image',
          label: 'Profile Picture',
          type: 'file',
          required: true,
          options: [{ value: 'image', label: 'Image files' }],
          gridCols: 2
        }
      ]
    }
  ];

  // Validate form data
  const validateFormData = (formData: Record<string, any>): boolean => {
    // Validate student number
    if (!validateStudentNumber(formData.studentNumber)) {
      toast.error('Student number is required and must not exceed 20 characters');
      return false;
    }

    // Validate student name
    if (!validateText(formData.studentName, 2)) {
      toast.error('Student name must be at least 2 characters');
      return false;
    }

    // Validate title
    if (!validateText(formData.title, 2)) {
      toast.error('Title must be at least 2 characters');
      return false;
    }

    // Validate contact number
    if (!validatePhoneNumber(formData.contactNumber)) {
      toast.error('Please enter a valid contact number');
      return false;
    }

    // Validate email
    if (!validateEmail(formData.studentMail)) {
      toast.error('Please enter a valid email address');
      return false;
    }

    // Validate description - no character limit as per memory
    if (!validateText(formData.description, 10)) {
      toast.error('Description must be at least 10 characters');
      return false;
    }

    // Validate study level
    if (!formData.studyLevel) {
      toast.error('Please select a study level');
      return false;
    }

    // Validate course level
    if (!formData.courseLevel) {
      toast.error('Please select a course level');
      return false;
    }

    // Validate image
    if (!formData.image && !previewUrl) {
      toast.error('Please upload a profile image');
      return false;
    }

    return true;
  };

  const handleSubmit = async (formData: Record<string, any>) => {
    if (!token || !user?.userID || !user?.email) {
      toast.error('Please login to update profile');
      navigate('/auth/login');
      return;
    }

    // Verify user is a student
    if (user.roleId !== 2) {
      toast.error('Only students can create profiles');
      navigate('/');
      return;
    }

    // Validate form data
    if (!validateFormData(formData)) {
      return;
    }

    try {
      let profileImagePath = null;

      if (formData.image instanceof File) {
        const imageFormData = new FormData();
        imageFormData.append('image', formData.image);
        imageFormData.append('type', 'student-profile');

        const uploadResponse = await fetch(`/api/upload`, {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          method: 'POST',
          body: imageFormData,
        });

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload image');
        }

        const uploadResult = await uploadResponse.json();
        profileImagePath = uploadResult.imagePath; // Make sure this matches the backend response
      }

      // Prepare profile data for API
      const profileData = {
        studentNumber: formData.studentNumber,
        studentName: formData.studentName,
        studentTitle: formData.title,
        studentContactNumber: formData.contactNumber,
        studentEmail: formData.studentMail,
        studentDescription: formData.description,
        studentProfileImagePath: profileImagePath,
        studentCategory: formData.studyLevel,
        studentLevel: formData.courseLevel,
        userID: user?.userID
      };

      console.log('Submitting profile data:', profileData);

      // Send data directly to the API
      // Use relative URL instead of environment variable
      const response = await fetch(`/api/students/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-User-ID': user.userID
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.details || 'Failed to update profile');
      }

      // After successful API call, update the registration context
      updateRegistrationData({
        studentNumber: formData.studentNumber,
        studentName: formData.studentName,
        title: formData.title,
        contactNumber: formData.contactNumber,
        studentMail: formData.studentMail,
        description: formData.description,
        profileImagePath: profileImagePath,
        studyLevel: formData.studyLevel,
        courseLevel: formData.courseLevel,
        image: formData.image,
        steps: {
          ...registrationData.steps,
          profile: true
        }
      });

      // Update the user context to set hasProfile to true
      updateUser({ hasProfile: true });
      console.log('Updated user context with hasProfile: true');

      toast.success('Profile created successfully!');
      navigate('/welcome/career');
    } catch (error) {
      console.error('Error updating profile:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create profile';
      toast.error(errorMessage);

      if (error instanceof Error && error.message.includes('Token')) {
        localStorage.removeItem('token');
        navigate('/auth/login');
      }
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
            {/* Personal Information Section */}
            <div className="space-y-4">
              <Skeleton className="h-8 w-48 mb-2" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            </div>

            {/* Academic Details Section */}
            <div className="space-y-4">
              <Skeleton className="h-8 w-48 mb-2" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            </div>

            {/* Personal Details Section */}
            <div className="space-y-4">
              <Skeleton className="h-8 w-48 mb-2" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-[160px] w-full rounded-md" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-48 w-full rounded-lg" />
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
            01. Welcome to <span className="font-grillmaster">Guidia</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Let's get started by setting up your student profile
          </p>
        </div>

        <ProfileForm
          sections={formSections}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/')}
          initialData={initialData}
          isLoading={isLoading}
          onFieldChange={handleFieldChange}
          submitButtonText="Save & Continue"
        />
      </div>
    </div>
  );
}


