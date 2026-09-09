import React from "react";
import Image from "next/image";
import Header from "@/components/common/header";
import ScoreboardPreview from "@/components/dashboard/ScoreboardPreview";
import StreamingSource from "@/components/dashboard/StreamingSource";
import LiveMatchControl from "@/components/dashboard/LiveMatchControl";
import Footer from "@/components/common/footer";

export default function DashboardPage() {
  return (
    <main className="relative min-h-screen w-full bg-[#0C0C0C] flex flex-col font-poppins selection:bg-purple-500/30">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/custompage/BACKGROUND_CUSTOM.png"
          alt="Dashboard Background"
          fill
          className="object-cover opacity-80"
          priority
        />
        {/* Optional overlay gradient for better readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0C0C0C]/30 via-transparent to-[#0C0C0C]/60" />
      </div>

      {/* Reused Header */}
      <Header />

      {/* Main Dashboard Content - Single Column Layout */}
      <div className="relative z-10 w-full max-w-[1300px] mx-auto px-4 sm:px-8 pt-[120px] pb-12 flex-1 flex flex-col gap-6">
        <ScoreboardPreview />
        <StreamingSource />
        <LiveMatchControl />
      </div>

      {/* Footer */}
      <div className="relative z-10 mt-auto">
        <Footer />
      </div>
    </main>
  );
}
