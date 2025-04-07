import { useState, useEffect } from 'react';
import { SearchBar } from '../../components/SearchBar';
import { toast } from '../../components/ui/sonner';
import { useNavigate } from 'react-router-dom';
import { NewsTable } from '../../components/admin/NewsTable';
import axios from 'axios';

interface News {
  newsID: string;
  title: string;
  content: string;
  newsDate: string;
  createdAt: string;
  updatedAt: string;
}

export function AdminNewsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [news, setNews] = useState<News[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await axios.get<News[]>('/api/news');
        setNews(response.data);
      } catch (error) {
        console.error('Error fetching news:', error);
        toast.error('Failed to load news articles');
      } finally {
        setIsLoading(false);
      }
    };

    fetchNews();
  }, []);

  const handleDelete = async (newsId: string) => {
    // Show confirmation toast
    toast('Are you sure you want to delete this news article?', {
      position: 'top-center',
      action: {
        label: 'Delete',
        onClick: async () => {
          try {
            await axios.delete(`/api/news/${newsId}`);
            setNews(news.filter(newsItem => newsItem.newsID !== newsId));
            toast.success('News article deleted successfully');
          } catch (error) {
            console.error('Error deleting news:', error);
            toast.error('Failed to delete news article');
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

  const handleEdit = (newsItem: News) => {
    navigate(`/admin/news/edit/${newsItem.newsID}`);
  };

  const handleAdd = () => {
    navigate('/admin/news/post');
  };

  const filteredNews = news.filter(newsItem =>
    newsItem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    newsItem.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 max-w-[1216px] mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#800020]">News Management</h1>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search news..."
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        {isLoading ? (
          <div className="p-6 text-center"></div>
        ) : (
          <NewsTable
            news={filteredNews}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAdd={handleAdd}
          />
        )}
      </div>
    </div>
  );
}
