"use client";

import React from "react";
import { Check } from "lucide-react";

interface ResetConfirmationModalProps {
  isOpen: boolean;
  step: "caution" | "success";
  onClose: () => void;
  onConfirm: () => void;
}

export default function ResetConfirmationModal({
  isOpen,
  step,
  onClose,
  onConfirm,
}: ResetConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        onClick={step === "caution" ? onClose : undefined}
      />

      {/* Modal Dialog Card */}
      <div className="relative z-10 bg-white rounded-[28px] p-8 sm:p-10 w-full max-w-[340px] flex flex-col items-center text-center shadow-2xl animate-in zoom-in-95 duration-200">
        {step === "caution" ? (
          <>
            {/* Caution Icon */}
            <div className="w-24 h-24 rounded-full border-[3.5px] border-[#c4b500] flex items-center justify-center mb-4">
              <span className="text-[#c4b500] font-black text-5xl leading-none select-none pb-1">
                !
              </span>
            </div>

            {/* Title & Description */}
            <h3 className="font-poppins font-semibold text-2xl text-black">
              Caution
            </h3>
            <p className="font-poppins text-zinc-800 text-sm mt-3 leading-relaxed max-w-[240px]">
              Are you sure you want to reset to default settings?
            </p>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 w-full mt-6">
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-[12px] bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-poppins text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 py-3 rounded-[12px] bg-red-600 hover:bg-red-700 text-white font-poppins text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer shadow-md"
              >
                Yes, Reset
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Success Icon */}
            <div className="w-24 h-24 rounded-full border-[3.5px] border-[#00ff44] flex items-center justify-center mb-4">
              <Check className="w-12 h-12 text-[#00ff44] stroke-[3.5]" />
            </div>

            {/* Title & Description */}
            <h3 className="font-poppins font-semibold text-2xl text-black">
              Successfull!
            </h3>
            <p className="font-poppins text-zinc-800 text-sm mt-3 leading-relaxed max-w-[240px]">
              Settings have been reset to default.
            </p>

            {/* Close Button */}
            <div className="w-full mt-6">
              <button
                onClick={onClose}
                className="w-full py-3 rounded-[12px] bg-[#00e03c] hover:bg-[#00c835] text-white font-poppins text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer shadow-md"
              >
                Done
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
