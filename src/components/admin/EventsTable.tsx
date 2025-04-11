import { useState, useMemo, useRef } from 'react';
import { PencilIcon, TrashIcon, Plus, ArrowUpDown, Download } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { CsvExporter } from './CsvExporter';
import { motion, AnimatePresence } from "framer-motion";

interface Event {
  eventID: string;
  title: string;
  eventDate: string;
  createdAt: string;
  updatedAt: string;
}

interface EventsTableProps {
  events: Event[];
  onEdit?: (event: Event) => void;
  onDelete?: (eventId: string) => void;
  onAdd?: () => void;
  isLoading?: boolean;
}

export function EventsTable({ events, onEdit, onDelete, onAdd, isLoading = false }: EventsTableProps) {
  const [sortField, setSortField] = useState<keyof Event>('eventDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  const handleSort = (field: keyof Event) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => {
      if (a[sortField] < b[sortField]) return sortDirection === 'asc' ? -1 : 1;
      if (a[sortField] > b[sortField]) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [events, sortField, sortDirection]);

  const csvColumns = useMemo(() => [
    { id: 'eventID', header: 'Event ID' },
    { id: 'title', header: 'Title' },
    { id: 'eventDate', header: 'Event Date' },
    { id: 'createdAt', header: 'Created At' },
    { id: 'updatedAt', header: 'Updated At' }
  ], []);

  const SortableHeader = ({ field, label }: { field: keyof Event; label: string }) => (
    <th
      scope="col"
      className="px-6 py-4 cursor-pointer transition-colors duration-200 hover:bg-secondary-light"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-2 font-medium">
        {label}
        <span className={`transition-opacity duration-200 ${sortField === field ? "opacity-100" : "opacity-30"}`}>
          <ArrowUpDown className="h-4 w-4" />
        </span>
      </div>
    </th>
  );

  return (
    <div ref={tableRef} className="rounded-lg border border-border shadow-sm overflow-hidden bg-white">
      <div className="sticky top-0 z-10 flex items-center justify-between p-5 border-b border-border bg-white">
        <div className="flex items-center space-x-4">
          <CsvExporter data={sortedEvents} columns={csvColumns} tableName="events" isLoading={isLoading}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center px-4 py-2 text-sm font-medium text-foreground bg-white border border-border rounded-lg hover:bg-secondary focus:ring-2 focus:ring-[#800020]/20 focus:outline-none"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </motion.button>
          </CsvExporter>
        </div>
        {onAdd && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onAdd}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-brand rounded-lg hover:bg-brand-dark focus:ring-4 focus:ring-brand/30 transition-colors duration-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            Post Event
          </motion.button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-muted-foreground">
          <thead className="text-xs text-foreground uppercase bg-secondary sticky top-0">
            <tr>
              <SortableHeader field="eventID" label="ID" />
              <SortableHeader field="title" label="Title" />
              <SortableHeader field="eventDate" label="Event Date" />
              <SortableHeader field="createdAt" label="Created At" />
              <SortableHeader field="updatedAt" label="Updated At" />
              <th scope="col" className="px-6 py-4 text-right">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <AnimatePresence>
              {sortedEvents.map((event) => (
                <motion.tr
                  layout
                  key={event.eventID}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`hover:bg-secondary transition-colors duration-200 ${
                    hoveredRow === event.eventID ? "bg-secondary" : "bg-white"
                  }`}
                  onMouseEnter={() => setHoveredRow(event.eventID)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <td className="px-6 py-4 font-medium text-adaptive-dark">{event.eventID}</td>
                  <td className="px-6 py-4 font-medium">{event.title}</td>
                  <td className="px-6 py-4">{formatDate(event.eventDate)}</td>
                  <td className="px-6 py-4">{formatDate(event.createdAt)}</td>
                  <td className="px-6 py-4">{formatDate(event.updatedAt)}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-3">
                      {onEdit && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => onEdit(event)}
                          className="text-brand hover:text-brand-dark transition-colors duration-200 p-1 rounded-full hover:bg-brand/10"
                          title="Edit event"
                          aria-label="Edit event"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </motion.button>
                      )}
                      {onDelete && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => onDelete(event.eventID)}
                          className="text-brand hover:text-brand-dark transition-colors duration-200 p-1 rounded-full hover:bg-brand/10"
                          title="Delete event"
                          aria-label="Delete event"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </motion.button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
            {sortedEvents.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-muted-foreground">
                  No events found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default EventsTable;



