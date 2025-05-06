import React, { useRef } from "react";
import { motion } from "framer-motion";

// Custom hooks for scroll animations

// Custom hooks to match framer-motion functionality
const useScroll = ({ target }: { target: React.RefObject<HTMLElement> }) => {
  const [scrollYProgress, setScrollYProgress] = React.useState(0);

  React.useEffect(() => {
    const handleScroll = () => {
      if (!target.current) return;

      const element = target.current;
      const elementTop = element.getBoundingClientRect().top;
      const elementHeight = element.offsetHeight;
      const windowHeight = window.innerHeight;

      // Calculate scroll progress (0 to 1)
      const progress = Math.max(0, Math.min(1,
        1 - (elementTop / (elementHeight - windowHeight))
      ));

      setScrollYProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial calculation

    return () => window.removeEventListener('scroll', handleScroll);
  }, [target]);

  return { scrollYProgress };
};

const useTransform = <T,>(
  value: number,
  inputRange: number[],
  outputRange: T[]
): T => {
  // Simple linear interpolation
  const progress = Math.min(1, Math.max(0, value));
  const inputMin = inputRange[0];
  const inputMax = inputRange[1];
  const outputMin = outputRange[0];
  const outputMax = outputRange[1];

  // Handle numeric values
  if (typeof outputMin === 'number' && typeof outputMax === 'number') {
    return (outputMin + (outputMax - outputMin) * ((progress - inputMin) / (inputMax - inputMin))) as T;
  }

  // Return default value if not numeric
  return progress < 0.5 ? outputMin : outputMax;
};

export const ContainerScroll = ({
  titleComponent,
  children,
}: {
  titleComponent: string | React.ReactNode;
  children: React.ReactNode;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
  });
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  const scaleDimensions = () => {
    return isMobile ? [0.7, 0.9] : [1.05, 1];
  };

  const rotate = useTransform(scrollYProgress, [0, 1], [20, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], scaleDimensions());
  const translate = useTransform(scrollYProgress, [0, 1], [0, -100]);

  return (
    <div
      className="h-[40rem] md:h-[60rem] flex items-center justify-center relative p-2 md:p-20"
      ref={containerRef}
    >
      <div
        className="py-10 md:py-40 w-full relative"
        style={{
          perspective: "1000px",
        }}
      >
        <Header translate={translate} titleComponent={titleComponent} />
        <Card rotate={rotate} scale={scale}>
          {children}
        </Card>
      </div>
    </div>
  );
};

export const Header = ({
  translate,
  titleComponent
}: {
  translate: number;
  titleComponent: React.ReactNode
}) => {
  return (
    <motion.div
      style={{
        translateY: translate,
      }}
      className="div max-w-5xl mx-auto text-center"
    >
      {titleComponent}
    </motion.div>
  );
};

export const Card = ({
  rotate,
  scale,
  children,
}: {
  rotate: number;
  scale: number;
  children: React.ReactNode;
}) => {
  return (
    <motion.div
      style={{
        rotateX: rotate,
        scale,
        boxShadow:
          "0 0 #0000004d, 0 9px 20px #0000004a, 0 37px 37px #00000042, 0 84px 50px #00000026, 0 149px 60px #0000000a, 0 233px 65px #00000003",
      }}
      className="max-w-5xl mx-auto h-[30rem] md:h-[40rem] w-full border-2 border-gray-800 p- md:p-6 bg-black rounded-[30px] shadow-2xl"
    >
      <div className="h-full w-full overflow-hidden rounded-2xl bg-white md:rounded-2xl md:p-4">
        {children}
      </div>
    </motion.div>
  );
};
