
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
      {/* Orange ring indicator only */}
      {isActive && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-0">
          <div
            className="rounded-full"
            style={{
              width: '58px',
              height: '58px',
              border: '2px solid #FF6B00',
              background: 'transparent',
              boxShadow: '0 0 10px rgba(255, 107, 0, 0.35), 0 0 18px rgba(255, 140, 66, 0.25)'
            }}
          />
        </div>
      )}
      
      {/* Icon and Label - Elevated above the flame ring */}
      <div className="relative z-10 flex flex-col items-center">
        <Icon className={`mb-1 transition-all duration-300 ${
          isActive ? "h-6 w-6 drop-shadow-lg" : "h-5 w-5"
        }`} />
        <span className={`font-medium ${isActive ? 'drop-shadow-sm font-semibold text-[10px]' : 'text-[10px]'}`}>{label}</span>
      </div>
    </Link>
  );
};
