"use client";

import React from "react";
import AuthBackground from "@/components/auth/AuthBackground";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 md:p-8 bg-[#0C0C0C] overflow-hidden">
      <AuthBackground />
      <div className="relative z-10 w-full max-w-lg">
        <LoginForm />
      </div>
    </main>
  );
}
