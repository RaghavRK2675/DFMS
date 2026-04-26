import { Link } from "react-router-dom";
import { useAdminUsers } from "@/hooks/useAudit";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, ShieldPlus, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";
import { ROLE_LABEL, Role } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";

const ALL_ROLES: Role[] = ["admin", "farmer", "veterinarian", "supervisor", "farm_worker", "inspector"];

export default function AdminUsersPage() {
  const { data: users, isLoading } = useAdminUsers();
  const qc = useQueryClient();
  const [pending, setPending] = useState<string | null>(null);

  const grant = async (userId: string, email: string | null, role: Role) => {
    setPending(userId + role);
    const { error } = await supabase.from("user_roles").insert({ user_id: userId, role });
    if (error) toast.error(error.message);
    else {
      toast.success(`Granted ${ROLE_LABEL[role]}`);
      await logAudit({ action: "role.grant", target_table: "user_roles", target_id: userId, summary: `Granted ${role} to ${email ?? userId}` });
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    }
    setPending(null);
  };

  const revoke = async (roleId: string, userEmail: string | null, role: string) => {
    setPending(roleId);
    const { error } = await supabase.from("user_roles").delete().eq("id", roleId);
    if (error) toast.error(error.message);
    else {
      toast.success("Role revoked");
      await logAudit({ action: "role.revoke", target_table: "user_roles", target_id: roleId, summary: `Revoked ${role} from ${userEmail ?? "user"}` });
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    }
    setPending(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="gradient-hero text-white px-6 py-5 shadow-elevated">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-display font-bold text-xl">User & Role Management</h1>
            <p className="text-white/70 text-xs">Assign roles to control access across the platform</p>
          </div>
          <Link to="/"><Button variant="secondary" size="sm" className="gap-2"><ArrowLeft className="w-4 h-4" /> Dashboard</Button></Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Users ({users?.length ?? 0})</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-12 flex justify-center"><Loader2 className="w-5 h-5 animate-spin" /></div>
            ) : (
              <div className="overflow-x-auto rounded-md border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-muted-foreground">
                    <tr>
                      <th className="text-left px-3 py-2">User</th>
                      <th className="text-left px-3 py-2">Farm</th>
                      <th className="text-left px-3 py-2">Roles</th>
                      <th className="text-left px-3 py-2">Grant</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(users ?? []).map((u) => (
                      <tr key={u.id} className="border-t align-top">
                        <td className="px-3 py-2">
                          <p className="font-medium">{u.name || u.email}</p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                        </td>
                        <td className="px-3 py-2 text-muted-foreground">{u.farm_name || "—"}</td>
                        <td className="px-3 py-2">
                          <div className="flex flex-wrap gap-1">
                            {u.roles.length === 0 && <span className="text-xs text-muted-foreground">None</span>}
                            {u.roles.map((r) => (
                              <Badge key={r.id} variant="secondary" className="gap-1">
                                {ROLE_LABEL[r.role as Role] ?? r.role}
                                <button
                                  onClick={() => revoke(r.id, u.email, r.role)}
                                  disabled={pending === r.id}
                                  className="hover:text-destructive"
                                  aria-label="Revoke"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <GrantRoleSelect
                            existing={u.roles.map((r) => r.role as Role)}
                            disabled={!!pending}
                            onGrant={(r) => grant(u.id, u.email, r)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function GrantRoleSelect({ existing, onGrant, disabled }: { existing: Role[]; onGrant: (r: Role) => void; disabled?: boolean }) {
  const [val, setVal] = useState<string>("");
  const available = ALL_ROLES.filter((r) => !existing.includes(r));
  if (available.length === 0) return <span className="text-xs text-muted-foreground">All roles assigned</span>;
  return (
    <div className="flex gap-2 items-center">
      <Select value={val} onValueChange={setVal}>
        <SelectTrigger className="w-44 h-8 text-xs"><SelectValue placeholder="Select role…" /></SelectTrigger>
        <SelectContent>
          {available.map((r) => <SelectItem key={r} value={r}>{ROLE_LABEL[r]}</SelectItem>)}
        </SelectContent>
      </Select>
      <Button
        size="sm"
        variant="outline"
        disabled={!val || disabled}
        onClick={() => { if (val) { onGrant(val as Role); setVal(""); } }}
        className="gap-1 h-8"
      >
        <ShieldPlus className="w-3 h-3" /> Grant
      </Button>
    </div>
  );
}
