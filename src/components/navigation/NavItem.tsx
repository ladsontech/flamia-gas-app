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
          ? "text-white" 
          : "text-gray-500 hover:text-accent hover:bg-accent/5"
      }`}
    >
      {/* Larger Circular Ring with Flame Effects for Active State */}
      {isActive && (
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Main circular ring - larger to fit content */}
          <div className="w-14 h-14 rounded-full border-2 border-blue-500 animate-pulse bg-gradient-to-r from-blue-500/20 to-orange-500/20"></div>
          
          {/* Flame effect spreading out */}
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Inner flame glow */}
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-400/30 via-orange-400/30 to-red-400/30 animate-pulse blur-sm"></div>
          </div>
          
          {/* Outer flame spread */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-18 h-18 rounded-full bg-gradient-to-r from-blue-300/20 via-orange-300/20 to-red-300/20 animate-ping"></div>
          </div>
          
          {/* Additional flame particles */}
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Top flame */}
            <div className="absolute -top-1 w-2 h-3 bg-gradient-to-t from-orange-500 to-red-500 rounded-full opacity-70 animate-bounce"></div>
            {/* Right flame */}
            <div className="absolute -right-1 w-3 h-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-full opacity-70 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            {/* Bottom flame */}
            <div className="absolute -bottom-1 w-2 h-3 bg-gradient-to-b from-orange-500 to-red-500 rounded-full opacity-70 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            {/* Left flame */}
            <div className="absolute -left-1 w-3 h-2 bg-gradient-to-l from-orange-500 to-red-500 rounded-full opacity-70 animate-bounce" style={{ animationDelay: '0.6s' }}></div>
          </div>
        </div>
      )}
      
      {/* Icon and Label - with higher z-index to stay on top */}
      <div className="relative z-20 flex flex-col items-center">
        <Icon className="h-5 w-5 mb-1" />
        <span className="text-xs font-medium">{label}</span>
      </div>
    </Link>
  );
};