/**
 * Default 3D Book Collection for The Tinted Pass
 * 5 independent books with distinct solid-colour covers inspired by Himalayan minerals:
 * 1. Alchi Lapis Lazuli (#1b3358)
 * 2. Basgo Obsidian Slate (#1c2328)
 * 3. Hemis Monastic Terra Cotta (#8f3d2a)
 * 4. Nubra Himalayan Juniper (#1e382b)
 * 5. Likir Tibetan Turquoise (#135460)
 *
 * Each book maintains its own independent page structure, page count, and state.
 * Initialized with clean, warm off-white blank pages ready for future content.
 */

function createBlankPages(count = 8) {
  return Array.from({ length: count }, (_, i) => ({
    id: `folio-${i + 1}`,
    pageNumber: i + 1,
    isBlank: true,
    published: true,
  }));
}

export const DEFAULT_BOOK_COLLECTION = [
  {
    id: "book-1",
    title: "ALCHI CHOSKOR",
    subtitle: "Ultramarine & Lapis Studies",
    edition: "COHORT 01 · 3,120M",
    coverColor: "#1b3358", // Deep Himalayan Lapis Lazuli
    edgeColor: "#0f1e33",
    paperColor: "#fbf8f0",
    coverImage: "/editorial/sketchbook-a4-cover.jpg",
    pageCount: 8,
    pages: createBlankPages(8),
  },
  {
    id: "book-2",
    title: "BASGO CITADEL",
    subtitle: "Trans-Himalayan Pass Journal",
    edition: "COHORT 02 · 3,524M",
    coverColor: "#1c2328", // Deep Obsidian Slate
    edgeColor: "#101417",
    paperColor: "#fbf8f0",
    coverImage: "/editorial/sketchbook-a4-cover.jpg",
    pageCount: 8,
    pages: createBlankPages(8),
  },
  {
    id: "book-3",
    title: "HEMIS MONASTERY",
    subtitle: "Monastic Ochre & Murals",
    edition: "COHORT 03 · 3,650M",
    coverColor: "#8f3d2a", // Monastic Terra Cotta / Raw Ochre
    edgeColor: "#592418",
    paperColor: "#fbf8f0",
    coverImage: "/editorial/sketchbook-a4-cover.jpg",
    pageCount: 8,
    pages: createBlankPages(8),
  },
  {
    id: "book-4",
    title: "NUBRA VALLEY",
    subtitle: "Sand Dunes & High Sanctuaries",
    edition: "COHORT 04 · 3,048M",
    coverColor: "#1e382b", // Himalayan Juniper / Pine
    edgeColor: "#102118",
    paperColor: "#fbf8f0",
    coverImage: "/editorial/sketchbook-a4-cover.jpg",
    pageCount: 8,
    pages: createBlankPages(8),
  },
  {
    id: "book-5",
    title: "LIKIR SANCTUARY",
    subtitle: "Meltwater & Mineral Pigments",
    edition: "COHORT 05 · 3,700M",
    coverColor: "#135460", // Deep Tibetan Turquoise
    edgeColor: "#0b3138",
    paperColor: "#fbf8f0",
    coverImage: "/editorial/sketchbook-a4-cover.jpg",
    pageCount: 8,
    pages: createBlankPages(8),
  },
];
