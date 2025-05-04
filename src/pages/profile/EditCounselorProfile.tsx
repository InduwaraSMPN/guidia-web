import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RichTextEditor } from '@/components/ui/RichTextEditor';
import { FileUploader } from '@/components/FileUploader';
import { ViewDocumentModal } from '@/components/ViewDocumentModal';
import { FileText, LoaderCircle} from 'lucide-react';
import { MultipleInput } from '@/components/ui/MultipleInput';
import { Skeleton } from '@/components/ui/skeleton';
import { AzureImage } from '@/lib/imageUtils';
import { validateEmail, validatePhoneNumber, validateText } from '@/utils/validationUtils';

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

interface FormErrors {
  counselorName?: string;
  position?: string;
  education?: string;
  contactNumber?: string;
  emailMail?: string;
  description?: string;
  image?: string;
  yearsOfExperience?: string;
  location?: string;
  languages?: string;
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
  const { userID } = useParams<{ userID: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Add this check at the beginning of the component
  if (!userID || !user) {
    navigate('/');
    return null;
  }

  const token = localStorage.getItem('token');
  const [isLoading, setIsLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
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
  const [errors, setErrors] = useState<FormErrors>({});

  // Validate all form fields
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Counselor Name validation
    if (!validateText(formData.counselorName, 2)) {
      newErrors.counselorName = "Counselor name must be at least 2 characters";
    }

    // Position validation
    if (!validateText(formData.position, 2)) {
      newErrors.position = "Position must be at least 2 characters";
    }

    // Education validation
    if (!validateText(formData.education, 2)) {
      newErrors.education = "Education must be at least 2 characters";
    }

    // Contact Number validation
    if (!validatePhoneNumber(formData.contactNumber)) {
      newErrors.contactNumber = "Please enter a valid phone number";
    }

    // Email validation
    if (!validateEmail(formData.emailMail)) {
      newErrors.emailMail = "Please enter a valid email address";
    }

    // Description validation
    if (!validateText(formData.description, 10)) {
      newErrors.description = "Description must be at least 10 characters";
    }

    // Years of Experience validation
    if (!formData.yearsOfExperience) {
      newErrors.yearsOfExperience = "Please enter years of experience";
    }

    // Location validation
    if (!validateText(formData.location, 2)) {
      newErrors.location = "Location must be at least 2 characters";
    }

    // Languages validation
    if (formData.languages.length === 0) {
      newErrors.languages = "Please add at least one language";
    }

    // Image validation
    if (!formData.image && !previewUrl) {
      newErrors.image = "Please upload a profile image";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate a specific field
  const validateField = (name: string, value: any): string | undefined => {
    switch (name) {
      case 'counselorName':
        return !validateText(value, 2)
          ? "Counselor name must be at least 2 characters"
          : undefined;

      case 'position':
        return !validateText(value, 2)
          ? "Position must be at least 2 characters"
          : undefined;

      case 'education':
        return !validateText(value, 2)
          ? "Education must be at least 2 characters"
          : undefined;

      case 'contactNumber':
        return !validatePhoneNumber(value)
          ? "Please enter a valid phone number"
          : undefined;

      case 'emailMail':
        return !validateEmail(value)
          ? "Please enter a valid email address"
          : undefined;

      case 'description':
        return !validateText(value, 10)
          ? "Description must be at least 10 characters"
          : undefined;

      case 'yearsOfExperience':
        return !value ? "Please enter years of experience" : undefined;

      case 'location':
        return !validateText(value, 2)
          ? "Location must be at least 2 characters"
          : undefined;

      default:
        return undefined;
    }
  };

  useEffect(() => {
    // Simulate loading delay
    const loadingTimer = setTimeout(() => {
      setPageLoading(false);
    }, 1000);

    const fetchCounselorData = async () => {
      if (!userID || !token) {
        console.log('Missing userID or token:', { userID, token });
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
      } finally {
        setPageLoading(false);
        clearTimeout(loadingTimer); // Clear the timer if fetch completes before timeout
      }
    };

    fetchCounselorData();

    return () => clearTimeout(loadingTimer);
  }, [userID, token, user?.email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.userID || !token) {
      toast.error('Please login to continue');
      return;
    }

    // Validate all form fields
    if (!validateForm()) {
      // Show the first error message
      const firstError = Object.values(errors).find(error => error !== undefined);
      if (firstError) {
        toast.error(firstError);
      } else {
        toast.error("Please fix the errors in the form");
      }
      return;
    }

    setIsLoading(true);

    try {
      // Use existing image path if no new image is uploaded
      let profileImagePath = previewUrl;

      // Only upload new image if one is selected
      if (formData.image) {
        const imageFormData = new FormData();
        imageFormData.append('image', formData.image);
        imageFormData.append('type', 'counselor-profile');
        imageFormData.append('userID', user.userID.toString());

        const uploadResponse = await fetch(`/api/upload`, {
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

      const response = await fetch(`/api/counselors/${userID}`, {
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

      toast.success('Profile updated successfully');
      navigate(getProfilePath(user));

    } catch (error) {
      console.error('Error updating profile:', error);
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

      setFormData(prev => ({ ...prev, [name]: sanitizedValue }));

      // Validate the field
      const error = validateField(name, sanitizedValue);
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));

      // Validate the field
      const error = validateField(name, value);
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  };

  const handleEditorChange = (value: string) => {
    setFormData(prev => ({ ...prev, description: value }));

    // Validate the description
    const error = validateField('description', value);
    setErrors(prev => ({
      ...prev,
      description: error
    }));
  };

  const handleRemoveImage = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setFormData(prev => ({ ...prev, image: null }));
    setPreviewUrl('');
    setShowFileUploader(true);

    // Set image error when removing the image
    setErrors(prev => ({
      ...prev,
      image: "Please upload a profile image"
    }));
  };





  if (pageLoading) {
    return (
      <div className="min-h-screen bg-white pt-32 px-6 lg:px-8 pb-32">
        <div className="max-w-3xl mx-auto mb-16">
          <Skeleton className="h-10 w-64 mb-8" />

          <div className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-10 w-full" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-10 w-full" />
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

            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-[160px] w-full rounded-md" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-48 w-full rounded-lg" />
            </div>

            <div className="flex justify-end gap-4">
              <Skeleton className="h-10 w-24 rounded-md" />
              <Skeleton className="h-10 w-32 rounded-md" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-32 px-6 lg:px-8 pb-32">
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
              className={errors.counselorName ? 'border-red-500' : ''}
            />
            {errors.counselorName && (
              <p className="text-sm text-red-500 mt-1">{errors.counselorName}</p>
            )}
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
              className={errors.position ? 'border-red-500' : ''}
            />
            {errors.position && (
              <p className="text-sm text-red-500 mt-1">{errors.position}</p>
            )}
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
              className={errors.education ? 'border-red-500' : ''}
            />
            {errors.education && (
              <p className="text-sm text-red-500 mt-1">{errors.education}</p>
            )}
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
                className={errors.contactNumber ? 'border-red-500' : ''}
              />
              {errors.contactNumber && (
                <p className="text-sm text-red-500 mt-1">{errors.contactNumber}</p>
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
                className={errors.emailMail ? 'border-red-500' : ''}
              />
              {errors.emailMail && (
                <p className="text-sm text-red-500 mt-1">{errors.emailMail}</p>
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
                className={errors.yearsOfExperience ? 'border-red-500' : ''}
              />
              {errors.yearsOfExperience && (
                <p className="text-sm text-red-500 mt-1">{errors.yearsOfExperience}</p>
              )}
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
                className={errors.location ? 'border-red-500' : ''}
              />
              {errors.location && (
                <p className="text-sm text-red-500 mt-1">{errors.location}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Languages<span className="text-brand">*</span>
            </label>
            <div className={errors.languages ? 'border border-red-500 rounded-md p-1' : ''}>
              <MultipleInput
                items={formData.languages}
                onItemsChange={(languages) => {
                  setFormData(prev => ({ ...prev, languages }));

                  // Validate languages
                  if (languages.length === 0) {
                    setErrors(prev => ({
                      ...prev,
                      languages: "Please add at least one language"
                    }));
                  } else {
                    setErrors(prev => ({
                      ...prev,
                      languages: undefined
                    }));
                  }
                }}
                placeholder="Enter a language"
                allowDuplicates={false}
              />
            </div>
            {errors.languages && (
              <p className="text-sm text-red-500 mt-1">{errors.languages}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Description<span className="text-brand">*</span>
            </label>
            <div className={errors.description ? 'border border-red-500 rounded-md' : ''}>
              <RichTextEditor
                value={formData.description}
                onChange={handleEditorChange}
              />
            </div>
            {errors.description && (
              <p className="text-sm text-red-500 mt-1">{errors.description}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Image<span className="text-brand">*</span>
            </label>
            {errors.image && (
              <p className="text-sm text-red-500 mt-1">{errors.image}</p>
            )}
            {showFileUploader && (
              <FileUploader
                acceptType="image"
                label="Profile Image"
                onUpload={files => {
                  if (files.length > 0) {
                    const file = files[0];

                    // Validate file type
                    if (!file.type.startsWith('image/')) {
                      setErrors(prev => ({
                        ...prev,
                        image: "Please upload an image file"
                      }));
                      return;
                    }

                    // Validate file size (5MB limit)
                    if (file.size > 5 * 1024 * 1024) {
                      setErrors(prev => ({
                        ...prev,
                        image: "Please upload a file smaller than 5MB"
                      }));
                      return;
                    }

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

                    // Clear image error
                    setErrors(prev => ({
                      ...prev,
                      image: undefined
                    }));
                  }
                }}
                selectedFile={formData.image}
              />
            )}
            {previewUrl && (
              <div>
                <div className="relative group mt-4">
                  <AzureImage
                    src={previewUrl}
                    alt="Profile Preview"
                    className="w-full h-48 object-cover rounded-lg"
                    userType="counselor"
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


