import { Home, Calendar, FileText, CreditCard, UserCircle } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/home", icon: Home, label: "Home" },
  { to: "/appointments", icon: Calendar, label: "Appointments" },
  { to: "/records", icon: FileText, label: "Records" },
  { to: "/payment-plans", icon: CreditCard, label: "Plans" },
  { to: "/account", icon: UserCircle, label: "Account" },
];

const BottomNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card shadow-lg">
      <div className="mx-auto flex max-w-lg items-center justify-around py-2">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/home"}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-0.5 px-1 py-1 text-[10px] font-medium transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )
            }
          >
            {({ isActive }) => (
              <>
                <div
                  className={cn(
                    "rounded-full p-1.5 transition-colors",
                    isActive && "bg-secondary",
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

export default BottomNav;
