import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Trash2 } from 'lucide-react';
import { DocumentUploadForm } from '../../components/document/DocumentUploadForm';
import { DocumentData } from '../../interfaces/Document';
import axiosInstance from '../../lib/axios';
import { useAuth } from '../../contexts/AuthContext';

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
  const { user } = useAuth();

  const [uploadedDocs, setUploadedDocs] = useState<StudentDocument[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchDocuments = async () => {
      try {
        const { data } = await axiosInstance.get<{studentDocuments: StudentDocument[]}>('/api/students/documents');
        setUploadedDocs(data.studentDocuments || []);
      } catch (error: any) {
        console.error('Error fetching documents:', error);
        // Handle 404 gracefully - assume empty documents array
        if (error.response && error.response.status === 404) {
          setUploadedDocs([]);
        } else {
          console.error('Error fetching documents:', error);
        }
      }
    };
    fetchDocuments();
  }, []);

  const handleDelete = async (docName: string) => {
    try {
      setLoading(true);
      const updatedDocs = uploadedDocs.filter(doc => doc.stuDocName !== docName);
      
      await axiosInstance.post('/api/students/update-documents', {
        documents: updatedDocs
      });
      
      setUploadedDocs(updatedDocs);
    } catch (error) {
      console.error('Error deleting document:', error);
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
      
      await axiosInstance.post('/api/students/update-documents', {
        documents: newDocuments
      });

      setUploadedDocs(newDocuments);
    } catch (error) {
      console.error('Error uploading document:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white pt-32 px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-[#800020] mb-4">
            03. Final Step
          </h1>
          <p className="text-lg text-gray-600">
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
                  className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center justify-between w-full">
                    <div>
                      <p className="font-medium text-gray-900">{doc.stuDocName}</p>
                      <p className="text-sm text-gray-500">Category: {doc.stuDocType}</p>
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
          <p className="text-sm text-gray-500 italic">
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
              onClick={() => navigate(`/students/profile/${user?.userID}`)}
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
