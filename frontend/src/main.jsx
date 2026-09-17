import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./styles.css";

const API = "http://localhost:8000/api";

const fallbackTemples = [
  { id: "GHA-TEM-0001", name: "Agastyeshwara Sivalayam", city: "Guntur", status: "partial-verification", latitude: 16.3008, longitude: 80.4428 },
  { id: "GHA-TEM-0002", name: "Panakala Lakshmi Narasimha Swamy Temple", city: "Mangalagiri", status: "partial-verification", latitude: 16.44, longitude: 80.56 },
  { id: "GHA-TEM-0003", name: "Bhavanarayana Swamy Temple", city: "Ponnur", status: "partial-verification", latitude: 16.07114, longitude: 80.54944 },
  { id: "GHA-TEM-0004", name: "Sri Bhramaramba Malleswara Swamy Temple", city: "Pedakakani", status: "partial-verification", latitude: 16.3361, longitude: 80.4982 },
  { id: "GHA-TEM-0005", name: "Anantha Padmanabha Swami Temple, Undavalli", city: "Undavalli", status: "partial-verification", latitude: 16.49724, longitude: 80.58224 },
];

const fallbackLocalities = [
  { id: "GHA-LOC-0001", name: "Guntur", type: "city", district: "Guntur", status: "partial-verification" },
  { id: "GHA-LOC-0002", name: "Mangalagiri", type: "town", district: "Guntur", status: "partial-verification" },
  { id: "GHA-LOC-0003", name: "Ponnur", type: "town", district: "Guntur", status: "partial-verification" },
  { id: "GHA-LOC-0004", name: "Pedakakani", type: "village", district: "Guntur", status: "partial-verification" },
  { id: "GHA-LOC-0005", name: "Undavalli", type: "village", district: "Guntur", status: "partial-verification" },
];

const fallbackHistorical = { record_id: "GHA-HIST-1961-GUNTUR-TALUK-INDEX", title: "Guntur Taluk — Census 1961 fairs and festivals temple index", scope: "Historical Guntur Taluk", note: "This index preserves the village/deity/festival entries from the source map index. It is a historical administrative snapshot and is not a statement of current district boundaries.", entries: [] };

const markerIcon = new L.Icon({ iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png", iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png", shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png", iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41] });

async function getJson(path, fallback) {
  try {
    const response = await fetch(`${API}${path}`);
    if (!response.ok) throw new Error("API unavailable");
    return await response.json();
  } catch {
    return fallback;
  }
}

function FitToTemples({ temples }) {
  const map = useMap();
  useEffect(() => {
    const points = temples.filter((t) => Number.isFinite(t.latitude) && Number.isFinite(t.longitude)).map((t) => [t.latitude, t.longitude]);
    if (points.length > 1) map.fitBounds(points, { padding: [35, 35] });
  }, [map, temples]);
  return null;
}

function HeritageMap({ temples, onSelect }) {
  const mapped = temples.filter((t) => Number.isFinite(t.latitude) && Number.isFinite(t.longitude));
  return (
    <div className="real-map-wrap">
      <MapContainer center={[16.30, 80.52]} zoom={10} scrollWheelZoom={true} className="real-map">
        <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <FitToTemples temples={mapped} />
        {mapped.map((temple) => (
          <Marker key={temple.id} position={[temple.latitude, temple.longitude]} icon={markerIcon} eventHandlers={{ click: () => onSelect(temple.id) }}>
            <Popup><strong>{temple.name}</strong><br />{temple.city}</Popup>
          </Marker>
        ))}
      </MapContainer>
      <div className="map-credit">Live map tiles: OpenStreetMap · Coordinates are labeled by their current evidence precision.</div>
    </div>
  );
}

function App() {
  const [temples, setTemples] = useState(fallbackTemples);
  const [localities, setLocalities] = useState(fallbackLocalities);
  const [routes, setRoutes] = useState([]);
  const [historical, setHistorical] = useState(fallbackHistorical);
  const [narratives, setNarratives] = useState([]);
  const [selected, setSelected] = useState(null);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("temples");

  useEffect(() => {
    getJson("/temples", fallbackTemples).then(async (items) => {
      const detailed = await Promise.all(items.map(async (item) => getJson(`/temples/${item.id}`, item)));
      setTemples(detailed);
    });
    getJson("/localities", fallbackLocalities).then(setLocalities);
    getJson("/routes", []).then(setRoutes);
    getJson("/historical-observations", []).then((records) => {
      const index = records.find((record) => record.record_id === "GHA-HIST-1961-GUNTUR-TALUK-INDEX");
      const narrativeRecord = records.find((record) => record.record_id === "GHA-HIST-1961-GUNTUR-TALUK-NARRATIVES");
      if (index) setHistorical(index);
      if (narrativeRecord) setNarratives(narrativeRecord.observations || []);
    });
  }, []);

  const filteredTemples = useMemo(() => { const q = query.trim().toLowerCase(); return !q ? temples : temples.filter((x) => `${x.name} ${x.city} ${x.status}`.toLowerCase().includes(q)); }, [temples, query]);
  const filteredHistorical = useMemo(() => { const q = query.trim().toLowerCase(); const e = historical.entries || []; return !q ? e : e.filter((x) => `${x.serial} ${x.locality} ${x.deity} ${x.festival_period}`.toLowerCase().includes(q)); }, [historical, query]);
  const filteredLocalities = useMemo(() => { const q = query.trim().toLowerCase(); return !q ? localities : localities.filter((x) => `${x.name} ${x.type} ${x.district}`.toLowerCase().includes(q)); }, [localities, query]);

  async function openTemple(id) { setSelected({ type: "temple", data: await getJson(`/temples/${id}`, temples.find((x) => x.id === id)) }); }
  async function openLocality(id) { setSelected({ type: "locality", data: await getJson(`/localities/${id}`, localities.find((x) => x.id === id)) }); }
  function openHistorical(entry) { const narrative = narratives.find((n) => n.locality.toLowerCase() === entry.locality.toLowerCase() || n.locality.toLowerCase().includes(entry.locality.toLowerCase()) || entry.locality.toLowerCase().includes(n.locality.toLowerCase())); setSelected({ type: "historical", data: { ...entry, narrative } }); }

  const records = tab === "temples" ? filteredTemples : tab === "historical" ? filteredHistorical : filteredLocalities;

  return (
    <div className="site-shell">
      <header className="topbar"><div className="brand"><span className="brand-mark">GH</span><span>Guntur Heritage Atlas</span></div><div className="status-dot"><i /> Research edition</div></header>
      <main>
        <section className="hero"><div className="hero-copy"><p className="eyebrow">A living historical map</p><h1>Discover Guntur,<br /><em>one story at a time.</em></h1><p className="hero-text">Explore temples, localities, historical places and the evidence behind their stories. Every record has a source and a verification status.</p><div className="search-wrap"><span>⌕</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search temples, places, localities..." /><kbd>⌘ K</kbd></div></div><div className="hero-art" aria-hidden="true"><div className="sun" /><div className="hill hill-one" /><div className="hill hill-two" /><div className="temple-silhouette"><span /><span /><span /><b /></div></div></section>

        <section className="stats-row"><div><strong>{temples.length}</strong><span>Temple records</span></div><div><strong>{historical.entries?.length || 0}</strong><span>Historical 1961</span></div><div><strong>{localities.length}</strong><span>Localities mapped</span></div><div><strong>{routes.length || 1}</strong><span>Research routes</span></div></section>

        <section className="workspace"><div className="section-heading"><div><p className="eyebrow">Explore the atlas</p><h2>Heritage around Guntur</h2></div><div className="tabs"><button className={tab === "temples" ? "active" : ""} onClick={() => setTab("temples")}>Temples</button><button className={tab === "historical" ? "active" : ""} onClick={() => setTab("historical")}>Historical 1961 <span>{historical.entries?.length || 0}</span></button><button className={tab === "localities" ? "active" : ""} onClick={() => setTab("localities")}>Localities</button></div></div>
          {tab === "historical" && <div className="historical-notice"><strong>Historical Guntur Taluk — Census 1961</strong><span>{historical.note}</span></div>}
          <div className="content-grid"><div className="record-list">{records.map((item, index) => { const h = tab === "historical"; return <button className={`record-card ${h ? "historical-card" : ""}`} key={h ? item.serial : item.id} onClick={() => h ? openHistorical(item) : tab === "temples" ? openTemple(item.id) : openLocality(item.id)}><span className="record-number">{h ? String(item.serial).padStart(2, "0") : String(index + 1).padStart(2, "0")}</span><span className="record-main"><strong>{h ? item.locality : item.name}</strong><small>{h ? item.deity : tab === "temples" ? item.city : `${item.type || "place"} · ${item.district || "Guntur"}`}</small>{h && <em>{item.festival_period}</em>}</span>{h && <span className="historical-badge">1961</span>}<span className="arrow">↗</span></button>; })}{!records.length && <div className="empty">No records match your search.</div>}</div><div className="map-card"><HeritageMap temples={filteredTemples.length ? filteredTemples : temples} onSelect={openTemple} /><div className="map-caption"><strong>Actual heritage locations</strong><span>Click a marker to open the researched place record. More precise coordinates will be added as each site is verified.</span></div></div></div>
        </section>

        <section className="route-section"><div><p className="eyebrow">The first route</p><h2>Build your own heritage day.</h2><p>Connect places into a journey. The atlas keeps the historical record separate from the modern route so you can explore both.</p></div><div className="route-steps">{(routes[0]?.stops || fallbackTemples.map((t, i) => ({ order: i + 1, name: t.name }))).map((stop) => <div className="route-step" key={stop.order}><b>{String(stop.order).padStart(2, "0")}</b><span>{stop.name}</span></div>)}</div></section>
      </main>
      <footer><span>Guntur Heritage Atlas</span><span>Evidence before claims · Research edition</span></footer>

      {selected && <div className="overlay" onClick={() => setSelected(null)}><aside className="detail-panel" onClick={(e) => e.stopPropagation()}><button className="close" onClick={() => setSelected(null)}>×</button><p className="eyebrow">{selected.type === "historical" ? "Historical source record" : selected.type}</p><h2>{selected.type === "historical" ? selected.data.locality : selected.data.name}</h2>
        {selected.type === "temple" && <><div className="tag">{selected.data.status}</div>{(selected.data.media || []).length > 0 && <div className="photo-gallery">{selected.data.media.map((photo) => <figure key={photo.url}><img src={photo.url} alt={photo.caption || selected.data.name} /><figcaption>{photo.caption}{photo.credit && <small>{photo.credit}</small>}</figcaption></figure>)}</div>}<p>{selected.data.description || "A research record in the Guntur Heritage Atlas."}</p><div className="location-box"><strong>📍 Map location</strong><span>{selected.data.latitude}, {selected.data.longitude}</span><small>Coordinates are displayed with the precision documented in the research record.</small></div><h3>Evidence</h3><p className="muted">This record is currently marked <strong>{selected.data.evidence}</strong>. Historical claims are kept separate from tradition until verified.</p><h3>Sources</h3><ul>{(selected.data.sources || []).map((s) => <li key={s.id}>{s.title}{s.publisher ? ` — ${s.publisher}` : ""}</li>)}</ul></>}
        {selected.type === "historical" && <><div className="tag">Census 1961 · Historical Guntur Taluk</div><p><strong>{selected.data.deity}</strong></p><p>Festival period recorded in the index: <strong>{selected.data.festival_period}</strong>.</p>{selected.data.narrative ? <><h3>Historical context</h3><ul>{selected.data.narrative.notes.map((note) => <li key={note}>{note}</li>)}</ul></> : <p className="muted">The 1961 index records this locality, deity and festival period. A separate narrative note has not yet been added for this locality.</p>}<h3>Source boundary</h3><p className="muted">This is a historical administrative snapshot. Its appearance here does not automatically mean the same temple entry is a current verified record.</p></>}
        {selected.type === "locality" && <><div className="tag">{selected.data.status}</div><p>{selected.data.history || "Locality research is being assembled."}</p><h3>Why the name?</h3><p>{selected.data.name_origin || "Name-origin research has not yet been verified."}</p><h3>Connected temples</h3><ul>{(selected.data.temples || []).map((t) => <li key={t.id}>{t.name}</li>)}</ul></>}
      </aside></div>}
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
