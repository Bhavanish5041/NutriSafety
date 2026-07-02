import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Switch } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { getProfile, saveProfile } from '../../lib/profile';
import type { HealthCondition, HealthProfile } from '../../lib/types';

const CONDITIONS: { id: HealthCondition; label: string; desc: string; icon: any }[] = [
  { id: 'diabetes', label: 'Diabetes', desc: 'Strict penalties for high sugar content', icon: 'tint' },
  { id: 'hypertension', label: 'Hypertension', desc: 'Strict penalties for high sodium & salt', icon: 'heartbeat' },
  { id: 'kidney_disease', label: 'Kidney Disease', desc: 'Monitors sodium loads', icon: 'filter' },
  { id: 'lactose_intolerance', label: 'Lactose Intolerance', desc: 'Flags milk and dairy derivatives', icon: 'coffee' },
  { id: 'gluten_intolerance', label: 'Gluten Intolerance', desc: 'Flags wheat, barley, and rye', icon: 'leaf' },
  { id: 'vegan', label: 'Vegan Diet', desc: 'Flags any animal-derived ingredients', icon: 'leaf' },
  { id: 'high_protein', label: 'High Protein Goal', desc: 'Boosts high-protein foods, penalizes poor macros', icon: 'bolt' },
];

export default function ProfileScreen() {
  const [profile, setProfile] = useState<HealthProfile>({ conditions: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const p = await getProfile();
    setProfile(p);
    setLoading(false);
  }

  async function toggleCondition(id: HealthCondition) {
    const isSelected = profile.conditions.includes(id);
    const newConditions = isSelected
      ? profile.conditions.filter((c) => c !== id)
      : [...profile.conditions, id];
    
    const newProfile = { ...profile, conditions: newConditions };
    setProfile(newProfile);
    await saveProfile(newProfile); // Auto-saves immediately
  }

  if (loading) return <View style={styles.container} />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <FontAwesome name="user" size={32} color="#10b981" />
        </View>
        <Text style={styles.title}>Health Profile</Text>
        <Text style={styles.subtitle}>
          Customize your profile. NutriSafety will automatically adjust product health scores and warnings based on your specific body and dietary needs.
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Dietary Conditions & Goals</Text>
      
      <View style={styles.card}>
        {CONDITIONS.map((cond, index) => {
          const isEnabled = profile.conditions.includes(cond.id);
          return (
            <TouchableOpacity 
              key={cond.id} 
              style={[styles.row, index < CONDITIONS.length - 1 && styles.borderBottom]}
              activeOpacity={0.7}
              onPress={() => toggleCondition(cond.id)}
            >
              <View style={[styles.iconBox, isEnabled && styles.iconBoxActive]}>
                <FontAwesome name={cond.icon} size={16} color={isEnabled ? "#fff" : "#9ca3af"} />
              </View>
              <View style={styles.rowText}>
                <Text style={styles.rowLabel}>{cond.label}</Text>
                <Text style={styles.rowDesc}>{cond.desc}</Text>
              </View>
              <Switch
                value={isEnabled}
                onValueChange={() => toggleCondition(cond.id)}
                trackColor={{ false: '#e5e7eb', true: '#34d399' }}
                thumbColor={isEnabled ? '#fff' : '#fff'}
              />
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.footerInfo}>
        Changes are saved automatically and applied instantly to all future scans. Rescan a past product to see its updated personalized score.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0fdf4' },
  content: { padding: 20 },
  header: { alignItems: 'center', marginBottom: 32, marginTop: 10 },
  avatar: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: '#d1fae5',
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  title: { fontSize: 24, fontWeight: '800', color: '#064e3b', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#065f46', textAlign: 'center', lineHeight: 22, paddingHorizontal: 10 },
  
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#064e3b', marginBottom: 12, marginLeft: 4 },
  card: {
    backgroundColor: '#fff', borderRadius: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2,
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12,
  },
  borderBottom: {
    borderBottomWidth: 1, borderBottomColor: '#f3f4f6',
  },
  iconBox: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: '#f3f4f6',
    justifyContent: 'center', alignItems: 'center',
  },
  iconBoxActive: {
    backgroundColor: '#10b981',
  },
  rowText: { flex: 1 },
  rowLabel: { fontSize: 15, fontWeight: '600', color: '#1f2937', marginBottom: 2 },
  rowDesc: { fontSize: 12, color: '#6b7280', lineHeight: 16 },
  
  footerInfo: { fontSize: 13, color: '#9ca3af', textAlign: 'center', lineHeight: 18, paddingHorizontal: 20, marginBottom: 40 },
});
