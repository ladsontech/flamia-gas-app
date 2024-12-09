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
    relative flex flex-col items-center justify-center w-12 h-12
    ${isActive ? "text-flame-inner font-medium" : "text-muted-foreground"}
    ${isActive ? "after:content-[''] after:absolute after:w-[140%] after:h-[140%] after:rounded-full after:bg-transparent after:-z-10 after:animate-flame" : ""}
    transition-colors duration-200 hover:text-flame-middle group
  `;

  return (
    <Link to={to} className={navItemClass}>
      <Icon className="h-4 w-4 mb-0.5" />
      <span className="text-[10px] leading-none">{label}</span>
    </Link>
  );
};