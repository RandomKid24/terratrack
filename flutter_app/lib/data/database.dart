import 'package:drift/drift.dart';
import 'package:drift/native.dart';
import 'package:path_provider/path_provider.dart';
import 'package:path/path.dart' as p;
import 'dart:io';
import '../core/geo_utils.dart';

part 'database.g.dart';

// Tables
class Fields extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get name => text().nullable()();
  RealColumn get area => real().nullable()();
  RealColumn get perimeter => real().nullable()();
  DateTimeColumn get created => dateTime().nullable()();
  TextColumn get pointsJson => text().nullable()(); // Store as JSON
}

class Settings extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get equipmentName => text().nullable()();
  RealColumn get equipmentWidth => real().nullable()();
  RealColumn get equipmentSpeed => real().nullable()();
  TextColumn get equipmentType => text().nullable()();
}

@DriftDatabase(tables: [Fields, Settings])
class AppDatabase extends _$AppDatabase {
  AppDatabase() : super(_openConnection());

  @override
  int get schemaVersion => 1;
}

LazyDatabase _openConnection() {
  return LazyDatabase(() async {
    final dbFolder = await getApplicationDocumentsDirectory();
    final file = File(p.join(dbFolder.path, 'terratrack.db'));
    return NativeDatabase(file);
  });
}

// Database Service
class DatabaseService {
  late AppDatabase db;

  DatabaseService() {
    db = AppDatabase();
  }

  Future<void> saveField(String name, List<GeoPoint> points, double area, double perimeter) async {
    // Convert points to JSON
    final pointsJson = points.map((p) => '${p.lat},${p.lng},${p.timestamp}').join(';');
    
    await db.into(db.fields).insert(
      FieldsCompanion.insert(
        name: Value(name),
        area: Value(area),
        perimeter: Value(perimeter),
        created: Value(DateTime.now()),
        pointsJson: Value(pointsJson),
      ),
    );
  }

  Future<List<Field>> getFields() async {
    return await db.select(db.fields).get();
  }

  Future<void> saveSettings(String name, double width, double speed, String type) async {
    // Delete existing settings first
    await db.delete(db.settings).go();
    
    await db.into(db.settings).insert(
      SettingsCompanion.insert(
        equipmentName: Value(name),
        equipmentWidth: Value(width),
        equipmentSpeed: Value(speed),
        equipmentType: Value(type),
      ),
    );
  }

  Future<Setting?> getSettings() async {
    final results = await db.select(db.settings).get();
    return results.isEmpty ? null : results.first;
  }
}
