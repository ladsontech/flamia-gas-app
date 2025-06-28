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
      {/* Flame Ring Effects - Behind the content */}
      {isActive && (
        <>
          {/* Main circular ring - positioned behind content */}
          <div className="absolute inset-0 flex items-center justify-center z-0">
            <div className="w-12 h-12 rounded-full border-2 border-blue-500 animate-pulse"></div>
          </div>
          
          {/* Flame particles spreading outward from the ring */}
          <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none">
            {/* Top flame particle */}
            <div className="absolute -top-6 w-3 h-6 bg-gradient-to-t from-orange-500 to-red-500 rounded-full opacity-70 animate-pulse"></div>
            
            {/* Top-right flame particle */}
            <div className="absolute -top-5 -right-5 w-3 h-5 bg-gradient-to-tr from-orange-500 to-red-500 rounded-full opacity-60 animate-pulse" style={{ animationDelay: '0.1s' }}></div>
            
            {/* Right flame particle */}
            <div className="absolute -right-6 w-6 h-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-full opacity-70 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            
            {/* Bottom-right flame particle */}
            <div className="absolute -bottom-5 -right-5 w-3 h-5 bg-gradient-to-br from-orange-500 to-red-500 rounded-full opacity-60 animate-pulse" style={{ animationDelay: '0.3s' }}></div>
            
            {/* Bottom flame particle */}
            <div className="absolute -bottom-6 w-3 h-6 bg-gradient-to-b from-orange-500 to-red-500 rounded-full opacity-70 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            
            {/* Bottom-left flame particle */}
            <div className="absolute -bottom-5 -left-5 w-3 h-5 bg-gradient-to-bl from-orange-500 to-red-500 rounded-full opacity-60 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            
            {/* Left flame particle */}
            <div className="absolute -left-6 w-6 h-3 bg-gradient-to-l from-orange-500 to-red-500 rounded-full opacity-70 animate-pulse" style={{ animationDelay: '0.6s' }}></div>
            
            {/* Top-left flame particle */}
            <div className="absolute -top-5 -left-5 w-3 h-5 bg-gradient-to-tl from-orange-500 to-red-500 rounded-full opacity-60 animate-pulse" style={{ animationDelay: '0.7s' }}></div>
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