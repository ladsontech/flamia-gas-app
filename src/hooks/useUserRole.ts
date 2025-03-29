
import { useState, useEffect } from "react";

export const useUserRole = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Admin functionality removed, always returning false
    setIsAdmin(false);
    setLoading(false);
  }, []);

  return { isAdmin, loading };
};
