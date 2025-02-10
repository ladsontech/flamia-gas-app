
import { Flame, Truck } from "lucide-react";

const Header = () => {
  return (
    <div className="flex items-center justify-between w-full mb-4 md:mb-8">
      <div className="flex flex-col items-start">
        <div className="flex items-center gap-2 mb-2 md:mb-4">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-accent">Flamia</h1>
          <Flame className="w-4 h-4 md:w-6 md:h-6 text-accent animate-pulse" />
        </div>
        <div className="flex items-center gap-2">
          <Truck className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
          <span className="text-xs md:text-sm text-muted-foreground">Fast & Free Delivery</span>
        </div>
      </div>
      <div className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 overflow-hidden rounded-lg">
        <img 
          src="/lovable-uploads/4f7a9c0c-59ff-4823-9c17-6517bb9de0f7.png"
          alt="Gas flame"
          className="w-full h-full object-contain"
        />
      </div>
    </div>
  );
};

export default Header;
