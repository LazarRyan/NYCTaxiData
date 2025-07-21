"use client";

export default function ClientHeader() {
  return (
    <header className="flex flex-col items-center justify-center py-8 animate-fade-in">
      <div className="flex items-center space-x-4">
        <span className="text-5xl animate-bounce" role="img" aria-label="taxi">🚕</span>
        <h1 className="main-header">NYC Taxi Analytics Dashboard</h1>
      </div>
    </header>
  );
} 