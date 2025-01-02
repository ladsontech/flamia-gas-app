import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

interface LoginFormProps {
  password: string;
  setPassword: (password: string) => void;
  handleLogin: (e: React.FormEvent) => void;
  authLoading: boolean;
}

export const LoginForm = ({ authLoading }: LoginFormProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // First check admin credentials
      const { data: adminData, error: adminError } = await supabase
        .from('admin_credentials')
        .select('password_hash')
        .single();

      if (adminError) throw adminError;

      if (adminData.password_hash !== password || username !== 'admin') {
        toast({
          title: "Error",
          description: "Invalid admin credentials",
          variant: "destructive",
        });
        return;
      }

      // If admin credentials are valid, sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: 'admin',
        password: 'admin'
      });

      if (signInError) throw signInError;

      toast({
        title: "Success",
        description: "Logged in as admin",
      });

      navigate('/admin');
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Error",
        description: "Failed to login",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary to-white py-12">
      <div className="container max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <Card className="p-6">
            <h1 className="text-2xl font-bold text-center mb-6">Admin Login</h1>
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <Input
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div>
                <Input
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full"
                disabled={authLoading}
              >
                {authLoading ? "Authenticating..." : "Login"}
              </Button>
            </form>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};