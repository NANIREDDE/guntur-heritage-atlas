import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./styles.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const fallbackTemples = [
  { id: "GHA-TEM-0001", name: "Agastyeshwara Sivalayam", city: "Guntur", status: "partial-verification", latitude: 16.3008, longitude: 80.4428, address: "Sivalayam Rd, Christian Pet, Old Guntur, Guntur, Andhra Pradesh 522001, India" },
  { id: "GHA-TEM-0002", name: "Panakala Lakshmi Narasimha Swamy Temple", city: "Mangalagiri", status: "partial-verification", latitude: 16.44, longitude: 80.56, address: "Panakala Narasimha Swamy Temple Road, Mangalagiri, Guntur District, Andhra Pradesh 522503, India" },
  { id: "GHA-TEM-0003", name: "Bhavanarayana Swamy Temple", city: "Ponnur", status: "partial-verification", latitude: 16.07114, longitude: 80.54944, address: "Ponnur, Andhra Pradesh 522124, India" },
  { id: "GHA-TEM-0004", name: "Sri Bhramaramba Malleswara Swamy Temple", city: "Pedakakani", status: "partial-verification", latitude: 16.3361, longitude: 80.4982, address: "Guntur - Vijayawada Highway, Pedakakani, Guntur, Andhra Pradesh 522509, India" },
  { id: "GHA-TEM-0005", name: "Anantha Padmanabha Swami Temple, Undavalli", city: "Undavalli", status: "partial-verification", latitude: 16.49724, longitude: 80.58224, address: "Undavalli, Tadepalle, Andhra Pradesh 522501, India" }
];
const fallbackLocalities = [
  { id: "GHA-LOC-0001", name: "Guntur", type: "city", district: "Guntur", status: "partial-verification" },
  { id: "GHA-LOC-0002", name: "Mangalagiri", type: "town", district: "Guntur", status: "partial-verification" },
  { id: "GHA-LOC-0003", name: "Ponnur", type: "town", district: "Guntur", status: "partial-verification" },
  { id: "GHA-LOC-0004", name: "Pedakakani", type: "village", district: "Guntur", status: "partial-verification" },
  { id: "GHA-LOC-0005", name: "Undavalli", type: "village", district: "Guntur", status: "partial-verification" }
];
const fallbackHistorical = { record_id: "GHA-HIST-1961-GUNTUR-TALUK-INDEX", title: "Guntur Taluk — Census 1961 fairs and festivals temple index", scope: "Historical Guntur Taluk", note: "This index preserves the village/deity/festival entries from the source map index. It is a historical administrative snapshot and is not a statement of current district boundaries.", entries: [] };
const fallbackRoutes = [{ route_id: "GHA-ROUTE-0001", name: "Guntur Heritage Temple Trail — Research Route 01", type: "heritage-temple-trail", description: "A first research route connecting documented heritage records around Guntur. This is a planning route, not a claim about the historically original travel sequence.", stops: fallbackTemples.map((t, i) => ({ order: i + 1, entity_type: "temple", entity_id: t.id, name: t.name })) }];
const markerIcon = new L.Icon({ iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png", iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png", shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png", iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41] });

async function getJson(path, fallback) {
  try { const response = await fetch(`${API}${path}`); if (!response.ok) throw new Error("API unavailable"); return await response.json(); }
  catch { return fallback; }
}
function FitToTemples({ temples }) {
  const map = useMap();
  useEffect(() => { const points = temples.filter(t => Number.isFinite(t.latitude) && Number.isFinite(t.longitude)).map(t => [t.latitude, t.longitude]); if (points.length > 1) map.fitBounds(points, { padding: [35, 35] }); }, [map, temples]);
  return null;
}
function HeritageMap({ temples, onSelect, routeStops = [] }) {
  const mapped = temples.filter(t => Number.isFinite(t.latitude) && Number.isFinite(t.longitude));
  const routeIds = new Set(routeStops.map(s => s.entity_id));
  return <div className="real-map-wrap"><MapContainer center={[16.30, 80.52]} zoom={10} scrollWheelZoom={true} className="real-map"><TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" /><FitToTemples temples={mapped} />{mapped.map(temple => <Marker key={temple.id} position={[temple.latitude, temple.longitude]} icon={markerIcon} eventHandlers={{ click: () => onSelect(temple.id) }}><Popup><strong>{routeIds.has(temple.id) ? "Route stop · " : ""}{temple.name}</strong><br />{temple.city}</Popup></Marker>)}</MapContainer><div className="map-credit">Live map tiles: OpenStreetMap · Coordinates are kept as internal map-reference data.</div></div>;
}

function App() {
  const [temples, setTemples] = useState(fallbackTemples), [localities, setLocalities] = useState(fallbackLocalities), [routes, setRoutes] = useState(fallbackRoutes), [historical, setHistorical] = useState(fallbackHistorical), [narratives, setNarratives] = useState([]), [selected, setSelected] = useState(null), [query, setQuery] = useState(""), [tab, setTab] = useState("temples"), [routeId, setRouteId] = useState(fallbackRoutes[0].route_id);
  useEffect(() => {
    getJson("/temples", fallbackTemples).then(async items => setTemples(await Promise.all(items.map(item => getJson(`/temples/${item.id}`, item)))));
    getJson("/localities", fallbackLocalities).then(setLocalities);
    getJson("/routes", fallbackRoutes).then(setRoutes);
    getJson("/historical-observations", []).then(records => { const index = records.find(r => r.record_id === fallbackHistorical.record_id); const narrative = records.find(r => r.record_id === "GHA-HIST-1961-GUNTUR-TALUK-NARRATIVES"); if (index) setHistorical(index); if (narrative) setNarratives(narrative.observations || []); });
  }, []);
  const q = query.trim().toLowerCase();
  const filteredTemples = useMemo(() => !q ? temples : temples.filter(x => `${x.name} ${x.city} ${x.status} ${x.address || ""}`.toLowerCase().includes(q)), [temples, q]);
  const filteredHistorical = useMemo(() => { const e = historical.entries || []; return !q ? e : e.filter(x => `${x.serial} ${x.locality} ${x.deity} ${x.festival_period}`.toLowerCase().includes(q)); }, [historical, q]);
  const filteredLocalities = useMemo(() => !q ? localities : localities.filter(x => `${x.name} ${x.type} ${x.district}`.toLowerCase().includes(q)), [localities, q]);
  const filteredRoutes = useMemo(() => !q ? routes : routes.filter(r => `${r.name} ${r.description} ${r.type}`.toLowerCase().includes(q)), [routes, q]);
  const activeRoute = routes.find(r => r.route_id === routeId) || routes[0];
  const routeTemples = activeRoute ? activeRoute.stops.map(s => temples.find(t => t.id === s.entity_id)).filter(Boolean) : [];
  async function openTemple(id) { setSelected({ type: "temple", data: await getJson(`/temples/${id}`, temples.find(x => x.id === id)) }); }
  async function openLocality(id) { setSelected({ type: "locality", data: await getJson(`/localities/${id}`, localities.find(x => x.id === id)) }); }
  function openHistorical(entry) { const narrative = narratives.find(n => n.locality.toLowerCase() === entry.locality.toLowerCase() || n.locality.toLowerCase().includes(entry.locality.toLowerCase()) || entry.locality.toLowerCase().includes(n.locality.toLowerCase())); setSelected({ type: "historical", data: { ...entry, narrative } }); }
  function openRoute(route) { setRouteId(route.route_id); setSelected({ type: "route", data: route }); }
  const records = tab === "temples" ? filteredTemples : tab === "historical" ? filteredHistorical : tab === "localities" ? filteredLocalities : filteredRoutes;
  return <div className="site-shell">
    <header className="topbar"><div className="brand"><span className="brand-mark">GH</span><span>Guntur Heritage Atlas</span></div><div className="status-dot"><i /> Research edition</div></header>
    <main>
      <section className="hero"><div className="hero-copy"><p className="eyebrow">A living historical map</p><h1>Discover Guntur,<br /><em>one story at a time.</em></h1><p className="hero-text">Explore temples, localities, historical places and the evidence behind their stories. Every record has a source and a verification status.</p><div className="search-wrap"><span>⌕</span><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search temples, places, localities..." /><kbd>⌘ K</kbd></div></div><div className="hero-art" aria-hidden="true"><div className="sun" /><div className="hill hill-one" /><div className="hill hill-two" /><div className="temple-silhouette"><span /><span /><span /><b /></div></div></section>
      <section className="stats-row"><div><strong>{temples.length}</strong><span>Temple records</span></div><div><strong>{historical.entries?.length || 0}</strong><span>Historical 1961</span></div><div><strong>{localities.length}</strong><span>Localities mapped</span></div><div><strong>{routes.length}</strong><span>Research routes</span></div></section>
      <section className="workspace"><div className="section-heading"><div><p className="eyebrow">Explore the atlas</p><h2>Heritage around Guntur</h2></div><div className="tabs"><button className={tab === "temples" ? "active" : ""} onClick={() => setTab("temples")}>Temples</button><button className={tab === "historical" ? "active" : ""} onClick={() => setTab("historical")}>Historical 1961 <span>{historical.entries?.length || 0}</span></button><button className={tab === "localities" ? "active" : ""} onClick={() => setTab("localities")}>Localities</button><button className={tab === "routes" ? "active" : ""} onClick={() => setTab("routes")}>Routes <span>{routes.length}</span></button></div></div>
        {tab === "historical" && <div className="historical-notice"><strong>Historical Guntur Taluk — Census 1961</strong><span>{historical.note}</span></div>}
        {tab === "routes" && <div className="historical-notice"><strong>Research routes</strong><span>Routes connect atlas records for planning. They do not assert that the sequence is an ancient or historically original travel route.</span></div>}
        <div className="content-grid"><div className="record-list">{records.map((item, index) => { const h = tab === "historical", r = tab === "routes"; return <button className={`record-card ${h ? "historical-card" : ""}`} key={h ? item.serial : r ? item.route_id : item.id} onClick={() => h ? openHistorical(item) : r ? openRoute(item) : tab === "temples" ? openTemple(item.id) : openLocality(item.id)}><span className="record-number">{h ? String(item.serial).padStart(2, "0") : String(index + 1).padStart(2, "0")}</span><span className="record-main"><strong>{h ? item.locality : r ? item.name : item.name}</strong><small>{h ? item.deity : r ? `${item.stops?.length || 0} stops · ${item.type}` : tab === "temples" ? item.city : `${item.type || "place"} · ${item.district || "Guntur"}`}</small>{h && <em>{item.festival_period}</em>}{r && <em>{item.description}</em>}</span>{h && <span className="historical-badge">1961</span>}<span className="arrow">↗</span></button>; })}{!records.length && <div className="empty">No records match your search.</div>}</div><div className="map-card"><HeritageMap temples={tab === "routes" ? routeTemples : filteredTemples.length ? filteredTemples : temples} onSelect={openTemple} routeStops={tab === "routes" ? activeRoute?.stops || [] : []} /><div className="map-caption"><strong>{tab === "routes" ? activeRoute?.name || "Research route" : "Actual heritage locations"}</strong><span>{tab === "routes" ? "The map highlights the temple records connected by the selected research route." : "Click a marker to open the researched place record."}</span></div></div></div>
      </section>
      <section className="route-section"><div><p className="eyebrow">Route planner</p><h2>Build your own heritage day.</h2><p>Select a research route to see its stops together on the map. The atlas keeps the historical record separate from the modern route.</p></div><div className="route-steps">{(activeRoute?.stops || []).map(stop => <button className="route-step" key={stop.order} onClick={() => openTemple(stop.entity_id)}><b>{String(stop.order).padStart(2, "0")}</b><span>{stop.name}</span></button>)}</div></section>
    </main>
    <footer><span>Guntur Heritage Atlas</span><span>Evidence before claims · Research edition</span></footer>
    {selected && <div className="overlay" onClick={() => setSelected(null)}><aside className="detail-panel" onClick={e => e.stopPropagation()}><button className="close" onClick={() => setSelected(null)}>×</button><p className="eyebrow">{selected.type === "historical" ? "Historical source record" : selected.type}</p><h2>{selected.type === "historical" ? selected.data.locality : selected.data.name}</h2>
      {selected.type === "temple" && <><div className="tag">{selected.data.status}</div>{(selected.data.media || []).length > 0 && <div className="photo-gallery">{selected.data.media.map(photo => <figure key={photo.url}><img src={photo.url} alt={photo.caption || selected.data.name} /><figcaption>{photo.caption}{photo.credit && <small>{photo.credit}</small>}</figcaption></figure>)}</div>}<p>{selected.data.description || "A research record in the Guntur Heritage Atlas."}</p><div className="location-box"><strong>📍 Address</strong><span>{selected.data.address || "Address not yet verified."}</span><small>Use this address to manually search the temple in Google Maps or another map service.</small></div><h3>Evidence</h3><p className="muted">This record is currently marked <strong>{selected.data.evidence}</strong>. Historical claims are kept separate from tradition until verified.</p><h3>Sources</h3><ul>{(selected.data.sources || []).map(s => <li key={s.id}>{s.title}{s.publisher ? ` — ${s.publisher}` : ""}</li>)}</ul></>}
      {selected.type === "historical" && <><div className="tag">Census 1961 · Historical Guntur Taluk</div><p><strong>{selected.data.deity}</strong></p><p>Festival period: {selected.data.festival_period}</p>{selected.data.narrative && <><h3>Research note</h3><p>{selected.data.narrative.narrative}</p></>}<h3>Source</h3><p className="muted">Census of India, 1961 — Fairs and Festivals, Guntur.</p></>}
      {selected.type === "locality" && <><div className="tag">{selected.data.status}</div><p>{selected.data.history || "Locality research record."}</p><h3>Name origin</h3><p>{selected.data.name_origin || "Not yet documented."}</p><h3>Sources</h3><ul>{(selected.data.sources || []).map(s => <li key={s.id}>{s.title}{s.publisher ? ` — ${s.publisher}` : ""}</li>)}</ul></>}
      {selected.type === "route" && <><div className="tag">Research route</div><p>{selected.data.description}</p><h3>Stops</h3><ol>{(selected.data.stops || []).map(stop => <li key={stop.order}>{stop.name}</li>)}</ol></>}
    </aside></div>}
  </div>;
}

createRoot(document.getElementById("root")).render(<App />);
