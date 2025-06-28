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
      {/* Flame effect ring for active state */}
      {isActive && (
        <div className="absolute inset-0 flex items-center justify-center z-0">
          {/* Main flame ring */}
          <div className="w-14 h-14 rounded-full border-2 border-orange-400 animate-pulse"></div>
          
          {/* Subtle flame effect - close to circumference */}
          <div className="absolute w-16 h-16 rounded-full">
            {/* Small flame particles around the ring */}
            <div className="absolute top-1 left-1/2 w-1 h-1 bg-orange-400 rounded-full animate-ping" style={{ animationDelay: '0s' }}></div>
            <div className="absolute top-2 right-2 w-0.5 h-0.5 bg-red-400 rounded-full animate-ping" style={{ animationDelay: '0.3s' }}></div>
            <div className="absolute bottom-2 left-2 w-0.5 h-0.5 bg-yellow-400 rounded-full animate-ping" style={{ animationDelay: '0.6s' }}></div>
            <div className="absolute bottom-1 right-1/2 w-1 h-1 bg-orange-500 rounded-full animate-ping" style={{ animationDelay: '0.9s' }}></div>
            <div className="absolute left-1 top-1/2 w-0.5 h-0.5 bg-red-500 rounded-full animate-ping" style={{ animationDelay: '1.2s' }}></div>
            <div className="absolute right-1 top-1/2 w-0.5 h-0.5 bg-yellow-500 rounded-full animate-ping" style={{ animationDelay: '1.5s' }}></div>
          </div>
        </div>
      )}
      
      {/* Icon and Label - Made icon bigger */}
      <div className="relative z-30 flex flex-col items-center">
        <Icon className={`mb-1 transition-all duration-300 ${
          isActive ? "h-7 w-7" : "h-5 w-5"
        }`} />
        <span className="text-xs font-medium">{label}</span>
      </div>
    </Link>
  );
};