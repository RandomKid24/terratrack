import { GeoPoint, Point2D, PathSegment } from '../types';

const EARTH_RADIUS = 6371000; // meters

/**
 * Converts a GeoPoint to a relative Cartesian point (meters) based on an origin.
 */
export const geoToCartesian = (point: GeoPoint, origin: GeoPoint): Point2D => {
  const dLat = (point.lat - origin.lat) * (Math.PI / 180);
  const dLon = (point.lng - origin.lng) * (Math.PI / 180);
  
  // y is North (positive lat)
  const y = dLat * EARTH_RADIUS;
  
  // x is East. Adjust for latitude shrinkage
  const latRad = origin.lat * (Math.PI / 180);
  const x = dLon * EARTH_RADIUS * Math.cos(latRad);

  return { x, y };
};

export const calculatePolygonArea = (points: Point2D[]): number => {
  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    area += points[i].x * points[j].y;
    area -= points[j].x * points[i].y;
  }
  return Math.abs(area) / 2;
};

export const calculatePerimeter = (points: Point2D[]): number => {
  let perimeter = 0;
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    const dx = points[j].x - points[i].x;
    const dy = points[j].y - points[i].y;
    perimeter += Math.sqrt(dx * dx + dy * dy);
  }
  return perimeter;
};

/**
 * Rotate a point around (0,0) by theta radians.
 */
const rotatePoint = (p: Point2D, theta: number): Point2D => {
  return {
    x: p.x * Math.cos(theta) - p.y * Math.sin(theta),
    y: p.x * Math.sin(theta) + p.y * Math.cos(theta)
  };
};

/**
 * Generates an OPTIMIZED coverage path by trying multiple angles.
 * It rotates the field, generates a scanline, and measures efficiency.
 * Returns the path that requires the least travel distance (shortest path).
 */
export const generateOptimizedPath = (
  points: Point2D[],
  width: number,
  bounds: { minX: number; maxX: number; minY: number; maxY: number }
): { segments: PathSegment[], angle: number } => {
  
  let bestSegments: PathSegment[] = [];
  let minTotalDist = Infinity;
  let bestAngle = 0;

  // Try angles from 0 to 180 degrees in steps of 15 degrees
  // This handles irregular shapes significantly better than fixed X/Y scanning
  for (let angleDeg = 0; angleDeg < 180; angleDeg += 15) {
    const angleRad = angleDeg * (Math.PI / 180);
    
    // 1. Rotate polygon to this alignment
    const rotatedPoints = points.map(p => rotatePoint(p, angleRad));
    
    // 2. Recalculate bounds for rotated polygon
    let rMinX = Infinity, rMaxX = -Infinity, rMinY = Infinity, rMaxY = -Infinity;
    rotatedPoints.forEach(p => {
      if (p.x < rMinX) rMinX = p.x;
      if (p.x > rMaxX) rMaxX = p.x;
      if (p.y < rMinY) rMinY = p.y;
      if (p.y > rMaxY) rMaxY = p.y;
    });

    // 3. Generate scanline path for this rotation
    const scanSegments = generateScanLines(rotatedPoints, width, { minX: rMinX, maxX: rMaxX, minY: rMinY, maxY: rMaxY });

    // 4. Calculate total distance (work + turns)
    let dist = 0;
    scanSegments.forEach(s => {
       dist += Math.sqrt(Math.pow(s.p2.x - s.p1.x, 2) + Math.pow(s.p2.y - s.p1.y, 2));
    });

    // 5. Check if this is better
    if (dist < minTotalDist && scanSegments.length > 0) {
      minTotalDist = dist;
      bestSegments = scanSegments;
      bestAngle = angleRad;
    }
  }

  // 6. Rotate the best segments back to original coordinates
  const finalSegments = bestSegments.map(seg => ({
    type: seg.type,
    p1: rotatePoint(seg.p1, -bestAngle),
    p2: rotatePoint(seg.p2, -bestAngle)
  }));

  return { segments: finalSegments, angle: bestAngle * (180 / Math.PI) };
};

/**
 * Internal basic scanline generator (Top-Down)
 */
const generateScanLines = (
  points: Point2D[], 
  width: number, 
  bounds: { minX: number; maxX: number; minY: number; maxY: number }
): PathSegment[] => {
  const segments: PathSegment[] = [];
  // Buffer ensures we don't graze the exact edge, effectively center-of-tool
  const buffer = width * 0.5; 
  
  let currentY = bounds.maxY - buffer;
  let direction = 1; // 1 = Left to Right, -1 = Right to Left

  while (currentY > bounds.minY) {
    const intersections: number[] = [];

    for (let i = 0; i < points.length; i++) {
      const p1 = points[i];
      const p2 = points[(i + 1) % points.length];

      if ((p1.y > currentY && p2.y <= currentY) || (p2.y > currentY && p1.y <= currentY)) {
        // x = x1 + (y - y1) * (x2 - x1) / (y2 - y1)
        const x = p1.x + (currentY - p1.y) * (p2.x - p1.x) / (p2.y - p1.y);
        intersections.push(x);
      }
    }

    intersections.sort((a, b) => a - b);

    const lineSegments: PathSegment[] = [];
    
    // Create segments for valid intersections inside polygon
    for (let k = 0; k < intersections.length; k += 2) {
      if (k + 1 < intersections.length) {
        const xStart = intersections[k];
        const xEnd = intersections[k + 1];
        
        const p1 = { x: xStart, y: currentY };
        const p2 = { x: xEnd, y: currentY };
        
        if (direction === 1) {
          lineSegments.push({ p1, p2, type: 'work' });
        } else {
          lineSegments.unshift({ p1: p2, p2: p1, type: 'work' });
        }
      }
    }

    if (segments.length > 0 && lineSegments.length > 0) {
      const lastPoint = segments[segments.length - 1].p2;
      const firstPoint = lineSegments[0].p1;
      segments.push({ p1: lastPoint, p2: firstPoint, type: 'turn' });
    }

    lineSegments.forEach(seg => segments.push(seg));

    currentY -= width;
    direction *= -1;
  }

  return segments;
};

export const simplifyPoints = (points: GeoPoint[], toleranceMeters: number = 2): GeoPoint[] => {
  if (points.length < 3) return points;
  
  const result: GeoPoint[] = [points[0]];
  let lastPoint = points[0];

  for (let i = 1; i < points.length; i++) {
    const current = points[i];
    const dist = distanceMeters(lastPoint, current);
    if (dist >= toleranceMeters) {
      result.push(current);
      lastPoint = current;
    }
  }
  return result;
}

const distanceMeters = (p1: GeoPoint, p2: GeoPoint): number => {
  const R = 6371e3; 
  const φ1 = p1.lat * Math.PI/180;
  const φ2 = p2.lat * Math.PI/180;
  const Δφ = (p2.lat-p1.lat) * Math.PI/180;
  const Δλ = (p2.lng-p1.lng) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
}