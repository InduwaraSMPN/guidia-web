import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function TestimonialsPage() {
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

  const testimonials = [
    {
      name: "Amara Perera",
      role: "Computer Science Graduate",
      image: "/images/testimonials/avatar-1.jpg",
      content: "Guidia completely transformed my job search experience. The personalized counseling sessions helped me identify my strengths and the career path that was right for me. Within two months of using the platform, I secured a position at a leading tech company!",
      rating: 5,
    },
    {
      name: "Dinesh Kumar",
      role: "Engineering Student",
      image: "/images/testimonials/avatar-2.jpg",
      content: "As a final year engineering student, I was overwhelmed by the job market. The career counselors on Guidia provided invaluable guidance and helped me prepare for interviews. The resources available on the platform are exceptional and truly prepare you for the professional world.",
      rating: 5,
    },
    {
      name: "Fathima Rizvi",
      role: "Business Administration Graduate",
      image: "/images/testimonials/avatar-3.jpg",
      content: "The networking opportunities on Guidia are unmatched. I connected with industry professionals who provided insights I couldn't find anywhere else. The platform's job matching algorithm is impressive - it found opportunities that perfectly aligned with my skills and interests.",
      rating: 4,
    },
    {
      name: "Tharaka Jayasinghe",
      role: "Psychology Student",
      image: "/images/testimonials/avatar-4.jpg",
      content: "I was unsure about which career path to pursue with my psychology degree. The career assessment tools and counseling sessions on Guidia helped me explore options I hadn't considered. I'm now confidently pursuing a career in organizational psychology thanks to their guidance.",
      rating: 5,
    },
    {
      name: "Lakshmi Navaratne",
      role: "Marketing Professional",
      image: "/images/testimonials/avatar-5.jpg",
      content: "Even as a professional with several years of experience, I found tremendous value in Guidia. The platform helped me identify opportunities for growth and connected me with mentors who have helped advance my career. The resume building tools and feedback were particularly helpful.",
      rating: 5,
    },
    {
      name: "Rajiv Mendis",
      role: "IT Graduate",
      image: "/images/testimonials/avatar-6.jpg",
      content: "The job application process through Guidia is seamless. I appreciated how the platform kept me updated on my application status and provided reminders for important deadlines. The interview preparation resources were comprehensive and helped me feel confident.",
      rating: 4,
    },
    {
      name: "Samantha Silva",
      role: "Hospitality Management Student",
      image: "/images/testimonials/avatar-7.jpg",
      content: "Guidia opened doors to internship opportunities I wouldn't have found elsewhere. The platform's focus on connecting students with the right opportunities based on their interests and skills is impressive. I've recommended it to all my classmates!",
      rating: 5,
    },
    {
      name: "Nihal Gunawardena",
      role: "Finance Graduate",
      image: "/images/testimonials/avatar-8.jpg",
      content: "The events and workshops advertised on Guidia have been instrumental in my professional development. I've attended several networking events through the platform that led to valuable connections in the finance industry. The career guidance is top-notch.",
      rating: 5,
    },
  ];

  // Function to render star ratings
  const renderStars = (rating: number) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
          }`}
        />
      ));
  };

  // Company testimonials
  const companyTestimonials = [
    {
      company: "TechSolutions Lanka",
      logo: "/images/company-logos/techsolutions.png",
      representative: "Priyanka Jayawardena",
      title: "HR Director",
      content: "Guidia has revolutionized our recruitment process. The quality of candidates we've found through the platform is exceptional. The students come well-prepared and have a clear understanding of their career goals, which makes the hiring process much more efficient.",
    },
    {
      company: "Global Finance Partners",
      logo: "/images/company-logos/globalfinance.png",
      representative: "Rohan De Silva",
      title: "Talent Acquisition Manager",
      content: "We've been partnering with Guidia for our internship program for the past two years, and the results have been outstanding. The platform makes it easy to connect with talented students who are eager to learn and contribute. It's become an essential part of our recruitment strategy.",
    },
    {
      company: "Innovate Engineering",
      logo: "/images/company-logos/innovate.png",
      representative: "Malik Fernando",
      title: "CEO",
      content: "As a growing company, finding the right talent is crucial. Guidia has helped us connect with promising graduates who bring fresh perspectives to our team. The platform's focus on career readiness ensures that the candidates we interview are well-prepared for the professional environment.",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background px-4 sm:px-6 lg:px-8 pt-32">
        <div className="max-w-[1216px] mx-auto px-4 sm:px-6 lg:px-8 pb-32">
          {/* Header Skeleton */}
          <div className="mb-16 text-center">
            <Skeleton className="h-10 w-48 mx-auto mb-6" />
            <Skeleton className="h-5 w-full max-w-2xl mx-auto" />
          </div>

          {/* Student Testimonials Skeleton */}
          <div className="mb-20">
            <Skeleton className="h-8 w-64 mx-auto mb-8" />
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="bg-secondary p-6 rounded-xl shadow-sm border border-border flex flex-col h-full">
                  <div className="flex items-center gap-4 mb-4">
                    <Skeleton className="w-12 h-12 rounded-full" />
                    <div>
                      <Skeleton className="h-5 w-32 mb-1" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-4 w-4 rounded-full mr-1" />
                    ))}
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Company Testimonials Skeleton */}
          <div>
            <Skeleton className="h-8 w-64 mx-auto mb-8" />
            <div className="grid md:grid-cols-3 gap-8">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="bg-brand/5 p-8 rounded-xl border border-brand/10 flex flex-col h-full">
                  <div className="mb-6">
                    <Skeleton className="h-12 w-48 mb-4" />
                    <div>
                      <Skeleton className="h-5 w-40 mb-1" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Call to Action Skeleton */}
          <div className="mt-20 bg-secondary p-10 rounded-2xl border border-border text-center">
            <Skeleton className="h-8 w-64 mx-auto mb-4" />
            <Skeleton className="h-5 w-full max-w-2xl mx-auto mb-8" />
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Skeleton className="h-12 w-48 rounded-lg" />
              <Skeleton className="h-12 w-48 rounded-lg" />
            </div>
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
            Success Stories
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Hear from students, professionals, and companies who have experienced the benefits of our platform. These testimonials reflect the real impact Guidia has on career journeys.
          </p>
        </motion.div>

        {/* Student Testimonials */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="mb-20"
        >
          <h2 className="text-2xl font-semibold text-brand mb-8 text-center">
            What Our Users Say
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-secondary p-6 rounded-xl shadow-sm border border-border hover:border-brand/30 transition-all duration-300 hover:shadow-md flex flex-col h-full"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-brand/10 flex items-center justify-center overflow-hidden">
                    {testimonial.image ? (
                      <img
                        src={testimonial.image}
                        alt={testimonial.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-brand font-semibold">
                        {testimonial.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {testimonial.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
                <div className="flex mb-4">{renderStars(testimonial.rating)}</div>
                <div className="relative flex-grow">
                  <Quote className="absolute top-0 left-0 h-6 w-6 text-brand/20 -translate-x-2 -translate-y-2" />
                  <p className="text-muted-foreground text-sm leading-relaxed pl-2">
                    {testimonial.content}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Company Testimonials */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          <h2 className="text-2xl font-semibold text-brand mb-8 text-center">
            Trusted by Leading Companies
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {companyTestimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.company}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                className="bg-brand/5 p-8 rounded-xl border border-brand/10 flex flex-col h-full"
              >
                <div className="mb-6">
                  <div className="h-12 mb-4 flex items-center">
                    {testimonial.logo ? (
                      <img
                        src={testimonial.logo}
                        alt={testimonial.company}
                        className="h-full object-contain"
                      />
                    ) : (
                      <h3 className="text-xl font-bold text-brand">
                        {testimonial.company}
                      </h3>
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">
                      {testimonial.representative}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.title}, {testimonial.company}
                    </p>
                  </div>
                </div>
                <p className="text-muted-foreground leading-relaxed flex-grow">
                  "{testimonial.content}"
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.7 }}
          className="mt-20 bg-secondary p-10 rounded-2xl border border-border text-center"
        >
          <h2 className="text-2xl font-bold text-brand mb-4">Join Our Success Stories</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Whether you're a student starting your career journey or a company looking for talented professionals, Guidia is here to help you succeed.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/auth/register"
              className="inline-flex items-center justify-center px-6 py-3 bg-brand text-white rounded-lg hover:bg-brand/90 transition-colors"
            >
              Create a Free Account
            </a>
            <a
              href="/contact"
              className="inline-flex items-center justify-center px-6 py-3 bg-secondary-light text-foreground rounded-lg border border-border hover:bg-secondary-light/80 transition-colors"
            >
              Contact Us
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
