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
      className={`flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all duration-200 ${
        isActive 
          ? "text-accent bg-accent/10 scale-105" 
          : "text-gray-500 hover:text-accent hover:bg-accent/5"
      }`}
    >
      <Icon className="h-5 w-5 mb-1" />
      <span className="text-xs font-medium">{label}</span>
    </Link>
  );
};