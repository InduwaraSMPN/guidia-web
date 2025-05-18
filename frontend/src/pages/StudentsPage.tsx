import type React from "react";

import { Search, SlidersHorizontal, X, Users } from "lucide-react";

import { DirectoryCard } from "@/components/DirectoryCard";
import { FilterPanel, type FilterSection } from "@/components/FilterPanel";
import { useEffect, useState, useTransition, useRef } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { PageLayout } from "@/components/PageLayout";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { SearchBar } from "@/components/SearchBar";

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

  const handleSearch = (value: string) => {
    setSearchQuery(value);
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
      <PageLayout>
        <PageHeader
          title="Students"
          icon={Users}
          actions={
            <div className="flex items-center gap-4">
              <div className="relative w-full md:w-64 lg:w-80">
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="ml-4">
                <Skeleton className="h-10 w-32" />
              </div>
            </div>
          }
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-sm border border-border p-3 sm:p-4"
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <Skeleton className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg" />
                <div className="flex-1 space-y-1 sm:space-y-2">
                  <Skeleton className="h-4 sm:h-5 w-3/4" />
                  <Skeleton className="h-3 sm:h-4 w-1/2" />
                </div>
              </div>
              <div className="mt-3 sm:mt-4 space-y-1 sm:space-y-2">
                <Skeleton className="h-3 sm:h-4 w-full" />
                <Skeleton className="h-3 sm:h-4 w-5/6" />
              </div>
              <div className="flex gap-2 mt-3 sm:mt-4">
                <Skeleton className="h-8 sm:h-9 w-full" />
                <Skeleton className="h-8 sm:h-9 w-full" />
              </div>
            </div>
          ))}
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <PageHeader title="Students" icon={Users} />
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
      </PageLayout>
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
    <PageLayout>
      <PageHeader
        title="Students"
        icon={Users}
        actions={
          <div className="flex items-center gap-4">
            <div className="relative w-full md:w-64 lg:w-80">
              <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search students..." />
            </div>

            {/* Add Filters Button Here */}
            <div className="relative">
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
        }
      />

        {filteredStudents.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No students found"
            description="Try adjusting your search criteria"
          />
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6"
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
    </PageLayout>
  );
}


