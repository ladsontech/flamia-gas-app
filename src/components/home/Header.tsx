import { Flame, Truck } from "lucide-react";
import { UserMenu } from "../navigation/UserMenu";

const HomeHeader = () => {
  return (
    <div className="flex items-center justify-between w-full mb-2 md:mb-4">
      <div className="flex flex-col items-start">
        <div className="flex items-center gap-2 mb-1 md:mb-2">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-accent">Flamia</h1>
          <Flame className="w-4 h-4 md:w-6 md:h-6 lg:w-8 lg:h-8 text-accent animate-pulse" />
        </div>
        <div className="flex items-center gap-1">
          <Truck className="w-3 h-3 md:w-4 md:h-4 text-muted-foreground" />
          <span className="text-xs md:text-sm text-muted-foreground">Fast & Free Delivery</span>
        </div>
      </div>
      
      <div className="relative z-10">
        <UserMenu isActive={false} isAdmin={null} />
      </div>
    </div>
  );
};

export default HomeHeader;