import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, MessageSquare, HelpCircle, Search, Send } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { APP_SETTINGS } from "@/config";
import { toast } from "sonner";

export function SupportPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Contact information
  const contactInfo = [
    {
      icon: Mail,
      title: "Email",
      details: APP_SETTINGS.SUPPORT_EMAIL,
      link: `mailto:${APP_SETTINGS.SUPPORT_EMAIL}`,
    },
    {
      icon: Phone,
      title: "Phone",
      details: "+94 112 903 903",
      link: "tel:+94112903903",
    },
    {
      icon: MapPin,
      title: "Address",
      details: "University of Kelaniya, Kandy Road, Dalugama, Kelaniya 11600, Sri Lanka",
      link: "https://maps.google.com/?q=University+of+Kelaniya",
    },
  ];

  // FAQ items
  const faqItems = [
    {
      question: "How do I create an account on Guidia?",
      answer: "Creating an account is simple! Click on the 'Create a Free Account' button on the homepage, select your user type (student, company, or counselor), and follow the registration steps. You'll need to provide some basic information and verify your email address to complete the process.",
    },
    {
      question: "Is Guidia free to use?",
      answer: "Yes, Guidia is free for students. Companies and counselors may have subscription options for premium features, but basic account creation and usage are free for all users.",
    },
    {
      question: "How do I reset my password?",
      answer: "To reset your password, click on the 'Forgot Password' link on the login page. Enter your email address, and we'll send you a password reset link. Follow the instructions in the email to create a new password.",
    },
    {
      question: "How do I apply for a job on Guidia?",
      answer: "To apply for a job, navigate to the Jobs section, find a job that interests you, and click on it to view details. Click the 'Apply Now' button, fill out the application form, attach any required documents, and submit your application.",
    },
    {
      question: "How do I schedule a meeting with a counselor?",
      answer: "To schedule a meeting with a counselor, visit their profile page and click on 'Schedule Meeting'. Select an available time slot from their calendar, provide a brief description of what you'd like to discuss, and confirm the meeting request.",
    },
    {
      question: "How do I report a bug or technical issue?",
      answer: `You can report bugs or technical issues by contacting our support team at ${APP_SETTINGS.SUPPORT_EMAIL}. Please provide detailed information about the issue, including steps to reproduce it, screenshots, and your device and browser information to help us resolve it quickly.`,
    },
  ];

  // Filter FAQ items based on search query
  const filteredFaqItems = faqItems.filter(
    (item) =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          message,
          subject: 'Support Request from Website'
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Your message has been sent! We'll get back to you soon.");
        setName("");
        setEmail("");
        setMessage("");
      } else {
        toast.error(data.message || "Failed to send message. Please try again.");
      }
    } catch (error) {
      console.error('Error sending contact form:', error);
      toast.error("An error occurred. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
              Support Center
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              We're here to help you with any questions or issues you may have
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-[1216px] mx-auto px-6 md:px-8 py-12">
        <Tabs defaultValue="faq" className="w-full">
          <div className="flex justify-center w-full mb-8">
            <div className="w-full max-w-md">
              <TabsList className="w-full grid grid-cols-2 p-1">
                <TabsTrigger value="faq" className="text-sm flex items-center justify-center px-2 py-1.5">
                  <HelpCircle className="mr-1.5 h-4 w-4" />
                  <span>FAQs</span>
                </TabsTrigger>
                <TabsTrigger value="contact" className="text-sm flex items-center justify-center px-2 py-1.5">
                  <MessageSquare className="mr-1.5 h-4 w-4" />
                  <span>Contact Us</span>
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          <TabsContent value="faq" className="mt-0">
            <div className="relative max-w-xl mx-auto mb-8">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                type="text"
                placeholder="Search frequently asked questions..."
                className="pl-10 h-12 rounded-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="max-w-3xl mx-auto space-y-4"
            >
              {filteredFaqItems.length > 0 ? (
                filteredFaqItems.map((item, index) => (
                  <motion.div key={index} variants={item}>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-xl">{item.question}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">{item.answer}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8">
                  <HelpCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No results found</h3>
                  <p className="text-muted-foreground">
                    Try a different search term or contact our support team for assistance.
                  </p>
                </div>
              )}
            </motion.div>
          </TabsContent>

          <TabsContent value="contact" className="mt-0">
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {contactInfo.map((info, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-md transition-shadow duration-300">
                    <CardHeader className="text-center">
                      <div className="mx-auto p-3 rounded-full bg-brand/10 text-brand mb-4">
                        <info.icon className="h-6 w-6" />
                      </div>
                      <CardTitle>{info.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                      <a
                        href={info.link}
                        className="text-muted-foreground hover:text-brand transition-colors duration-200"
                        target={info.title === "Address" ? "_blank" : undefined}
                        rel={info.title === "Address" ? "noopener noreferrer" : undefined}
                      >
                        {info.details}
                      </a>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="max-w-2xl mx-auto"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Send us a message</CardTitle>
                  <CardDescription>
                    Fill out the form below and we'll get back to you as soon as possible.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium">
                          Name
                        </label>
                        <Input
                          id="name"
                          placeholder="Your name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium">
                          Email
                        </label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="message" className="text-sm font-medium">
                        Message
                      </label>
                      <Textarea
                        id="message"
                        placeholder="How can we help you?"
                        rows={5}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-brand hover:bg-brand/90"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>Sending...</>
                      ) : (
                        <>
                          Send Message
                          <Send className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
