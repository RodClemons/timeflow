"use client";
// @ts-nocheck
import { useState, useEffect } from "react";

const DEPARTMENTS = ["Engineering", "Marketing", "Operations", "Sales", "Design", "HR"];

const INITIAL_EMPLOYEES = [
  { id: 1, name: "Alex Rivera", dept: "Engineering", role: "Senior Dev", avatar: "AR", ptoTotal: 20, ptoUsed: 5, requests: [] },
  { id: 2, name: "Jordan Lee", dept: "Engineering", role: "Backend Dev", avatar: "JL", ptoTotal: 20, ptoUsed: 8, requests: [] },
  { id: 3, name: "Sam Chen", dept: "Marketing", role: "Campaign Mgr", avatar: "SC", ptoTotal: 15, ptoUsed: 3, requests: [] },
  { id: 4, name: "Taylor Kim", dept: "Marketing", role: "Content Lead", avatar: "TK", ptoTotal: 15, ptoUsed: 12, requests: [] },
  { id: 5, name: "Morgan Davis", dept: "Operations", role: "Ops Lead", avatar: "MD", ptoTotal: 18, ptoUsed: 2, requests: [] },
  { id: 6, name: "Casey Brown", dept: "Operations", role: "Analyst", avatar: "CB", ptoTotal: 18, ptoUsed: 9, requests: [] },
  { id: 7, name: "Riley Johnson", dept: "Sales", role: "Account Exec", avatar: "RJ", ptoTotal: 20, ptoUsed: 14, requests: [] },
  { id: 8, name: "Avery Wilson", dept: "Sales", role: "Sales Rep", avatar: "AW", ptoTotal: 20, ptoUsed: 6, requests: [] },
  { id: 9, name: "Quinn Martinez", dept: "Design", role: "UX Designer", avatar: "QM", ptoTotal: 15, ptoUsed: 4, requests: [] },
  { id: 10, name: "Drew Thompson", dept: "HR", role: "HR Manager", avatar: "DT", ptoTotal: 18, ptoUsed: 7, requests: [] },
];

const LEAVE_TYPES = [
  { id: "vacation", label: "Vacation", color: "#6ee7b7", bg: "rgba(110,231,183,0.12)" },
  { id: "sick", label: "Sick Leave", color: "#fca5a5", bg: "rgba(252,165,165,0.12)" },
  { id: "personal", label: "Personal", color: "#93c5fd", bg: "rgba(147,197,253,0.12)" },
  { id: "wfh", label: "Work From Home", color: "#d8b4fe", bg: "rgba(216,180,254,0.12)" },
];

const STATUS_STYLES = {
  pending:  { color: "#fbbf24", bg: "rgba(251,191,36,0.1)",  label: "Pending" },
  approved: { color: "#6ee7b7", bg: "rgba(110,231,183,0.1)", label: "Approved" },
  denied:   { color: "#fca5a5", bg: "rgba(252,165,165,0.1)", label: "Denied" },
};

function getDaysArray(start, end) {
  const days = [];
  const cur = new Date(start);
  const endD = new Date(end);
  while (cur.getTime() <= endD.getTime()) {
    days.push(new Date(cur).toISOString().split("T")[0]);
    cur.setDate(cur.getDate() + 1);
  }
  return days;
}

function diffDays(start, end) {
  const s = new Date(start).getTime(), e = new Date(end).getTime();
  return Math.round((e - s) / 86400000) + 1;
}

function todayStr() { return new Date().toISOString().split("T")[0]; }

function MonthCalendar({ year, month, employees, selectedDept }) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];

  const filtered = selectedDept === "All" ? employees : employees.filter(e => e.dept === selectedDept);

  function getEventsForDay(day) {
    const dateStr = `${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
    const events = [];
    filtered.forEach(emp => {
      emp.requests.forEach(r => {
        if (r.status === "approved") {
          const days = getDaysArray(r.start, r.end);
          if (days.includes(dateStr)) {
            const lt = LEAVE_TYPES.find(l => l.id === r.type);
            events.push({ name: emp.name.split(" ")[0], color: lt?.color || "#6ee7b7", avatar: emp.avatar });
          }
        }
      });
    });
    return events;
  }

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: "2px", marginBottom: 8 }}>
        {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
          <div key={d} style={{ textAlign: "center", fontSize: 11, fontWeight: 600, color: "#64748b", padding: "4px 0", letterSpacing: "0.05em" }}>{d}</div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: "2px" }}>
        {cells.map((day, i) => {
          const events = day ? getEventsForDay(day) : [];
          const isToday = isCurrentMonth && day === today.getDate();
          return (
            <div key={i} style={{
              minHeight: 72,
              background: day ? (isToday ? "rgba(110,231,183,0.08)" : "rgba(255,255,255,0.02)") : "transparent",
              border: isToday ? "1px solid rgba(110,231,183,0.3)" : "1px solid rgba(255,255,255,0.04)",
              borderRadius: 8,
              padding: "6px 4px 4px",
              transition: "background 0.2s",
            }}>
              {day && (
                <>
                  <div style={{ fontSize: 11, fontWeight: isToday ? 700 : 400, color: isToday ? "#6ee7b7" : "#94a3b8", textAlign: "right", marginBottom: 3 }}>{day}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {events.slice(0,3).map((ev, ei) => (
                      <div key={ei} style={{ fontSize: 9, fontWeight: 600, color: ev.color, background: `${ev.color}18`, borderRadius: 4, padding: "1px 4px", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                        {ev.name}
                      </div>
                    ))}
                    {events.length > 3 && <div style={{ fontSize: 9, color: "#64748b" }}>+{events.length - 3} more</div>}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function PTOPortal() {
  const [view, setView] = useState("dashboard"); // dashboard | manager | request | my
  const [employees, setEmployees] = useState(INITIAL_EMPLOYEES);
  const [selectedDept, setSelectedDept] = useState("All");
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [currentUser] = useState(employees[0]);
  const [notification, setNotification] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");

  // Request form
  const [reqForm, setReqForm] = useState({ type: "vacation", start: todayStr(), end: todayStr(), note: "" });

  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];

  function showNotif(msg, type = "success") {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  }

  function submitRequest() {
    if (!reqForm.start || !reqForm.end || reqForm.start > reqForm.end) {
      showNotif("Invalid date range", "error"); return;
    }
    const days = diffDays(reqForm.start, reqForm.end);
    const newReq = { id: Date.now(), ...reqForm, days, status: "pending", submitted: todayStr() };
    setEmployees(prev => prev.map(e => e.id === currentUser.id ? { ...e, requests: [...e.requests, newReq] } : e));
    setReqForm({ type: "vacation", start: todayStr(), end: todayStr(), note: "" });
    showNotif("Request submitted successfully!");
    setView("my");
  }

  function updateStatus(empId, reqId, status) {
    setEmployees(prev => prev.map(e => {
      if (e.id !== empId) return e;
      const updatedReqs = e.requests.map(r => r.id === reqId ? { ...r, status } : r);
      const approvedDays = updatedReqs.filter(r => r.status === "approved").reduce((s, r) => s + r.days, 0);
      return { ...e, requests: updatedReqs, ptoUsed: approvedDays };
    }));
    showNotif(`Request ${status}`);
  }

  const deptEmployees = selectedDept === "All" ? employees : employees.filter(e => e.dept === selectedDept);
  const allRequests = employees.flatMap(e => e.requests.map(r => ({ ...r, empName: e.name, empId: e.id, dept: e.dept, avatar: e.avatar })));
  const filteredRequests = allRequests.filter(r => {
    const deptMatch = selectedDept === "All" || r.dept === selectedDept;
    const statusMatch = filterStatus === "all" || r.status === filterStatus;
    return deptMatch && statusMatch;
  });

  const myEmployee = employees.find(e => e.id === currentUser.id);
  const myRequests = myEmployee?.requests || [];
  const myPtoRemaining = myEmployee ? myEmployee.ptoTotal - myEmployee.ptoUsed : 0;

  // Who's out today
  const outToday = employees.filter(e =>
    e.requests.some(r => r.status === "approved" && getDaysArray(r.start, r.end).includes(todayStr()))
  );

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "⊞" },
    { id: "my", label: "My Time Off", icon: "◎" },
    { id: "request", label: "New Request", icon: "+" },
    { id: "manager", label: "Manager View", icon: "⊙" },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: "#080c14",
      fontFamily: "'DM Sans', sans-serif",
      color: "#e2e8f0",
      display: "flex",
    }}>
      {/* Import fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,300&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 2px; }
        input, textarea, select { outline: none; } button { cursor: pointer; border: none; background: none; }
        .nav-item { transition: all 0.2s; }
        .nav-item:hover { background: rgba(255,255,255,0.06) !important; }
        .nav-item.active { background: rgba(110,231,183,0.08) !important; }
        .card { transition: transform 0.2s, box-shadow 0.2s; }
        .card:hover { transform: translateY(-1px); }
        .btn-primary { transition: all 0.2s; }
        .btn-primary:hover { filter: brightness(1.1); transform: translateY(-1px); }
        .status-btn { transition: all 0.15s; }
        .status-btn:hover { opacity: 0.85; transform: scale(0.97); }
      `}</style>

      {/* Sidebar */}
      <div style={{
        width: 220,
        background: "rgba(255,255,255,0.025)",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        display: "flex",
        flexDirection: "column",
        padding: "28px 0",
        position: "sticky",
        top: 0,
        height: "100vh",
      }}>
        <div style={{ padding: "0 20px 28px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: "linear-gradient(135deg, #6ee7b7, #3b82f6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, fontWeight: 700, color: "#080c14",
            }}>T</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#f1f5f9", letterSpacing: "-0.02em" }}>TimeFlow</div>
              <div style={{ fontSize: 10, color: "#475569", letterSpacing: "0.05em" }}>PTO PORTAL</div>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: "0 10px", display: "flex", flexDirection: "column", gap: 2 }}>
          {navItems.map(item => (
            <button
              key={item.id}
              className={`nav-item${view === item.id ? " active" : ""}`}
              onClick={() => setView(item.id)}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 12px", borderRadius: 8,
                color: view === item.id ? "#6ee7b7" : "#64748b",
                fontSize: 13, fontWeight: view === item.id ? 600 : 400,
                textAlign: "left", width: "100%",
                border: view === item.id ? "1px solid rgba(110,231,183,0.15)" : "1px solid transparent",
              }}
            >
              <span style={{ fontSize: 16, lineHeight: 1 }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Current user */}
        <div style={{ padding: "16px 16px 0", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: "50%",
              background: "linear-gradient(135deg, #6ee7b7, #3b82f6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 700, color: "#080c14",
            }}>{currentUser.avatar}</div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#cbd5e1" }}>{currentUser.name}</div>
              <div style={{ fontSize: 10, color: "#475569" }}>{currentUser.role}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: "32px", overflowY: "auto", maxHeight: "100vh" }}>

        {/* Notification */}
        {notification && (
          <div style={{
            position: "fixed", top: 24, right: 24, zIndex: 999,
            background: notification.type === "error" ? "rgba(252,165,165,0.15)" : "rgba(110,231,183,0.15)",
            border: `1px solid ${notification.type === "error" ? "rgba(252,165,165,0.3)" : "rgba(110,231,183,0.3)"}`,
            borderRadius: 10, padding: "12px 20px",
            color: notification.type === "error" ? "#fca5a5" : "#6ee7b7",
            fontSize: 13, fontWeight: 500,
            backdropFilter: "blur(12px)",
            animation: "fadeIn 0.3s ease",
          }}>
            {notification.msg}
          </div>
        )}

        {/* DASHBOARD */}
        {view === "dashboard" && (
          <div>
            <div style={{ marginBottom: 28 }}>
              <h1 style={{ fontSize: 26, fontWeight: 700, color: "#f1f5f9", letterSpacing: "-0.03em", marginBottom: 4 }}>Good morning, {currentUser.name.split(" ")[0]} 👋</h1>
              <p style={{ color: "#475569", fontSize: 13 }}>{new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
            </div>

            {/* Stats row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
              {[
                { label: "PTO Remaining", value: myPtoRemaining, sub: `of ${myEmployee?.ptoTotal} days`, color: "#6ee7b7" },
                { label: "Days Used", value: myEmployee?.ptoUsed || 0, sub: "this year", color: "#93c5fd" },
                { label: "Pending Requests", value: myRequests.filter(r => r.status === "pending").length, sub: "awaiting approval", color: "#fbbf24" },
                { label: "Out Today", value: outToday.length, sub: "team members", color: "#f472b6" },
              ].map((stat, i) => (
                <div key={i} className="card" style={{
                  background: "rgba(255,255,255,0.025)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 12, padding: "20px",
                }}>
                  <div style={{ fontSize: 11, color: "#475569", letterSpacing: "0.05em", fontWeight: 500, marginBottom: 8, textTransform: "uppercase" }}>{stat.label}</div>
                  <div style={{ fontSize: 32, fontWeight: 700, color: stat.color, letterSpacing: "-0.04em", lineHeight: 1, marginBottom: 4 }}>{stat.value}</div>
                  <div style={{ fontSize: 11, color: "#334155" }}>{stat.sub}</div>
                </div>
              ))}
            </div>

            {/* PTO Balance bar */}
            <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: 20, marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#cbd5e1" }}>Your PTO Balance</span>
                <span style={{ fontSize: 12, color: "#475569", fontFamily: "'DM Mono', monospace" }}>{myEmployee?.ptoUsed}/{myEmployee?.ptoTotal} days used</span>
              </div>
              <div style={{ height: 8, background: "rgba(255,255,255,0.06)", borderRadius: 99 }}>
                <div style={{
                  height: "100%", borderRadius: 99,
                  width: `${((myEmployee?.ptoUsed || 0) / (myEmployee?.ptoTotal || 1)) * 100}%`,
                  background: "linear-gradient(90deg, #6ee7b7, #3b82f6)",
                  transition: "width 0.6s ease",
                }} />
              </div>
              <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
                {LEAVE_TYPES.map(lt => (
                  <div key={lt.id} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#475569" }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: lt.color }} />
                    {lt.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Calendar */}
            <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h2 style={{ fontSize: 15, fontWeight: 600, color: "#cbd5e1" }}>Team Calendar — {monthNames[calMonth]} {calYear}</h2>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <select value={selectedDept} onChange={e => setSelectedDept(e.target.value)} style={{
                    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                    color: "#94a3b8", borderRadius: 7, padding: "5px 10px", fontSize: 12,
                  }}>
                    <option>All</option>
                    {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                  </select>
                  <button onClick={() => { const d = new Date(calYear, calMonth - 1); setCalMonth(d.getMonth()); setCalYear(d.getFullYear()); }} style={{ color: "#64748b", fontSize: 16, padding: "4px 10px", borderRadius: 6, background: "rgba(255,255,255,0.04)" }}>‹</button>
                  <button onClick={() => { const d = new Date(calYear, calMonth + 1); setCalMonth(d.getMonth()); setCalYear(d.getFullYear()); }} style={{ color: "#64748b", fontSize: 16, padding: "4px 10px", borderRadius: 6, background: "rgba(255,255,255,0.04)" }}>›</button>
                </div>
              </div>
              <MonthCalendar year={calYear} month={calMonth} employees={employees} selectedDept={selectedDept} />
            </div>

            {/* Who's out today */}
            {outToday.length > 0 && (
              <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: 20, marginTop: 24 }}>
                <h2 style={{ fontSize: 13, fontWeight: 600, color: "#64748b", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 14 }}>Out Today</h2>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                  {outToday.map(e => {
                    const req = e.requests.find(r => r.status === "approved" && getDaysArray(r.start, r.end).includes(todayStr()));
                    const lt = LEAVE_TYPES.find(l => l.id === req?.type);
                    return (
                      <div key={e.id} style={{ display: "flex", alignItems: "center", gap: 8, background: lt?.bg || "rgba(110,231,183,0.08)", border: `1px solid ${lt?.color || "#6ee7b7"}30`, borderRadius: 8, padding: "8px 12px" }}>
                        <div style={{ width: 26, height: 26, borderRadius: "50%", background: lt?.color + "30", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: lt?.color }}>{e.avatar}</div>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: "#cbd5e1" }}>{e.name}</div>
                          <div style={{ fontSize: 10, color: lt?.color || "#6ee7b7" }}>{lt?.label}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* MY TIME OFF */}
        {view === "my" && (
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "#f1f5f9", letterSpacing: "-0.03em", marginBottom: 6 }}>My Time Off</h1>
            <p style={{ color: "#475569", fontSize: 13, marginBottom: 28 }}>Your leave history and upcoming time off</p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 28 }}>
              {LEAVE_TYPES.slice(0,3).map(lt => {
                const used = myRequests.filter(r => r.type === lt.id && r.status === "approved").reduce((s,r)=>s+r.days,0);
                return (
                  <div key={lt.id} style={{ background: lt.bg, border: `1px solid ${lt.color}25`, borderRadius: 10, padding: "16px" }}>
                    <div style={{ fontSize: 10, color: lt.color, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>{lt.label}</div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: lt.color }}>{used}</div>
                    <div style={{ fontSize: 10, color: "#475569" }}>days taken</div>
                  </div>
                );
              })}
            </div>

            {myRequests.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 0", color: "#334155" }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>📅</div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>No requests yet</div>
                <div style={{ fontSize: 12, marginTop: 6 }}>Submit your first time off request</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[...myRequests].reverse().map(req => {
                  const lt = LEAVE_TYPES.find(l => l.id === req.type);
                  const ss = STATUS_STYLES[req.status];
                  return (
                    <div key={req.id} style={{
                      background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)",
                      borderRadius: 10, padding: "16px 18px",
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: lt?.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
                          {req.type === "vacation" ? "🏖️" : req.type === "sick" ? "🤒" : req.type === "personal" ? "🌿" : "🏠"}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{lt?.label}</div>
                          <div style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>
                            {req.start} → {req.end} · {req.days} day{req.days !== 1 ? "s" : ""}
                          </div>
                          {req.note && <div style={{ fontSize: 11, color: "#334155", marginTop: 2, fontStyle: "italic" }}>"{req.note}"</div>}
                        </div>
                      </div>
                      <div style={{ background: ss.bg, color: ss.color, border: `1px solid ${ss.color}30`, borderRadius: 20, padding: "4px 12px", fontSize: 11, fontWeight: 600 }}>
                        {ss.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* NEW REQUEST */}
        {view === "request" && (
          <div style={{ maxWidth: 520 }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "#f1f5f9", letterSpacing: "-0.03em", marginBottom: 6 }}>New Request</h1>
            <p style={{ color: "#475569", fontSize: 13, marginBottom: 32 }}>Submit a time off or WFH request</p>

            <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 28, display: "flex", flexDirection: "column", gap: 22 }}>
              {/* Leave type */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 10 }}>Leave Type</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8 }}>
                  {LEAVE_TYPES.map(lt => (
                    <button key={lt.id} onClick={() => setReqForm(f => ({...f, type: lt.id}))} style={{
                      padding: "10px 14px", borderRadius: 8, textAlign: "left",
                      background: reqForm.type === lt.id ? lt.bg : "rgba(255,255,255,0.03)",
                      border: `1px solid ${reqForm.type === lt.id ? lt.color + "50" : "rgba(255,255,255,0.08)"}`,
                      color: reqForm.type === lt.id ? lt.color : "#64748b",
                      fontSize: 12, fontWeight: reqForm.type === lt.id ? 600 : 400,
                      transition: "all 0.15s",
                    }}>
                      {lt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dates */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                {[["Start Date", "start"], ["End Date", "end"]].map(([label, key]) => (
                  <div key={key}>
                    <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 8 }}>{label}</label>
                    <input type="date" value={reqForm[key]} onChange={e => setReqForm(f => ({...f, [key]: e.target.value}))} style={{
                      width: "100%", padding: "10px 12px", borderRadius: 8,
                      background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                      color: "#e2e8f0", fontSize: 13,
                    }} />
                  </div>
                ))}
              </div>

              {reqForm.start && reqForm.end && reqForm.start <= reqForm.end && (
                <div style={{ background: "rgba(110,231,183,0.06)", border: "1px solid rgba(110,231,183,0.15)", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#6ee7b7" }}>
                  ✓ {diffDays(reqForm.start, reqForm.end)} day{diffDays(reqForm.start, reqForm.end) !== 1 ? "s" : ""} selected
                </div>
              )}

              {/* Note */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 8 }}>Note (optional)</label>
                <textarea value={reqForm.note} onChange={e => setReqForm(f => ({...f, note: e.target.value}))} placeholder="Any context for your manager..." rows={3} style={{
                  width: "100%", padding: "10px 12px", borderRadius: 8,
                  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                  color: "#e2e8f0", fontSize: 13, resize: "vertical", fontFamily: "inherit",
                }} />
              </div>

              <button className="btn-primary" onClick={submitRequest} style={{
                background: "linear-gradient(135deg, #6ee7b7, #3b82f6)",
                color: "#080c14", fontWeight: 700, fontSize: 13,
                padding: "12px", borderRadius: 8, letterSpacing: "0.02em",
              }}>
                Submit Request
              </button>
            </div>
          </div>
        )}

        {/* MANAGER VIEW */}
        {view === "manager" && (
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "#f1f5f9", letterSpacing: "-0.03em", marginBottom: 6 }}>Manager View</h1>
            <p style={{ color: "#475569", fontSize: 13, marginBottom: 24 }}>Review and approve team requests by department</p>

            {/* Filters */}
            <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
              <div style={{ display: "flex", gap: 6 }}>
                {["All", ...DEPARTMENTS].map(d => (
                  <button key={d} onClick={() => setSelectedDept(d)} style={{
                    padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 500,
                    background: selectedDept === d ? "rgba(110,231,183,0.12)" : "rgba(255,255,255,0.04)",
                    border: `1px solid ${selectedDept === d ? "rgba(110,231,183,0.3)" : "rgba(255,255,255,0.07)"}`,
                    color: selectedDept === d ? "#6ee7b7" : "#475569",
                    transition: "all 0.15s",
                  }}>{d}</button>
                ))}
              </div>
              <div style={{ display: "flex", gap: 6, marginLeft: "auto" }}>
                {["all","pending","approved","denied"].map(s => (
                  <button key={s} onClick={() => setFilterStatus(s)} style={{
                    padding: "6px 12px", borderRadius: 20, fontSize: 11, fontWeight: 500,
                    background: filterStatus === s ? STATUS_STYLES[s]?.bg || "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.03)",
                    border: `1px solid ${filterStatus === s ? (STATUS_STYLES[s]?.color || "#94a3b8") + "40" : "rgba(255,255,255,0.06)"}`,
                    color: filterStatus === s ? (STATUS_STYLES[s]?.color || "#94a3b8") : "#334155",
                    textTransform: "capitalize", transition: "all 0.15s",
                  }}>{s}</button>
                ))}
              </div>
            </div>

            {/* Department summary cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 24 }}>
              {DEPARTMENTS.filter(d => selectedDept === "All" || d === selectedDept).map(dept => {
                const deptEmps = employees.filter(e => e.dept === dept);
                const outNow = deptEmps.filter(e => e.requests.some(r => r.status === "approved" && getDaysArray(r.start, r.end).includes(todayStr())));
                const pending = deptEmps.flatMap(e => e.requests).filter(r => r.status === "pending").length;
                return (
                  <div key={dept} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "14px 16px" }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8", marginBottom: 10 }}>{dept}</div>
                    <div style={{ display: "flex", gap: 16 }}>
                      <div><div style={{ fontSize: 18, fontWeight: 700, color: "#f472b6" }}>{outNow.length}</div><div style={{ fontSize: 10, color: "#334155" }}>out today</div></div>
                      <div><div style={{ fontSize: 18, fontWeight: 700, color: "#fbbf24" }}>{pending}</div><div style={{ fontSize: 10, color: "#334155" }}>pending</div></div>
                      <div><div style={{ fontSize: 18, fontWeight: 700, color: "#64748b" }}>{deptEmps.length}</div><div style={{ fontSize: 10, color: "#334155" }}>total</div></div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Requests list */}
            {filteredRequests.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px", color: "#334155" }}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>✓</div>
                <div style={{ fontSize: 14 }}>No requests match the current filter</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {filteredRequests.map(req => {
                  const lt = LEAVE_TYPES.find(l => l.id === req.type);
                  const ss = STATUS_STYLES[req.status];
                  return (
                    <div key={req.id} style={{
                      background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)",
                      borderRadius: 10, padding: "14px 18px",
                      display: "flex", alignItems: "center", gap: 14,
                    }}>
                      <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#64748b", flexShrink: 0 }}>
                        {req.avatar}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{req.empName}</span>
                          <span style={{ fontSize: 10, color: "#334155", background: "rgba(255,255,255,0.05)", padding: "2px 7px", borderRadius: 20 }}>{req.dept}</span>
                        </div>
                        <div style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>
                          {lt?.label} · {req.start} → {req.end} · {req.days} day{req.days !== 1 ? "s" : ""}
                          {req.note && <span style={{ fontStyle: "italic", marginLeft: 6, color: "#334155" }}>"{req.note}"</span>}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
                        {req.status === "pending" ? (
                          <>
                            <button className="status-btn" onClick={() => updateStatus(req.empId, req.id, "approved")} style={{
                              background: "rgba(110,231,183,0.12)", color: "#6ee7b7", border: "1px solid rgba(110,231,183,0.25)",
                              borderRadius: 7, padding: "5px 14px", fontSize: 11, fontWeight: 600,
                            }}>Approve</button>
                            <button className="status-btn" onClick={() => updateStatus(req.empId, req.id, "denied")} style={{
                              background: "rgba(252,165,165,0.1)", color: "#fca5a5", border: "1px solid rgba(252,165,165,0.2)",
                              borderRadius: 7, padding: "5px 14px", fontSize: 11, fontWeight: 600,
                            }}>Deny</button>
                          </>
                        ) : (
                          <div style={{ background: ss.bg, color: ss.color, border: `1px solid ${ss.color}30`, borderRadius: 20, padding: "4px 12px", fontSize: 11, fontWeight: 600 }}>
                            {ss.label}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}