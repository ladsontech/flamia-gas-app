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
      {/* Flame ring effect for active state - encircling around the icon */}
      {isActive && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-0">
          {/* Outer flame ring - largest */}
          <div className="w-16 h-16 rounded-full border-2 border-orange-500 animate-pulse opacity-80"></div>
          
          {/* Middle flame ring */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full border-2 border-red-500 animate-pulse" style={{ animationDelay: '0.3s' }}></div>
          
          {/* Inner flame ring */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full border-2 border-yellow-500 animate-pulse" style={{ animationDelay: '0.6s' }}></div>
          
          {/* Flame glow effect around the rings */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-gradient-to-r from-orange-400 via-red-400 to-yellow-400 opacity-20 blur-sm animate-pulse"></div>
        </div>
      )}
      
      {/* Icon and Label - Elevated above the flame rings */}
      <div className="relative z-30 flex flex-col items-center">
        <Icon className={`mb-1 transition-all duration-300 ${
          isActive ? "h-7 w-7 drop-shadow-lg" : "h-5 w-5"
        }`} />
        <span className={`text-xs font-medium ${isActive ? 'drop-shadow-sm' : ''}`}>{label}</span>
      </div>
    </Link>
  );
};