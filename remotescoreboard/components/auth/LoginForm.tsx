"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mail, Lock, Check, Eye, EyeOff } from "lucide-react";
import AvatarBadge from "./AvatarBadge";
import GoogleIcon from "./GoogleIcon";
import { createClient } from "@/lib/supabase/client";
import gsap from "gsap";

interface LoginFormProps {
  onToggleToRegister: () => void;
}

export default function LoginForm({ onToggleToRegister }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMessage(error.message);
      } else {
        window.location.href = "/dashboard";
      }
    } catch {
      setErrorMessage("Terjadi kesalahan saat masuk.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
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
        <h2 className="text-center font-montserrat text-2xl font-bold tracking-wider text-white mb-8">
          WELCOME BACK
        </h2>

        {errorMessage && (
          <div className="mb-5 rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-300 text-center font-poppins">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 font-poppins">
          {/* Email Address Input */}
          <div className="relative flex items-center rounded-xl bg-[#141414]/90 border border-white/[0.08] focus-within:border-white/30 transition-colors">
            <span className="pl-4 text-zinc-400">
              <Mail className="w-5 h-5" />
            </span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              className="w-full bg-transparent py-3.5 pl-3 pr-4 text-sm text-white placeholder-zinc-500 focus:outline-none"
            />
          </div>

          {/* Password Input */}
          <div className="relative flex items-center rounded-xl bg-[#141414]/90 border border-white/[0.08] focus-within:border-white/30 transition-colors">
            <span className="pl-4 text-zinc-400">
              <Lock className="w-5 h-5" />
            </span>
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full bg-transparent py-3.5 pl-3 pr-10 text-sm text-white placeholder-zinc-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Login Button (Silver Metallic Gradient) */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3.5 px-4 rounded-xl font-montserrat font-semibold text-sm tracking-wide text-zinc-950 bg-gradient-to-r from-[#363636] via-[#a7a7a7] to-[#919191] hover:brightness-110 active:scale-[0.99] transition duration-200 shadow-lg cursor-pointer"
          >
            {isLoading ? "Signing in..." : "Login"}
          </button>

          {/* Remember me & Forgot password */}
          <div className="flex items-center justify-between text-xs text-zinc-400 pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none group">
              <div
                onClick={() => setRememberMe(!rememberMe)}
                className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                  rememberMe
                    ? "bg-zinc-300 border-zinc-300 text-black"
                    : "border-zinc-600 group-hover:border-zinc-400"
                }`}
              >
                {rememberMe && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
              <span className="text-zinc-300">Remember me</span>
            </label>

            <a
              href="#forgot"
              className="text-zinc-300 hover:text-white transition-colors"
            >
              Forgot password
            </a>
          </div>

          {/* Divider & Google OAuth (Disabled for MVP: Operator accounts are pre-seeded) */}
          <div className="pt-2 text-center text-xs text-zinc-500 font-poppins">
            <span>Operator access only &bull; Credentials provisioned by Admin</span>
          </div>

          {/* Bottom Switch to Register */}
          <div className="text-center pt-2 text-xs text-zinc-400">
            <span>Dont have account yet? </span>
            <button
              type="button"
              onClick={onToggleToRegister}
              className="font-semibold text-white hover:underline cursor-pointer ml-1"
            >
              Sign Up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
