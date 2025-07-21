"use client";
import { useEffect, useState } from "react";

export default function ClientHeader() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <header className="flex flex-col items-center justify-center py-8 animate-fade-in">
      <div className="flex items-center space-x-4">
        <span className="text-5xl animate-bounce" role="img" aria-label="taxi">🚕</span>
        <h1 className="main-header">NYC Taxi Analytics Dashboard</h1>
      </div>
      <button
        className="btn-secondary mt-4"
        onClick={() => setDarkMode((d) => !d)}
        aria-label="Toggle dark mode"
      >
        {darkMode ? "🌙 Dark Mode" : "☀️ Light Mode"}
      </button>
    </header>
  );
} 