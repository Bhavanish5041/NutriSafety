import { useEffect, useState, useCallback } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { getHistory, clearHistory, type ScanHistoryItem } from '../../lib/history';

export default function HistoryScreen() {
  const [history, setHistory] = useState<ScanHistoryItem[]>([]);
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [])
  );

  async function loadHistory() {
    const items = await getHistory();
    setHistory(items);
  }

  async function handleClear() {
    await clearHistory();
    setHistory([]);
  }

  if (history.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <FontAwesome name="history" size={56} color="#d1d5db" />
        <Text style={styles.emptyTitle}>No scan history</Text>
        <Text style={styles.emptyText}>Scanned products will appear here.</Text>
        <TouchableOpacity style={styles.scanButton} onPress={() => router.push('/(tabs)/scanner')}>
          <FontAwesome name="camera" size={16} color="#fff" />
          <Text style={styles.scanButtonText}>Start Scanning</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{history.length} scanned product{history.length > 1 ? 's' : ''}</Text>
        <TouchableOpacity onPress={handleClear}>
          <Text style={styles.clearText}>Clear all</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={history}
        keyExtractor={(item) => item.barcode + item.scannedAt}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.historyCard}
            onPress={() => router.push(`/product/${item.barcode}`)}
            activeOpacity={0.7}
          >
            {item.image ? (
              <Image source={{ uri: item.image }} style={styles.thumbnail} resizeMode="contain" />
            ) : (
              <View style={styles.noThumbnail}>
                <FontAwesome name="cube" size={20} color="#d1d5db" />
              </View>
            )}
            <View style={styles.cardInfo}>
              <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
              {item.brand && <Text style={styles.cardBrand} numberOfLines={1}>{item.brand}</Text>}
              <Text style={styles.cardDate}>
                {new Date(item.scannedAt).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                })}
              </Text>
            </View>
            <View style={[styles.scoreCircle, { backgroundColor: getScoreColor(item.riskLevel) }]}>
              <Text style={styles.scoreText}>{item.healthScore}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

function getScoreColor(level: string) {
  switch (level) {
    case 'safe': return '#10b981';
    case 'moderate': return '#f59e0b';
    case 'avoid': return '#ef4444';
    default: return '#6b7280';
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0fdf4' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8,
  },
  headerTitle: { fontSize: 14, fontWeight: '600', color: '#6b7280' },
  clearText: { fontSize: 14, fontWeight: '600', color: '#ef4444' },
  list: { padding: 16, gap: 10 },
  historyCard: {
    backgroundColor: '#fff', borderRadius: 14, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3, elevation: 2,
  },
  thumbnail: { width: 48, height: 48, borderRadius: 10, backgroundColor: '#f9fafb' },
  noThumbnail: { width: 48, height: 48, borderRadius: 10, backgroundColor: '#f9fafb', justifyContent: 'center', alignItems: 'center' },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 15, fontWeight: '700', color: '#1f2937' },
  cardBrand: { fontSize: 12, color: '#6b7280', marginTop: 1 },
  cardDate: { fontSize: 11, color: '#9ca3af', marginTop: 3 },
  scoreCircle: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  scoreText: { fontSize: 14, fontWeight: '800', color: '#fff' },

  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0fdf4', padding: 32 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#064e3b', marginTop: 16 },
  emptyText: { fontSize: 14, color: '#6b7280', marginTop: 6, marginBottom: 24 },
  scanButton: {
    backgroundColor: '#10b981', flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12,
  },
  scanButtonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
