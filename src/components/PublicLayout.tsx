import { Outlet } from "react-router-dom";
import PublicTopNav from "./PublicTopNav";
import PublicBottomNav from "./PublicBottomNav";

const PublicLayout = () => {
  return (
    <div className="mx-auto min-h-screen max-w-lg bg-background">
      <PublicTopNav />
      <div className="pb-20">
        <Outlet />
      </div>
      <PublicBottomNav />
    </div>
  );
};

export default PublicLayout;
