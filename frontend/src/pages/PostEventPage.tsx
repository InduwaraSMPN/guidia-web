import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { FileUploader } from '../components/FileUploader';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { FileText } from 'lucide-react';
import { ViewDocumentModal } from '../components/ViewDocumentModal';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

interface FormData {
  title: string;
  eventDate: string;
  image: File | null;
}

export function PostEventPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const [formData, setFormData] = useState<FormData>({
    title: '',
    eventDate: new Date().toISOString().split('T')[0],
    image: null,
  });
  const [existingImageUrl, setExistingImageUrl] = useState<string>('');
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);
  const [showFileUploader, setShowFileUploader] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading delay
    const loadingTimer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    if (id) {
      // Fetch existing event data for editing
      const fetchEventData = async () => {
        try {
          const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/events/${id}`);
          if (!response.ok) {
            throw new Error(`Failed to fetch event: ${response.status}`);
          }
          const eventData = await response.json();

          setFormData({
            title: eventData.title,
            eventDate: new Date(eventData.eventDate).toISOString().split('T')[0],
            image: null,
          });

          if (eventData.imageURL) {
            setExistingImageUrl(eventData.imageURL);
            setPreviewUrl(eventData.imageURL);
            setShowFileUploader(false);
          }
        } catch (error) {
          console.error('Error fetching event:', error);
          toast.error('Failed to fetch event data');
        } finally {
          setLoading(false);
          clearTimeout(loadingTimer); // Clear the timer if fetch completes before timeout
        }
      };
      fetchEventData();
    }

    return () => clearTimeout(loadingTimer);
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRemoveImage = () => {
    // Clean up preview URL if it's from a local file
    if (previewUrl && previewUrl !== existingImageUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    // Reset form data
    setFormData(prev => ({
      ...prev,
      image: null
    }));

    // Clear existing image reference
    setExistingImageUrl('');
    setPreviewUrl('');

    // Show file uploader again
    setShowFileUploader(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!formData.image && !existingImageUrl) {
        toast.error('Please upload an event image');
        return;
      }

      let imageURL = existingImageUrl;
      let imagePath = '';

      // Upload new image if provided
      if (formData.image) {
        const imageFormData = new FormData();
        imageFormData.append('image', formData.image);
        imageFormData.append('type', 'event');

        try {
          // Get token from localStorage
          const token = localStorage.getItem('token');

          const uploadResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/upload`, {
            method: 'POST',
            headers: {
              'Authorization': token ? `Bearer ${token}` : ''
            },
            body: imageFormData,
          });

          if (!uploadResponse.ok) {
            const errorData = await uploadResponse.text();
            console.error('Upload response error:', {
              status: uploadResponse.status,
              statusText: uploadResponse.statusText,
              errorData
            });
            throw new Error(`Failed to upload image: ${uploadResponse.status} ${uploadResponse.statusText}`);
          }

          const uploadResult = await uploadResponse.json();
          imageURL = uploadResult.imageURL;
          imagePath = uploadResult.imagePath;

          console.log('Upload successful:', uploadResult);
        } catch (uploadError: any) {
          console.error('Image upload error:', uploadError);
          throw new Error(`Image upload failed: ${uploadError.message || 'Unknown error'}`);
        }
      }

      // Create or update event
      const method = id ? 'PUT' : 'POST';
      const url = id
        ? `${import.meta.env.VITE_API_BASE_URL}/api/events/${id}`
        : `${import.meta.env.VITE_API_BASE_URL}/api/events`;

      // Get token from localStorage
      const token = localStorage.getItem('token');

      const eventResponse = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          title: formData.title,
          eventDate: formData.eventDate,
          imageURL: imageURL,
          ...(imagePath ? { imagePath } : {})
        }),
      });

      if (!eventResponse.ok) {
        const errorData = await eventResponse.text();
        console.error('Event response error:', {
          status: eventResponse.status,
          statusText: eventResponse.statusText,
          errorData
        });
        throw new Error(`${id ? 'Failed to update event' : 'Failed to create event'}: ${eventResponse.status} ${eventResponse.statusText}`);
      }

      // Clean up preview URL if it's from a local file
      if (previewUrl && previewUrl !== existingImageUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      toast.success(id ? 'Event updated successfully' : 'Event created successfully');

      // Determine where to navigate based on current path
      const isAdminRoute = location.pathname.startsWith('/admin');
      navigate(isAdminRoute ? '/admin/events' : '/events');
    } catch (error: any) {
      console.error('Error creating/updating event:', error);
      toast.error(error.message || (id ? 'Failed to update event' : 'Failed to create event'));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-32 px-6 lg:px-8 pb-32">
        <div className="max-w-3xl mx-auto">
          <Skeleton className="h-10 w-48 mb-8" />

          <div className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-48 w-full rounded-lg" />
            </div>

            <Skeleton className="h-10 w-32 mt-4" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-32 px-6 lg:px-8 pb-32">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-brand mb-8">{id ? 'Edit Event' : 'Post an Event'}</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Title<span className="text-brand">*</span>
            </label>
            <Input
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Enter event title"
              aria-label="Event Title"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Date<span className="text-brand">*</span>
            </label>
            <Input
              type="date"
              name="eventDate"
              value={formData.eventDate}
              onChange={handleChange}
              required
              aria-label="Event Date"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Image<span className="text-brand">*</span>
            </label>
            {showFileUploader ? (
              <FileUploader
                acceptType="image"
                label="Event Post"
                onUpload={files => {
                  if (files.length > 0) {
                    const file = files[0];
                    setFormData(prev => ({
                      ...prev,
                      image: file
                    }));
                    const url = URL.createObjectURL(file);
                    setPreviewUrl(url);
                    setShowFileUploader(false);
                  }
                }}
              />
            ) : (
              <div>
                <div className="relative group mt-4">
                  <img
                    src={previewUrl}
                    alt="Event Preview"
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
                  {formData.image?.name || 'Current Event Image'}
                </span>
              </div>
            )}

            {showPreview && (
              <ViewDocumentModal
                isOpen={showPreview}
                documentUrl={previewUrl}
                documentName={formData.image?.name || 'Event Image'}
                documentType="Image"
                onClose={() => setShowPreview(false)}
              />
            )}
          </div>
          <div className="pb-8">
          <Button
            type="submit"
            className="w-full md:w-auto px-8"
          >
            {id ? 'Update Event' : 'Post Event'}
          </Button>
          </div>
        </form>
      </div>
    </div>
  );
}







