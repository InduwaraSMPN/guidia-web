import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { DocumentUploadForm } from '../../components/document/DocumentUploadForm';
import { DocumentData } from '../../interfaces/Document';
import { useAuth } from '../../contexts/AuthContext';
import axiosInstance from '../../lib/axios';
import { Skeleton } from '@/components/ui/skeleton';

interface StudentDocument {
  stuDocType: string;
  stuDocName: string;
  stuDocURL: string;
}

const DOCUMENT_CATEGORIES = [
  'CV/Resume',
  'Cover Letter',
  'Academic Results',
  'Other'
];

const SINGLE_UPLOAD_CATEGORIES = ['CV/Resume', 'Cover Letter', 'Academic Results'];

export function UploadDocument() {
  const navigate = useNavigate();
  const { userID } = useParams();
  const { user } = useAuth();
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [pageLoading, setPageLoading] = useState(true);

  // Simulate loading delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchExistingDocuments = async () => {
      try {
        const { data } = await axiosInstance.get<{studentDocuments: StudentDocument[]}>('/api/students/documents');
        const existingDocs = data.studentDocuments || [];

        // Filter out categories that already have documents
        const existingCategories = existingDocs.map(doc => doc.stuDocType);
        const filteredCategories = DOCUMENT_CATEGORIES.filter(category => {
          if (category === 'Other') return true; // Always show 'Other' category
          return !existingCategories.includes(category); // Filter out categories that exist
        });

        setAvailableCategories(filteredCategories);
      } catch (error) {
        console.error('Error fetching documents:', error);
      } finally {
        setPageLoading(false);
      }
    };

    fetchExistingDocuments();
  }, []);

  const handleSubmit = async (document: DocumentData) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      // Fetch current documents
      const { data } = await axiosInstance.get<{studentDocuments: StudentDocument[]}>('/api/students/documents');
      const currentDocs = data.studentDocuments || [];

      // Check if trying to upload a single-upload category that already exists
      if (SINGLE_UPLOAD_CATEGORIES.includes(document.type)) {
        const categoryExists = currentDocs.some(doc => doc.stuDocType === document.type);
        if (categoryExists) {
          throw new Error(`You can only upload one ${document.type} document.`);
        }
      }

      // Format new document for database
      const newDoc: StudentDocument = {
        stuDocType: document.type.trim(),
        stuDocName: document.filename,
        stuDocURL: document.content
      };

      // Combine current documents with new document
      const newDocuments = [...currentDocs, newDoc];

      // Update documents in database
      await axiosInstance.post('/api/students/update-documents', {
        documents: newDocuments
      });

      // Give UI time to show success state
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Navigate back to documents page
      navigate(`/students/profile/documents/${userID}`);
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error; // This will be caught by the DocumentUploadForm component
    }
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-white pt-32 px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <Skeleton className="h-10 w-48 mb-8" />

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
    <div className="min-h-screen bg-white pt-32 px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-brand mb-8">
          Upload Documents
        </h1>

        {availableCategories.length === 0 && !availableCategories.includes('Other') ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              You have already uploaded all required documents.
              You can still upload additional documents using the 'Other' category.
            </p>
            <button
              onClick={() => navigate(`/students/profile/documents/${userID}`)}
              className="mt-4 text-brand hover:underline"
            >
              Return to Documents
            </button>
          </div>
        ) : (
          <DocumentUploadForm
            documentTypes={availableCategories}
            onSubmit={handleSubmit}
            onCancel={() => navigate(`/students/profile/documents/${userID}`)}
            submitButtonText="Upload Document"
          />
        )}
      </div>
    </div>
  );
}


