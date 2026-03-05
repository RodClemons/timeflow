// api/slack/events.js
// Vercel Serverless Function — receives Slack Events API webhooks
// Deploy path: /api/slack/events

import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY   // use service key here (server-side only)
);

// ── Slack status emoji → leave type mapping ──────────────────
// Customise these to match your team's conventions
const STATUS_MAP = {
  // Vacation
  "🏖️": "vacation",  ":beach_with_umbrella:": "vacation",
  "✈️": "vacation",   ":airplane:": "vacation",
  "🌴": "vacation",   ":palm_tree:": "vacation",

  // Sick
  "🤒": "sick",       ":face_with_thermometer:": "sick",
  "🤧": "sick",       ":sneezing_face:": "sick",
  "🏥": "sick",       ":hospital:": "sick",

  // Personal
  "🌿": "personal",   ":herb:": "personal",
  "🧘": "personal",   ":person_in_lotus_position:": "personal",

  // WFH
  "🏠": "wfh",        ":house:": "wfh",
  "💻": "wfh",        ":computer:": "wfh",
  "🏡": "wfh",        ":house_with_garden:": "wfh",
};

// ── Verify the request is genuinely from Slack ───────────────
function verifySlackSignature(req, rawBody) {
  const signingSecret = process.env.SLACK_SIGNING_SECRET;
  const timestamp = req.headers["x-slack-request-timestamp"];
  const slackSig  = req.headers["x-slack-signature"];

  // Reject requests older than 5 minutes (replay attack prevention)
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - parseInt(timestamp)) > 300) return false;

  const sigBase = `v0:${timestamp}:${rawBody}`;
  const myHash  = "v0=" + crypto
    .createHmac("sha256", signingSecret)
    .update(sigBase, "utf8")
    .digest("hex");

  return crypto.timingSafeEqual(Buffer.from(myHash), Buffer.from(slackSig));
}

// ── Parse status into a leave request ────────────────────────
async function processStatusChange(slackUserId, profile) {
  const emoji      = profile.status_emoji;
  const text       = profile.status_text || "";
  const expiration = profile.status_expiration; // unix timestamp or 0

  // Log raw event for debugging
  await supabase.from("slack_status_log").insert({
    slack_user_id:    slackUserId,
    status_emoji:     emoji,
    status_text:      text,
    status_expiration: expiration,
    raw_payload:      profile,
  });

  const leaveType = STATUS_MAP[emoji];
  if (!leaveType) return; // emoji not in our map — ignore

  // Look up employee
  const { data: employee } = await supabase
    .from("employees")
    .select("id")
    .eq("slack_user_id", slackUserId)
    .single();

  if (!employee) return; // unknown Slack user

  const today = new Date().toISOString().split("T")[0];

  // If status has an expiration, use it as end date; otherwise default to today
  let endDate = today;
  if (expiration && expiration > 0) {
    endDate = new Date(expiration * 1000).toISOString().split("T")[0];
  }

  const days = Math.max(1, daysBetween(today, endDate));

  // Upsert: if there's already a pending/approved request for today, skip
  const { data: existing } = await supabase
    .from("pto_requests")
    .select("id")
    .eq("employee_id", employee.id)
    .eq("start_date", today)
    .in("status", ["pending", "approved"])
    .single();

  if (existing) return; // already have a request for today

  // Auto-create request (status as 'approved' since it came from Slack directly)
  await supabase.from("pto_requests").insert({
    employee_id: employee.id,
    type:        leaveType,
    start_date:  today,
    end_date:    endDate,
    days,
    note:        text || `Set via Slack status: ${emoji}`,
    status:      "approved",
  });
}

function daysBetween(start, end) {
  const s = new Date(start), e = new Date(end);
  return Math.round((e - s) / 86400000) + 1;
}

// ── Main handler ──────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end("Method Not Allowed");

  // Collect raw body for signature verification
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const rawBody = Buffer.concat(chunks).toString("utf8");
  const body    = JSON.parse(rawBody);

  // Slack URL verification challenge (one-time, when you first add the webhook)
  if (body.type === "url_verification") {
    return res.status(200).json({ challenge: body.challenge });
  }

  // Verify signature
  if (!verifySlackSignature(req, rawBody)) {
    return res.status(401).json({ error: "Invalid signature" });
  }

  // Handle profile change event
  if (body.event?.type === "user_profile_changed") {
    const user = body.event.user;
    await processStatusChange(user.id, user.profile);
  }

  res.status(200).json({ ok: true });
}

// Required for raw body access in Vercel
export const config = { api: { bodyParser: false } };