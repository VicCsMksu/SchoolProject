import { ShieldCheck } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";

const AdminTopNav = () => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-card px-4 py-3">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <ShieldCheck size={18} className="text-primary-foreground" />
        </div>
        <span className="text-base font-bold text-foreground">
          Admin Portal
        </span>
      </div>
      <Avatar
        className="h-8 w-8 cursor-pointer"
        onClick={() => navigate("/admin/profile")}
      >
        <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
          AD
        </AvatarFallback>
      </Avatar>
    </header>
  );
};

export default AdminTopNav;
