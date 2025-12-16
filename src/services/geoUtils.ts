import { GeoPoint, Point2D, PathSegment } from '../types';
import * as turf from '@turf/turf';

// --- Conversion Helpers ---

export const geoToCartesian = (point: GeoPoint, origin: GeoPoint): Point2D => {
  // Use Turf to calculate distance and bearing, then convert to XY
  const from = turf.point([origin.lng, origin.lat]);
  const to = turf.point([point.lng, point.lat]);
  const distance = turf.distance(from, to, { units: 'meters' });
  const bearing = turf.bearing(from, to);
  
  // Convert polar to cartesian
  // Turf bearing is -180 to 180, 0 is North. 
  // Math.cos/sin take radians where 0 is East (usually). 
  // Standard map projection: Y is North.
  const rad = (90 - bearing) * (Math.PI / 180);
  
  return {
    x: distance * Math.cos(rad),
    y: distance * Math.sin(rad)
  };
};

// Inverse of geoToCartesian (approximate for small areas)
export const cartesianToGeo = (point: Point2D, origin: GeoPoint): GeoPoint => {
  const dist = Math.sqrt(point.x * point.x + point.y * point.y);
  if (dist === 0) return origin;
  
  const angleRad = Math.atan2(point.y, point.x);
  const bearing = 90 - (angleRad * 180 / Math.PI);
  
  const originPt = turf.point([origin.lng, origin.lat]);
  const dest = turf.destination(originPt, dist, bearing, { units: 'meters' });
  
  return {
    lat: dest.geometry.coordinates[1],
    lng: dest.geometry.coordinates[0],
    timestamp: Date.now()
  };
};

export const calculatePolygonArea = (points: Point2D[]): number => {
  // Turf area expects GeoJSON, but for Cartesian points we can use simple shoelace
  // or convert back to geo. For speed and relative accuracy in small fields, standard shoelace is fine.
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

// --- Shape Rectification (Make Square) ---

export const rectifyToRectangle = (points: GeoPoint[]): GeoPoint[] => {
  if (points.length < 3) return points;

  // 1. Convert to Cartesian
  const origin = points[0];
  const cartesian = points.map(p => geoToCartesian(p, origin));

  // 2. Find bounding box of the shape (aligned to principal axes is hard, let's use standard bbox)
  const polygon = turf.polygon([points.map(p => [p.lng, p.lat]).concat([[points[0].lng, points[0].lat]])]);
  const bbox = turf.bbox(polygon); // [minX, minY, maxX, maxY]
  
  // 3. Create a rectangle from bbox
  const rectPoly = turf.bboxPolygon(bbox);
  
  // 4. Return as GeoPoints
  return rectPoly.geometry.coordinates[0].slice(0, 4).map(c => ({
    lat: c[1],
    lng: c[0],
    timestamp: Date.now()
  }));
};

// --- Path Generation ---

const rotatePoint = (p: Point2D, theta: number): Point2D => {
  return {
    x: p.x * Math.cos(theta) - p.y * Math.sin(theta),
    y: p.x * Math.sin(theta) + p.y * Math.cos(theta)
  };
};

export const generateOptimizedPath = (
  points: Point2D[],
  width: number,
  bounds: { minX: number; maxX: number; minY: number; maxY: number }
): { segments: PathSegment[], angle: number } => {
  
  // Safety check for width
  const safeWidth = Math.max(width, 0.5);

  let bestSegments: PathSegment[] = [];
  let minTotalDist = Infinity;
  let bestAngle = 0;

  // Try standard angles: 0 (Horizontal), 90 (Vertical), and aligned to longest edge
  const anglesToTest = [0, 90];
  
  // Add angle of longest edge
  let maxDist = 0;
  let longestEdgeAngle = 0;
  for(let i=0; i<points.length; i++) {
     const p1 = points[i];
     const p2 = points[(i+1)%points.length];
     const d = Math.sqrt(Math.pow(p2.x-p1.x, 2) + Math.pow(p2.y-p1.y, 2));
     if(d > maxDist) {
         maxDist = d;
         longestEdgeAngle = Math.atan2(p2.y - p1.y, p2.x - p1.x) * (180/Math.PI);
     }
  }
  anglesToTest.push(longestEdgeAngle);

  for (const angleDeg of anglesToTest) {
    const angleRad = angleDeg * (Math.PI / 180);
    const rotatedPoints = points.map(p => rotatePoint(p, angleRad));
    
    // Bbox of rotated
    let rMinY = Infinity, rMaxY = -Infinity;
    rotatedPoints.forEach(p => {
      if (p.y < rMinY) rMinY = p.y;
      if (p.y > rMaxY) rMaxY = p.y;
    });

    const segments = generateScanLines(rotatedPoints, safeWidth, rMinY, rMaxY);
    
    // Calc efficiency (total length)
    let dist = 0;
    segments.forEach(s => {
       dist += Math.sqrt(Math.pow(s.p2.x - s.p1.x, 2) + Math.pow(s.p2.y - s.p1.y, 2));
    });

    if (dist > 0 && dist < minTotalDist) {
      minTotalDist = dist;
      bestSegments = segments;
      bestAngle = angleRad;
    }
  }

  // Rotate back
  const finalSegments = bestSegments.map(seg => ({
    type: seg.type,
    p1: rotatePoint(seg.p1, -bestAngle),
    p2: rotatePoint(seg.p2, -bestAngle)
  }));

  return { segments: finalSegments, angle: bestAngle * (180 / Math.PI) };
};

const generateScanLines = (
  points: Point2D[], 
  width: number, 
  minY: number, 
  maxY: number
): PathSegment[] => {
  const segments: PathSegment[] = [];
  const buffer = width * 0.5; 
  
  let currentY = maxY - buffer;
  let direction = 1;

  // Robust loop guard
  let iterations = 0;
  while (currentY > minY && iterations < 1000) {
    iterations++;
    const intersections: number[] = [];

    for (let i = 0; i < points.length; i++) {
      const p1 = points[i];
      const p2 = points[(i + 1) % points.length];

      // Ray casting intersection
      if ((p1.y > currentY && p2.y <= currentY) || (p2.y > currentY && p1.y <= currentY)) {
        const x = p1.x + (currentY - p1.y) * (p2.x - p1.x) / (p2.y - p1.y);
        intersections.push(x);
      }
    }

    intersections.sort((a, b) => a - b);

    // Create segments inside the polygon
    for (let k = 0; k < intersections.length; k += 2) {
      if (k + 1 < intersections.length) {
        const x1 = intersections[k];
        const x2 = intersections[k + 1];
        
        if (Math.abs(x2 - x1) < 0.1) continue; // Skip tiny segments

        const p1 = { x: x1, y: currentY };
        const p2 = { x: x2, y: currentY };
        
        // Add turn from previous
        if (segments.length > 0) {
            const prev = segments[segments.length - 1];
            segments.push({ p1: prev.p2, p2: direction === 1 ? p1 : p2, type: 'turn' });
        }

        if (direction === 1) {
          segments.push({ p1, p2, type: 'work' });
        } else {
          segments.push({ p1: p2, p2: p1, type: 'work' }); // Right to left
        }
      }
    }

    currentY -= width;
    direction *= -1;
  }

  return segments;
};

export const simplifyPoints = (points: GeoPoint[], tolerance: number): GeoPoint[] => {
    // Simple distance filter
    if(points.length < 3) return points;
    const result = [points[0]];
    let last = points[0];
    const from = turf.point([last.lng, last.lat]);

    for(let i=1; i<points.length; i++) {
        const to = turf.point([points[i].lng, points[i].lat]);
        if(turf.distance(from, to, {units: 'meters'}) > tolerance) {
            result.push(points[i]);
            last = points[i];
        }
    }
    return result;
}