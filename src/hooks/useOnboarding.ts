import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const ONBOARDING_KEY = 'flamia_onboarding_completed';

export const useOnboarding = () => {
  // All hooks called unconditionally
  const { user, loading: authLoading } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    
    const checkOnboardingStatus = async () => {
      if (!mounted) return;
      
      // Wait for auth to finish loading
      if (authLoading) {
        return;
      }
      
      setLoading(true);
      try {
        if (!user) {
          if (mounted) setLoading(false);
          return;
        }

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          console.warn('Error fetching onboarding:', error);
        }

        const serverCompleted = profile?.onboarding_completed === true;

        if (serverCompleted) {
          try {
            localStorage.setItem(`${ONBOARDING_KEY}_${user.id}`, 'true');
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
            supabase.from('affiliate_shops').select('id').eq('user_id', user.id).maybeSingle(),
            supabase.from('seller_shops').select('id, is_approved').eq('user_id', user.id).eq('is_approved', true).maybeSingle()
          ]);
          
          const alreadySetUp = !!affShop || !!sellerShop;
          if (alreadySetUp && mounted) {
            try {
              const nowIso = new Date().toISOString();
              await supabase.from('profiles').upsert({
                id: user.id,
                onboarding_completed: true,
                updated_at: nowIso
              }, { onConflict: 'id' });
              
              try {
                localStorage.setItem(`${ONBOARDING_KEY}_${user.id}`, 'true');
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
          const localCompleted = localStorage.getItem(`${ONBOARDING_KEY}_${user.id}`);
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
  }, [user, authLoading]);

  const completeOnboarding = async () => {
    try {
      if (!user) {
        setShowOnboarding(false);
        return;
      }
      
      const nowIso = new Date().toISOString();
      await supabase.from('profiles').upsert({
        id: user.id,
        onboarding_completed: true,
        updated_at: nowIso
      }, { onConflict: 'id' });

      try {
        localStorage.setItem(`${ONBOARDING_KEY}_${user.id}`, 'true');
      } catch (e) {
        // Ignore
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
    loading: authLoading || loading,
    completeOnboarding,
    dismissOnboarding
  };
};
