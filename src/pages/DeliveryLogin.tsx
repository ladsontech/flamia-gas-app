
import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { authenticateDeliveryMan } from "@/services/database";
import { useNavigate } from "react-router-dom";
import { BackButton } from "@/components/BackButton";

const DeliveryLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const deliveryMan = await authenticateDeliveryMan(email, password);
      
      if (deliveryMan) {
        localStorage.setItem('deliveryMan', JSON.stringify(deliveryMan));
        localStorage.setItem('userRole', 'delivery');
        toast({ 
          title: "Login successful",
          description: `Welcome back, ${deliveryMan.name}!`
        });
        navigate('/account');
      } else {
        toast({
          title: "Login failed",
          description: "Invalid email or password",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Login error",
        description: "An error occurred during login",
        variant: "destructive"
      });
      console.error("Delivery man login error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container py-6 px-4 md:px-6">
        <BackButton />
        
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
          <Card className="w-full max-w-md p-6">
            <h1 className="text-2xl font-bold mb-6 text-center">Delivery Login</h1>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </Button>
            </form>
            
            <div className="mt-4 text-sm text-gray-600">
              <p>Test accounts:</p>
              <p>fahad@gmail.com / fahad123</p>
              <p>osinya@gmail.com / osinya123</p>
              <p>peter@gmail.com / peter123</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DeliveryLogin;
