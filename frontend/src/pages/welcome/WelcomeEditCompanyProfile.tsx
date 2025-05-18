import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { FileText } from "lucide-react";
import { FileUploader } from "@/components/FileUploader";
import { ViewDocumentModal } from "@/components/ViewDocumentModal";
import CountrySelect from "@/components/ui/CountrySelect";

interface FormData {
  companyName: string;
  country: string;
  city: string;
  website: string;
  contactNumber: string;
  companyEmail: string;
  description: string;
  companyType: string;
  image: File | null;
}

interface FieldState {
  error?: string;
  isValid?: boolean;
}

interface FormErrors {
  companyName?: FieldState;
  country?: FieldState;
  city?: FieldState;
  website?: FieldState;
  contactNumber?: FieldState;
  companyEmail?: FieldState;
  description?: FieldState;
  companyType?: FieldState;
  image?: FieldState;
}

export function WelcomeEditCompanyProfile() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [showPreview, setShowPreview] = useState(false);
  const [showFileUploader, setShowFileUploader] = useState(true);
  const [formData, setFormData] = useState<FormData>({
    companyName: "",
    country: "",
    city: "",
    website: "",
    contactNumber: "",
    companyEmail: user?.email || "",
    description: "",
    companyType: "",
    image: null,
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Company Name validation
    if (!formData.companyName.trim()) {
      newErrors.companyName = { error: 'Company name is required' };
    } else if (formData.companyName.length < 2) {
      newErrors.companyName = { error: 'Company name must be at least 2 characters' };
    } else {
      newErrors.companyName = { isValid: true };
    }

    // Country validation
    if (!formData.country.trim()) {
      newErrors.country = { error: 'Country is required' };
    } else {
      newErrors.country = { isValid: true };
    }

    // City validation
    if (!formData.city.trim()) {
      newErrors.city = { error: 'City is required' };
    } else {
      newErrors.city = { isValid: true };
    }

    // Website validation
    const websiteRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
    if (!formData.website.trim()) {
      newErrors.website = { error: 'Website is required' };
    } else if (!websiteRegex.test(formData.website)) {
      newErrors.website = { error: 'Please enter a valid website URL' };
    } else {
      newErrors.website = { isValid: true };
    }

    // Contact Number validation
    const phoneRegex = /^\+?(\d{1,4}([ -])?)?(\d{2,4}([ -])?)?(\d{3,4}([ -])?)?(\d{3,4})$/;
    if (!formData.contactNumber.trim()) {
      newErrors.contactNumber = { error: 'Contact number is required' };
    } else if (!phoneRegex.test(formData.contactNumber)) {
      newErrors.contactNumber = { error: 'Please enter a valid contact number' };
    } else {
      newErrors.contactNumber = { isValid: true };
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.companyEmail.trim()) {
      newErrors.companyEmail = { error: 'Email is required' };
    } else if (!emailRegex.test(formData.companyEmail)) {
      newErrors.companyEmail = { error: 'Please enter a valid email address' };
    } else {
      newErrors.companyEmail = { isValid: true };
    }

    // Description validation
    if (!formData.description.trim()) {
      newErrors.description = { error: 'Description is required' };
    } else if (formData.description.length < 50) {
      newErrors.description = { error: 'Description must be at least 50 characters' };
    } else {
      newErrors.description = { isValid: true };
    }

    setErrors(newErrors);
    // Fix TypeScript error by using type assertion
    return Object.keys(newErrors).every(key => {
      const field = newErrors[key as keyof FormErrors];
      return field && !field.error;
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === 'contactNumber') {
      // Allow only numbers, spaces, plus sign, and hyphens
      const sanitizedValue = value.replace(/[^\d\s+-]/g, '');
      setFormData((prev) => ({
        ...prev,
        [name]: sanitizedValue,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Validate the specific field that changed
    validateField(name, value);
  };

  const validateField = (name: string, value: string) => {
    const newErrors = { ...errors };

    switch (name) {
      case 'companyName':
        if (!value.trim()) {
          newErrors.companyName = { error: 'Company name is required' };
        } else if (value.length < 2) {
          newErrors.companyName = { error: 'Company name must be at least 2 characters' };
        } else {
          newErrors.companyName = { isValid: true };
        }
        break;

      case 'website':
        const websiteRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
        if (!value.trim()) {
          newErrors.website = { error: 'Website is required' };
        } else if (!websiteRegex.test(value)) {
          newErrors.website = { error: 'Please enter a valid website URL' };
        } else {
          newErrors.website = { isValid: true };
        }
        break;

      case 'contactNumber':
        const phoneRegex = /^\+?(\d{1,4}([ -])?)?(\d{2,4}([ -])?)?(\d{3,4}([ -])?)?(\d{3,4})$/;
        if (!value.trim()) {
          newErrors.contactNumber = { error: 'Contact number is required' };
        } else if (!phoneRegex.test(value.trim())) {
          newErrors.contactNumber = { error: 'Please enter a valid contact number' };
        } else {
          newErrors.contactNumber = { isValid: true };
        }
        break;

      case 'companyEmail':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value.trim()) {
          newErrors.companyEmail = { error: 'Email is required' };
        } else if (!emailRegex.test(value)) {
          newErrors.companyEmail = { error: 'Please enter a valid email address' };
        } else {
          newErrors.companyEmail = { isValid: true };
        }
        break;

      case 'country':
        if (!value.trim()) {
          newErrors.country = { error: 'Country is required' };
        } else {
          newErrors.country = { isValid: true };
        }
        break;

      case 'city':
        if (!value.trim()) {
          newErrors.city = { error: 'City is required' };
        } else {
          newErrors.city = { isValid: true };
        }
        break;
    }

    setErrors(newErrors);
  };

  const handleEditorChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      description: value,
    }));

    // Validate description
    const newErrors = { ...errors };
    if (!value.trim()) {
      newErrors.description = { error: 'Description is required' };
    } else if (value.length < 50) {
      newErrors.description = { error: 'Description must be at least 50 characters' };
    } else {
      newErrors.description = { isValid: true };
    }
    setErrors(newErrors);
  };

  const handleRemoveImage = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl("");
    }
    setFormData((prev) => ({
      ...prev,
      image: null,
    }));
    setShowFileUploader(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsLoading(true);

    if (!token) {
      toast.error('Please login to create profile');
      navigate('/auth/login');
      return;
    }

    // Validate required fields
    if (!formData.companyName || !formData.country || !formData.city ||
        !formData.website || !formData.contactNumber || !formData.companyEmail ||
        !formData.description || (!formData.image && !previewUrl)) {
      toast.error('Please fill in all required fields and upload a company logo');
      setIsLoading(false);
      return;
    }

    try {
      let profileImagePath = previewUrl || '';

      // Handle file upload first if there's a new image
      if (formData.image instanceof File && formData.image.size > 0) {
        const imageFormData = new FormData();
        imageFormData.append('image', formData.image);
        imageFormData.append('type', 'company-profile');
        imageFormData.append('userID', user?.userID?.toString() || '');

        const uploadResponse = await fetch(`/api/upload`, {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          method: 'POST',
          body: imageFormData,
        });

        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text();
          console.error('Upload response:', errorText);
          throw new Error('Failed to upload image');
        }

        const uploadResult = await uploadResponse.json();
        profileImagePath = uploadResult.imagePath;
      }

      // Now create/update the company profile
      const profileData = {
        userID: user?.userID, // Include userID in the request body
        companyName: formData.companyName,
        companyCountry: formData.country,
        companyCity: formData.city,
        companyWebsite: formData.website,
        companyContactNumber: formData.contactNumber,
        companyEmail: formData.companyEmail,
        companyDescription: formData.description,
        companyType: formData.companyType,
        companyLogoPath: profileImagePath
      };

      console.log('Sending profile data:', profileData);

      // Add this console.log before sending the request
      console.log('Profile data being sent:', {
        token,
        userId: user?.userID,
        profileData
      });

      // Log the API URL for debugging
      const apiUrl = `/api/companies/profile`;
      console.log('API URL being called:', apiUrl);

      const response = await fetch(
        apiUrl,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(profileData)
        }
      );

      // Add error handling detail
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server error details:', errorData);
        throw new Error(errorData.error || errorData.message || 'Failed to create profile');
      }

      const responseData = await response.json();
      console.log('Server response:', responseData);

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to create profile');
      }

      // Clean up preview URL if it exists
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }

      // Update the user context to set hasProfile to true
      if (updateUser) {
        updateUser({ hasProfile: true });
        console.log('Updated user context with hasProfile: true');
      }

      toast.success("Profile created successfully!");
      navigate(`/company/profile/${user?.userID}`);
    } catch (error) {
      console.error("Error creating profile:", error);
      const errorMessage = error instanceof Error
        ? error.message
        : "Failed to create profile. Please try again.";
      toast.error(errorMessage);

      if (error instanceof Error && error.message.includes('Token')) {
        localStorage.removeItem('token');
        navigate('/auth/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const newErrors = { ...errors };
    if (formData.image || previewUrl) {
      newErrors.image = { isValid: true };
    }
    setErrors(newErrors);
  }, [formData.image, previewUrl]);

  return (
    <div className="min-h-screen bg-white pt-32 px-6 lg:px-8 pb-32">
      <div className="max-w-3xl mx-auto mb-16">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-brand mb-4">
            Welcome to <span className="font-grillmaster">Guidia</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Let's get started by setting up your company profile
          </p>
        </div>

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
              error={!!errors.companyName?.error}
              success={errors.companyName?.isValid}
            />
            {errors.companyName?.error && (
              <p className="text-red-500 text-sm mt-1">{errors.companyName.error}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Country<span className="text-brand">*</span>
              </label>
              <CountrySelect
                onCountryChange={(country) => {
                  if (country) {
                    const countryName = country.name.common;
                    setFormData(prev => ({
                      ...prev,
                      country: countryName
                    }));
                    validateField('country', countryName);
                  }
                }}
                placeholder="Select a country"
                // error and success props removed as they're not in the component props
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                City<span className="text-brand">*</span>
              </label>
              <Input
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                required
                error={!!errors.city?.error}
                success={errors.city?.isValid}
              />
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
                error={!!errors.website?.error}
                success={errors.website?.isValid}
              />
              {errors.website?.error && (
                <p className="text-red-500 text-sm mt-1">{errors.website.error}</p>
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
                error={!!errors.contactNumber?.error}
                success={errors.contactNumber?.isValid}
              />
              {errors.contactNumber?.error && (
                <p className="text-red-500 text-sm mt-1">{errors.contactNumber.error}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Company Email<span className="text-brand">*</span>
            </label>
            <Input
              type="email"
              name="companyEmail"
              value={formData.companyEmail}
              onChange={handleInputChange}
              required
              error={!!errors.companyEmail?.error}
              success={errors.companyEmail?.isValid}
            />
            {errors.companyEmail?.error && (
              <p className="text-red-500 text-sm mt-1">{errors.companyEmail.error}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Company Type
            </label>
            <Input
              name="companyType"
              value={formData.companyType}
              onChange={handleInputChange}
              placeholder="e.g. Technology, Healthcare, Finance, etc."
              error={!!errors.companyType?.error}
              success={errors.companyType?.isValid}
            />
            {errors.companyType?.error && (
              <p className="text-red-500 text-sm mt-1">{errors.companyType.error}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Description<span className="text-brand">*</span>
            </label>
            <RichTextEditor
              value={formData.description}
              onChange={handleEditorChange}
              placeholder="Enter company description"
              className="min-h-[160px]"
              // error and success props removed as they're not in the component props
            />
            {errors.description?.error && (
              <p className="text-red-500 text-sm mt-1">{errors.description.error}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Company Logo<span className="text-brand">*</span>
            </label>
            {showFileUploader && (
              <FileUploader
                acceptType="image"
                label="Upload Logo"
                onUpload={(files) => {
                  if (files.length > 0) {
                    const file = files[0];
                    setFormData((prev) => ({ ...prev, image: file }));
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
              </div>
            )}
          </div>

          <div className="flex justify-end gap-4 pt-6">
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-brand text-white hover:bg-brand-dark"
            >
              {isLoading ? "Saving..." : "Continue to Profile"}
            </Button>
          </div>
        </form>

        {showPreview && previewUrl && (
          <ViewDocumentModal
            isOpen={true}
            documentUrl={previewUrl}
            documentName={formData.image?.name || "Company Logo"}
            documentType="Image"
            onClose={() => setShowPreview(false)}
          />
        )}
      </div>
    </div>
  );
}


