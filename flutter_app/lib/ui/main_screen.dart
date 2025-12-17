import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:geolocator/geolocator.dart';
import 'dart:math' show sqrt, pow, min, max;
import '../providers/app_state.dart';
import '../core/geo_utils.dart';

class MainScreen extends ConsumerStatefulWidget {
  const MainScreen({super.key});

  @override
  ConsumerState<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends ConsumerState<MainScreen> {
  @override
  Widget build(BuildContext context) {
    final mode = ref.watch(appModeControllerProvider);
    final gpsAsync = ref.watch(gpsStreamProvider);
    final geoPoints = ref.watch(geoPointsControllerProvider);
    final field = ref.watch(fieldControllerProvider);
    final plan = ref.watch(planControllerProvider);
    final equipment = ref.watch(equipmentControllerProvider);

    return Scaffold(
      body: Stack(
        children: [
          // Map Layer
          Positioned.fill(
            child: gpsAsync.when(
              data: (pos) {
                return CustomPaint(
                  painter: MapPainter(
                    currentPos: GeoPoint(
                      lat: pos.latitude,
                      lng: pos.longitude,
                      timestamp: pos.timestamp?.millisecondsSinceEpoch ?? DateTime.now().millisecondsSinceEpoch,
                    ),
                    geoPoints: geoPoints,
                    field: field,
                    plan: plan,
                    mode: mode,
                  ),
                );
              },
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (err, stack) => Center(child: Text('GPS Error: $err')),
            ),
          ),

          // Header
          Positioned(
            top: 0,
            left: 0,
            right: 0,
            child: SafeArea(
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                color: Colors.white.withOpacity(0.9),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: Colors.green.shade100,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: const Icon(Icons.agriculture, color: Colors.green),
                        ),
                        const SizedBox(width: 8),
                        Text(
                          _getTitle(mode),
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                    IconButton(
                      icon: const Icon(Icons.help_outline),
                      onPressed: () {},
                    ),
                  ],
                ),
              ),
            ),
          ),

          // Bottom Controls
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.05),
                    blurRadius: 10,
                    offset: const Offset(0, -4),
                  ),
                ],
              ),
              child: SafeArea(
                child: _buildControls(mode, geoPoints, field, equipment),
              ),
            ),
          ),
        ],
      ),
    );
  }

  String _getTitle(AppMode mode) {
    switch (mode) {
      case AppMode.CAPTURE: return 'Capture Field';
      case AppMode.SETUP: return 'Field Setup';
      case AppMode.PLAN: return 'Coverage Plan';
      case AppMode.RUN: return 'Running';
    }
  }

  Widget _buildControls(AppMode mode, List<GeoPoint> points, FieldPolygon? field, Equipment equipment) {
    switch (mode) {
      case AppMode.CAPTURE:
        return Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (points.isEmpty)
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: () {
                    // Start logic is implicit as we are streaming, but we can clear points
                    ref.read(geoPointsControllerProvider.notifier).clear();
                  },
                  icon: const Icon(Icons.play_arrow),
                  label: const Text('Start Survey'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.green,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                  ),
                ),
              )
            else ...[
              Row(
                children: [
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: () {
                        final pos = ref.read(gpsStreamProvider).value;
                        if (pos != null) {
                          ref.read(geoPointsControllerProvider.notifier).addPoint(
                            GeoPoint(
                              lat: pos.latitude,
                              lng: pos.longitude,
                              timestamp: pos.timestamp?.millisecondsSinceEpoch ?? DateTime.now().millisecondsSinceEpoch,
                            ),
                          );
                        }
                      },
                      icon: const Icon(Icons.add_circle_outline),
                      label: const Text('Add Corner'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.green,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  IconButton.filledTonal(
                    onPressed: () {
                      ref.read(geoPointsControllerProvider.notifier).undo();
                    },
                    icon: const Icon(Icons.undo),
                    style: IconButton.styleFrom(
                      padding: const EdgeInsets.all(16),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: points.length >= 3 ? () => _finishCapture(points) : null,
                      icon: const Icon(Icons.check),
                      label: const Text('Finish Shape'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.indigo,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () {
                         ref.read(geoPointsControllerProvider.notifier).clear();
                      },
                      icon: const Icon(Icons.close),
                      label: const Text('Cancel'),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: Colors.red,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ],
        );
      case AppMode.SETUP:
        return Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
             Row(
               children: [
                 Expanded(
                   child: _StatCard(label: 'Area', value: '${field?.areaSqMeters.toStringAsFixed(0)} m²'),
                 ),
                 const SizedBox(width: 12),
                 Expanded(
                   child: _StatCard(label: 'Perimeter', value: '${field?.perimeterMeters.toStringAsFixed(0)} m'),
                 ),
               ],
             ),
             const SizedBox(height: 16),
             TextField(
               decoration: const InputDecoration(
                 labelText: 'Equipment Name',
                 border: OutlineInputBorder(),
               ),
               controller: TextEditingController(text: equipment.name),
               onChanged: (val) {
                 ref.read(equipmentControllerProvider.notifier).update(
                   Equipment(
                     id: equipment.id,
                     name: val,
                     width: equipment.width,
                     speed: equipment.speed,
                     type: equipment.type,
                   )
                 );
               },
             ),
             const SizedBox(height: 12),
             TextField(
               decoration: const InputDecoration(
                 labelText: 'Work Width (m)',
                 border: OutlineInputBorder(),
                 suffixText: 'meters',
               ),
               keyboardType: TextInputType.number,
               controller: TextEditingController(text: equipment.width.toString()),
                onChanged: (val) {
                 final w = double.tryParse(val) ?? equipment.width;
                 ref.read(equipmentControllerProvider.notifier).update(
                   Equipment(
                     id: equipment.id,
                     name: equipment.name,
                     width: w,
                     speed: equipment.speed,
                     type: equipment.type,
                   )
                 );
               },
             ),
             const SizedBox(height: 16),
             ElevatedButton.icon(
               onPressed: () => _generatePlan(field!, equipment),
               icon: const Icon(Icons.route),
               label: const Text('Generate Plan'),
               style: ElevatedButton.styleFrom(
                 backgroundColor: Colors.green,
                 foregroundColor: Colors.white,
                 padding: const EdgeInsets.symmetric(vertical: 16),
               ),
             ),
          ],
        );
      case AppMode.PLAN:
        return Column(
          mainAxisSize: MainAxisSize.min,
          children: [
             ElevatedButton.icon(
               onPressed: () {
                 ref.read(appModeControllerProvider.notifier).setMode(AppMode.RUN);
               },
               icon: const Icon(Icons.play_arrow),
               label: const Text('Start Run'),
               style: ElevatedButton.styleFrom(
                 backgroundColor: Colors.green,
                 foregroundColor: Colors.white,
                 padding: const EdgeInsets.symmetric(vertical: 16),
                 minimumSize: const Size(double.infinity, 50),
               ),
             ),
          ],
        );
      case AppMode.RUN:
         return const Center(child: Text("Running..."));
    }
  }

  void _finishCapture(List<GeoPoint> points) {
    if (points.isEmpty) return;
    final origin = points[0];
    final projected = points.map((p) => GeoUtils.geoToCartesian(p, origin)).toList();
    
    double minX = double.infinity, maxX = -double.infinity;
    double minY = double.infinity, maxY = -double.infinity;
    
    for (var p in projected) {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    }
    
    final area = GeoUtils.calculatePolygonArea(projected);
    final perimeter = GeoUtils.calculatePerimeter(projected);
    
    final field = FieldPolygon(
      geoPoints: points,
      projectedPoints: projected,
      areaSqMeters: area,
      perimeterMeters: perimeter,
      bounds: {'minX': minX, 'maxX': maxX, 'minY': minY, 'maxY': maxY},
    );
    
    ref.read(fieldControllerProvider.notifier).setField(field);
    ref.read(appModeControllerProvider.notifier).setMode(AppMode.SETUP);
  }
  
  void _generatePlan(FieldPolygon field, Equipment equipment) {
    final result = GeoUtils.generateOptimizedPath(
      field.projectedPoints,
      equipment.width,
      field.bounds,
    );
    
    final segments = result['segments'] as List<PathSegment>;
    
    double totalDist = 0;
    for (var s in segments) {
      totalDist += sqrt(pow(s.p2.x - s.p1.x, 2) + pow(s.p2.y - s.p1.y, 2));
    }
    
    final plan = CoveragePlan(
      segments: segments,
      totalDistance: totalDist,
      estimatedTimeSeconds: totalDist / equipment.speed,
      efficiencyScore: (field.areaSqMeters / (totalDist * equipment.width)) * 100,
    );
    
    ref.read(planControllerProvider.notifier).setPlan(plan);
    ref.read(appModeControllerProvider.notifier).setMode(AppMode.PLAN);
  }
}

class _StatCard extends StatelessWidget {
  final String label;
  final String value;
  
  const _StatCard({required this.label, required this.value});
  
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.grey.shade50,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Column(
        children: [
          Text(label, style: TextStyle(fontSize: 12, color: Colors.grey.shade600, fontWeight: FontWeight.bold)),
          const SizedBox(height: 4),
          Text(value, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }
}

class MapPainter extends CustomPainter {
  final GeoPoint currentPos;
  final List<GeoPoint> geoPoints;
  final FieldPolygon? field;
  final CoveragePlan? plan;
  final AppMode mode;

  MapPainter({
    required this.currentPos,
    required this.geoPoints,
    this.field,
    this.plan,
    required this.mode,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint();
    
    // Draw Grid
    paint.color = Colors.grey.shade200;
    paint.strokeWidth = 1;
    for (double x = 0; x < size.width; x += 40) {
      canvas.drawLine(Offset(x, 0), Offset(x, size.height), paint);
    }
    for (double y = 0; y < size.height; y += 40) {
      canvas.drawLine(Offset(0, y), Offset(size.width, y), paint);
    }

    // Determine Origin and Scale
    GeoPoint origin;
    List<Point2D> projected = [];
    
    if (field != null) {
      origin = field!.geoPoints[0];
      projected = field!.projectedPoints;
    } else if (geoPoints.isNotEmpty) {
      origin = geoPoints[0];
      projected = geoPoints.map((p) => GeoUtils.geoToCartesian(p, origin)).toList();
    } else {
      origin = currentPos;
      projected = [];
    }
    
    // Add current pos to projected for bounds calculation if capturing
    Point2D currentProj = GeoUtils.geoToCartesian(currentPos, origin);
    
    double minX = double.infinity, maxX = -double.infinity;
    double minY = double.infinity, maxY = -double.infinity;
    
    final pointsToCheck = [...projected];
    if (mode == AppMode.CAPTURE) pointsToCheck.add(currentProj);
    
    if (pointsToCheck.isEmpty) {
       // Just center current pos
       minX = currentProj.x - 20; maxX = currentProj.x + 20;
       minY = currentProj.y - 20; maxY = currentProj.y + 20;
    } else {
      for (var p in pointsToCheck) {
        if (p.x < minX) minX = p.x;
        if (p.x > maxX) maxX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.y > maxY) maxY = p.y;
      }
    }
    
    // Padding
    final pad = max((maxX - minX) * 0.2, 10.0);
    minX -= pad; maxX += pad;
    minY -= pad; maxY += pad;
    
    final rangeX = max(maxX - minX, 1.0);
    final rangeY = max(maxY - minY, 1.0);
    
    final scaleX = size.width / rangeX;
    final scaleY = size.height / rangeY;
    final scale = min(scaleX, scaleY);
    
    Offset toScreen(Point2D p) {
      return Offset(
        (p.x - minX) * scale + (size.width - rangeX * scale) / 2,
        size.height - ((p.y - minY) * scale + (size.height - rangeY * scale) / 2),
      );
    }
    
    // Draw Field Polygon
    if (projected.isNotEmpty) {
      final path = Path();
      final start = toScreen(projected[0]);
      path.moveTo(start.dx, start.dy);
      for (int i = 1; i < projected.length; i++) {
        final p = toScreen(projected[i]);
        path.lineTo(p.dx, p.dy);
      }
      path.close();
      
      if (mode != AppMode.CAPTURE) {
        paint.color = Colors.green.shade50;
        paint.style = PaintingStyle.fill;
        canvas.drawPath(path, paint);
      }
      
      paint.color = Colors.green;
      paint.style = PaintingStyle.stroke;
      paint.strokeWidth = 3;
      canvas.drawPath(path, paint);
      
      // Draw corners
      paint.style = PaintingStyle.fill;
      paint.color = Colors.white;
      for (var p in projected) {
        final s = toScreen(p);
        canvas.drawCircle(s, 5, paint);
        canvas.drawCircle(s, 5, Paint()..color = Colors.green ..style = PaintingStyle.stroke ..strokeWidth = 2);
      }
    }
    
    // Draw Plan
    if (plan != null && (mode == AppMode.PLAN || mode == AppMode.RUN)) {
      paint.style = PaintingStyle.stroke;
      paint.color = Colors.amber.shade700;
      paint.strokeWidth = 2;
      
      for (var seg in plan!.segments) {
        if (seg.type == PathType.turn) {
           paint.color = Colors.amber.shade300;
           // Dash effect?
        } else {
           paint.color = Colors.amber.shade700;
        }
        final p1 = toScreen(seg.p1);
        final p2 = toScreen(seg.p2);
        canvas.drawLine(p1, p2, paint);
      }
    }
    
    // Draw Current Position
    final sPos = toScreen(currentProj);
    
    // Pulse effect (simple circle for now)
    paint.style = PaintingStyle.fill;
    paint.color = Colors.blue.withOpacity(0.2);
    canvas.drawCircle(sPos, 15, paint);
    
    paint.color = Colors.blue;
    paint.style = PaintingStyle.fill;
    canvas.drawCircle(sPos, 8, paint);
    
    paint.color = Colors.white;
    paint.style = PaintingStyle.stroke;
    paint.strokeWidth = 2;
    canvas.drawCircle(sPos, 8, paint);
    
    // Draw connecting line if capturing
    if (mode == AppMode.CAPTURE && projected.isNotEmpty) {
      final last = toScreen(projected.last);
      paint.color = Colors.blue;
      paint.strokeWidth = 2;
      // dash
      canvas.drawLine(last, sPos, paint);
    }
  }

  @override
  bool shouldRepaint(covariant MapPainter oldDelegate) {
    return true; // Repaint on any change for now
  }
}
