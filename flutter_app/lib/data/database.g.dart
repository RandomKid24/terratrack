// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'database.dart';

// ignore_for_file: type=lint
class $FieldsTable extends Fields with TableInfo<$FieldsTable, Field> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $FieldsTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<int> id = GeneratedColumn<int>(
      'id', aliasedName, false,
      hasAutoIncrement: true,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultConstraints:
          GeneratedColumn.constraintIsAlways('PRIMARY KEY AUTOINCREMENT'));
  static const VerificationMeta _nameMeta = const VerificationMeta('name');
  @override
  late final GeneratedColumn<String> name = GeneratedColumn<String>(
      'name', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _areaMeta = const VerificationMeta('area');
  @override
  late final GeneratedColumn<double> area = GeneratedColumn<double>(
      'area', aliasedName, true,
      type: DriftSqlType.double, requiredDuringInsert: false);
  static const VerificationMeta _perimeterMeta =
      const VerificationMeta('perimeter');
  @override
  late final GeneratedColumn<double> perimeter = GeneratedColumn<double>(
      'perimeter', aliasedName, true,
      type: DriftSqlType.double, requiredDuringInsert: false);
  static const VerificationMeta _createdMeta =
      const VerificationMeta('created');
  @override
  late final GeneratedColumn<DateTime> created = GeneratedColumn<DateTime>(
      'created', aliasedName, true,
      type: DriftSqlType.dateTime, requiredDuringInsert: false);
  static const VerificationMeta _pointsJsonMeta =
      const VerificationMeta('pointsJson');
  @override
  late final GeneratedColumn<String> pointsJson = GeneratedColumn<String>(
      'points_json', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  @override
  List<GeneratedColumn> get $columns =>
      [id, name, area, perimeter, created, pointsJson];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'fields';
  @override
  VerificationContext validateIntegrity(Insertable<Field> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    }
    if (data.containsKey('name')) {
      context.handle(
          _nameMeta, name.isAcceptableOrUnknown(data['name']!, _nameMeta));
    }
    if (data.containsKey('area')) {
      context.handle(
          _areaMeta, area.isAcceptableOrUnknown(data['area']!, _areaMeta));
    }
    if (data.containsKey('perimeter')) {
      context.handle(_perimeterMeta,
          perimeter.isAcceptableOrUnknown(data['perimeter']!, _perimeterMeta));
    }
    if (data.containsKey('created')) {
      context.handle(_createdMeta,
          created.isAcceptableOrUnknown(data['created']!, _createdMeta));
    }
    if (data.containsKey('points_json')) {
      context.handle(
          _pointsJsonMeta,
          pointsJson.isAcceptableOrUnknown(
              data['points_json']!, _pointsJsonMeta));
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  Field map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return Field(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}id'])!,
      name: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}name']),
      area: attachedDatabase.typeMapping
          .read(DriftSqlType.double, data['${effectivePrefix}area']),
      perimeter: attachedDatabase.typeMapping
          .read(DriftSqlType.double, data['${effectivePrefix}perimeter']),
      created: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}created']),
      pointsJson: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}points_json']),
    );
  }

  @override
  $FieldsTable createAlias(String alias) {
    return $FieldsTable(attachedDatabase, alias);
  }
}

class Field extends DataClass implements Insertable<Field> {
  final int id;
  final String? name;
  final double? area;
  final double? perimeter;
  final DateTime? created;
  final String? pointsJson;
  const Field(
      {required this.id,
      this.name,
      this.area,
      this.perimeter,
      this.created,
      this.pointsJson});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<int>(id);
    if (!nullToAbsent || name != null) {
      map['name'] = Variable<String>(name);
    }
    if (!nullToAbsent || area != null) {
      map['area'] = Variable<double>(area);
    }
    if (!nullToAbsent || perimeter != null) {
      map['perimeter'] = Variable<double>(perimeter);
    }
    if (!nullToAbsent || created != null) {
      map['created'] = Variable<DateTime>(created);
    }
    if (!nullToAbsent || pointsJson != null) {
      map['points_json'] = Variable<String>(pointsJson);
    }
    return map;
  }

  FieldsCompanion toCompanion(bool nullToAbsent) {
    return FieldsCompanion(
      id: Value(id),
      name: name == null && nullToAbsent ? const Value.absent() : Value(name),
      area: area == null && nullToAbsent ? const Value.absent() : Value(area),
      perimeter: perimeter == null && nullToAbsent
          ? const Value.absent()
          : Value(perimeter),
      created: created == null && nullToAbsent
          ? const Value.absent()
          : Value(created),
      pointsJson: pointsJson == null && nullToAbsent
          ? const Value.absent()
          : Value(pointsJson),
    );
  }

  factory Field.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return Field(
      id: serializer.fromJson<int>(json['id']),
      name: serializer.fromJson<String?>(json['name']),
      area: serializer.fromJson<double?>(json['area']),
      perimeter: serializer.fromJson<double?>(json['perimeter']),
      created: serializer.fromJson<DateTime?>(json['created']),
      pointsJson: serializer.fromJson<String?>(json['pointsJson']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<int>(id),
      'name': serializer.toJson<String?>(name),
      'area': serializer.toJson<double?>(area),
      'perimeter': serializer.toJson<double?>(perimeter),
      'created': serializer.toJson<DateTime?>(created),
      'pointsJson': serializer.toJson<String?>(pointsJson),
    };
  }

  Field copyWith(
          {int? id,
          Value<String?> name = const Value.absent(),
          Value<double?> area = const Value.absent(),
          Value<double?> perimeter = const Value.absent(),
          Value<DateTime?> created = const Value.absent(),
          Value<String?> pointsJson = const Value.absent()}) =>
      Field(
        id: id ?? this.id,
        name: name.present ? name.value : this.name,
        area: area.present ? area.value : this.area,
        perimeter: perimeter.present ? perimeter.value : this.perimeter,
        created: created.present ? created.value : this.created,
        pointsJson: pointsJson.present ? pointsJson.value : this.pointsJson,
      );
  @override
  String toString() {
    return (StringBuffer('Field(')
          ..write('id: $id, ')
          ..write('name: $name, ')
          ..write('area: $area, ')
          ..write('perimeter: $perimeter, ')
          ..write('created: $created, ')
          ..write('pointsJson: $pointsJson')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode =>
      Object.hash(id, name, area, perimeter, created, pointsJson);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is Field &&
          other.id == this.id &&
          other.name == this.name &&
          other.area == this.area &&
          other.perimeter == this.perimeter &&
          other.created == this.created &&
          other.pointsJson == this.pointsJson);
}

class FieldsCompanion extends UpdateCompanion<Field> {
  final Value<int> id;
  final Value<String?> name;
  final Value<double?> area;
  final Value<double?> perimeter;
  final Value<DateTime?> created;
  final Value<String?> pointsJson;
  const FieldsCompanion({
    this.id = const Value.absent(),
    this.name = const Value.absent(),
    this.area = const Value.absent(),
    this.perimeter = const Value.absent(),
    this.created = const Value.absent(),
    this.pointsJson = const Value.absent(),
  });
  FieldsCompanion.insert({
    this.id = const Value.absent(),
    this.name = const Value.absent(),
    this.area = const Value.absent(),
    this.perimeter = const Value.absent(),
    this.created = const Value.absent(),
    this.pointsJson = const Value.absent(),
  });
  static Insertable<Field> custom({
    Expression<int>? id,
    Expression<String>? name,
    Expression<double>? area,
    Expression<double>? perimeter,
    Expression<DateTime>? created,
    Expression<String>? pointsJson,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (name != null) 'name': name,
      if (area != null) 'area': area,
      if (perimeter != null) 'perimeter': perimeter,
      if (created != null) 'created': created,
      if (pointsJson != null) 'points_json': pointsJson,
    });
  }

  FieldsCompanion copyWith(
      {Value<int>? id,
      Value<String?>? name,
      Value<double?>? area,
      Value<double?>? perimeter,
      Value<DateTime?>? created,
      Value<String?>? pointsJson}) {
    return FieldsCompanion(
      id: id ?? this.id,
      name: name ?? this.name,
      area: area ?? this.area,
      perimeter: perimeter ?? this.perimeter,
      created: created ?? this.created,
      pointsJson: pointsJson ?? this.pointsJson,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<int>(id.value);
    }
    if (name.present) {
      map['name'] = Variable<String>(name.value);
    }
    if (area.present) {
      map['area'] = Variable<double>(area.value);
    }
    if (perimeter.present) {
      map['perimeter'] = Variable<double>(perimeter.value);
    }
    if (created.present) {
      map['created'] = Variable<DateTime>(created.value);
    }
    if (pointsJson.present) {
      map['points_json'] = Variable<String>(pointsJson.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('FieldsCompanion(')
          ..write('id: $id, ')
          ..write('name: $name, ')
          ..write('area: $area, ')
          ..write('perimeter: $perimeter, ')
          ..write('created: $created, ')
          ..write('pointsJson: $pointsJson')
          ..write(')'))
        .toString();
  }
}

class $SettingsTable extends Settings with TableInfo<$SettingsTable, Setting> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $SettingsTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<int> id = GeneratedColumn<int>(
      'id', aliasedName, false,
      hasAutoIncrement: true,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultConstraints:
          GeneratedColumn.constraintIsAlways('PRIMARY KEY AUTOINCREMENT'));
  static const VerificationMeta _equipmentNameMeta =
      const VerificationMeta('equipmentName');
  @override
  late final GeneratedColumn<String> equipmentName = GeneratedColumn<String>(
      'equipment_name', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _equipmentWidthMeta =
      const VerificationMeta('equipmentWidth');
  @override
  late final GeneratedColumn<double> equipmentWidth = GeneratedColumn<double>(
      'equipment_width', aliasedName, true,
      type: DriftSqlType.double, requiredDuringInsert: false);
  static const VerificationMeta _equipmentSpeedMeta =
      const VerificationMeta('equipmentSpeed');
  @override
  late final GeneratedColumn<double> equipmentSpeed = GeneratedColumn<double>(
      'equipment_speed', aliasedName, true,
      type: DriftSqlType.double, requiredDuringInsert: false);
  static const VerificationMeta _equipmentTypeMeta =
      const VerificationMeta('equipmentType');
  @override
  late final GeneratedColumn<String> equipmentType = GeneratedColumn<String>(
      'equipment_type', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  @override
  List<GeneratedColumn> get $columns =>
      [id, equipmentName, equipmentWidth, equipmentSpeed, equipmentType];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'settings';
  @override
  VerificationContext validateIntegrity(Insertable<Setting> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    }
    if (data.containsKey('equipment_name')) {
      context.handle(
          _equipmentNameMeta,
          equipmentName.isAcceptableOrUnknown(
              data['equipment_name']!, _equipmentNameMeta));
    }
    if (data.containsKey('equipment_width')) {
      context.handle(
          _equipmentWidthMeta,
          equipmentWidth.isAcceptableOrUnknown(
              data['equipment_width']!, _equipmentWidthMeta));
    }
    if (data.containsKey('equipment_speed')) {
      context.handle(
          _equipmentSpeedMeta,
          equipmentSpeed.isAcceptableOrUnknown(
              data['equipment_speed']!, _equipmentSpeedMeta));
    }
    if (data.containsKey('equipment_type')) {
      context.handle(
          _equipmentTypeMeta,
          equipmentType.isAcceptableOrUnknown(
              data['equipment_type']!, _equipmentTypeMeta));
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  Setting map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return Setting(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}id'])!,
      equipmentName: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}equipment_name']),
      equipmentWidth: attachedDatabase.typeMapping
          .read(DriftSqlType.double, data['${effectivePrefix}equipment_width']),
      equipmentSpeed: attachedDatabase.typeMapping
          .read(DriftSqlType.double, data['${effectivePrefix}equipment_speed']),
      equipmentType: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}equipment_type']),
    );
  }

  @override
  $SettingsTable createAlias(String alias) {
    return $SettingsTable(attachedDatabase, alias);
  }
}

class Setting extends DataClass implements Insertable<Setting> {
  final int id;
  final String? equipmentName;
  final double? equipmentWidth;
  final double? equipmentSpeed;
  final String? equipmentType;
  const Setting(
      {required this.id,
      this.equipmentName,
      this.equipmentWidth,
      this.equipmentSpeed,
      this.equipmentType});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<int>(id);
    if (!nullToAbsent || equipmentName != null) {
      map['equipment_name'] = Variable<String>(equipmentName);
    }
    if (!nullToAbsent || equipmentWidth != null) {
      map['equipment_width'] = Variable<double>(equipmentWidth);
    }
    if (!nullToAbsent || equipmentSpeed != null) {
      map['equipment_speed'] = Variable<double>(equipmentSpeed);
    }
    if (!nullToAbsent || equipmentType != null) {
      map['equipment_type'] = Variable<String>(equipmentType);
    }
    return map;
  }

  SettingsCompanion toCompanion(bool nullToAbsent) {
    return SettingsCompanion(
      id: Value(id),
      equipmentName: equipmentName == null && nullToAbsent
          ? const Value.absent()
          : Value(equipmentName),
      equipmentWidth: equipmentWidth == null && nullToAbsent
          ? const Value.absent()
          : Value(equipmentWidth),
      equipmentSpeed: equipmentSpeed == null && nullToAbsent
          ? const Value.absent()
          : Value(equipmentSpeed),
      equipmentType: equipmentType == null && nullToAbsent
          ? const Value.absent()
          : Value(equipmentType),
    );
  }

  factory Setting.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return Setting(
      id: serializer.fromJson<int>(json['id']),
      equipmentName: serializer.fromJson<String?>(json['equipmentName']),
      equipmentWidth: serializer.fromJson<double?>(json['equipmentWidth']),
      equipmentSpeed: serializer.fromJson<double?>(json['equipmentSpeed']),
      equipmentType: serializer.fromJson<String?>(json['equipmentType']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<int>(id),
      'equipmentName': serializer.toJson<String?>(equipmentName),
      'equipmentWidth': serializer.toJson<double?>(equipmentWidth),
      'equipmentSpeed': serializer.toJson<double?>(equipmentSpeed),
      'equipmentType': serializer.toJson<String?>(equipmentType),
    };
  }

  Setting copyWith(
          {int? id,
          Value<String?> equipmentName = const Value.absent(),
          Value<double?> equipmentWidth = const Value.absent(),
          Value<double?> equipmentSpeed = const Value.absent(),
          Value<String?> equipmentType = const Value.absent()}) =>
      Setting(
        id: id ?? this.id,
        equipmentName:
            equipmentName.present ? equipmentName.value : this.equipmentName,
        equipmentWidth:
            equipmentWidth.present ? equipmentWidth.value : this.equipmentWidth,
        equipmentSpeed:
            equipmentSpeed.present ? equipmentSpeed.value : this.equipmentSpeed,
        equipmentType:
            equipmentType.present ? equipmentType.value : this.equipmentType,
      );
  @override
  String toString() {
    return (StringBuffer('Setting(')
          ..write('id: $id, ')
          ..write('equipmentName: $equipmentName, ')
          ..write('equipmentWidth: $equipmentWidth, ')
          ..write('equipmentSpeed: $equipmentSpeed, ')
          ..write('equipmentType: $equipmentType')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(
      id, equipmentName, equipmentWidth, equipmentSpeed, equipmentType);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is Setting &&
          other.id == this.id &&
          other.equipmentName == this.equipmentName &&
          other.equipmentWidth == this.equipmentWidth &&
          other.equipmentSpeed == this.equipmentSpeed &&
          other.equipmentType == this.equipmentType);
}

class SettingsCompanion extends UpdateCompanion<Setting> {
  final Value<int> id;
  final Value<String?> equipmentName;
  final Value<double?> equipmentWidth;
  final Value<double?> equipmentSpeed;
  final Value<String?> equipmentType;
  const SettingsCompanion({
    this.id = const Value.absent(),
    this.equipmentName = const Value.absent(),
    this.equipmentWidth = const Value.absent(),
    this.equipmentSpeed = const Value.absent(),
    this.equipmentType = const Value.absent(),
  });
  SettingsCompanion.insert({
    this.id = const Value.absent(),
    this.equipmentName = const Value.absent(),
    this.equipmentWidth = const Value.absent(),
    this.equipmentSpeed = const Value.absent(),
    this.equipmentType = const Value.absent(),
  });
  static Insertable<Setting> custom({
    Expression<int>? id,
    Expression<String>? equipmentName,
    Expression<double>? equipmentWidth,
    Expression<double>? equipmentSpeed,
    Expression<String>? equipmentType,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (equipmentName != null) 'equipment_name': equipmentName,
      if (equipmentWidth != null) 'equipment_width': equipmentWidth,
      if (equipmentSpeed != null) 'equipment_speed': equipmentSpeed,
      if (equipmentType != null) 'equipment_type': equipmentType,
    });
  }

  SettingsCompanion copyWith(
      {Value<int>? id,
      Value<String?>? equipmentName,
      Value<double?>? equipmentWidth,
      Value<double?>? equipmentSpeed,
      Value<String?>? equipmentType}) {
    return SettingsCompanion(
      id: id ?? this.id,
      equipmentName: equipmentName ?? this.equipmentName,
      equipmentWidth: equipmentWidth ?? this.equipmentWidth,
      equipmentSpeed: equipmentSpeed ?? this.equipmentSpeed,
      equipmentType: equipmentType ?? this.equipmentType,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<int>(id.value);
    }
    if (equipmentName.present) {
      map['equipment_name'] = Variable<String>(equipmentName.value);
    }
    if (equipmentWidth.present) {
      map['equipment_width'] = Variable<double>(equipmentWidth.value);
    }
    if (equipmentSpeed.present) {
      map['equipment_speed'] = Variable<double>(equipmentSpeed.value);
    }
    if (equipmentType.present) {
      map['equipment_type'] = Variable<String>(equipmentType.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('SettingsCompanion(')
          ..write('id: $id, ')
          ..write('equipmentName: $equipmentName, ')
          ..write('equipmentWidth: $equipmentWidth, ')
          ..write('equipmentSpeed: $equipmentSpeed, ')
          ..write('equipmentType: $equipmentType')
          ..write(')'))
        .toString();
  }
}

abstract class _$AppDatabase extends GeneratedDatabase {
  _$AppDatabase(QueryExecutor e) : super(e);
  _$AppDatabaseManager get managers => _$AppDatabaseManager(this);
  late final $FieldsTable fields = $FieldsTable(this);
  late final $SettingsTable settings = $SettingsTable(this);
  @override
  Iterable<TableInfo<Table, Object?>> get allTables =>
      allSchemaEntities.whereType<TableInfo<Table, Object?>>();
  @override
  List<DatabaseSchemaEntity> get allSchemaEntities => [fields, settings];
}

typedef $$FieldsTableInsertCompanionBuilder = FieldsCompanion Function({
  Value<int> id,
  Value<String?> name,
  Value<double?> area,
  Value<double?> perimeter,
  Value<DateTime?> created,
  Value<String?> pointsJson,
});
typedef $$FieldsTableUpdateCompanionBuilder = FieldsCompanion Function({
  Value<int> id,
  Value<String?> name,
  Value<double?> area,
  Value<double?> perimeter,
  Value<DateTime?> created,
  Value<String?> pointsJson,
});

class $$FieldsTableTableManager extends RootTableManager<
    _$AppDatabase,
    $FieldsTable,
    Field,
    $$FieldsTableFilterComposer,
    $$FieldsTableOrderingComposer,
    $$FieldsTableProcessedTableManager,
    $$FieldsTableInsertCompanionBuilder,
    $$FieldsTableUpdateCompanionBuilder> {
  $$FieldsTableTableManager(_$AppDatabase db, $FieldsTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          filteringComposer:
              $$FieldsTableFilterComposer(ComposerState(db, table)),
          orderingComposer:
              $$FieldsTableOrderingComposer(ComposerState(db, table)),
          getChildManagerBuilder: (p) => $$FieldsTableProcessedTableManager(p),
          getUpdateCompanionBuilder: ({
            Value<int> id = const Value.absent(),
            Value<String?> name = const Value.absent(),
            Value<double?> area = const Value.absent(),
            Value<double?> perimeter = const Value.absent(),
            Value<DateTime?> created = const Value.absent(),
            Value<String?> pointsJson = const Value.absent(),
          }) =>
              FieldsCompanion(
            id: id,
            name: name,
            area: area,
            perimeter: perimeter,
            created: created,
            pointsJson: pointsJson,
          ),
          getInsertCompanionBuilder: ({
            Value<int> id = const Value.absent(),
            Value<String?> name = const Value.absent(),
            Value<double?> area = const Value.absent(),
            Value<double?> perimeter = const Value.absent(),
            Value<DateTime?> created = const Value.absent(),
            Value<String?> pointsJson = const Value.absent(),
          }) =>
              FieldsCompanion.insert(
            id: id,
            name: name,
            area: area,
            perimeter: perimeter,
            created: created,
            pointsJson: pointsJson,
          ),
        ));
}

class $$FieldsTableProcessedTableManager extends ProcessedTableManager<
    _$AppDatabase,
    $FieldsTable,
    Field,
    $$FieldsTableFilterComposer,
    $$FieldsTableOrderingComposer,
    $$FieldsTableProcessedTableManager,
    $$FieldsTableInsertCompanionBuilder,
    $$FieldsTableUpdateCompanionBuilder> {
  $$FieldsTableProcessedTableManager(super.$state);
}

class $$FieldsTableFilterComposer
    extends FilterComposer<_$AppDatabase, $FieldsTable> {
  $$FieldsTableFilterComposer(super.$state);
  ColumnFilters<int> get id => $state.composableBuilder(
      column: $state.table.id,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<String> get name => $state.composableBuilder(
      column: $state.table.name,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<double> get area => $state.composableBuilder(
      column: $state.table.area,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<double> get perimeter => $state.composableBuilder(
      column: $state.table.perimeter,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<DateTime> get created => $state.composableBuilder(
      column: $state.table.created,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<String> get pointsJson => $state.composableBuilder(
      column: $state.table.pointsJson,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));
}

class $$FieldsTableOrderingComposer
    extends OrderingComposer<_$AppDatabase, $FieldsTable> {
  $$FieldsTableOrderingComposer(super.$state);
  ColumnOrderings<int> get id => $state.composableBuilder(
      column: $state.table.id,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<String> get name => $state.composableBuilder(
      column: $state.table.name,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<double> get area => $state.composableBuilder(
      column: $state.table.area,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<double> get perimeter => $state.composableBuilder(
      column: $state.table.perimeter,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<DateTime> get created => $state.composableBuilder(
      column: $state.table.created,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<String> get pointsJson => $state.composableBuilder(
      column: $state.table.pointsJson,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));
}

typedef $$SettingsTableInsertCompanionBuilder = SettingsCompanion Function({
  Value<int> id,
  Value<String?> equipmentName,
  Value<double?> equipmentWidth,
  Value<double?> equipmentSpeed,
  Value<String?> equipmentType,
});
typedef $$SettingsTableUpdateCompanionBuilder = SettingsCompanion Function({
  Value<int> id,
  Value<String?> equipmentName,
  Value<double?> equipmentWidth,
  Value<double?> equipmentSpeed,
  Value<String?> equipmentType,
});

class $$SettingsTableTableManager extends RootTableManager<
    _$AppDatabase,
    $SettingsTable,
    Setting,
    $$SettingsTableFilterComposer,
    $$SettingsTableOrderingComposer,
    $$SettingsTableProcessedTableManager,
    $$SettingsTableInsertCompanionBuilder,
    $$SettingsTableUpdateCompanionBuilder> {
  $$SettingsTableTableManager(_$AppDatabase db, $SettingsTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          filteringComposer:
              $$SettingsTableFilterComposer(ComposerState(db, table)),
          orderingComposer:
              $$SettingsTableOrderingComposer(ComposerState(db, table)),
          getChildManagerBuilder: (p) =>
              $$SettingsTableProcessedTableManager(p),
          getUpdateCompanionBuilder: ({
            Value<int> id = const Value.absent(),
            Value<String?> equipmentName = const Value.absent(),
            Value<double?> equipmentWidth = const Value.absent(),
            Value<double?> equipmentSpeed = const Value.absent(),
            Value<String?> equipmentType = const Value.absent(),
          }) =>
              SettingsCompanion(
            id: id,
            equipmentName: equipmentName,
            equipmentWidth: equipmentWidth,
            equipmentSpeed: equipmentSpeed,
            equipmentType: equipmentType,
          ),
          getInsertCompanionBuilder: ({
            Value<int> id = const Value.absent(),
            Value<String?> equipmentName = const Value.absent(),
            Value<double?> equipmentWidth = const Value.absent(),
            Value<double?> equipmentSpeed = const Value.absent(),
            Value<String?> equipmentType = const Value.absent(),
          }) =>
              SettingsCompanion.insert(
            id: id,
            equipmentName: equipmentName,
            equipmentWidth: equipmentWidth,
            equipmentSpeed: equipmentSpeed,
            equipmentType: equipmentType,
          ),
        ));
}

class $$SettingsTableProcessedTableManager extends ProcessedTableManager<
    _$AppDatabase,
    $SettingsTable,
    Setting,
    $$SettingsTableFilterComposer,
    $$SettingsTableOrderingComposer,
    $$SettingsTableProcessedTableManager,
    $$SettingsTableInsertCompanionBuilder,
    $$SettingsTableUpdateCompanionBuilder> {
  $$SettingsTableProcessedTableManager(super.$state);
}

class $$SettingsTableFilterComposer
    extends FilterComposer<_$AppDatabase, $SettingsTable> {
  $$SettingsTableFilterComposer(super.$state);
  ColumnFilters<int> get id => $state.composableBuilder(
      column: $state.table.id,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<String> get equipmentName => $state.composableBuilder(
      column: $state.table.equipmentName,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<double> get equipmentWidth => $state.composableBuilder(
      column: $state.table.equipmentWidth,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<double> get equipmentSpeed => $state.composableBuilder(
      column: $state.table.equipmentSpeed,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<String> get equipmentType => $state.composableBuilder(
      column: $state.table.equipmentType,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));
}

class $$SettingsTableOrderingComposer
    extends OrderingComposer<_$AppDatabase, $SettingsTable> {
  $$SettingsTableOrderingComposer(super.$state);
  ColumnOrderings<int> get id => $state.composableBuilder(
      column: $state.table.id,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<String> get equipmentName => $state.composableBuilder(
      column: $state.table.equipmentName,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<double> get equipmentWidth => $state.composableBuilder(
      column: $state.table.equipmentWidth,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<double> get equipmentSpeed => $state.composableBuilder(
      column: $state.table.equipmentSpeed,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<String> get equipmentType => $state.composableBuilder(
      column: $state.table.equipmentType,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));
}

class _$AppDatabaseManager {
  final _$AppDatabase _db;
  _$AppDatabaseManager(this._db);
  $$FieldsTableTableManager get fields =>
      $$FieldsTableTableManager(_db, _db.fields);
  $$SettingsTableTableManager get settings =>
      $$SettingsTableTableManager(_db, _db.settings);
}
