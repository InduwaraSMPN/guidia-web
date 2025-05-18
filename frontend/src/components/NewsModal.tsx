import { X } from 'lucide-react';
import { NewsItem } from './NewsCard';

interface NewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  news: NewsItem;
}

export function NewsModal({ isOpen, onClose, news }: NewsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center  p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold text-brand">{news.title}</h2>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-muted-foreground"
              aria-label="Close news modal"
              title="Close"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <p className="text-sm text-muted-foreground mb-4">{news.date}</p>

          {news.images && news.images.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {news.images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`${news.title} ${index + 1}`}
                  className="w-full h-48 object-cover rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
                  onClick={() => window.open(image, '_blank')}
                />
              ))}
            </div>
          )}

          <div
            className="prose max-w-none overflow-hidden"
            dangerouslySetInnerHTML={{ __html: news.description }}
          />
        </div>
      </div>
    </div>
  );
}


