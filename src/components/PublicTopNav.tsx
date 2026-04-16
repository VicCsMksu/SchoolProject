import { Menu, Stethoscope, User } from "lucide-react";
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/services", label: "Services" },
  { to: "/doctors", label: "Doctors" },
  { to: "/about", label: "About" },
];

const PublicTopNav = () => {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between bg-primary px-5 py-3">
      <div className="flex items-center gap-2">
        <Stethoscope className="text-primary-foreground" size={28} />
      </div>

      <div className="flex items-center gap-2">
        <NavLink
          to="/signin"
          className="flex items-center gap-1.5 rounded-full bg-primary-foreground/10 px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary-foreground/20 transition-colors"
        >
          <User size={14} />
          <span>Sign In</span>
        </NavLink>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button className="rounded-md p-1.5 text-primary-foreground hover:bg-primary-foreground/10">
              <Menu size={24} />
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="w-64 bg-primary border-primary">
            <SheetHeader className="mb-6">
              <SheetTitle className="flex items-center gap-2 text-primary-foreground">
                <Stethoscope size={24} />
                <span>Menu</span>
              </SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-1">
              {navItems.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === "/"}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground"
                    )
                  }
                >
                  {label}
                </NavLink>
              ))}
              <NavLink
                to="/signin"
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground"
                  )
                }
              >
                Sign In
              </NavLink>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default PublicTopNav;
