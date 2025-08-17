
import * as React from 'react';
import { RotateCw, Flame } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const QuickActionsSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="space-y-4">
      <h2 className="text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold px-1">
        Quick Actions
      </h2>
      
      <div className="grid grid-cols-2 gap-4">
        <div 
          className="bg-card rounded-lg border border-border p-6 cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          onClick={() => navigate('/refill')}
        >
          <div className="flex flex-col items-center space-y-3 text-center">
            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
              <RotateCw className="w-6 h-6 text-accent" />
            </div>
            <span className="text-sm font-medium text-foreground">Gas Refill</span>
          </div>
        </div>

        <div 
          className="bg-card rounded-lg border border-border p-6 cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          onClick={() => navigate('/gas-safety')}
        >
          <div className="flex flex-col items-center space-y-3 text-center">
            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
              <Flame className="w-6 h-6 text-accent" />
            </div>
            <span className="text-sm font-medium text-foreground">Gas Safety</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default QuickActionsSection;
