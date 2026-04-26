import { supabase } from "@/integrations/supabase/client";

export interface AuditEntry {
  action: string;
  summary: string;
  target_table?: string;
  target_id?: string;
  metadata?: Record<string, unknown>;
}

export async function logAudit(entry: AuditEntry) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const row = {
      actor_id: user.id,
      actor_email: user.email ?? undefined,
      action: entry.action,
      target_table: entry.target_table,
      target_id: entry.target_id,
      summary: entry.summary,
      metadata: (entry.metadata ?? {}) as never,
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
    };
    await supabase.from("audit_logs").insert(row as never);
  } catch (err) {
    // Audit failures must never break user flows.
    console.warn("audit log failed", err);
  }
}
