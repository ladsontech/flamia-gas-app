import { LionFlameLogo } from "./LionFlameLogo";

interface FlamiaLoaderProps {
  message?: string;
}

export const FlamiaLoader = ({ message = "Loading orders..." }: FlamiaLoaderProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6 animate-fade-in">
      {/* Animated Logo Container */}
      <div className="relative">
        {/* Pulse Ring */}
        <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
        <div className="absolute inset-0 rounded-full bg-primary/10 animate-pulse" />
        
        {/* Logo */}
        <div className="relative z-10 w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border-2 border-primary/30 shadow-lg animate-scale-in">
          <img 
            src="/images/icon.png" 
            alt="Flamia" 
            className="w-20 h-20 rounded-full animate-pulse"
          />
        </div>
      </div>

      {/* Loading Text */}
      <div className="space-y-2 text-center">
        <h3 className="text-lg font-semibold text-foreground animate-fade-in">
          {message}
        </h3>
        <p className="text-sm text-muted-foreground animate-fade-in">
          Please wait a moment
        </p>
      </div>

      {/* Loading Dots */}
      <div className="flex gap-2">
        <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
        <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
        <div className="w-2 h-2 rounded-full bg-primary animate-bounce" />
      </div>
    </div>
  );
};
