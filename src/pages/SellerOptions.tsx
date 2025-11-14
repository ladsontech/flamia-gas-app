import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Store, Users, Check, ArrowRight } from 'lucide-react';
import { BackButton } from '@/components/BackButton';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

export default function SellerOptions() {
  const navigate = useNavigate();
  const [selection, setSelection] = useState<'merchant' | 'affiliate' | ''>('');

  const handleMerchantSelect = () => {
    setSelection('merchant');
    navigate('/sell');
  };

  const handleAffiliateSelect = () => {
    setSelection('affiliate');
    navigate('/affiliate/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-orange-50/20 to-background">
      <BackButton />
      <div className="container max-w-6xl mx-auto px-3 sm:px-4 py-3 sm:py-8">
        {/* Header */}
        <div className="text-center mb-4 sm:mb-8">
          <h1 className="text-xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-3">Start Your Business Journey</h1>
          <p className="text-xs sm:text-base md:text-xl text-muted-foreground">Choose the model that works best for you</p>
        </div>

        {/* Segmented toggle */}
        <div className="flex justify-center mb-4 sm:mb-6">
          <div className="inline-flex items-center rounded-lg border bg-background shadow-sm overflow-hidden">
            <Button
              variant={selection === 'merchant' ? 'default' : 'ghost'}
              size="sm"
              className={`rounded-none px-4 sm:px-6 text-xs sm:text-sm ${selection === 'merchant' ? '' : 'text-foreground'}`}
              aria-pressed={selection === 'merchant'}
              onClick={() => setSelection('merchant')}
            >
              Merchant
            </Button>
            <div className="h-6 w-px bg-border" />
            <Button
              variant={selection === 'affiliate' ? 'default' : 'ghost'}
              size="sm"
              className={`rounded-none px-4 sm:px-6 text-xs sm:text-sm ${selection === 'affiliate' ? '' : 'text-foreground'}`}
              aria-pressed={selection === 'affiliate'}
              onClick={() => setSelection('affiliate')}
            >
              Affiliate
            </Button>
          </div>
        </div>

        {/* Single-choice selection */}
        <Card className="p-3 sm:p-6 max-w-4xl mx-auto">
          <RadioGroup
            value={selection}
            onValueChange={(v) => setSelection((v as 'merchant' | 'affiliate'))}
            className="space-y-3 sm:space-y-4"
          >
            {/* Merchant option */}
            <div
              className={`rounded-lg border p-3 sm:p-4 transition-shadow cursor-pointer ${selection === 'merchant' ? 'border-primary shadow-md' : 'hover:shadow-sm'}`}
              onClick={() => setSelection('merchant')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelection('merchant'); }}
            >
              <div className="flex items-start gap-3">
                <RadioGroupItem id="merchant" value="merchant" className="mt-1 h-5 w-5" />
                <div className="flex-1">
                  <Label htmlFor="merchant" className="flex items-center gap-2 text-sm sm:text-base font-semibold">
                    <span className="inline-flex w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-xl items-center justify-center">
                      <Store className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    </span>
                    Merchant Shop
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">Upload and sell your own products</p>

                  <ul className="list-disc list-inside space-y-1 mt-3 text-xs sm:text-sm text-foreground/90">
                    <li>Upload unlimited products</li>
                    <li>Full inventory management</li>
                    <li>Set your own prices & commissions</li>
                    <li>Dedicated storefront website</li>
                    <li>Analytics & sales reports</li>
                    <li>Enable affiliates to promote your products</li>
                  </ul>

                  <div className="bg-primary/10 rounded-lg p-2 sm:p-3 mt-3">
                    <p className="text-xs font-semibold mb-1">Monthly Fee</p>
                    <p className="text-base sm:text-lg font-bold text-primary">UGX 50,000</p>
                    <p className="text-xs text-muted-foreground">Requires approval</p>
                  </div>

                  <div className="mt-2">
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="text-xs h-8 w-full sm:w-auto" 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        handleMerchantSelect(); 
                      }}
                    >
                      Select Merchant
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Affiliate option */}
            <div
              className={`rounded-lg border p-3 sm:p-4 transition-shadow cursor-pointer ${selection === 'affiliate' ? 'border-primary shadow-md' : 'hover:shadow-sm'}`}
              onClick={() => setSelection('affiliate')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelection('affiliate'); }}
            >
              <div className="flex items-start gap-3">
                <RadioGroupItem id="affiliate" value="affiliate" className="mt-1 h-5 w-5" />
                <div className="flex-1">
                  <Label htmlFor="affiliate" className="flex items-center gap-2 text-sm sm:text-base font-semibold">
                    <span className="inline-flex w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-xl items-center justify-center">
                      <Users className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    </span>
                    Affiliate Shop
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">Curate & promote existing products</p>

                  <ul className="list-disc list-inside space-y-1 mt-3 text-xs sm:text-sm text-foreground/90">
                    <li>No product inventory needed</li>
                    <li>Choose from merchant products</li>
                    <li>Set your commission rates</li>
                    <li>Standalone storefront for sharing</li>
                    <li>Performance analytics</li>
                    <li>Instant setup - no approval needed</li>
                  </ul>

                  <div className="bg-primary/10 rounded-lg p-2 sm:p-3 mt-3">
                    <p className="text-xs font-semibold mb-1">Tiers Available</p>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between items-center">
                        <span>Free</span>
                        <span className="text-muted-foreground">Up to 15 products</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-primary">Premium</span>
                        <span className="text-muted-foreground">Unlimited products</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-2">
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="text-xs h-8 w-full sm:w-auto" 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        handleAffiliateSelect(); 
                      }}
                    >
                      Select Affiliate
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </RadioGroup>
        </Card>

        {/* Comparison Note */}
        <div className="text-center mt-4 sm:mt-8 max-w-2xl mx-auto px-2 pb-6">
          <p className="text-xs sm:text-sm text-muted-foreground">
            <strong className="text-foreground">Not sure which to choose?</strong> Merchant shops are ideal if you have your own products to sell. 
            Affiliate shops are perfect if you want to earn by promoting existing products without managing inventory.
          </p>
        </div>
      </div>
    </div>
  );
}
