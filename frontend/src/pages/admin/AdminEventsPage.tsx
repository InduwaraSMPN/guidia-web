import { useState, useEffect } from 'react';
import { SearchBar } from '../../components/SearchBar';
import { toast } from '../../components/ui/sonner';
import { useNavigate } from 'react-router-dom';
import { EventsTable } from '../../components/admin/EventsTable';
import { Skeleton } from "@/components/ui/skeleton";
import axios from 'axios';

interface Event {
  eventID: string;
  title: string;
  eventDate: string;
  createdAt: string;
  updatedAt: string;
}

export function AdminEventsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get<Event[]>('/api/events');
        setEvents(response.data);
      } catch (error) {
        console.error('Error fetching events:', error);
        toast.error('Failed to load events');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleDelete = async (eventId: string) => {
    // Show confirmation toast
    toast('Are you sure you want to delete this event?', {
      position: 'top-center',
      action: {
        label: 'Delete',
        onClick: async () => {
          try {
            await axios.delete(`/api/events/${eventId}`);
            setEvents(events.filter(event => event.eventID !== eventId));
            toast.success('Event deleted successfully');
          } catch (error) {
            console.error('Error deleting event:', error);
            toast.error('Failed to delete event');
          }
        },
      },
      cancel: {
        label: 'Cancel',
        onClick: () => {},
        className: 'bg-transparent text-white hover:bg-transparent'
      },
    });
  };

  const handleEdit = (event: Event) => {
    navigate(`/admin/events/edit/${event.eventID}`);
  };

  const handleAdd = () => {
    navigate('/admin/events/post');
  };

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 max-w-[1216px] mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand">Events Management</h1>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search events..."
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        {isLoading ? (
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-10 w-28" />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <Skeleton className="h-5 w-32" />
                    </th>
                    <th className="px-4 py-3 text-left">
                      <Skeleton className="h-5 w-24" />
                    </th>
                    <th className="px-4 py-3 text-left">
                      <Skeleton className="h-5 w-28" />
                    </th>
                    <th className="px-4 py-3 text-right">
                      <Skeleton className="h-5 w-20 ml-auto" />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[...Array(5)].map((_, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3">
                        <Skeleton className="h-5 w-48" />
                      </td>
                      <td className="px-4 py-3">
                        <Skeleton className="h-5 w-24" />
                      </td>
                      <td className="px-4 py-3">
                        <Skeleton className="h-5 w-28" />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Skeleton className="h-8 w-8 rounded-md" />
                          <Skeleton className="h-8 w-8 rounded-md" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <EventsTable
            events={filteredEvents}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAdd={handleAdd}
          />
        )}
      </div>
    </div>
  );
}

