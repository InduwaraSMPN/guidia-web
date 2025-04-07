import { useState } from 'react';
import { DocumentData } from '../interfaces/Document';
import { uploadToAzureBlob } from '../lib/azure';

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

export const useDocumentUpload = (
  onSubmit: (document: DocumentData) => Promise<void>
): UseDocumentUploadResult => {
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
      
      const blobUrl = await uploadToAzureBlob(file);
      
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
