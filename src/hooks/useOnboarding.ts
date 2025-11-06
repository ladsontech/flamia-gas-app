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

        // Check localStorage for onboarding completion
        const completed = localStorage.getItem(`${ONBOARDING_KEY}_${session.user.id}`);
        
        if (!completed) {
          setShowOnboarding(true);
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
        localStorage.setItem(`${ONBOARDING_KEY}_${session.user.id}`, 'true');
      }
      
      setShowOnboarding(false);
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  return {
    showOnboarding,
    loading,
    completeOnboarding
  };
};
