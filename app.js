const TZ = "America/Los_Angeles";
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const $ = id => document.getElementById(id);

function pt(iso, withDate = true) {
  if (!iso) return "";
  const d = new Date(iso);
  const opts = withDate
    ? { timeZone: TZ, month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }
    : { timeZone: TZ, hour: "numeric", minute: "2-digit" };
  return d.toLocaleString("en-US", opts) + " PT";
}
function ago(iso) {
  const m = Math.round((Date.now() - new Date(iso)) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return m + " min ago";
  const h = Math.round(m / 60);
  if (h < 48) return h + (h === 1 ? " hour ago" : " hours ago");
  return Math.round(h / 24) + " days ago";
}
const pill = (kind, text) => `<span class="pill ${esc(kind)}">${esc(text)}</span>`;

function scoreKind(value, status) {
  if (status === "failed") return "failed";
  if (status === "testing") return "doing";
  if (status === "done") return "done";
  const v = String(value || "").trim();
  if (/^failed$/i.test(v) || /^0\/\d+$/.test(v)) return "failed";
  if (/^testing$/i.test(v)) return "doing";
  const m = v.match(/^(\d+)\/(\d+)$/);
  if (m) {
    const a = Number(m[1]), b = Number(m[2]);
    if (b > 0 && a >= b) return "done";
    if (a > 0) return "doing";
    return "failed";
  }
  return "todo";
}

function render(s) {
  $("updated").innerHTML = `Last updated ${esc(pt(s.last_updated))} · ${esc(ago(s.last_updated))}`;
  const g = s.goal || {};
  $("hero").innerHTML = `
    <div class="eyebrow"><span class="pulse"></span>Goal right now</div>
    <h1>${esc(g.title)}</h1>
    <div class="meta">
      ${g.target ? pill("busy", g.target) : ""}
      ${g.tester ? pill("plain", g.tester) : ""}
    </div>
    ${g.summary ? `<p class="summary">${esc(g.summary)}</p>` : ""}`;

  $("now").innerHTML = (s.now || []).map(n => `<div class="now-item">
      <div class="who">${esc(n.who)}</div>
      <div class="task">${esc(n.task)}</div>
      ${n.detail ? `<div class="sub">${esc(n.detail)}</div>` : ""}
    </div>`).join("") || `<div class="sub">Nothing running.</div>`;
  $("todo").innerHTML = (s.todo || []).map(x => `<li><b>${esc(x)}</b></li>`).join("") || `<li class="sub">Nothing queued.</li>`;

  const routes = s.routes || [];
  const passHome = routes.filter(r => scoreKind(r.walk_home, r.walk_home_status) === "done").length;
  const passOut = routes.filter(r => scoreKind(r.path_out, r.path_out_status) === "done").length;
  const passLoop = routes.filter(r => scoreKind(r.loop, r.loop_status) === "done").length;
  $("routes-count").textContent = routes.length
    ? `${passOut}/${routes.length} path out · ${passHome}/${routes.length} walk home · ${passLoop}/${routes.length} full loops`
    : "";
  $("routes-note").textContent = s.routes_note || "";
  $("routes").querySelector("tbody").innerHTML = routes.map(r => {
    const outK = scoreKind(r.path_out, r.path_out_status);
    const homeK = scoreKind(r.walk_home, r.walk_home_status);
    const loopK = scoreKind(r.loop, r.loop_status);
    return `<tr>
      <th>${esc(r.field)}</th>
      <td>${pill(outK, r.path_out || "testing")}</td>
      <td>${pill(homeK, r.walk_home || "testing")}</td>
      <td>${pill(loopK, r.loop || "testing")}</td>
      <td class="note">${esc(r.note || "")}</td>
    </tr>`;
  }).join("") || `<tr><td colspan="5" class="sub">No results yet.</td></tr>`;

  $("building").innerHTML = (s.building || []).map(b => {
    const label = b.pr ? `#${esc(b.pr)} ${esc(b.title)}` : esc(b.title);
    const inner = `<div class="row"><b>${label}</b></div>${b.detail ? `<div class="sub">${esc(b.detail)}</div>` : ""}`;
    return b.url
      ? `<li><a class="link" href="${esc(b.url)}" target="_blank" rel="noopener">${inner} <span class="arrow">↗</span></a></li>`
      : `<li>${inner}</li>`;
  }).join("") || `<li class="sub">Nothing in progress.</li>`;

  const needs = s.needs_you || [];
  $("needs-count").textContent = needs.length || "";
  $("needs-count").style.display = needs.length ? "" : "none";
  $("needs").innerHTML = needs.length
    ? needs.map(x => `<li><div><div class="row"><b>${esc(x.title)}</b></div><div class="sub">${esc(x.detail)}</div></div></li>`).join("")
    : `<li class="sub">Nothing right now.</li>`;

  $("done").innerHTML = (s.done || []).map(d => {
    const when = d.when ? `<div class="when">${esc(pt(d.when))}</div>` : "";
    const inner = `${when}<b>${esc(d.title)}</b>`;
    return d.url
      ? `<li><a class="link" href="${esc(d.url)}" target="_blank" rel="noopener">${inner} <span class="arrow">↗</span></a></li>`
      : `<li>${inner}</li>`;
  }).join("") || `<li class="sub">Nothing listed yet.</li>`;
}

async function load() {
  try {
    const r = await fetch("status.json?t=" + Date.now(), { cache: "no-store" });
    if (!r.ok) throw new Error(r.status);
    render(await r.json());
  } catch (e) {
    $("updated").innerHTML = `<span class="err">Couldn't load the latest status. Try refreshing.</span>`;
  }
}
load();
setInterval(load, 60000);
