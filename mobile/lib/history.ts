import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Product } from './types';

const HISTORY_KEY = 'nutrisafe_scan_history';
const MAX_HISTORY = 50;

export type ScanHistoryItem = {
  barcode: string;
  name: string;
  brand?: string;
  image?: string;
  healthScore: number;
  riskLevel: string;
  scannedAt: string;
};

export async function addToHistory(product: Product, healthScore: number, riskLevel: string) {
  const history = await getHistory();
  const item: ScanHistoryItem = {
    barcode: product.barcode ?? '',
    name: product.name,
    brand: product.brand,
    image: product.image,
    healthScore,
    riskLevel,
    scannedAt: new Date().toISOString(),
  };

  // Remove duplicate if exists
  const filtered = history.filter((h) => h.barcode !== item.barcode);
  const updated = [item, ...filtered].slice(0, MAX_HISTORY);

  await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
}

export async function getHistory(): Promise<ScanHistoryItem[]> {
  try {
    const data = await AsyncStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function clearHistory() {
  await AsyncStorage.removeItem(HISTORY_KEY);
}
