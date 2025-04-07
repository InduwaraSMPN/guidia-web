import { useState, useMemo } from 'react';
import { ArrowUpDown, Download } from 'lucide-react';
import { CsvExporter } from './CsvExporter';
import { formatDate } from '@/lib/utils';
import { motion, AnimatePresence } from "framer-motion";

interface UserData {
  email: string;
  username: string;
  userType: string;
  roleId: number;
}

interface Registration {
  penRegID: string;
  email: string;
  userData: string;
  createdAt: string;
}

interface ApprovedRegistrationsTableProps {
  registrations: Registration[];
  isLoading?: boolean;
}

const parseUserData = (userData: string | object): UserData => {
  try {
    if (typeof userData === 'string') {
      return JSON.parse(userData);
    }
    return userData as UserData;
  } catch (error) {
    console.error('Error parsing userData:', error);
    return {
      email: 'Error',
      username: 'Error parsing data',
      userType: 'Unknown',
      roleId: 0
    };
  }
};

export function ApprovedRegistrationsTable({ registrations, isLoading = false }: ApprovedRegistrationsTableProps) {
  const [sortField, setSortField] = useState<keyof Registration>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  const handleSort = (field: keyof Registration) => {
    setSortDirection(currentDirection => 
      sortField === field && currentDirection === 'asc' ? 'desc' : 'asc'
    );
    setSortField(field);
  };

  const sortedRegistrations = useMemo(() => {
    return [...registrations].sort((a, b) => {
      if (sortField === 'createdAt') {
        return sortDirection === 'asc'
          ? new Date(a[sortField]).getTime() - new Date(b[sortField]).getTime()
          : new Date(b[sortField]).getTime() - new Date(a[sortField]).getTime();
      }
      return sortDirection === 'asc'
        ? String(a[sortField]).localeCompare(String(b[sortField]))
        : String(b[sortField]).localeCompare(String(a[sortField]));
    });
  }, [registrations, sortField, sortDirection]);

  const csvData = useMemo(() => {
    return sortedRegistrations.map(registration => {
      const userData = parseUserData(registration.userData);
      return {
        ...registration,
        username: userData.username,
        userType: userData.userType,
        userData: undefined
      };
    });
  }, [sortedRegistrations]);

  const csvColumns = [
    { id: 'penRegID', header: 'Registration ID' },
    { id: 'email', header: 'Email' },
    { id: 'username', header: 'Username' },
    { id: 'userType', header: 'User Type' },
    { id: 'createdAt', header: 'Created At' }
  ];

  const SortableHeader = ({ field, label }: { field: keyof Registration; label: string }) => (
    <th
      scope="col"
      className="px-6 py-4 cursor-pointer transition-colors duration-200 hover:bg-gray-100"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-2 font-medium">
        {label}
        <ArrowUpDown className={`h-4 w-4 transition-opacity duration-200 ${
          sortField === field ? "opacity-100" : "opacity-30"
        }`} />
      </div>
    </th>
  );

  return (
    <div className="rounded-lg border border-gray-200 shadow-sm overflow-hidden bg-white">
      <div className="sticky top-0 z-10 flex items-center justify-between p-5 border-b border-gray-200 bg-white">
        <CsvExporter 
          data={csvData}
          columns={csvColumns}
          tableName="approved-registrations"
          isLoading={isLoading}
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-[#800020]/20"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </motion.button>
        </CsvExporter>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <SortableHeader field="penRegID" label="ID" />
              <SortableHeader field="email" label="Email" />
              <th scope="col" className="px-6 py-4">User Details</th>
              <SortableHeader field="createdAt" label="Created At" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <AnimatePresence>
              {sortedRegistrations.map((registration) => {
                const userData = parseUserData(registration.userData);
                return (
                  <motion.tr
                    key={registration.penRegID}
                    className="bg-white hover:bg-gray-50"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {registration.penRegID}
                    </td>
                    <td className="px-6 py-4">
                      {registration.email}
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div>
                          <span className="font-medium">Username:</span> {userData.username}
                        </div>
                        <div>
                          <span className="font-medium">User Type:</span>{' '}
                          <span className={`inline-flex px-2 text-xs font-semibold leading-5 rounded-full ${
                            userData.userType === 'Counselor' 
                              ? ''
                              : ''
                          }`}>
                            {userData.userType}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {formatDate(registration.createdAt)}
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ApprovedRegistrationsTable;
