export interface GeoPoint {
  lat: number;
  lng: number;
  timestamp: number;
}

export interface Point2D {
  x: number;
  y: number;
}

export interface FieldPolygon {
  geoPoints: GeoPoint[];
  projectedPoints: Point2D[]; // Relative meters from centroid/start
  areaSqMeters: number;
  perimeterMeters: number;
  bounds: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  };
}

export interface Equipment {
  id: string;
  name: string;
  width: number; // in meters
  speed: number; // in m/s (approximate, for estimation)
  type: 'sprayer' | 'tractor' | 'harvester' | 'drone';
}

export interface PathSegment {
  p1: Point2D;
  p2: Point2D;
  type: 'work' | 'turn'; // Work means equipment is active, turn is connecting
}

export interface CoveragePlan {
  segments: PathSegment[];
  totalDistance: number;
  estimatedTimeSeconds: number;
  efficiencyScore: number;
}

export enum AppMode {
  CAPTURE = 'CAPTURE',
  SETUP = 'SETUP',
  PLAN = 'PLAN',
  RUN = 'RUN'
}