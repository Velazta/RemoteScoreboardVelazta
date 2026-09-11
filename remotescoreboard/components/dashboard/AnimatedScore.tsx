"use client";

import React, { useEffect, useState } from "react";

interface AnimatedScoreProps {
  value: string | number;
  align?: "left" | "center" | "right" | "justify";
  className?: string;
}

export default function AnimatedScore({ value, align = "center", className = "" }: AnimatedScoreProps) {
  const [prevValueProp, setPrevValueProp] = useState(value);
  const [currentVal, setCurrentVal] = useState(value);
  const [prevVal, setPrevVal] = useState<string | number | null>(null);
  const [direction, setDirection] = useState<"up" | "down">("up");
  const [isAnimating, setIsAnimating] = useState(false);

  // Derive state from props (React recommended pattern instead of useEffect)
  if (value !== prevValueProp) {
    if (typeof value === "number" && typeof currentVal === "number") {
       setDirection(value > currentVal ? "up" : "down");
    } else if (Number(value) > Number(currentVal)) {
       setDirection("up");
    } else {
       setDirection("down");
    }
    setPrevVal(currentVal);
    setCurrentVal(value);
    setPrevValueProp(value);
    setIsAnimating(true);
  }

  useEffect(() => {
    if (isAnimating) {
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setPrevVal(null);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [isAnimating]);

  const justifyMap = {
    left: "flex-start",
    center: "center",
    right: "flex-end",
    justify: "space-between",
  };
  const justifyContent = justifyMap[align];

  return (
    <span className={`relative inline-block overflow-hidden align-middle w-full h-full leading-none ${className}`}>
      <span className="opacity-0 pointer-events-none select-none relative z-[-1] leading-none">
        {currentVal}
      </span>

      {isAnimating && prevVal !== null ? (
        <>
          <span
            key={`old-${prevVal}`}
            className={`absolute left-0 right-0 top-0 bottom-0 flex items-center leading-none ${
              direction === "up" ? "animate-slide-up-out" : "animate-slide-down-out"
            }`}
            style={{ justifyContent }}
          >
            {prevVal}
          </span>
          <span
            key={`new-${currentVal}`}
            className={`absolute left-0 right-0 top-0 bottom-0 flex items-center leading-none ${
              direction === "up" ? "animate-slide-up-in" : "animate-slide-down-in"
            }`}
            style={{ justifyContent }}
          >
            {currentVal}
          </span>
        </>
      ) : (
        <span 
          className="absolute left-0 right-0 top-0 bottom-0 flex items-center leading-none"
          style={{ justifyContent }}
        >
          {currentVal}
        </span>
      )}
    </span>
  );
}
