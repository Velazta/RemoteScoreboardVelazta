"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";

export default function Header() {
    const headerRef = useRef<HTMLDivElement>(null);

    const [hoveredBtn, setHoveredBtn] = useState<"signin" | "signup">("signup");
    
    // 1. STATE BARU: Untuk membuka/menutup menu di Mobile
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        // Simple GSAP fade-in + slide-down animation
        if (headerRef.current) {
            gsap.fromTo(
                headerRef.current,
                { opacity: 0, y: -100 },
                { opacity: 1, y: 0, duration: 2, ease: "power3.out" }
            );
        }
    }, []);

    return (
        <header
            ref={headerRef}
            className="fixed top-0 left-0 w-full bg-transparent text-[#ffffff] z-50"
            style={{ padding: "20px 10px 10px 20px" }}>

            {/* 2. PENYESUAIAN CONTAINER: Pakai justify-between untuk mobile, dan gap-[270px] dikembalikan saat layar besar (xl) */}
            <div className="flex items-center justify-between xl:justify-center gap-4 xl:gap-[380px] w-full pr-4 md:pr-0">
                
                {/* left side (TIDAK DIUBAH) */}
                <Link href="/" className="flex items-center gap-3">
                    <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-full overflow-hidden">
                            <Image
                                src="/images/auth/simo-logo.png"
                                alt="Velazta Logo"
                                fill
                                className="object-cover" />
                        </div>
                        <span className="font-poppins font-semibold text-xl tracking-wide">VELAZTA</span>
                    </div>
                </Link>


                {/* middle (TIDAK DIUBAH) */}
                <div className="hidden md:flex items-center gap-8 font-poppins font-light text-sm">
                    <Link href="/" className="hover:text-[#999999] transition-colors duration-300">HOME</Link>
                    <Link href="#tutorials" className="hover:text-[#999999] transition-colors duration-300">TUTORIALS</Link>
                    <Link href="#guide" className="hover:text-[#999999] transition-colors duration-300">GUIDE</Link>
                    <Link href="#custom" className="hover:text-[#999999] transition-colors duration-300">CUSTOM</Link>
                    <Link href="#faq" className="hover:text-[#999999] transition-colors duration-300">FAQ</Link>
                </div>


                {/* right side & Hamburger Menu */}
                <div className="flex items-center gap-4">
                    {/* Tombol Auth (Disembunyikan di HP layar sangat kecil (sm) agar tidak sempit, dipindah ke menu dropdown) */}
                    <div
                        className="hidden sm:flex relative items-center p-1"
                        // Mengembalikan posisi background ke Sign Up jika kursor keluar dari area tombol
                        onMouseLeave={() => setHoveredBtn("signup")}
                    >
                        <div
                            className={`absolute top-1 bottom-1 w-[90px] rounded-full bg-[#ffffff] shadow-md transition-transform duration-300 ease-out ${hoveredBtn === "signin" ? "translate-x-0" : "translate-x-[90px]"
                                }`}
                        />
                        {/* Tombol Sign In */}
                        <Link
                            href="/auth/login"
                            onMouseEnter={() => setHoveredBtn("signin")}
                            className={`relative z-10 w-[90px] text-center py-2 font-poppins font-semibold text-sm transition-colors duration-300 ${hoveredBtn === "signin" ? "text-[#000000]" : "text-[#ffffff]"
                                }`}
                        >
                            Sign In
                        </Link>

                        {/* Tombol Sign Up */}
                        <Link
                            href="/auth/register"
                            onMouseEnter={() => setHoveredBtn("signup")}
                            className={`relative z-10 w-[90px] text-center py-2 font-poppins font-semibold text-sm transition-colors duration-300 ${hoveredBtn === "signup" ? "text-[#000000]" : "text-[#ffffff]"
                                }`}
                        >
                            Sign Up
                        </Link>
                    </div>

                    {/* 3. TOMBOL HAMBURGER KHUSUS MOBILE */}
                    <button 
                        className="md:hidden text-white focus:outline-none"
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

            {/* 4. DROPDOWN MENU MOBILE (Muncul jika tombol hamburger diklik) */}
            {isMobileMenuOpen && (
                <div className="md:hidden absolute top-full left-0 w-full bg-black/95 backdrop-blur-md py-6 px-4 flex flex-col items-center gap-6 border-t border-gray-800">
                    <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="font-poppins font-light text-sm hover:text-[#999999]">HOME</Link>
                    <Link href="#tutorials" onClick={() => setIsMobileMenuOpen(false)} className="font-poppins font-light text-sm hover:text-[#999999]">TUTORIALS</Link>
                    <Link href="#guide" onClick={() => setIsMobileMenuOpen(false)} className="font-poppins font-light text-sm hover:text-[#999999]">GUIDE</Link>
                    <Link href="#custom" onClick={() => setIsMobileMenuOpen(false)} className="font-poppins font-light text-sm hover:text-[#999999]">CUSTOM</Link>
                    <Link href="#faq" onClick={() => setIsMobileMenuOpen(false)} className="font-poppins font-light text-sm hover:text-[#999999]">FAQ</Link>
                    
                    {/* Tombol Auth versi Mobile */}
                    <div className="flex sm:hidden gap-4 mt-2">
                        <Link href="/auth/login" className="px-6 py-2 border border-white rounded-full font-poppins text-sm font-semibold text-white">Sign In</Link>
                        <Link href="/auth/register" className="px-6 py-2 bg-white text-black rounded-full font-poppins text-sm font-semibold">Sign Up</Link>
                    </div>
                </div>
            )}
        </header>
    );
}