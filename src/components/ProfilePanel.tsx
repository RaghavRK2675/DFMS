import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  User, Phone, Mail, MapPin, Building2, ShieldCheck,
  Clock, LogOut, Settings, Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  open: boolean;
  onClose: () => void;
}

const farmer = {
  name: "Ramesh Kumar Singh",
  role: "Farm Owner & Manager",
  farmName: "Sri Govind Agro Farm",
  location: "Phagwara, Punjab, India",
  phone: "+91 94170 XXXXX",
  email: "ramesh.farm@lpu.ac.in",
  since: "DFMS User since Jan 2024",
  licenseId: "DFMS-LPU-0056",
  pens: ["Pen A", "Pen B", "Pen C", "House 1", "House 2"],
  totalAnimals: 248,
  certifications: ["Biosecurity Level 2", "Animal Welfare Certified"],
};

export function ProfilePanel({ open, onClose }: Props) {
  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-80 sm:w-96 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Farmer Profile</SheetTitle>
        </SheetHeader>

        {/* Avatar + name */}
        <div className="flex flex-col items-center pt-4 pb-6 border-b">
          <Avatar className="w-20 h-20 text-lg">
            <AvatarFallback className="bg-primary text-primary-foreground font-display font-bold text-xl">RK</AvatarFallback>
          </Avatar>
          <h3 className="font-display font-bold text-foreground text-lg mt-3">{farmer.name}</h3>
          <p className="text-sm text-muted-foreground">{farmer.role}</p>
          <span className="mt-2 flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full font-medium">
            <ShieldCheck className="w-3.5 h-3.5" /> DFMS Verified
          </span>
        </div>

        {/* Farm info */}
        <div className="py-4 border-b space-y-3">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Farm Information</h4>
          {[
            { icon: Building2, label: "Farm Name", value: farmer.farmName },
            { icon: MapPin, label: "Location", value: farmer.location },
            { icon: Phone, label: "Phone", value: farmer.phone },
            { icon: Mail, label: "Email", value: farmer.email },
          ].map(item => (
            <div key={item.label} className="flex items-start gap-3">
              <item.icon className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="text-sm font-medium text-foreground">{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* DFMS info */}
        <div className="py-4 border-b space-y-3">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">DFMS Account</h4>
          <div className="flex items-center gap-3">
            <Clock className="w-4 h-4 text-primary shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Member Since</p>
              <p className="text-sm font-medium">{farmer.since}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">License ID</p>
              <p className="text-sm font-medium font-mono">{farmer.licenseId}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <User className="w-4 h-4 text-primary shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Total Animals Under Care</p>
              <p className="text-sm font-medium">{farmer.totalAnimals}</p>
            </div>
          </div>
        </div>

        {/* Pens */}
        <div className="py-4 border-b">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Managed Pens & Houses</h4>
          <div className="flex flex-wrap gap-2">
            {farmer.pens.map(p => (
              <span key={p} className="text-xs font-medium bg-muted text-foreground px-3 py-1 rounded-full border">{p}</span>
            ))}
          </div>
        </div>

        {/* Certifications */}
        <div className="py-4 border-b">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Certifications</h4>
          {farmer.certifications.map(c => (
            <div key={c} className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="text-sm text-foreground">{c}</span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="pt-4 space-y-2">
          <Button variant="outline" className="w-full justify-start gap-2" size="sm">
            <Settings className="w-4 h-4" /> Account Settings
          </Button>
          <Button variant="outline" className="w-full justify-start gap-2" size="sm">
            <Bell className="w-4 h-4" /> Notification Preferences
          </Button>
          <Button variant="outline" className="w-full justify-start gap-2 text-destructive hover:text-destructive" size="sm">
            <LogOut className="w-4 h-4" /> Sign Out
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
