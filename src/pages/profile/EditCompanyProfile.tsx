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

export function EditCompanyProfile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const token = localStorage.getItem('token');
  const [isLoading, setIsLoading] = useState(true);
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

  useEffect(() => {
    const loadProfileData = async () => {
      if (!token || !user?.userID) {
        toast.error('Please login to continue');
        navigate('/auth/login');
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
      }
    };

    loadProfileData();
  }, [token, user, navigate]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditorChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      description: value
    }));
  };

  const handleFileUpload = (file: File) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      toast.error('File size should be less than 5MB');
      return;
    }

    setFormData(prev => ({
      ...prev,
      image: file
    }));

    // Create and set preview URL
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setShowFileUploader(false);
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token || !user?.userID) {
      toast.error('Please login to update profile');
      return;
    }

    // Validate required fields
    if (!formData.country) {
      toast.error('Please select a country');
      return;
    }

    setIsLoading(true);

    try {
      let logoPath = previewUrl;
      
      if (formData.image) {
        const imageFormData = new FormData();
        imageFormData.append('file', formData.image);
        imageFormData.append('type', 'company-logo');

        const uploadResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/upload`, {
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
        `${import.meta.env.VITE_API_BASE_URL}/api/companies/profile/${user.userID}`,
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

  return (
    <div className="min-h-screen bg-white pt-32 px-6 lg:px-8">
      <div className="max-w-3xl mx-auto mb-16">
        <h1 className="text-3xl font-bold text-brand mb-8">
          Edit Company Profile
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
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Country<span className="text-brand">*</span>
              </label>
              <CountrySelect
                onCountryChange={(country) => {
                  if (country) {
                    setFormData(prev => ({
                      ...prev,
                      country: country.name.common // Store just the country name
                    }));
                  }
                }}
                placeholder={formData.country || "Select a country"}
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
                placeholder="Enter city"
                required
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
                required
              />
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
            />
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
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Company Logo<span className="text-brand">*</span>
            </label>
            {showFileUploader && (
              <FileUploader
                acceptType="image"
                label="Company Logo"
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


