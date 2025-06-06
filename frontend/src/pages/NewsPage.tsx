

import { Plus, Newspaper } from "lucide-react"
import { SearchBar } from "../components/SearchBar"
import { NewsCard, type NewsItem } from "../components/NewsCard"
import { Button } from "../components/ui/button"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"
import { PageLayout } from "@/components/PageLayout"
import { PageHeader } from "@/components/PageHeader"
import { EmptyState } from "@/components/EmptyState"

export function NewsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [newsItems, setNewsItems] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetchNews()
  }, [])

  const fetchNews = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}/api/news`)
      if (!response.ok) {
        throw new Error("Failed to fetch news")
      }
      const data = await response.json()

      // Transform the data to match NewsItem interface
      const transformedData = data.map((news: any) => ({
        id: news.newsID.toString(),
        title: news.title,
        description: news.content,
        date: new Date(news.newsDate).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        images: news.imageURLs ? JSON.parse(news.imageURLs) : [],
      }))

      setNewsItems(transformedData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch news")
    } finally {
      // Add a small delay to ensure the skeleton is visible for at least a moment
      setTimeout(() => {
        setLoading(false)
      }, 500);
    }
  }

  const handleNewsDeleted = () => {
    // Refresh the news list
    fetchNews()
  }

  // Filter news based on search query
  const filteredNews = newsItems.filter((news) => news.title.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <PageLayout>
      <PageHeader
        title="News"
        icon={Newspaper}
        actions={
          <>
            <div className="relative w-full md:w-64 lg:w-80">
              <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search news..." />
            </div>

            {user?.userType === "Admin" && (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={() => navigate("/news/post")}
                  className="flex items-center gap-2 bg-brand hover:bg-brand-dark transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Post News
                </Button>
              </motion.div>
            )}
          </>
        }
      />

          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-sm border border-border overflow-hidden animate-pulse">
                    <Skeleton className="w-full h-48" />
                    <div className="p-5 space-y-3">
                      <Skeleton className="h-6 w-3/4" />
                      <div className="flex justify-between items-center">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-4 rounded-full" />
                      </div>
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                      <div className="flex justify-between items-center pt-2">
                        <Skeleton className="h-8 w-24" />
                        <Skeleton className="h-8 w-8 rounded-full" />
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            ) : error ? (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-16 px-4 max-w-md mx-auto"
              >
                <div className="bg-red-50 p-6 rounded-lg border border-red-100">
                  <p className="text-red-600 text-lg mb-4">{error}</p>
                  <Button onClick={fetchNews} variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
                    Try Again
                  </Button>
                </div>
              </motion.div>
            ) : filteredNews.length === 0 ? (
              <EmptyState
                icon={Newspaper}
                title={`No news found${searchQuery ? " matching your search" : ""}`}
                action={searchQuery ? { label: "Clear Search", onClick: () => setSearchQuery("") } : undefined}
              />
            ) : (
              <motion.div
                key="content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ staggerChildren: 0.1 }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredNews.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <NewsCard news={item} onDelete={handleNewsDeleted} />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
      </PageLayout>
  )
}



