import { LayoutDashboard, Calendar, Users, UserCircle, Stethoscope } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/admin/appointments", icon: Calendar, label: "Appointments" },
  { to: "/admin/doctors", icon: Users, label: "Doctors" },
  { to: "/admin/services", icon: Stethoscope, label: "Services" },
  { to: "/admin/profile", icon: UserCircle, label: "Profile" },
];

const AdminBottomNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card shadow-lg">
      <div className="mx-auto flex max-w-lg items-center justify-around py-2">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/admin"}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-0.5 px-1 py-1 text-[10px] font-medium transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )
            }
          >
            {({ isActive }) => (
              <>
                <div
                  className={cn(
                    "rounded-full p-1.5 transition-colors",
                    isActive && "bg-secondary"
                  )}
                >
                  <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default AdminBottomNav;
