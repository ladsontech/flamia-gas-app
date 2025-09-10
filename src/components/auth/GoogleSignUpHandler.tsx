import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const GoogleSignUpHandler = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      // Check if this is a Google OAuth callback
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Check for temporary referral code
        const tempReferralCode = localStorage.getItem('tempReferralCode');
        
        if (tempReferralCode) {
          try {
            // Find the referrer by referral code
            const { data: referrerProfile } = await supabase
              .from('profiles')
              .select('id')
              .eq('referral_code', tempReferralCode.toUpperCase())
              .maybeSingle();

            if (referrerProfile) {
              // Create referral record linking referrer to the new user
              const { error } = await supabase
                .from('referrals')
                .insert({
                  referrer_id: referrerProfile.id,
                  referred_user_id: session.user.id,
                  referral_code: tempReferralCode.toUpperCase(),
                  status: 'pending'
                });

              if (!error) {
                toast({
                  title: "Welcome to Flamia!",
                  description: "Account created successfully with referral code applied.",
                  className: "border-accent/20"
                });
              } else {
                console.error('Error creating referral:', error);
                toast({
                  title: "Welcome to Flamia!",
                  description: "Account created successfully, but referral code could not be applied.",
                  className: "border-accent/20"
                });
              }
            } else {
              toast({
                title: "Welcome to Flamia!",
                description: "Account created successfully. Invalid referral code was ignored.",
                className: "border-accent/20"
              });
            }
          } catch (error) {
            console.error('Error processing referral:', error);
            toast({
              title: "Welcome to Flamia!",
              description: "Account created successfully.",
              className: "border-accent/20"
            });
          } finally {
            // Clean up temporary referral code
            localStorage.removeItem('tempReferralCode');
          }
        }
      }
    };

    handleAuthCallback();
  }, [toast]);

  return null;
};