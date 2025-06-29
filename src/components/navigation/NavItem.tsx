import { DivideIcon as LucideIcon } from "lucide-react";
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
      {/* Realistic flame ring effect for active state */}
      {isActive && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-0">
          {/* Main flame ring - creates the fire circle effect */}
          <div 
            className="w-14 h-14 rounded-full animate-pulse"
            style={{
              background: `conic-gradient(
                from 0deg,
                #ff4500 0deg,
                #ff6b00 30deg,
                #ffaa00 60deg,
                #ff8c00 90deg,
                #ff4500 120deg,
                #dc2626 150deg,
                #ff4500 180deg,
                #ff6b00 210deg,
                #ffaa00 240deg,
                #ff8c00 270deg,
                #ff4500 300deg,
                #dc2626 330deg,
                #ff4500 360deg
              )`,
              borderRadius: '50%',
              filter: 'blur(1px)',
              animationDuration: '2s'
            }}
          />
          
          {/* Inner flame ring - creates depth */}
          <div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full animate-pulse"
            style={{
              background: `conic-gradient(
                from 45deg,
                #ff6b00 0deg,
                #ffaa00 60deg,
                #ff4500 120deg,
                #dc2626 180deg,
                #ff6b00 240deg,
                #ffaa00 300deg,
                #ff4500 360deg
              )`,
              borderRadius: '50%',
              filter: 'blur(0.5px)',
              animationDuration: '1.5s',
              animationDelay: '0.3s'
            }}
          />
          
          {/* Outer glow effect */}
          <div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full animate-pulse opacity-60"
            style={{
              background: `radial-gradient(
                circle,
                rgba(255, 69, 0, 0.4) 0%,
                rgba(255, 140, 0, 0.3) 30%,
                rgba(255, 165, 0, 0.2) 60%,
                transparent 100%
              )`,
              filter: 'blur(2px)',
              animationDuration: '2.5s',
              animationDelay: '0.1s'
            }}
          />
          
          {/* Inner dark circle - creates the "hole" effect */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black opacity-80" />
          
          {/* Flame flicker effects - small animated elements */}
          <div 
            className="absolute top-1 left-1/2 transform -translate-x-1/2 w-1 h-2 bg-gradient-to-t from-orange-500 to-yellow-400 rounded-full animate-pulse opacity-80"
            style={{ animationDuration: '0.8s' }}
          />
          <div 
            className="absolute bottom-1 right-2 w-1 h-2 bg-gradient-to-t from-red-500 to-orange-400 rounded-full animate-pulse opacity-70"
            style={{ animationDuration: '1.2s', animationDelay: '0.4s' }}
          />
          <div 
            className="absolute top-2 right-1 w-1 h-1.5 bg-gradient-to-t from-orange-600 to-yellow-500 rounded-full animate-pulse opacity-60"
            style={{ animationDuration: '1s', animationDelay: '0.8s' }}
          />
          <div 
            className="absolute bottom-2 left-1 w-1 h-1.5 bg-gradient-to-t from-red-600 to-orange-500 rounded-full animate-pulse opacity-75"
            style={{ animationDuration: '0.9s', animationDelay: '0.2s' }}
          />
        </div>
      )}
      
      {/* Icon and Label - Elevated above the flame rings */}
      <div className="relative z-30 flex flex-col items-center">
        <Icon className={`mb-1 transition-all duration-300 ${
          isActive ? "h-7 w-7 drop-shadow-lg filter brightness-110" : "h-5 w-5"
        }`} />
        <span className={`text-xs font-medium ${isActive ? 'drop-shadow-sm font-semibold' : ''}`}>{label}</span>
      </div>
    </Link>
  );
};