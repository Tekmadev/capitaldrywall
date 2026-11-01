import { site } from "./site.config";

export type AreaZone = "central" | "west" | "south" | "east";

export type Area = {
  /** Exactly as listed in the copy deck / site.config.serviceAreas */
  name: string;
  /** Short label for the map */
  short: string;
  /** schema.org areaServed name */
  schemaName: string;
  zone: AreaZone;
  /** Approximate centre, for the abstract SVG plan only (not a service boundary) */
  lat: number;
  lng: number;
};

const areaData: Record<string, Omit<Area, "name">> = {
  "Ottawa (Centretown & Downtown)": {
    short: "Centretown",
    schemaName: "Centretown, Ottawa, ON",
    zone: "central",
    lat: 45.4165,
    lng: -75.6985,
  },
  "The Glebe": { short: "The Glebe", schemaName: "The Glebe, Ottawa, ON", zone: "central", lat: 45.4005, lng: -75.6875 },
  Westboro: { short: "Westboro", schemaName: "Westboro, Ottawa, ON", zone: "central", lat: 45.3925, lng: -75.7535 },
  Vanier: { short: "Vanier", schemaName: "Vanier, Ottawa, ON", zone: "central", lat: 45.4375, lng: -75.6605 },
  "Alta Vista": { short: "Alta Vista", schemaName: "Alta Vista, Ottawa, ON", zone: "central", lat: 45.3895, lng: -75.6595 },
  Kanata: { short: "Kanata", schemaName: "Kanata, Ottawa, ON", zone: "west", lat: 45.3088, lng: -75.8987 },
  Stittsville: { short: "Stittsville", schemaName: "Stittsville, Ottawa, ON", zone: "west", lat: 45.259, lng: -75.922 },
  Nepean: { short: "Nepean", schemaName: "Nepean, Ottawa, ON", zone: "west", lat: 45.345, lng: -75.738 },
  Barrhaven: { short: "Barrhaven", schemaName: "Barrhaven, Ottawa, ON", zone: "south", lat: 45.273, lng: -75.737 },
  "Riverside South": {
    short: "Riverside S.",
    schemaName: "Riverside South, Ottawa, ON",
    zone: "south",
    lat: 45.27,
    lng: -75.688,
  },
  "Findlay Creek": {
    short: "Findlay Creek",
    schemaName: "Findlay Creek, Ottawa, ON",
    zone: "south",
    lat: 45.3165,
    lng: -75.6065,
  },
  Manotick: { short: "Manotick", schemaName: "Manotick, Ottawa, ON", zone: "south", lat: 45.227, lng: -75.683 },
  Greely: { short: "Greely", schemaName: "Greely, Ottawa, ON", zone: "south", lat: 45.263, lng: -75.559 },
  Gloucester: { short: "Gloucester", schemaName: "Gloucester, Ottawa, ON", zone: "east", lat: 45.355, lng: -75.585 },
  "Orléans": { short: "Orléans", schemaName: "Orléans, Ottawa, ON", zone: "east", lat: 45.469, lng: -75.516 },
  Cumberland: { short: "Cumberland", schemaName: "Cumberland, Ottawa, ON", zone: "east", lat: 45.516, lng: -75.411 },
};

/** Service areas in copy-deck order. Names come from site.config (CONFIRM list). */
export const areas: Area[] = site.serviceAreas.map((name) => {
  const data = areaData[name];
  if (!data) {
    // A new area added to site.config without map data still renders in lists.
    return { name, short: name, schemaName: `${name}, Ottawa, ON`, zone: "central", lat: 45.4215, lng: -75.6972 };
  }
  return { name, ...data };
});

/** Approximate river centrelines for the abstract map ([lng, lat] pairs, west → east / south → north). */
export const rivers = {
  ottawa: [
    [-76.0, 45.425],
    [-75.93, 45.39],
    [-75.87, 45.372],
    [-75.8, 45.366],
    [-75.76, 45.392],
    [-75.71, 45.418],
    [-75.672, 45.443],
    [-75.61, 45.468],
    [-75.53, 45.488],
    [-75.45, 45.515],
    [-75.37, 45.545],
  ],
  rideau: [
    [-75.67, 45.205],
    [-75.689, 45.245],
    [-75.705, 45.3],
    [-75.703, 45.36],
    [-75.694, 45.395],
    [-75.672, 45.443],
  ],
} as const;

/** Map frame (lng/lat bounds) that contains every area with some margin. */
export const mapBounds = { west: -76.0, east: -75.37, south: 45.2, north: 45.56 } as const;
