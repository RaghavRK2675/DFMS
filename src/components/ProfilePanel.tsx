import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User as UserIcon, Phone, Mail, MapPin, Building2, ShieldCheck,
  Clock, LogOut, Settings, Bell, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useStats } from "@/hooks/useDfmsData";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  onOpenAccount: () => void;
  onOpenPrefs: () => void;
}

export function ProfilePanel({ open, onClose, onOpenAccount, onOpenPrefs }: Props) {
  const { user, logout } = useAuth();
  const { data: stats } = useStats();
  const navigate = useNavigate();
  const [signingOut, setSigningOut] = useState(false);

  if (!user) return null;

  const initials = user.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
  const memberSince = new Date(user.createdAt).toLocaleDateString("en-IN", {
    month: "long", year: "numeric",
  });

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await logout();
      toast.success("Signed out");
      navigate("/login", { replace: true });
    } catch {
      toast.error("Sign-out failed");
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-80 sm:w-96 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Farmer Profile</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col items-center pt-4 pb-6 border-b">
          <Avatar className="w-20 h-20 text-lg">
            {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name} />}
            <AvatarFallback className="bg-primary text-primary-foreground font-display font-bold text-xl">
              {initials || "F"}
            </AvatarFallback>
          </Avatar>
          <h3 className="font-display font-bold text-foreground text-lg mt-3">{user.name}</h3>
          <p className="text-sm text-muted-foreground capitalize">{user.role === "admin" ? "Administrator" : "Farm Owner & Manager"}</p>
          <span className="mt-2 flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full font-medium">
            <ShieldCheck className="w-3.5 h-3.5" /> DFMS Verified
          </span>
        </div>

        <div className="py-4 border-b space-y-3">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Farm Information</h4>
          {[
            { icon: Building2, label: "Farm Name", value: user.farmName || "—" },
            { icon: MapPin, label: "Location", value: user.location || "—" },
            { icon: Phone, label: "Phone", value: user.phone || "—" },
            { icon: Mail, label: "Email", value: user.email },
          ].map((item) => (
            <div key={item.label} className="flex items-start gap-3">
              <item.icon className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="text-sm font-medium text-foreground break-all">{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="py-4 border-b space-y-3">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">DFMS Account</h4>
          <div className="flex items-center gap-3">
            <Clock className="w-4 h-4 text-primary shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Member Since</p>
              <p className="text-sm font-medium">{memberSince}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">License ID</p>
              <p className="text-sm font-medium font-mono">{user.licenseId || "Not set"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <UserIcon className="w-4 h-4 text-primary shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Total Animals Under Care</p>
              <p className="text-sm font-medium">{stats?.totalAnimals ?? 0}</p>
            </div>
          </div>
        </div>

        <div className="pt-4 space-y-2">
          <Button onClick={onOpenAccount} variant="outline" className="w-full justify-start gap-2" size="sm">
            <Settings className="w-4 h-4" /> Account Settings
          </Button>
          <Button onClick={onOpenPrefs} variant="outline" className="w-full justify-start gap-2" size="sm">
            <Bell className="w-4 h-4" /> Notification Preferences
          </Button>
          <Button
            onClick={handleSignOut}
            disabled={signingOut}
            variant="outline"
            className="w-full justify-start gap-2 text-destructive hover:text-destructive"
            size="sm"
          >
            {signingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
            Sign Out
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
