import { Button } from "@/components/ui/button";
import { Mail, Phone, User, Pencil, Settings } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { format } from "date-fns";

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

  return (
    <div className="min-h-screen bg-white pt-32 pb-32 px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Card with Profile Header */}
        <div className="bg-white rounded-lg border border-border mb-8 overflow-hidden">
          {/* Header Banner */}
          <div className="h-24 bg-brand relative"></div>

          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Profile Photo and Position - Square image */}
              <div className="flex-shrink-0 -mt-16 md:-mt-20">
                <div className="w-32 h-32 md:w-40 md:h-40 border-4 border-white overflow-hidden rounded-lg">
                  <img
                    src={counselorData.counselorProfileImagePath}
                    alt={counselorData.counselorName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="inline-block px-4 py-2 bg-brand text-white font-semibold mt-4 text-center w-full rounded-lg">
                  {counselorData.counselorPosition}
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1 pt-4 md:pt-0">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold text-adaptive-dark">{counselorData.counselorName}</h1>
                    <p className="text-lg text-brand font-medium">
                      {counselorData.counselorEducation}
                    </p>
                    <p className="text-muted-foreground italic mb-6">
                      {counselorData.counselorExperienceYears} years of experience · {counselorData.counselorLocation}
                    </p>

                    {/* Contact buttons */}
                    <div className="mt-6 flex flex-wrap gap-3">
                      <a
                        href={`mailto:${counselorData.counselorEmail}`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-border rounded-md text-sm font-medium text-foreground hover:bg-secondary transition-colors"
                      >
                        <Mail className="w-4 h-4 text-brand" />
                        <span className="truncate max-w-[180px]">{counselorData.counselorEmail}</span>
                      </a>
                      {counselorData.counselorContactNumber && (
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-border rounded-md text-sm font-medium text-foreground">
                          <Phone className="w-4 h-4 text-brand" />
                          <span>{counselorData.counselorContactNumber}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Profile controls moved to dropdown menu */}
                </div>
              </div>
            </div>

            {/* About section */}
            {counselorData.counselorDescription && (
              <div className="mt-8 bg-secondary rounded-md p-6 border border-border">
                <h2 className="text-lg font-semibold text-adaptive-dark mb-3 flex items-center gap-2">
                  <User className="w-5 h-5 text-brand" />
                  About Me
                </h2>
                <div
                  className="prose max-w-none text-muted-foreground text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: counselorData.counselorDescription }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Languages */}
        <div className="bg-white pt-8 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-adaptive-dark">Languages</h2>
            {isCurrentUser && (
              <Button
                variant="outline"
                className="border-brand text-brand hover:bg-brand-dark hover:text-white"
                onClick={() => navigate(`/counselor/profile/languages/edit/${userID}`)}
              >
                Edit Languages
              </Button>
            )}
          </div>

          {counselorData.counselorLanguages && counselorData.counselorLanguages.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {counselorData.counselorLanguages.map((language, index) => (
                <div
                  key={index}
                  className="px-6 py-3 bg-brand text-white rounded-lg font-semibold"
                >
                  {language}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground italic">No languages added yet.</p>
          )}
        </div>

        {/* Specializations */}
        <div className="bg-white pt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-adaptive-dark">Specializations</h2>
            {isCurrentUser && (
              <Button
                variant="outline"
                className="border-brand text-brand hover:bg-brand-dark hover:text-white"
                onClick={() => navigate(`/counselor/profile/specializations/edit/${userID}`)}
              >
                Edit Specializations
              </Button>
            )}
          </div>

          {counselorData.counselorSpecializations && counselorData.counselorSpecializations.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {counselorData.counselorSpecializations.map((specialization, index) => (
                <div
                  key={index}
                  className="px-6 py-3 bg-brand text-white rounded-lg font-semibold"
                >
                  {specialization}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground italic">No specializations added yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}



