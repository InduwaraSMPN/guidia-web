import { useState } from 'react';
import { DocumentData } from '../interfaces/Document';
import { uploadToAzureBlob } from '../lib/azure';
import { useAuth } from '../contexts/AuthContext';

export interface UseDocumentUploadResult {
  file: File | null;
  category: string;
  customDocumentType: string;
  pdfPreviewData: string | null;
  isSubmitting: boolean;
  isSuccess: boolean;
  error: string | null;
  setFile: (file: File | null) => void;
  setCategory: (category: string) => void;
  setCustomDocumentType: (type: string) => void;
  handleUpload: (file: File | null) => void;
  handleSubmit: () => Promise<void>;
  reset: () => void;
  setIsSuccess: (value: boolean) => void;
}

export interface DocumentUploadOptions {
  userType?: string;
}

export const useDocumentUpload = (
  onSubmit: (document: DocumentData) => Promise<void>,
  options?: DocumentUploadOptions
): UseDocumentUploadResult => {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState<string>('');
  const [customDocumentType, setCustomDocumentType] = useState<string>('');
  const [pdfPreviewData, setPdfPreviewData] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = (uploadedFile: File | null) => {
    setFile(uploadedFile);
    setError(null);

    if (!uploadedFile) {
      setPdfPreviewData(null);
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      if (!event.target || typeof event.target.result !== 'string') {
        throw new Error('Failed to read file');
      }
      setPdfPreviewData(event.target.result);
    };
    reader.readAsDataURL(uploadedFile);
  };

  const handleSubmit = async () => {
    if (!category || !file) {
      setError("Please select both a category and a file");
      return;
    }

    if (category === 'Other' && !customDocumentType) {
      setError("Please enter a custom document type");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const documentCategory = category === 'Other' ? customDocumentType : category;
      const documentId = crypto.randomUUID();

      // Get user information from context
      const userID = user?.id || user?.userID;
      const userType = options?.userType || user?.userType || 'Student';

      // Upload with user context
      const blobUrl = await uploadToAzureBlob(file, {
        userID: userID?.toString(),
        userType,
        fileType: 'documents'
      });

      const document: DocumentData = {
        id: documentId,
        type: documentCategory,
        filename: file.name,
        content: blobUrl
      };

      await onSubmit(document);
      setIsSuccess(true);
    } catch (error) {
      console.error('Error uploading document:', error);
      setError('Failed to upload the document. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const reset = () => {
    setFile(null);
    setCategory('');
    setCustomDocumentType('');
    setPdfPreviewData(null);
    setIsSubmitting(false);
    setIsSuccess(false);
    setError(null);
  };

  return {
    file,
    category,
    customDocumentType,
    pdfPreviewData,
    isSubmitting,
    isSuccess,
    error,
    setFile,
    setCategory,
    setCustomDocumentType,
    handleUpload,
    handleSubmit,
    reset,
    setIsSuccess
  };
};
