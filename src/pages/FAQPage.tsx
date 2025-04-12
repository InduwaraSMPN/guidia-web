import { motion } from "framer-motion";
import { useState } from "react";
import { ChevronDown, ChevronUp, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { APP_SETTINGS } from "../config";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

export function FAQPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const faqCategories = [
    { id: "all", name: "All Questions" },
    { id: "account", name: "Account & Registration" },
    { id: "students", name: "For Students" },
    { id: "companies", name: "For Companies" },
    { id: "counselors", name: "For Counselors" },
    { id: "technical", name: "Technical Support" },
  ];

  const faqItems: FAQItem[] = [
    {
      question: "How do I create an account on Guidia?",
      answer: "Creating an account is simple! Click on the 'Create a Free Account' button on the homepage, select your user type (student, company, or counselor), and follow the registration steps. You'll need to provide some basic information and verify your email address to complete the process.",
      category: "account",
    },
    {
      question: "Is Guidia free to use?",
      answer: "Yes, Guidia is free for students. Companies and counselors may have subscription options for premium features, but basic account creation and usage are free for all users.",
      category: "account",
    },
    {
      question: "How do I reset my password?",
      answer: "If you've forgotten your password, click on the 'Forgot Password' link on the login page. Enter your registered email address, and we'll send you instructions to reset your password. Follow the link in the email to create a new password.",
      category: "account",
    },
    {
      question: "Can I change my user type after registration?",
      answer: "User types cannot be changed directly after registration as they have different verification processes and features. If you need to change your user type, please contact our support team at " + APP_SETTINGS.SUPPORT_EMAIL + " for assistance.",
      category: "account",
    },
    {
      question: "How can I find job opportunities that match my skills?",
      answer: "As a student, you can browse job listings on the Jobs page. Use filters to narrow down opportunities based on your skills, interests, location, and other preferences. Our system also provides personalized job recommendations based on your profile information and career interests.",
      category: "students",
    },
    {
      question: "How do I connect with a career counselor?",
      answer: "You can browse available counselors on the Counselors page and view their profiles to find someone who specializes in your area of interest. Once you've found a suitable counselor, you can initiate a conversation through our messaging system to discuss your career goals and arrange counseling sessions.",
      category: "students",
    },
    {
      question: "How do I upload my resume and other documents?",
      answer: "Navigate to your profile page and select the Documents section. Click on 'Upload Document' and choose the file from your device. You can categorize documents (resume, cover letter, certificates, etc.) and manage them from this section.",
      category: "students",
    },
    {
      question: "How can I track my job applications?",
      answer: "All your job applications are tracked in the 'My Applications' section of your profile. You can view the status of each application, receive notifications about updates, and manage your application history in one place.",
      category: "students",
    },
    {
      question: "How do I post a job opening on Guidia?",
      answer: "As a company, you can post job openings by navigating to the 'Post a Job' section in your dashboard. Fill out the job details, requirements, and application instructions. Once submitted, your job posting will be reviewed and published to our job board.",
      category: "companies",
    },
    {
      question: "How can I review applications from students?",
      answer: "All applications for your job postings are available in the 'Applications' section of your company dashboard. You can review candidate profiles, resumes, and other submitted documents, and update application statuses as you progress through your hiring process.",
      category: "companies",
    },
    {
      question: "Can I message students directly?",
      answer: "Yes, you can initiate conversations with students who have applied to your job postings. Our messaging system allows for direct communication to schedule interviews, request additional information, or provide updates on application status.",
      category: "companies",
    },
    {
      question: "How do I update my company profile?",
      answer: "You can edit your company profile by navigating to the 'Edit Profile' section in your dashboard. Update your company description, logo, contact information, and other details to ensure students have accurate information about your organization.",
      category: "companies",
    },
    {
      question: "How do I set up my counselor profile?",
      answer: "After registration and verification as a counselor, you can complete your profile by adding your specializations, experience, education, and a professional bio. A comprehensive profile helps students find you based on their career interests and needs.",
      category: "counselors",
    },
    {
      question: "How do counseling sessions work on Guidia?",
      answer: "Counseling sessions can be arranged through our messaging system. You can discuss scheduling with students, conduct sessions through your preferred platform (video call, phone, or in-person), and maintain communication through Guidia's messaging feature.",
      category: "counselors",
    },
    {
      question: "Can I specialize in specific career fields?",
      answer: "Yes, you can indicate your specializations in your counselor profile. This helps students find counselors with expertise in their areas of interest. You can select multiple specializations and update them as your expertise evolves.",
      category: "counselors",
    },
    {
      question: "How do I connect with companies for placement opportunities?",
      answer: "As a counselor, you can browse company profiles and job postings to stay informed about opportunities for your students. You can also network with company representatives through our platform to establish relationships for future placement opportunities.",
      category: "counselors",
    },
    {
      question: "The website is not loading properly. What should I do?",
      answer: "First, try refreshing the page or clearing your browser cache. If the issue persists, try using a different browser or device. If you're still experiencing problems, please contact our technical support team at " + APP_SETTINGS.SUPPORT_EMAIL + " with details about the issue and screenshots if possible.",
      category: "technical",
    },
    {
      question: "I'm not receiving notification emails. How can I fix this?",
      answer: "Check your spam or junk folder first, as notification emails might be filtered there. Ensure that you've added our email domain to your safe senders list. You can also verify and update your email address in your account settings. If you're still not receiving emails, contact our support team for assistance.",
      category: "technical",
    },
    {
      question: "How do I report a bug or technical issue?",
      answer: "You can report bugs or technical issues by contacting our support team at " + APP_SETTINGS.SUPPORT_EMAIL + ". Please provide detailed information about the issue, including steps to reproduce it, screenshots, and your device and browser information to help us resolve it quickly.",
      category: "technical",
    },
    {
      question: "Is my data secure on Guidia?",
      answer: "Yes, we take data security seriously. We use industry-standard encryption and security measures to protect your personal information. Our privacy policy outlines how we collect, use, and protect your data. If you have specific security concerns, please contact our support team.",
      category: "technical",
    },
  ];

  // Filter FAQs based on search query and active category
  const filteredFAQs = faqItems.filter((faq) => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "all" || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleToggle = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    setActiveIndex(null);
  };

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
            Frequently Asked Questions
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Find answers to common questions about using Guidia. If you can't find what you're looking for, feel free to contact our support team.
          </p>

          {/* Search Bar */}
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              type="text"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 py-6"
            />
          </div>
        </motion.div>

        {/* Category Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-10 overflow-x-auto"
        >
          <div className="flex space-x-2 min-w-max pb-2">
            {faqCategories.map((category) => (
              <Button
                key={category.id}
                variant={activeCategory === category.id ? "default" : "outline"}
                onClick={() => handleCategoryChange(category.id)}
                className="whitespace-nowrap"
              >
                {category.name}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* FAQ Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="space-y-4"
        >
          {filteredFAQs.length > 0 ? (
            filteredFAQs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="border border-border rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => handleToggle(index)}
                  className="w-full flex justify-between items-center p-6 text-left bg-secondary hover:bg-secondary-light transition-colors"
                >
                  <h3 className="font-semibold text-foreground">{faq.question}</h3>
                  {activeIndex === index ? (
                    <ChevronUp className="h-5 w-5 text-brand flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  )}
                </button>
                {activeIndex === index && (
                  <div className="p-6 bg-background border-t border-border">
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </div>
                )}
              </motion.div>
            ))
          ) : (
            <div className="text-center py-10">
              <p className="text-muted-foreground">No results found for "{searchQuery}"</p>
              <p className="mt-2">Try a different search term or browse by category</p>
            </div>
          )}
        </motion.div>

        {/* Contact Support Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-20 bg-brand/5 p-10 rounded-2xl border border-brand/10 text-center"
        >
          <h2 className="text-2xl font-bold text-brand mb-4">Still Have Questions?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            If you couldn't find the answer you were looking for, our support team is here to help. Contact us and we'll get back to you as soon as possible.
          </p>
          <a 
            href="/contact" 
            className="inline-flex items-center justify-center px-6 py-3 bg-brand text-white rounded-lg hover:bg-brand/90 transition-colors"
          >
            Contact Support
          </a>
        </motion.div>
      </div>
    </div>
  );
}
