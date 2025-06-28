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
      {/* Simple circular ring for active state - no flame animations */}
      {isActive && (
        <div className="absolute inset-0 flex items-center justify-center z-0">
          <div className="w-12 h-12 rounded-full border-2 border-blue-500 animate-pulse"></div>
        </div>
      )}
      
      {/* Icon and Label */}
      <div className="relative z-30 flex flex-col items-center">
        <Icon className="h-5 w-5 mb-1" />
        <span className="text-xs font-medium">{label}</span>
      </div>
    </Link>
  );
};