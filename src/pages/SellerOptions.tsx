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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-orange-50/20 to-background">
      <BackButton />
      <div className="container max-w-6xl mx-auto px-3 sm:px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-4">Start Your Business Journey</h1>
          <p className="text-sm sm:text-base md:text-xl text-muted-foreground">Choose the model that works best for you</p>
        </div>

        {/* Segmented toggle */}
        <div className="flex justify-center mb-6 sm:mb-8">
          <div className="inline-flex items-center rounded-lg border bg-background shadow-sm overflow-hidden">
            <Button
              variant={selection === 'merchant' ? 'default' : 'ghost'}
              size="sm"
              className={`rounded-none px-4 sm:px-6 ${selection === 'merchant' ? '' : 'text-foreground'}`}
              aria-pressed={selection === 'merchant'}
              onClick={() => setSelection('merchant')}
            >
              Merchant
            </Button>
            <div className="h-6 w-px bg-border" />
            <Button
              variant={selection === 'affiliate' ? 'default' : 'ghost'}
              size="sm"
              className={`rounded-none px-4 sm:px-6 ${selection === 'affiliate' ? '' : 'text-foreground'}`}
              aria-pressed={selection === 'affiliate'}
              onClick={() => setSelection('affiliate')}
            >
              Affiliate
            </Button>
          </div>
        </div>

        {/* Single-choice selection */}
        <Card className="p-5 sm:p-8 max-w-4xl mx-auto">
          <RadioGroup
            value={selection}
            onValueChange={(v) => setSelection((v as 'merchant' | 'affiliate'))}
            className="space-y-5"
          >
            {/* Merchant option */}
            <div
              className={`rounded-lg border p-4 sm:p-5 transition-shadow cursor-pointer ${selection === 'merchant' ? 'border-primary shadow-md' : 'hover:shadow-sm'}`}
              onClick={() => setSelection('merchant')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelection('merchant'); }}
            >
              <div className="flex items-start gap-4">
                <RadioGroupItem id="merchant" value="merchant" className="mt-1 h-5 w-5" />
                <div className="flex-1">
                  <Label htmlFor="merchant" className="flex items-center gap-3 text-base sm:text-lg font-semibold">
                    <span className="inline-flex w-10 h-10 bg-primary/10 rounded-xl items-center justify-center">
                      <Store className="w-5 h-5 text-primary" />
                    </span>
                    Merchant Shop
                  </Label>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">Upload and sell your own products</p>

                  <div className="grid sm:grid-cols-2 gap-2 mt-4">
                    <ul className="list-none space-y-2">
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-primary mt-0.5" />
                        <span className="text-xs sm:text-sm">Upload unlimited products</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-primary mt-0.5" />
                        <span className="text-xs sm:text-sm">Full inventory management</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-primary mt-0.5" />
                        <span className="text-xs sm:text-sm">Set your own prices & commissions</span>
                      </li>
                    </ul>
                    <ul className="list-none space-y-2">
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-primary mt-0.5" />
                        <span className="text-xs sm:text-sm">Dedicated storefront website</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-primary mt-0.5" />
                        <span className="text-xs sm:text-sm">Analytics & sales reports</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-primary mt-0.5" />
                        <span className="text-xs sm:text-sm">Enable affiliates to promote your products</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-primary/10 rounded-lg p-3 sm:p-4 mt-4">
                    <p className="text-xs sm:text-sm font-semibold mb-1.5">Monthly Fee</p>
                    <p className="text-lg sm:text-xl font-bold text-primary">UGX 50,000</p>
                    <p className="text-xs text-muted-foreground mt-1">Requires approval</p>
                  </div>

                  <div className="mt-3">
                    <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setSelection('merchant'); }}>
                      Select Merchant
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Affiliate option */}
            <div
              className={`rounded-lg border p-4 sm:p-5 transition-shadow cursor-pointer ${selection === 'affiliate' ? 'border-primary shadow-md' : 'hover:shadow-sm'}`}
              onClick={() => setSelection('affiliate')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelection('affiliate'); }}
            >
              <div className="flex items-start gap-4">
                <RadioGroupItem id="affiliate" value="affiliate" className="mt-1 h-5 w-5" />
                <div className="flex-1">
                  <Label htmlFor="affiliate" className="flex items-center gap-3 text-base sm:text-lg font-semibold">
                    <span className="inline-flex w-10 h-10 bg-primary/10 rounded-xl items-center justify-center">
                      <Users className="w-5 h-5 text-primary" />
                    </span>
                    Affiliate Shop
                  </Label>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">Curate & promote existing products</p>

                  <div className="grid sm:grid-cols-2 gap-2 mt-4">
                    <ul className="list-none space-y-2">
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-primary mt-0.5" />
                        <span className="text-xs sm:text-sm">No product inventory needed</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-primary mt-0.5" />
                        <span className="text-xs sm:text-sm">Choose from merchant products</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-primary mt-0.5" />
                        <span className="text-xs sm:text-sm">Set your commission rates</span>
                      </li>
                    </ul>
                    <ul className="list-none space-y-2">
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-primary mt-0.5" />
                        <span className="text-xs sm:text-sm">Standalone storefront for sharing</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-primary mt-0.5" />
                        <span className="text-xs sm:text-sm">Performance analytics</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-primary mt-0.5" />
                        <span className="text-xs sm:text-sm">Instant setup - no approval needed</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-primary/10 rounded-lg p-3 sm:p-4 mt-4">
                    <p className="text-xs sm:text-sm font-semibold mb-1.5">Tiers Available</p>
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs sm:text-sm">
                        <span>Free</span>
                        <span className="text-muted-foreground">Up to 15 products</span>
                      </div>
                      <div className="flex justify-between items-center text-xs sm:text-sm">
                        <span className="font-semibold text-primary">Premium</span>
                        <span className="text-muted-foreground">Unlimited products</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3">
                    <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setSelection('affiliate'); }}>
                      Select Affiliate
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </RadioGroup>
        </Card>

        {/* Comparison Note */}
        <div className="text-center mt-8 sm:mt-12 max-w-2xl mx-auto">
          <p className="text-xs sm:text-sm text-muted-foreground px-2">
            <strong className="text-foreground">Not sure which to choose?</strong> Merchant shops are ideal if you have your own products to sell. 
            Affiliate shops are perfect if you want to earn by promoting existing products without managing inventory.
          </p>
        </div>
      </div>

      {/* Sticky action bar */}
      <div className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 flex items-center justify-between gap-3">
          <p className="text-xs sm:text-sm text-muted-foreground">
            {selection ? `Selected: ${selection === 'merchant' ? 'Merchant Shop' : 'Affiliate Shop'}` : 'Choose one option to continue'}
          </p>
          <Button
            className="h-10 sm:h-11 text-sm"
            disabled={!selection}
            onClick={() => {
              if (selection === 'merchant') navigate('/sell');
              if (selection === 'affiliate') navigate('/affiliate/dashboard');
            }}
          >
            Continue
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
