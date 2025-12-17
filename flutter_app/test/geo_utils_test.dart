import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_app/core/geo_utils.dart';

void main() {
  group('GeoUtils', () {
    test('geoToCartesian converts correctly', () {
      final origin = GeoPoint(lat: 0, lng: 0, timestamp: 0);
      final point = GeoPoint(lat: 1, lng: 1, timestamp: 0);
      
      final result = GeoUtils.geoToCartesian(point, origin);
      
      // 1 degree lat is approx 111km
      expect(result.y, closeTo(111194.9, 100)); 
      // 1 degree lon at equator is approx 111km
      expect(result.x, closeTo(111194.9, 100));
    });

    test('calculatePolygonArea calculates square area', () {
      final points = [
        Point2D(0, 0),
        Point2D(10, 0),
        Point2D(10, 10),
        Point2D(0, 10),
      ];
      
      final area = GeoUtils.calculatePolygonArea(points);
      expect(area, 100);
    });
    
    test('generateOptimizedPath generates segments', () {
      final points = [
        Point2D(0, 0),
        Point2D(100, 0),
        Point2D(100, 100),
        Point2D(0, 100),
      ];
      final bounds = {'minX': 0.0, 'maxX': 100.0, 'minY': 0.0, 'maxY': 100.0};
      
      final result = GeoUtils.generateOptimizedPath(points, 10, bounds);
      final segments = result['segments'] as List<PathSegment>;
      
      expect(segments, isNotEmpty);
      // Should have roughly 10 passes + turns
      expect(segments.length, greaterThan(5));
    });
  });
}
