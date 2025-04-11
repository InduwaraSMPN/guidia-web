

import { Plus, Newspaper } from "lucide-react"
import { SearchBar } from "../components/SearchBar"
import { NewsCard, type NewsItem } from "../components/NewsCard"
import { Button } from "../components/ui/button"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

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
    try {
      const response = await fetch("http://localhost:3001/api/news")
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
        images: JSON.parse(news.imageURLs),
      }))

      setNewsItems(transformedData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch news")
    } finally {
      setLoading(false)
    }
  }

  const handleNewsDeleted = () => {
    // Refresh the news list
    fetchNews()
  }

  // Filter news based on search query
  const filteredNews = newsItems.filter((news) => news.title.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className={`min-h-screen bg-white ${location.pathname.startsWith("/admin") ? "pt-6" : "pt-32"}`}>
      <div className="max-w-[1216px] mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <header className="mb-16">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
              <div className="flex items-center gap-3">
                <Newspaper className="h-8 w-8 text-brand" />
                <h1 className="text-4xl font-bold text-brand">News</h1>
              </div>

              <div className="flex items-center gap-4">
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
              </div>
            </div>
          </header>

          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-16"
              >
                <div className="w-16 h-16 border-4 border-border border-t-[#800020] rounded-full animate-spin mb-4" />
                <p className="text-muted-foreground text-lg">Loading the latest news...</p>
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
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-16"
              >
                <div className="bg-secondary p-8 rounded-xl max-w-md mx-auto">
                  <Newspaper className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-muted-foreground text-lg mb-2">
                    No news found
                    {searchQuery && " matching your search"}
                  </p>
                  {searchQuery && (
                    <Button onClick={() => setSearchQuery("")} variant="outline" className="mt-4">
                      Clear Search
                    </Button>
                  )}
                </div>
              </motion.div>
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
        </motion.div>
      </div>
    </div>
  )
}



