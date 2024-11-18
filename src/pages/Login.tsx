import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent, isLogin: boolean) => {
    e.preventDefault();
    setLoading(true);

    try {
      let userData = null;

      if (isLogin) {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;
        userData = signInData;
      } else {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) throw signUpError;

        if (signUpData.user) {
          try {
            const { error: insertError } = await supabase
              .from('users')
              .insert([{ 
                email,
                role: email === 'laddave84@gmail.com' ? 'admin' : 'user'
              }]);

            if (insertError) {
              // If the user already exists in the users table, we can ignore this error
              if (!insertError.message.includes('duplicate key value')) {
                throw insertError;
              }
            }
            userData = signUpData;
          } catch (error: any) {
            toast({
              title: "Error",
              description: error.message,
              variant: "destructive",
            });
            return;
          }
        }
      }

      if (userData?.user) {
        const { data: userRoleData } = await supabase
          .from('users')
          .select('role')
          .eq('email', email)
          .single();

        if (userRoleData?.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }

        toast({
          title: "Success",
          description: isLogin ? "Logged in successfully" : "Account created successfully",
        });
      }
    } catch (error: any) {
      let errorMessage = error.message;
      if (error.message.includes('email_not_confirmed')) {
        errorMessage = "Please check your email to confirm your account. For development, you can disable email confirmation in the Supabase dashboard.";
      }
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary to-white py-12">
      <div className="container max-w-sm mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <Card className="p-6">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <form onSubmit={(e) => handleAuth(e, true)} className="space-y-4">
                  <div>
                    <Input
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? "Processing..." : "Login"}
                  </Button>
                </form>
              </TabsContent>
              <TabsContent value="signup">
                <form onSubmit={(e) => handleAuth(e, false)} className="space-y-4">
                  <div>
                    <Input
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? "Processing..." : "Sign Up"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;