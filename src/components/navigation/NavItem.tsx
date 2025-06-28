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
      {/* Flame Ring Effects - Behind the content */}
      {isActive && (
        <>
          {/* Main circular ring - positioned behind content */}
          <div className="absolute inset-0 flex items-center justify-center z-0">
            <div className="w-14 h-14 rounded-full border-2 border-blue-500 animate-pulse bg-gradient-to-r from-blue-500/20 to-orange-500/20"></div>
          </div>
          
          {/* Inner flame glow - behind content */}
          <div className="absolute inset-0 flex items-center justify-center z-0">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-400/30 via-orange-400/30 to-red-400/30 animate-pulse blur-sm"></div>
          </div>
          
          {/* Outer flame spread - behind content */}
          <div className="absolute inset-0 flex items-center justify-center z-0">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-300/20 via-orange-300/20 to-red-300/20 animate-ping"></div>
          </div>
          
          {/* Flame particles spreading outward from the ring - positioned outside the ring */}
          <div className="absolute inset-0 flex items-center justify-center z-0">
            {/* Top flame particle - positioned outside the ring */}
            <div className="absolute -top-4 w-2 h-4 bg-gradient-to-t from-orange-500 to-red-500 rounded-full opacity-70 animate-bounce"></div>
            
            {/* Top-right flame particle */}
            <div className="absolute -top-3 -right-3 w-2 h-3 bg-gradient-to-tr from-orange-500 to-red-500 rounded-full opacity-60 animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            
            {/* Right flame particle - positioned outside the ring */}
            <div className="absolute -right-4 w-4 h-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-full opacity-70 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            
            {/* Bottom-right flame particle */}
            <div className="absolute -bottom-3 -right-3 w-2 h-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-full opacity-60 animate-bounce" style={{ animationDelay: '0.3s' }}></div>
            
            {/* Bottom flame particle - positioned outside the ring */}
            <div className="absolute -bottom-4 w-2 h-4 bg-gradient-to-b from-orange-500 to-red-500 rounded-full opacity-70 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            
            {/* Bottom-left flame particle */}
            <div className="absolute -bottom-3 -left-3 w-2 h-3 bg-gradient-to-bl from-orange-500 to-red-500 rounded-full opacity-60 animate-bounce" style={{ animationDelay: '0.5s' }}></div>
            
            {/* Left flame particle - positioned outside the ring */}
            <div className="absolute -left-4 w-4 h-2 bg-gradient-to-l from-orange-500 to-red-500 rounded-full opacity-70 animate-bounce" style={{ animationDelay: '0.6s' }}></div>
            
            {/* Top-left flame particle */}
            <div className="absolute -top-3 -left-3 w-2 h-3 bg-gradient-to-tl from-orange-500 to-red-500 rounded-full opacity-60 animate-bounce" style={{ animationDelay: '0.7s' }}></div>
          </div>
        </>
      )}
      
      {/* Icon and Label - High z-index to stay on top of flame effects */}
      <div className="relative z-30 flex flex-col items-center">
        <Icon className="h-5 w-5 mb-1" />
        <span className="text-xs font-medium">{label}</span>
      </div>
    </Link>
  );
};