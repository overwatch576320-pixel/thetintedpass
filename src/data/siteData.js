// The Tinted Pass — Complete Authentic Data Architecture
// Extracted directly from official tour itineraries and project archives

export const journeyItineraries = [
  {
    id: "itinerary-10-day",
    slug: "first-light",
    title: "The First Light",
    subtitle: "Leh, Alchi, Nubra & Pangong Tso",
    length: "10 Days",
    nights: "9 Nights",
    category: "The Essential Journey",
    focus: "Monastery and mural art, village life, Silk Road history, dunes and the lake",
    maxAltitude: "4,250 m (Pangong Tso)",
    regions: ["Leh", "Alchi (Sham Valley)", "Nubra Valley", "Pangong Tso"],
    highlight: "Monasteries, a village night, the Nubra dunes and high lake morning light studies, with no Hemis or Stok.",
    tagline: "A focused introduction to the landscapes and creative rhythm of Ladakh.",
    practicalNotes: [
      "A full plan with little slack: Day 1 is dedicated to altitude rest, and Day 5 is light.",
      "Nubra comes before Pangong because it is lower (3,100 m), providing optimal acclimatisation for the higher lake (4,250 m).",
      "Khardung La is approx. 5,360 m; pass-top sketch stops are kept brief for safety.",
      "The direct Nubra to Pangong road via the Shyok route is subject to weather and permits."
    ],
    days: [
      {
        day: 1,
        place: "Leh Arrival",
        region: "Central Ladakh",
        altitude: "3,524 m",
        travelerLink: "Your own first impression",
        artExercise: "Rest only for altitude acclimatisation; first journal notes.",
        kind: "Acclimatisation & Rest"
      },
      {
        day: 2,
        place: "Leh Old Town & Bazaar",
        region: "Central Ladakh",
        altitude: "3,524 m",
        travelerLink: "William Simpson (1860 Victorian artist)",
        artExercise: "Quick street sketches of alleyways and stupas, then a first still life with local brass and dried apricots.",
        kind: "Street Sketching & Still Life"
      },
      {
        day: 3,
        place: "Thiksey & Shey Monasteries",
        region: "Indus Valley",
        altitude: "3,600 m",
        travelerLink: "Andrew Harvey (Author of 'A Journey in Ladakh')",
        artExercise: "Monastery tiered architecture, quiet courtyard sketching, light and shadow journaling.",
        kind: "Architectural Drawing"
      },
      {
        day: 4,
        place: "Leh to Alchi via Basgo",
        region: "Sham Valley",
        altitude: "3,120 m",
        travelerLink: "Lotsawa Rinchen Zangpo (10th-century translator)",
        artExercise: "Basgo ruined fortress sketch stop, then 11th-century mural studies at Alchi; overnight homestay in the village.",
        kind: "Mural Studies & Homestay"
      },
      {
        day: 5,
        place: "Alchi Village Morning & Return via Likir",
        region: "Sham Valley",
        altitude: "3,120 m to 3,524 m",
        travelerLink: "Léa Lafugie & Pilgrim Hyecho",
        artExercise: "Morning still life and portraits of local models; Likir monastery sketch stop; evening fireside stories of early pilgrims.",
        kind: "Portraiture & Oral History"
      },
      {
        day: 6,
        place: "Leh to Nubra over Khardung La",
        region: "Nubra Valley",
        altitude: "Pass: 5,359 m · Valley: 3,100 m",
        travelerLink: "Mirza Muhammad Haidar Dughlat (16th-century Mughal chronicler)",
        artExercise: "Short pass-top sketch stop above the clouds, then sweeping valley landscape study upon arrival at Diskit.",
        kind: "High Pass & Landscape"
      },
      {
        day: 7,
        place: "Nubra (Diskit & Hunder Dunes)",
        region: "Nubra Valley",
        altitude: "3,100 m",
        travelerLink: "Haidar Dughlat & Central Asian Silk Road Traders",
        artExercise: "Dunes, monastery and valley painting; plein-air watercolor study of Bactrian camels and shifting desert shadows.",
        kind: "Dune & Plein-Air Painting"
      },
      {
        day: 8,
        place: "Nubra to Pangong via Tangtse",
        region: "Changthang Border",
        altitude: "4,250 m",
        travelerLink: "Sogdian Silk Road merchants (8th century)",
        artExercise: "Drive along the Shyok; sketch the ancient Sogdian rock inscriptions at Tangtse; paint the lake at dusk.",
        kind: "Petroglyphs & Dusk Studies"
      },
      {
        day: 9,
        place: "Pangong Tso",
        region: "High Altitude Lake",
        altitude: "4,250 m",
        travelerLink: "Pangong frontier surveyors",
        artExercise: "Full day on the lake; morning light studies capturing the shifting cyan, cobalt and turquoise water tones.",
        kind: "Light Studies & Color Notes"
      },
      {
        day: 10,
        place: "Pangong to Leh",
        region: "Chang La to Leh",
        altitude: "4,250 m to 3,524 m",
        travelerLink: "The collective journey",
        artExercise: "Sketch stops on the mountain descent; farewell exhibition and art-statement readings in Leh in the evening.",
        kind: "Exhibition & Farewell"
      }
    ]
  },
  {
    id: "itinerary-13-day",
    slug: "heartland",
    title: "The Heartland Passage",
    subtitle: "Leh, Sham Valley, Nubra & Pangong Tso",
    length: "13 Days",
    nights: "12 Nights",
    category: "The Heartland Exploration",
    focus: "Monasteries, Silk Road history, sand dunes and the high lake",
    maxAltitude: "4,250 m (Pangong Tso)",
    regions: ["Leh", "Sham Valley (Alchi, Likir)", "Nubra Valley", "Pangong Tso"],
    highlight: "Focused on the Ladakh heartland with no Changthang leg, allowing more breathing room and village immersion.",
    tagline: "More time for field sketching, studio refinement and thoughtful observation.",
    practicalNotes: [
      "Includes a full free day in Leh on Day 4 for rest, art supply sourcing and acclimatisation.",
      "Nubra precedes Pangong to build high-altitude tolerance gradually.",
      "Khardung La high-pass transit is carefully managed with brief summit stops."
    ],
    days: [
      { day: 1, place: "Leh Arrival", region: "Leh", altitude: "3,524 m", travelerLink: "-", artExercise: "Rest only, altitude acclimatisation.", kind: "Rest" },
      { day: 2, place: "Leh Old Town & Bazaar", region: "Leh", altitude: "3,524 m", travelerLink: "William Simpson", artExercise: "Quick street sketches, then a first still life with heritage items.", kind: "Sketching" },
      { day: 3, place: "Hemis & Stok Monasteries", region: "Indus Valley", altitude: "3,650 m", travelerLink: "Nicholas Roerich & John Clarke", artExercise: "Landscape painting and masterclass on mountain light and geometry.", kind: "Light Studies" },
      { day: 4, place: "Free Day in Leh", region: "Leh", altitude: "3,524 m", travelerLink: "-", artExercise: "Art supplies, sketchbook review, local tea-house observational notes.", kind: "Free Day" },
      { day: 5, place: "Leh to Alchi via Basgo", region: "Sham Valley", altitude: "3,120 m", travelerLink: "Rinchen Zangpo", artExercise: "Basgo ruined fortress stop; 11th-century Alchi mural studies; village homestay.", kind: "Murals" },
      { day: 6, place: "Village Day in Alchi", region: "Sham Valley", altitude: "3,120 m", travelerLink: "Léa Lafugie", artExercise: "Farm and kitchen still life; local model portraits; slow cooking session.", kind: "Village Life" },
      { day: 7, place: "Alchi to Leh via Likir", region: "Sham Valley", altitude: "3,524 m", travelerLink: "Hyecho & Xuanzang", artExercise: "Likir monastery sketches; evening fireside stories about early pilgrims.", kind: "Pilgrim Lore" },
      { day: 8, place: "Leh to Nubra over Khardung La", region: "Nubra", altitude: "Pass: 5,359 m", travelerLink: "Mirza Haidar Dughlat", artExercise: "Pass-top sketch stop; panoramic landscape at Diskit.", kind: "Pass Crossing" },
      { day: 9, place: "Nubra (Diskit & Hunder)", region: "Nubra", altitude: "3,100 m", travelerLink: "Haidar Dughlat", artExercise: "Cold-desert sand dunes, monastery painting, Silk Road crossing lecture.", kind: "Dune Painting" },
      { day: 10, place: "Nubra to Pangong via Shyok", region: "River Canyon", altitude: "4,250 m", travelerLink: "Sogdian merchants", artExercise: "Long dramatic transit through rock canyons with rapid field sketches.", kind: "Transit Sketching" },
      { day: 11, place: "Pangong Tso", region: "Changthang Border", altitude: "4,250 m", travelerLink: "Sogdian traders", artExercise: "Full day on the lake; sunrise to dusk light studies with gouache.", kind: "Color Studies" },
      { day: 12, place: "Pangong to Leh via Tangtse", region: "Tangtse", altitude: "3,524 m", travelerLink: "Rock carvers", artExercise: "Sketch ancient rock petroglyphs at Tangtse; mountain pass return.", kind: "Petroglyphs" },
      { day: 13, place: "Leh Farewell & Exhibition", region: "Leh", altitude: "3,524 m", travelerLink: "The group", artExercise: "Pop-up salon exhibition, participant art-statement readings, closing dinner.", kind: "Exhibition" }
    ]
  },
  {
    id: "itinerary-14-day",
    slug: "beyond-the-blue",
    title: "Beyond the Blue",
    subtitle: "Alchi Village Stay, Pangong & Nyoma",
    length: "14 Days",
    nights: "13 Nights",
    category: "The Village & Remote Passage",
    focus: "Village life, mural art, nomad portraits, lake landscapes and southern Changthang",
    maxAltitude: "4,250 m (Pangong Tso)",
    regions: ["Leh", "Alchi Village", "Pangong Tso", "Nyoma", "Chumathang"],
    highlight: "Less driving, an extended village homestay, a free studio day in Leh and a remote Changthang finish.",
    tagline: "Slow down in a mountain village, then venture into the raw high-plateau south.",
    practicalNotes: [
      "Driving days 9, 11 and 13 are longer (5-7 hours each), with structured sketch pauses.",
      "The Pangong to Nyoma road is remote and unpaved in sections; confirmed with local operators.",
      "Alchi combines 11th-century mural treasures with authentic apricot-orchard village life."
    ],
    days: [
      { day: 1, place: "Leh Arrival", region: "Leh", altitude: "3,524 m", travelerLink: "-", artExercise: "Rest only, altitude acclimatisation.", kind: "Rest" },
      { day: 2, place: "Leh Old Town & Bazaar", region: "Leh", altitude: "3,524 m", travelerLink: "William Simpson", artExercise: "Quick street sketches, then a first still life.", kind: "Sketching" },
      { day: 3, place: "Hemis & Stok Monasteries", region: "Indus Valley", altitude: "3,650 m", travelerLink: "Roerich & Clarke", artExercise: "Landscape painting and a master lesson on mountain light.", kind: "Light Studies" },
      { day: 4, place: "Thiksey & Shey", region: "Indus Valley", altitude: "3,600 m", travelerLink: "Andrew Harvey", artExercise: "Monastery architecture, quiet sketching and contemplative journaling.", kind: "Architecture" },
      { day: 5, place: "Free Day in Leh", region: "Leh", altitude: "3,524 m", travelerLink: "-", artExercise: "Shopping, materials preparation, cafes, unhurried rest.", kind: "Free Day" },
      { day: 6, place: "Leh to Alchi Village", region: "Sham Valley", altitude: "3,120 m", travelerLink: "Rinchen Zangpo", artExercise: "Mural studies and reinterpretation sketches; village homestay.", kind: "Murals" },
      { day: 7, place: "Village Day in Alchi", region: "Sham Valley", altitude: "3,120 m", travelerLink: "Léa Lafugie", artExercise: "Farm and kitchen still life, local model portraits, traditional cooking.", kind: "Village Life" },
      { day: 8, place: "Back to Leh via Basgo", region: "Sham Valley", altitude: "3,524 m", travelerLink: "Hyecho & Xuanzang", artExercise: "Basgo fortress study; evening stories on ancient trans-Himalayan pilgrims.", kind: "Pilgrim Lore" },
      { day: 9, place: "Leh to Pangong via Tangtse", region: "Tangtse", altitude: "4,250 m", travelerLink: "Sogdian traders", artExercise: "Tangtse rock inscriptions; painting the lake in late afternoon dusk.", kind: "Rock Art" },
      { day: 10, place: "Pangong Tso", region: "High Lake", altitude: "4,250 m", travelerLink: "-", artExercise: "Full day on the lake; morning light studies; panoramic paper accordion fold.", kind: "Panoramic Studies" },
      { day: 11, place: "Pangong to Nyoma", region: "Changthang South", altitude: "4,100 m", travelerLink: "-", artExercise: "Remote road travel through wild plains with en-route sketch breaks.", kind: "Expedition Transit" },
      { day: 12, place: "Nyoma", region: "Changthang Plains", altitude: "4,100 m", travelerLink: "Léa Lafugie (Nomad records)", artExercise: "High-plain landscape painting and Changpa nomadic community portrait studies.", kind: "Nomad Portraits" },
      { day: 13, place: "Nyoma to Leh via Chumathang", region: "Upper Indus", altitude: "3,950 m to 3,524 m", travelerLink: "Sven Hedin", artExercise: "Indus gorge landscape sketch stop and the Chumathang geothermal hot springs.", kind: "Thermal Springs" },
      { day: 14, place: "Leh Farewell & Salon", region: "Leh", altitude: "3,524 m", travelerLink: "The group", artExercise: "Final portfolio review, pop-up gallery, art-statement readings, celebration dinner.", kind: "Exhibition" }
    ]
  },
  {
    id: "itinerary-15-day",
    slug: "grand-traverse",
    title: "The Grand Traverse",
    subtitle: "Grand Ladakh & The Changthang High Lakes",
    length: "15 Days",
    nights: "14 Nights",
    category: "The Master Expedition",
    focus: "Monastery art, Silk Road history, Changpa nomad life, Hanle Dark Sky & high-altitude salt lakes",
    maxAltitude: "4,530 m (Tso Moriri & Tso Kar)",
    regions: ["Leh", "Alchi", "Lamayuru", "Pangong Tso", "Hanle", "Tso Moriri", "Tso Kar"],
    highlight: "The most expansive expedition: monasteries first, then Pangong and the extraordinary high-altitude nomadic lakes of Changthang.",
    tagline: "From 11th-century temple murals to the world's highest dark sky reserve and nomadic salt lakes.",
    practicalNotes: [
      "Carefully staged progression: 2 full Leh acclimatisation days, then low Sham valley (3,120 m), before crossing to Changthang.",
      "Hanle (4,300 m), Tso Moriri (4,522 m) and Tso Kar (4,530 m) are physically demanding; thermal gear and hydration are essential.",
      "Hanle is an official International Dark Sky Reserve offering unprecedented night sky watercolor and charcoal possibilities."
    ],
    days: [
      { day: 1, place: "Leh Arrival", region: "Leh", altitude: "3,524 m", travelerLink: "-", artExercise: "Rest only, altitude acclimatisation.", kind: "Rest" },
      { day: 2, place: "Leh Old Town & Bazaar", region: "Leh", altitude: "3,524 m", travelerLink: "William Simpson", artExercise: "Quick street sketches of woodwork, then a first still life with local brass.", kind: "Street Sketching" },
      { day: 3, place: "Stok Palace & Hemis Gompa", region: "Indus Valley", altitude: "3,650 m", travelerLink: "Nicholas Roerich & John Clarke", artExercise: "Landscape painting; master session on mountain light, angles and geometry.", kind: "Geometry & Light" },
      { day: 4, place: "Thiksey & Shey Monasteries", region: "Indus Valley", altitude: "3,600 m", travelerLink: "Andrew Harvey", artExercise: "Monastery architecture, quiet courtyard sketching and contemplative journaling.", kind: "Architecture" },
      { day: 5, place: "Alchi & Lamayuru 'Moonland'", region: "Lower Ladakh", altitude: "3,120 m to 3,510 m", travelerLink: "Lotsawa Rinchen Zangpo", artExercise: "11th-century Alchi mural studies, then reinterpretation drawings at Lamayuru's eroded geological landscape.", kind: "Murals & Geology" },
      { day: 6, place: "Return to Leh", region: "Sham to Leh", altitude: "3,524 m", travelerLink: "Pilgrim Hyecho & Xuanzang", artExercise: "Restful afternoon and storytelling evening about early Silk Road pilgrims.", kind: "Storytelling" },
      { day: 7, place: "Tangtse to Pangong Tso", region: "Changthang Gateway", altitude: "4,250 m", travelerLink: "Sogdian merchants", artExercise: "Sketch ancient Sogdian rock inscriptions; paint the luminous lake at dusk.", kind: "Petroglyphs & Dusk" },
      { day: 8, place: "Pangong Tso to Leh", region: "Chang La Pass", altitude: "4,250 m to 3,524 m", travelerLink: "-", artExercise: "Morning light studies of Pangong's blue gradient; sketch stops on return drive.", kind: "Morning Light" },
      { day: 9, place: "Leh Portrait Studio", region: "Leh", altitude: "3,524 m", travelerLink: "Léa Lafugie (1920s French portraitist)", artExercise: "Portrait sessions with local models wearing heritage Perak turquoise headdresses and traditional dress.", kind: "Portraiture" },
      { day: 10, place: "Leh to Hanle via Chumathang", region: "Indus Canyon", altitude: "4,300 m", travelerLink: "Sven Hedin", artExercise: "River gorge sketches along the upper Indus; geothermal steam sketch at Chumathang.", kind: "Gorge Landscapes" },
      { day: 11, place: "Hanle & Dark Sky Reserve", region: "Hanle Valley", altitude: "4,300 m", travelerLink: "Ancient astronomers", artExercise: "17th-century Hanle monastery study; afternoon nomad camp visit; night-sky charcoal and gouache session.", kind: "Dark Sky & Nomads" },
      { day: 12, place: "Hanle to Tso Moriri", region: "High Plateau", altitude: "4,522 m", travelerLink: "-", artExercise: "Expansive wide-plain landscapes with wild Tibetan asses (Kiang) and nomadic tents.", kind: "Wildlife & Plains" },
      { day: 13, place: "Tso Moriri & Korzok Monastery", region: "Korzok", altitude: "4,522 m", travelerLink: "Lafugie (Nomad chronicles)", artExercise: "Korzok monastery perched over the deep blue water; Changpa pastoralist portraits.", kind: "Lake & Portraiture" },
      { day: 14, place: "Tso Moriri to Tso Kar & Return to Leh", region: "Tso Kar Salt Basin", altitude: "4,530 m to 3,524 m", travelerLink: "-", artExercise: "Last landscape study at the white saline crust and mineral flats of Tso Kar.", kind: "Mineral Landscapes" },
      { day: 15, place: "Leh Farewell & Final Exhibition", region: "Leh", altitude: "3,524 m", travelerLink: "The gathered expedition", artExercise: "Curation of travel books, salon exhibition, reading of artist statements, celebratory feast.", kind: "Salon Exhibition" }
    ]
  }
];

export const expeditionLandmarks = [
  {
    id: "leh",
    name: "Leh",
    altitude: "3,524 m",
    coordinates: "34.1526° N, 77.5771° E",
    region: "Central Ladakh",
    character: "Crossroads of high-mountain trade & ancient kingdom seat",
    historicFigure: "William Simpson (1860 Victorian watercolorist)",
    historicNote: "Simpson traversed the passes with portable water tins, chronicling Leh's mudbrick towers and tiered stupas.",
    practiceFocus: "Street sketching in the old alleys, architectural rhythm of Leh Palace, still life with hammered copperware.",
    journeysCovered: ["first-light", "heartland", "beyond-the-blue", "grand-traverse"]
  },
  {
    id: "alchi",
    name: "Alchi & Basgo",
    altitude: "3,120 m",
    coordinates: "34.2237° N, 77.1752° E",
    region: "Sham Valley (Lower Indus)",
    character: "11th-century Kashmiri-Buddhist mural archives in apricot groves",
    historicFigure: "Lotsawa Rinchen Zangpo (The Great Translator)",
    historicNote: "Founded during the Second Diffusion of Buddhism, Alchi holds some of the world's finest surviving Kashmiri wall paintings.",
    practiceFocus: "Mural line analysis, mineral pigment studies, village homestay still life and courtyard portraiture.",
    journeysCovered: ["first-light", "heartland", "beyond-the-blue", "grand-traverse"]
  },
  {
    id: "diskit",
    name: "Diskit & Hunder (Nubra)",
    altitude: "3,100 m",
    coordinates: "34.5428° N, 77.5583° E",
    region: "Nubra Valley",
    character: "Cold desert dunes, double-humped camels & Silk Road valley",
    historicFigure: "Mirza Muhammad Haidar Dughlat (16th c.)",
    historicNote: "Chronicler of the Tarikh-i-Rashidi, writing of the arduous passage across Khardung La into the oasis valley.",
    practiceFocus: "Plein-air painting in the shifting dunes, golden-hour light across Diskit monastery, desert willow studies.",
    journeysCovered: ["first-light", "heartland", "beyond-the-blue"]
  },
  {
    id: "pangong",
    name: "Pangong Tso",
    altitude: "4,250 m",
    coordinates: "33.7595° N, 78.6674° E",
    region: "Changthang Frontier",
    character: "Endorheic saltwater lake stretching across borders",
    historicFigure: "Sogdian Silk Road merchants (8th-9th c.)",
    historicNote: "Ancient traders left rock-carved inscriptions at Tangtse, recording their journeys between Samarkand and Tibet.",
    practiceFocus: "Rapid color studies of shifting lake hues (from turquoise to indigo), mineral crust drawings, twilight washes.",
    journeysCovered: ["first-light", "heartland", "beyond-the-blue", "grand-traverse"]
  },
  {
    id: "nyoma",
    name: "Nyoma & Chumathang",
    altitude: "4,180 m",
    coordinates: "33.1972° N, 78.6534° E",
    region: "Southern Changthang",
    character: "Nomadic plains, geothermal steam & wild riverbanks",
    historicFigure: "Sven Hedin (Swedish explorer, 1906)",
    historicNote: "Surveyed the uncharted Indus tributaries and recorded the customs of the nomadic Changpa herdsmen.",
    practiceFocus: "Wide-plain horizons, steam studies at geothermal springs, raw wash sketching of weathered nomadic tents.",
    journeysCovered: ["beyond-the-blue", "grand-traverse"]
  },
  {
    id: "hanle",
    name: "Hanle & Dark Sky Reserve",
    altitude: "4,300 m",
    coordinates: "32.7758° N, 78.9774° E",
    region: "Remote Changthang",
    character: "World's highest observatory, 17th-c. monastery & pristine night skies",
    historicFigure: "Sengge Namgyal & ancient Ladakhi astronomers",
    historicNote: "Home to the historic Drukpa Kagyu monastery and India's first Dark Sky Sanctuary under ultra-clear skies.",
    practiceFocus: "Nocturne painting with gouache and charcoal, monastery hill silhouette, nomadic encampment studies.",
    journeysCovered: ["grand-traverse"]
  },
  {
    id: "tsomoriri",
    name: "Tso Moriri & Korzok",
    altitude: "4,522 m",
    coordinates: "32.9069° N, 78.3150° E",
    region: "High Changthang Plateau",
    character: "Sacred high-altitude wetland surrounded by snow peaks",
    historicFigure: "Léa Lafugie (French explorer & portraitist, 1920s)",
    historicNote: "One of the few Western women to document the Korzok nomads and paint their ceremonial dress in the field.",
    practiceFocus: "Deep ultramarine lake watercolor washes, Changpa portrait studies, high alpine flora drawing.",
    journeysCovered: ["grand-traverse"]
  }
];

export const artisticPractices = [
  {
    number: "01",
    title: "Field Sketching",
    tagline: "The line of first encounter",
    description: "Quick drawings that capture the essential impression before details intervene: a ridge line against morning mist, the proportion of a mudbrick chorten, a gateway, or the geometry of a shadow moving across scree.",
    materials: "Graphite pencils (2B-6B), archival pigment fineliners, handmade toned paper."
  },
  {
    number: "02",
    title: "Watercolour & Gouache Studies",
    tagline: "The shifting light of altitude",
    description: "High altitude light in Ladakh possesses extraordinary clarity and rapid tonal shifts. We work in small formats that can be laid down quickly, capturing mineral pinks, slate grays, and the deep cobalt gradients of the glacial lakes.",
    materials: "Pocket tin with curated artist-grade half-pans, waterbrushes, 300gsm cold-press cotton paper blocks."
  },
  {
    number: "03",
    title: "The Custom A5 Travel Book",
    tagline: "Your personal expedition archive",
    description: "Each participant receives a bespoke cloth-bound A5 book crafted for the journey. Part route guide, part naturalist sketchbook, part contemplative journal — it is built to endure the field and hold drawings, notes, dried botanical specimens and memories.",
    materials: "Heavyweight mix-media paper, Smyth-sewn binding that lies completely flat, protective pocket."
  },
  {
    number: "04",
    title: "Clay, Earth Pigments & Monotypes",
    tagline: "The geology of place",
    description: "Exploring the tangible earth of Ladakh through local mineral pigments, clay impressions and experimental printmaking. All practice is strictly ethical and leaves zero marks or disruption on heritage structures.",
    materials: "Sifted river silt, local red ochre, portable plexiglass monotype plates, brayers."
  },
  {
    number: "05",
    title: "The Collected Salon & Dispatches",
    tagline: "Gathering the work",
    description: "At the conclusion of each passage, the group gathers for an informal salon and reading of artist statements. Selected drawings and field notes can be contributed to our annual printed journal.",
    materials: "Curated display boards, archival portfolio folios, participant exchange cards."
  }
];

export const fieldNotesJournal = [
  {
    id: "fn-01",
    number: "01",
    date: "Autumn Expedition",
    location: "Pangong Tso · 4,250 m",
    title: "Learning to Look at a Mountain",
    category: "Landscape & Scale",
    author: "Expedition Field Notes",
    excerpt: "At four thousand metres, distance behaves differently. What appears to be a twenty-minute walk along the lakeshore is a two-hour pilgrimage across gravel terraces.",
    content: "At four thousand metres, distance behaves differently. What appears to be a twenty-minute walk along the lakeshore is a two-hour pilgrimage across gravel terraces. The air is so thin that mountains twenty miles distant show their fissures as clearly as the stone under your boot. In the travel book, we begin not with detail, but with the horizon line: the single breath where stone meets sky."
  },
  {
    id: "fn-02",
    number: "02",
    date: "Late Summer",
    location: "Alchi Village · 3,120 m",
    title: "The Apricot Grove & The 11th-Century Line",
    category: "Mural Heritage",
    author: "Lotsawa Notes",
    excerpt: "Sitting in the courtyard of Sumtsek while ripe apricots drop into the dust. On the clay walls inside, thousand-year-old Kashmiri lines remain startlingly fresh.",
    content: "Sitting in the courtyard of Sumtsek while ripe apricots drop into the dust. On the clay walls inside, thousand-year-old Kashmiri lines remain startlingly fresh. The painters used lapis from Badakhshan, cinnabar from the Silk Road caravans, and local river mud. When we mix our own gouache in the afternoon, we understand why these pigments have outlived kingdoms."
  },
  {
    id: "fn-03",
    number: "03",
    date: "Expedition Archive",
    location: "Leh Old Town · 3,524 m",
    title: "In the Footsteps of William Simpson",
    category: "Historical Travelers",
    author: "Archival Research",
    excerpt: "In 1860, Victorian artist William Simpson climbed above Leh with his folding wooden easel to document the morning prayer call.",
    content: "In 1860, Victorian artist William Simpson climbed above Leh with his folding wooden easel to document the morning prayer call. His watercolours caught the dust motes hanging in the cold desert dawn. Walking the same alleys today, sketchbook in hand, one realizes how little the essential rhythm of mountain light has changed."
  }
];

// Backward-compatible exports
export const journeys = journeyItineraries.map(j => ({
  id: j.slug,
  name: j.title,
  length: j.length,
  note: j.category,
  description: j.highlight,
  route: j.regions,
  days: j.days.map(d => ({
    day: d.day,
    place: d.place,
    title: d.kind,
    activity: d.artExercise,
    artist: d.travelerLink,
    kind: d.kind
  }))
}));

export const landmarks = {
  "Leh": {
    id: "leh", name: "Leh", region: "Central Ladakh", elevation: "Approx. 3,524 m",
    image: "/figma/hero-background.jpg",
    description: "A meeting point of mountain routes, old trade histories and everyday Ladakhi life. Leh is the place to arrive slowly, acclimatise and begin learning how to look.",
    traveller: "William Simpson (1860 Victorian artist)",
    travellerNote: "Documented the prayer wheels, rock faces and morning light of Leh.",
    dayPlan: "Arrival or return day; acclimatisation, observational walks, architectural sketches, journaling and studio review."
  },
  "Sham": {
    id: "sham", name: "Sham", region: "Lower Indus Valley", elevation: "Approx. 3,120 m",
    image: "/figma/hero-background.jpg",
    description: "The lower Indus valley offers a sequence of villages, river views and changing mountain forms. It is a place to study how settlement and landscape sit together.",
    traveller: "Lotsawa Rinchen Zangpo & Early Buddhist pilgrims",
    travellerNote: "11th-century monastic foundation and trans-Himalayan translations.",
    dayPlan: "Mural studies at Alchi, sketchbook notes of ruined fortress towers at Basgo, village stay."
  },
  "Alchi": {
    id: "alchi", name: "Alchi", region: "Sham Valley", elevation: "Approx. 3,120 m",
    image: "/figma/hero-background.jpg",
    description: "One of Ladakh's earliest monastic compounds with magnificent 11th-century murals preserved in clay sanctuaries.",
    traveller: "Lotsawa Rinchen Zangpo",
    travellerNote: "Kashmiri master painters and local artisans created this intimate visual archive.",
    dayPlan: "Morning drawing sessions inside the temple compound, village orchard sketches, evening stories."
  },
  "Nubra Valley": {
    id: "nubra", name: "Nubra Valley", region: "Karakoram Foothills", elevation: "Approx. 3,100 m",
    image: "/figma/hero-background.jpg",
    description: "A wide, light-filled valley carved by the Shyok and Nubra rivers, where cold sand dunes sit between dramatic mountain walls.",
    traveller: "Mirza Haidar Dughlat & Central Asian caravan chroniclers",
    travellerNote: "Recorded the arduous journeys across Khardung La into Central Asia.",
    dayPlan: "Plein-air painting in the dunes, monastery courtyard studies at Diskit, night-sky observation."
  },
  "Pangong Tso": {
    id: "pangong", name: "Pangong Tso", region: "High Border Lake", elevation: "Approx. 4,250 m",
    image: "/figma/hero-background.jpg",
    description: "A high-altitude endorheic lake known for its luminous, ever-shifting spectrum of blues and dramatic rim of peaks.",
    traveller: "Sogdian merchants & Changthang surveyors",
    travellerNote: "Carved ancient rock petroglyphs at Tangtse marking this trade passage.",
    dayPlan: "Morning light studies beside the lake, mineral pigment exercises, dusk gouache studies."
  }
};

