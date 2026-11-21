export default function TickerBand({ items }) {
  const content = items || [
    "ART AS THE ANTIDOTE FOR LIFE",
    "PLEIN-AIR FIELD DRAWINGS",
    "1,000-YEAR MONASTIC FRESCOES",
    "HANDMADE 320GSM KHADI PAPER",
    "ANCIENT SILK ROUTE VALLEYS",
    "MINERAL PIGMENTS & WATERCOLOURS",
    "THE HEIRLOOM TRAVEL BOOK",
    "PANGONG TSO ULTRAMARINE SKIES"
  ];

  return (
    <div className="ticker-band-wrap">
      <div className="ticker-band-track">
        {[...content, ...content, ...content].map((text, idx) => (
          <span key={idx} className="ticker-item">
            <span className="ticker-glyph">✦</span>
            <span>{text}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
