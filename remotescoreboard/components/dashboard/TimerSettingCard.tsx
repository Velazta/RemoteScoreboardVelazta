"use client";

import React, { useEffect, useState, useRef } from "react";
import { Clock, Copy, Check, Play, Pause, RotateCcw, Plus, Volume2, Type, Palette, Trash2 } from "lucide-react";
import { useTimerStore } from "@/store/useTimerStore";
import { useScoreboardStore } from "@/store/useScoreboardStore";
import AnimatedScore from "./AnimatedScore";
import { FontPicker } from "./FontPicker";

interface TimerSettingCardProps {
  onRemove?: () => void;
}

export default function TimerSettingCard({ onRemove }: TimerSettingCardProps) {
  const { timer, updateTimer } = useTimerStore();
  const { obsToken } = useScoreboardStore();
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(() => window.location.origin);
    }
  }, []);

  // Timer countdown ticker in dashboard
  useEffect(() => {
    if (!timer.isRunning) return;
    const interval = setInterval(() => {
      const currentTimer = useTimerStore.getState().timer;
      if (currentTimer.remainingSeconds > 0) {
        updateTimer({ remainingSeconds: currentTimer.remainingSeconds - 1 });
      } else {
        updateTimer({ isRunning: false });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [timer.isRunning, updateTimer]);

  // Always use obsToken for the timer URL so OBS uses the same realtime channel
  const timerObsUrl = obsToken ? `${origin}/obs/timer/${obsToken}` : `${origin}/obs/timer/loading...`;

  const handleCopyLink = () => {
    if (!obsToken) return;
    navigator.clipboard.writeText(timerObsUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleTimerRun = () => {
    updateTimer({ isRunning: !timer.isRunning });
  };

  const addOneMinute = () => {
    const nextRemaining = timer.remainingSeconds + 60;
    updateTimer({
      durationSeconds: Math.max(timer.durationSeconds, nextRemaining),
      remainingSeconds: nextRemaining,
    });
  };

  const resetTimer = () => {
    updateTimer({
      remainingSeconds: timer.durationSeconds,
      isRunning: false,
    });
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const handleEditSubmit = () => {
    setIsEditing(false);
    const parts = editValue.split(":");
    let newSeconds = 0;
    if (parts.length === 2) {
      newSeconds = parseInt(parts[0] || "0") * 60 + parseInt(parts[1] || "0");
    } else if (parts.length === 1) {
      // Treat single number as minutes
      newSeconds = parseInt(parts[0] || "0") * 60;
    }
    
    if (!isNaN(newSeconds)) {
      updateTimer({
        durationSeconds: newSeconds,
        remainingSeconds: newSeconds,
        isRunning: false
      });
    }
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleEditSubmit();
    } else if (e.key === "Escape") {
      setIsEditing(false);
    }
  };

  const startEditing = () => {
    setEditValue(formatTime(timer.remainingSeconds));
    updateTimer({ isRunning: false });
    setIsEditing(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  return (
    <div className="flex flex-col w-full bg-[#1A1A1A]/60 backdrop-blur-xl border border-white/10 rounded-[12px] p-6 shadow-lg space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
          <h3 className="font-montserrat font-medium text-lg text-white uppercase tracking-wider drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]">
            TIMER
          </h3>
        </div>
        {onRemove && (
          <button
            onClick={onRemove}
            className="p-2 rounded-[8px] bg-[#242424] hover:bg-red-500/20 border border-white/10 hover:border-red-500/40 text-zinc-400 hover:text-red-400 transition-all cursor-pointer"
            title="Remove Timer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="space-y-5 font-poppins">
        {/* TIMER BROWSER SOURCE LINK */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span className="text-[13px] font-semibold text-white uppercase tracking-wider">
              TIMER BROWSER SOURCE
            </span>
          </div>
          <p className="text-xs text-zinc-400">
            Add this link as a Browser Source in OBS, set it to 1920 × 1080.
          </p>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="text"
              readOnly
              value={timerObsUrl}
              className="flex-1 rounded-[8px] bg-[#141414] border border-white/10 px-4 py-3 text-xs font-mono text-zinc-300 focus:outline-none"
            />
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-2 px-5 py-3 rounded-[8px] bg-[#0BE6C4] hover:bg-[#07c2a5] text-black font-semibold text-xs tracking-wider transition-colors cursor-pointer shrink-0 shadow-[0_0_15px_rgba(11,230,196,0.3)]"
            >
              {copied ? (
                <><Check className="w-4 h-4" /><span>COPIED!</span></>
              ) : (
                <><Copy className="w-4 h-4" /><span>COPY LINK</span></>
              )}
            </button>
          </div>
        </div>

        {/* TIMER DISPLAY & CONTROLS */}
        <div className="flex flex-col items-center justify-center p-6 bg-[#141414] rounded-[12px] border border-white/10 space-y-4">
          
          <div 
            className="text-5xl sm:text-6xl font-bold tracking-widest drop-shadow-[0_0_15px_rgba(6,182,212,0.6)] cursor-text hover:opacity-80 transition-opacity"
            style={{ 
              fontFamily: timer.fontFamily || "Montserrat",
              color: timer.color || "#06b6d4" 
            }}
            onClick={!isEditing ? startEditing : undefined}
          >
            {isEditing ? (
              <input
                ref={inputRef}
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={handleEditSubmit}
                onKeyDown={handleEditKeyDown}
                placeholder="MM:SS"
                className="bg-transparent border-b-2 border-cyan-400 text-center w-48 focus:outline-none"
              />
            ) : (
              <AnimatedScore value={formatTime(timer.remainingSeconds)} align="center" />
            )}
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={addOneMinute}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-[8px] bg-[#242424] hover:bg-white/10 border border-white/10 text-white font-medium text-xs tracking-wide transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 text-cyan-400" />
              <span>1 Min</span>
            </button>

            <button
              onClick={toggleTimerRun}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-lg ${
                timer.isRunning
                  ? "bg-amber-500 hover:bg-amber-600 text-black shadow-[0_0_20px_rgba(245,158,11,0.5)]"
                  : "bg-[#0BE6C4] hover:bg-[#07c2a5] text-black shadow-[0_0_20px_rgba(11,230,196,0.5)]"
              }`}
            >
              {timer.isRunning ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
            </button>

            <button
              onClick={resetTimer}
              className="p-3 rounded-[8px] bg-[#242424] hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-white transition-all cursor-pointer"
              title="Reset Timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold tracking-wider text-white">
              <div className="flex items-center gap-1.5"><Type className="w-3.5 h-3.5 text-cyan-400"/> FONT</div>
            </div>
            <FontPicker
              label="TIMER FONT"
              valueFontFamily={timer.fontFamily || "Montserrat"}
              valueCustomUrl={timer.customFontUrl || null}
              onChange={(family, url) => updateTimer({ fontFamily: family, customFontUrl: url ?? null })}
              layoutId="timer"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold tracking-wider text-white">
              <div className="flex items-center gap-1.5"><Palette className="w-3.5 h-3.5 text-cyan-400"/> TEXT COLOR</div>
            </div>
            <div className="flex items-center gap-3 bg-[#141414] border border-white/10 rounded-lg p-2.5">
              <input
                type="color"
                value={timer.color || "#06b6d4"}
                onChange={(e) => updateTimer({ color: e.target.value })}
                className="w-8 h-8 rounded cursor-pointer bg-transparent border-none p-0"
              />
              <span className="font-mono text-xs text-zinc-300 uppercase">{timer.color || "#06b6d4"}</span>
            </div>
          </div>
        </div>

        {/* AUDIO VOLUME SLIDER */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-zinc-400" />
              <label className="text-[13px] font-medium text-white/80 uppercase tracking-wider">
                AUDIO VOLUME
              </label>
            </div>
            <span className="text-xs font-mono text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/30">
              {timer.audioVolume}%
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={timer.audioVolume}
            onChange={(e) => updateTimer({ audioVolume: Number(e.target.value) })}
            className="w-full h-2 bg-[#242424] rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
        </div>

        {/* TIMER FONT SIZE SLIDER */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[13px] font-medium text-white/80 uppercase tracking-wider">
              TIMER SIZE
            </label>
            <span className="text-xs font-mono text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/30">
              {timer.fontSize}px
            </span>
          </div>
          <input
            type="range"
            min={30}
            max={300}
            value={timer.fontSize}
            onChange={(e) => updateTimer({ fontSize: Number(e.target.value) })}
            className="w-full h-2 bg-[#242424] rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
        </div>
      </div>
    </div>
  );
}
