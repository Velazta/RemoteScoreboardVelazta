"use client";

import React from "react";
import AuthBackground from "@/components/auth/AuthBackground";
import RegisterForm from "@/components/auth/RegisterForm";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  return (
    <main className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 md:p-8 bg-[#0C0C0C] overflow-hidden">
      <AuthBackground />
      <div className="relative z-10 w-full max-w-lg">
        <RegisterForm onToggleToLogin={() => router.push("/auth/login")} />
      </div>
    </main>
  );
}
