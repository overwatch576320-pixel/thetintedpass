export const journeys = [
  {
    id: "the-first-light",
    name: "The First Light",
    length: "10 days",
    note: "The essential journey",
    description: "A slower passage through Leh, Sham, Nubra and Pangong — shaped around looking closely, making work and finding a rhythm with the landscape.",
    route: ["Leh", "Sham", "Alchi", "Nubra Valley", "Pangong Tso", "Leh"],
    days: [
      { day: 1, place: "Leh", title: "Arrive, settle, observe", activity: "A gentle arrival, time to acclimatise and begin the travel book with first impressions of the high-desert landscape.", artist: "The journey begins with your own eye", kind: "Arrival & observation" },
      { day: 2, place: "Leh", title: "The shapes of a mountain town", activity: "An observational walk and short studies of light, architecture, colour and everyday life. The afternoon is kept unhurried.", artist: "Early travellers to Ladakh", kind: "Drawing & journaling" },
      { day: 3, place: "Sham", title: "Following the Indus", activity: "Travel through the lower Indus valley, stopping to sketch the changing forms of the mountains and settlements.", artist: "Travellers and chroniclers of the Indus", kind: "Landscape studies" },
      { day: 4, place: "Alchi", title: "A village, a monastery, a visual archive", activity: "Spend time with the village landscape and the visual details of Alchi. Any monument visit is approached respectfully and according to local guidance.", artist: "The artistic heritage of the western Himalaya", kind: "Architecture & detail" },
      { day: 5, place: "Leh", title: "A day to make and reflect", activity: "Return at an easy pace. Develop selected sketches into watercolour or gouache studies and write a short field note.", artist: "Your own visual language", kind: "Studio practice" },
      { day: 6, place: "Nubra Valley", title: "Across the high pass", activity: "Travel towards Nubra with pauses for visual notes. Allow time for the landscape to shift from mountain pass to broad valley.", artist: "Sven Hedin — historical context", kind: "Travel sketching" },
      { day: 7, place: "Nubra Valley", title: "The valley in layers", activity: "A full field day for landscape painting, drawing and quiet observation. The exact location depends on weather and access.", artist: "Historical accounts of the region", kind: "Watercolour & gouache" },
      { day: 8, place: "Pangong Tso", title: "The colour of distance", activity: "Travel to Pangong with considered stops. Make quick colour notes and small studies rather than trying to capture everything at once.", artist: "Travellers of the Changthang region", kind: "Colour studies" },
      { day: 9, place: "Pangong Tso", title: "A day beside the lake", activity: "A slower day for larger landscape studies, journaling and time with the changing light. A clay-print session may be included where conditions allow.", artist: "Your own interpretation", kind: "Landscape & printmaking" },
      { day: 10, place: "Leh", title: "Return with a record", activity: "Return to Leh, review the travel book and gather the work made along the way. Closing reflections and departure planning.", artist: "The journey as a collected work", kind: "Reflection" }
    ]
  },
  {
    id: "beyond-the-blue",
    name: "Beyond the Blue",
    length: "14 days",
    note: "The extended passage",
    description: "An extended version of the core journey, with more room for rest, deeper studies and a possible Changthang extension. Remote routing is always subject to local confirmation.",
    route: ["Leh", "Sham", "Alchi", "Nubra Valley", "Pangong Tso", "Nyoma", "Chumathang", "Leh"],
    days: [
      { day: 1, place: "Leh", title: "Arrive, settle, observe", activity: "A gentle arrival and acclimatisation day. Begin the A5 travel book with first impressions.", artist: "The journey begins with your own eye", kind: "Arrival" },
      { day: 2, place: "Leh", title: "The shapes of a mountain town", activity: "Observational drawing, architecture and everyday details, with an unhurried afternoon.", artist: "Early travellers to Ladakh", kind: "Drawing" },
      { day: 3, place: "Sham", title: "Following the Indus", activity: "Travel through Sham with landscape sketch stops and time to notice the river valley.", artist: "Travellers and chroniclers of the Indus", kind: "Landscape" },
      { day: 4, place: "Alchi", title: "A village visual archive", activity: "Explore the village setting and artistic heritage respectfully, with local guidance.", artist: "The artistic heritage of the western Himalaya", kind: "Architecture" },
      { day: 5, place: "Leh", title: "Developing the first studies", activity: "A return and studio day to develop field sketches into more considered work.", artist: "Your own visual language", kind: "Studio" },
      { day: 6, place: "Leh", title: "A day for looking closer", activity: "A flexible day for rest, local encounters and short observational exercises.", artist: "Your own visual language", kind: "Rest & observation" },
      { day: 7, place: "Nubra Valley", title: "Across the high pass", activity: "Travel towards Nubra with pauses for visual notes and changing terrain.", artist: "Sven Hedin — historical context", kind: "Travel sketching" },
      { day: 8, place: "Nubra Valley", title: "The valley in layers", activity: "A full field day for painting, drawing and quiet observation.", artist: "Historical accounts of the region", kind: "Painting" },
      { day: 9, place: "Nubra Valley", title: "A second look", activity: "Return to a chosen subject, make a longer study and record the details that first escaped notice.", artist: "Your own interpretation", kind: "Deep study" },
      { day: 10, place: "Pangong Tso", title: "The colour of distance", activity: "Travel to Pangong with considered stops and quick colour notes.", artist: "Travellers of the Changthang region", kind: "Colour studies" },
      { day: 11, place: "Pangong Tso", title: "A day beside the lake", activity: "A slower day for larger landscape studies and journaling.", artist: "Your own interpretation", kind: "Landscape" },
      { day: 12, place: "Nyoma", title: "Into Changthang", activity: "If road, permit and safety conditions are suitable, continue towards Nyoma with local operator confirmation.", artist: "Sven Hedin — inspiration and historical context", kind: "Remote travel" },
      { day: 13, place: "Chumathang", title: "The long view home", activity: "Begin the return via Chumathang, with a brief sketch stop where conditions allow.", artist: "The landscape as a travel record", kind: "Field notes" },
      { day: 14, place: "Leh", title: "Gathering the journey", activity: "Review the travel book and work made along the route. A closing gathering is possible; an exhibition is not a guaranteed part of the journey.", artist: "The journey as a collected work", kind: "Reflection" }
    ]
  }
];

export const landmarks = {
  "Leh": {
    id: "leh", name: "Leh", region: "Central Ladakh", elevation: "Approx. 3,500 m",
    image: "https://images.unsplash.com/photo-1566837497312-7be4f6c3f8a5?auto=format&fit=crop&w=1200&q=85",
    description: "A meeting point of mountain routes, old trade histories and everyday Ladakhi life. Leh is the place to arrive slowly, acclimatise and begin learning how to look.",
    traveller: "Early travellers and chroniclers of Ladakh",
    travellerNote: "The website can later feature a researched portrait and a short, sourced biography for the specific historical figure connected to this stop.",
    dayPlan: "Arrival or return day; acclimatisation, observational walks, architectural sketches, journaling and studio review."
  },
  "Sham": {
    id: "sham", name: "Sham", region: "Lower Indus Valley", elevation: "Varies by stop",
    image: "https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=1200&q=85",
    description: "The lower Indus valley offers a sequence of villages, river views and changing mountain forms. It is a place to study how settlement and landscape sit together.",
    traveller: "Travellers and chroniclers of the Indus",
    travellerNote: "Add the selected historical traveller and verified portrait when the route research is finalised.",
    dayPlan: "Travel through the valley with sketch stops, quick studies of the river and mountain silhouettes, and time for written observations."
  },
  "Alchi": {
    id: "alchi", name: "Alchi", region: "Sham / Indus Valley", elevation: "Approx. 3,100 m",
    image: "https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=1200&q=85",
    description: "A village setting with an important artistic and architectural heritage. The experience is built around respectful observation and understanding, not intrusive documentation.",
    traveller: "The artistic heritage of the western Himalaya",
    travellerNote: "Use a locally approved image and a carefully researched historical note for the final site.",
    dayPlan: "Village observation, architectural drawing from permitted areas, detail studies and a reflective journal entry."
  },
  "Nubra Valley": {
    id: "nubra", name: "Nubra Valley", region: "North of Leh", elevation: "Varies by valley",
    image: "https://images.unsplash.com/photo-1590050752117-23a9d7fc7b8f?auto=format&fit=crop&w=1200&q=85",
    description: "A broad valley shaped by rivers, sand, orchards and high mountain walls. The changing scale and texture make it a rich place for sustained landscape studies.",
    traveller: "Sven Hedin — historical context",
    travellerNote: "A historical figure is shown as a research lead here, not as a claim that every selected viewpoint was visited by him. Verify the connection before publishing.",
    dayPlan: "Travel sketching, a full landscape field session, watercolour or gouache studies and time to return to a subject."
  },
  "Pangong Tso": {
    id: "pangong", name: "Pangong Tso", region: "Changthang", elevation: "Approx. 4,250 m",
    image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=85",
    description: "A high-altitude lake whose colours and atmosphere change with light, weather and distance. The emphasis here is on patient looking and small, thoughtful studies.",
    traveller: "Travellers of the Changthang region",
    travellerNote: "Historical traveller portraits and attributions should be added only after the exact journey connection is checked.",
    dayPlan: "Colour notes, landscape painting, journaling and an optional clay-printmaking exercise where time and conditions allow."
  },
  "Nyoma": {
    id: "nyoma", name: "Nyoma", region: "Changthang", elevation: "Approx. 4,100 m",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=85",
    description: "A remote high plateau landscape. This extension is dependent on permits, road conditions, acclimatisation and advice from a qualified local operator.",
    traveller: "Sven Hedin — inspiration and historical context",
    travellerNote: "The historical reference is inspirational until the exact route connection and image rights are verified.",
    dayPlan: "Only if confirmed safe and permitted: short landscape studies, observation of the plateau and a rest-focused afternoon."
  },
  "Chumathang": {
    id: "chumathang", name: "Chumathang", region: "Indus Valley", elevation: "High-altitude valley",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=85",
    description: "A return-route landscape along the Indus, included in the extended itinerary as a place to pause and make a final set of field notes.",
    traveller: "The landscape as a travel record",
    travellerNote: "Add a named historical reference only when supported by route-specific research.",
    dayPlan: "A short sketch stop if road and timing allow, followed by the return journey to Leh."
  }
};
