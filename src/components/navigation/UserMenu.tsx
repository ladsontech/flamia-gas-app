
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserMenuProps {
  isActive: boolean;
  isAdmin: boolean | null;
}

export const UserMenu = ({ isActive }: UserMenuProps) => {
  const navigate = useNavigate();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="p-2 hover:bg-accent/10 rounded-full transition-colors">
        <MoreVertical className="h-5 w-5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 p-3 bg-white rounded-lg shadow-lg border border-gray-100">
        <DropdownMenuItem onClick={() => navigate('/order')} className="py-2">
          Place Order
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/accessories')} className="py-2">
          Accessories
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
