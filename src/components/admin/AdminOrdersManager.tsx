import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminOrdersDashboard } from "./AdminOrdersDashboard";
import { BulkSmsMarketing } from "./BulkSmsMarketing";
import { PushNotificationManager } from "./PushNotificationManager";
import { Package, ShoppingBag, MessageSquare, Flame } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const AdminOrdersManager = () => {
  const [activeTab, setActiveTab] = useState("all");

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all" className="text-xs sm:text-sm">
            <Package className="h-4 w-4 mr-1" />
            All Orders
          </TabsTrigger>
          <TabsTrigger value="gas" className="text-xs sm:text-sm">
            <Flame className="h-4 w-4 mr-1" />
            Gas
          </TabsTrigger>
          <TabsTrigger value="shop" className="text-xs sm:text-sm">
            <ShoppingBag className="h-4 w-4 mr-1" />
            Shop
          </TabsTrigger>
          <TabsTrigger value="marketing" className="text-xs sm:text-sm">
            <MessageSquare className="h-4 w-4 mr-1" />
            Marketing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <AdminOrdersDashboard 
            userRole="super_admin" 
            userId="" 
            orderType="all"
          />
        </TabsContent>

        <TabsContent value="gas" className="mt-4">
          <AdminOrdersDashboard 
            userRole="super_admin" 
            userId="" 
            orderType="gas"
          />
        </TabsContent>

        <TabsContent value="shop" className="mt-4">
          <AdminOrdersDashboard 
            userRole="super_admin" 
            userId="" 
            orderType="shop"
          />
        </TabsContent>

        <TabsContent value="marketing" className="mt-4 space-y-3 sm:space-y-4">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg">Bulk SMS Marketing</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <BulkSmsMarketing />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg">Push Notifications</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <PushNotificationManager />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
