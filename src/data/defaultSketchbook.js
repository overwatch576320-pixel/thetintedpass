/**
 * Default Curated Content for The Tinted Pass 3D Artist's Sketchbook
 * Authentic Trans-Himalayan field notes, sketches, and pigment studies.
 */
export const defaultSketchbookConfig = {
  enabled: true,
  sectionEyebrow: "FIELD NOTES FROM THE HIMALAYAS",
  sectionHeading: "A Journal of Seeing",
  sectionIntro:
    "An interactive, tactile record of field sketches, mineral pigment washes, and high-altitude observations made along the passes.",
  bookTitle: "LADAKH EXPEDITION JOURNAL",
  bookSubtitle: "High-Altitude Plein Air Studies & Monastic Pigments",
  coverEyebrow: "TRANS-HIMALAYAN ATELIER · 2026",
  coverColor: "#1a2522", // Deep Himalayan slate/forest green
  coverImage: null,
  backCoverImage: null,
  pages: [
    {
      id: "page-1",
      template: "full_artwork",
      title: "Plein Air at Hemis Monastery",
      location: "Hemis Precinct, Indus Valley",
      date: "Day 03 · 3,600 m",
      image: "editorial/artidote-editorial.jpg",
      caption: "Morning wash in raw umber and lapis lazuli before morning prayer drums.",
      credit: "Atelier Field Study",
      published: true,
    },
    {
      id: "page-2",
      template: "photo_field_notes",
      title: "Sun-Baked Mud Brick Architecture",
      location: "Basgo Citadel & Alchi",
      date: "Day 05 · 3,120 m",
      image: "manifesto-ladakh-easel.jpg",
      description:
        "The 11th-century mud-brick foundations have endured because of zero annual humidity. When mineral washes hit the dry cotton rag here, the paper drinks the pigment instantly.",
      caption: "Likir apricot orchards visible across the gorge.",
      published: true,
    },
    {
      id: "page-3",
      template: "sketch_annotation",
      title: "Mural Pigment Analysis",
      location: "Alchi Sumtseg Assembly Hall",
      date: "Day 06 · 3,120 m",
      image: "editorial/mountain-notes.jpg",
      caption: "Studying 1,000-year-old Kashmiri-Buddhist fresco details.",
      annotations: [
        { text: "Pure Badakhshan Lapis Wash", x: "15%", y: "24%" },
        { text: "Cinnabar Mineral Outlines", x: "42%", y: "48%" },
        { text: "Organic Tree Gum Binder", x: "20%", y: "72%" },
      ],
      published: true,
    },
    {
      id: "page-4",
      template: "two_image_spread",
      title: "Light Studies: Morning vs Twilight",
      location: "Nubra Valley & Diskit Dunes",
      date: "Day 08 · 3,100 m",
      image: "editorial/mountain-peaks.jpg",
      imageLabel: "07:15 AM · Solar Crest",
      secondaryImage: "editorial/oil-clouds.jpg",
      secondaryCaption: "06:40 PM · Cobalt Twilight",
      description:
        "Observing dramatic lumen shifts against the snowline of the Karakoram range.",
      published: true,
    },
    {
      id: "page-5",
      template: "map_route",
      title: "Passage Over Khardung La",
      location: "Khardung La Pass",
      date: "Day 07 · 5,360 m",
      routeStation: "High Pass Ascent · 5,360 m",
      image: "figma/ladakh-contour-map.png",
      description:
        "Tracing the historic caravan pass linking the Indus Valley to Central Asia. Rapid ink sketches executed in freezing mountain air.",
      published: true,
    },
    {
      id: "page-6",
      template: "material_study",
      title: "Trans-Himalayan Pigment Palette",
      location: "Base Camp Studio, Leh",
      date: "Day 02 · 3,524 m",
      image: "editorial/topographic-relief.jpg",
      swatches: [
        { name: "Lapis Lazuli", color: "#1e3a8a", code: "Badakhshan" },
        { name: "Malachite", color: "#065f46", code: "Copper Vein" },
        { name: "Cinnabar", color: "#991b1b", code: "Mountain Cleft" },
        { name: "Apricot Wash", color: "#c2410c", code: "Alchi Clay" },
      ],
      description:
        "All pigments ground on porphyry stone slabs with glacier water and natural acacia binder.",
      published: true,
    },
    {
      id: "page-7",
      template: "editorial",
      title: "The Deceleration of Seeing",
      chapter: "ATELIER THESIS · FOLIO 07",
      pullQuote:
        "We do not travel to conquer the passes, but to forge an intimate dialogue through paper and stone.",
      image: "editorial/traveler-trail.png",
      description:
        "The accordion sketchbook becomes a physical timeline of transformation. Each wash holds the dust of the valley and the stillness of the mountain evening.",
      published: true,
    },
  ],
};
