export interface Step {
    distance: number;
    driving_side: string;
    duration: number;
    geometry: {
      coordinates: [number, number][];
      type: string;
    };
    intersections: {
      out: number;
      entry: number[];
      bearings: number[];
      location: [number, number];
    }[];
    maneuver: {
      bearing_after: number;
      bearing_before: number;
      instruction: string;
      location: [number, number];
      modifier: string;
      type: string;
    };
    mode: string;
    name: string;
    weight: number;
}

export interface Wind {
    speed: number;
    deg: number
}

export interface Waypoint {
    distance: number;
    location: [number, number];
    name: string;
    trips_index: number;
    waypoint_index: number;
}

export interface Feature {
    type: string;
    properties: {
      lineColor: string;
    };
    geometry: {
      type: string;
      coordinates: [number, number][];
    };
}