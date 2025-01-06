import { AdminOrdersView } from "@/components/admin/AdminOrdersView";

const Admin = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/20 to-background">
      <div className="container py-8">
        <AdminOrdersView />
      </div>
    </div>
  );
};

export default Admin;