export default function SectionIntro({ eyebrow, title, children }) {
  return <div className="section-intro">
    {eyebrow && <div className="eyebrow">{eyebrow}</div>}
    <h1>{title}</h1>
    {children && <div className="intro-copy">{children}</div>}
  </div>;
}
