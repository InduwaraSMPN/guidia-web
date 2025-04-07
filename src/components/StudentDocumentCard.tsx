import { useState } from 'react';
import { Eye, FileText } from 'lucide-react';
import { ViewDocumentModal } from './ViewDocumentModal';

interface DocumentDetails {
  name: string;
  url: string;
  type: string;
}

interface StudentDocumentCardProps {
  title: string;
  isUploaded: boolean;
  document?: DocumentDetails;
}

export function StudentDocumentCard({ title, isUploaded, document }: StudentDocumentCardProps) {
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const handleViewDocument = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (document) {
      setIsViewModalOpen(true);
    }
  };

  return (
    <>
      <div className={`p-6 rounded-lg ${isUploaded ? 'bg-[#800020]' : 'bg-gray-100'}`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className={`text-lg font-semibold ${isUploaded ? 'text-white' : 'text-gray-900'}`}>
            {title}
          </h3>
        </div>
        
        {isUploaded && document && (
          <div className="flex gap-2 mt-3 justify-end">
            <button 
              onClick={handleViewDocument}
              className="flex items-center gap-1 px-3 py-1.5 rounded bg-white text-[#800020] text-sm hover:bg-gray-100 transition-colors"
            >
              <Eye className="h-3.5 w-3.5" /> View
            </button>
          </div>
        )}
      </div>

      {document && (
        <ViewDocumentModal 
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          documentName={document.name}
          documentUrl={document.url}
          documentType={document.type}
        />
      )}
    </>
  );
}
