import SectionIntro from "../components/SectionIntro";

export default function About() {
  return <div className="page-shell">
    <SectionIntro eyebrow="THE IDEA" title={<>A journey through<br/><em>the artist’s eye.</em></>}>
      The Tinted Pass is an invitation to experience Ladakh through art, history and attentive travel. We create space to look closely, learn the stories of the region and make work shaped by your own encounters.
    </SectionIntro>
    <div className="about-feature">
      <div className="about-photo"></div>
      <div className="about-feature-copy"><div className="eyebrow">OUR POINT OF VIEW</div><h2>Art is not an activity added to the itinerary.<br/><em>It is the way through it.</em></h2><p>Our journeys are built around time spent observing and creating. Historical artists, explorers and writers offer a point of departure — not a template to copy. Their journeys help us ask better questions of a place, while your sketchbook becomes a record of what you discover.</p></div>
    </div>
    <section className="values-grid section-pad">
      <div><span>01</span><h3>Slow by design</h3><p>We leave room for acclimatisation, travel, setup and the time it takes to make thoughtful work.</p></div>
      <div><span>02</span><h3>History as a lens</h3><p>We introduce the artists and travellers connected to Ladakh, with care for context and historical accuracy.</p></div>
      <div><span>03</span><h3>Make it your own</h3><p>Beginners and experienced makers are welcome. The aim is personal expression, not perfect imitation.</p></div>
      <div><span>04</span><h3>Leave a light trace</h3><p>We aim to travel respectfully, work with local knowledge and treat cultural places with care.</p></div>
    </section>
    <section className="quote-band"><p>“The purpose is not to paint what someone else saw.<br/><em>It is to learn how to see for yourself.</em>”</p></section>
  </div>;
}
