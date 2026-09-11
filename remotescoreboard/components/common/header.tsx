"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { createClient } from "@/lib/supabase/client";

export default function Header() {
    const headerRef = useRef<HTMLDivElement>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

    useEffect(() => {
        // Simple GSAP fade-in + slide-down animation
        if (headerRef.current) {
            gsap.fromTo(
                headerRef.current,
                { opacity: 0, y: -100 },
                { opacity: 1, y: 0, duration: 2, ease: "power3.out" }
            );
        }

        const supabase = createClient();
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) setIsAuthenticated(true);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setIsAuthenticated(!!session?.user);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const handleSignOut = async () => {
        if (typeof window !== "undefined") {
            localStorage.removeItem("remember_me");
            document.cookie = "remember_me=; path=/; max-age=0";
        }
        const supabase = createClient();
        await supabase.auth.signOut();
        window.location.href = "/";
    };

    const scrollToSection = (id: string, e?: React.MouseEvent) => {
        if (e) e.preventDefault();
        setIsMobileMenuOpen(false);

        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
            window.location.href = `/#${id}`;
        }
    };

    return (
        <header
            ref={headerRef}
            className="fixed top-0 left-0 w-full bg-transparent text-[#ffffff] z-50"
            style={{ opacity: 0 }}
        >
            <div className="w-full flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
                {/* Logo and Brand */}
                <Link href="/" className="cursor-pointer">
                    <div className="flex items-center gap-2">
                        <div className="relative w-8 h-8 rounded-full overflow-hidden flex items-center justify-center">
                            <Image
                                src="/images/auth/simo-logo.png"
                                alt="Velazta Logo"
                                fill
                                className="object-cover" />
                        </div>
                        <span className="font-poppins font-semibold text-xl tracking-wide">VELAZTA</span>
                    </div>
                </Link>

                {/* Middle navigation buttons */}
                <div className="hidden md:flex items-center gap-8 font-poppins font-light text-sm">
                    <button onClick={(e) => scrollToSection("home", e)} className="hover:text-[#999999] transition-colors duration-300 cursor-pointer">HOME</button>
                    <button onClick={(e) => scrollToSection("tutorials", e)} className="hover:text-[#999999] transition-colors duration-300 cursor-pointer">TUTORIALS</button>
                    <button onClick={(e) => scrollToSection("features", e)} className="hover:text-[#999999] transition-colors duration-300 cursor-pointer">FEATURE</button>
                    <button onClick={(e) => scrollToSection("faq", e)} className="hover:text-[#999999] transition-colors duration-300 cursor-pointer">FAQ</button>
                    <button onClick={(e) => scrollToSection("custom", e)} className="hover:text-[#999999] transition-colors duration-300 cursor-pointer">CUSTOM</button>
                </div>

                {/* Right side & Hamburger Menu */}
                <div className="flex items-center gap-4">
                    {isAuthenticated ? (
                        <div className="hidden sm:flex items-center gap-3">
                            <Link
                                href="/dashboard"
                                className="px-5 py-2 rounded-full bg-white text-black font-poppins font-semibold text-sm hover:bg-zinc-200 transition-colors shadow-md"
                            >
                                Dashboard
                            </Link>
                            <button
                                onClick={handleSignOut}
                                className="px-4 py-2 rounded-full border border-white/20 text-white font-poppins text-xs hover:bg-white/10 transition-colors cursor-pointer"
                            >
                                Sign Out
                            </button>
                        </div>
                    ) : (
                        /* Clean Sign In Button (Registration is disabled) */
                        <div className="hidden sm:flex items-center">
                            <Link
                                href="/auth/login"
                                className="px-6 py-2 rounded-full bg-white text-black font-poppins font-semibold text-sm hover:bg-zinc-200 hover:scale-105 active:scale-95 transition-all shadow-md"
                            >
                                Sign In
                            </Link>
                        </div>
                    )}

                    {/* Tombol Hamburger Mobile */}
                    <button 
                        className="md:hidden text-white focus:outline-none cursor-pointer"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {isMobileMenuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>
            </div>

            {/* Dropdown Menu Mobile */}
            {isMobileMenuOpen && (
                <div className="md:hidden absolute top-full left-0 w-full bg-black/95 backdrop-blur-md py-6 px-4 flex flex-col items-center gap-6 border-t border-gray-800">
                    <button onClick={(e) => scrollToSection("home", e)} className="font-poppins font-light text-sm hover:text-[#999999] cursor-pointer">HOME</button>
                    <button onClick={(e) => scrollToSection("tutorials", e)} className="font-poppins font-light text-sm hover:text-[#999999] cursor-pointer">TUTORIALS</button>
                    <button onClick={(e) => scrollToSection("features", e)} className="font-poppins font-light text-sm hover:text-[#999999] cursor-pointer">FEATURE</button>
                    <button onClick={(e) => scrollToSection("faq", e)} className="font-poppins font-light text-sm hover:text-[#999999] cursor-pointer">FAQ</button>
                    <button onClick={(e) => scrollToSection("custom", e)} className="font-poppins font-light text-sm hover:text-[#999999] cursor-pointer">CUSTOM</button>
                    
                    {isAuthenticated ? (
                        <div className="flex sm:hidden gap-3 mt-2">
                            <Link href="/dashboard" className="px-6 py-2 bg-white text-black rounded-full font-poppins text-sm font-semibold">Dashboard</Link>
                            <button onClick={handleSignOut} className="px-4 py-2 border border-white/20 text-white rounded-full font-poppins text-xs cursor-pointer">Sign Out</button>
                        </div>
                    ) : (
                        <div className="flex sm:hidden gap-4 mt-2">
                            <Link href="/auth/login" className="px-6 py-2 bg-white text-black rounded-full font-poppins text-sm font-semibold hover:bg-zinc-200 transition-colors">Sign In</Link>
                        </div>
                    )}
                </div>
            )}
        </header>
    );
}