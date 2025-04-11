import type React from "react";

import { Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { DirectoryCard } from "@/components/DirectoryCard";
import { FilterPanel, type FilterSection } from "@/components/FilterPanel";
import { useEffect, useState, useTransition, useRef } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";

const AVAILABLE_PATHS = [
  'DevOps Engineer',
  'Software Engineer',
  'Cloud Engineer',
  'Data Scientist',
  'UI/UX Designer',
  'Product Manager',
  'Business Analyst',
  'Full Stack Developer',
  'Network Engineer',
  'Systems Architect',
  'Others'
];

interface Student {
  userID: string;
  studentName: string;
  studentCategory: string;
  studentLevel: string;
  studentTitle: string;
  studentEmail: string;
  studentContactNumber: string;
  studentProfileImagePath: string;
  studentCareerPathways: string; // Add this field
}

export function StudentsPage() {
  const location = useLocation();
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({
    categories: [] as string[],
    levels: [] as string[],
    careerPathways: [] as string[], // Add this filter
  });

  const filterPanelRef = useRef<HTMLDivElement>(null);

  // Close filters when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterPanelRef.current && !filterPanelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    }
  }, []);

  // Get unique values for filters
  const categories = [...new Set(students.map(student => student.studentCategory))];
  const levels = [...new Set(students.map(student => student.studentLevel))];
  const careerPathways = AVAILABLE_PATHS;

  const handleFilterChange = (
    filterType: "categories" | "levels" | "careerPathways",
    value: string
  ) => {
    setFilters((prev) => {
      const currentValues = [...prev[filterType]];
      const newValues = currentValues.includes(value)
        ? currentValues.filter((v) => v !== value)
        : [...currentValues, value];

      return {
        ...prev,
        [filterType]: newValues,
      };
    });
  };

  const clearFilters = () => {
    setFilters({
      categories: [],
      levels: [],
      careerPathways: [],
    });
  };

  const activeFilterCount = 
    filters.categories.length + 
    filters.levels.length + 
    filters.careerPathways.length;

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch("/api/students");
        if (!response.ok) {
          throw new Error("Failed to fetch students");
        }
        const data = await response.json();
        setStudents(data);
        setFilteredStudents(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  useEffect(() => {
    startTransition(() => {
      let filtered = [...students];

      // Apply search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(
          (student) =>
            student.studentName.toLowerCase().includes(query) ||
            student.studentCategory.toLowerCase().includes(query) ||
            student.studentLevel.toLowerCase().includes(query)
        );
      }

      // Apply category filters
      if (filters.categories.length > 0) {
        filtered = filtered.filter(student =>
          filters.categories.includes(student.studentCategory)
        );
      }

      // Apply level filters
      if (filters.levels.length > 0) {
        filtered = filtered.filter(student =>
          filters.levels.includes(student.studentLevel)
        );
      }

      // Apply career pathways filters - simplified like categories
      if (filters.careerPathways.length > 0) {
        filtered = filtered.filter(student =>
          filters.careerPathways.includes(student.careerPathway)
        );
      }

      setFilteredStudents(filtered);
    });
  }, [searchQuery, students, filters]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
      },
    },
  };

  if (loading) {
    return (
      <div
        className={`min-h-screen bg-white ${
          location.pathname.startsWith("/admin") ? "pt-6" : "pt-32"
        }`}
      >
        <div className="max-w-[1216px] mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-brand mb-8">Students</h1>
          <div className="relative mb-12 max-w-lg ml-auto">
            <div className="h-12 bg-secondary-dark rounded-md animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-xs p-4 h-28 animate-pulse"
              >
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 bg-secondary-dark rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-secondary-dark rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-secondary-dark rounded w-1/2"></div>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <div className="h-8 bg-secondary-dark rounded flex-1"></div>
                  <div className="h-8 bg-secondary-dark rounded flex-1"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`min-h-screen bg-white ${
          location.pathname.startsWith("/admin") ? "pt-6" : "pt-32"
        }`}
      >
        <div className="max-w-[1216px] mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-brand mb-8">Students</h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-red-700 mb-2">
              Oops! Something went wrong
            </h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-brand text-white rounded-md hover:bg-brand-dark transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const filterSections: FilterSection[] = [
    {
      title: "Career Pathways",
      items: careerPathways,
      selectedItems: filters.careerPathways,
      onChange: (value) => handleFilterChange("careerPathways", value)
    },
    {
      title: "Category",
      items: categories,
      selectedItems: filters.categories,
      onChange: (value) => handleFilterChange("categories", value)
    },
    {
      title: "Level",
      items: levels,
      selectedItems: filters.levels,
      onChange: (value) => handleFilterChange("levels", value)
    }
  ];

  return (
    <div
      className={`min-h-screen bg-white ${
        location.pathname.startsWith("/admin") ? "pt-6" : "pt-32"
      }`}
    >
      <div className="max-w-[1216px] mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold text-brand mb-6"
        >
          Students
        </motion.h1>

        <div className="flex items-center justify-between mb-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative flex-1 max-w-md"
          >
            <Input
              type="search"
              placeholder="Search by name, category, or level..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </motion.div>

          <div className="relative ml-4">
            <button
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                isOpen || activeFilterCount > 0 ? "bg-brand text-white" : "text-foreground hover:bg-secondary-light"
              }`}
              onClick={() => setIsOpen(true)}
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="bg-white text-brand text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            <FilterPanel
              sections={filterSections}
              onClose={() => setIsOpen(false)}
              onClearAll={clearFilters}
              isOpen={isOpen}
              setIsOpen={setIsOpen}
            />
          </div>
        </div>

        {filteredStudents.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-16 bg-secondary rounded-lg"
          >
            <h2 className="text-xl font-semibold text-foreground mb-2">
              No students found
            </h2>
            <p className="text-muted-foreground">Try adjusting your search criteria</p>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {filteredStudents.map((student) => (
              <motion.div key={student.userID} variants={itemVariants}>
                <DirectoryCard
                  type="student"
                  id={student.userID}
                  name={student.studentName}
                  subtitle={`${student.studentCategory} - ${student.studentLevel}`}
                  title={student.studentTitle}
                  email={student.studentEmail}
                  contactNumber={student.studentContactNumber}
                  image={student.studentProfileImagePath}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}


