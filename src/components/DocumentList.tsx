import { Trash2 } from 'lucide-react';

export interface Document {
  id: string;
  type: string;
  filename: string;
}

interface DocumentListProps {
  documents: Document[];
  onDelete: (id: string) => void;
  onSave: (documents: Document[]) => void;
  hasChanges: boolean;
  onDocumentSelect: (document: Document) => void;
}

export function DocumentList({ documents, onDelete, onDocumentSelect }: DocumentListProps) {
  return (
    <div className="space-y-4">
      {documents.map((doc) => (
        <div
          key={doc.id}
          className="flex items-center justify-between bg-brand text-white px-4 py-2 rounded-md"
          onClick={() => onDocumentSelect(doc)}
        >
          <div>
            <span className="font-medium">{doc.type}</span>
            <span className="text-sm ml-2 text-gray-200">
              {doc.filename}
            </span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(doc.id);
            }}
            className="text-white hover:text-muted-foreground"
            title="Delete Document"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}


