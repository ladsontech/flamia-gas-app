
import * as React from 'react';
import { RotateCw, Flame, Wrench } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const QuickActionsSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="space-y-4">
      <h2 className="text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold px-1">
        Quick Actions
      </h2>
      
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <div 
          className="bg-accent text-white rounded-lg border border-accent p-4 sm:p-6 cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/40"
          role="button"
          aria-label="Order Gas Refill"
          onClick={() => navigate('/refill')}
        >
          <div className="flex flex-col items-center space-y-3 text-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 flex items-center justify-center">
              <RotateCw className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <span className="text-sm sm:text-base font-semibold">Order Gas Refill</span>
          </div>
        </div>

        <div 
          className="bg-gradient-to-b from-accent/10 to-transparent rounded-lg border border-accent/30 p-4 sm:p-6 cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/20"
          role="button"
          aria-label="Gas Safety"
          onClick={() => navigate('/gas-safety')}
        >
          <div className="flex flex-col items-center space-y-3 text-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-accent/15 flex items-center justify-center">
              <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
            </div>
            <span className="text-xs sm:text-sm font-semibold text-foreground">Gas Safety</span>
          </div>
        </div>

        <div 
          className="bg-gradient-to-b from-accent/10 to-transparent rounded-lg border border-accent/30 p-4 sm:p-6 cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/20"
          role="button"
          aria-label="Gas Accessories"
          onClick={() => navigate('/accessories')}
        >
          <div className="flex flex-col items-center space-y-3 text-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-accent/15 flex items-center justify-center">
              <Wrench className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
            </div>
            <span className="text-xs sm:text-sm font-semibold text-foreground">Gas Accessories</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default QuickActionsSection;
