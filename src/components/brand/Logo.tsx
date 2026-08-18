import React from "react";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = "md",
  showText = true,
  className = "",
}) => {
  const iconSizes = {
    sm: "w-7 h-7",
    md: "w-9 h-9",
    lg: "w-11 h-11",
    xl: "w-13 h-13",
  };

  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-xl",
    xl: "text-2xl",
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Zenith Geometric Mark */}
      <div
        className={`${iconSizes[size]} rounded-2xl bg-gradient-to-tr from-indigo-700 via-indigo-600 to-indigo-500 flex items-center justify-center shadow-md shadow-indigo-600/20 shrink-0 relative overflow-hidden border border-indigo-400/30`}
      >
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-5/6 h-5/6 text-white"
        >
          {/* Back subtle glow arc */}
          <path
            d="M6 10C6 7.79086 7.79086 6 10 6H22C24.2091 6 26 7.79086 26 10V22C26 24.2091 24.2091 26 22 26H10C7.79086 26 6 24.2091 6 22V10Z"
            fill="white"
            fillOpacity="0.05"
          />
          {/* Dynamic Z Polyline with gold accent */}
          <path
            d="M9 10.5H23L11 21.5H23"
            stroke="white"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="23" cy="10.5" r="2.2" fill="#FDE047" />
          <circle cx="9" cy="21.5" r="2.2" fill="#60A5FA" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col text-left">
          <span
            className={`font-black tracking-tight text-slate-900 leading-none ${textSizes[size]}`}
          >
            Zenith<span className="text-indigo-600">HR</span>
          </span>
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mt-1 leading-none">
            Workforce Orchestration
          </span>
        </div>
      )}
    </div>
  );
};
