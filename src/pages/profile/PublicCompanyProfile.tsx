import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  ChevronLeft,
  MessageSquare,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

interface Company {
  id: string;
  name: string;
  description: string;
}

interface CompanyData {
  companyID: number;
  companyName: string;
  companyCountry: string;
  companyCity: string;
  companyWebsite: string;
  companyContactNumber: string;
  companyEmail: string;
  companyDescription: string;
  companyLogoPath: string | null;
  companyType?: string;
  postedJobs?: Array<{
    id: string;
    title: string;
    company: string;
    sector: string;
    location: string;
    description: string;
    type: string;
    logo: string;
  }>;
}

interface ContactItem {
  icon: React.ReactNode;
  label: string;
  value: string;
  link?: string;
}

interface PublicCompanyProfileProps {
  companies?: Company[];
}

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
};

const ProfileSkeleton = () => (
  <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
    <div className="flex flex-col md:flex-row gap-6">
      <Skeleton className="h-32 w-32 rounded-lg" />
      <div className="space-y-4 flex-1">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-6 w-1/2" />
        <div className="flex gap-4">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-24" />
        </div>
      </div>
    </div>
    <Skeleton className="h-40 w-full" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-32 w-full" />
    </div>
  </div>
);

// Chat button component
function ChatButton({ companyData, userID }: { companyData: CompanyData, userID: string | undefined }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Check if current user is viewing their own profile
  const isCurrentUser = user?.userID === userID;

  const handleChat = () => {
    if (!isCurrentUser && user?.userType && user?.userID) {
      const userTypePath = user.userType.toLowerCase();
      // Navigate to chat using the new URL format
      navigate(`/${userTypePath}/${user.userID}/messages/${userID}?type=company`);
    }
  };

  return (
    <Button
      size="lg"
      className={`gap-2 ${isCurrentUser ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={handleChat}
      disabled={isCurrentUser}
      title={isCurrentUser ? "You cannot chat with yourself" : ""}
    >
      Chat with {companyData.companyName.split(" ")[0]}
      <MessageSquare className="h-4 w-4" />
    </Button>
  );
}

export function PublicCompanyProfile({ companies }: PublicCompanyProfileProps) {
  const navigate = useNavigate();
  const { userID } = useParams();
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredJobId, setHoveredJobId] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompanyData = async () => {
      if (!userID) {
        setError("Invalid profile URL");
        setIsLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${
            import.meta.env.VITE_API_BASE_URL
          }/api/companies/profile/${userID}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch company profile");
        }

        const data = await response.json();
        setCompanyData(data);
      } catch (err) {
        console.error("Profile fetch error:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanyData();
  }, [userID]);

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (error) {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="max-w-4xl mx-auto px-4 py-16 text-center"
      >
        <div className="bg-muted/30 rounded-lg p-8 flex flex-col items-center">
          <div className="rounded-full bg-muted/50 p-4 mb-4">
            <Building2 className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-medium text-foreground mb-2">
            {error ||
              (!userID ? "Invalid profile URL" : "Company profile not found")}
          </h2>
          <p className="text-muted-foreground mb-6">
            We couldn't find the profile you're looking for.
          </p>
          <Button variant="outline" onClick={() => window.history.back()}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </motion.div>
    );
  }

  if (!companyData) {
    return null;
  }

  const contactInfo: ContactItem[] = [
    {
      icon: <Mail className="h-4 w-4" />,
      label: "Email",
      value: companyData.companyEmail,
      link: `mailto:${companyData.companyEmail}`,
    },
    {
      icon: <Phone className="h-4 w-4" />,
      label: "Phone",
      value: companyData.companyContactNumber,
      link: `tel:${companyData.companyContactNumber}`,
    },
    {
      icon: <Globe className="h-4 w-4" />,
      label: "Website",
      value: companyData.companyWebsite,
      link: companyData.companyWebsite,
    },
    {
      icon: <MapPin className="h-4 w-4" />,
      label: "Location",
      value: `${companyData.companyCity}, ${companyData.companyCountry}`,
    },
  ];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="min-h-screen bg-background pt-32 pb-32 px-4"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Companies List Section */}
        {companies && companies.length > 0 && (
          <motion.div
            variants={fadeIn}
            className="bg-card rounded-lg p-6 shadow-sm"
          >
            <h2 className="text-xl font-semibold mb-4">Companies</h2>
            <div className="space-y-4">
              {companies.map((company) => (
                <div
                  key={company.id} // Using company.id as unique identifier
                  className="border rounded-lg p-4 hover:bg-accent transition-colors"
                >
                  <h3 className="font-semibold">{company.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {company.description}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Back button */}
        <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        {/* Company Profile Header */}
        <motion.div
          variants={fadeIn}
          className="flex flex-col md:flex-row gap-6 items-start mb-8"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="w-32 h-32 border-4 border-background overflow-hidden rounded-lg shadow-lg">
              {companyData.companyLogoPath ? (
                <img
                  src={companyData.companyLogoPath}
                  alt={companyData.companyName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/default-company-logo.png";
                  }}
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <Building2 className="h-16 w-16 text-muted-foreground" />
                </div>
              )}
            </div>
          </motion.div>

          <div className="flex-1">
            <motion.h1
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="text-3xl font-bold text-foreground mb-1"
            >
              {companyData.companyName}
            </motion.h1>

            <motion.div
              initial={{ y: -5, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="flex items-center gap-2 mb-4"
            >
              <Badge variant="secondary" className="text-sm font-medium">
                {companyData.companyType || "Technology Company"}
              </Badge>
            </motion.div>

            {/* Contact Information */}
            <motion.div
              initial={{ y: -5, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="space-y-2 text-muted-foreground"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {contactInfo.map((item) => (
                  <div
                    key={`contact-${item.label}`} // Using label as unique identifier with prefix
                    className="flex items-center gap-2"
                  >
                    {item.icon}
                    <span className="text-muted-foreground">{item.label}:</span>
                    {item.link ? (
                      <a
                        href={item.link}
                        className="text-primary hover:underline"
                        target={item.label === "Website" ? "_blank" : undefined}
                        rel={
                          item.label === "Website"
                            ? "noopener noreferrer"
                            : undefined
                        }
                      >
                        {item.value}
                      </a>
                    ) : (
                      <span>{item.value}</span>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Company Description */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="bg-card rounded-lg p-6 shadow-sm"
        >
          <h2 className="text-xl font-semibold mb-4">
            About {companyData.companyName}
          </h2>
          <div
            className="text-muted-foreground prose max-w-none leading-relaxed"
            dangerouslySetInnerHTML={{ __html: companyData.companyDescription }}
          />
        </motion.div>

        {/* Posted Jobs Section */}
        {companyData.postedJobs && companyData.postedJobs.length > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.5 }}
            className="bg-card rounded-lg p-6 shadow-sm"
          >
            <h2 className="text-xl font-semibold mb-4">Posted Jobs</h2>
            <div className="space-y-4">
              {companyData.postedJobs.map((job) => (
                <div
                  key={job.id}
                  className="border rounded-lg p-4 hover:bg-accent transition-colors cursor-pointer"
                  onClick={() => navigate(`/jobs/${job.id}`)}
                  onMouseEnter={() => setHoveredJobId(job.id)}
                  onMouseLeave={() => setHoveredJobId(null)}
                >
                  <h3 className="font-semibold">{job.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {job.type} · {job.location}
                  </p>
                  <motion.div
                    className="mt-4 text-brand text-sm font-medium"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: hoveredJobId === job.id ? 1 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    View details →
                  </motion.div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Chat Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="mt-8 flex justify-center"
        >
          <ChatButton companyData={companyData} userID={userID} />
        </motion.div>
      </div>
    </motion.div>
  );
}

