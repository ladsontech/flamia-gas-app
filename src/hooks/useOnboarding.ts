import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const ONBOARDING_KEY = 'flamia_onboarding_completed';

export const useOnboarding = () => {
  // All hooks called unconditionally
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    
    const checkOnboardingStatus = async () => {
      if (!mounted) return;
      
      setLoading(true);
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          if (mounted) setLoading(false);
          return;
        }

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('id', session.user.id)
          .maybeSingle();

        if (error) {
          console.warn('Error fetching onboarding:', error);
        }

        const serverCompleted = profile?.onboarding_completed === true;

        if (serverCompleted) {
          try {
            localStorage.setItem(`${ONBOARDING_KEY}_${session.user.id}`, 'true');
          } catch (e) {
            // Ignore localStorage errors
          }
          if (mounted) {
            setShowOnboarding(false);
            setLoading(false);
          }
          return;
        }

        // Check if user already has shop setup
        try {
          const [{ data: affShop }, { data: sellerShop }] = await Promise.all([
            supabase.from('affiliate_shops').select('id').eq('user_id', session.user.id).maybeSingle(),
            supabase.from('seller_shops').select('id, is_approved').eq('user_id', session.user.id).eq('is_approved', true).maybeSingle()
          ]);
          
          const alreadySetUp = !!affShop || !!sellerShop;
          if (alreadySetUp && mounted) {
            try {
              const nowIso = new Date().toISOString();
              await supabase.from('profiles').upsert({
                id: session.user.id,
                onboarding_completed: true,
                updated_at: nowIso
              }, { onConflict: 'id' });
              
              try {
                localStorage.setItem(`${ONBOARDING_KEY}_${session.user.id}`, 'true');
              } catch (e) {
                // Ignore
              }
            } catch (upsertErr) {
              console.warn('Error updating onboarding:', upsertErr);
            }
            
            if (mounted) {
              setShowOnboarding(false);
              setLoading(false);
            }
            return;
          }
        } catch (autoErr) {
          console.warn('Auto-complete check failed:', autoErr);
        }

        // Fallback to localStorage
        try {
          const localCompleted = localStorage.getItem(`${ONBOARDING_KEY}_${session.user.id}`);
          if (mounted) {
            setShowOnboarding(!localCompleted);
          }
        } catch (e) {
          if (mounted) {
            setShowOnboarding(false);
          }
        }
      } catch (error) {
        console.error('Onboarding check error:', error);
        if (mounted) {
          setShowOnboarding(false);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    const timer = setTimeout(() => {
      checkOnboardingStatus();
    }, 200);

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, []);

  const completeOnboarding = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const nowIso = new Date().toISOString();
        await supabase.from('profiles').upsert({
          id: session.user.id,
          onboarding_completed: true,
          updated_at: nowIso
        }, { onConflict: 'id' });

        try {
          localStorage.setItem(`${ONBOARDING_KEY}_${session.user.id}`, 'true');
        } catch (e) {
          // Ignore
        }
      }
      
      setShowOnboarding(false);
    } catch (error) {
      console.error('Error completing onboarding:', error);
      setShowOnboarding(false);
    }
  };

  const dismissOnboarding = () => {
    setShowOnboarding(false);
  };

  return {
    showOnboarding,
    loading,
    completeOnboarding,
    dismissOnboarding
  };
};
