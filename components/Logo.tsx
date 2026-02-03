
import React from 'react';

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className = '', iconOnly = false }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative w-12 h-12 flex items-center justify-center">
        {/* Outer Hexagon */}
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full text-[#1597aa] drop-shadow-[0_0_8px_rgba(21,151,170,0.6)]">
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            d="M50 5 L90 27.5 L90 72.5 L50 95 L10 72.5 L10 27.5 Z"
          />
        </svg>
        {/* Eye Shape */}
        <div className="relative w-6 h-6 flex items-center justify-center text-[#1597aa]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </div>
      </div>
      {!iconOnly && (
        <span className="font-futuristic text-2xl tracking-[0.2em] font-bold text-white uppercase glow-text">
          Elixus
        </span>
      )}
    </div>
  );
};

export default Logo;
