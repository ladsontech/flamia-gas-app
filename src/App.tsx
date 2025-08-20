import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/components/ui/use-toast"
import { BottomNav } from './components/BottomNav';
import UpdateNotification from './components/UpdateNotification';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { supabase } from './integrations/supabase/client';
import AdminPage from './pages/AdminPage';
import Login from './pages/Login';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Account from './pages/Account';
import Gadgets from './pages/Gadgets';
import Foods from './pages/Foods';
import Home from './pages/Home';

function App() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [user, setUser] = useState<any>(null);
  const queryClient = new QueryClient();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
  }, []);

  useEffect(() => {
    const fetchAdminStatus = async () => {
      try {
        const storedRole = localStorage.getItem('userRole');
        setIsAdmin(storedRole === 'admin');
      } catch (error) {
        console.error("Error fetching admin status:", error);
        setIsAdmin(false);
      }
    };

    fetchAdminStatus();
  }, [user]);

  const updateSW = useRegisterSW({
    onNeedRefresh() {
      toast({
        title: "Update available!",
        description: "Click here to update the app.",
        action: <UpdateNotification updateSW={updateSW} />,
      })
    },
    onRegistered(r) {
      r && setInterval(() => {
        r.update()
      }, 60 * 60 * 1000)
    },
  })

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Toaster />
          
          <main className="flex-1 pb-20 md:pb-0">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/gadgets" element={<Gadgets />} />
              <Route path="/foods" element={<Foods />} />
              <Route path="/account" element={<Account />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
              <Route
                path="/admin"
                element={
                  isAdmin ? (
                    <AdminPage />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />
            </Routes>
          </main>
          
          <BottomNav isAdmin={isAdmin} user={user} />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
