const TZ = "America/Los_Angeles";
const WORDS = { done: "Done", doing: "In progress", todo: "Not started" };
const TEST_WORDS = { done: "Passed", doing: "In progress", todo: "Unknown", failed: "Failed" };
const WORKER_WORDS = { busy: "Online, busy", online: "Online, idle", offline: "Offline" };
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

function render(s) {
  $("updated").innerHTML = `Last updated ${esc(pt(s.last_updated))} · ${esc(ago(s.last_updated))}`;
  const n = s.now || {};
  const ws = n.worker_status || "offline";
  $("hero").innerHTML = `
    <div class="eyebrow">${ws === "offline" ? "" : '<span class="pulse"></span>'}Now working on</div>
    <h1>${esc(n.title)}</h1>
    <div class="meta">
      ${pill(ws === "offline" ? "offline" : "online", n.worker)}
      ${pill(ws, WORKER_WORDS[ws] || ws)}
      ${n.started ? pill("plain", "Started " + pt(n.started)) : ""}
    </div>
    <p class="summary">${esc(n.summary)}</p>
    <ol class="steps">${(n.steps || []).map(st => `
      <li class="step">
        <span class="icon ${esc(st.status)}">${st.status === "done" ? "✓" : ""}</span>
        <div><div class="t">${esc(st.title)}</div><div class="d">${esc(st.detail)}</div></div>
        ${pill(st.status, WORDS[st.status] || st.status)}
      </li>`).join("")}</ol>`;

  const AG = { busy: "Busy", online: "Online, idle", offline: "Offline" };
  $("agents").innerHTML = (s.agents || []).map(a => {
    const fin = a.last_finished ? (a.last_finished_url
      ? `<a class="inl" href="${esc(a.last_finished_url)}" target="_blank" rel="noopener">${esc(a.last_finished)} ↗</a>`
      : esc(a.last_finished)) + (a.last_finished_at ? ` <span class="dimtxt">· ${esc(pt(a.last_finished_at))}</span>` : "") : "Nothing yet";
    return `<div class="agent ${esc(a.status)}">
      <div class="row"><div><b class="aname">${esc(a.name)}</b><div class="role">${esc(a.role)}</div></div>${pill(a.status, AG[a.status] || a.status)}</div>
      <dl>
        <dt>Doing right now</dt><dd class="doing-now">${esc(a.doing)}</dd>
        <dt>Computer</dt><dd>${esc(a.machine)}</dd>
        ${a.branch ? `<dt>Branch</dt><dd><code>${esc(a.branch)}</code></dd>` : ""}
        <dt>Last finished</dt><dd>${fin}</dd>
        <dt>Last seen</dt><dd>${esc(a.last_seen ? pt(a.last_seen) + " · " + ago(a.last_seen) : "Unknown")}</dd>
      </dl></div>`;
  }).join("");

  const stages = s.stages || [];
  const done = stages.filter(x => x.status === "done").length;
  const doing = stages.filter(x => x.status === "doing").length;
  $("stage-count").textContent = `${done} of ${stages.length} done${doing ? `, ${doing} underway` : ""}`;
  $("bar").innerHTML = stages.map(x => `<div class="seg ${esc(x.status)}" title="${esc(x.title)}"><div class="fill"></div><div class="lbl">${esc(x.short || x.title)}</div></div>`).join("");
  $("timeline").innerHTML = stages.map(x => `
    <li><span class="dot ${esc(x.status)}"></span>
      <div><div class="tl-head"><b>${esc(x.title)}</b>${pill(x.status, WORDS[x.status] || x.status)}</div>
      <div class="tl-d">${esc(x.detail)}</div></div></li>`).join("");
  const tg = s.target;
  $("target").innerHTML = (tg ? `<span class="pill busy">${esc(tg.label)}: ${esc(tg.estimate)}</span>` : "") +
    (s.scope_url ? ` <a class="inl" href="${esc(s.scope_url)}" target="_blank" rel="noopener">See the full v0.1 scope ↗</a>` : "");
  $("later").innerHTML = s.later ? `<b>After that:</b> ${esc(s.later)}` : "";

  $("tests-note").textContent = s.tests_note || "";
  $("tests").innerHTML = (s.tests || []).map(t => `
    <li><div class="row"><b>${esc(t.name)}</b>${pill(t.status === "failed" ? "doing" : t.status, TEST_WORDS[t.status] || t.status)}</div>
    <div class="sub">${esc(t.result)}</div></li>`).join("");

  const needs = s.needs_you || [];
  $("needs-count").textContent = needs.length || "";
  $("needs").innerHTML = needs.length
    ? needs.map(x => `<li><div><div class="row"><b>${esc(x.title)}</b></div><div class="sub">${esc(x.detail)}</div></div></li>`).join("")
    : `<li class="sub">Nothing right now.</li>`;

  $("prs").innerHTML = (s.prs || []).map(p => `
    <li><a class="link" href="${esc(p.url)}" target="_blank" rel="noopener">
      <div class="row"><b>#${esc(p.number)} ${esc(p.title)}</b>${pill(/merged/i.test(p.status) && !/not/i.test(p.status) ? "done" : "doing", p.status)}</div>
      <div class="sub">${esc(p.commits)} saved changes · updated ${esc(pt(p.updated))} <span class="arrow">↗</span></div></a></li>`).join("") || `<li class="sub">None open.</li>`;

  $("commits").innerHTML = (s.commits || []).map(c => `
    <li><a class="link" href="${esc(c.url)}" target="_blank" rel="noopener">
      <div class="when">${esc(pt(c.when))}</div><b>${esc(c.title)}</b> <span class="arrow">↗</span></a></li>`).join("");
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
