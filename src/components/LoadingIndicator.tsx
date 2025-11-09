import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';

interface LoadingIndicatorProps {
  fullScreen?: boolean;
  message?: string;
}

export const LoadingIndicator = ({ fullScreen = false, message }: LoadingIndicatorProps) => {
  const content = (
    <div className="flex flex-col items-center justify-center gap-4">
      {/* Animated Flame Icon */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 5, -5, 0],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="relative"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full blur-xl opacity-50 animate-pulse"></div>
        <Flame className="w-12 h-12 text-orange-500 relative z-10" fill="currentColor" />
      </motion.div>

      {/* Loading Dots */}
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -10, 0],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.15,
              ease: "easeInOut",
            }}
            className="w-2 h-2 bg-orange-500 rounded-full"
          />
        ))}
      </div>

      {/* Optional Message */}
      {message && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-sm text-muted-foreground font-medium"
        >
          {message}
        </motion.p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-white/95 backdrop-blur-sm flex items-center justify-center z-50"
      >
        {content}
      </motion.div>
    );
  }

  return content;
};

// Inline loading spinner for buttons and small spaces
export const LoadingSpinner = ({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg'; className?: string }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className={`${sizeClasses[size]} ${className}`}
    >
      <Flame className="w-full h-full text-orange-500" fill="currentColor" />
    </motion.div>
  );
};

