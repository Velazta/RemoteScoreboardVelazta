"use client";

import React, { useState, useEffect, useRef } from "react";
import AvatarBadge from "./AvatarBadge";
import GoogleIcon from "./GoogleIcon";
import { Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import gsap from "gsap";

interface RegisterFormProps {
  onToggleToLogin: () => void;
}

export default function RegisterForm({ onToggleToLogin }: RegisterFormProps) {
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const formRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    // Simple GSAP fade-in + slide-up animation
    if (formRef.current) {
      gsap.fromTo(
        formRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
      );
    }
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    if (password !== rePassword) {
      setErrorMessage("Konfirmasi kata sandi tidak cocok.");
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullname,
          },
        },
      });

      if (error) {
        setErrorMessage(error.message);
      } else {
        setSuccessMessage("Registrasi berhasil! Silakan periksa email atau login.");
      }
    } catch {
      setErrorMessage("Terjadi kesalahan saat pendaftaran.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        setErrorMessage(error.message);
      }
    } catch {
      setErrorMessage("Google OAuth belum dikonfigurasi pada Supabase.");
    }
  };

  return (
    <div ref={formRef} className="relative w-full max-w-[460px] mx-auto opacity-0">
      {/* Top Esports Avatar Badge */}
      <AvatarBadge />

      {/* Glassmorphism Card */}
      <div className="relative rounded-[28px] border border-white/[0.12] bg-[#1a1a1a]/60 backdrop-blur-2xl px-8 pt-12 pb-9 shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
        {/* Title */}
        <h2 className="text-center font-montserrat text-2xl font-bold tracking-wider text-white mb-6">
          CREATE ACCOUNT
        </h2>

        {errorMessage && (
          <div className="mb-4 rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-300 text-center font-poppins">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3 text-xs text-emerald-300 text-center font-poppins">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-3.5 font-poppins">
          {/* Fullname Field */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5 pl-0.5">
              Fullname
            </label>
            <input
              type="text"
              required
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              placeholder="Enter your fullname"
              className="w-full rounded-xl bg-[#141414]/90 border border-white/[0.08] px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-white/30 focus:outline-none transition-colors"
            />
          </div>

          {/* Email Address Field */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5 pl-0.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full rounded-xl bg-[#141414]/90 border border-white/[0.08] px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-white/30 focus:outline-none transition-colors"
            />
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5 pl-0.5">
              Password
            </label>
            <div className="relative flex items-center">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full rounded-xl bg-[#141414]/90 border border-white/[0.08] px-4 py-2.5 pr-10 text-sm text-white placeholder-zinc-500 focus:border-white/30 focus:outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Re enter password Field */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5 pl-0.5">
              Re enter password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              required
              value={rePassword}
              onChange={(e) => setRePassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full rounded-xl bg-[#141414]/90 border border-white/[0.08] px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-white/30 focus:outline-none transition-colors"
            />
          </div>

          {/* Create Account Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3.5 px-4 rounded-xl font-montserrat font-semibold text-sm tracking-wide text-zinc-950 bg-gradient-to-r from-[#363636] via-[#a7a7a7] to-[#919191] hover:brightness-110 active:scale-[0.99] transition duration-200 shadow-lg cursor-pointer"
          >
            {isLoading ? "Creating Account..." : "Create Account"}
          </button>

          {/* Divider */}
          <div className="relative flex items-center justify-center py-1">
            <div className="w-full border-t border-white/[0.08]" />
            <span className="absolute bg-[#1a1a1a] px-3 text-[11px] font-medium tracking-wider text-zinc-500 uppercase">
              or
            </span>
          </div>

          {/* Google OAuth Button */}
          <button
            type="button"
            onClick={handleGoogleSignUp}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.1] text-xs font-montserrat font-medium text-zinc-200 transition duration-200 cursor-pointer"
          >
            <GoogleIcon className="w-4 h-4" />
            <span>Sign up with Google</span>
          </button>

          {/* Bottom Switch to Login */}
          <div className="text-center pt-1 text-xs text-zinc-400">
            <span>Already have account? </span>
            <button
              type="button"
              onClick={onToggleToLogin}
              className="font-semibold text-white hover:underline cursor-pointer ml-1"
            >
              Sign In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
