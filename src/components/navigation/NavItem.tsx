import { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

interface NavItemProps {
  to: string;
  icon: LucideIcon;
  label: string;
  isActive: boolean;
}

export const NavItem = ({ to, icon: Icon, label, isActive }: NavItemProps) => {
  const navItemClass = `
    relative flex flex-col items-center space-y-1 bg-white rounded-full p-2
    ${isActive ? "text-flame-inner font-medium" : "text-muted-foreground"}
    ${isActive ? "after:content-[''] after:absolute after:w-[120%] after:h-[120%] after:rounded-full after:bg-transparent after:-z-10 after:animate-flame" : ""}
    transition-colors duration-200 hover:text-flame-middle
  `;

  return (
    <Link to={to} className={navItemClass}>
      <Icon className="h-5 w-5" />
      <span className="text-xs">{label}</span>
    </Link>
  );
};