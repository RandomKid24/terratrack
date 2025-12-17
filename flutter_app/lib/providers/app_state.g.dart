// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'app_state.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

String _$gpsStreamHash() => r'02ff788be3950a53ca0ed70e2e06ae80aa5bc84f';

/// See also [gpsStream].
@ProviderFor(gpsStream)
final gpsStreamProvider = AutoDisposeStreamProvider<Position>.internal(
  gpsStream,
  name: r'gpsStreamProvider',
  debugGetCreateSourceHash:
      const bool.fromEnvironment('dart.vm.product') ? null : _$gpsStreamHash,
  dependencies: null,
  allTransitiveDependencies: null,
);

typedef GpsStreamRef = AutoDisposeStreamProviderRef<Position>;
String _$appModeControllerHash() => r'90ae22a161e8fa6a327b23ace0bec66e6450d32d';

/// See also [AppModeController].
@ProviderFor(AppModeController)
final appModeControllerProvider =
    AutoDisposeNotifierProvider<AppModeController, AppMode>.internal(
  AppModeController.new,
  name: r'appModeControllerProvider',
  debugGetCreateSourceHash: const bool.fromEnvironment('dart.vm.product')
      ? null
      : _$appModeControllerHash,
  dependencies: null,
  allTransitiveDependencies: null,
);

typedef _$AppModeController = AutoDisposeNotifier<AppMode>;
String _$isSurveyingHash() => r'33cff91a59ef8aa6aa85a7fe21606a72bbe0aac6';

/// See also [IsSurveying].
@ProviderFor(IsSurveying)
final isSurveyingProvider =
    AutoDisposeNotifierProvider<IsSurveying, bool>.internal(
  IsSurveying.new,
  name: r'isSurveyingProvider',
  debugGetCreateSourceHash:
      const bool.fromEnvironment('dart.vm.product') ? null : _$isSurveyingHash,
  dependencies: null,
  allTransitiveDependencies: null,
);

typedef _$IsSurveying = AutoDisposeNotifier<bool>;
String _$geoPointsControllerHash() =>
    r'4c44b29a38cd7f427f732da6e75964f886e9e92d';

/// See also [GeoPointsController].
@ProviderFor(GeoPointsController)
final geoPointsControllerProvider =
    AutoDisposeNotifierProvider<GeoPointsController, List<GeoPoint>>.internal(
  GeoPointsController.new,
  name: r'geoPointsControllerProvider',
  debugGetCreateSourceHash: const bool.fromEnvironment('dart.vm.product')
      ? null
      : _$geoPointsControllerHash,
  dependencies: null,
  allTransitiveDependencies: null,
);

typedef _$GeoPointsController = AutoDisposeNotifier<List<GeoPoint>>;
String _$fieldControllerHash() => r'1c10ed6a35dd4b4f675b2b87fbf2d07accf48bf9';

/// See also [FieldController].
@ProviderFor(FieldController)
final fieldControllerProvider =
    AutoDisposeNotifierProvider<FieldController, FieldPolygon?>.internal(
  FieldController.new,
  name: r'fieldControllerProvider',
  debugGetCreateSourceHash: const bool.fromEnvironment('dart.vm.product')
      ? null
      : _$fieldControllerHash,
  dependencies: null,
  allTransitiveDependencies: null,
);

typedef _$FieldController = AutoDisposeNotifier<FieldPolygon?>;
String _$equipmentControllerHash() =>
    r'f75f71e84e8d3ad2e21196fc136632679c0b6f05';

/// See also [EquipmentController].
@ProviderFor(EquipmentController)
final equipmentControllerProvider =
    AutoDisposeNotifierProvider<EquipmentController, Equipment>.internal(
  EquipmentController.new,
  name: r'equipmentControllerProvider',
  debugGetCreateSourceHash: const bool.fromEnvironment('dart.vm.product')
      ? null
      : _$equipmentControllerHash,
  dependencies: null,
  allTransitiveDependencies: null,
);

typedef _$EquipmentController = AutoDisposeNotifier<Equipment>;
String _$planControllerHash() => r'790ec7604d56dfaa73ac30191608db8b0dc21569';

/// See also [PlanController].
@ProviderFor(PlanController)
final planControllerProvider =
    AutoDisposeNotifierProvider<PlanController, CoveragePlan?>.internal(
  PlanController.new,
  name: r'planControllerProvider',
  debugGetCreateSourceHash: const bool.fromEnvironment('dart.vm.product')
      ? null
      : _$planControllerHash,
  dependencies: null,
  allTransitiveDependencies: null,
);

typedef _$PlanController = AutoDisposeNotifier<CoveragePlan?>;
// ignore_for_file: type=lint
// ignore_for_file: subtype_of_sealed_class, invalid_use_of_internal_member, invalid_use_of_visible_for_testing_member
