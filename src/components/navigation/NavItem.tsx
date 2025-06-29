
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
      {/* Thin flame ring around the icon */}
      {isActive && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-0">
          {/* Thin flame ring */}
          <div 
            className="w-10 h-10 rounded-full animate-pulse"
            style={{
              background: `conic-gradient(
                from 0deg,
                #ff7f00,
                #4a90e2,
                #ff8c42,
                #5ba3f5,
                #ff7f00,
                #3d7bd9,
                #ff7f00
              )`,
              animationDuration: '3s',
              padding: '2px'
            }}
          >
            {/* Inner transparent circle to create thin ring effect */}
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
