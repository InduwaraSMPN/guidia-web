import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { ProfileSection } from '@/interfaces/Profile';

export function WelcomeEditStudentProfile() {
  const navigate = useNavigate();
  const { user, isVerifyingToken } = useAuth();
  const token = localStorage.getItem('token');
  const [isLoading, setIsLoading] = useState(false);
  const [initialData, setInitialData] = useState<Record<string, any>>({});
  const [selectedStudyLevel, setSelectedStudyLevel] = useState<string | null>(null);

  // Verify authentication
  useEffect(() => {
    if (!isVerifyingToken && (!token || !user)) {
      toast.error('Please login to continue');
      navigate('/auth/login');
    }
  }, [token, user, isVerifyingToken, navigate]);

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
      { value: 'Postgraduate Certificate (PGCert) / Postgraduate Diploma (PGDip)', label: 'PGCert / PGDip' },
      { value: 'Master of Science (MSc) / Master of Arts (MA)', label: 'MSc / MA' },
      { value: 'Master of Philosophy (MPhil) / Doctor of Medicine (DM)', label: 'MPhil / DM' },
      { value: 'Doctor of Philosophy (PhD)', label: 'PhD' }
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
          required: true
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
          placeholder: 'Share a brief introduction about yourself...'
        },
        {
          name: 'image',
          label: 'Profile Picture',
          type: 'file',
          required: true,
          options: [{ value: 'image', label: 'Image files' }]
        }
      ]
    }
  ];

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

    try {
      setIsLoading(true);
      let profileImagePath = null;
      
      if (formData.image instanceof File) {
        const imageFormData = new FormData();
        imageFormData.append('image', formData.image);
        imageFormData.append('type', 'student-profile');

        const uploadResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/upload`, {
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
      
      console.log('Submitting profile data:', { profileData, user });
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/students/profile`, {
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

      const responseData = await response.json();
      console.log('Profile update successful:', responseData);
      
      toast.success(responseData.message || 'Profile created successfully!');
      navigate('/welcome/career');
    } catch (error) {
      console.error('Error updating profile:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create profile';
      toast.error(errorMessage);

      if (error instanceof Error && error.message.includes('Token')) {
        localStorage.removeItem('token');
        navigate('/auth/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white pt-32 px-6 lg:px-8">
      <div className="max-w-3xl mx-auto mb-16">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-[#800020] mb-4">
            01. Welcome to <span className="font-grillmaster">Guidia</span>
          </h1>
          <p className="text-lg text-gray-600">
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
