import { Button } from "@/components/ui/button";
import {
  Mail,
  Phone,
  User,
  Pencil,
  Building2,
  Files,
  Briefcase,
  Bookmark,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { StudentDocumentCard } from "../components/StudentDocumentCard";
import { Student } from "../interfaces/Student";
import axiosInstance from "@/lib/axios";
import { format } from "date-fns";

interface JobApplication {
  applicationID: number;
  jobID: number;
  jobTitle: string;
  jobLocation: string;
  companyName: string;
  companyLogoPath: string;
  resumePath: string;
  createdAt: string;
}

interface SavedJob {
  jobID: number;
  title: string;
  location: string;
  companyName: string;
  companyLogoPath: string;
  endDate: string;
  savedAt: string;
  isExpired: boolean;
}

// Update the formatDate function
const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return 'Not specified';

  try {
    const date = new Date(dateString);
    // Check if date is valid
    if (isNaN(date.getTime())) return 'Not specified';

    return format(date, 'PPP'); // This will format as "March 31st, 2025"
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Not specified';
  }
};

export function StudentProfilePage() {
  const navigate = useNavigate();
  const { userID } = useParams();
  const { user } = useAuth();
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [jobApplications, setJobApplications] = useState<JobApplication[]>([]);
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [loadingSavedJobs, setLoadingSavedJobs] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const isCurrentUser = user?.userType === "Student" && user?.userID === userID;

  // Update the date and time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchStudentData = async () => {
      if (!userID) {
        setError("No userID provided in URL");
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`/api/students/${userID}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.status === 401) {
          throw new Error("Unauthorized access");
        } else if (response.status === 404) {
          throw new Error("Student profile not found");
        } else if (!response.ok) {
          throw new Error("Failed to fetch student data");
        }

        const data = await response.json();
        setStudentData(data);
        setError(null);
      } catch (error) {
        console.error("Error fetching student data:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Failed to fetch student data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [userID]);

  useEffect(() => {
    const fetchJobApplications = async () => {
      if (!userID) return;

      try {
        const response = await axiosInstance.get(
          `/api/jobs/applications/student/${userID}`
        );
        setJobApplications(response.data);
      } catch (error) {
        console.error("Error fetching job applications:", error);
      }
    };

    fetchJobApplications();
  }, [userID]);

  // Fetch saved jobs
  useEffect(() => {
    const fetchSavedJobs = async () => {
      if (!isCurrentUser) return;

      setLoadingSavedJobs(true);
      try {
        const response = await axiosInstance.get('/api/jobs/saved');
        setSavedJobs(response.data.slice(0, 3)); // Show only the first 3 saved jobs
      } catch (error) {
        console.error('Error fetching saved jobs:', error);
      } finally {
        setLoadingSavedJobs(false);
      }
    };

    fetchSavedJobs();
  }, [isCurrentUser]);

  // Show error state
  if (error || !studentData) {
    return (
      <div className="min-h-screen bg-white pt-32 px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-xl font-semibold text-gray-900">
            {error ||
              (!userID ? "Invalid profile URL" : "Student profile not found")}
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-32 pb-32 px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Card with Profile Header */}
        <div className="bg-white rounded-lg border border-gray-200 mb-8 overflow-hidden">
          {/* Header Banner */}
          <div className="h-24 bg-[#800020] relative">
            <div className="absolute top-2 right-4 text-white text-right">
              <div className="text-lg font-semibold">
                {format(currentDateTime, 'MM/dd/yyyy')}
              </div>
              <div className="text-md">
                {format(currentDateTime, 'h:mm a')}
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Profile Photo and Student Number - Square image */}
              <div className="flex-shrink-0 -mt-16 md:-mt-20">
                <div className="w-32 h-32 md:w-40 md:h-40 border-4 border-white overflow-hidden rounded-lg">
                  <img
                    src={studentData.studentProfileImagePath}
                    alt={studentData.studentName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="inline-block px-4 py-2 bg-[#800020] text-white font-semibold mt-4 text-center w-full rounded-lg">
                  {studentData.studentNumber}
                </div>
              </div>

              {/* Profile Info - Better spacing */}
              <div className="flex-1 pt-4 md:pt-0">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-900">
                      {studentData.studentName}
                    </h1>
                    <p className="text-lg text-[#800020] font-medium">
                      {studentData.studentCategory} · {studentData.studentLevel}
                    </p>
                    {studentData.studentTitle && (
                      <p className="text-gray-500 italic mb-6">
                        {studentData.studentTitle}
                      </p>
                    )}

                    {/* Contact buttons */}
                    <div className="mt-6 flex flex-wrap gap-3">
                      <a
                        href={`mailto:${studentData.studentEmail}`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Mail className="w-4 h-4 text-[#800020]" />
                        <span className="truncate max-w-[180px]">
                          {studentData.studentEmail}
                        </span>
                      </a>
                      {studentData.studentContactNumber && (
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-md text-sm font-medium text-gray-700">
                          <Phone className="w-4 h-4 text-[#800020]" />
                          <span>{studentData.studentContactNumber}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {isCurrentUser && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2 border-[#800020] text-[#800020] hover:bg-rose-800 hover:text-white"
                      onClick={() =>
                        navigate(`/students/profile/edit/${userID}`)
                      }
                    >
                      <Pencil className="h-4 w-4" />
                      Edit Profile
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* About section - Aligned with profile image */}
            {studentData.studentDescription && (
              <div className="mt-8 bg-gray-50 rounded-md p-6 border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <User className="w-5 h-5 text-[#800020]" />
                  About Me
                </h2>
                <div
                  className="prose max-w-none text-gray-600 text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: studentData.studentDescription,
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Career Pathways - Card Layout */}
        <div className="bg-white pt-8 mb-8">
          <div className="flex justify-between items-center mb-4 ">
            <h2 className="text-2xl font-bold text-gray-900">
              Career Pathways
            </h2>
            {isCurrentUser && (
              <Button
                variant="outline"
                className="border-[#800020] text-[#800020] hover:bg-rose-800 hover:text-white"
                onClick={() =>
                  navigate(`/students/profile/career-pathways/edit/${userID}`)
                }
              >
                Edit Pathways
              </Button>
            )}
          </div>

          {studentData.studentCareerPathways &&
          studentData.studentCareerPathways.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {studentData.studentCareerPathways.map((pathway, index) => (
                <div
                  key={index}
                  className="px-6 py-3 bg-[#800020] text-white rounded-lg font-semibold"
                >
                  {pathway}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">
              No career pathways added yet.
            </p>
          )}
        </div>

        {/* Documents - Card Layout with Better Grid */}
        <div className="bg-white pt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Documents</h2>
            {isCurrentUser && (
              <Button
                variant="outline"
                className="border-[#800020] text-[#800020] hover:bg-rose-800 hover:text-white"
                onClick={() =>
                  navigate(`/students/profile/documents/edit/${userID}`)
                }
              >
                Manage Documents
              </Button>
            )}
          </div>

          {studentData.studentDocuments &&
          studentData.studentDocuments.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {studentData.studentDocuments.map((doc, index) => (
                <StudentDocumentCard
                  key={`doc-${index}`}
                  title={doc.stuDocType || "Document"}
                  isUploaded={true}
                  document={{
                    name: doc.stuDocName,
                    url: doc.stuDocURL,
                    type: doc.stuDocType,
                  }}
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">No documents uploaded yet.</p>
          )}
        </div>

        {/* Job Applications section */}
        <div className="bg-white pt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Briefcase className="w-6 h-6 text-[#800020]" />
              Job Applications
            </h2>
            {isCurrentUser && (
              <Button
                variant="outline"
                className="border-[#800020] text-[#800020] hover:bg-rose-800 hover:text-white"
                onClick={() => navigate(`/profile/jobs-applications/edit/${userID}`)}
              >
                View All Applications
              </Button>
            )}
          </div>

          {jobApplications.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {jobApplications.map((application) => (
                <div
                  key={application.applicationID}
                  className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    {application.companyLogoPath ? (
                      <img
                        src={application.companyLogoPath}
                        alt={application.companyName}
                        className="w-12 h-12 object-contain rounded"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">
                        {application.jobTitle}
                      </h3>
                      <p className="text-sm text-gray-600 truncate">
                        {application.companyName}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Applied on: {formatDate(application.submittedAt)}
                      </p>
                      <a
                        href={application.resumePath}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#800020] hover:text-rose-700 text-xs font-medium mt-2 inline-block"
                      >
                        View Resume
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">
              No job applications submitted yet.
            </p>
          )}
        </div>

        {/* Saved Jobs section */}
        {isCurrentUser && (
          <div className="bg-white pt-8 mt-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Bookmark className="w-6 h-6 text-[#800020]" />
                Saved Jobs
              </h2>
              <Button
                variant="outline"
                className="border-[#800020] text-[#800020] hover:bg-rose-800 hover:text-white"
                onClick={() => navigate(`/saved-jobs`)}
              >
                View All Saved Jobs
              </Button>
            </div>

            {loadingSavedJobs ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#800020]"></div>
              </div>
            ) : savedJobs.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedJobs.map((job) => (
                  <div
                    key={job.jobID}
                    className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => navigate(`/jobs/${job.jobID}`)}
                  >
                    <div className="flex items-start gap-3">
                      {job.companyLogoPath ? (
                        <img
                          src={job.companyLogoPath}
                          alt={job.companyName}
                          className="w-12 h-12 object-contain rounded"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                          <Building2 className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900 truncate">
                          {job.title}
                        </h3>
                        <p className="text-sm text-gray-600 truncate">
                          {job.companyName}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Deadline: {formatDate(job.endDate)}
                        </p>
                        {job.isExpired && (
                          <span className="inline-block px-2 py-1 text-xs bg-red-100 text-red-800 rounded mt-2">
                            Expired
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <Bookmark className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-2">No saved jobs yet</p>
                <p className="text-gray-400 text-sm mb-4">
                  Save jobs you're interested in to receive notifications about application deadlines.
                </p>
                <Button
                  onClick={() => navigate('/jobs')}
                  className="bg-[#800020] hover:bg-rose-800 text-white"
                >
                  Browse Jobs
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
