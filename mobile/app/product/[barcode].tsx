import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { fetchProductByBarcode, fetchAlternatives } from '../../lib/product';
import { localHealthRisk } from '../../lib/health';
import { checkCompliance } from '../../lib/compliance';
import { addToHistory } from '../../lib/history';
import { getProfile } from '../../lib/profile';
import type { Product, HealthRiskAnalysis, ComplianceResult } from '../../lib/types';

export default function ProductDetailScreen() {
  const { barcode } = useLocalSearchParams<{ barcode: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [risk, setRisk] = useState<HealthRiskAnalysis | null>(null);
  const [compliance, setCompliance] = useState<ComplianceResult[]>([]);
  const [alternatives, setAlternatives] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!barcode) return;
    loadProduct(barcode);
  }, [barcode]);

  async function loadProduct(code: string) {
    setLoading(true);
    setError('');
    try {
      const p = await fetchProductByBarcode(code);
      if (!p) {
        setError('Product not found in OpenFoodFacts database.');
        setLoading(false);
        return;
      }
      setProduct(p);

      const profile = await getProfile();
      const healthRisk = localHealthRisk(p, profile);
      setRisk(healthRisk);

      const comp = await checkCompliance(p);
      setCompliance(comp);

      await addToHistory(p, healthRisk.healthScore, healthRisk.riskLevel);

      if ((healthRisk.riskLevel === 'moderate' || healthRisk.riskLevel === 'avoid') && p.category) {
        const alts = await fetchAlternatives(p.category);
        setAlternatives(alts.filter(a => a.barcode !== p.barcode));
      }
    } catch (err) {
      setError('Failed to fetch product data. Check your connection.');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Stack.Screen options={{ title: 'Analyzing...' }} />
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>Analyzing product...</Text>
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={styles.errorContainer}>
        <Stack.Screen options={{ title: 'Not Found' }} />
        <View style={styles.errorIconCircle}>
          <FontAwesome name="search" size={32} color="#f59e0b" />
        </View>
        <Text style={styles.errorTitle}>Product Not Found</Text>
        <Text style={styles.errorBarcode}>Barcode: {barcode}</Text>
        <View style={styles.errorInfoCard}>
          <Text style={styles.errorInfoText}>
            This product isn't in the OpenFoodFacts database yet. This is common for many Indian and regional products as the database has limited coverage in some markets.
          </Text>
        </View>
        <TouchableOpacity style={styles.retryButton} onPress={() => barcode && loadProduct(barcode)}>
          <FontAwesome name="refresh" size={14} color="#fff" />
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: product.name }} />

      {/* Product Header */}
      <View style={styles.headerCard}>
        {product.image ? (
          <Image source={{ uri: product.image }} style={styles.productImage} resizeMode="contain" />
        ) : (
          <View style={styles.noImage}>
            <FontAwesome name="cube" size={48} color="#d1d5db" />
          </View>
        )}
        <View style={styles.headerInfo}>
          {product.brand && <Text style={styles.brandText}>{product.brand}</Text>}
          <Text style={styles.productName}>{product.name}</Text>
          {product.barcode && <Text style={styles.barcodeLabel}>{product.barcode}</Text>}
        </View>
      </View>

      {/* Health Score */}
      {risk && (
        <View style={styles.card}>
          <View style={styles.scoreRow}>
            <View style={[styles.scoreBadge, { backgroundColor: getScoreColor(risk.riskLevel) }]}>
              <Text style={styles.scoreNumber}>{risk.healthScore}</Text>
              <Text style={styles.scoreLabel}>/ 100</Text>
            </View>
            <View style={styles.scoreInfo}>
              <Text style={styles.riskLevelText}>
                {risk.riskLevel === 'safe' ? '✅ Safe' : risk.riskLevel === 'moderate' ? '⚠️ Moderate' : '🚫 Avoid'}
              </Text>
              <Text style={styles.summaryText}>{risk.summary}</Text>
            </View>
          </View>

          {/* Risk Badges */}
          {risk.badges.length > 0 && (
            <View style={styles.badgeRow}>
              {risk.badges.map((badge) => (
                <View key={badge} style={styles.badge}>
                  <Text style={styles.badgeText}>{badge}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Warnings */}
          {risk.warnings.length > 0 && (
            <View style={styles.warningsContainer}>
              {risk.warnings.map((w, i) => (
                <Text key={i} style={styles.warningText}>⚠️ {w}</Text>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Allergens */}
      {product.allergens.length > 0 && (
        <View style={styles.allergenCard}>
          <Text style={styles.sectionTitle}>⚠️ Allergens</Text>
          <View style={styles.badgeRow}>
            {product.allergens.map((a) => (
              <View key={a} style={styles.allergenBadge}>
                <Text style={styles.allergenBadgeText}>{a}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Nutrition Facts */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Nutrition Facts (per 100g)</Text>
        <NutritionRow label="Energy" value={product.nutrition.energyKcal} unit="kcal" />
        <NutritionRow label="Protein" value={product.nutrition.protein} unit="g" />
        <NutritionRow label="Carbohydrates" value={product.nutrition.carbohydrates} unit="g" />
        <NutritionRow label="Sugar" value={product.nutrition.sugar} unit="g" highlight={product.nutrition.sugar != null && product.nutrition.sugar > 12} />
        <NutritionRow label="Fat" value={product.nutrition.fat} unit="g" />
        <NutritionRow label="Saturated Fat" value={product.nutrition.saturatedFat} unit="g" />
        <NutritionRow label="Fiber" value={product.nutrition.fiber} unit="g" />
        <NutritionRow label="Sodium" value={product.nutrition.sodium} unit="mg" highlight={product.nutrition.sodium != null && product.nutrition.sodium > 450} />
      </View>

      {/* Ingredients */}
      {product.ingredients.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Ingredients</Text>
          <Text style={styles.ingredientsText}>
            {product.ingredientsText || product.ingredients.join(', ')}
          </Text>
        </View>
      )}

      {/* Compliance */}
      {compliance.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Regulatory Compliance</Text>
          {compliance.map((c) => (
            <View key={c.region} style={styles.complianceRow}>
              <View style={styles.complianceHeader}>
                <Text style={styles.complianceRegion}>{c.region}</Text>
                <View style={[styles.complianceStatus, { backgroundColor: getComplianceColor(c.status) }]}>
                  <Text style={styles.complianceStatusText}>{c.status}</Text>
                </View>
              </View>
              {c.notes.map((note, i) => (
                <Text key={i} style={styles.complianceNote}>• {note}</Text>
              ))}
            </View>
          ))}
        </View>
      )}

      {/* Scores */}
      <View style={styles.scoresRow}>
        {product.novaScore && (
          <View style={styles.miniScoreCard}>
            <Text style={styles.miniScoreValue}>{product.novaScore}</Text>
            <Text style={styles.miniScoreLabel}>NOVA</Text>
          </View>
        )}
        {product.ecoScore && (
          <View style={styles.miniScoreCard}>
            <Text style={styles.miniScoreValue}>{product.ecoScore}</Text>
            <Text style={styles.miniScoreLabel}>Eco-Score</Text>
          </View>
        )}
      </View>

      {/* Alternatives */}
      {alternatives.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Healthier Alternatives</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.alternativesScroll}>
            {alternatives.map((alt) => (
              <TouchableOpacity 
                key={alt.barcode} 
                style={styles.altCard}
                onPress={() => alt.barcode && router.push(`/product/${alt.barcode}`)}
              >
                {alt.image ? (
                  <Image source={{ uri: alt.image }} style={styles.altImage} resizeMode="contain" />
                ) : (
                  <View style={styles.altNoImage}>
                    <FontAwesome name="cube" size={24} color="#d1d5db" />
                  </View>
                )}
                <Text style={styles.altName} numberOfLines={2}>{alt.name}</Text>
                {alt.brand && <Text style={styles.altBrand} numberOfLines={1}>{alt.brand}</Text>}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function NutritionRow({ label, value, unit, highlight }: { label: string; value?: number; unit: string; highlight?: boolean }) {
  return (
    <View style={[styles.nutritionRow, highlight && styles.nutritionHighlight]}>
      <Text style={[styles.nutritionLabel, highlight && { color: '#dc2626' }]}>{label}</Text>
      <Text style={[styles.nutritionValue, highlight && { color: '#dc2626', fontWeight: '700' }]}>
        {value != null ? `${value} ${unit}` : '—'}
      </Text>
    </View>
  );
}

function getScoreColor(level: string): string {
  switch (level) {
    case 'safe': return '#10b981';
    case 'moderate': return '#f59e0b';
    case 'avoid': return '#ef4444';
    default: return '#6b7280';
  }
}

function getComplianceColor(status: string): string {
  switch (status) {
    case 'Allowed': return '#d1fae5';
    case 'Monitor': return '#fef3c7';
    case 'Restricted': return '#fee2e2';
    default: return '#f3f4f6';
  }
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#f0fdf4' },
  content: { padding: 16 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0fdf4', gap: 12 },
  loadingText: { fontSize: 16, color: '#065f46', fontWeight: '600' },

  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0fdf4', padding: 32 },
  errorIconCircle: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: '#fef3c7',
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  errorTitle: { fontSize: 22, fontWeight: '800', color: '#064e3b', marginBottom: 6 },
  errorBarcode: { fontSize: 14, color: '#9ca3af', fontFamily: 'monospace', marginBottom: 20 },
  errorInfoCard: {
    backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 20,
    borderWidth: 1, borderColor: '#e5e7eb',
  },
  errorInfoText: { fontSize: 14, color: '#6b7280', lineHeight: 21, textAlign: 'center' },
  retryButton: {
    backgroundColor: '#10b981', flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 28, paddingVertical: 14, borderRadius: 12,
  },
  retryButtonText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  headerCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16, flexDirection: 'row', gap: 16,
    marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 3,
  },
  productImage: { width: 100, height: 100, borderRadius: 12, backgroundColor: '#f0fdf4' },
  noImage: { width: 100, height: 100, borderRadius: 12, backgroundColor: '#f9fafb', justifyContent: 'center', alignItems: 'center' },
  headerInfo: { flex: 1, justifyContent: 'center' },
  brandText: { fontSize: 13, color: '#6b7280', fontWeight: '600', marginBottom: 2 },
  productName: { fontSize: 20, fontWeight: '800', color: '#064e3b' },
  barcodeLabel: { fontSize: 12, color: '#9ca3af', marginTop: 4, fontFamily: 'monospace' },

  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 3,
  },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#064e3b', marginBottom: 12 },

  scoreRow: { flexDirection: 'row', gap: 14, alignItems: 'center' },
  scoreBadge: { width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center' },
  scoreNumber: { fontSize: 24, fontWeight: '900', color: '#fff' },
  scoreLabel: { fontSize: 11, color: 'rgba(255,255,255,0.8)', fontWeight: '600', marginTop: -4 },
  scoreInfo: { flex: 1 },
  riskLevelText: { fontSize: 16, fontWeight: '800', color: '#1f2937', marginBottom: 4 },
  summaryText: { fontSize: 13, color: '#6b7280', lineHeight: 18 },

  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 },
  badge: { backgroundColor: '#ecfdf5', borderWidth: 1, borderColor: '#a7f3d0', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { fontSize: 12, fontWeight: '700', color: '#065f46' },

  warningsContainer: { marginTop: 12, backgroundColor: '#fffbeb', borderRadius: 10, padding: 12, gap: 6 },
  warningText: { fontSize: 13, color: '#92400e', lineHeight: 18 },

  allergenCard: {
    backgroundColor: '#fef3c7', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#fde68a',
  },
  allergenBadge: { backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: '#f59e0b' },
  allergenBadgeText: { fontSize: 12, fontWeight: '700', color: '#92400e' },

  nutritionRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  nutritionHighlight: { backgroundColor: '#fef2f2', marginHorizontal: -8, paddingHorizontal: 8, borderRadius: 6 },
  nutritionLabel: { fontSize: 14, color: '#374151', fontWeight: '500' },
  nutritionValue: { fontSize: 14, color: '#6b7280' },

  ingredientsText: { fontSize: 13, color: '#6b7280', lineHeight: 20 },

  complianceRow: { marginBottom: 14 },
  complianceHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  complianceRegion: { fontSize: 15, fontWeight: '800', color: '#1f2937' },
  complianceStatus: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3 },
  complianceStatusText: { fontSize: 12, fontWeight: '700', color: '#374151' },
  complianceNote: { fontSize: 13, color: '#6b7280', lineHeight: 18, marginLeft: 4 },

  scoresRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  miniScoreCard: {
    flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 16, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 3,
  },
  miniScoreValue: { fontSize: 28, fontWeight: '900', color: '#064e3b' },
  miniScoreLabel: { fontSize: 12, color: '#6b7280', fontWeight: '600', marginTop: 2 },

  alternativesScroll: { paddingVertical: 4 },
  altCard: { width: 120, marginRight: 12, backgroundColor: '#f9fafb', borderRadius: 12, padding: 8, borderWidth: 1, borderColor: '#f3f4f6' },
  altImage: { width: '100%', height: 80, borderRadius: 8, marginBottom: 8, backgroundColor: '#fff' },
  altNoImage: { width: '100%', height: 80, borderRadius: 8, marginBottom: 8, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  altName: { fontSize: 13, fontWeight: '700', color: '#1f2937', marginBottom: 2 },
  altBrand: { fontSize: 11, color: '#6b7280' },
});
