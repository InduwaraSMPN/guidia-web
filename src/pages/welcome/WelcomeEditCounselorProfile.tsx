import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RichTextEditor } from '@/components/ui/RichTextEditor';
import { FileText, Trash2, LoaderCircle } from 'lucide-react';
import { FileUploader } from '@/components/FileUploader';
import { ViewDocumentModal } from '@/components/ViewDocumentModal';
import { MultipleInput } from '@/components/ui/MultipleInput';

interface FormData {
  counselorName: string;
  position: string;
  education: string;
  contactNumber: string;
  emailMail: string;
  description: string;
  image: File | null;
  yearsOfExperience: string;
  location: string;
  languageInput: string;
  languages: string[];
}

const validatePhoneNumber = (phone: string) => {
  // Allow only digits, spaces, dashes, parentheses, and plus sign
  const phoneRegex = /^\+?[0-9]{1,4}?[-.\s]?(\(?\d{1,4}?\))?[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/;
  return phoneRegex.test(phone);
};

export function WelcomeEditCounselorProfile() {
  const { user, updateUser } = useAuth();
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);
  const [showFileUploader, setShowFileUploader] = useState(true);
  const [formData, setFormData] = useState<FormData>({
    counselorName: '',
    position: '',
    education: '',
    contactNumber: '',
    emailMail: user?.email || '',
    description: '',
    image: null,
    yearsOfExperience: '',
    location: '',
    languageInput: '',
    languages: []
  });
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.userID || !token) {
      toast.error('Please login to continue');
      return;
    }

    if (!validatePhoneNumber(formData.contactNumber)) {
      toast.error('Please enter a valid phone number');
      return;
    }

    const loadingToast = toast.loading('Creating your profile...');
    setIsLoading(true);

    try {
      // First upload the image if it exists
      let profileImagePath = '';
      if (formData.image) {
        const imageFormData = new FormData();
        imageFormData.append('image', formData.image);
        // Add type parameter for counselor profile images
        imageFormData.append('type', 'counselor-profile');

        const uploadResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: imageFormData
        });

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          throw new Error(errorData.error || 'Failed to upload profile image');
        }

        const uploadResult = await uploadResponse.json();
        profileImagePath = uploadResult.blobPath || uploadResult.imagePath;
      }

      // Prepare profile data
      const profileData = {
        counselorName: formData.counselorName,
        position: formData.position,
        education: formData.education,
        contactNumber: formData.contactNumber,
        yearsOfExperience: parseInt(formData.yearsOfExperience),
        location: formData.location,
        languages: formData.languages,
        description: formData.description,
        profileImagePath,
        userID: user.userID
      };

      // Log the profile data being sent
      console.log('Sending profile data:', profileData);
      console.log('API URL:', `${import.meta.env.VITE_API_BASE_URL}/api/counselors/profile`);

      // Send profile data to the server
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/counselors/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData),
      });

      // Log the response status
      console.log('Response status:', response.status);

      // Get the response data regardless of status
      const responseData = await response.json();
      console.log('Response data:', responseData);

      if (!response.ok) {
        throw new Error(responseData.error || responseData.message || 'Failed to create profile');
      }

      // Clean up preview URL
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      // Update the user context to set hasProfile to true
      updateUser({ hasProfile: true });
      console.log('Updated user context with hasProfile: true');

      // Dismiss loading toast and show success
      toast.dismiss(loadingToast);
      toast.success('Profile created successfully!', {
        description: 'Redirecting to the next step...',
        duration: 2000,
      });

      // Navigate after a short delay to allow the toast to be seen
      setTimeout(() => {
        navigate('/welcome/specializations');
      }, 1000);

    } catch (error) {
      console.error('Error creating profile:', error);

      // Dismiss loading toast and show error
      toast.dismiss(loadingToast);
      toast.error('Failed to create profile', {
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'contactNumber') {
      // Remove any characters that aren't digits, spaces, dashes, parentheses, or plus
      const sanitizedValue = value.replace(/[^\d\s\-()+"]/g, '');

      // Validate phone number
      if (sanitizedValue && !validatePhoneNumber(sanitizedValue)) {
        setPhoneError('Please enter a valid phone number');
      } else {
        setPhoneError(null);
      }

      setFormData(prev => ({ ...prev, [name]: sanitizedValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleEditorChange = (value: string) => {
    setFormData(prev => ({ ...prev, description: value }));
  };

  const handleRemoveImage = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setFormData(prev => ({ ...prev, image: null }));
    setPreviewUrl('');
    setShowFileUploader(true);
  };

  const handleAddLanguage = () => {
    if (!formData.languageInput.trim()) return;

    const newLanguage = formData.languageInput.trim();
    if (!formData.languages.includes(newLanguage)) {
      setFormData(prev => ({
        ...prev,
        languages: [...prev.languages, newLanguage],
        languageInput: ''
      }));
    } else {
      toast.error('Language already added');
    }
  };

  const handleRemoveLanguage = (languageToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.filter(lang => lang !== languageToRemove)
    }));
  };

  return (
    <div className="min-h-screen bg-white pt-32 px-6 lg:px-8">
      <div className="max-w-3xl mx-auto mb-16">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-brand mb-4">
            01. Welcome to <span className="font-grillmaster">Guidia</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Let's get started by setting up your counselor profile
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Counselor Name<span className="text-brand">*</span>
            </label>
            <Input
              name="counselorName"
              value={formData.counselorName}
              onChange={handleInputChange}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Position<span className="text-brand">*</span>
            </label>
            <Input
              name="position"
              value={formData.position}
              onChange={handleInputChange}
              placeholder="Enter your position"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Education<span className="text-brand">*</span>
              </label>
              <Input
                name="education"
                value={formData.education}
                onChange={handleInputChange}
                placeholder="Enter your highest education"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Contact Number<span className="text-brand">*</span>
              </label>
              <Input
                type="tel"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleInputChange}
                placeholder="Enter your contact number (e.g., +1-234-567-8900)"
                required
                className={phoneError ? 'border-red-500' : ''}
              />
              {phoneError && (
                <p className="text-sm text-red-500 mt-1">{phoneError}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Years of Experience<span className="text-brand">*</span>
              </label>
              <Input
                name="yearsOfExperience"
                type="number"
                value={formData.yearsOfExperience}
                onChange={handleInputChange}
                placeholder="Enter years of experience"
                required
                min="0"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Location<span className="text-brand">*</span>
              </label>
              <Input
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Enter your location"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Languages Spoken<span className="text-brand">*</span>
            </label>
            <MultipleInput
              items={formData.languages}
              onItemsChange={(languages) => setFormData(prev => ({ ...prev, languages }))}
              placeholder="Enter a language"
              allowDuplicates={false}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Description<span className="text-brand">*</span>
            </label>
            <RichTextEditor
              value={formData.description}
              onChange={handleEditorChange}
              placeholder="Write a brief description about yourself"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Profile Picture<span className="text-brand">*</span>
            </label>
            {showFileUploader && (
              <FileUploader
                acceptType="image"
                label="Upload Profile Picture"
                onUpload={files => {
                  if (files.length > 0) {
                    const file = files[0];
                    setFormData(prev => ({ ...prev, image: file }));
                    const url = URL.createObjectURL(file);
                    setPreviewUrl(url);
                    setShowFileUploader(false);
                  }
                }}
                selectedFile={formData.image}
              />
            )}
            {formData.image && previewUrl && (
              <div>
                <div className="relative group mt-4">
                  <img
                    src={previewUrl}
                    alt="Profile Preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded-lg">
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => setShowPreview(true)}
                        className="flex items-center gap-1"
                      >
                        <FileText className="h-4 w-4" />
                        Preview
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={handleRemoveImage}
                        className="flex items-center gap-1 bg-brand text-white hover:bg-brand-dark"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
                <span className="text-sm text-muted-foreground mt-2 block">
                  {formData.image.name}
                </span>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-4 pt-6">
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-brand text-white hover:bg-brand-dark"
            >
              Save & Continue
            </Button>
          </div>
        </form>

        {showPreview && previewUrl && (
          <ViewDocumentModal
            isOpen={true}
            documentUrl={previewUrl}
            documentName={formData.image?.name || 'Profile Picture'}
            documentType="Image"
            onClose={() => setShowPreview(false)}
          />
        )}
      </div>
    </div>
  );
}













