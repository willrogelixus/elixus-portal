
import React, { useMemo } from 'react';

const CircuitBackground: React.FC = () => {
  // Generate random particles
  const particles = useMemo(() => {
    return Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: `${Math.random() * 5}s`,
      duration: `${10 + Math.random() * 20}s`,
      size: `${Math.random() * 3 + 1}px`,
    }));
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#0a0f1a]">
      {/* HUD Grid Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.05]" 
        style={{ 
          backgroundImage: `linear-gradient(#1597aa 1px, transparent 1px), linear-gradient(90deg, #1597aa 1px, transparent 1px)`,
          backgroundSize: '60px 60px' 
        }}
      />
      <div 
        className="absolute inset-0 opacity-[0.02]" 
        style={{ 
          backgroundImage: `linear-gradient(#1597aa 1px, transparent 1px), linear-gradient(90deg, #1597aa 1px, transparent 1px)`,
          backgroundSize: '12px 12px' 
        }}
      />

      {/* Scan Line Effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="w-full h-[2px] bg-[#1597aa]/5 absolute top-0 animate-[scan_8s_linear_infinite]" />
      </div>

      {/* Floating Particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-[#1597aa]/30 blur-[1px] animate-float"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            animationDelay: p.delay,
            animationDuration: p.duration,
          }}
        />
      ))}
      
      {/* Circuit lines simulation */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.15] pointer-events-none">
        <defs>
          <linearGradient id="circuit-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1597aa" stopOpacity="0" />
            <stop offset="50%" stopColor="#1597aa" stopOpacity="1" />
            <stop offset="100%" stopColor="#1597aa" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path 
          d="M0 100 L100 100 L150 150 L300 150 M400 0 L400 200 L450 250 M100% 300 L90% 300 L85% 350 L70% 350" 
          stroke="url(#circuit-grad)" 
          strokeWidth="1" 
          fill="none" 
        />
        <circle cx="300" cy="150" r="2" fill="#1597aa" className="animate-pulse" />
        <circle cx="450" cy="250" r="2" fill="#1597aa" className="animate-pulse" style={{ animationDelay: '1s' }} />
      </svg>

      {/* Floating blurred orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#1597aa]/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#1597aa]/5 blur-[100px] rounded-full" />
      
      <style>{`
        @keyframes scan {
          from { top: -10%; }
          to { top: 110%; }
        }
      `}</style>
    </div>
  );
};

export default CircuitBackground;
