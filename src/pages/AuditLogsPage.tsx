import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuditLogs } from "@/hooks/useAudit";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, Search } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function AuditLogsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const { data: logs, isLoading } = useAuditLogs(500);
  const [q, setQ] = useState("");

  const filtered = (logs ?? []).filter((l) =>
    !q || `${l.action} ${l.summary} ${l.actor_email ?? ""}`.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="gradient-hero text-white px-6 py-5 shadow-elevated">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-display font-bold text-xl">Audit Logs</h1>
            <p className="text-white/70 text-xs">{isAdmin ? "All platform activity" : "Your activity history"}</p>
          </div>
          <Link to="/"><Button variant="secondary" size="sm" className="gap-2"><ArrowLeft className="w-4 h-4" /> Dashboard</Button></Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span>Activity</span>
              <Badge variant="secondary">{filtered.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search action, summary, user…" className="pl-9" />
            </div>

            {isLoading ? (
              <div className="py-12 flex justify-center"><Loader2 className="w-5 h-5 animate-spin" /></div>
            ) : filtered.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">No activity recorded yet.</p>
            ) : (
              <div className="overflow-x-auto rounded-md border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-muted-foreground">
                    <tr>
                      <th className="text-left px-3 py-2">When</th>
                      <th className="text-left px-3 py-2">Action</th>
                      <th className="text-left px-3 py-2">Summary</th>
                      {isAdmin && <th className="text-left px-3 py-2">Actor</th>}
                      <th className="text-left px-3 py-2">Target</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((l) => (
                      <tr key={l.id} className="border-t">
                        <td className="px-3 py-2 whitespace-nowrap text-muted-foreground">{new Date(l.created_at).toLocaleString("en-IN")}</td>
                        <td className="px-3 py-2"><Badge variant="outline" className="font-mono text-xs">{l.action}</Badge></td>
                        <td className="px-3 py-2">{l.summary}</td>
                        {isAdmin && <td className="px-3 py-2 text-muted-foreground">{l.actor_email ?? "—"}</td>}
                        <td className="px-3 py-2 text-muted-foreground">{l.target_table ? `${l.target_table}` : "—"}</td>
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
