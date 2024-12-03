import { Flame, Truck } from "lucide-react";

const Header = () => {
  return (
    <div className="flex items-center justify-between w-full mb-8">
      <div className="flex flex-col items-start">
        <div className="flex items-center gap-2 mb-4">
          <h1 className="text-2xl md:text-3xl font-bold text-accent">Flamia</h1>
          <Flame className="w-6 h-6 text-accent animate-pulse" />
        </div>
        <div className="flex items-center gap-2">
          <Truck className="w-5 h-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Fast & Free Delivery</span>
        </div>
      </div>
      <div className="w-24 h-24 overflow-hidden rounded-lg">
        <img 
          src="/lovable-uploads/4f7a9c0c-59ff-4823-9c17-6517bb9de0f7.png"
          alt="Gas flame"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
};

export default Header;