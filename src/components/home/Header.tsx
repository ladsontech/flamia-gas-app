import { Flame, Truck } from "lucide-react";

const HomeHeader = () => {
  return (
    <div className="flex items-center justify-between w-full mb-2 md:mb-4">
      <div className="flex flex-col items-start">
        <div className="flex items-center gap-2 mb-1 md:mb-2">
          <h1 className="text-lg md:text-xl lg:text-2xl font-bold text-accent">Flamia</h1>
          <Flame className="w-3 h-3 md:w-4 md:h-4 text-accent animate-pulse" />
        </div>
        <div className="flex items-center gap-1">
          <Truck className="w-3 h-3 md:w-4 md:h-4 text-muted-foreground" />
          <span className="text-xs md:text-sm text-muted-foreground">Fast & Free Delivery</span>
        </div>
      </div>
      <div className="w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 overflow-hidden rounded-lg">
        <img 
          src="/lovable-uploads/4f7a9c0c-59ff-4823-9c17-6517bb9de0f7.png"
          alt="Gas flame"
          className="w-full h-full object-contain"
        />
      </div>
    </div>
  );
};

export default HomeHeader;