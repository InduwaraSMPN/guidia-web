import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Trash2 } from 'lucide-react';
import { DocumentUploadForm } from '../../components/document/DocumentUploadForm';
import { DocumentData } from '../../interfaces/Document';
import axiosInstance from '../../lib/axios';
import { useAuth } from '../../contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { useRegistration } from '@/contexts/RegistrationContext';
import { toast } from 'sonner';

interface StudentDocument {
  stuDocType: string;
  stuDocName: string;
  stuDocURL: string;
}

const DOCUMENT_CATEGORIES = [
  'CV/Resume',
  'Academic Results',
  'Cover Letter',
  'Other'
];

export function WelcomeUploadDocument() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const { registrationData, updateRegistrationData, fetchExistingData } = useRegistration();

  const [uploadedDocs, setUploadedDocs] = useState<StudentDocument[]>(registrationData.documents || []);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  // Simulate loading delay and fetch existing data
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (user) {
        await fetchExistingData();
        // Update uploaded docs from registration data if available
        if (registrationData.documents && registrationData.documents.length > 0) {
          setUploadedDocs(registrationData.documents);
        } else {
          // If no documents in registration context, try to fetch from API
          try {
            const { data } = await axiosInstance.get<{studentDocuments: StudentDocument[]}>('/api/students/documents');
            const documents = data.studentDocuments || [];
            setUploadedDocs(documents);
            // Also update registration context
            updateRegistrationData({ documents });
          } catch (error: any) {
            console.error('Error fetching documents:', error);
            // Handle 404 gracefully - assume empty documents array
            if (error.response && error.response.status === 404) {
              setUploadedDocs([]);
            }
          }
        }
      }
      setPageLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [user]);

  const handleDelete = async (docName: string) => {
    try {
      setLoading(true);
      const updatedDocs = uploadedDocs.filter(doc => doc.stuDocName !== docName);

      // Send data directly to the API
      await axiosInstance.post('/api/students/update-documents', {
        documents: updatedDocs
      });

      // Update local state
      setUploadedDocs(updatedDocs);

      // Update registration context
      updateRegistrationData({
        documents: updatedDocs,
        steps: {
          ...registrationData.steps,
          documents: true
        }
      });

      toast.success('Document deleted successfully');
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete document');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (document: DocumentData) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setLoading(true);

      if (!document.content) {
        throw new Error('Document content (URL) is required');
      }

      if (!document.type) {
        throw new Error('Document type is required');
      }

      // Format document for database
      const newDoc: StudentDocument = {
        stuDocType: document.type.trim(), // Ensure the type is trimmed
        stuDocName: document.filename,
        stuDocURL: document.content
      };

      const newDocuments = [...uploadedDocs, newDoc];

      // Send data directly to the API
      await axiosInstance.post('/api/students/update-documents', {
        documents: newDocuments
      });

      // Update local state
      setUploadedDocs(newDocuments);

      // Update registration context
      updateRegistrationData({
        documents: newDocuments,
        steps: {
          ...registrationData.steps,
          documents: true
        }
      });

      toast.success('Document uploaded successfully');
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Failed to upload document');
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-white pt-32 px-6 lg:px-8 pb-32">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <Skeleton className="h-10 w-3/4 mx-auto mb-4" />
            <Skeleton className="h-6 w-2/3 mx-auto" />
          </div>

          {/* Uploaded Documents List Skeleton */}
          <div className="mb-8">
            <Skeleton className="h-8 w-48 mb-4" />
            <div className="space-y-4">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="flex items-center justify-between bg-secondary p-4 rounded-lg border border-border">
                  <div className="flex items-center justify-between w-full">
                    <div>
                      <Skeleton className="h-5 w-48 mb-2" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-8 w-8 rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Document Upload Form Skeleton */}
          <div className="mb-4">
            <div className="space-y-4">
              <Skeleton className="h-8 w-48 mb-2" />
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
              <div className="flex justify-end">
                <Skeleton className="h-10 w-40 rounded-md" />
              </div>
            </div>
          </div>

          {/* Bottom Navigation Skeleton */}
          <div className="mt-8 flex justify-between items-center mb-8">
            <Skeleton className="h-4 w-64" />
            <div className="flex gap-4">
              <Skeleton className="h-10 w-24 rounded-md" />
              <Skeleton className="h-10 w-40 rounded-md" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-32 px-6 lg:px-8 pb-32">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-brand mb-4">
            03. Final Step
          </h1>
          <p className="text-lg text-muted-foreground">
            Upload your CV/Resume and any other relevant documents to complete your profile
          </p>
        </div>

        {/* Uploaded Documents List */}
        {uploadedDocs.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Uploaded Documents</h2>
            <div className="space-y-4">
              {uploadedDocs.map((doc) => (
                <div
                  key={doc.stuDocName}
                  className="flex items-center justify-between bg-secondary p-4 rounded-lg border border-border"
                >
                  <div className="flex items-center justify-between w-full">
                    <div>
                      <p className="font-medium text-adaptive-dark">{doc.stuDocName}</p>
                      <p className="text-sm text-muted-foreground">Category: {doc.stuDocType}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(doc.stuDocName)}
                      className="text-red-600 hover:text-red-700"
                      disabled={loading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <form className="mb-4" onSubmit={(e) => {
          e.preventDefault();
          if (user) {
            // Pass empty document to trigger validation
            handleSubmit({
              id: '',
              type: '',
              filename: '',
              content: ''
            });
          }
        }}>
          <DocumentUploadForm
            documentTypes={DOCUMENT_CATEGORIES.filter(
              category => !uploadedDocs.some(doc => doc.stuDocType === category)
            )}
            onSubmit={handleSubmit}
            onCancel={() => {
              // This will only clear the current document upload form
              // without navigating away from the page
            }}
            submitButtonText="Upload Document"
          />
        </form>

        <div className="mt-8 flex justify-between items-center mb-8">
          <p className="text-sm text-muted-foreground italic">
            *You can always update your documents later from your profile page
          </p>
          <div className="flex gap-4">
            <Button
              onClick={() => navigate('/welcome/career')}
              type="button"
              variant="outline"
            >
              Back
            </Button>
            <Button
              onClick={() => {
                // Mark all steps as complete
                updateRegistrationData({
                  steps: {
                    profile: true,
                    career: true,
                    documents: true
                  }
                });

                // Ensure user has profile flag set
                updateUser({ hasProfile: true });

                // Navigate to profile
                navigate(`/students/profile/${user?.userID}`);
              }}
              type="button"
            >
              Continue to Profile
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}



