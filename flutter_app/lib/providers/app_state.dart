import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:geolocator/geolocator.dart';
import '../core/geo_utils.dart';

part 'app_state.g.dart';

enum AppMode { CAPTURE, SETUP, PLAN, RUN }

@riverpod
class AppModeController extends _$AppModeController {
  @override
  AppMode build() => AppMode.CAPTURE;

  void setMode(AppMode mode) => state = mode;
}

@riverpod
class GeoPointsController extends _$GeoPointsController {
  @override
  List<GeoPoint> build() => [];

  void addPoint(GeoPoint point) {
    state = [...state, point];
  }

  void undo() {
    if (state.isNotEmpty) {
      state = state.sublist(0, state.length - 1);
    }
  }

  void clear() {
    state = [];
  }

  void setPoints(List<GeoPoint> points) {
    state = points;
  }
}

@riverpod
class FieldController extends _$FieldController {
  @override
  FieldPolygon? build() => null;

  void setField(FieldPolygon? field) => state = field;
}

@riverpod
class EquipmentController extends _$EquipmentController {
  @override
  Equipment build() {
    return Equipment(
      id: '1',
      name: 'Garden Tractor',
      width: 1.2,
      speed: 1.5,
      type: 'tractor',
    );
  }

  void update(Equipment equipment) => state = equipment;
}

@riverpod
class PlanController extends _$PlanController {
  @override
  CoveragePlan? build() => null;

  void setPlan(CoveragePlan? plan) => state = plan;
}

@riverpod
Stream<Position> gpsStream(GpsStreamRef ref) {
  return Geolocator.getPositionStream(
    locationSettings: const LocationSettings(
      accuracy: LocationAccuracy.high,
      distanceFilter: 0,
    ),
  );
}
