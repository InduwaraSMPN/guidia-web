import { Hero } from '../components/Hero';
import { Features } from '../components/Features';
import { Footer } from '../components/Footer';
import { AnimatedGridPattern } from '../components/ui/animated-grid-pattern';

export function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-neutral-50">
      <AnimatedGridPattern
        numSquares={40}
        maxOpacity={0.05}
        duration={4}
        repeatDelay={0.8}
        className="absolute top-0 left-0 w-full h-full [mask-image:linear-gradient(to_bottom,transparent,white_15%,white_85%,transparent)]"
      />
      <div className="relative z-10 mx-auto max-w-[1440px]">
        <Hero />
        <Features />
        <Footer />
      </div>
    </div>
  )
}