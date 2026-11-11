import { useEffect, useMemo, useState } from "react";
import { Activity, AlertTriangle, ArrowUpRight, CheckCircle2, Clock3, Copy, Filter, RefreshCw, Search, XCircle, Zap } from "lucide-react";

type Status = "success" | "pending" | "failed" | "timeout";
type RequestRecord = {
  id: string; type: string; reference: string; endpoint: string; status: Status; resultCode: string;
  resultDescription: string; responseMs: number; requestedAt: string; completedAt: string;
  requestMeta: string; responseData: string;
};

const seed: RequestRecord[] = [
  { id: "req_8F2K91", type: "STK Push", reference: "ws_CO_120326_2041", endpoint: "/mpesa/stkpush/v1/processrequest", status: "success", resultCode: "0", resultDescription: "The service request is processed successfully.", responseMs: 842, requestedAt: "Today, 10:42:18", completedAt: "Today, 10:42:19", requestMeta: '{"amount": 1250, "phone": "2547••••198", "account": "INV-2041"}', responseData: '{"MerchantRequestID":"29115-34620561-1","CheckoutRequestID":"ws_CO_120326_2041","ResponseCode":"0"}' },
  { id: "req_8F2K88", type: "C2B Callback", reference: "RFT_672191", endpoint: "/mpesa/c2b/v1/confirmation", status: "success", resultCode: "0", resultDescription: "Accepted.", responseMs: 126, requestedAt: "Today, 10:39:51", completedAt: "Today, 10:39:51", requestMeta: '{"transAmount": "4800", "billRefNumber": "INV-1933"}', responseData: '{"ResultCode":0,"ResultDesc":"Confirmation received"}' },
  { id: "req_8F2K79", type: "STK Query", reference: "ws_CO_120326_1982", endpoint: "/mpesa/stkpushquery/v1/query", status: "pending", resultCode: "1032", resultDescription: "Request cancelled by user or timed out waiting for user input.", responseMs: 2280, requestedAt: "Today, 10:31:04", completedAt: "Today, 10:31:06", requestMeta: '{"checkoutRequestId":"ws_CO_120326_1982"}', responseData: '{"ResultCode":"1032","ResultDesc":"Request cancelled by user"}' },
  { id: "req_8F2K64", type: "B2C Payment", reference: "AG_20260312_00071", endpoint: "/mpesa/b2c/v3/paymentrequest", status: "failed", resultCode: "400.002.02", resultDescription: "The initiator information is invalid.", responseMs: 412, requestedAt: "Today, 10:24:44", completedAt: "Today, 10:24:45", requestMeta: '{"amount": 25000, "partyB": "2547••••411"}', responseData: '{"errorCode":"400.002.02","errorMessage":"Invalid initiator"}' },
  { id: "req_8F2K51", type: "STK Push", reference: "ws_CO_120326_1876", endpoint: "/mpesa/stkpush/v1/processrequest", status: "timeout", resultCode: "ETIMEDOUT", resultDescription: "Daraja did not respond within the configured timeout window.", responseMs: 10000, requestedAt: "Today, 10:18:12", completedAt: "Today, 10:18:22", requestMeta: '{"amount": 800, "phone": "2547••••091", "account": "ORDER-1876"}', responseData: '{"error":"upstream_timeout","retryable":true}' },
];

const statusMap: Record<Status, { label: string; className: string }> = {
  success: { label: "Success", className: "status-success" }, pending: { label: "Pending", className: "status-pending" }, failed: { label: "Failed", className: "status-failed" }, timeout: { label: "Timeout", className: "status-timeout" },
};

function StatusBadge({ status }: { status: Status }) {
  const Icon = status === "success" ? CheckCircle2 : status === "pending" ? Clock3 : status === "timeout" ? Clock3 : XCircle;
  return <span className={`status-badge ${statusMap[status].className}`}><Icon size={13} />{statusMap[status].label}</span>;
}

export default function Home() {
  const [records, setRecords] = useState(seed);
  const [selected, setSelected] = useState<RequestRecord | null>(seed[0]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | Status>("all");
  const [type, setType] = useState("all");
  const [notice, setNotice] = useState("");
  const filtered = useMemo(() => records.filter((r) => {
    const matchesQuery = [r.reference, r.endpoint, r.id].some((value) => value.toLowerCase().includes(query.toLowerCase()));
    return matchesQuery && (status === "all" || r.status === status) && (type === "all" || r.type === type);
  }), [records, query, status, type]);
  const successful = records.filter((r) => r.status === "success").length;
  const failed = records.filter((r) => r.status === "failed" || r.status === "timeout").length;
  const pending = records.filter((r) => r.status === "pending").length;
  const avg = Math.round(records.reduce((sum, r) => sum + r.responseMs, 0) / records.length);

  const loadRecords = async () => {
    try {
      const response = await fetch("/api/requests", { headers: { Accept: "application/json" } });
      if (!response.ok) return;
      const payload = await response.json() as { data?: RequestRecord[] };
      if (payload.data?.length) setRecords(payload.data);
    } catch {
      // The dashboard remains useful with the bundled sample records when the API is offline.
    }
  };
  useEffect(() => { void loadRecords(); }, []);
  const refresh = async () => { await loadRecords(); setRecords((current) => [...current]); setNotice("Request feed refreshed just now"); setTimeout(() => setNotice(""), 2400); };
  const copyId = async () => { if (!selected) return; await navigator.clipboard?.writeText(selected.id); setNotice("Request ID copied"); setTimeout(() => setNotice(""), 1800); };

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><span className="brand-mark"><span /></span><div><strong>DARTRACK</strong><small>Daraja observability</small></div></div>
      <nav><a className="nav-item active"><Activity size={17} /> Request monitor</a><a className="nav-item"><Zap size={17} /> Integrations <span className="soon">Soon</span></a><a className="nav-item"><Filter size={17} /> Saved filters <span className="soon">Soon</span></a></nav>
      <div className="sidebar-bottom"><div className="environment"><span className="live-dot" /> Live environment</div><p>Tracking endpoint activity<br />for your Daraja integration.</p><div className="user-chip"><span className="avatar">JD</span><div><strong>John Developer</strong><small>Workspace owner</small></div><ArrowUpRight size={14} /></div></div>
    </aside>
    <main className="main-content">
      <header className="topbar"><div><div className="eyebrow"><span className="live-dot" /> Live feed <span className="slash">/</span> Last 15 minutes</div><h1>Request health, <em>without</em> the guesswork.</h1><p className="lede">Every Daraja call, one calm operational view.</p></div><button className="refresh-btn" onClick={refresh}><RefreshCw size={15} /> Refresh feed</button></header>
      {notice && <div className="toast"><CheckCircle2 size={15} /> {notice}</div>}
      <section className="metrics-grid">
        <div className="metric-card primary-metric"><div className="metric-top"><span>Total requests</span><Activity size={16} /></div><strong>{records.length.toLocaleString()}</strong><div className="metric-foot"><span className="trend-up">↗ 12.4%</span> vs previous period</div></div>
        <div className="metric-card"><div className="metric-top"><span>Successful</span><CheckCircle2 size={16} /></div><strong>{successful}</strong><div className="metric-foot"><span className="good">{Math.round((successful / records.length) * 100)}%</span> of total volume</div></div>
        <div className="metric-card"><div className="metric-top"><span>Needs attention</span><AlertTriangle size={16} /></div><strong>{failed + pending}</strong><div className="metric-foot"><span className="warning">{failed} failed</span> · {pending} pending</div></div>
        <div className="metric-card"><div className="metric-top"><span>Avg. response</span><Clock3 size={16} /></div><strong>{avg}<small> ms</small></strong><div className="metric-foot"><span className="good">↓ 8.6%</span> faster than baseline</div></div>
      </section>
      <section className="activity-section">
        <div className="section-heading"><div><div className="eyebrow">Activity log</div><h2>Latest requests</h2></div><div className="section-actions"><div className="search-box"><Search size={15} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search reference or endpoint" /></div><select value={type} onChange={(e) => setType(e.target.value)}><option value="all">All request types</option>{[...new Set(records.map((r) => r.type))].map((t) => <option key={t}>{t}</option>)}</select><select value={status} onChange={(e) => setStatus(e.target.value as "all" | Status)}><option value="all">All statuses</option><option value="success">Success</option><option value="pending">Pending</option><option value="failed">Failed</option><option value="timeout">Timeout</option></select></div></div>
        <div className="table-wrap"><table><thead><tr><th>Request</th><th>Reference ID</th><th>Result</th><th>Response time</th><th>Timestamp</th><th /></tr></thead><tbody>{filtered.map((record) => <tr key={record.id} onClick={() => setSelected(record)} className={selected?.id === record.id ? "selected-row" : ""}><td><div className="request-name"><span className="request-icon"><Zap size={14} /></span><div><strong>{record.type}</strong><small className="mono">{record.id}</small></div></div></td><td className="mono reference">{record.reference}</td><td><StatusBadge status={record.status} /><small className="result-code">{record.resultCode}</small></td><td><span className="response-time">{record.responseMs.toLocaleString()} ms</span><div className="mini-bar"><span style={{ width: `${Math.min(record.responseMs / 100, 100)}%` }} /></div></td><td className="timestamp">{record.requestedAt}</td><td><ArrowUpRight size={15} className="row-arrow" /></td></tr>)}</tbody></table>{filtered.length === 0 && <div className="empty-state">No requests match these filters.</div>}</div>
      </section>
      <footer className="main-footer"><span><span className="live-dot" /> Monitoring is active</span><span>Data refreshes when you ask it to · <a href="#api">Connect your tracking endpoint</a></span></footer>
    </main>
    {selected && <aside className="detail-panel"><div className="detail-head"><div><div className="eyebrow">Request detail</div><h2>{selected.type}</h2></div><button className="icon-btn" onClick={() => setSelected(null)}><XCircle size={20} /></button></div><div className="detail-status"><StatusBadge status={selected.status} /><button onClick={copyId} className="copy-btn"><Copy size={13} /> {selected.id}</button></div><div className="detail-body"><div className="detail-block"><span className="detail-label">Outcome</span><p>{selected.resultDescription}</p></div><div className="detail-grid"><div><span className="detail-label">Result code</span><strong className="mono">{selected.resultCode}</strong></div><div><span className="detail-label">Response time</span><strong>{selected.responseMs.toLocaleString()} ms</strong></div><div><span className="detail-label">Requested</span><strong>{selected.requestedAt}</strong></div><div><span className="detail-label">Completed</span><strong>{selected.completedAt}</strong></div></div><div className="detail-block"><span className="detail-label">Endpoint</span><code>{selected.endpoint}</code></div><div className="detail-block"><span className="detail-label">Request metadata</span><pre>{selected.requestMeta}</pre></div><div className="detail-block"><span className="detail-label">Response data</span><pre>{selected.responseData}</pre></div></div></aside>}
  </div>;
}
