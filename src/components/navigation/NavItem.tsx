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
      className={`relative flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all duration-300 ${
        isActive 
          ? "text-accent scale-105" 
          : "text-gray-500 hover:text-accent hover:bg-accent/5"
      }`}
    >
      {/* Blue Flame Ring for Active State */}
      {isActive && (
        <div className="absolute inset-0 rounded-xl animate-pulse">
          {/* Outer blue flame ring */}
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 opacity-30 blur-sm"></div>
          {/* Inner blue flame ring */}
          <div className="absolute inset-[2px] rounded-xl bg-gradient-to-r from-blue-300 via-blue-400 to-blue-500 opacity-40"></div>
          {/* Core flame effect */}
          <div className="absolute inset-[3px] rounded-xl bg-gradient-to-r from-blue-200 via-blue-300 to-blue-400 opacity-20"></div>
        </div>
      )}
      
      {/* Icon and Label */}
      <div className="relative z-10 flex flex-col items-center">
        <Icon className="h-5 w-5 mb-1" />
        <span className="text-xs font-medium">{label}</span>
      </div>
    </Link>
  );
};