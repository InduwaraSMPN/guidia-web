import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Book, FileText, Code, HelpCircle, ArrowRight, ExternalLink } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

export function DocumentationPage() {
  const [searchQuery, setSearchQuery] = useState("");

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  // Documentation categories
  const categories = [
    {
      title: "Getting Started",
      icon: Book,
      description: "Learn the basics of Guidia and how to set up your account",
      docs: [
        { title: "Introduction to Guidia", link: "#introduction" },
        { title: "Creating Your Account", link: "#account-creation" },
        { title: "Setting Up Your Profile", link: "#profile-setup" },
        { title: "Navigation Guide", link: "#navigation" },
      ],
    },
    {
      title: "For Students",
      icon: FileText,
      description: "Discover how to make the most of Guidia as a student",
      docs: [
        { title: "Finding Career Opportunities", link: "#career-opportunities" },
        { title: "Connecting with Counselors", link: "#counselor-connections" },
        { title: "Applying for Jobs", link: "#job-applications" },
        { title: "Managing Documents", link: "#document-management" },
      ],
    },
    {
      title: "For Companies",
      icon: FileText,
      description: "Learn how to use Guidia to find talented students",
      docs: [
        { title: "Creating Company Profile", link: "#company-profile" },
        { title: "Posting Job Opportunities", link: "#posting-jobs" },
        { title: "Managing Applications", link: "#managing-applications" },
        { title: "Connecting with Students", link: "#student-connections" },
      ],
    },
    {
      title: "For Counselors",
      icon: FileText,
      description: "Guidance on providing effective career counseling",
      docs: [
        { title: "Setting Up Counselor Profile", link: "#counselor-profile" },
        { title: "Managing Availability", link: "#availability" },
        { title: "Scheduling Meetings", link: "#scheduling" },
        { title: "Providing Career Guidance", link: "#career-guidance" },
      ],
    },
    {
      title: "API Documentation",
      icon: Code,
      description: "Technical documentation for developers",
      docs: [
        { title: "Authentication", link: "#api-auth" },
        { title: "Endpoints Reference", link: "#api-endpoints" },
        { title: "Rate Limits", link: "#api-rate-limits" },
        { title: "Error Handling", link: "#api-errors" },
      ],
    },
    {
      title: "Troubleshooting",
      icon: HelpCircle,
      description: "Solutions to common issues and questions",
      docs: [
        { title: "Account Issues", link: "#account-issues" },
        { title: "Technical Problems", link: "#technical-problems" },
        { title: "Feature FAQs", link: "#feature-faqs" },
        { title: "Contact Support", link: "/support" },
      ],
    },
  ];

  // Filter categories based on search query
  const filteredCategories = categories.filter(
    (category) =>
      category.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.docs.some((doc) =>
        doc.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-b from-brand/10 to-background pt-24 pb-12">
        <div className="max-w-[1216px] mx-auto px-6 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Documentation
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Everything you need to know about using Guidia effectively
            </p>
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                type="text"
                placeholder="Search documentation..."
                className="pl-10 h-12 rounded-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-[1216px] mx-auto px-6 md:px-8 py-12">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredCategories.map((category, index) => (
            <motion.div key={category.title} variants={item}>
              <Card className="h-full hover:shadow-md transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-md bg-brand/10 text-brand">
                      <category.icon className="h-5 w-5" />
                    </div>
                    <CardTitle>{category.title}</CardTitle>
                  </div>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[180px] pr-4">
                    <ul className="space-y-3">
                      {category.docs.map((doc) => (
                        <li key={doc.title}>
                          <a
                            href={doc.link}
                            className="flex items-center text-muted-foreground hover:text-brand transition-colors duration-200"
                          >
                            <ArrowRight className="h-3 w-3 mr-2 opacity-70" />
                            {doc.title}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </ScrollArea>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-16 text-center"
        >
          <h2 className="text-2xl font-semibold mb-4">Need more help?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            If you can't find what you're looking for in our documentation, our support team is ready to help you.
          </p>
          <Button
            className="bg-brand hover:bg-brand/90"
            onClick={() => window.location.href = "/support"}
          >
            Contact Support
            <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
