"use client";
import React from "react";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";

export function GuidiaAiChat() {
  // Define placeholders for the AI chat input
  const placeholders = [
    "Ask me anything...",
    "How can I help you today?",
    "What would you like to know?",
    "Type your question here...",
    "I'm here to assist you...",
  ];

  // Handle input changes (optional, e.g., for storing the value)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("Input value:", e.target.value);
    // You could store the value in state here if needed:
    // setQuestion(e.target.value);
  };

  // Handle form submission
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    // The component handles preventDefault internally
    console.log("Form submitted!");
    // Add your AI chat submission logic here, e.g.:
    // const question = (e.currentTarget.elements.namedItem('question') as HTMLInputElement)?.value;
    // if (question) {
    //   sendQuestionToAI(question);
    //   console.log(`Submitting question: ${question}`);
    //   // Process the response and update UI
    // }
  };

  return (
    <div className="h-screen w-full bg-background relative flex flex-col items-center justify-center antialiased overflow-hidden">
      <div className="max-w-2xl mx-auto p-4 relative z-10 flex flex-col items-center">
        <h1 className="text-4xl md:text-7xl text-brand text-center font-sans font-bold mb-4 whitespace-nowrap">
          <span className="font-grillmaster">Guidia</span> AI Assistant
        </h1>
        <p className="text-muted-foreground max-w-lg mx-auto my-2 text-sm text-center">
          Welcome to Guidia AI, your career guidance companion. Ask me about
          career paths, job opportunities, or educational resources. I'm here to
          help you navigate your professional journey with confidence.
        </p>

        {/* Use the PlaceholdersAndVanishInput component */}
        <PlaceholdersAndVanishInput
          placeholders={placeholders}
          onChange={handleChange}
          onSubmit={onSubmit}
          className="mt-6 w-full"
          inputClassName="pl-4 sm:pl-10"
        />
      </div>
      <BackgroundBeams className="z-0" />
    </div>
  );
}

export default GuidiaAiChat;
