import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const ONBOARDING_KEY = 'flamia_onboarding_completed';

export const useOnboarding = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [loading, setLoading] = useState(false); // Start as false to not block initial render

  useEffect(() => {
    let mounted = true;
    
    // Check onboarding status asynchronously without blocking initial render
    const checkOnboardingStatus = async () => {
      if (!mounted) return;
      
      setLoading(true);
      try {
        // Check if user is authenticated
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Error getting session in useOnboarding:', sessionError);
          if (mounted) setLoading(false);
          return;
        }
        
        if (!session) {
          if (mounted) setLoading(false);
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
          // Don't fail completely, just skip onboarding check
          if (mounted) {
            setShowOnboarding(false);
            setLoading(false);
          }
          return;
        }

        const serverCompleted = profile?.onboarding_completed === true;

        if (serverCompleted) {
          // Mirror to localStorage for legacy/fallback behavior
          localStorage.setItem(`${ONBOARDING_KEY}_${session.user.id}`, 'true');
          if (mounted) {
            setShowOnboarding(false);
            setLoading(false);
          }
        } else {
          // If not marked complete, auto-complete if user already has an affiliate shop
          // or has an approved seller shop
          try {
            const [{ data: affShop, error: affError }, { data: sellerShop, error: sellerError }] = await Promise.all([
              supabase.from('affiliate_shops').select('id').eq('user_id', session.user.id).maybeSingle(),
              supabase.from('seller_shops').select('id, is_approved').eq('user_id', session.user.id).eq('is_approved', true).maybeSingle()
            ]);
            
            // Log errors but don't fail
            if (affError) console.error('Error checking affiliate shop:', affError);
            if (sellerError) console.error('Error checking seller shop:', sellerError);
            
            const alreadySetUp = !!affShop || !!sellerShop;
            if (alreadySetUp && mounted) {
              try {
                const nowIso = new Date().toISOString();
                const { error: upsertError } = await supabase.from('profiles').upsert({
                  id: session.user.id,
                  onboarding_completed: true,
                  updated_at: nowIso
                }, { onConflict: 'id' });
                
                if (upsertError) {
                  console.error('Error updating onboarding status:', upsertError);
                } else {
                  localStorage.setItem(`${ONBOARDING_KEY}_${session.user.id}`, 'true');
                }
              } catch (upsertErr) {
                console.error('Error upserting onboarding status:', upsertErr);
              }
              
              if (mounted) {
                setShowOnboarding(false);
                setLoading(false);
              }
              return;
            }
          } catch (autoErr) {
            console.error('Auto-complete onboarding check failed:', autoErr);
          }
          // Fallback to legacy localStorage if server doesn't have the flag yet
          try {
            const localCompleted = localStorage.getItem(`${ONBOARDING_KEY}_${session.user.id}`);
            if (mounted) {
              setShowOnboarding(!localCompleted);
            }
          } catch (localErr) {
            console.error('Error accessing localStorage:', localErr);
            if (mounted) {
              setShowOnboarding(false);
            }
          }
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        // Don't fail completely, just hide onboarding
        if (mounted) {
          setShowOnboarding(false);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Small delay to ensure app has rendered first
    const timer = setTimeout(() => {
      if (mounted) {
        checkOnboardingStatus();
      }
    }, 200);

    // Re-check when auth state changes (fixes delayed account switch/init)
    let subscription: { unsubscribe: () => void } | null = null;
    try {
      const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (mounted && session?.user) {
          checkOnboardingStatus();
        }
      });
      subscription = authSubscription;
    } catch (error) {
      console.error('Error setting up auth state listener:', error);
    }

    return () => {
      mounted = false;
      clearTimeout(timer);
      subscription?.unsubscribe();
    };
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
