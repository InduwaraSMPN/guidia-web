

import { useState, useMemo, useRef, useEffect } from "react"
import { PencilIcon, TrashIcon, Plus, ArrowUpDown, Download } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { CsvExporter } from "./CsvExporter"
import { motion, AnimatePresence } from "framer-motion"
import { TablePagination } from '@/components/ui/table-pagination'

interface News {
  newsID: string
  title: string
  content: string
  newsDate: string
  createdAt: string
  updatedAt: string
}

interface NewsTableProps {
  news: News[]
  onEdit?: (news: News) => void
  onDelete?: (newsId: string) => void
  onAdd?: () => void
  isLoading?: boolean
}

export function NewsTable({ news, onEdit, onDelete, onAdd, isLoading = false }: NewsTableProps) {
  const [sortField, setSortField] = useState<keyof News>("newsDate")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [hoveredRow, setHoveredRow] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5
  const tableRef = useRef<HTMLDivElement>(null)

  const handleSort = (field: keyof News) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
    // Reset to first page when sort changes
    setCurrentPage(1)
  }

  const sortedNews = useMemo(() => {
    return [...news].sort((a, b) => {
      if (a[sortField] < b[sortField]) return sortDirection === "asc" ? -1 : 1
      if (a[sortField] > b[sortField]) return sortDirection === "asc" ? 1 : -1
      return 0
    })
  }, [news, sortField, sortDirection])

  // Get paginated data
  const paginatedNews = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return sortedNews.slice(startIndex, startIndex + itemsPerPage)
  }, [sortedNews, currentPage, itemsPerPage])

  const csvColumns = useMemo(
    () => [
      { id: "newsID", header: "News ID" },
      { id: "title", header: "Title" },
      { id: "content", header: "Content" },
      { id: "newsDate", header: "News Date" },
      { id: "createdAt", header: "Created At" },
      { id: "updatedAt", header: "Updated At" },
    ],
    [],
  )

  const SortableHeader = ({ field, label }: { field: keyof News; label: string }) => (
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
  )

  return (
    <div ref={tableRef} className="rounded-lg border border-border shadow-sm overflow-hidden bg-white">
      <div className="sticky top-0 z-10 flex items-center justify-between p-5 border-b border-border bg-white">
        <div className="flex items-center space-x-4">
          <CsvExporter data={sortedNews} columns={csvColumns} tableName="news" isLoading={isLoading}>
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
            Post News
          </motion.button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-muted-foreground">
          <thead className="text-xs text-foreground uppercase bg-secondary sticky top-0">
            <tr>
              <SortableHeader field="newsID" label="ID" />
              <SortableHeader field="title" label="Title" />
              <SortableHeader field="newsDate" label="News Date" />
              <SortableHeader field="createdAt" label="Created At" />
              <SortableHeader field="updatedAt" label="Updated At" />
              <th scope="col" className="px-6 py-4 text-right">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <AnimatePresence>
              {paginatedNews.map((newsItem) => (
                <motion.tr
                  layout
                  key={newsItem.newsID}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`hover:bg-secondary transition-colors duration-200 ${
                    hoveredRow === newsItem.newsID ? "bg-secondary" : "bg-white"
                  }`}
                  onMouseEnter={() => setHoveredRow(newsItem.newsID)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <td className="px-6 py-4 font-medium text-adaptive-dark">{newsItem.newsID}</td>
                  <td className="px-6 py-4 font-medium">{newsItem.title}</td>
                  <td className="px-6 py-4">{formatDate(newsItem.newsDate)}</td>
                  <td className="px-6 py-4">{formatDate(newsItem.createdAt)}</td>
                  <td className="px-6 py-4">{formatDate(newsItem.updatedAt)}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-3">
                      {onEdit && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => onEdit(newsItem)}
                          className="text-brand hover:text-brand-dark transition-colors duration-200 p-1 rounded-full hover:bg-brand/10"
                          title="Edit news"
                          aria-label="Edit news"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </motion.button>
                      )}
                      {onDelete && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => onDelete(newsItem.newsID)}
                          className="text-brand hover:text-brand-dark transition-colors duration-200 p-1 rounded-full hover:bg-brand/10"
                          title="Delete news"
                          aria-label="Delete news"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </motion.button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
            {news.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-muted-foreground">
                  No news items found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <TablePagination
        currentPage={currentPage}
        totalItems={sortedNews.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
      />
    </div>
  )
}

export default NewsTable


