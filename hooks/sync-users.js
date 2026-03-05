// api/cron/sync-users.js
// Vercel Cron Job — re-syncs Slack users nightly
// Schedule is set in vercel.json (see below)
// Vercel calls this automatically; you never need to run it manually.

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

function initials(name) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

function guessDepartment(profile) {
  const haystack = [profile.title || "", profile.fields?.Xf_DEPT?.value || ""]
    .join(" ").toLowerCase();
  if (haystack.includes("engineer") || haystack.includes("dev")) return "Engineering";
  if (haystack.includes("market") || haystack.includes("content")) return "Marketing";
  if (haystack.includes("operat") || haystack.includes("analyst")) return "Operations";
  if (haystack.includes("sales") || haystack.includes("account")) return "Sales";
  if (haystack.includes("design") || haystack.includes("ux")) return "Design";
  if (haystack.includes("hr") || haystack.includes("people")) return "HR";
  return "General";
}

async function fetchAllSlackUsers() {
  const users = [];
  let cursor;
  do {
    const params = new URLSearchParams({ limit: "200" });
    if (cursor) params.set("cursor", cursor);
    const res = await fetch(`https://slack.com/api/users.list?${params}`, {
      headers: { Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}` },
    });
    const data = await res.json();
    if (!data.ok) throw new Error(`Slack error: ${data.error}`);
    users.push(...data.members);
    cursor = data.response_metadata?.next_cursor;
  } while (cursor);
  return users;
}

export default async function handler(req, res) {
  // Protect against random web requests — Vercel signs cron calls
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const members = await fetchAllSlackUsers();
  const humans  = members.filter((m) => !m.is_bot && !m.deleted && m.id !== "USLACKBOT" && m.profile?.real_name);

  const rows = humans.map((m) => ({
    slack_user_id: m.id,
    name:          m.profile.real_name,
    role:          m.profile.title || "",
    department:    guessDepartment(m.profile),
    avatar:        initials(m.profile.real_name || "??"),
    pto_total:     20,
    pto_used:      0,
  }));

  const { error } = await supabase
    .from("employees")
    .upsert(rows, { onConflict: "slack_user_id", ignoreDuplicates: false });

  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ synced: rows.length });
}