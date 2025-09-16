
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
      {/* Orange ring with blue flame ring effect */}
      {isActive && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-0">
          {/* Outer blue flame ring - surrounding the orange ring */}
          <div 
            className="rounded-full opacity-60 animate-pulse"
            style={{
              width: '72px',
              height: '72px',
              border: '3px solid transparent',
              borderImage: `conic-gradient(
                from 0deg,
                rgba(0, 127, 255, 0.8),
                rgba(65, 105, 225, 0.6),
                rgba(30, 144, 255, 0.8),
                rgba(65, 105, 225, 0.6),
                rgba(0, 127, 255, 0.8)
              ) 1`,
              animationDuration: '2.5s'
            }}
          />
          
          {/* Main orange ring */}
          <div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full opacity-90"
            style={{
              border: '1.5px solid #FF6B00',
              background: 'transparent'
            }}
          />
          
          {/* Inner glow to simulate heat */}
          <div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full opacity-30 animate-pulse"
            style={{
              background: `radial-gradient(circle, 
                rgba(255, 107, 0, 0.3) 0%,
                rgba(255, 140, 66, 0.2) 50%,
                transparent 70%
              )`,
              animationDuration: '1.8s'
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
