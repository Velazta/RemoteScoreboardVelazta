"use client";

import React, { useState, useEffect, useRef } from "react";
import LayoutCustomization from "./LayoutCustomization";
import ResetConfirmationModal from "./ResetConfirmationModal";
import { useScoreboardStore } from "@/store/useScoreboardStore";
import gsap from "gsap";

export default function LiveMatchControl() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<"live" | "layout">("live");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState<"caution" | "success">("caution");

  const {
    team1,
    team2,
    setTeam1Name,
    setTeam1Score,
    setTeam2Name,
    setTeam2Score,
    swapTeams,
    resetScores,
    resetToDefault,
  } = useScoreboardStore();

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current.children,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power3.out" }
      );
    }
  }, []);

  const handleOpenResetModal = () => {
    setModalStep("caution");
    setIsModalOpen(true);
  };

  const handleConfirmReset = () => {
    resetToDefault();
    setModalStep("success");
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div ref={containerRef} className="flex flex-col w-full h-full gap-6">
      {/* Tab Navigation */}
      <div className="relative flex items-center gap-2 w-full bg-[#1A1A1A]/60 backdrop-blur-xl border border-white/10 rounded-[16px] p-2 shadow-lg">
        {/* Animated Slider Background */}
        <div
          className={`absolute top-2 bottom-2 left-2 w-[calc(50%-12px)] rounded-[12px] bg-gradient-to-b from-white/10 to-transparent border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-transform duration-300 ease-out ${
            activeTab === "live" ? "translate-x-0" : "translate-x-[calc(100%+8px)]"
          }`}
        />

        <button
          onClick={() => setActiveTab("live")}
          className={`relative z-10 flex-1 py-3.5 font-montserrat font-medium text-[10px] sm:text-xs tracking-widest uppercase transition-colors rounded-[12px] ${
            activeTab === "live"
              ? "text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]"
              : "text-white/50 hover:text-white"
          }`}
        >
          Live Match Control
        </button>

        <button
          onClick={() => setActiveTab("layout")}
          className={`relative z-10 flex-1 py-3.5 font-montserrat font-medium text-[10px] sm:text-xs tracking-widest uppercase transition-colors rounded-[12px] ${
            activeTab === "layout"
              ? "text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]"
              : "text-white/50 hover:text-white"
          }`}
        >
          Layout Customization
        </button>
      </div>

      {activeTab === "live" ? (
        <>
          {/* Team 1 Card */}
          <div className="flex flex-col w-full bg-[#1A1A1A]/60 backdrop-blur-xl border border-white/10 rounded-[12px] p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-5 h-5 rounded-full bg-[#a855f7] shadow-[0_0_12px_rgba(168,85,247,0.8)]" />
              <h3 className="font-montserrat font-medium text-xl text-white tracking-wide drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]">
                Team 1
              </h3>
            </div>

            <div className="space-y-5 font-poppins">
              <div>
                <label className="block text-[14px] font-medium text-white mb-2 uppercase tracking-wider">
                  Team Name
                </label>
                <input
                  type="text"
                  value={team1.name}
                  onChange={(e) => setTeam1Name(e.target.value)}
                  className="w-full rounded-[8px] bg-[#242424] border border-white/10 px-4 py-3.5 text-sm text-white focus:outline-none focus:border-white/30 transition-colors"
                />
              </div>
              <div>
                <label className="block text-[14px] font-medium text-white mb-2 uppercase tracking-wider">
                  Score
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setTeam1Score(team1.score - 1)}
                    className="flex-shrink-0 w-20 h-14 rounded-[8px] bg-[#a855f7] hover:bg-[#9333ea] flex items-center justify-center font-bold text-2xl text-white transition-colors cursor-pointer"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={team1.score}
                    onChange={(e) => setTeam1Score(Number(e.target.value))}
                    className="flex-1 min-w-0 h-14 rounded-[8px] bg-[#242424] border border-white/10 text-center font-montserrat font-bold text-xl text-white focus:outline-none focus:border-white/30 transition-colors"
                  />
                  <button
                    onClick={() => setTeam1Score(team1.score + 1)}
                    className="flex-shrink-0 w-20 h-14 rounded-[8px] bg-[#a855f7] hover:bg-[#9333ea] flex items-center justify-center font-bold text-2xl text-white transition-colors cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4 w-full">
            <button
              onClick={swapTeams}
              className="flex-1 py-4 rounded-[12px] bg-[#1A1A1A]/60 backdrop-blur-xl border border-white/10 text-zinc-400 hover:text-white hover:bg-white/5 font-poppins text-sm font-medium transition-colors cursor-pointer shadow-lg"
            >
              Swap Teams
            </button>
            <button
              onClick={resetScores}
              className="flex-1 py-4 rounded-[12px] bg-[#1A1A1A]/60 backdrop-blur-xl border border-red-500/30 text-red-500 hover:bg-red-500/10 hover:border-red-500/60 font-poppins text-sm font-medium transition-colors cursor-pointer shadow-[0_0_15px_rgba(239,68,68,0.1)]"
            >
              Reset Score
            </button>
          </div>

          {/* Team 2 Card */}
          <div className="flex flex-col w-full bg-[#1A1A1A]/60 backdrop-blur-xl border border-white/10 rounded-[12px] p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-5 h-5 rounded-full bg-[#eab308] shadow-[0_0_12px_rgba(234,179,8,0.8)]" />
              <h3 className="font-montserrat font-medium text-xl text-white tracking-wide drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]">
                Team 2
              </h3>
            </div>

            <div className="space-y-5 font-poppins">
              <div>
                <label className="block text-[14px] font-medium text-white mb-2 uppercase tracking-wider">
                  Team Name
                </label>
                <input
                  type="text"
                  value={team2.name}
                  onChange={(e) => setTeam2Name(e.target.value)}
                  className="w-full rounded-[8px] bg-[#242424] border border-white/10 px-4 py-3.5 text-sm text-white focus:outline-none focus:border-white/30 transition-colors"
                />
              </div>
              <div>
                <label className="block text-[14px] font-medium text-white mb-2 uppercase tracking-wider">
                  Score
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setTeam2Score(team2.score - 1)}
                    className="flex-shrink-0 w-20 h-14 rounded-[8px] bg-[#eab308] hover:bg-[#ca8a04] flex items-center justify-center font-bold text-2xl text-[#1a1a1a] transition-colors cursor-pointer"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={team2.score}
                    onChange={(e) => setTeam2Score(Number(e.target.value))}
                    className="flex-1 min-w-0 h-14 rounded-[8px] bg-[#242424] border border-white/10 text-center font-montserrat font-bold text-xl text-white focus:outline-none focus:border-white/30 transition-colors"
                  />
                  <button
                    onClick={() => setTeam2Score(team2.score + 1)}
                    className="flex-shrink-0 w-20 h-14 rounded-[8px] bg-[#eab308] hover:bg-[#ca8a04] flex items-center justify-center font-bold text-2xl text-[#1a1a1a] transition-colors cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <LayoutCustomization />
      )}

      {/* Reset ke Default Button (matching reference design) */}
      <button
        onClick={handleOpenResetModal}
        className="w-full py-4 rounded-[10px] bg-[#222222] hover:bg-[#282828] border border-red-600/90 text-red-500 font-poppins font-normal text-sm sm:text-base tracking-wide transition-all duration-150 cursor-pointer text-center shadow-lg active:scale-[0.99]"
      >
        Reset ke Default
      </button>

      {/* Confirmation & Success Pop-up Modal */}
      <ResetConfirmationModal
        isOpen={isModalOpen}
        step={modalStep}
        onClose={handleCloseModal}
        onConfirm={handleConfirmReset}
      />
    </div>
  );
}
