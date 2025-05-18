import { X } from 'lucide-react';
import { Event } from './EventCard';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event;
}

export function EventModal({ isOpen, onClose, event }: EventModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center  p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold text-brand">{event.title}</h2>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-muted-foreground"
              aria-label="Close modal"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <p className="text-sm text-muted-foreground mb-4">{new Date(event.eventDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}</p>

          <div className="flex justify-center mb-6">
            <a href={event.imageURL} target="_blank" rel="noopener noreferrer">
              <img
                src={event.imageURL}
                alt={event.title}
                className="w-96 object-cover rounded-lg cursor-pointer"
              />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}


