/**
 * Default Curated Content for The Tinted Pass Open 3D Artist's Sketchbook
 * Arranged as a physical double-page spread lying open on the table.
 * Minimum 4 individual pages (Spread 1: Pages 1 & 2, Spread 2: Pages 3 & 4).
 */
export const defaultSketchbookConfig = {
  enabled: true,
  bookTitle: "LADAKH EXPEDITION JOURNAL",
  bookSubtitle: "High-Altitude Plein Air Studies",
  coverColor: "#1a2522",
  pages: [
    {
      id: "page-1",
      pageNumber: 1,
      title: "Atelier Field Study I",
      caption: "Architectural line sketch · Basgo stone steps & courtyard",
      location: "Basgo Citadel, Ladakh",
      date: "Day 01 · 3,120 m",
      image: "/editorial/sketch-placeholder-1.png",
      isBlank: false,
      published: true,
    },
    {
      id: "page-2",
      pageNumber: 2,
      title: "Atelier Field Study II",
      caption: "Plein air portrait study · Morning observation by the window",
      location: "Old Town Precinct, Leh",
      date: "Day 02 · 3,524 m",
      image: "/editorial/sketch-placeholder-2.png",
      isBlank: false,
      published: true,
    },
    {
      id: "page-3",
      pageNumber: 3,
      title: "Blank Folio",
      caption: "Handmade Himalayan cotton rag paper · Ready for field wash",
      location: "Plein Air Sanctuary",
      date: "Day 03",
      image: null,
      isBlank: true,
      published: true,
    },
    {
      id: "page-4",
      pageNumber: 4,
      title: "Blank Folio",
      caption: "Handmade Himalayan cotton rag paper · Ready for field wash",
      location: "Plein Air Sanctuary",
      date: "Day 04",
      image: null,
      isBlank: true,
      published: true,
    },
  ],
};
