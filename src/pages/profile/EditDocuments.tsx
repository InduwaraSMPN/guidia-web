import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { CircleCheck } from 'lucide-react';
import { DocumentList } from '../../components/DocumentList';
import axiosInstance from '../../lib/axios';
import { useAuth } from '../../contexts/AuthContext';
import { ViewDocumentModal } from '../../components/ViewDocumentModal';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

interface Document {
  id: string;
  type: string;
  filename: string;
  url: string;
}

interface StudentDocument {
  stuDocType: string;
  stuDocName: string;
  stuDocURL: string;
}

export function EditDocuments() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [originalDocuments, setOriginalDocuments] = useState<Document[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [selectedDocumentUrl, setSelectedDocumentUrl] = useState<string | null>(null);
  const [selectedDocumentName, setSelectedDocumentName] = useState<string | null>(null);
  const [selectedDocumentType, setSelectedDocumentType] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const getProfilePath = () => {
    if (!user) return '';
    switch (user.userType) {
      case 'Student':
        return `/students/profile/${user.id}`;
      case 'Company':
        return `/companies/${user.id}`;
      case 'Counselor':
        return `/counselors/${user.id}`;
      case 'Admin':
        return `/admin`;
      default:
        return '';
    }
  };

  // Simulate loading delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Load documents from API on component mount
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const { data } = await axiosInstance.get<{studentDocuments: StudentDocument[]}>('/api/students/documents');

        // Convert API format to component format
        const formattedDocs = (data.studentDocuments || []).map((doc, index) => ({
          id: index.toString(),
          type: doc.stuDocType,
          filename: doc.stuDocName,
          url: doc.stuDocURL
        }));

        setDocuments(formattedDocs);
        setOriginalDocuments(JSON.parse(JSON.stringify(formattedDocs))); // Deep copy
        setPageLoading(false);
      } catch (error) {
        console.error('Error fetching documents:', error);
        setPageLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  // Check for changes when documents are modified
  useEffect(() => {
    const documentsChanged =
      JSON.stringify(documents) !== JSON.stringify(originalDocuments);
    setHasChanges(documentsChanged);
  }, [documents, originalDocuments]);

  const handleDelete = async (id: string) => {
    const updatedDocs = documents.filter(doc => doc.id !== id);
    setDocuments(updatedDocs);

    // Convert to API format and update
    const apiDocs = updatedDocs.map(doc => ({
      stuDocType: doc.type,
      stuDocName: doc.filename,
      stuDocURL: doc.url
    }));

    try {
      await axiosInstance.post('/api/students/update-documents', {
        documents: apiDocs
      });
      toast.success('Document deleted successfully');
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete document');
    }
  };

  const handleSave = async (updatedDocuments: Document[]) => {
    try {
      setIsLoading(true);
      // Convert to API format
      const apiDocs = updatedDocuments.map(doc => ({
        stuDocType: doc.type,
        stuDocName: doc.filename,
        stuDocURL: doc.url
      }));

      await axiosInstance.post('/api/students/update-documents', {
        documents: apiDocs
      });

      toast.success('Documents saved successfully');
      navigate(getProfilePath());
    } catch (error) {
      console.error('Error saving documents:', error);
      toast.error('Failed to save documents');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAnother = () => {
    if (hasChanges) {
      toast('You have unsaved changes', {
        position: 'top-center',
        action: {
          label: 'Leave anyway',
          onClick: () => {
            if (user?.userID) {
              navigate(`/students/profile/documents/upload/${user.userID}`);
            }
          }
        },
        cancel: {
          label: 'Stay',
          onClick: () => {}
        },
      });
      return;
    }

    if (user?.userID) {
      navigate(`/students/profile/documents/upload/${user.userID}`);
    }
  };

  const handleDocumentSelect = async (document: Document) => {
    try {
      // First try to get from localStorage
      const storedContent = localStorage.getItem('userDocumentsContent');
      if (storedContent) {
        const documentsContent = JSON.parse(storedContent);
        const matchingDoc = documentsContent[document.id];
        if (matchingDoc?.content) {
          setSelectedDocumentUrl(matchingDoc.content);
          setSelectedDocumentName(document.filename);
          setSelectedDocumentType(document.type);
          return;
        }
      }

      // If not in localStorage, try to get from API
      const apiDocument = documents.find(d => d.id === document.id);
      if (apiDocument?.url) {
        // Validate the URL is accessible
        const response = await fetch(apiDocument.url, { method: 'HEAD' });
        if (response.ok) {
          setSelectedDocumentUrl(apiDocument.url);
          setSelectedDocumentName(document.filename);
          setSelectedDocumentType(document.type);
          return;
        }
      }

      throw new Error('Document not found or inaccessible');
    } catch (error) {
      console.error('Error loading document:', error);
      toast.error('Unable to load document. Please try again later.');
    }
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-white pt-32 px-6 lg:px-8 pb-32">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-10 w-32 rounded-md" />
          </div>

          <div className="bg-white rounded-lg border border-border p-6">
            <div className="space-y-6">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-md" />
                    <div>
                      <Skeleton className="h-5 w-32 mb-1" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-9 w-9 rounded-md" />
                    <Skeleton className="h-9 w-9 rounded-md" />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex justify-between">
              <Skeleton className="h-9 w-16 rounded-md" />
              <Skeleton className="h-9 w-32 rounded-md" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-32 px-6 lg:px-8 pb-32">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-brand">
            Edit/Add Documents
          </h1>

          <Button onClick={handleAddAnother}>
            Add Another
          </Button>
        </div>

        <div className="bg-white rounded-lg border border-border p-6">
          <DocumentList
            documents={documents}
            onDelete={handleDelete}
            onSave={handleSave}
            hasChanges={hasChanges}
            onDocumentSelect={handleDocumentSelect}
          />

          <div className="mt-8 flex justify-between">
            <button
              onClick={() => navigate(getProfilePath())}
              className="px-4 py-2 text-sm font-medium text-brand hover:text-brand-dark"
            >
              Back
            </button>
            <button
              onClick={() => handleSave(documents)}
              disabled={isLoading || !hasChanges}
              className={`px-4 py-2 bg-brand text-white rounded-md hover:bg-brand-dark disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isLoading ? 'Uploading...' : 'Save Changes'}
            </button>
          </div>
        </div>

        <ViewDocumentModal
          isOpen={!!selectedDocumentUrl}
          onClose={() => setSelectedDocumentUrl(null)}
          documentUrl={selectedDocumentUrl || ''}
          documentName={selectedDocumentName || ''}
          documentType={selectedDocumentType || ''}
        />
      </div>
    </div>
  );
}


