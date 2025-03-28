
import { useState, useEffect } from "react";

export const useUserRole = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Since we're removing admin functionality, this hook now just returns false
    setIsAdmin(false);
    setLoading(false);
  }, []);

  return { isAdmin, loading };
};
