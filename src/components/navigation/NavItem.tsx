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
      {/* Flame ring effect for active state */}
      {isActive && (
        <div className="absolute inset-0 flex items-center justify-center z-0">
          {/* Main flame ring with gradient */}
          <div className="w-14 h-14 rounded-full relative">
            {/* Outer flame ring */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500 animate-pulse opacity-80"></div>
            
            {/* Inner flame ring */}
            <div className="absolute inset-1 rounded-full bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            
            {/* Core ring */}
            <div className="absolute inset-2 rounded-full bg-gradient-to-r from-yellow-300 via-orange-300 to-yellow-300 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            
            {/* Flame particles around the ring */}
            <div className="absolute inset-0 rounded-full">
              {/* Top flame particle */}
              <div className="absolute -top-1 left-1/2 w-1.5 h-1.5 bg-orange-400 rounded-full animate-ping" style={{ animationDelay: '0s', transform: 'translateX(-50%)' }}></div>
              
              {/* Top-right flame particle */}
              <div className="absolute top-1 right-1 w-1 h-1 bg-red-400 rounded-full animate-ping" style={{ animationDelay: '0.3s' }}></div>
              
              {/* Right flame particle */}
              <div className="absolute top-1/2 -right-1 w-1.5 h-1.5 bg-yellow-400 rounded-full animate-ping" style={{ animationDelay: '0.6s', transform: 'translateY(-50%)' }}></div>
              
              {/* Bottom-right flame particle */}
              <div className="absolute bottom-1 right-1 w-1 h-1 bg-orange-500 rounded-full animate-ping" style={{ animationDelay: '0.9s' }}></div>
              
              {/* Bottom flame particle */}
              <div className="absolute -bottom-1 left-1/2 w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" style={{ animationDelay: '1.2s', transform: 'translateX(-50%)' }}></div>
              
              {/* Bottom-left flame particle */}
              <div className="absolute bottom-1 left-1 w-1 h-1 bg-yellow-500 rounded-full animate-ping" style={{ animationDelay: '1.5s' }}></div>
              
              {/* Left flame particle */}
              <div className="absolute top-1/2 -left-1 w-1.5 h-1.5 bg-orange-400 rounded-full animate-ping" style={{ animationDelay: '1.8s', transform: 'translateY(-50%)' }}></div>
              
              {/* Top-left flame particle */}
              <div className="absolute top-1 left-1 w-1 h-1 bg-red-400 rounded-full animate-ping" style={{ animationDelay: '2.1s' }}></div>
            </div>
            
            {/* Inner glow effect */}
            <div className="absolute inset-3 rounded-full bg-gradient-to-r from-yellow-200 to-orange-200 opacity-60 animate-pulse" style={{ animationDelay: '0.6s' }}></div>
          </div>
        </div>
      )}
      
      {/* Icon and Label - Made icon bigger and elevated */}
      <div className="relative z-30 flex flex-col items-center">
        <Icon className={`mb-1 transition-all duration-300 ${
          isActive ? "h-7 w-7 drop-shadow-lg" : "h-5 w-5"
        }`} />
        <span className={`text-xs font-medium ${isActive ? 'drop-shadow-sm' : ''}`}>{label}</span>
      </div>
    </Link>
  );
};