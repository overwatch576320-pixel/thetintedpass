import SectionIntro from "../components/SectionIntro";
import { ArrowUpRight, Mail, MessageCircle } from "lucide-react";
import { contactEmail, whatsappLink } from "../lib";

export default function Contact() {
  return <div className="page-shell contact-page">
    <SectionIntro eyebrow="CONTACT" title={<>Start with a<br/><em>conversation.</em></>}>
      Ask us about the journeys, the art practice, dates, group size or what it might be like to travel through Ladakh this way.
    </SectionIntro>
    <div className="contact-options">
      <a href={whatsappLink()} target="_blank" rel="noreferrer" className="contact-option"><MessageCircle size={25}/><span><small>WHATSAPP</small><strong>Message us directly</strong><em>Usually the quickest way to reach us</em></span><ArrowUpRight/></a>
      <a href={`mailto:${contactEmail}`} className="contact-option"><Mail size={25}/><span><small>EMAIL</small><strong>{contactEmail}</strong><em>For detailed enquiries and collaborations</em></span><ArrowUpRight/></a>
    </div>
    <p className="contact-small">The Tinted Pass is currently developing its journeys and departure details. Enquiries are welcome; dates and availability will be confirmed individually.</p>
  </div>;
}
