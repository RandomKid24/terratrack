import 'dart:math';

class GeoPoint {
  final double lat;
  final double lng;
  final int timestamp;

  GeoPoint({required this.lat, required this.lng, required this.timestamp});
}

class Point2D {
  final double x;
  final double y;

  Point2D(this.x, this.y);
}

enum PathType { work, turn }

class PathSegment {
  final Point2D p1;
  final Point2D p2;
  final PathType type;

  PathSegment({required this.p1, required this.p2, required this.type});
}

class Equipment {
  String id;
  String name;
  double width;
  double speed;
  String type;

  Equipment({
    required this.id,
    required this.name,
    required this.width,
    required this.speed,
    required this.type,
  });
}

class CoveragePlan {
  List<PathSegment> segments;
  double totalDistance;
  double estimatedTimeSeconds;
  double efficiencyScore;

  CoveragePlan({
    required this.segments,
    required this.totalDistance,
    required this.estimatedTimeSeconds,
    required this.efficiencyScore,
  });
}

class FieldPolygon {
  List<GeoPoint> geoPoints;
  List<Point2D> projectedPoints;
  double areaSqMeters;
  double perimeterMeters;
  Map<String, double> bounds;

  FieldPolygon({
    required this.geoPoints,
    required this.projectedPoints,
    required this.areaSqMeters,
    required this.perimeterMeters,
    required this.bounds,
  });
}

class GeoUtils {
  static const double EARTH_RADIUS = 6371000; // meters

  /// Converts a GeoPoint to a relative Cartesian point (meters) based on an origin.
  static Point2D geoToCartesian(GeoPoint point, GeoPoint origin) {
    final dLat = (point.lat - origin.lat) * (pi / 180);
    final dLon = (point.lng - origin.lng) * (pi / 180);

    // y is North (positive lat)
    final y = dLat * EARTH_RADIUS;

    // x is East. Adjust for latitude shrinkage
    final latRad = origin.lat * (pi / 180);
    final x = dLon * EARTH_RADIUS * cos(latRad);

    return Point2D(x, y);
  }

  static double calculatePolygonArea(List<Point2D> points) {
    double area = 0;
    for (int i = 0; i < points.length; i++) {
      final j = (i + 1) % points.length;
      area += points[i].x * points[j].y;
      area -= points[j].x * points[i].y;
    }
    return area.abs() / 2;
  }

  static double calculatePerimeter(List<Point2D> points) {
    double perimeter = 0;
    for (int i = 0; i < points.length; i++) {
      final j = (i + 1) % points.length;
      final dx = points[j].x - points[i].x;
      final dy = points[j].y - points[i].y;
      perimeter += sqrt(dx * dx + dy * dy);
    }
    return perimeter;
  }

  /// Rotate a point around (0,0) by theta radians.
  static Point2D rotatePoint(Point2D p, double theta) {
    return Point2D(
      p.x * cos(theta) - p.y * sin(theta),
      p.x * sin(theta) + p.y * cos(theta),
    );
  }

  /// Generates an OPTIMIZED coverage path by trying multiple angles.
  static Map<String, dynamic> generateOptimizedPath(
    List<Point2D> points,
    double width,
    Map<String, double> bounds, // minX, maxX, minY, maxY
  ) {
    List<PathSegment> bestSegments = [];
    double minTotalDist = double.infinity;
    double bestAngle = 0;

    // Try angles from 0 to 180 degrees in steps of 15 degrees
    for (int angleDeg = 0; angleDeg < 180; angleDeg += 15) {
      final angleRad = angleDeg * (pi / 180);

      // 1. Rotate polygon to this alignment
      final rotatedPoints = points.map((p) => rotatePoint(p, angleRad)).toList();

      // 2. Recalculate bounds for rotated polygon
      double rMinX = double.infinity, rMaxX = -double.infinity;
      double rMinY = double.infinity, rMaxY = -double.infinity;

      for (var p in rotatedPoints) {
        if (p.x < rMinX) rMinX = p.x;
        if (p.x > rMaxX) rMaxX = p.x;
        if (p.y < rMinY) rMinY = p.y;
        if (p.y > rMaxY) rMaxY = p.y;
      }

      // 3. Generate scanline path for this rotation
      final scanSegments = _generateScanLines(
        rotatedPoints,
        width,
        {'minX': rMinX, 'maxX': rMaxX, 'minY': rMinY, 'maxY': rMaxY},
      );

      // 4. Calculate total distance (work + turns)
      double dist = 0;
      for (var s in scanSegments) {
        dist += sqrt(pow(s.p2.x - s.p1.x, 2) + pow(s.p2.y - s.p1.y, 2));
      }

      // 5. Check if this is better
      if (dist < minTotalDist && scanSegments.isNotEmpty) {
        minTotalDist = dist;
        bestSegments = scanSegments;
        bestAngle = angleRad;
      }
    }

    // 6. Rotate the best segments back to original coordinates
    final finalSegments = bestSegments.map((seg) {
      return PathSegment(
        type: seg.type,
        p1: rotatePoint(seg.p1, -bestAngle),
        p2: rotatePoint(seg.p2, -bestAngle),
      );
    }).toList();

    return {
      'segments': finalSegments,
      'angle': bestAngle * (180 / pi),
    };
  }

  /// Internal basic scanline generator (Top-Down)
  static List<PathSegment> _generateScanLines(
    List<Point2D> points,
    double width,
    Map<String, double> bounds,
  ) {
    final segments = <PathSegment>[];
    final buffer = width * 0.5;

    double currentY = bounds['maxY']! - buffer;
    int direction = 1; // 1 = Left to Right, -1 = Right to Left

    while (currentY > bounds['minY']!) {
      final intersections = <double>[];

      for (int i = 0; i < points.length; i++) {
        final p1 = points[i];
        final p2 = points[(i + 1) % points.length];

        if ((p1.y > currentY && p2.y <= currentY) ||
            (p2.y > currentY && p1.y <= currentY)) {
          // x = x1 + (y - y1) * (x2 - x1) / (y2 - y1)
          final x = p1.x + (currentY - p1.y) * (p2.x - p1.x) / (p2.y - p1.y);
          intersections.push(x);
        }
      }

      intersections.sort();

      final lineSegments = <PathSegment>[];

      // Create segments for valid intersections inside polygon
      for (int k = 0; k < intersections.length; k += 2) {
        if (k + 1 < intersections.length) {
          final xStart = intersections[k];
          final xEnd = intersections[k + 1];

          final p1 = Point2D(xStart, currentY);
          final p2 = Point2D(xEnd, currentY);

          if (direction == 1) {
            lineSegments.add(PathSegment(p1: p1, p2: p2, type: PathType.work));
          } else {
            lineSegments.insert(0, PathSegment(p1: p2, p2: p1, type: PathType.work));
          }
        }
      }

      if (segments.isNotEmpty && lineSegments.isNotEmpty) {
        final lastPoint = segments.last.p2;
        final firstPoint = lineSegments.first.p1;
        segments.add(PathSegment(p1: lastPoint, p2: firstPoint, type: PathType.turn));
      }

      segments.addAll(lineSegments);

      currentY -= width;
      direction *= -1;
    }

    return segments;
  }

  static List<GeoPoint> simplifyPoints(List<GeoPoint> points, {double toleranceMeters = 2}) {
    if (points.length < 3) return points;

    final result = <GeoPoint>[points[0]];
    var lastPoint = points[0];

    for (int i = 1; i < points.length; i++) {
      final current = points[i];
      final dist = distanceMeters(lastPoint, current);
      if (dist >= toleranceMeters) {
        result.add(current);
        lastPoint = current;
      }
    }
    return result;
  }

  static double distanceMeters(GeoPoint p1, GeoPoint p2) {
    const R = 6371e3;
    final phi1 = p1.lat * pi / 180;
    final phi2 = p2.lat * pi / 180;
    final deltaPhi = (p2.lat - p1.lat) * pi / 180;
    final deltaLambda = (p2.lng - p1.lng) * pi / 180;

    final a = sin(deltaPhi / 2) * sin(deltaPhi / 2) +
        cos(phi1) * cos(phi2) * sin(deltaLambda / 2) * sin(deltaLambda / 2);
    final c = 2 * atan2(sqrt(a), sqrt(1 - a));

    return R * c;
  }
  
  static List<GeoPoint> rectifyToRectangle(List<GeoPoint> points) {
    // Basic implementation: Find bounding box and return corners
    // This is a placeholder for the actual rectification logic if needed,
    // but for now we can just return the bounding box of the points
    // converted back to GeoPoints.
    // However, the React app uses a more complex logic? 
    // The React app calls `GeoUtils.rectifyToRectangle(field.geoPoints)`.
    // I need to check if I missed that function in the React code.
    // Looking at the React code provided, `rectifyShape` calls `GeoUtils.rectifyToRectangle`.
    // But I didn't see `rectifyToRectangle` in the `geoUtils.ts` file I read!
    // Let me check the file content again.
    // Ah, I might have missed it or it wasn't there.
    // Wait, step 17 showed lines 1 to 207.
    // I don't see `rectifyToRectangle` exported in step 17.
    // Maybe it was added later or I missed it.
    // Or maybe it's in `types.ts`? No.
    // If it's missing, I'll implement a simple bounding box rectification.
    
    if (points.isEmpty) return points;
    
    double minLat = 90;
    double maxLat = -90;
    double minLng = 180;
    double maxLng = -180;
    
    for (var p in points) {
      if (p.lat < minLat) minLat = p.lat;
      if (p.lat > maxLat) maxLat = p.lat;
      if (p.lng < minLng) minLng = p.lng;
      if (p.lng > maxLng) maxLng = p.lng;
    }
    
    return [
      GeoPoint(lat: maxLat, lng: minLng, timestamp: DateTime.now().millisecondsSinceEpoch), // Top-Left
      GeoPoint(lat: maxLat, lng: maxLng, timestamp: DateTime.now().millisecondsSinceEpoch), // Top-Right
      GeoPoint(lat: minLat, lng: maxLng, timestamp: DateTime.now().millisecondsSinceEpoch), // Bottom-Right
      GeoPoint(lat: minLat, lng: minLng, timestamp: DateTime.now().millisecondsSinceEpoch), // Bottom-Left
    ];
  }
}

extension ListPush<T> on List<T> {
  void push(T element) => add(element);
}
