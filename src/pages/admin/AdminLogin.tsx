import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { toast } from "sonner";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { adminLogin } = useAdminAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await adminLogin(email, password);
    if (error) {
      toast.error(error);
    } else {
      navigate("/admin");
    }
    setSubmitting(false);
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center bg-background px-5">
      <div className="mb-8 flex flex-col items-center gap-3">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg">
          <ShieldCheck size={32} className="text-primary-foreground" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Admin Portal</h1>
        <p className="text-sm text-muted-foreground text-center">
          Secure access for authorized personnel only
        </p>
      </div>

      <Card className="w-full border shadow-sm">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold">Email Address</Label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input id="email" type="email" placeholder="admin@clinic.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-9" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold">Password</Label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input id="password" type={showPassword ? "text" : "password"} placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-9 pr-10" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full rounded-full font-semibold mt-2" disabled={submitting}>
              {submitting ? "Signing in..." : "Sign In to Portal"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className="mt-6 text-[11px] text-muted-foreground text-center">
        This portal is restricted to authorized administrators.<br />
        Contact IT support if you need access.
      </p>
    </div>
  );
};

export default AdminLogin;
