import { AdminAppBar } from "@/components/admin/AdminAppBar";
import { AdminOrdersView } from "@/components/admin/AdminOrdersView";

const Admin = () => {
  return (
    <div className="min-h-screen">
      <AdminAppBar />
      <div className="container py-8">
        <AdminOrdersView />
      </div>
    </div>
  );
};

export default Admin;