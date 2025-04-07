import axiosInstance from './axios';

interface UploadResponse {
  url: string;
}

export const uploadToAzureBlob = async (file: File): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    // Add file size validation
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      throw new Error('File size exceeds the 5MB limit');
    }

    // Check if we're in development mode and should use fallback immediately
    const useFallbackImmediately = import.meta.env.DEV && 
                                  (import.meta.env.VITE_USE_AZURE_FALLBACK === 'true');
    
    if (useFallbackImmediately) {
      console.warn('Using immediate fallback local URL for development (VITE_USE_AZURE_FALLBACK=true)');
      return generateFallbackUrl(file);
    }

    try {
      const response = await axiosInstance.post<UploadResponse>('/api/students/upload-document', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (!response.data?.url) {
        throw new Error('Invalid response from server');
      }

      return response.data.url;
    } catch (error: any) {
      console.error('Error uploading to Azure:', error);
      
      // TEMPORARY FALLBACK: Generate a fake URL for testing purposes
      // Remove this in production!
      if (import.meta.env.DEV) {
        console.warn('Using fallback local URL for development');
        return generateFallbackUrl(file);
      }
      
      if (error.response) {
        // Handle specific error responses
        const errorMessage = error.response.data?.error || error.response.data?.message || 'Server error occurred';
        throw new Error(errorMessage);
      }
      throw error;
    }
  } catch (error: any) {
    console.error('Upload failed:', error);
    throw new Error(error.message || 'Failed to upload file. Please try again later.');
  }
};

// Helper function to generate consistent fallback URLs
const generateFallbackUrl = (file: File): string => {
  const timestamp = Date.now();
  const fileId = Math.random().toString(36).substring(2, 15);
  return `mock-azure-url://${fileId}-${timestamp}-${file.name}`;
};
