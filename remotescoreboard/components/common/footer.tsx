"use client";

import React from "react";

export default function Footer() {
  return (
    <footer className="w-full bg-[#000000] py-10 border-t border-white/[0.06] text-white">
      <div className="max-w-[1440px] mx-auto px-6 flex flex-col items-center justify-center gap-4">
        
        {/* Social Links / Icons */}
        <div className="flex items-center justify-center gap-6">
          {/* YouTube */}
          <a
            href="https://www.youtube.com/@velaztaa"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="YouTube"
            className="text-white hover:opacity-80 transition-opacity duration-200"
          >
            <svg className="w-10 h-10 fill-current" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
          </a>

          {/* TikTok */}
          <a
            href="https://www.tiktok.com/@xvelazta"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="TikTok"
            className="hover:opacity-80 transition-opacity duration-200"
          >
            <svg className="w-9 h-9" viewBox="0 0 24 24">
              <rect width="24" height="24" rx="5" fill="white"/>
              <path d="M16.6 8.2a3.8 3.8 0 0 1-3-3.3V4.5h-2.7v10.8a2.3 2.3 0 1 1-2.3-2.3c.2 0 .4 0 .6.1V10.4a5 5 0 1 0 4.4 4.9V9.5a6.4 6.4 0 0 0 3.7 1.2V8.2z" fill="#0C0C0C"/>
            </svg>
          </a>

          {/* Website / Globe with Cursor */}
          <a
            href="https://linktree-xi-gilt.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Website"
            className="text-white hover:opacity-80 transition-opacity duration-200 relative"
          >
            <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" />
              <path d="M3.6 9h16.8M3.6 15h16.8" />
              <path d="M11.5 3a17 17 0 0 0 0 18M12.5 3a17 17 0 0 1 0 18" />
              {/* Cursor Arrow Overlay */}
              <path d="M14 14l6 6m-1.5 0l.5-4L20 20l-4-.5 4-1.5" fill="currentColor" stroke="currentColor" strokeWidth="1" />
            </svg>
          </a>
        </div>

        {/* Copyright Text */}
        <p className="font-montserrat font-light text-base tracking-[1.75px] text-[#fffff]">
          &copy; velazta production
        </p>

      </div>
    </footer>
  );
}
