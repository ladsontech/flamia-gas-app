import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const GoogleSignUpHandler = () => {
  const { toast } = useToast();

  useEffect(() => {
    const handleAuthCallback = async () => {
      // Check if this is a Google OAuth callback
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Check for temporary referral code
        const tempReferralCode = localStorage.getItem('tempReferralCode');
        
        if (tempReferralCode) {
          try {
            // Use the database function to process the referral
            const { data: success, error } = await supabase.rpc('process_delayed_referral', {
              user_id_param: session.user.id,
              referral_code_param: tempReferralCode
            });

            if (success && !error) {
              toast({
                title: "Welcome to Flamia!",
                description: "Account created successfully with referral code applied.",
                className: "border-accent/20"
              });
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