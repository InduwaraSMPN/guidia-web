;

import { Network, MessageSquare, Briefcase, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";

export function Features() {
  const navigate = useNavigate();
  
  const features = [
    {
      name: "Build Connections",
      description:
        "Connect with peers, mentors, and industry professionals to expand your network.",
      icon: Network,
    },
    {
      name: "Expert Counseling",
      description:
        "Get personalized guidance from experienced career counselors who understand your goals.",
      icon: MessageSquare,
    },
    {
      name: "Job Opportunities",
      description:
        "Discover relevant job openings matched to your skills, interests, and career aspirations.",
      icon: Briefcase,
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <section className="py-20 md:py-28">
      <div className="max-w-[1216px] mx-auto px-6 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
            How Guidia Helps You Succeed
          </h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Our platform provides the tools and resources you need to navigate
            your career journey with confidence.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-8"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.name}
              variants={item}
              className="bg-white rounded-2xl p-8 shadow-sm border border-neutral-100 hover:shadow-md transition-shadow duration-300"
            >
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-lg bg-rose-50 text-[#800020] mb-5">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-3">
                {feature.name}
              </h3>
              <p className="text-neutral-600">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 bg-[#800020] rounded-2xl p-10 md:p-12 text-white text-center"
        >
          <h3 className="text-2xl md:text-3xl font-bold mb-4">
            Ready to start your journey?
          </h3>
          <p className="text-rose-100 mb-8 max-w-2xl mx-auto">
            Join thousands of students and professionals who have found their
            path with Guidia.
          </p>
          <Button
            size="lg"
            onClick={() => navigate("/auth/register")}
            className="bg-white text-[#800020] hover:bg-neutral-50 px-8 py-3 rounded-md font-medium transition-all duration-300 group"
          >
            Create a Free Account
            <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
