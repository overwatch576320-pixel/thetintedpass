import { InteractiveBookCollection } from "./InteractiveBookCollection";
import { DEFAULT_BOOK_COLLECTION } from "../../../data/defaultBookCollection";

/**
 * Stage 3 Prototype: Full Integrated Collection
 * Combines Swiper Coverflow Outer Carousel with PhysicalBook Instances.
 */
export default function Stage3Prototype() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #09121a 0%, #15222e 60%, #1a2a38 100%)",
        color: "#f5f5f5",
        padding: "30px 10px",
        boxSizing: "border-box",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div style={{ textAlign: "center", maxWidth: 640, marginBottom: 16 }}>
        <div
          style={{
            fontSize: 11,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "#64b5f6",
            marginBottom: 6,
          }}
        >
          STAGE 3 INTEGRATION PROTOTYPE
        </div>
        <h1 style={{ fontSize: 22, margin: "0 0 8px 0", fontWeight: 400 }}>
          3D Interactive Book Collection
        </h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", margin: 0 }}>
          Swipe horizontally to browse books. Click the center book right edge to open around its spine hinge.
        </p>
      </div>

      <div style={{ width: "100%", maxWidth: 1100 }}>
        <InteractiveBookCollection books={DEFAULT_BOOK_COLLECTION} />
      </div>
    </div>
  );
}
