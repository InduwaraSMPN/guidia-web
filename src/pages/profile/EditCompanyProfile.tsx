import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RichTextEditor } from '@/components/ui/RichTextEditor';
import { FileUploader } from '@/components/FileUploader';
import { ViewDocumentModal } from '@/components/ViewDocumentModal';
import { FileText } from 'lucide-react';
import CountrySelect from "@/components/ui/CountrySelect";
import { Skeleton } from '@/components/ui/skeleton';
import { validateEmail, validatePhoneNumber, validateText, validateWebsite } from '@/utils/validationUtils';

interface FormData {
  companyName: string;
  country: string;
  city: string;
  website: string;
  contactNumber: string;
  companyEmail: string;
  description: string;
  image: File | null;
}

interface FormErrors {
  companyName?: string;
  country?: string;
  city?: string;
  website?: string;
  contactNumber?: string;
  companyEmail?: string;
  description?: string;
  image?: string;
}

export function EditCompanyProfile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const token = localStorage.getItem('token');
  const [isLoading, setIsLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(true);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [showFileUploader, setShowFileUploader] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    companyName: '',
    country: '',
    city: '',
    website: '',
    contactNumber: '',
    companyEmail: '',
    description: '',
    image: null,
  });
  const [errors, setErrors] = useState<FormErrors>({});

  // Validate all form fields
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Company Name validation
    if (!validateText(formData.companyName, 2)) {
      newErrors.companyName = "Company name must be at least 2 characters";
    }

    // Country validation
    if (!formData.country) {
      newErrors.country = "Please select a country";
    }

    // City validation
    if (!validateText(formData.city, 2)) {
      newErrors.city = "City must be at least 2 characters";
    }

    // Website validation
    if (!validateWebsite(formData.website)) {
      newErrors.website = "Please enter a valid website URL";
    }

    // Contact Number validation
    if (!validatePhoneNumber(formData.contactNumber)) {
      newErrors.contactNumber = "Please enter a valid phone number";
    }

    // Email validation
    if (!validateEmail(formData.companyEmail)) {
      newErrors.companyEmail = "Please enter a valid email address";
    }

    // Description validation
    if (!validateText(formData.description, 10)) {
      newErrors.description = "Description must be at least 10 characters";
    }

    // Image validation
    if (!formData.image && !previewUrl) {
      newErrors.image = "Please upload a company logo";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate a specific field
  const validateField = (name: string, value: any): string | undefined => {
    switch (name) {
      case 'companyName':
        return !validateText(value, 2)
          ? "Company name must be at least 2 characters"
          : undefined;

      case 'city':
        return !validateText(value, 2)
          ? "City must be at least 2 characters"
          : undefined;

      case 'website':
        return !validateWebsite(value)
          ? "Please enter a valid website URL"
          : undefined;

      case 'contactNumber':
        return !validatePhoneNumber(value)
          ? "Please enter a valid phone number"
          : undefined;

      case 'companyEmail':
        return !validateEmail(value)
          ? "Please enter a valid email address"
          : undefined;

      case 'description':
        return !validateText(value, 10)
          ? "Description must be at least 10 characters"
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

    const loadProfileData = async () => {
      if (!token || !user?.userID) {
        toast.error('Please login to continue');
        navigate('/auth/login');
        setPageLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/companies/profile/${user.userID}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        setFormData({
          companyName: data.companyName || '',
          country: data.companyCountry || '',
          city: data.companyCity || '',
          website: data.companyWebsite || '',
          contactNumber: data.companyContactNumber || '',
          companyEmail: data.companyEmail || '',
          description: data.companyDescription || '',
          image: null,
        });

        // Updated logo handling
        if (data.companyLogoPath) {
          // Check if the path is a full URL or a relative path
          const logoUrl = data.companyLogoPath.startsWith('http')
            ? data.companyLogoPath
            : `${import.meta.env.VITE_API_BASE_URL}${data.companyLogoPath}`;

          setPreviewUrl(logoUrl);
          setShowFileUploader(false);
        } else {
          setShowFileUploader(true);
        }

      } catch (error) {
        console.error('Error loading company profile:', error);
        toast.error('Failed to load company data');
      } finally {
        setIsLoading(false);
        setPageLoading(false);
        clearTimeout(loadingTimer); // Clear the timer if fetch completes before timeout
      }
    };

    loadProfileData();

    return () => clearTimeout(loadingTimer);
  }, [token, user, navigate]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // Sanitize input for specific fields
    let sanitizedValue = value;
    if (name === 'contactNumber') {
      sanitizedValue = value.replace(/[^\d\s\-()+"]/g, '');
    }

    setFormData(prev => ({
      ...prev,
      [name]: sanitizedValue
    }));

    // Validate the field
    const error = validateField(name, sanitizedValue);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleEditorChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      description: value
    }));

    // Validate the description
    const error = validateField('description', value);
    setErrors(prev => ({
      ...prev,
      description: error
    }));
  };

  const handleRemoveImage = () => {
    // Clean up any existing object URL
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl('');
    setFormData(prev => ({
      ...prev,
      image: null
    }));
    setShowFileUploader(true);

    // Set image error when removing the image
    setErrors(prev => ({
      ...prev,
      image: "Please upload a company logo"
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token || !user?.userID) {
      toast.error('Please login to update profile');
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
      let logoPath = previewUrl;

      if (formData.image) {
        const imageFormData = new FormData();
        imageFormData.append('image', formData.image); // Changed from 'file' to 'image' to match other components
        imageFormData.append('type', 'company-profile'); // Changed from 'company-logo' to 'company-profile' to match the expected format
        imageFormData.append('userID', user.userID.toString());

        const uploadResponse = await fetch(`/api/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: imageFormData,
        });

        if (!uploadResponse.ok) {
          const uploadError = await uploadResponse.json();
          throw new Error(`Failed to upload logo: ${uploadError.message || uploadResponse.statusText}`);
        }

        const uploadResult = await uploadResponse.json();
        logoPath = uploadResult.filePath;
      }

      // Prepare profile data - ensure country is properly formatted
      const profileData = {
        companyName: formData.companyName,
        companyCountry: formData.country, // This is now the country name from CountrySelect
        companyCity: formData.city,
        companyWebsite: formData.website,
        companyContactNumber: formData.contactNumber,
        companyEmail: formData.companyEmail,
        companyDescription: formData.description,
        companyLogoPath: logoPath,
      };

      console.log('Sending profile update with data:', profileData);

      const response = await fetch(
        `/api/companies/profile/${user.userID}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(profileData),
        }
      );

      const responseData = await response.json();
      console.log('Server response:', responseData);

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to update profile');
      }

      toast.success('Profile updated successfully');
      navigate(`/company/profile/${user.userID}`);

    } catch (error) {
      console.error('Error updating profile:', error);
      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to update profile. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>

              <div className="space-y-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>

              <div className="space-y-2">
                <Skeleton className="h-5 w-24" />
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
              Company Name<span className="text-brand">*</span>
            </label>
            <Input
              name="companyName"
              value={formData.companyName}
              onChange={handleInputChange}
              required
              className={errors.companyName ? 'border-red-500' : ''}
            />
            {errors.companyName && (
              <p className="text-sm text-red-500 mt-1">{errors.companyName}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Country<span className="text-brand">*</span>
              </label>
              <div className={errors.country ? 'border border-red-500 rounded-md p-1' : ''}>
                <CountrySelect
                  onCountryChange={(country) => {
                    if (country) {
                      setFormData(prev => ({
                        ...prev,
                        country: country.name.common // Store just the country name
                      }));

                      // Clear country error
                      setErrors(prev => ({
                        ...prev,
                        country: undefined
                      }));
                    }
                  }}
                  placeholder={formData.country || "Select a country"}
                />
              </div>
              {errors.country && (
                <p className="text-sm text-red-500 mt-1">{errors.country}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                City<span className="text-brand">*</span>
              </label>
              <Input
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                placeholder="Enter city"
                required
                className={errors.city ? 'border-red-500' : ''}
              />
              {errors.city && (
                <p className="text-sm text-red-500 mt-1">{errors.city}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Website<span className="text-brand">*</span>
              </label>
              <Input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                required
                className={errors.website ? 'border-red-500' : ''}
              />
              {errors.website && (
                <p className="text-sm text-red-500 mt-1">{errors.website}</p>
              )}
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
                required
                className={errors.contactNumber ? 'border-red-500' : ''}
              />
              {errors.contactNumber && (
                <p className="text-sm text-red-500 mt-1">{errors.contactNumber}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Company email<span className="text-brand">*</span>
            </label>
            <Input
              type="email"
              name="companyEmail"
              value={formData.companyEmail}
              onChange={handleInputChange}
              required
              className={errors.companyEmail ? 'border-red-500' : ''}
            />
            {errors.companyEmail && (
              <p className="text-sm text-red-500 mt-1">{errors.companyEmail}</p>
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
                placeholder="Enter company description"
                className="min-h-[160px]"
              />
            </div>
            {errors.description && (
              <p className="text-sm text-red-500 mt-1">{errors.description}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Company Logo<span className="text-brand">*</span>
            </label>
            {errors.image && (
              <p className="text-sm text-red-500 mt-1">{errors.image}</p>
            )}
            {showFileUploader && (
              <FileUploader
                acceptType="image"
                label="Company Logo"
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
                  <img
                    src={previewUrl}
                    alt="Company Logo Preview"
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
                  {formData.image?.name || (previewUrl && previewUrl.split('/').pop()) || 'Company Logo'}
                </span>
              </div>
            )}
            {showPreview && previewUrl && (
              <ViewDocumentModal
                isOpen={true}
                documentUrl={previewUrl}
                documentName={formData.image?.name || 'Company Logo'}
                documentType="Image"
                onClose={() => setShowPreview(false)}
              />
            )}
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/company/profile/${user?.userID}`)}
            >
              Cancel
            </Button>
            <Button type="submit">
              Save Changes
            </Button>
          </div>
        </form>

        {showPreview && previewUrl && (
          <ViewDocumentModal
            isOpen={true}
            documentUrl={previewUrl}
            documentName="Company Logo"
            documentType="Image"
            onClose={() => setShowPreview(false)}
          />
        )}
      </div>
    </div>
  );
}


