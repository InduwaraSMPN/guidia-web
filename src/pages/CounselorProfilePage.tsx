import { Button } from "@/components/ui/button";
import { Mail, Phone, User, Pencil, Settings, MapPin, Briefcase, GraduationCap, Languages, Calendar } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { AzureImage } from "@/lib/imageUtils";

interface CounselorData {
  counselorID: string;
  counselorName: string;
  counselorPosition: string;
  counselorEducation: string;
  counselorContactNumber: string;
  counselorEmail: string;
  counselorDescription: string;
  counselorProfileImagePath: string;
  counselorExperienceYears: number;
  counselorLocation: string;
  counselorLanguages: string[];
  counselorSpecializations: string[];
}

export function CounselorProfilePage() {
  const navigate = useNavigate();
  const { userID } = useParams();
  const { user } = useAuth();
  const [counselorData, setCounselorData] = useState<CounselorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const isCurrentUser = user?.userType === "Counselor" && user?.userID === userID;

  // Update the date and time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchCounselorData = async () => {
      if (!userID) {
        setError("No userID provided in URL");
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem("token");
        const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/counselors/${userID}`;

        const response = await fetch(apiUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!isMounted) return;

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (isMounted) {
          setCounselorData(data);
          setLoading(false);
        }
      } catch (error) {
        if (isMounted) {
          setError(error instanceof Error ? error.message : 'An error occurred');
          setLoading(false);
        }
      }
    };

    fetchCounselorData();

    return () => {
      isMounted = false;
    };
  }, [userID]);


  if (loading) {
    return (
      <div className="min-h-screen bg-secondary/20 pt-32 pb-32 px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Card with Profile Header */}
          <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
            {/* Header Banner Skeleton */}
            <Skeleton className="h-32 w-full" />

            <div className="p-8 pt-16">
              <div className="flex flex-col md:flex-row gap-8">
                {/* Profile Photo Skeleton */}
                <div className="flex-shrink-0 relative w-40 h-40">
                  <Skeleton className="w-32 h-32 md:w-40 md:h-40 border-4 border-white rounded-xl absolute -top-24 left-1/2 md:left-0 transform -translate-x-1/2 md:translate-x-0" />
                </div>

                {/* Profile Info Skeleton */}
                <div className="flex-1 pt-4 md:pt-0">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <Skeleton className="h-8 w-64 mb-3" />
                      <div className="mb-3 flex items-center gap-3">
                        <Skeleton className="h-6 w-32 rounded-full" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <Skeleton className="h-6 w-48 mb-2" />
                      <Skeleton className="h-4 w-72" />
                    </div>
                  </div>

                  {/* Contact buttons Skeleton */}
                  <div className="flex flex-wrap gap-3 mt-6">
                    <Skeleton className="h-10 w-32" />
                    <Skeleton className="h-10 w-32" />
                  </div>
                </div>
              </div>

              {/* About section skeleton */}
              <div className="mt-8">
                <Skeleton className="h-6 w-32 mb-4" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            </div>
          </div>



          {/* Languages Skeleton */}
          <div className="bg-white rounded-xl shadow-sm border border-border p-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-2 rounded-full" />
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-6 w-32" />
              </div>
              <Skeleton className="h-10 w-32" />
            </div>
            <div className="flex flex-wrap gap-3">
              {[...Array(3)].map((_, index) => (
                <Skeleton key={index} className="h-10 w-24 rounded-lg" />
              ))}
            </div>
          </div>

          {/* Specializations Skeleton */}
          <div className="bg-white rounded-xl shadow-sm border border-border p-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-2 rounded-full" />
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-6 w-48" />
              </div>
              <Skeleton className="h-10 w-32" />
            </div>
            <div className="flex flex-wrap gap-3">
              {[...Array(6)].map((_, index) => (
                <Skeleton key={index} className="h-10 w-24 rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !counselorData) {
    return (
      <div className="min-h-screen bg-white pt-32 px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-xl font-semibold text-adaptive-dark">
            {error || (!userID ? "Invalid profile URL" : "Counselor profile not found")}
          </h2>
        </div>
      </div>
    );
  }

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <main
      className="min-h-screen bg-secondary/20 pt-32 pb-32 px-6 lg:px-8"
      tabIndex={-1}
      aria-labelledby="profile-heading"
    >
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Card with Profile Header */}
        <motion.section
          className="bg-white rounded-xl shadow-sm border border-border overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          aria-labelledby="profile-heading"
        >
          {/* Header Banner with subtle gradient overlay */}
          <div className="relative h-32 bg-brand overflow-hidden" role="presentation">
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-transparent"></div>
          </div>

          <div className="p-8 relative">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Profile Photo with enhanced positioning and subtle animation */}
              <div className="flex-shrink-0 relative w-40 h-40 mb-16 md:mb-0">
                <motion.div
                  className="w-32 h-32 md:w-40 md:h-40 border-4 border-white overflow-hidden rounded-xl shadow-lg transition-all duration-300 absolute -top-24 left-1/2 md:left-0 transform -translate-x-1/2 md:translate-x-0 bg-white"
                  aria-hidden="true"
                  whileHover={{ scale: 1.03 }}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <AzureImage
                    src={counselorData.counselorProfileImagePath}
                    alt={counselorData.counselorName || "Counselor profile image"}
                    className="w-full h-full object-cover"
                    userType="counselor"
                  />
                </motion.div>
              </div>

              {/* Profile Info with improved visual hierarchy */}
              <div className="flex-1 pt-4 md:pt-0">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <motion.div
                      initial={{ y: -10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                    >
                      <h1 id="profile-heading" className="text-3xl font-bold text-adaptive-dark mb-3">
                        {counselorData.counselorName}
                      </h1>
                    </motion.div>

                    <motion.div
                      className="flex flex-wrap items-center gap-3 mb-3"
                      initial={{ y: -5, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                    >
                      <span className="inline-flex px-3 py-1 bg-brand text-white text-sm font-medium rounded-full shadow-sm transition-all duration-200 hover:shadow-md">
                        {counselorData.counselorPosition}
                      </span>
                      <span className="flex items-center text-muted-foreground text-sm">
                        <MapPin className="h-3.5 w-3.5 mr-1" />
                        {counselorData.counselorLocation}
                      </span>
                    </motion.div>

                    <motion.p
                      className="text-lg text-brand font-medium mb-2"
                      initial={{ y: -5, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.3 }}
                    >
                      {counselorData.counselorEducation}
                    </motion.p>

                    <motion.p
                      className="text-muted-foreground flex items-center gap-1"
                      initial={{ y: -5, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.4 }}
                    >
                      <Calendar className="h-4 w-4 text-brand" aria-hidden="true" />
                      <span>{counselorData.counselorExperienceYears} years of experience</span>
                    </motion.p>

                    {/* Contact buttons with improved styling and micro-interactions */}
                    <motion.div
                      className="mt-6 flex flex-wrap gap-3"
                      initial={{ y: -5, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.5 }}
                    >
                      <motion.a
                        href={`mailto:${counselorData.counselorEmail}`}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-md text-sm font-medium text-foreground hover:bg-secondary transition-all duration-200 hover:shadow-md group"
                        aria-label={`Email ${counselorData.counselorName} at ${counselorData.counselorEmail}`}
                        whileHover={{ y: -2 }}
                        whileTap={{ y: 0 }}
                      >
                        <Mail className="w-4 h-4 text-brand group-hover:scale-110 transition-transform duration-200" aria-hidden="true" />
                        <span className="truncate max-w-[180px]">{counselorData.counselorEmail}</span>
                      </motion.a>

                      {counselorData.counselorContactNumber && (
                        <motion.div
                          className="inline-flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-md text-sm font-medium text-foreground group"
                          whileHover={{ y: -2, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}
                          whileTap={{ y: 0 }}
                        >
                          <Phone className="w-4 h-4 text-brand group-hover:scale-110 transition-transform duration-200" aria-hidden="true" />
                          <span>{counselorData.counselorContactNumber}</span>
                        </motion.div>
                      )}

                      {isCurrentUser && (
                        <motion.div
                          className="ml-auto"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button
                            variant="outline"
                            className="border-brand text-brand hover:bg-brand hover:text-white transition-all duration-300 focus:ring-2 focus:ring-brand focus:ring-offset-2 shadow-sm hover:shadow"
                            onClick={() => navigate(`/counselor/profile/edit/${userID}`)}
                            aria-label="Edit your profile"
                          >
                            <Pencil className="w-4 h-4 mr-2" aria-hidden="true" />
                            Edit Profile
                          </Button>
                        </motion.div>
                      )}
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>

            {/* About section with improved styling */}
            {counselorData.counselorDescription && (
              <motion.div
                className="mt-8 bg-secondary/30 rounded-xl p-6 border border-border/50 hover:border-border transition-all duration-300 hover:shadow-md"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <h2 className="text-lg font-semibold text-adaptive-dark mb-4 flex items-center gap-2">
                  <span className="p-1.5 rounded-full bg-brand/10">
                    <User className="w-5 h-5 text-brand" aria-hidden="true" />
                  </span>
                  About Me
                </h2>
                <div
                  className="prose max-w-none text-muted-foreground text-sm leading-relaxed overflow-hidden"
                  dangerouslySetInnerHTML={{ __html: counselorData.counselorDescription.length > 500
                    ? counselorData.counselorDescription.substring(0, 500) + '...'
                    : counselorData.counselorDescription }}
                />
              </motion.div>
            )}
          </div>
        </motion.section>

        {/* Languages - Card Layout with improved styling */}
        <motion.section
          className="bg-card rounded-xl shadow-sm border border-border p-8 hover:shadow-md transition-all duration-300"
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.1 }}
          aria-labelledby="languages-heading"
        >
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
            <h2 id="languages-heading" className="text-2xl font-bold text-adaptive-dark flex items-center">
              <span className="w-1.5 h-6 bg-brand rounded-full mr-3 inline-block" aria-hidden="true"></span>
              <span className="p-1.5 mr-2">
                <Languages className="w-5 h-5 text-brand" aria-hidden="true" />
              </span>
              Languages
            </h2>
            {isCurrentUser && (
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="outline"
                  className="border-brand text-brand hover:bg-brand hover:text-white transition-all duration-300 focus:ring-2 focus:ring-brand focus:ring-offset-2 shadow-sm hover:shadow"
                  onClick={() => navigate(`/counselor/profile/languages/edit/${userID}`)}
                  aria-label="Edit languages"
                >
                  <Pencil className="w-4 h-4 mr-2" aria-hidden="true" />
                  Edit Languages
                </Button>
              </motion.div>
            )}
          </div>

          {counselorData?.counselorLanguages && counselorData?.counselorLanguages.length > 0 ? (
            <div className="flex flex-wrap gap-3" role="list" aria-label="Languages">
              {counselorData?.counselorLanguages.map((language, index) => (
                <motion.div
                  key={index}
                  className="px-6 py-3 text-brand rounded-lg font-semibold border border-brand hover:bg-brand hover:text-white transition-all duration-300 cursor-default hover:shadow-sm"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  whileHover={{ y: -2 }}
                  whileTap={{ y: 0 }}
                  role="listitem"
                >
                  {language}
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-secondary/30 rounded-lg">
              <p className="text-muted-foreground italic">No languages added yet.</p>
              {isCurrentUser && (
                <motion.div
                  className="mt-4 inline-block"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    className="bg-brand hover:bg-brand-dark text-white transition-colors focus:ring-2 focus:ring-brand focus:ring-offset-2 shadow-sm hover:shadow"
                    onClick={() => navigate(`/counselor/profile/languages/edit/${userID}`)}
                  >
                    Add Languages
                  </Button>
                </motion.div>
              )}
            </div>
          )}
        </motion.section>

        {/* Specializations - Card Layout with improved styling */}
        <motion.section
          className="bg-card rounded-xl shadow-sm border border-border p-8 hover:shadow-md transition-all duration-300"
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.2 }}
          aria-labelledby="specializations-heading"
        >
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
            <h2 id="specializations-heading" className="text-2xl font-bold text-adaptive-dark flex items-center">
              <span className="w-1.5 h-6 bg-brand rounded-full mr-3 inline-block" aria-hidden="true"></span>
              <span className="p-1.5 mr-2">
                <GraduationCap className="w-5 h-5 text-brand" aria-hidden="true" />
              </span>
              Specializations
            </h2>
            {isCurrentUser && (
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="outline"
                  className="border-brand text-brand hover:bg-brand hover:text-white transition-all duration-300 focus:ring-2 focus:ring-brand focus:ring-offset-2 shadow-sm hover:shadow"
                  onClick={() => navigate(`/counselor/profile/specializations/edit/${userID}`)}
                  aria-label="Edit specializations"
                >
                  <Pencil className="w-4 h-4 mr-2" aria-hidden="true" />
                  Edit Specializations
                </Button>
              </motion.div>
            )}
          </div>

          {counselorData?.counselorSpecializations && counselorData?.counselorSpecializations.length > 0 ? (
            <div className="flex flex-wrap gap-3" role="list" aria-label="Specializations">
              {counselorData?.counselorSpecializations.map((specialization, index) => (
                <motion.div
                  key={index}
                  className="px-6 py-3 text-brand rounded-lg font-semibold border border-brand hover:bg-brand hover:text-white transition-all duration-300 cursor-default hover:shadow-sm"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + index * 0.05 }}
                  whileHover={{ y: -2 }}
                  whileTap={{ y: 0 }}
                  role="listitem"
                >
                  {specialization}
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-secondary/30 rounded-lg">
              <p className="text-muted-foreground italic">No specializations added yet.</p>
              {isCurrentUser && (
                <motion.div
                  className="mt-4 inline-block"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    className="bg-brand hover:bg-brand-dark text-white transition-colors focus:ring-2 focus:ring-brand focus:ring-offset-2 shadow-sm hover:shadow"
                    onClick={() => navigate(`/counselor/profile/specializations/edit/${userID}`)}
                  >
                    Add Specializations
                  </Button>
                </motion.div>
              )}
            </div>
          )}
        </motion.section>
      </div>
    </main>
  );
}



