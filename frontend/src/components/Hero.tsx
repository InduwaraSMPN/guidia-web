

import { Button } from "./ui/button"
import { useNavigate } from "react-router-dom"
import { ArrowRight } from "lucide-react"
import { motion } from "framer-motion"

export function Hero() {
  const navigate = useNavigate()

  return (
    <section className="relative overflow-hidden pt-24 md:pt-32 lg:pt-40 pb-16 md:pb-24">
      <div className="max-w-[1216px] mx-auto px-6 md:px-8">
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 lg:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center rounded-full bg-secondary-light px-4 py-1.5 text-sm font-medium text-foreground border border-border">
              <span className="relative flex h-2 w-2 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-300 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#800020]"></span>
              </span>
              Launching May 2025
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.1]">
              Unlock Your Future
              <span className="block mt-2 text-[#800020]">
                with <span className="font-grillmaster">Guidia</span>
              </span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
              Connect seamlessly with students, career counselors, and employers through our innovative platform,
              designed to streamline career guidance.
            </p>

            <div className="pt-4">
              <Button
                size="lg"
                className="font-medium rounded-md px-8 bg-[#800020] hover:bg-rose-800 transition-all duration-300 group"
                onClick={() => navigate("/auth/register")}
              >
                Get Started
                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative"
          >
            <img
              className="relative w-full h-auto object-cover rounded-2xl"
              src="/images/landing-image.png"
              alt="Career guidance illustration"
            />
          </motion.div>
        </div>
      </div>
    </section>
  )
}


