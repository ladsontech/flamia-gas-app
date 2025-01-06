import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { LockKeyhole, User } from "lucide-react";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (username !== 'admin' || password !== 'admin') {
        toast({
          title: "Error",
          description: "Invalid admin credentials",
          variant: "destructive",
        });
        return;
      }

      localStorage.setItem('isAdmin', 'true');
      
      toast({
        title: "Success",
        description: "Logged in as admin",
      });

      // Redirect directly to the orders page instead of /admin
      navigate('/admin');
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Error",
        description: "Failed to login",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/20 to-background py-12">
      <div className="container max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <Card className="p-6">
            <div className="text-center mb-6">
              <div className="flex justify-center mb-2">
                <LockKeyhole className="w-12 h-12 text-primary" />
              </div>
              <h1 className="text-2xl font-bold">Admin Login</h1>
              <p className="text-muted-foreground mt-2">Access order management</p>
            </div>
            
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Username (admin)"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-9"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="relative">
                  <LockKeyhole className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="Password (admin)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9"
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login as Admin"}
              </Button>
            </form>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminLogin;