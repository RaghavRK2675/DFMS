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
    await supabase.from("audit_logs").insert({
      actor_id: user.id,
      actor_email: user.email ?? null,
      action: entry.action,
      target_table: entry.target_table ?? null,
      target_id: entry.target_id ?? null,
      summary: entry.summary,
      metadata: entry.metadata ?? {},
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
    });
  } catch (err) {
    // Audit failures must never break user flows.
    console.warn("audit log failed", err);
  }
}
