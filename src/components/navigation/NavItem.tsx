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
          ? "text-blue-600" 
          : "text-gray-500 hover:text-blue-600 hover:bg-blue-50"
      }`}
    >
      {/* Blue flame effect for active state */}
      {isActive && (
        <div className="absolute inset-0 flex items-center justify-center z-0">
          {/* Main blue flame shape */}
          <div className="relative w-12 h-16">
            {/* Core flame */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-12 bg-gradient-to-t from-blue-600 via-blue-400 to-blue-200 rounded-full opacity-80 animate-pulse"></div>
            
            {/* Inner flame */}
            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-6 h-10 bg-gradient-to-t from-blue-500 via-blue-300 to-blue-100 rounded-full opacity-90 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            
            {/* Flame tip */}
            <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-3 h-6 bg-gradient-to-t from-blue-400 to-blue-100 rounded-full opacity-70 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            
            {/* Flickering particles */}
            <div className="absolute top-0 left-1/2 w-1 h-1 bg-blue-300 rounded-full animate-ping" style={{ animationDelay: '0s' }}></div>
            <div className="absolute top-2 left-1/3 w-0.5 h-0.5 bg-blue-400 rounded-full animate-ping" style={{ animationDelay: '0.3s' }}></div>
            <div className="absolute top-1 right-1/3 w-0.5 h-0.5 bg-blue-200 rounded-full animate-ping" style={{ animationDelay: '0.6s' }}></div>
            <div className="absolute top-3 left-2/3 w-1 h-1 bg-blue-500 rounded-full animate-ping" style={{ animationDelay: '0.9s' }}></div>
          </div>
        </div>
      )}
      
      {/* Icon and Label */}
      <div className="relative z-30 flex flex-col items-center">
        <Icon className={`mb-1 transition-all duration-300 ${
          isActive ? "h-6 w-6" : "h-5 w-5"
        }`} />
        <span className="text-xs font-medium">{label}</span>
      </div>
    </Link>
  );
};