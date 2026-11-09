import { useMemo, useState } from "react";
import { ArrowUpRight, Clock3, MapPin, X } from "lucide-react";
import SectionIntro from "../components/SectionIntro";
import TerrainMap from "../components/TerrainMap";
import { journeys, landmarks } from "../data/siteData";
import { whatsappLink } from "../lib";

export default function Journeys() {
  const [activeId, setActiveId] = useState(journeys[0].id);
  const [selected, setSelected] = useState("Leh");
  const [showDays, setShowDays] = useState(false);
  const journey = useMemo(() => journeys.find(j => j.id === activeId) || journeys[0], [activeId]);
  const place = landmarks[selected] || landmarks.Leh;
  const selectJourney = id => {
    const next = journeys.find(j => j.id === id);
    setActiveId(id);
    setSelected(next?.route[0] || "Leh");
  };

  return <div className="page-shell journeys-page">
    <SectionIntro eyebrow="THE JOURNEYS" title={<>A shared landscape.<br/><em>Different ways through.</em></>}>
      Choose a journey to trace its route across the same stylised terrain map. Select a place to open its story, historical context and the creative work planned for that day.
    </SectionIntro>

    <div className="journey-tabs">
      {journeys.map(j => <button key={j.id} className={activeId === j.id ? "journey-tab active" : "journey-tab"} onClick={() => selectJourney(j.id)}>
        <span>{j.length}</span><strong>{j.name}</strong><small>{j.note}</small>
      </button>)}
    </div>
    <div className="journey-summary"><div><div className="eyebrow">{journey.length.toUpperCase()} · {journey.note.toUpperCase()}</div><h2>{journey.name}</h2><p>{journey.description}</p></div><a className="button button-dark" href={whatsappLink(`Hello, please send me details about ${journey.name} (${journey.length}).`)} target="_blank" rel="noreferrer">Enquire about this journey <ArrowUpRight size={15}/></a></div>

    <div className="map-layout">
      <TerrainMap route={journey.route} selected={selected} onSelect={setSelected}/>
      <aside className="landmark-panel">
        <div className="panel-topline"><span>SELECTED LANDMARK</span><span>01 — 0{journey.route.length}</span></div>
        <img src={place.image} alt={`Landscape around ${place.name}`} className="landmark-image"/>
        <div className="landmark-content">
          <div className="eyebrow">{place.region} · {place.elevation}</div>
          <h2>{place.name}</h2><p>{place.description}</p>
          <div className="traveller-card"><div className="traveller-placeholder">HISTORICAL<br/>CONTEXT</div><div><span>ARTIST / TRAVELLER</span><strong>{place.traveller}</strong><small>{place.travellerNote}</small></div></div>
          <div className="day-plan"><span>THE DAY’S PLAN</span><p>{place.dayPlan}</p></div>
        </div>
      </aside>
    </div>

    <section className="day-list-section">
      <button className="day-list-toggle" onClick={() => setShowDays(!showDays)}>
        <span><span className="eyebrow">THE ITINERARY</span><strong>Explore the days, one by one</strong></span><span>{showDays ? "CLOSE −" : "OPEN +"}</span>
      </button>
      {showDays && <div className="day-list">
        {journey.days.map(day => <button className={selected === day.place ? "day-row selected" : "day-row"} key={day.day} onClick={() => setSelected(day.place)}>
          <span className="day-number">DAY {String(day.day).padStart(2,"0")}</span><span className="day-place">{day.place}</span><span className="day-description"><strong>{day.title}</strong><small>{day.activity}</small></span><span className="day-kind">{day.kind}</span>
        </button>)}
      </div>}
    </section>
    <p className="route-note"><Clock3 size={14}/> Itineraries are working concepts. Final sequencing, travel times and access are confirmed with local operators before a journey is offered for booking. Remote routes are subject to permits, weather and safety.</p>
  </div>;
}
