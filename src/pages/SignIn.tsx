import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

const kenyanCounties = [
  "Mombasa", "Kwale", "Kilifi", "Tana River", "Lamu", "Taita Taveta",
  "Garissa", "Wajir", "Mandera", "Marsabit", "Isiolo", "Meru",
  "Tharaka-Nithi", "Embu", "Kitui", "Machakos", "Makueni",
  "Nyandarua", "Nyeri", "Kirinyaga", "Murang'a", "Kiambu",
  "Turkana", "West Pokot", "Samburu", "Trans Nzoia", "Uasin Gishu",
  "Elgeyo-Marakwet", "Nandi", "Baringo", "Laikipia", "Nakuru",
  "Narok", "Kajiado", "Kericho", "Bomet", "Kakamega", "Vihiga",
  "Bungoma", "Busia", "Siaya", "Kisumu", "Homa Bay", "Migori",
  "Kisii", "Nyamira", "Nairobi",
];

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const SignIn = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { login, signUp } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [sex, setSex] = useState("");
  const [county, setCounty] = useState("");

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin + "/home",
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });
      if (error) {
        toast.error("Google sign-in failed: " + error.message);
      }
      // No navigate() call needed — Supabase redirects the browser automatically
    } catch {
      toast.error("Google sign-in failed. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    if (isSignUp) {
      const fullName = [firstName, middleName, lastName].filter(Boolean).join(" ");
      const { error } = await signUp(email, password, {
        full_name: fullName,
        phone,
        date_of_birth: birthdate,
        gender: sex,
        county,
      });
      if (error) {
        toast.error(error);
      } else {
        toast.success("Account created! Please check your email to verify.");
      }
    } else {
      const { error } = await login(email, password);
      if (error) {
        toast.error(error);
      } else {
        // Check if user has admin role
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: roleData } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", user.id)
            .eq("role", "admin")
            .maybeSingle();
          if (roleData) {
            navigate("/admin");
            return;
          }
        }
        navigate("/home");
      }
    }
    setSubmitting(false);
  };

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-start px-5 py-8">
      <Card className="w-full max-w-sm border-0 shadow-lg animate-fade-in">
        <CardHeader className="pb-4 text-center">
          <CardTitle className="text-xl font-bold text-primary">
            {isSignUp ? "Sign Up" : "Sign In"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Google OAuth Button */}
          <Button
            type="button"
            variant="outline"
            className="w-full rounded-full font-semibold mb-4 gap-2"
            size="lg"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
          >
            <GoogleIcon />
            {googleLoading ? "Please wait..." : "Continue with Google"}
          </Button>

          <div className="flex items-center gap-3 mb-4">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">or</span>
            <Separator className="flex-1" />
          </div>

          <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
            {isSignUp && (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Juan" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="middleName">Middle Name</Label>
                  <Input id="middleName" value={middleName} onChange={(e) => setMiddleName(e.target.value)} placeholder="Agapito" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Dela Cruz" required />
                </div>
              </>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                {!isSignUp && (
                  <button type="button" className="text-xs font-medium text-primary hover:underline">
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="pr-10" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {isSignUp && (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="birthdate">Birthdate</Label>
                  <Input id="birthdate" type="date" value={birthdate} onChange={(e) => setBirthdate(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="sex">Sex</Label>
                  <Select value={sex} onValueChange={setSex}>
                    <SelectTrigger><SelectValue placeholder="Select Sex" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="07XXXXXXXX" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="county">County</Label>
                  <Select value={county} onValueChange={setCounty}>
                    <SelectTrigger><SelectValue placeholder="Select County" /></SelectTrigger>
                    <SelectContent>
                      {kenyanCounties.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-start gap-2 mt-2">
                  <Checkbox id="terms" checked={agreedToTerms} onCheckedChange={(checked) => setAgreedToTerms(checked === true)} />
                  <label htmlFor="terms" className="text-xs leading-relaxed text-muted-foreground">
                    I have read, understood, and accepted the{" "}
                    <button type="button" onClick={() => setShowTerms(true)} className="font-semibold text-primary underline">
                      Terms and Conditions & Privacy Policy
                    </button>
                  </label>
                </div>
              </>
            )}

            <Button type="submit" className="mt-2 w-full rounded-full font-semibold" size="lg" disabled={(isSignUp && !agreedToTerms) || submitting}>
              {submitting ? "Please wait..." : isSignUp ? "Sign Up" : "Sign In"}
              <ArrowRight size={18} />
            </Button>
          </form>

          <div className="mt-5 text-center">
            <span className="text-sm text-muted-foreground">
              {isSignUp ? "Already have an account? " : "Don't have an account? "}
            </span>
            <button type="button" onClick={() => setIsSignUp(!isSignUp)} className="text-sm font-semibold text-primary hover:underline">
              {isSignUp ? "Sign In" : "Sign up"}
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Terms Dialog */}
      <Dialog open={showTerms} onOpenChange={setShowTerms}>
        <DialogContent className="max-w-sm max-h-[85vh] p-0">
          <DialogHeader className="px-5 pt-5 pb-2">
            <DialogTitle className="text-base font-bold">Terms and Privacy Policy</DialogTitle>
          </DialogHeader>
          <ScrollArea className="px-5 pb-4" style={{ maxHeight: "60vh" }}>
            <div className="space-y-4 text-xs leading-relaxed text-muted-foreground pr-3">
              <div><h3 className="mb-1 text-sm font-bold text-primary">Terms and Conditions</h3><p>By accessing our services, you agree to comply with the following terms and conditions.</p></div>
              <div><h4 className="mb-1 font-bold text-primary">Use of Services</h4><p>You agree to use our services only for lawful purposes.</p></div>
              <div><h4 className="mb-1 font-bold text-primary">Account Registration</h4><p>When you create an account, you agree to provide accurate and complete information.</p></div>
              <div><h4 className="mb-1 font-bold text-primary">Privacy</h4><p>We value your privacy. Any personal data you provide will be handled according to our Privacy Policy.</p></div>
              <div className="border-t border-border pt-4"><h3 className="mb-1 text-sm font-bold text-primary">Privacy Policy</h3><p>Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your personal data.</p></div>
              <div><h4 className="mb-1 font-bold text-primary">Data Security</h4><p>We implement reasonable technical and organizational measures to protect your information.</p></div>
            </div>
          </ScrollArea>
          <div className="flex flex-col gap-2 px-5 pb-5">
            <Button className="w-full rounded-full font-semibold" onClick={() => { setAgreedToTerms(true); setShowTerms(false); }}>
              Agree and Continue
            </Button>
            <button type="button" onClick={() => setShowTerms(false)} className="text-sm text-muted-foreground hover:text-foreground">Close</button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SignIn;
