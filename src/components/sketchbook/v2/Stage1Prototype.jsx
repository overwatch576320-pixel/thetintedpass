import { useState } from "react";
import { PhysicalBook } from "./PhysicalBook";
import { DEFAULT_BOOK_COLLECTION } from "../../../data/defaultBookCollection";

/**
 * Stage 1 Prototype: Standalone Physical Hardcover Sketchbook
 * Used to verify:
 * 1. Physical hardcover opening from spine hinge
 * 2. Physical hardcover closing
 * 3. 3D flexible paper deformation & corner curling
 * 4. Forward and backward page turning
 * 5. Desktop pointer drag and follow
 * 6. Mobile tap, swipe, and rapid turns
 * 7. Closing from back cover
 */
export default function Stage1Prototype() {
  const [selectedBookIndex, setSelectedBookIndex] = useState(0);
  const [page, setPage] = useState(0);
  const [lastAction, setLastAction] = useState("Initialized (Closed Cover)");

  const book = DEFAULT_BOOK_COLLECTION[selectedBookIndex] || DEFAULT_BOOK_COLLECTION[0];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #09121a 0%, #15222e 60%, #1a2a38 100%)",
        color: "#f5f5f5",
        padding: "40px 20px",
        boxSizing: "border-box",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div style={{ textAlign: "center", maxWidth: 640, marginBottom: 24 }}>
        <div
          style={{
            fontSize: 11,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "#64b5f6",
            marginBottom: 8,
          }}
        >
          STAGE 1 VERIFICATION PROTOTYPE
        </div>
        <h1 style={{ fontSize: 24, margin: "0 0 10px 0", fontWeight: 400, letterSpacing: "-0.01em" }}>
          Physical 3D Sketchbook Engine
        </h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", margin: 0, lineHeight: 1.5 }}>
          Reference:{" "}
          <a
            href="https://niyamax.github.io/sketchbook/"
            target="_blank"
            rel="noreferrer"
            style={{ color: "#90caf9", textDecoration: "underline" }}
          >
            https://niyamax.github.io/sketchbook/
          </a>
          <br />
          Drag page corners or tap edges to turn. Tapping right edge opens cover; swiping back from page 1 closes it.
        </p>
      </div>

      {/* Book selector to test with different mineral palettes */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 28,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {DEFAULT_BOOK_COLLECTION.map((b, idx) => (
          <button
            key={b.id}
            type="button"
            onClick={() => {
              setSelectedBookIndex(idx);
              setPage(0);
              setLastAction(`Selected book: ${b.title}`);
            }}
            style={{
              padding: "6px 14px",
              borderRadius: 20,
              fontSize: 12,
              background: selectedBookIndex === idx ? b.coverColor : "rgba(255,255,255,0.06)",
              color: selectedBookIndex === idx ? "#ffffff" : "rgba(255,255,255,0.7)",
              border: selectedBookIndex === idx ? "1px solid rgba(255,255,255,0.4)" : "1px solid rgba(255,255,255,0.1)",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            {b.title}
          </button>
        ))}
      </div>

      {/* Standalone Physical Book Component */}
      <div
        style={{
          width: "100%",
          maxWidth: 360,
          margin: "0 auto",
          position: "relative",
        }}
      >
        <PhysicalBook
          book={book}
          currentPage={page}
          onPageChange={(newPage) => {
            setPage(newPage);
            setLastAction(`Turned to page ${newPage}`);
          }}
          onOpen={() => setLastAction("Hardcover Opened from Spine Hinge")}
          onClose={(side) => setLastAction(`Book Closed from ${side} cover`)}
        />
      </div>

      {/* Diagnostics Panel */}
      <div
        style={{
          marginTop: 32,
          padding: "16px 24px",
          background: "rgba(0,0,0,0.35)",
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.08)",
          width: "100%",
          maxWidth: 420,
          fontSize: 12,
          lineHeight: 1.6,
        }}
      >
        <div style={{ fontWeight: 600, color: "#64b5f6", marginBottom: 6 }}>
          Diagnostic Status
        </div>
        <div><strong>Current Slot:</strong> {page} ({page === 0 ? "Closed Front Cover" : page >= 9 ? "Closed Back Cover" : `Page ${page}`})</div>
        <div><strong>Last Action:</strong> {lastAction}</div>
        <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => setPage(0)}
            style={{
              padding: "4px 10px",
              background: "#263238",
              color: "#fff",
              border: "1px solid #455a64",
              borderRadius: 6,
              fontSize: 11,
              cursor: "pointer",
            }}
          >
            Reset to Cover (Page 0)
          </button>
          <button
            type="button"
            onClick={() => setPage(1)}
            style={{
              padding: "4px 10px",
              background: "#263238",
              color: "#fff",
              border: "1px solid #455a64",
              borderRadius: 6,
              fontSize: 11,
              cursor: "pointer",
            }}
          >
            Jump to Spread 1
          </button>
          <button
            type="button"
            onClick={() => setPage(8)}
            style={{
              padding: "4px 10px",
              background: "#263238",
              color: "#fff",
              border: "1px solid #455a64",
              borderRadius: 6,
              fontSize: 11,
              cursor: "pointer",
            }}
          >
            Jump to Last Page
          </button>
        </div>
      </div>
    </div>
  );
}
