import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface Props { open: boolean; onClose: () => void; }

export function NotificationPrefsDialog({ open, onClose }: Props) {
  const { user, setUser } = useAuth();
  if (!user) return null;
  const prefs = user.preferences;

  async function update(patch: Partial<typeof prefs>) {
    try {
      const { data } = await api.patch("/users/me/preferences", patch);
      setUser({ ...user, preferences: data.preferences });
      toast.success("Preferences saved");
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Save failed");
    }
  }

  const rows: { key: keyof typeof prefs; label: string; desc: string }[] = [
    { key: "emailAlerts", label: "Email alerts", desc: "Receive critical alerts by email." },
    { key: "pushAlerts", label: "Push notifications", desc: "Browser push when an alert fires." },
    { key: "smsAlerts", label: "SMS alerts", desc: "Text message for high-severity events." },
    { key: "criticalOnly", label: "Critical only", desc: "Suppress low/medium alerts." },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Notification Preferences</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          {rows.map((r) => (
            <div key={r.key} className="flex items-start justify-between gap-4 py-2 border-b last:border-0">
              <div>
                <Label className="text-sm font-medium">{r.label}</Label>
                <p className="text-xs text-muted-foreground">{r.desc}</p>
              </div>
              <Switch
                checked={prefs[r.key] as boolean}
                onCheckedChange={(v) => update({ [r.key]: v } as any)}
              />
            </div>
          ))}
          <div className="space-y-1.5 pt-2">
            <Label className="text-sm font-medium">Digest frequency</Label>
            <Select value={prefs.digestFrequency} onValueChange={(v: any) => update({ digestFrequency: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="realtime">Real-time</SelectItem>
                <SelectItem value="hourly">Hourly digest</SelectItem>
                <SelectItem value="daily">Daily digest</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
