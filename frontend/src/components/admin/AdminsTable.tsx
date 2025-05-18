import { useState, useMemo, useRef, useEffect } from 'react';
import { PencilIcon, TrashIcon, UserPlusIcon, ArrowUpDown, Download } from 'lucide-react';
import { CsvExporter } from './CsvExporter';
import { motion, AnimatePresence } from "framer-motion";
import { Select, Option } from "@/components/ui/Select";
import { TablePagination } from '@/components/ui/table-pagination';

interface User {
  userID: string;
  email: string;
  username: string;
  roleID: number;
  status: string;
}

interface AdminsTableProps {
  users: User[];
  roleID: number;
  onAdd?: () => void;
  onEdit?: (user: User) => void;
  onDelete?: (userId: string) => void;
  onStatusChange?: (userId: string, newStatus: string) => void;
  isLoading?: boolean;
}

const statusOptions: Option[] = [
  { value: "active", label: "Active" },
  { value: "blocked", label: "Blocked" },
];

export function AdminsTable({
  users,
  roleID,
  onAdd,
  onEdit,
  onDelete,
  onStatusChange,
  isLoading = false
}: AdminsTableProps) {
  const [sortField, setSortField] = useState<keyof User>('email');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const tableRef = useRef<HTMLDivElement>(null);

  const handleSort = (field: keyof User) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    // Reset to first page when sort changes
    setCurrentPage(1);
  };

  const filteredUsers = users.filter(user => user.roleID === roleID);

  const sortedUsers = useMemo(() => {
    return [...filteredUsers].sort((a, b) => {
      const aValue = a[sortField]?.toString().toLowerCase() ?? '';
      const bValue = b[sortField]?.toString().toLowerCase() ?? '';

      return sortDirection === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    });
  }, [filteredUsers, sortField, sortDirection]);

  // Get paginated data
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedUsers.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedUsers, currentPage, itemsPerPage]);

  const csvColumns = useMemo(() => [
    { id: 'userID', header: 'User ID' },
    { id: 'email', header: 'Email' },
    { id: 'username', header: 'Username' },
    { id: 'status', header: 'Status' }
  ], []);

  const getTableName = () => {
    switch (roleID) {
      case 1: return 'admins';
      case 3: return 'companies';
      default: return 'users';
    }
  };

  const SortableHeader = ({ field, label }: { field: keyof User; label: string }) => (
    <th
      scope="col"
      className="px-6 py-4 cursor-pointer transition-colors duration-200 hover:bg-gray-100"
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
    <div ref={tableRef} className="rounded-lg border border-gray-200 shadow-sm overflow-hidden bg-white">
      <div className="sticky top-0 z-10 flex items-center justify-between p-5 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-4">
          <CsvExporter data={sortedUsers} columns={csvColumns} tableName={getTableName()} isLoading={isLoading}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center px-4 py-2 text-sm font-medium text-foreground bg-card border border-border rounded-lg hover:bg-secondary hover:text-brand dark:hover:text-foreground transition-all duration-200 focus:ring-2 focus:ring-brand focus:outline-none group"
            >
              <Download className="w-4 h-4 mr-2 text-foreground group-hover:text-brand dark:group-hover:text-foreground transition-colors duration-200" />
              Export CSV
            </motion.button>
          </CsvExporter>
        </div>
        {onAdd && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onAdd}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-[#800020] rounded-lg hover:bg-rose-800 focus:ring-4 focus:ring-[#800020]/30 transition-colors duration-200"
          >
            <UserPlusIcon className="w-4 h-4 mr-2" />
            Add {roleID === 1 ? 'Admin' : roleID === 3 ? 'Company' : 'User'}
          </motion.button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0">
            <tr>
              <SortableHeader field="email" label="Email" />
              <SortableHeader field="username" label="Username" />
              <th scope="col" className="px-6 py-4">Status</th>
              <th scope="col" className="px-6 py-4 text-right">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <AnimatePresence>
              {paginatedUsers.map((user) => (
                <motion.tr
                  layout
                  key={user.userID}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`hover:bg-gray-50 transition-colors duration-200 ${
                    hoveredRow === user.userID ? "bg-gray-50" : "bg-white"
                  }`}
                  onMouseEnter={() => setHoveredRow(user.userID)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <td className="px-6 py-4 font-medium text-adaptive-dark">{user.email}</td>
                  <td className="px-6 py-4">{user.username}</td>
                  <td className="px-6 py-4 relative">
                    <Select
                      options={statusOptions}
                      value={user.status ? { value: user.status, label: user.status.charAt(0).toUpperCase() + user.status.slice(1) } : null}
                      onChange={(option) => onStatusChange?.(user.userID, option?.value || 'active')}
                      placeholder="Select status"
                      isSearchable={false}
                    />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-3">
                      {onEdit && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => onEdit(user)}
                          className="text-[#800020] hover:text-rose-800 transition-colors duration-200 p-1 rounded-full hover:bg-rose-50"
                          title="Edit user"
                          aria-label="Edit user"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </motion.button>
                      )}
                      {onDelete && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => onDelete(user.userID)}
                          className="text-[#800020] hover:text-rose-800 transition-colors duration-200 p-1 rounded-full hover:bg-rose-50"
                          title="Delete user"
                          aria-label="Delete user"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </motion.button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-gray-500">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <TablePagination
        currentPage={currentPage}
        totalItems={sortedUsers.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}

export default AdminsTable;
