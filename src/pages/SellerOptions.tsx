import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Store, Users, Check, ArrowRight } from 'lucide-react';
import { BackButton } from '@/components/BackButton';

export default function SellerOptions() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-orange-50/20 to-background">
      <BackButton />
      <div className="container max-w-6xl mx-auto px-3 sm:px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-4">Start Your Business Journey</h1>
          <p className="text-sm sm:text-base md:text-xl text-muted-foreground">Choose the model that works best for you</p>
        </div>

        {/* Options Grid */}
        <div className="grid md:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto">
          {/* Merchant Shop */}
          <Card className="p-6 sm:p-8 hover:shadow-xl transition-shadow border-2 hover:border-primary/50">
            <div className="text-center mb-6">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Store className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold mb-2">Merchant Shop</h2>
              <p className="text-sm sm:text-base text-muted-foreground">Upload and sell your own products</p>
            </div>

            <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
              <div className="flex items-start gap-3">
                <Check className="w-4 h-4 sm:w-5 sm:h-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-xs sm:text-sm">Upload unlimited products</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-4 h-4 sm:w-5 sm:h-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-xs sm:text-sm">Full inventory management</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-4 h-4 sm:w-5 sm:h-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-xs sm:text-sm">Set your own prices & commissions</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-4 h-4 sm:w-5 sm:h-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-xs sm:text-sm">Dedicated storefront website</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-4 h-4 sm:w-5 sm:h-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-xs sm:text-sm">Analytics & sales reports</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-4 h-4 sm:w-5 sm:h-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-xs sm:text-sm">Enable affiliates to promote your products</span>
              </div>
            </div>

            <div className="bg-primary/10 rounded-lg p-4 mb-6">
              <p className="text-xs sm:text-sm font-semibold mb-2">Monthly Fee</p>
              <p className="text-xl sm:text-2xl font-bold text-primary">UGX 50,000</p>
              <p className="text-xs text-muted-foreground mt-1">Requires approval</p>
            </div>

            <Button 
              className="w-full h-11 sm:h-12 text-sm sm:text-base bg-primary hover:bg-primary/90" 
              size="lg"
              onClick={() => navigate('/sell')}
            >
              Apply for Merchant Shop
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Card>

          {/* Affiliate Shop */}
          <Card className="p-6 sm:p-8 hover:shadow-xl transition-shadow border-2 hover:border-primary/50">
            <div className="text-center mb-6">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold mb-2">Affiliate Shop</h2>
              <p className="text-sm sm:text-base text-muted-foreground">Curate & promote existing products</p>
            </div>

            <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
              <div className="flex items-start gap-3">
                <Check className="w-4 h-4 sm:w-5 sm:h-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-xs sm:text-sm">No product inventory needed</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-4 h-4 sm:w-5 sm:h-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-xs sm:text-sm">Choose from merchant products</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-4 h-4 sm:w-5 sm:h-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-xs sm:text-sm">Set your commission rates</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-4 h-4 sm:w-5 sm:h-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-xs sm:text-sm">Standalone storefront for sharing</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-4 h-4 sm:w-5 sm:h-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-xs sm:text-sm">Performance analytics</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-4 h-4 sm:w-5 sm:h-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-xs sm:text-sm">Instant setup - no approval needed</span>
              </div>
            </div>

            <div className="bg-primary/10 rounded-lg p-4 mb-6">
              <p className="text-xs sm:text-sm font-semibold mb-2">Tiers Available</p>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm">Free</span>
                  <span className="text-xs text-muted-foreground">Up to 15 products</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm font-semibold text-primary">Premium</span>
                  <span className="text-xs text-muted-foreground">Unlimited products</span>
                </div>
              </div>
            </div>

            <Button 
              className="w-full bg-primary hover:bg-primary/90 h-11 sm:h-12 text-sm sm:text-base" 
              size="lg"
              onClick={() => navigate('/affiliate/dashboard')}
            >
              Create Affiliate Shop
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Card>
        </div>

        {/* Comparison Note */}
        <div className="text-center mt-8 sm:mt-12 max-w-2xl mx-auto">
          <p className="text-xs sm:text-sm text-muted-foreground px-2">
            <strong className="text-foreground">Not sure which to choose?</strong> Merchant shops are ideal if you have your own products to sell. 
            Affiliate shops are perfect if you want to earn by promoting existing products without managing inventory.
          </p>
        </div>
      </div>
    </div>
  );
}
