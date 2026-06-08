import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';

const features = [
  {
    icon: 'camera' as const,
    title: 'Barcode Scanner',
    text: 'Blazing fast native camera scanning. Point and go.',
    color: '#10b981',
  },
  {
    icon: 'heartbeat' as const,
    title: 'Health Risk Analysis',
    text: 'Personalized scoring for diabetes, allergies, vegan diets & more.',
    color: '#f59e0b',
  },
  {
    icon: 'shield' as const,
    title: 'Global Compliance',
    text: 'Check FDA, FSSAI, and EFSA restricted ingredient databases.',
    color: '#3b82f6',
  },
  {
    icon: 'list-alt' as const,
    title: 'Ingredients Decoded',
    text: 'Understand what every ingredient does and its side effects.',
    color: '#8b5cf6',
  },
];

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      {/* Hero */}
      <View style={styles.hero}>
        <View style={styles.logoBadge}>
          <FontAwesome name="shield" size={28} color="#fff" />
        </View>
        <Text style={styles.heroTitle}>NutriSafe</Text>
        <Text style={styles.heroSubtitle}>
          Scan any food product to instantly analyze nutrition, check safety compliance, and get personalized health insights.
        </Text>
      </View>

      {/* CTAs */}
      <View style={styles.ctaContainer}>
        <TouchableOpacity
          style={styles.scanCta}
          activeOpacity={0.85}
          onPress={() => router.push('/(tabs)/scanner')}
        >
          <FontAwesome name="camera" size={20} color="#fff" />
          <Text style={styles.scanCtaText}>Scan Barcode</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.searchCta}
          activeOpacity={0.85}
          onPress={() => router.push('/(tabs)/search')}
        >
          <FontAwesome name="search" size={18} color="#10b981" />
          <Text style={styles.searchCtaText}>Manual Search</Text>
        </TouchableOpacity>
      </View>

      {/* Feature Cards */}
      <Text style={styles.featuresHeading}>What you get</Text>
      <View style={styles.featuresGrid}>
        {features.map((f) => (
          <View key={f.title} style={styles.featureCard}>
            <View style={[styles.featureIcon, { backgroundColor: f.color + '18' }]}>
              <FontAwesome name={f.icon} size={20} color={f.color} />
            </View>
            <Text style={styles.featureTitle}>{f.title}</Text>
            <Text style={styles.featureText}>{f.text}</Text>
          </View>
        ))}
      </View>

      {/* Demo Preview */}
      <View style={styles.demoCard}>
        <View style={styles.demoHeader}>
          <Text style={styles.demoLabel}>Live demo preview</Text>
          <Text style={styles.demoProduct}>Hazelnut Protein Bar</Text>
        </View>
        <View style={styles.demoItems}>
          {['Health score 78/100', 'EFSA: monitor sweeteners', 'Contains milk allergen', 'Claim risk: low sugar with polyols'].map((item) => (
            <View key={item} style={styles.demoItem}>
              <Text style={styles.demoItemText}>{item}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Footer */}
      <Text style={styles.footer}>
        NutriSafe · Responsible food intelligence
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#f0fdf4' },
  content: { padding: 20, paddingTop: 16 },

  hero: { alignItems: 'center', marginBottom: 24 },
  logoBadge: {
    width: 60, height: 60, borderRadius: 18, backgroundColor: '#10b981',
    justifyContent: 'center', alignItems: 'center', marginBottom: 14,
    shadowColor: '#10b981', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8,
  },
  heroTitle: { fontSize: 32, fontWeight: '900', color: '#064e3b', letterSpacing: -1 },
  heroSubtitle: {
    fontSize: 15, color: '#065f46', textAlign: 'center', lineHeight: 22,
    marginTop: 8, maxWidth: 320,
  },

  ctaContainer: { flexDirection: 'row', gap: 12, marginBottom: 28 },
  scanCta: {
    flex: 1, backgroundColor: '#10b981', flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 16, borderRadius: 16,
    shadowColor: '#10b981', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5,
  },
  scanCtaText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  searchCta: {
    flex: 1, backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 16, borderRadius: 16, borderWidth: 2, borderColor: '#10b981',
  },
  searchCtaText: { color: '#10b981', fontSize: 16, fontWeight: '800' },

  featuresHeading: { fontSize: 18, fontWeight: '800', color: '#064e3b', marginBottom: 12 },
  featuresGrid: { gap: 10, marginBottom: 24 },
  featureCard: {
    backgroundColor: '#fff', borderRadius: 14, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3, elevation: 2,
  },
  featureIcon: {
    width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 10,
  },
  featureTitle: { fontSize: 15, fontWeight: '700', color: '#1f2937', marginBottom: 4 },
  featureText: { fontSize: 13, color: '#6b7280', lineHeight: 18 },

  demoCard: {
    backgroundColor: '#064e3b', borderRadius: 18, padding: 20, marginBottom: 24,
  },
  demoHeader: { marginBottom: 14 },
  demoLabel: { fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: '600' },
  demoProduct: { fontSize: 22, fontWeight: '900', color: '#fff', marginTop: 2 },
  demoItems: { gap: 8 },
  demoItem: {
    backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 10, padding: 12,
  },
  demoItemText: { color: '#ecfdf5', fontSize: 14, fontWeight: '600' },

  footer: { textAlign: 'center', fontSize: 12, color: '#9ca3af', marginBottom: 20 },
});
