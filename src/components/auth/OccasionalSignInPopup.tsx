import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

const OccasionalSignInPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication status
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const phoneVerified = localStorage.getItem('phoneVerified');
      
      if (user || phoneVerified) {
        setUser(user || phoneVerified);
        return;
      }

      // If not authenticated, show popup occasionally
      const lastPopupShown = localStorage.getItem('lastSignInPopupShown');
      const now = Date.now();
      
      // Show popup every 5 minutes (300000ms) if user isn't signed in
      if (!lastPopupShown || (now - parseInt(lastPopupShown)) > 300000) {
        setTimeout(() => {
          setIsOpen(true);
          localStorage.setItem('lastSignInPopupShown', now.toString());
        }, 10000); // Show after 10 seconds on page
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setIsOpen(false); // Close popup if user signs in
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignIn = () => {
    setIsOpen(false);
    navigate('/signin');
  };

  const handleSignUp = () => {
    setIsOpen(false);
    navigate('/signup');
  };

  const handleClose = () => {
    setIsOpen(false);
    // Set a shorter delay for next popup if user dismisses
    localStorage.setItem('lastSignInPopupShown', (Date.now() - 240000).toString());
  };

  // Don't show popup if user is authenticated
  if (user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-accent" />
              </div>
              <DialogTitle className="text-xl">Join Flamia!</DialogTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <DialogDescription className="text-left mt-2">
            Sign up now to track your orders, earn rewards, and get faster checkout!
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 mt-4">
          <Button 
            onClick={handleSignUp}
            className="w-full bg-gradient-to-r from-accent to-accent/90 hover:from-accent/90 hover:to-accent"
          >
            Create Account
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleSignIn}
            className="w-full hover:bg-accent/10 border-accent/30"
          >
            Already have an account? Sign In
          </Button>
        </div>
        
        <p className="text-xs text-muted-foreground text-center mt-4">
          Free delivery on your first order! 🚚
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default OccasionalSignInPopup;