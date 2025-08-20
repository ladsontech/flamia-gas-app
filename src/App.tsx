
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/hooks/use-toast"
import { BottomNav } from './components/BottomNav';
import AppBar from './components/AppBar';
import UpdateNotification from './components/UpdateNotification';
import { supabase } from './integrations/supabase/client';
import AdminPage from './pages/Admin';
import Login from './pages/Login';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Account from './pages/Account';
import Orders from './pages/Orders';
import Gadgets from './pages/Gadgets';
import Foods from './pages/Foods';
import Home from './pages/Index';

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

  const handleUpdate = () => {
    window.location.reload();
  };

  const showUpdateNotification = () => {
    toast({
      title: "Update available!",
      description: "Click here to update the app.",
      action: <UpdateNotification onUpdate={handleUpdate} />,
    });
  };

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="flex flex-col min-h-screen">
          <AppBar />
          <Toaster />
          
          <main className="flex-1 pb-24 md:pb-0">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/gadgets" element={<Gadgets />} />
              <Route path="/foods" element={<Foods />} />
              <Route path="/orders" element={<Orders />} />
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
