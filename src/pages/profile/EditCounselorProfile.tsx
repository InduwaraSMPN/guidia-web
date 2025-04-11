import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RichTextEditor } from '@/components/ui/RichTextEditor';
import { FileUploader } from '@/components/FileUploader';
import { ViewDocumentModal } from '@/components/ViewDocumentModal';
import { FileText, Trash2, LoaderCircle, X, Plus } from 'lucide-react';
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
  languages: string[];
  languageInput: string;
}

const getProfilePath = (user: any) => {
  if (!user) return '';
  switch (user.userType) {
    case 'Student':
      return `/students/profile/${user.userID}`;
    case 'Company':
      return `/company/profile/${user.userID}`;
    case 'Counselor':
      return `/counselor/profile/${user.userID}`; // Match the format
    case 'Admin':
      return `/admin`;
    default:
      return '';
  }
};

export function EditCounselorProfile() {
  const validatePhoneNumber = (phone: string) => {
    // Allow only digits, spaces, dashes, parentheses, and plus sign
    const phoneRegex = /^\+?[0-9]{1,4}?[-.\s]?(\(?\d{1,4}?\))?[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/;
    return phoneRegex.test(phone);
  };

  const { userID } = useParams<{ userID: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [phoneError, setPhoneError] = useState<string | null>(null);
  
  // Add this check at the beginning of the component
  if (!userID || !user) {
    navigate('/');
    return null;
  }

  const token = localStorage.getItem('token');
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
    languages: [],
    languageInput: ''
  });

  useEffect(() => {
    const fetchCounselorData = async () => {
      if (!userID || !token) {
        console.log('Missing userID or token:', { userID, token });
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
        setFormData({
          counselorName: data.counselorName || '',
          position: data.counselorPosition || '',
          education: data.counselorEducation || '',
          contactNumber: data.counselorContactNumber || '',
          emailMail: data.counselorEmail || user?.email || '',
          description: data.counselorDescription || '',
          image: null,
          yearsOfExperience: data.counselorExperienceYears?.toString() || '',
          location: data.counselorLocation || '',
          languages: data.counselorLanguages || [],
          languageInput: ''
        });

        // Set the preview URL if there's an existing profile image
        if (data.counselorProfileImagePath) {
          setPreviewUrl(data.counselorProfileImagePath);
          setShowFileUploader(false);
        }
      } catch (error) {
        console.error('Error fetching counselor data:', error);
        toast.error('Failed to load counselor profile');
      }
    };

    fetchCounselorData();
  }, [userID, token, user?.email]);

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

    const loadingToast = toast.loading('Updating your profile...');
    setIsLoading(true);
    
    try {
      // Use existing image path if no new image is uploaded
      let profileImagePath = previewUrl;
      
      // Only upload new image if one is selected
      if (formData.image) {
        const imageFormData = new FormData();
        imageFormData.append('image', formData.image);
        imageFormData.append('type', 'counselor-profile');
        
        const uploadResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: imageFormData
        });

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload profile image');
        }

        const uploadResult = await uploadResponse.json();
        profileImagePath = uploadResult.blobPath || uploadResult.imagePath;
      }

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

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/counselors/${userID}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }

      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }

      toast.dismiss(loadingToast);
      toast.success('Profile updated successfully');
      navigate(getProfilePath(user));

    } catch (error) {
      console.error('Error updating profile:', error);
      toast.dismiss(loadingToast);
      toast.error(error instanceof Error ? error.message : 'Failed to update profile');
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
    if (formData.languageInput.trim() !== '') {
      setFormData(prev => ({
        ...prev,
        languages: [...prev.languages, prev.languageInput],
        languageInput: ''
      }));
    }
  };

  const handleRemoveLanguage = (language: string) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.filter(l => l !== language)
    }));
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddLanguage();
    }
  };

  return (
    <div className="min-h-screen bg-white pt-32 px-6 lg:px-8">
      <div className="max-w-3xl mx-auto mb-16">
        <h1 className="text-3xl font-bold text-brand mb-8">
          Edit Profile
        </h1>

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

          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Education<span className="text-brand">*</span>
            </label>
            <Input
              name="education"
              value={formData.education}
              onChange={handleInputChange}
              placeholder="Enter your education"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Contact Number<span className="text-brand">*</span>
              </label>
              <Input
                type="tel"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleInputChange}
                placeholder="Enter your phone (e.g., +1-234-567-8900)"
                required
                className={phoneError ? 'border-red-500' : ''}
              />
              {phoneError && (
                <p className="text-sm text-red-500 mt-1">{phoneError}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Email<span className="text-brand">*</span>
              </label>
              <Input
                name="emailMail"
                value={formData.emailMail}
                onChange={handleInputChange}
                placeholder="Enter email"
                required
                type="email"
              />
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
              Languages<span className="text-brand">*</span>
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
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Image<span className="text-brand">*</span>
            </label>
            {showFileUploader && (
              <FileUploader
                acceptType="image"
                label="Profile Image"
                onUpload={files => {
                  if (files.length > 0) {
                    const file = files[0];
                    console.log('Selected file:', { 
                      name: file.name, 
                      size: file.size, 
                      type: file.type 
                    });
                    setFormData(prev => ({ ...prev, image: file }));
                    const url = URL.createObjectURL(file);
                    console.log('Created preview URL:', url);
                    setPreviewUrl(url);
                    setShowFileUploader(false);
                  }
                }}
                selectedFile={formData.image}
              />
            )}
            {previewUrl && (
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
                  {formData.image?.name || (previewUrl && previewUrl.split('/').pop()) || 'Profile Picture'}
                </span>
              </div>
            )}
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

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(getProfilePath(user))}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-brand text-white hover:bg-brand-dark"
            >
              {isLoading ? (
                <>
                  <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />
                  Updating Profile...
                </>
              ) : (
                'Save Changes'
              )}
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


