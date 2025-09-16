
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
      {/* Orange ring with blue flame effect */}
      {isActive && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-0">
          {/* Outer blue flame glow */}
          <div 
            className="w-16 h-16 rounded-full opacity-40 animate-pulse"
            style={{
              background: `radial-gradient(circle, 
                rgba(65, 105, 225, 0.3) 0%,
                rgba(0, 127, 255, 0.2) 30%, 
                rgba(65, 105, 225, 0.15) 60%,
                transparent 100%
              )`,
              animationDuration: '2s'
            }}
          />
          
          {/* Main orange ring */}
          <div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full border-2 opacity-90"
            style={{
              borderColor: '#FF6B00',
              background: 'transparent'
            }}
          />
          
          {/* Inner blue flame effect */}
          <div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full opacity-60 animate-pulse"
            style={{
              background: `conic-gradient(
                from 0deg,
                rgba(0, 127, 255, 0.4),
                rgba(65, 105, 225, 0.4),
                rgba(30, 144, 255, 0.4),
                rgba(65, 105, 225, 0.4),
                rgba(0, 127, 255, 0.4)
              )`,
              animationDuration: '3s'
            }}
          />
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
