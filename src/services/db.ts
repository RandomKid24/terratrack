import Dexie, { type Table } from 'dexie';
import { GeoPoint, Equipment } from '../types';

export interface FieldRecord {
  id?: number;
  name: string;
  created: number;
  geoPoints: GeoPoint[];
  area: number;
  perimeter: number;
}

export class TerraTrackDB extends Dexie {
  fields!: Table<FieldRecord, number>;
  settings!: Table<{ key: string; value: any }, string>;

  constructor() {
    super('TerraTrackDB');
    (this as any).version(1).stores({
      fields: '++id, name, created',
      settings: 'key'
    });
  }
}

export const db = new TerraTrackDB();

export const saveField = async (name: string, points: GeoPoint[], area: number, perimeter: number) => {
  return await db.fields.add({
    name,
    created: Date.now(),
    geoPoints: points,
    area,
    perimeter
  });
};

export const getFields = async () => {
  return await db.fields.orderBy('created').reverse().toArray();
};

export const saveEquipmentSetting = async (equipment: Equipment) => {
  await db.settings.put({ key: 'lastEquipment', value: equipment });
};

export const getEquipmentSetting = async (): Promise<Equipment | undefined> => {
  const record = await db.settings.get('lastEquipment');
  return record?.value;
};