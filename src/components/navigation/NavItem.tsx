
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
      {/* Simple flame ring around the icon */}
      {isActive && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-0">
          {/* Outer flame ring */}
          <div 
            className="w-12 h-12 rounded-full animate-pulse"
            style={{
              background: `conic-gradient(
                from 0deg,
                #ff4500,
                #ff6b00,
                #ffaa00,
                #ff8c00,
                #ff4500,
                #dc2626,
                #ff4500
              )`,
              animationDuration: '2s'
            }}
          />
          
          {/* Inner transparent circle to create ring effect */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white" />
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
