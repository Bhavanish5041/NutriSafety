import { useState } from 'react';
import { StyleSheet, Text, View, TextInput, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { searchProducts } from '../../lib/product';
import type { Product } from '../../lib/types';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const router = useRouter();

  async function handleSearch() {
    if (!query.trim()) return;
    setLoading(true);
    setHasSearched(true);
    
    const products = await searchProducts(query);
    setResults(products);
    setLoading(false);
  }

  function clearSearch() {
    setQuery('');
    setResults([]);
    setHasSearched(false);
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchHeader}>
        <View style={styles.searchBar}>
          <FontAwesome name="search" size={16} color="#9ca3af" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Type a product name or barcode..."
            placeholderTextColor="#9ca3af"
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            autoFocus
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <FontAwesome name="times-circle" size={16} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.actionButton} onPress={handleSearch} disabled={loading}>
          <Text style={styles.actionButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#10b981" />
          <Text style={styles.loadingText}>Searching OpenFoodFacts...</Text>
        </View>
      ) : hasSearched && results.length === 0 ? (
        <View style={styles.center}>
          <FontAwesome name="search-minus" size={48} color="#d1d5db" />
          <Text style={styles.emptyTitle}>No results found</Text>
          <Text style={styles.emptyText}>Try adjusting your search terms or scan the barcode directly.</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item, index) => item.barcode ? item.barcode + index : String(index)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.resultCard}
              onPress={() => item.barcode && router.push(`/product/${item.barcode}`)}
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
                <Text style={styles.cardName} numberOfLines={2}>{item.name}</Text>
                {item.brand && <Text style={styles.cardBrand} numberOfLines={1}>{item.brand}</Text>}
                {item.barcode && <Text style={styles.cardBarcode}>{item.barcode}</Text>}
              </View>
              <FontAwesome name="chevron-right" size={14} color="#d1d5db" />
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0fdf4' },
  searchHeader: {
    flexDirection: 'row', padding: 16, backgroundColor: '#fff', alignItems: 'center', gap: 12,
    borderBottomWidth: 1, borderBottomColor: '#e5e7eb',
  },
  searchBar: {
    flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#f3f4f6',
    borderRadius: 12, paddingHorizontal: 12, height: 44,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, height: 44, fontSize: 15, color: '#1f2937' },
  clearButton: { padding: 4 },
  actionButton: {
    backgroundColor: '#10b981', paddingHorizontal: 16, height: 44, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
  },
  actionButtonText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  loadingText: { marginTop: 12, fontSize: 15, color: '#065f46', fontWeight: '500' },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#064e3b', marginTop: 16 },
  emptyText: { fontSize: 14, color: '#6b7280', marginTop: 6, textAlign: 'center', lineHeight: 20 },

  list: { padding: 16, gap: 10 },
  resultCard: {
    backgroundColor: '#fff', borderRadius: 14, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3, elevation: 2,
  },
  thumbnail: { width: 56, height: 56, borderRadius: 10, backgroundColor: '#f9fafb' },
  noThumbnail: { width: 56, height: 56, borderRadius: 10, backgroundColor: '#f9fafb', justifyContent: 'center', alignItems: 'center' },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 15, fontWeight: '700', color: '#1f2937', marginBottom: 2 },
  cardBrand: { fontSize: 13, color: '#6b7280' },
  cardBarcode: { fontSize: 11, color: '#9ca3af', fontFamily: 'monospace', marginTop: 4 },
});
