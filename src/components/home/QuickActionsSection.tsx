
import * as React from 'react';
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
          className="bg-card rounded-lg border border-border p-3 sm:p-4 cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/20 overflow-hidden"
          role="button"
          aria-label="Order Gas Refill"
          onClick={() => navigate('/refill')}
        >
          <img
            src="/images/home_buttons_icons/refill_icon.png"
            alt="Order Gas Refill"
            className="w-full h-20 sm:h-24 object-contain"
            loading="eager"
          />
          <span className="sr-only">Order Gas Refill</span>
        </div>

        <div 
          className="bg-card rounded-lg border border-border p-3 sm:p-4 cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/20 overflow-hidden"
          role="button"
          aria-label="Gas Safety"
          onClick={() => navigate('/gas-safety')}
        >
          <img
            src="/images/home_buttons_icons/safety_icon.png"
            alt="Gas Safety"
            className="w-full h-20 sm:h-24 object-contain"
            loading="eager"
          />
          <span className="sr-only">Gas Safety</span>
        </div>

        <div 
          className="bg-card rounded-lg border border-border p-3 sm:p-4 cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/20 overflow-hidden"
          role="button"
          aria-label="Gas Accessories"
          onClick={() => navigate('/accessories')}
        >
          <img
            src="/images/home_buttons_icons/gas_accessories.png"
            alt="Gas Accessories"
            className="w-full h-20 sm:h-24 object-contain"
            loading="eager"
          />
          <span className="sr-only">Gas Accessories</span>
        </div>
      </div>
    </section>
  );
};

export default QuickActionsSection;
