import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { FileUploader } from '../components/FileUploader';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { RichTextEditor } from '../components/ui/RichTextEditor';
import { FileText, Plus, X } from 'lucide-react';
import { ViewDocumentModal } from '../components/ViewDocumentModal';
import { toast } from 'sonner';

interface FormData {
  title: string;
  content: string;
  images: (File | null)[];
}

export function PostNewsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const [formData, setFormData] = useState<FormData>({
    title: '',
    content: '',
    images: [null],
  });
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [selectedPreviewImage, setSelectedPreviewImage] = useState<{
    url: string;
    name: string;
  } | null>(null);
  const [previewIndex, setPreviewIndex] = useState<number>(0);
  const [showFileUploaders, setShowFileUploaders] = useState<boolean[]>([true]);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);

  useEffect(() => {
    if (id) {
      const fetchNewsData = async () => {
        try {
          const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/news/${id}`);
          if (!response.ok) {
            throw new Error(`Failed to fetch news: ${response.status}`);
          }
          const newsData = await response.json();
          
          setFormData({
            title: newsData.title,
            content: newsData.content,
            images: Array(newsData.imageURLs ? 
              (typeof newsData.imageURLs === 'string' ? 
                JSON.parse(newsData.imageURLs).length : 
                newsData.imageURLs.length) : 
              0).fill(null),
          });
          
          // Handle image URLs
          if (newsData.imageURLs) {
            try {
              // Parse imageURLs if it's a string
              const imageUrls = typeof newsData.imageURLs === 'string' 
                ? JSON.parse(newsData.imageURLs) 
                : newsData.imageURLs;
              
              if (imageUrls && imageUrls.length > 0) {
                setExistingImageUrls(imageUrls);
                setPreviewUrls(imageUrls);
                // Update uploaded images state
                setUploadedImages(Array(imageUrls.length).fill(null));
                setShowFileUploaders(Array(imageUrls.length).fill(false));
              }
            } catch (e) {
              console.error('Error parsing image URLs:', e);
            }
          }
        } catch (error) {
          console.error('Error fetching news:', error);
          toast.error('Failed to fetch news data');
        }
      };
      fetchNewsData();
    }
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditorChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      content: value
    }));
  };

  const handleImagesUpload = (files: File[]) => {
    const newImages = [...uploadedImages, ...files];
    setUploadedImages(newImages);
    
    // Update form data
    setFormData(prev => ({
      ...prev,
      images: newImages
    }));

    // Create preview URLs
    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
    
    // Update file uploaders state
    setShowFileUploaders(prev => [...prev.map(() => false)]);
  };

  const handleRemoveImage = (index: number) => {
    // Clean up preview URL
    if (previewUrls[index]) {
      URL.revokeObjectURL(previewUrls[index]);
    }
    
    // Remove image
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handlePreviewImage = (url: string, name: string) => {
    setSelectedPreviewImage({ url, name });
    setShowPreview(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (formData.images.every(img => img === null) && existingImageUrls.every(url => !url)) {
        toast.error('Please upload at least one news image');
        return;
      }

      let imageURLs = [...existingImageUrls];
      let imagePaths: string[] = [];

      // Upload new images if provided
      for (let i = 0; i < formData.images.length; i++) {
        const image = formData.images[i];
        if (image) {
          const imageFormData = new FormData();
          imageFormData.append('image', image);
          imageFormData.append('type', 'news');

          const uploadResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/upload`, {
            method: 'POST',
            body: imageFormData,
          });

          if (!uploadResponse.ok) {
            throw new Error('Failed to upload image');
          }

          const uploadResult = await uploadResponse.json();
          
          // Replace or add the image URL
          if (i < imageURLs.length) {
            imageURLs[i] = uploadResult.imageURL;
          } else {
            imageURLs.push(uploadResult.imageURL);
          }
          
          imagePaths.push(uploadResult.imagePath);
        }
      }

      // Filter out empty URLs
      imageURLs = imageURLs.filter(url => url);

      // Create or update news
      const method = id ? 'PUT' : 'POST';
      const url = id 
        ? `${import.meta.env.VITE_API_BASE_URL}/api/news/${id}`
        : `${import.meta.env.VITE_API_BASE_URL}/api/news`;

      const newsResponse = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          imageURLs: imageURLs,
          newsDate: new Date().toISOString().split('T')[0], // Current date in YYYY-MM-DD format
          imagePaths: imagePaths.length > 0 ? imagePaths : undefined
        }),
      });

      if (!newsResponse.ok) {
        throw new Error(id ? 'Failed to update news' : 'Failed to create news');
      }

      // Clean up preview URLs if they're from local files
      previewUrls.forEach((url, index) => {
        if (url && url !== existingImageUrls[index]) {
          URL.revokeObjectURL(url);
        }
      });

      toast.success(id ? 'News updated successfully' : 'News created successfully');
      
      // Determine where to navigate based on current path
      const isAdminRoute = location.pathname.startsWith('/admin');
      navigate(isAdminRoute ? '/admin/news' : '/news');
    } catch (error) {
      console.error('Error creating/updating news:', error);
      toast.error(id ? 'Failed to update news' : 'Failed to create news');
    }
  };

  return (
    <div className="container mx-auto pt-32 py-8 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg p-6">
        <h1 className="text-3xl font-bold text-brand mb-8">{id ? 'Edit News' : 'Post News'}</h1>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Title<span className="text-brand">*</span>
              </label>
              <Input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="Enter news title"
                aria-label="News Title"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Content<span className="text-brand">*</span>
              </label>
              <RichTextEditor
                value={formData.content}
                onChange={handleEditorChange}
                placeholder="Enter news content"
                className="min-h-[300px]"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-foreground">
                  News Images<span className="text-brand">*</span>
                </label>
              </div>
              
              <FileUploader
                acceptType="image"
                label="News Images"
                multiple={true}
                onUpload={handleImagesUpload}
              />

              {/* Display uploaded images */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                {uploadedImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={previewUrls[index]}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg cursor-pointer"
                      onClick={() => handlePreviewImage(previewUrls[index], image.name)}
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded-lg">
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => handlePreviewImage(previewUrls[index], image.name)}
                          className="flex items-center gap-1"
                        >
                          <FileText className="h-4 w-4" />
                          Preview
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveImage(index)}
                          className="flex items-center gap-1"
                        >
                          <X className="h-4 w-4" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Preview Modal */}
              {showPreview && selectedPreviewImage && (
                <ViewDocumentModal
                  isOpen={showPreview}
                  documentUrl={selectedPreviewImage.url}
                  documentName={selectedPreviewImage.name}
                  documentType="Image"
                  onClose={() => {
                    setShowPreview(false);
                    setSelectedPreviewImage(null);
                  }}
                />
              )}
            </div>
            
            <div className="pb-8">
              <Button
                type="submit"
                className="w-full md:w-auto px-8"
              >
                {id ? 'Update News' : 'Post News'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}


