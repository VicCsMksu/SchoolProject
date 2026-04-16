import { Outlet } from "react-router-dom";
import AdminBottomNav from "./AdminBottomNav";
import AdminTopNav from "./AdminTopNav";

const AdminLayout = () => {
  return (
    <div className="mx-auto min-h-screen max-w-lg bg-background">
      <AdminTopNav />
      <div className="pb-20">
        <Outlet />
      </div>
      <AdminBottomNav />
    </div>
  );
};

export default AdminLayout;
