import SectionIntro from "../components/SectionIntro";

const practices = [
  ["01", "Field sketching", "Quick drawings that capture the first impression: a ridge line, a doorway, a person at work or the shape of a shadow."],
  ["02", "Watercolour & gouache", "Small colour studies and selected larger works, developed at a pace that fits the landscape and the day."],
  ["03", "The A5 travel book", "A custom travel guide and notebook with room for maps, daily notes, sketches, photographs and reflections."],
  ["04", "Clay printmaking", "A possible hands-on session inspired by local visual forms. Any activity is designed to avoid touching or taking impressions from heritage sites."],
  ["05", "A collected record", "Participants can contribute selected work, writing and photographs to a year-end magazine. Any exhibition or closing show is optional and not guaranteed."]
];

export default function ArtPractice() {
  return <div className="page-shell">
    <SectionIntro eyebrow="THE PRACTICE" title={<>Make a record<br/><em>of what you notice.</em></>}>
      You do not need to arrive as an accomplished artist. You only need curiosity and a willingness to spend time with a place. Materials and guidance are planned as part of the journey.
    </SectionIntro>
    <div className="practice-hero"><div className="practice-hero-image"></div><div><div className="eyebrow">A PORTABLE STUDIO</div><h2>Made for the field,<br/><em>not the classroom.</em></h2><p>We choose portable materials and paper-based formats that can be used outdoors, packed away easily and revisited later. The exact kit is tailored to the route and confirmed before departure.</p></div></div>
    <div className="practice-list">{practices.map(([n,t,d]) => <div className="practice-row" key={n}><span>{n}</span><h3>{t}</h3><p>{d}</p></div>)}</div>
    <div className="materials-note"><span className="eyebrow">MATERIALS</span><p>Watercolour, gouache, graphite, ink, selected paper sizes, small panels and shared field equipment are among the proposed materials. The final kit list will be shared with participants before the journey.</p></div>
  </div>;
}
