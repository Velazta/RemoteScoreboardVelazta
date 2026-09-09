"use client";

import React, { useState } from "react";

export default function LiveMatchControl() {
  const [team1Name, setTeam1Name] = useState("SADNESS");
  const [team1Score, setTeam1Score] = useState(0);

  const [team2Name, setTeam2Name] = useState("NBA");
  const [team2Score, setTeam2Score] = useState(0);

  return (
    <div className="flex flex-col w-full h-full gap-6">
      {/* Tab Navigation */}
      <div className="flex items-center gap-2 w-full bg-[#1A1A1A]/60 backdrop-blur-xl border border-white/10 rounded-[16px] p-2 shadow-lg">
        <button className="flex-1 py-3.5 font-montserrat font-bold text-xs tracking-widest text-white uppercase drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] rounded-[12px] bg-gradient-to-b from-white/10 to-transparent border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
          Live Match Control
        </button>
        <button className="flex-1 py-3.5 font-montserrat font-bold text-xs tracking-widest text-white/70 uppercase transition-colors rounded-[12px] hover:bg-white/5 hover:text-white">
          Layout Customization
        </button>
      </div>

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
              value={team1Name}
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
                onClick={() => setTeam1Score(Math.max(0, team1Score - 1))}
                className="flex-shrink-0 w-20 h-14 rounded-[8px] bg-[#a855f7] hover:bg-[#9333ea] flex items-center justify-center font-bold text-2xl text-white transition-colors cursor-pointer"
              >
                -
              </button>
              <input
                type="number"
                value={team1Score}
                onChange={(e) => setTeam1Score(Number(e.target.value))}
                className="flex-1 min-w-0 h-14 rounded-[8px] bg-[#242424] border border-white/10 text-center font-montserrat font-bold text-xl text-white focus:outline-none focus:border-white/30 transition-colors"
              />
              <button
                onClick={() => setTeam1Score(team1Score + 1)}
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
        <button className="flex-1 py-4 rounded-[12px] bg-[#1A1A1A]/60 backdrop-blur-xl border border-white/10 text-zinc-400 hover:text-white hover:bg-white/5 font-poppins text-sm font-medium transition-colors cursor-pointer shadow-lg">
          Swap Teams
        </button>
        <button
          onClick={() => {
            setTeam1Score(0);
            setTeam2Score(0);
          }}
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
              value={team2Name}
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
                onClick={() => setTeam2Score(Math.max(0, team2Score - 1))}
                className="flex-shrink-0 w-20 h-14 rounded-[8px] bg-[#eab308] hover:bg-[#ca8a04] flex items-center justify-center font-bold text-2xl text-[#1a1a1a] transition-colors cursor-pointer"
              >
                -
              </button>
              <input
                type="number"
                value={team2Score}
                onChange={(e) => setTeam2Score(Number(e.target.value))}
                className="flex-1 min-w-0 h-14 rounded-[8px] bg-[#242424] border border-white/10 text-center font-montserrat font-bold text-xl text-white focus:outline-none focus:border-white/30 transition-colors"
              />
              <button
                onClick={() => setTeam2Score(team2Score + 1)}
                className="flex-shrink-0 w-20 h-14 rounded-[8px] bg-[#eab308] hover:bg-[#ca8a04] flex items-center justify-center font-bold text-2xl text-[#1a1a1a] transition-colors cursor-pointer"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
