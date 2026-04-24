import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface Props { open: boolean; onClose: () => void; }

export function AccountSettingsDialog({ open, onClose }: Props) {
  const { user, setUser } = useAuth();
  const [tab, setTab] = useState<"profile" | "password">("profile");
  if (!user) return null;
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Account Settings</DialogTitle>
        </DialogHeader>
        <div className="flex gap-2 border-b">
          {(["profile", "password"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-2 text-sm font-medium ${tab === t ? "border-b-2 border-primary text-foreground" : "text-muted-foreground"}`}
            >
              {t === "profile" ? "Profile" : "Password"}
            </button>
          ))}
        </div>
        {tab === "profile" ? <ProfileForm user={user} setUser={setUser} /> : <PasswordForm />}
      </DialogContent>
    </Dialog>
  );
}

function ProfileForm({ user, setUser }: any) {
  const [name, setName] = useState(user.name);
  const [farmName, setFarmName] = useState(user.farmName);
  const [location, setLocation] = useState(user.location);
  const [phone, setPhone] = useState(user.phone);
  const [licenseId, setLicenseId] = useState(user.licenseId);
  const [saving, setSaving] = useState(false);
  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.patch("/users/me", { name, farmName, location, phone, licenseId });
      setUser(data.user);
      toast.success("Profile updated");
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Update failed");
    } finally { setSaving(false); }
  }
  return (
    <form onSubmit={save} className="space-y-3 mt-4">
      <Field label="Name"><Input value={name} onChange={(e) => setName(e.target.value)} required /></Field>
      <Field label="Farm name"><Input value={farmName} onChange={(e) => setFarmName(e.target.value)} /></Field>
      <Field label="Location"><Input value={location} onChange={(e) => setLocation(e.target.value)} /></Field>
      <Field label="Phone"><Input value={phone} onChange={(e) => setPhone(e.target.value)} /></Field>
      <Field label="License ID"><Input value={licenseId} onChange={(e) => setLicenseId(e.target.value)} /></Field>
      <Field label="Email (read-only)"><Input value={user.email} disabled /></Field>
      <Button type="submit" disabled={saving} className="w-full">
        {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Save changes
      </Button>
    </form>
  );
}

function PasswordForm() {
  const [cur, setCur] = useState("");
  const [next, setNext] = useState("");
  const [saving, setSaving] = useState(false);
  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/users/me/change-password", { currentPassword: cur, newPassword: next });
      toast.success("Password updated");
      setCur(""); setNext("");
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Password change failed");
    } finally { setSaving(false); }
  }
  return (
    <form onSubmit={save} className="space-y-3 mt-4">
      <Field label="Current password"><Input type="password" value={cur} onChange={(e) => setCur(e.target.value)} required /></Field>
      <Field label="New password (min 8 chars)"><Input type="password" minLength={8} value={next} onChange={(e) => setNext(e.target.value)} required /></Field>
      <Button type="submit" disabled={saving} className="w-full">
        {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Update password
      </Button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
