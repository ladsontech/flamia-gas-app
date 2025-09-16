
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
      {/* Orange ring with smooth blue flame transition */}
      {isActive && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-0">
          {/* Outer blue flame ring with smooth transition */}
          <div 
            className="rounded-full opacity-70 animate-pulse"
            style={{
              width: '68px',
              height: '68px',
              background: `conic-gradient(
                from 0deg,
                rgba(0, 127, 255, 0.8) 0%,
                rgba(255, 107, 0, 0.6) 25%,
                rgba(65, 105, 225, 0.8) 50%,
                rgba(255, 107, 0, 0.6) 75%,
                rgba(0, 127, 255, 0.8) 100%
              )`,
              borderRadius: '50%',
              padding: '6px',
              animationDuration: '3s'
            }}
          >
            {/* Inner container for orange ring */}
            <div 
              className="w-full h-full rounded-full"
              style={{
                background: `radial-gradient(circle, 
                  transparent 80%,
                  rgba(255, 255, 255, 0.9) 82%,
                  rgba(255, 255, 255, 0.95) 100%
                )`
              }}
            >
              {/* Main orange ring */}
              <div 
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full opacity-95"
                style={{
                  border: '2px solid #FF6B00',
                  background: 'transparent',
                  boxShadow: '0 0 8px rgba(255, 107, 0, 0.4)'
                }}
              />
            </div>
          </div>
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
