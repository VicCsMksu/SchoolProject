import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Globe, Moon, LogOut, ChevronRight } from "lucide-react";

const AdminProfile = () => {
  const navigate = useNavigate();
  const { adminLogout } = useAdminAuth();

  const handleLogout = () => {
    adminLogout();
    navigate("/admin/login");
  };

  return (
    <div className="px-5 pt-6 space-y-5">
      {/* Profile Card */}
      <Card className="border-0 bg-secondary shadow-sm">
        <CardContent className="flex flex-col items-center p-6">
          <Avatar className="h-20 w-20 mb-3">
            <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
              AD
            </AvatarFallback>
          </Avatar>
          <span className="mb-1 rounded-full bg-primary/10 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
            Administrator
          </span>
          <h2 className="text-xl font-bold text-foreground">Dr. Admin User</h2>
          <p className="text-xs text-muted-foreground">System Administrator • Main Facility</p>
        </CardContent>
      </Card>

      {/* Settings */}
      <div>
        <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Settings
        </p>
        <div className="space-y-2">
          <Card className="border shadow-sm cursor-pointer hover:bg-muted/50 transition-colors">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
                <Bell size={18} className="text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">Notifications</p>
                <p className="text-[11px] text-muted-foreground">Manage alert channels</p>
              </div>
              <ChevronRight size={16} className="text-muted-foreground" />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Preferences */}
      <div>
        <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Preferences
        </p>
        <div className="space-y-1">
          {[
            { icon: Globe, label: "Interface Language", value: "English (US)" },
            { icon: Moon, label: "Dark Mode Appearance" },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between py-3 px-1">
              <div className="flex items-center gap-3">
                <item.icon size={18} className="text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">{item.label}</span>
              </div>
              {item.value ? (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  {item.value} <ChevronRight size={14} />
                </span>
              ) : (
                <ChevronRight size={14} className="text-muted-foreground" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Logout */}
      <Button
        variant="outline"
        className="w-full rounded-full border-destructive/30 text-destructive hover:bg-destructive/10 font-semibold"
        onClick={handleLogout}
      >
        <LogOut size={16} />
        Logout from Portal
      </Button>

      <p className="text-center text-[10px] text-muted-foreground pb-4">
        Version 1.0.0 • Healthcare Admin Systems
      </p>
    </div>
  );
};

export default AdminProfile;
