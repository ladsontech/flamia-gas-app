
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
        <Card className="cursor-pointer hover:shadow-md transition-shadow border border-gray-200">
          <CardContent className="p-4 text-center">
            <Button 
              className="w-full h-auto flex-col space-y-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-none"
              onClick={() => navigate('/refill')}
            >
              <RotateCw className="w-8 h-8 text-gray-600" />
              <span className="text-sm font-medium">Gas Refill</span>
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow border border-gray-200">
          <CardContent className="p-4 text-center">
            <Button 
              className="w-full h-auto flex-col space-y-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-none"
              onClick={() => navigate('/gas-safety')}
            >
              <Flame className="w-8 h-8 text-gray-600" />
              <span className="text-sm font-medium">Gas Safety</span>
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default QuickActionsSection;
