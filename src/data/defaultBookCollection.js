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
 * Currently initialized with clean, warm off-white blank pages ready for future content.
 */

export const DEFAULT_BOOK_COLLECTION = [
  {
    id: "book-1",
    title: "ALCHI CHOSKOR",
    subtitle: "Ultramarine & Lapis Studies",
    edition: "COHORT 01 · 3,120M",
    coverColor: "#1b3358", // Deep Himalayan Lapis Lazuli
    edgeColor: "#0f1e33",
    paperColor: "#fbf8f0",
    pageCount: 6,
    pages: [
      { id: "b1-p1", pageNumber: 1, isBlank: true, published: true },
      { id: "b1-p2", pageNumber: 2, isBlank: true, published: true },
      { id: "b1-p3", pageNumber: 3, isBlank: true, published: true },
      { id: "b1-p4", pageNumber: 4, isBlank: true, published: true },
      { id: "b1-p5", pageNumber: 5, isBlank: true, published: true },
      { id: "b1-p6", pageNumber: 6, isBlank: true, published: true },
    ],
  },
  {
    id: "book-2",
    title: "BASGO CITADEL",
    subtitle: "Trans-Himalayan Pass Journal",
    edition: "COHORT 02 · 3,524M",
    coverColor: "#1c2328", // Deep Obsidian Slate
    edgeColor: "#101417",
    paperColor: "#fbf8f0",
    pageCount: 6,
    pages: [
      { id: "b2-p1", pageNumber: 1, isBlank: true, published: true },
      { id: "b2-p2", pageNumber: 2, isBlank: true, published: true },
      { id: "b2-p3", pageNumber: 3, isBlank: true, published: true },
      { id: "b2-p4", pageNumber: 4, isBlank: true, published: true },
      { id: "b2-p5", pageNumber: 5, isBlank: true, published: true },
      { id: "b2-p6", pageNumber: 6, isBlank: true, published: true },
    ],
  },
  {
    id: "book-3",
    title: "HEMIS MONASTERY",
    subtitle: "Monastic Ochre & Murals",
    edition: "COHORT 03 · 3,650M",
    coverColor: "#8f3d2a", // Monastic Terra Cotta / Raw Ochre
    edgeColor: "#592418",
    paperColor: "#fbf8f0",
    pageCount: 6,
    pages: [
      { id: "b3-p1", pageNumber: 1, isBlank: true, published: true },
      { id: "b3-p2", pageNumber: 2, isBlank: true, published: true },
      { id: "b3-p3", pageNumber: 3, isBlank: true, published: true },
      { id: "b3-p4", pageNumber: 4, isBlank: true, published: true },
      { id: "b3-p5", pageNumber: 5, isBlank: true, published: true },
      { id: "b3-p6", pageNumber: 6, isBlank: true, published: true },
    ],
  },
  {
    id: "book-4",
    title: "NUBRA VALLEY",
    subtitle: "Sand Dunes & High Sanctuaries",
    edition: "COHORT 04 · 3,048M",
    coverColor: "#1e382b", // Himalayan Juniper / Pine
    edgeColor: "#102118",
    paperColor: "#fbf8f0",
    pageCount: 6,
    pages: [
      { id: "b4-p1", pageNumber: 1, isBlank: true, published: true },
      { id: "b4-p2", pageNumber: 2, isBlank: true, published: true },
      { id: "b4-p3", pageNumber: 3, isBlank: true, published: true },
      { id: "b4-p4", pageNumber: 4, isBlank: true, published: true },
      { id: "b4-p5", pageNumber: 5, isBlank: true, published: true },
      { id: "b4-p6", pageNumber: 6, isBlank: true, published: true },
    ],
  },
  {
    id: "book-5",
    title: "LIKIR SANCTUARY",
    subtitle: "Meltwater & Mineral Pigments",
    edition: "COHORT 05 · 3,700M",
    coverColor: "#135460", // Deep Tibetan Turquoise
    edgeColor: "#0b3138",
    paperColor: "#fbf8f0",
    pageCount: 6,
    pages: [
      { id: "b5-p1", pageNumber: 1, isBlank: true, published: true },
      { id: "b5-p2", pageNumber: 2, isBlank: true, published: true },
      { id: "b5-p3", pageNumber: 3, isBlank: true, published: true },
      { id: "b5-p4", pageNumber: 4, isBlank: true, published: true },
      { id: "b5-p5", pageNumber: 5, isBlank: true, published: true },
      { id: "b5-p6", pageNumber: 6, isBlank: true, published: true },
    ],
  },
];
