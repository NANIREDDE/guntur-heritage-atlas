import { useEffect, useState } from 'react'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import L from 'leaflet'

const fallbackCenter = [16.3067, 80.4365]

const icon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

export default function App() {
  const [temples, setTemples] = useState([])
  const [selected, setSelected] = useState(null)
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/temples')
      .then((response) => {
        if (!response.ok) throw new Error('Unable to load temple data')
        return response.json()
      })
      .then((data) => setTemples(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const filtered = temples.filter((temple) =>
    temple.name.toLowerCase().includes(query.toLowerCase()),
  )

  const openTemple = async (id) => {
    const response = await fetch(`/api/temples/${id}`)
    if (response.ok) setSelected(await response.json())
  }

  return (
    <main className="app-shell">
      <header className="hero">
        <p className="eyebrow">GUNTUR HERITAGE ATLAS</p>
        <h1>Temples, places, people & stories — connected.</h1>
        <p className="intro">A research-first digital atlas of Guntur's heritage, built from documented sources and clearly marked traditions.</p>
        <input aria-label="Search temples" placeholder="Search temples..." value={query} onChange={(e) => setQuery(e.target.value)} />
      </header>

      {error && <div className="error">{error}. Start the backend on port 8000.</div>}
      {loading && <p className="state">Loading heritage records...</p>}

      <section className="content-grid">
        <div className="panel">
          <div className="section-heading"><h2>Temples</h2><span>{filtered.length}</span></div>
          {filtered.map((temple) => (
            <button className="temple-card" key={temple.id} onClick={() => openTemple(temple.id)}>
              <strong>{temple.name}</strong>
              <span>{temple.status}</span>
            </button>
          ))}
          {!loading && filtered.length === 0 && <p className="state">No temples match your search.</p>}
        </div>

        <div className="map-panel">
          <MapContainer center={fallbackCenter} zoom={12} scrollWheelZoom className="map">
            <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {selected?.latitude && selected?.longitude && (
              <Marker position={[selected.latitude, selected.longitude]} icon={icon}>
                <Popup>{selected.name}</Popup>
              </Marker>
            )}
          </MapContainer>
          <p className="map-note">Only verified coordinates will be plotted as the dataset grows.</p>
        </div>
      </section>

      {selected && (
        <section className="detail-card">
          <button className="close" onClick={() => setSelected(null)}>Close</button>
          <p className="eyebrow">{selected.id}</p>
          <h2>{selected.name}</h2>
          <p>{selected.description || 'Description pending research.'}</p>
          <dl>
            <dt>Deity</dt><dd>{selected.deity || 'Not yet verified'}</dd>
            <dt>Locality</dt><dd>{selected.locality || 'Not yet verified'}</dd>
            <dt>Evidence</dt><dd>{selected.evidence}</dd>
          </dl>
        </section>
      )}
    </main>
  )
}
