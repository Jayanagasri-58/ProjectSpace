import fs from 'fs';
import path from 'path';

const DATA_PATH = path.join(process.cwd(), 'src', 'lib', 'data.json');

export function getLocalData(key: string) {
  try {
    if (!fs.existsSync(DATA_PATH)) return [];
    const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
    return data[key] || [];
  } catch (error) {
    console.error(`Error reading local data for ${key}:`, error);
    return [];
  }
}

export function saveLocalData(key: string, item: any) {
  try {
    let data: any = {};
    if (fs.existsSync(DATA_PATH)) {
      data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
    }
    if (!data[key]) data[key] = [];
    data[key].unshift(item);
    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
    return item;
  } catch (error) {
    console.error(`Error saving local data for ${key}:`, error);
    return item;
  }
}

export function updateLocalData(key: string, id: string, updates: any) {
  try {
    if (!fs.existsSync(DATA_PATH)) return null;
    const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
    if (!data[key]) return null;
    
    const idx = data[key].findIndex((item: any) => item.id === id);
    if (idx === -1) return null;
    
    data[key][idx] = { ...data[key][idx], ...updates };
    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
    return data[key][idx];
  } catch (error) {
    console.error(`Error updating local data for ${key}:`, error);
    return null;
  }
}
