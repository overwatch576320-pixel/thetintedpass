import SectionIntro from "../components/SectionIntro";
import { ArrowUpRight, Check } from "lucide-react";
import { whatsappLink } from "../lib";

export default function Pricing() {
  return <div className="page-shell">
    <SectionIntro eyebrow="JOURNEY DETAILS" title={<>Thoughtfully planned.<br/><em>Personal by nature.</em></>}>
      The Tinted Pass is designed as a small-group experience. Each journey is priced around its final route, group size, accommodation, transport, local collaborators and art materials.
    </SectionIntro>
    <div className="pricing-grid">
      <article className="price-card"><div className="eyebrow">THE ESSENTIAL JOURNEY</div><h2>The First Light</h2><div className="price-length">10 DAYS · LEH / SHAM / NUBRA / PANGONG</div><p>A focused introduction to the landscapes and creative rhythm of Ladakh.</p><ul><li><Check/> Small-group format</li><li><Check/> Accommodation and ground transport</li><li><Check/> Planned art materials and facilitation</li><li><Check/> A5 travel book</li><li><Check/> Local knowledge and route planning</li></ul><a className="button button-dark" href={whatsappLink("Hello, I would like pricing details for The First Light, the 10-day journey.")} target="_blank" rel="noreferrer">Request current pricing <ArrowUpRight size={15}/></a></article>
      <article className="price-card featured"><div className="eyebrow">THE EXTENDED PASSAGE</div><h2>Beyond the Blue</h2><div className="price-length">14 DAYS · WITH POSSIBLE CHANGTHANG EXTENSION</div><p>More time for field work, rest and a possible extension beyond Pangong.</p><ul><li><Check/> Everything in The First Light</li><li><Check/> Additional field and rest days</li><li><Check/> Extended route planning</li><li><Check/> Possible Nyoma / Chumathang passage</li><li><Check/> Subject to local route and permit confirmation</li></ul><a className="button button-dark" href={whatsappLink("Hello, I would like pricing details for Beyond the Blue, the 14-day journey.")} target="_blank" rel="noreferrer">Request current pricing <ArrowUpRight size={15}/></a></article>
    </div>
    <div className="pricing-footnote"><strong>Why no fixed price here?</strong><p>Pricing should be published only after accommodation, transport, staffing, materials, taxes and group size have been confirmed. Contact us for the current quotation and a clear list of inclusions and exclusions. No exhibition is included as a guaranteed deliverable.</p></div>
  </div>;
}
