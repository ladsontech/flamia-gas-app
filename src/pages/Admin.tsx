import { AdminAppBar } from "@/components/admin/AdminAppBar";
import { AdminOrdersView } from "@/components/admin/AdminOrdersView";
import { BrandsManager } from "@/components/admin/BrandsManager";
import { HotDealsManager } from "@/components/admin/HotDealsManager";
import { useLocation } from "react-router-dom";

const Admin = () => {
  const location = useLocation();
  const path = location.pathname;

  const renderContent = () => {
    if (path.includes('/admin/brands')) {
      return <BrandsManager />;
    }
    if (path.includes('/admin/hot-deals')) {
      return <HotDealsManager />;
    }
    // Default to orders view
    return <AdminOrdersView />;
  };

  return (
    <div className="min-h-screen">
      <AdminAppBar />
      <div className="container py-8">
        {renderContent()}
      </div>
    </div>
  );
};

export default Admin;