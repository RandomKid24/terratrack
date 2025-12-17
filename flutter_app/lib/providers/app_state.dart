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
class IsSurveying extends _$IsSurveying {
  @override
  bool build() => false;

  void start() => state = true;
  void stop() => state = false;
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
Stream<Position> gpsStream(GpsStreamRef ref) async* {
  bool serviceEnabled;
  LocationPermission permission;

  // Test if location services are enabled.
  serviceEnabled = await Geolocator.isLocationServiceEnabled();
  if (!serviceEnabled) {
    throw Exception('Location services are disabled. Please enable GPS.');
  }

  permission = await Geolocator.checkPermission();
  if (permission == LocationPermission.denied) {
    permission = await Geolocator.requestPermission();
    if (permission == LocationPermission.denied) {
      throw Exception('Location permissions are denied');
    }
  }
  
  if (permission == LocationPermission.deniedForever) {
    throw Exception(
      'Location permissions are permanently denied, we cannot request permissions.');
  } 

  // When we reach here, permissions are granted and we can
  // continue accessing the position of the device.
  yield* Geolocator.getPositionStream(
    locationSettings: const LocationSettings(
      accuracy: LocationAccuracy.high,
      distanceFilter: 0,
    ),
  );
}
