import { motion } from "framer-motion";
import {
  Network,
  MessageSquare,
  Briefcase,
  Users,
  FileText,
  Calendar,
  Bell,
  Search,
  BarChart,
  Shield
} from "lucide-react";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function FeaturesPage() {
  const [loading, setLoading] = useState(true);

  // Simulate loading delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const features = [
    {
      icon: Network,
      title: "Build Connections",
      description: "Connect with peers, mentors, and industry professionals to expand your network. Our platform makes it easy to find and connect with people who can help advance your career.",
    },
    {
      icon: MessageSquare,
      title: "Expert Counseling",
      description: "Get personalized guidance from experienced career counselors who understand your goals. Schedule one-on-one sessions to discuss your career path and receive tailored advice.",
    },
    {
      icon: Briefcase,
      title: "Job Opportunities",
      description: "Discover relevant job openings matched to your skills, interests, and career aspirations. Our intelligent matching system helps you find positions that align with your career goals.",
    },
    {
      icon: Users,
      title: "Community Support",
      description: "Join a supportive community of students, professionals, and mentors. Share experiences, ask questions, and learn from others who have walked similar paths.",
    },
    {
      icon: FileText,
      title: "Resume Building",
      description: "Create and manage professional resumes that highlight your skills and experiences. Get feedback and suggestions to improve your resume and stand out to potential employers.",
    },
    {
      icon: Calendar,
      title: "Events & Workshops",
      description: "Stay informed about career fairs, workshops, and networking events. Participate in skill-building sessions and industry-specific gatherings to enhance your professional development.",
    },
    {
      icon: Bell,
      title: "Smart Notifications",
      description: "Receive timely alerts about job deadlines, application statuses, and career opportunities. Our notification system ensures you never miss important updates or opportunities.",
    },
    {
      icon: Search,
      title: "Advanced Search",
      description: "Find exactly what you're looking for with our powerful search tools. Filter jobs, companies, and counselors based on your specific requirements and preferences.",
    },
    {
      icon: BarChart,
      title: "Career Analytics",
      description: "Track your progress and gain insights into your career development. Visualize your growth, identify areas for improvement, and make data-driven decisions about your future.",
    },
    {
      icon: Shield,
      title: "Secure Platform",
      description: "Your data is protected with industry-standard security measures. We prioritize the privacy and security of all users, ensuring a safe environment for career development.",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background px-4 sm:px-6 lg:px-8 pt-32">
        <div className="max-w-[1216px] mx-auto px-4 sm:px-6 lg:px-8 pb-32">
          <div className="mb-16 text-center">
            <Skeleton className="h-10 w-48 mx-auto mb-6" />
            <Skeleton className="h-5 w-full max-w-2xl mx-auto" />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(10)].map((_, index) => (
              <div key={index} className="bg-secondary p-8 rounded-xl shadow-sm border border-border">
                <Skeleton className="h-12 w-12 rounded-lg mb-5" />
                <Skeleton className="h-6 w-48 mb-3" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>

          <div className="mt-20 bg-brand/5 p-10 rounded-2xl border border-brand/10 text-center">
            <Skeleton className="h-8 w-64 mx-auto mb-4" />
            <Skeleton className="h-5 w-full max-w-2xl mx-auto mb-8" />
            <Skeleton className="h-12 w-48 mx-auto rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 sm:px-6 lg:px-8 pt-32">
      <div className="max-w-[1216px] mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="mb-16 text-center"
        >
          <h1 className="text-4xl font-bold text-brand mb-6">
            Our Features
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover the tools and resources designed to help you navigate your career journey with confidence. Our comprehensive platform offers everything you need to succeed.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-secondary p-8 rounded-xl shadow-sm border border-border hover:border-brand/30 transition-all duration-300 hover:shadow-md"
            >
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-lg bg-brand/10 text-brand mb-5">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-20 bg-brand/5 p-10 rounded-2xl border border-brand/10 text-center"
        >
          <h2 className="text-2xl font-bold text-brand mb-4">Ready to Get Started?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Join thousands of students and professionals who are already using our platform to advance their careers.
          </p>
          <a
            href="/auth/register"
            className="inline-flex items-center justify-center px-6 py-3 bg-brand text-white rounded-lg hover:bg-brand/90 transition-colors"
          >
            Create a Free Account
          </a>
        </motion.div>
      </div>
    </div>
  );
}
