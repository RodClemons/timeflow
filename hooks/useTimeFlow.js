// hooks/useTimeFlow.js
// Drop-in data layer — replaces hardcoded INITIAL_EMPLOYEES
// Connects to Supabase and subscribes to realtime changes

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export function useTimeFlow() {
  const [employees, setEmployees]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  // ── Initial fetch ────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("employees")
      .select(`
        id, slack_user_id, name, role, department, avatar, pto_total, pto_used,
        pto_requests (
          id, type, start_date, end_date, days, note, status, submitted_at
        )
      `)
      .order("name");

    if (error) { setError(error.message); setLoading(false); return; }

    // Normalise to match the portal's shape
    setEmployees(data.map(normalise));
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Realtime subscription ────────────────────────────────────
  useEffect(() => {
    const channel = supabase
      .channel("timeflow-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "pto_requests" },
        () => fetchAll()   // re-fetch on any change
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "employees" },
        () => fetchAll()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchAll]);

  // ── Write helpers ────────────────────────────────────────────
  async function submitRequest(employeeId, { type, startDate, endDate, days, note }) {
    const { error } = await supabase.from("pto_requests").insert({
      employee_id: employeeId,
      type, days, note,
      start_date: startDate,
      end_date:   endDate,
      status:     "pending",
    });
    if (error) throw error;
  }

  async function updateStatus(requestId, status) {
    const { error } = await supabase
      .from("pto_requests")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", requestId);
    if (error) throw error;

    // Recalculate pto_used for the employee
    await recalcPtoUsed(requestId);
  }

  async function recalcPtoUsed(requestId) {
    // Get employee id from request
    const { data: req } = await supabase
      .from("pto_requests")
      .select("employee_id")
      .eq("id", requestId)
      .single();
    if (!req) return;

    const { data: approved } = await supabase
      .from("pto_requests")
      .select("days")
      .eq("employee_id", req.employee_id)
      .eq("status", "approved");

    const used = (approved || []).reduce((s, r) => s + r.days, 0);
    await supabase
      .from("employees")
      .update({ pto_used: used })
      .eq("id", req.employee_id);
  }

  return { employees, loading, error, submitRequest, updateStatus, refetch: fetchAll };
}

// ── Shape normaliser — matches what the portal expects ───────
function normalise(emp) {
  return {
    id:         emp.id,
    slackId:    emp.slack_user_id,
    name:       emp.name,
    role:       emp.role,
    dept:       emp.department,
    avatar:     emp.avatar,
    ptoTotal:   emp.pto_total,
    ptoUsed:    emp.pto_used,
    requests:   (emp.pto_requests || []).map(r => ({
      id:        r.id,
      type:      r.type,
      start:     r.start_date,
      end:       r.end_date,
      days:      r.days,
      note:      r.note,
      status:    r.status,
      submitted: r.submitted_at?.split("T")[0],
    })),
  };
}