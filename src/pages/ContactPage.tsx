import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { APP_SETTINGS } from "../config";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  // Simulate loading delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      toast.success("Your message has been sent successfully!");
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
      setIsSubmitting(false);
    }, 1500);
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-background px-4 sm:px-6 lg:px-8 pt-32">
        <div className="max-w-[1216px] mx-auto px-4 sm:px-6 lg:px-8 pb-32">
          <div className="mb-16">
            <Skeleton className="h-10 w-48 mb-6" />
            <Skeleton className="h-5 w-full max-w-2xl" />
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="bg-secondary p-6 rounded-xl shadow-sm border border-border">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <div>
                    <Skeleton className="h-6 w-24 mb-2" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-5 w-full max-w-md" />

              <div className="space-y-6">
                {[...Array(4)].map((_, index) => (
                  <div key={index} className="space-y-2">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
                <Skeleton className="h-12 w-full rounded-md" />
              </div>
            </div>

            <Skeleton className="bg-secondary rounded-xl h-[500px]" />
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
          className="mb-16"
        >
          <h1 className="text-3xl font-bold text-brand mb-6">
            Contact Us
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Have questions or need assistance? We're here to help. Fill out the form below or use one of our contact methods to get in touch with our team.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {contactInfo.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-secondary p-6 rounded-xl shadow-sm border border-border hover:border-brand/30 transition-colors duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-brand/10 rounded-lg">
                  <item.icon className="h-6 w-6 text-brand" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                  <a
                    href={item.link}
                    target={item.title === "Address" ? "_blank" : undefined}
                    rel={item.title === "Address" ? "noopener noreferrer" : undefined}
                    className="text-muted-foreground hover:text-brand transition-colors"
                  >
                    {item.details}
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-semibold text-brand">Send Us a Message</h2>
            <p className="text-muted-foreground">
              Fill out the form and our team will get back to you as soon as possible.
            </p>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Your Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  name="subject"
                  placeholder="How can we help you?"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  name="message"
                  placeholder="Your message here..."
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Send className="h-4 w-4" />
                    Send Message
                  </span>
                )}
              </Button>
            </form>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-secondary rounded-xl overflow-hidden h-[500px] shadow-sm border border-border"
          >
            <iframe
  src="https://www.google.com/maps?q=University+of+Kelaniya,+Sri+Lanka&output=embed" 
  width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="University of Kelaniya Map"
            ></iframe>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
