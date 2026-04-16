import { useNavigate } from "react-router-dom";
import { ArrowLeft, Moon, Sun, Globe, Shield, ChevronRight, Lock, Eye, KeyRound } from "lucide-react";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const Settings = () => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState("en");
  const [twoFactor, setTwoFactor] = useState(false);
  const [dataSharing, setDataSharing] = useState(false);

  const handleDarkMode = (checked: boolean) => {
    setDarkMode(checked);
    document.documentElement.classList.toggle("dark", checked);
    toast.success(checked ? "Dark mode enabled" : "Light mode enabled");
  };

  const handleTwoFactor = (checked: boolean) => {
    setTwoFactor(checked);
    toast.success(checked ? "Two-factor authentication enabled" : "Two-factor authentication disabled");
  };

  const handleLanguageChange = (value: string) => {
    setLanguage(value);
    const names: Record<string, string> = { en: "English", fil: "Filipino", es: "Español" };
    toast.success(`Language changed to ${names[value]}`);
  };

  return (
    <div className="px-5 pt-4 pb-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="rounded-full p-1.5 hover:bg-muted transition-colors">
          <ArrowLeft size={20} className="text-foreground" />
        </button>
        <h1 className="text-lg font-bold text-foreground">Settings</h1>
      </div>

      {/* Appearance */}
      <section className="mb-6">
        <h2 className="text-sm font-bold text-foreground mb-3">Appearance</h2>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            <div className="flex items-center justify-between px-4 py-3.5">
              <div className="flex items-center gap-3">
                {darkMode ? <Moon size={16} className="text-foreground" /> : <Sun size={16} className="text-foreground" />}
                <span className="text-sm font-medium text-foreground">Dark Mode</span>
              </div>
              <Switch checked={darkMode} onCheckedChange={handleDarkMode} />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Language */}
      <section className="mb-6">
        <h2 className="text-sm font-bold text-foreground mb-3">Language</h2>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            <div className="flex items-center justify-between px-4 py-3.5">
              <div className="flex items-center gap-3">
                <Globe size={16} className="text-foreground" />
                <Label className="text-sm font-medium text-foreground">App Language</Label>
              </div>
              <Select value={language} onValueChange={handleLanguageChange}>
                <SelectTrigger className="w-32 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="fil">Filipino</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Privacy & Security */}
      <section className="mb-6">
        <h2 className="text-sm font-bold text-foreground mb-3">Privacy & Security</h2>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            <button
              onClick={() => toast.info("Change password flow coming soon")}
              className="flex w-full items-center justify-between px-4 py-3.5 text-sm transition-colors hover:bg-muted/50 border-b border-border"
            >
              <div className="flex items-center gap-3">
                <KeyRound size={16} className="text-foreground" />
                <span className="font-medium text-foreground">Change Password</span>
              </div>
              <ChevronRight size={14} className="text-muted-foreground" />
            </button>

            <div className="flex items-center justify-between px-4 py-3.5 border-b border-border">
              <div className="flex items-center gap-3">
                <Lock size={16} className="text-foreground" />
                <span className="text-sm font-medium text-foreground">Two-Factor Auth</span>
              </div>
              <Switch checked={twoFactor} onCheckedChange={handleTwoFactor} />
            </div>

            <div className="flex items-center justify-between px-4 py-3.5">
              <div className="flex items-center gap-3">
                <Eye size={16} className="text-foreground" />
                <span className="text-sm font-medium text-foreground">Data Sharing</span>
              </div>
              <Switch checked={dataSharing} onCheckedChange={(v) => { setDataSharing(v); toast.success(v ? "Data sharing enabled" : "Data sharing disabled"); }} />
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default Settings;
