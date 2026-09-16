import React from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

function App() {
  return (
    <main className="app">
      <header>
        <p className="eyebrow">Guntur Heritage Atlas</p>
        <h1>Explore Guntur through its heritage.</h1>
        <p className="intro">Temples, localities, people, events, routes, and the sources that document them.</p>
      </header>
      <section className="cards">
        <article><strong>Temples</strong><span>0 records loaded</span></article>
        <article><strong>Localities</strong><span>Coming next</span></article>
        <article><strong>Heritage routes</strong><span>Coming next</span></article>
      </section>
      <section className="map-placeholder">
        <h2>Guntur heritage map</h2>
        <p>The interactive map will appear here after the first verified locations are added.</p>
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
