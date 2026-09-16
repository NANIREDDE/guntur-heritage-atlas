import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const API = "http://localhost:8000/api";

const fallbackTemples = [
  { id: "GHA-TEM-0001", name: "Agastyeshwara Sivalayam", city: "Guntur", status: "partial-verification" },
  { id: "GHA-TEM-0002", name: "Panakala Lakshmi Narasimha Swamy Temple", city: "Mangalagiri", status: "partial-verification" },
  { id: "GHA-TEM-0003", name: "Bhavanarayana Swamy Temple", city: "Ponnur", status: "partial-verification" },
  { id: "GHA-TEM-0004", name: "Sri Bhramaramba Malleswara Swamy Temple", city: "Pedakakani", status: "partial-verification" },
  { id: "GHA-TEM-0005", name: "Anantha Padmanabha Swami Temple, Undavalli", city: "Undavalli", status: "partial-verification" },
];

const fallbackLocalities = [
  { id: "GHA-LOC-0001", name: "Guntur", type: "city", district: "Guntur", status: "partial-verification" },
  { id: "GHA-LOC-0002", name: "Mangalagiri", type: "town", district: "Guntur", status: "partial-verification" },
  { id: "GHA-LOC-0003", name: "Ponnur", type: "town", district: "Guntur", status: "partial-verification" },
  { id: "GHA-LOC-0004", name: "Pedakakani", type: "village", district: "Guntur", status: "partial-verification" },
  { id: "GHA-LOC-0005", name: "Undavalli", type: "village", district: "Guntur", status: "partial-verification" },
];

async function getJson(path, fallback) {
  try {
    const response = await fetch(`${API}${path}`);
    if (!response.ok) throw new Error("API unavailable");
    return await response.json();
  } catch {
    return fallback;
  }
}

function App() {
  const [temples, setTemples] = useState(fallbackTemples);
  const [localities, setLocalities] = useState(fallbackLocalities);
  const [routes, setRoutes] = useState([]);
  const [selected, setSelected] = useState(null);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("temples");

  useEffect(() => {
    getJson("/temples", fallbackTemples).then(setTemples);
    getJson("/localities", fallbackLocalities).then(setLocalities);
    getJson("/routes", []).then(setRoutes);
  }, []);

  const filteredTemples = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return temples;
    return temples.filter((item) => `${item.name} ${item.city} ${item.status}`.toLowerCase().includes(q));
  }, [temples, query]);

  const filteredLocalities = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return localities;
    return localities.filter((item) => `${item.name} ${item.type} ${item.district}`.toLowerCase().includes(q));
  }, [localities, query]);

  async function openTemple(id) {
    const temple = await getJson(`/temples/${id}`, temples.find((item) => item.id === id));
    setSelected({ type: "temple", data: temple });
  }

  async function openLocality(id) {
    const locality = await getJson(`/localities/${id}`, localities.find((item) => item.id === id));
    setSelected({ type: "locality", data: locality });
  }

  return (
    <div className="site-shell">
      <header className="topbar">
        <div className="brand"><span className="brand-mark">GH</span><span>Guntur Heritage Atlas</span></div>
        <div className="status-dot"><i /> Research edition</div>
      </header>

      <main>
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">A living historical map</p>
            <h1>Discover Guntur,<br /><em>one story at a time.</em></h1>
            <p className="hero-text">Explore temples, localities, historical places and the evidence behind their stories. Every record has a source and a verification status.</p>
            <div className="search-wrap">
              <span>⌕</span>
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search temples, places, localities..." />
              <kbd>⌘ K</kbd>
            </div>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="sun" /><div className="hill hill-one" /><div className="hill hill-two" />
            <div className="temple-silhouette"><span /><span /><span /><b /></div>
          </div>
        </section>

        <section className="stats-row">
          <div><strong>{temples.length}</strong><span>Temple records</span></div>
          <div><strong>{localities.length}</strong><span>Localities mapped</span></div>
          <div><strong>{routes.length || 1}</strong><span>Research route</span></div>
          <div><strong>100%</strong><span>Source-aware design</span></div>
        </section>

        <section className="workspace">
          <div className="section-heading">
            <div><p className="eyebrow">Explore the atlas</p><h2>Heritage around Guntur</h2></div>
            <div className="tabs">
              <button className={tab === "temples" ? "active" : ""} onClick={() => setTab("temples")}>Temples</button>
              <button className={tab === "localities" ? "active" : ""} onClick={() => setTab("localities")}>Localities</button>
            </div>
          </div>

          <div className="content-grid">
            <div className="record-list">
              {(tab === "temples" ? filteredTemples : filteredLocalities).map((item, index) => (
                <button className="record-card" key={item.id} onClick={() => tab === "temples" ? openTemple(item.id) : openLocality(item.id)}>
                  <span className="record-number">0{index + 1}</span>
                  <span className="record-main"><strong>{item.name}</strong><small>{tab === "temples" ? item.city : `${item.type || "place"} · ${item.district || "Guntur"}`}</small></span>
                  <span className="arrow">↗</span>
                </button>
              ))}
              {!(tab === "temples" ? filteredTemples : filteredLocalities).length && <div className="empty">No records match your search.</div>}
            </div>

            <div className="map-card">
              <div className="map-grid" />
              <div className="map-label"><span className="map-pin" /> GUNTUR REGION</div>
              <div className="route-line" />
              {[[35, 28], [51, 46], [69, 34], [57, 70], [79, 60]].map(([left, top], i) => <button key={i} className="map-pin-dot" style={{ left: `${left}%`, top: `${top}%` }} onClick={() => setTab("temples")} aria-label={`heritage point ${i + 1}`}>{i + 1}</button>)}
              <div className="map-caption"><strong>Research route 01</strong><span>Guntur → Pedakakani → Mangalagiri → Undavalli → Ponnur</span></div>
            </div>
          </div>
        </section>

        <section className="route-section">
          <div><p className="eyebrow">The first route</p><h2>Build your own heritage day.</h2><p>Connect places into a journey. The atlas keeps the historical record separate from the modern route so you can explore both.</p></div>
          <div className="route-steps">{(routes[0]?.stops || fallbackTemples.map((t, i) => ({ order: i + 1, name: t.name, locality_id: "" }))).map((stop) => <div className="route-step" key={stop.order}><b>{String(stop.order).padStart(2, "0")}</b><span>{stop.name}</span></div>)}</div>
        </section>
      </main>

      <footer><span>Guntur Heritage Atlas</span><span>Evidence before claims · Research edition</span></footer>

      {selected && <div className="overlay" onClick={() => setSelected(null)}><aside className="detail-panel" onClick={(e) => e.stopPropagation()}><button className="close" onClick={() => setSelected(null)}>×</button><p className="eyebrow">{selected.type}</p><h2>{selected.data.name}</h2>{selected.type === "temple" ? <><div className="tag">{selected.data.status}</div><p>{selected.data.description || "A research record in the Guntur Heritage Atlas."}</p><h3>Evidence</h3><p className="muted">This record is currently marked <strong>{selected.data.evidence}</strong>. Historical claims are kept separate from tradition until verified.</p><h3>Sources</h3><ul>{(selected.data.sources || []).map((s) => <li key={s.id}>{s.title}{s.publisher ? ` — ${s.publisher}` : ""}</li>)}</ul></> : <><div className="tag">{selected.data.status}</div><p>{selected.data.history || "Locality research is being assembled."}</p><h3>Why the name?</h3><p>{selected.data.name_origin || "Name-origin research has not yet been verified."}</p><h3>Connected temples</h3><ul>{(selected.data.temples || []).map((t) => <li key={t.id}>{t.name}</li>)}</ul></>}</aside></div>}
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
