
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
      {/* Realistic flame ring effect for active state */}
      {isActive && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-0">
          {/* Main outer flame ring */}
          <div 
            className="w-16 h-16 rounded-full animate-pulse"
            style={{
              background: `conic-gradient(
                from 0deg,
                #ff4500 0deg,
                #ff6b00 15deg,
                #ffaa00 30deg,
                #ff8c00 45deg,
                #ff4500 60deg,
                #dc2626 75deg,
                #ff4500 90deg,
                #ff6b00 105deg,
                #ffaa00 120deg,
                #ff8c00 135deg,
                #ff4500 150deg,
                #dc2626 165deg,
                #ff4500 180deg,
                #ff6b00 195deg,
                #ffaa00 210deg,
                #ff8c00 225deg,
                #ff4500 240deg,
                #dc2626 255deg,
                #ff4500 270deg,
                #ff6b00 285deg,
                #ffaa00 300deg,
                #ff8c00 315deg,
                #ff4500 330deg,
                #dc2626 345deg,
                #ff4500 360deg
              )`,
              borderRadius: '50%',
              filter: 'blur(2px)',
              animationDuration: '3s'
            }}
          />
          
          {/* Inner bright flame ring */}
          <div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full animate-pulse"
            style={{
              background: `conic-gradient(
                from 30deg,
                #ffaa00 0deg,
                #ff6b00 45deg,
                #ff4500 90deg,
                #dc2626 135deg,
                #ff4500 180deg,
                #ff6b00 225deg,
                #ffaa00 270deg,
                #ff8c00 315deg,
                #ffaa00 360deg
              )`,
              borderRadius: '50%',
              filter: 'blur(1px)',
              animationDuration: '2s',
              animationDelay: '0.5s'
            }}
          />
          
          {/* Outer glow with more intensity */}
          <div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-18 h-18 rounded-full animate-pulse opacity-70"
            style={{
              background: `radial-gradient(
                circle,
                rgba(255, 140, 0, 0.8) 0%,
                rgba(255, 69, 0, 0.6) 20%,
                rgba(255, 165, 0, 0.4) 40%,
                rgba(220, 38, 38, 0.3) 60%,
                rgba(255, 69, 0, 0.2) 80%,
                transparent 100%
              )`,
              filter: 'blur(3px)',
              animationDuration: '2.8s',
              animationDelay: '0.2s'
            }}
          />
          
          {/* Inner dark circle - the "hole" */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black opacity-90" />
          
          {/* Multiple flame flicker effects positioned around the ring */}
          <div 
            className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1 w-2 h-4 bg-gradient-to-t from-orange-500 via-yellow-400 to-red-500 rounded-full animate-pulse opacity-90"
            style={{ 
              animationDuration: '0.6s',
              clipPath: 'polygon(30% 100%, 70% 100%, 90% 50%, 70% 20%, 50% 0%, 30% 20%, 10% 50%)'
            }}
          />
          <div 
            className="absolute bottom-0 right-2 transform translate-y-1 w-2 h-3 bg-gradient-to-t from-red-600 to-orange-400 rounded-full animate-pulse opacity-80"
            style={{ 
              animationDuration: '0.8s', 
              animationDelay: '0.3s',
              clipPath: 'polygon(30% 100%, 70% 100%, 85% 60%, 70% 30%, 50% 0%, 30% 30%, 15% 60%)'
            }}
          />
          <div 
            className="absolute top-1 right-0 transform translate-x-1 w-1.5 h-3 bg-gradient-to-t from-orange-600 to-yellow-500 rounded-full animate-pulse opacity-75"
            style={{ 
              animationDuration: '0.7s', 
              animationDelay: '0.6s',
              clipPath: 'polygon(25% 100%, 75% 100%, 90% 40%, 50% 0%, 10% 40%)'
            }}
          />
          <div 
            className="absolute bottom-1 left-0 transform -translate-x-1 w-1.5 h-3 bg-gradient-to-t from-red-700 to-orange-500 rounded-full animate-pulse opacity-85"
            style={{ 
              animationDuration: '0.9s', 
              animationDelay: '0.1s',
              clipPath: 'polygon(20% 100%, 80% 100%, 85% 50%, 60% 20%, 40% 0%, 15% 50%)'
            }}
          />
          <div 
            className="absolute top-2 left-1 w-1 h-2 bg-gradient-to-t from-yellow-600 to-red-400 rounded-full animate-pulse opacity-70"
            style={{ 
              animationDuration: '0.5s', 
              animationDelay: '0.8s',
              clipPath: 'polygon(30% 100%, 70% 100%, 80% 60%, 50% 0%, 20% 60%)'
            }}
          />
          <div 
            className="absolute bottom-2 right-1 w-1 h-2 bg-gradient-to-t from-orange-700 to-yellow-400 rounded-full animate-pulse opacity-65"
            style={{ 
              animationDuration: '0.4s', 
              animationDelay: '0.4s',
              clipPath: 'polygon(35% 100%, 65% 100%, 75% 50%, 50% 0%, 25% 50%)'
            }}
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
