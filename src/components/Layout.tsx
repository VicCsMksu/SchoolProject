import { Outlet } from "react-router-dom";
import TopNav from "./TopNav";
import BottomNav from "./BottomNav";

const Layout = () => {
  return (
    <div className="mx-auto min-h-screen max-w-lg bg-background">
      <TopNav />
      <div className="pb-20">
        <Outlet />
      </div>
      <BottomNav />
    </div>
  );
};

export default Layout;
