import 'package:isar/isar.dart';
import 'package:path_provider/path_provider.dart';
import '../core/geo_utils.dart';

part 'database.g.dart';

@collection
class Field {
  Id id = Isar.autoIncrement;

  String? name;

  double? area;
  double? perimeter;

  DateTime? created;

  List<EmbeddedGeoPoint>? points;
}

@embedded
class EmbeddedGeoPoint {
  double? lat;
  double? lng;
  int? timestamp;

  EmbeddedGeoPoint({this.lat, this.lng, this.timestamp});
}

@collection
class Settings {
  Id id = Isar.autoIncrement;

  String? equipmentName;
  double? equipmentWidth;
  double? equipmentSpeed;
  String? equipmentType;
}

class DatabaseService {
  late Future<Isar> db;

  DatabaseService() {
    db = _initDB();
  }

  Future<Isar> _initDB() async {
    final dir = await getApplicationDocumentsDirectory();
    return await Isar.open(
      [FieldSchema, SettingsSchema],
      directory: dir.path,
    );
  }

  Future<void> saveField(String name, List<GeoPoint> points, double area, double perimeter) async {
    final isar = await db;
    final field = Field()
      ..name = name
      ..area = area
      ..perimeter = perimeter
      ..created = DateTime.now()
      ..points = points.map((p) => EmbeddedGeoPoint(lat: p.lat, lng: p.lng, timestamp: p.timestamp)).toList();

    await isar.writeTxn(() async {
      await isar.fields.put(field);
    });
  }

  Future<List<Field>> getFields() async {
    final isar = await db;
    return await isar.fields.where().findAll();
  }

  Future<void> saveSettings(String name, double width, double speed, String type) async {
    final isar = await db;
    final settings = Settings()
      ..equipmentName = name
      ..equipmentWidth = width
      ..equipmentSpeed = speed
      ..equipmentType = type;

    await isar.writeTxn(() async {
      // We only want one settings object, so clear others or update first
      await isar.settings.clear();
      await isar.settings.put(settings);
    });
  }

  Future<Settings?> getSettings() async {
    final isar = await db;
    return await isar.settings.where().findFirst();
  }
}
