import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const ONBOARDING_KEY = 'flamia_onboarding_completed';

export const useOnboarding = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [loading, setLoading] = useState(false); // Start as false to not block initial render

  useEffect(() => {
    // Check onboarding status asynchronously without blocking initial render
    const checkOnboardingStatus = async () => {
      setLoading(true);
      try {
        // Check if user is authenticated
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setLoading(false);
          return;
        }

        // Prefer server-side flag for cross-device consistency
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('id', session.user.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching onboarding status:', error);
        }

        const serverCompleted = profile?.onboarding_completed === true;

        if (serverCompleted) {
          // Mirror to localStorage for legacy/fallback behavior
          localStorage.setItem(`${ONBOARDING_KEY}_${session.user.id}`, 'true');
          setShowOnboarding(false);
        } else {
          // If not marked complete, auto-complete if user already has an affiliate shop
          // or has an approved seller shop
          try {
            const [{ data: affShop }, { data: sellerShop }] = await Promise.all([
              supabase.from('affiliate_shops').select('id').eq('user_id', session.user.id).maybeSingle(),
              supabase.from('seller_shops').select('id, is_approved').eq('user_id', session.user.id).eq('is_approved', true).maybeSingle()
            ]);
            const alreadySetUp = !!affShop || !!sellerShop;
            if (alreadySetUp) {
              const nowIso = new Date().toISOString();
              await supabase.from('profiles').upsert({
                id: session.user.id,
                onboarding_completed: true,
                updated_at: nowIso
              }, { onConflict: 'id' });
              localStorage.setItem(`${ONBOARDING_KEY}_${session.user.id}`, 'true');
              setShowOnboarding(false);
              setLoading(false);
              return;
            }
          } catch (autoErr) {
            console.error('Auto-complete onboarding check failed:', autoErr);
          }
          // Fallback to legacy localStorage if server doesn't have the flag yet
          const localCompleted = localStorage.getItem(`${ONBOARDING_KEY}_${session.user.id}`);
          setShowOnboarding(!localCompleted);
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
      } finally {
        setLoading(false);
      }
    };

    // Small delay to ensure app has rendered first
    const timer = setTimeout(() => {
      checkOnboardingStatus();
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  const completeOnboarding = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // Persist on server for cross-device skip
        const nowIso = new Date().toISOString();
        const { error } = await supabase
          .from('profiles')
          .upsert({
            id: session.user.id,
            onboarding_completed: true,
            updated_at: nowIso
          }, { onConflict: 'id' });

        if (error) {
          console.error('Error updating onboarding status:', error);
        }

        // Mirror to localStorage for immediate UX
        localStorage.setItem(`${ONBOARDING_KEY}_${session.user.id}`, 'true');
      }
      
      setShowOnboarding(false);
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  const dismissOnboarding = () => {
    // Hide onboarding for current session without marking complete on server
    setShowOnboarding(false);
  };

  return {
    showOnboarding,
    loading,
    completeOnboarding,
    dismissOnboarding
  };
};
