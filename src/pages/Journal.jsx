import SectionIntro from "../components/SectionIntro";

export default function Journal() {
  return <div className="page-shell">
    <SectionIntro eyebrow="FIELD NOTES" title={<>A place for the things<br/><em>we bring back.</em></>}>
      Notes from the road, works in progress, conversations and small observations from Ladakh. This section will grow with the journeys.
    </SectionIntro>
    <div className="journal-grid">
      <article className="journal-card large"><div className="journal-image journal-img-a"></div><div className="eyebrow">LANDSCAPE · 01</div><h2>Learning to look at a mountain</h2><p>A field note on distance, scale and the first marks made in a sketchbook.</p><span>COMING SOON</span></article>
      <article className="journal-card"><div className="journal-image journal-img-b"></div><div className="eyebrow">THE TRAVEL BOOK · 02</div><h2>A page for every day</h2><p>Why the A5 book is designed to travel, collect and remember.</p><span>COMING SOON</span></article>
      <article className="journal-card"><div className="journal-image journal-img-c"></div><div className="eyebrow">HISTORY · 03</div><h2>Following earlier footsteps</h2><p>Introducing the artists and travellers whose journeys open a conversation with Ladakh.</p><span>COMING SOON</span></article>
    </div>
  </div>;
}
