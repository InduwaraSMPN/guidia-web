import { useState, useEffect } from 'react';
import { Skeleton } from "@/components/ui/skeleton";

export function AboutPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background px-4 sm:px-6 lg:px-8 pt-32">
        <div className="max-w-[1216px] mx-auto px-4 sm:px-6 lg:px-8 pb-32">
          <div className="mb-16">
            <Skeleton className="h-10 w-48 mb-6" />
          </div>

          <div className="grid md:grid-cols-2 gap-16 mb-20">
            <div className="bg-secondary p-8 rounded-2xl shadow-sm">
              <Skeleton className="h-8 w-32 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </div>

            <div className="bg-secondary p-8 rounded-2xl shadow-sm">
              <Skeleton className="h-8 w-32 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>

          <div className="space-y-8 mb-16">
            <div className="flex items-center space-x-4 mb-8">
              <Skeleton className="w-12 h-1 rounded-full" />
              <Skeleton className="h-8 w-48" />
            </div>

            {[...Array(5)].map((_, index) => (
              <Skeleton key={index} className="h-4 w-full mb-2" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 sm:px-6 lg:px-8 pt-32">
      <div className="max-w-[1216px] mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        <div className="mb-16">
          <h1 className="text-3xl font-bold text-brand mb-6">
            About Us
          </h1>
        </div>

        <div className="grid md:grid-cols-2 gap-16 mb-20">
          <div className="bg-secondary p-8 rounded-2xl shadow-sm transition-transform hover:transform hover:scale-102">
            <h2 className="text-2xl font-bold text-brand mb-4">Vision</h2>
            <p className="text-foreground leading-relaxed text-justify">
              To be the pioneer center of excellence in ensuring the employability of all the graduates who complete their studies at the university.
            </p>
          </div>

          <div className="bg-secondary p-8 rounded-2xl shadow-sm transition-transform hover:transform hover:scale-102">
            <h2 className="text-2xl font-bold text-brand mb-4">Mission</h2>
            <p className="text-foreground leading-relaxed text-justify">
              To develop the necessary skills and professionalism of the undergraduates through counseling, consultation and internship opportunities which will help them secure employment and negotiate the demands of the work place effectively.
            </p>
          </div>
        </div>

        <div className="space-y-8 text-foreground leading-relaxed mb-16">
          <div className="flex items-center space-x-4 mb-8">
            <div className="w-12 h-1 bg-brand rounded-full"></div>
            <h2 className="text-2xl font-semibold">Our Objective</h2>
          </div>

          <p className="text-justify">
            The objective of this unit is to prepare the students for their professional life. Making the students aware of employment opportunities available in the country and instructing them about the specific course units they should follow and soft skills they should acquire during their undergraduate life are the broad goals of this unit.
          </p>

          <p className="text-justify">
            The aim of the Career Guidance Unit is to prepare students for the outside world and to assist them in finding employment.
          </p>

          <p className="text-justify">
            Currently employers are looking for more attributes than simply the Degree. They are searching for a comprehensive graduate. Further the work life highly search for soft skills such as interpersonal skills, communication skills, presentation skills, time management, teamwork, and organizational abilities. The Career Guidance Unit helps the students of the University of Kelaniya to develop these skills.
          </p>

          <p className="text-justify">
            This unit gives the chance to the students to identify their goals and to go on that path by providing information, mentoring, advising them, training them and empowering them to achieve their goals.
          </p>

          <p className="text-justify">
            Creating links between private and public sector institutions with university students, identifying vocational needs and job opportunities of the industry and making students aware of them are the hallmark of this unit.
          </p>
        </div>
      </div>
    </div>
  );
}


