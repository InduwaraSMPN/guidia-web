import type React from "react";

import { useState } from "react";
import { NewsModal } from "./NewsModal";
import { Calendar, Trash2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { motion } from "framer-motion";

export interface NewsItem {
  id?: string;
  title: string;
  description: string;
  date: string;
  images: string[];
}

interface NewsCardProps {
  news: NewsItem;
  onDelete?: () => void;
}

export function NewsCard({ news, onDelete }: NewsCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();

    toast.promise(
      new Promise((resolve, reject) => {
        toast("Are you sure you want to delete this news item?", {
          position: "top-center",
          action: {
            label: "Delete",
            onClick: async () => {
              try {
                setIsDeleting(true);
                const response = await fetch(
                  `http://localhost:3001/api/news/${news.id}`,
                  {
                    method: "DELETE",
                  }
                );

                if (!response.ok) {
                  throw new Error("Failed to delete news");
                }

                onDelete?.();
                resolve("News deleted successfully");
              } catch (error) {
                console.error("Error deleting news:", error);
                reject(error);
              } finally {
                setIsDeleting(false);
              }
            },
          },
          cancel: {
            label: "Cancel",
            onClick: () => reject("Cancelled"),
          },
        });
      }),
      {
        loading: "Deleting news...",
        success: "News deleted successfully",
        error: "Failed to delete news",
      }
    );
  };

  return (
    <>
      <motion.div
        whileHover={{
          y: -4,
          boxShadow:
            "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
        }}
        transition={{ duration: 0.2 }}
        onClick={() => setIsModalOpen(true)}
        className="rounded-lg border border-gray-200 overflow-hidden hover:border-gray-300 transition-all cursor-pointer relative group h-full flex flex-col"
      >
        {news.images?.[0] && (
          <div className="w-full h-48 overflow-hidden">
            <img
              src={news.images[0] || "/placeholder.svg"}
              alt={news.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        )}

        <div className="p-5 flex-1 flex flex-col">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Calendar className="h-4 w-4" />
            <span>{news.date}</span>
          </div>

          <h3 className="text-xl font-medium text-gray-900 mb-3 line-clamp-2 group-hover:text-[#800020] transition-colors">
            {news.title}
          </h3>

          <div
            className="prose max-w-none text-gray-600 text-sm leading-relaxed line-clamp-3 mb-4 flex-1"
            dangerouslySetInnerHTML={{ __html: news.description }}
          />

          <div className="mt-auto">
            <span className="text-sm font-medium text-[#800020] group-hover:underline">
              Read more
            </span>
          </div>
        </div>

        {user?.userType === "Admin" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute top-3 right-3 z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-[#800020] hover:bg-rose-800 shadow-lg"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </motion.div>

      <NewsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        news={news}
      />
    </>
  );
}
