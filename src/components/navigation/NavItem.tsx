
import { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

interface NavItemProps {
  to: string;
  icon: LucideIcon;
  label: string;
  isActive: boolean;
}

export const NavItem = ({ to, icon: Icon, label, isActive }: NavItemProps) => {
  return (
    <Link 
      to={to} 
      className={`relative flex flex-col items-center justify-center py-2 px-3 transition-all duration-300 ${
        isActive 
          ? "text-accent" 
          : "text-gray-500 hover:text-accent hover:bg-accent/5"
      }`}
    >
      {/* Large blue ring with flame effect */}
      {isActive && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-0">
          {/* Outer flame glow - fading effect */}
          <div 
            className="w-16 h-16 rounded-full opacity-30 animate-pulse"
            style={{
              background: `radial-gradient(circle, 
                rgba(255, 127, 0, 0.4) 0%,
                rgba(74, 144, 226, 0.3) 25%, 
                rgba(255, 140, 66, 0.2) 50%,
                rgba(91, 163, 245, 0.1) 75%,
                transparent 100%
              )`,
              animationDuration: '2s'
            }}
          />
          
          {/* Main blue ring */}
          <div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full"
            style={{
              border: '2px solid #4a90e2',
              background: 'transparent'
            }}
          />
          
          {/* Inner flame ring - closer to the blue ring */}
          <div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-15 h-15 rounded-full opacity-60 animate-pulse"
            style={{
              background: `conic-gradient(
                from 0deg,
                rgba(255, 127, 0, 0.6),
                rgba(74, 144, 226, 0.6),
                rgba(255, 140, 66, 0.6),
                rgba(91, 163, 245, 0.6),
                rgba(255, 127, 0, 0.6)
              )`,
              animationDuration: '3s',
              padding: '1px'
            }}
          >
            <div className="w-full h-full rounded-full bg-white" />
          </div>
        </div>
      )}
      
      {/* Icon and Label - Elevated above the flame ring */}
      <div className="relative z-10 flex flex-col items-center">
        <Icon className={`mb-1 transition-all duration-300 ${
          isActive ? "h-6 w-6 drop-shadow-lg" : "h-5 w-5"
        }`} />
        <span className={`text-xs font-medium ${isActive ? 'drop-shadow-sm font-semibold' : ''}`}>{label}</span>
      </div>
    </Link>
  );
};
