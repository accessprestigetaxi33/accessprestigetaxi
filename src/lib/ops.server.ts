// Server-only : sauvegarde, newsletter (signatures de désinscription).
async function admin() {
  const { supabaseAdmin } = await import("@/lib/nova-supabase.server");
  return supabaseAdmin;
}

const BACKUP_TABLES = [
  "reservations",
  "clients",
  "courses",
  "avis",
  "reviews",
  "driver_expenses",
  "driver_unavailability",
  "accounting_settings",
  "driver_chat",
  "client_accounts",
  "devis",
  "reservation_messages",
] as const;
const KEEP = 8;

export async function runBackup(): Promise<{ path: string; rows: number }> {
  const db = await admin();
  const dump: Record<string, unknown[]> = {};
  let rows = 0;
  for (const t of BACKUP_TABLES) {
    const all: unknown[] = [];
    for (let from = 0; from < 50000; from += 1000) {
      const { data, error } = await db.from(t as never).select("*").range(from, from + 999);
      if (error) break;
      all.push(...(data ?? []));
      if (!data || data.length < 1000) break;
    }
    dump[t] = all;
    rows += all.length;
  }
  const path = `apt-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  const body = JSON.stringify({ created_at: new Date().toISOString(), tables: dump });
  const { error } = await db.storage
    .from("backups")
    .upload(path, new Blob([body], { type: "application/json" }), { contentType: "application/json" });
  if (error) throw new Error("backup_upload_failed");
  const { data: list } = await db.storage.from("backups").list("", { sortBy: { column: "name", order: "desc" } });
  const old = (list ?? []).filter((f) => f.name.endsWith(".json")).slice(KEEP).map((f) => f.name);
  if (old.length) await db.storage.from("backups").remove(old);
  return { path, rows };
}

export async function lastBackupAgeMs(): Promise<number> {
  const db = await admin();
  const { data } = await db.storage.from("backups").list("", { sortBy: { column: "name", order: "desc" }, limit: 5 });
  const f = (data ?? []).find((x) => x.name.endsWith(".json"));
  if (!f?.created_at) return Infinity;
  return Date.now() - new Date(f.created_at).getTime();
}

async function hmac(text: string): Promise<string> {
  const secret = process.env["WEBHOOK_SIGNING_SECRET"] || process.env["DRIVER_PANEL_TOKEN"] || "";
  if (!secret) throw new Error("no_secret");
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(text));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 32);
}

export async function unsubscribeSig(email: string) {
  return hmac(`unsub:${email.trim().toLowerCase()}`);
}

export async function verifyUnsubscribeSig(email: string, sig: string) {
  const expected = await unsubscribeSig(email);
  if (expected.length !== sig.length) return false;
  let diff = 0;
  for (let i = 0; i < sig.length; i++) diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
  return diff === 0;
}

export async function newsletterRecipients(): Promise<string[]> {
  const db = await admin();
  const { data } = await db
    .from("reservations")
    .select("email, client_email")
    .eq("newsletter_optin" as never, true as never)
    .limit(5000);
  const { data: unsub } = await db.from("newsletter_unsubscribes" as never).select("email");
  const blocked = new Set(((unsub ?? []) as { email: string }[]).map((u) => u.email.toLowerCase()));
  const set = new Set<string>();
  for (const r of (data ?? []) as { email: string | null; client_email: string | null }[]) {
    const e = (r.email || r.client_email || "").trim().toLowerCase();
    if (e && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e) && !blocked.has(e)) set.add(e);
  }
  return [...set];
}

function esc(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

export async function sendNewsletter(subject: string, body: string): Promise<number> {
  const key = process.env["RESEND_API_KEY"];
  if (!key) throw new Error("resend_missing");
  const recipients = await newsletterRecipients();
  let sent = 0;
  for (const to of recipients) {
    const sig = await unsubscribeSig(to);
    const unsub = `https://www.accessprestigetaxi.fr/api/public/newsletter-unsubscribe?e=${encodeURIComponent(to)}&s=${sig}`;
    const html = `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#111">
<h2 style="color:#b8913a">Access Taxi PBR</h2>
${esc(body).split(/\n{2,}/).map((p) => `<p>${p.replace(/\n/g, "<br>")}</p>`).join("")}
<p>Réservation : <a href="https://www.accessprestigetaxi.fr/reserver">accessprestigetaxi.fr</a> · 06 03 44 48 63</p>
<p style="font-size:12px;color:#777">Vous recevez cet e-mail car vous l'avez accepté lors d'une réservation. <a href="${unsub}">Se désinscrire</a></p></div>`;
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "Access Taxi PBR <contact@accessprestigetaxi.fr>",
        to: [to],
        subject,
        html,
        headers: { "List-Unsubscribe": `<${unsub}>` },
      }),
    });
    if (res.ok) sent++;
    await new Promise((r) => setTimeout(r, 250));
  }
  return sent;
}
