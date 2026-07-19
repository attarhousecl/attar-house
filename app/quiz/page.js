"use client";

import QuizExperience from "@/components/QuizExperience";

// Página del quiz: toda la experiencia vive en components/QuizExperience.js
// (también se usa embebida en el home).
export default function QuizPage() {
  return (
    <div className="quiz-page quiz-center">
      <QuizExperience />
    </div>
  );
}
