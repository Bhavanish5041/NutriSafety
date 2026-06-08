import AsyncStorage from '@react-native-async-storage/async-storage';
import type { HealthProfile } from './types';

const PROFILE_KEY = '@nutrisafe_profile';

export async function getProfile(): Promise<HealthProfile> {
  try {
    const data = await AsyncStorage.getItem(PROFILE_KEY);
    if (data) {
      return JSON.parse(data) as HealthProfile;
    }
  } catch (e) {
    console.error('Failed to load profile', e);
  }
  return { conditions: [] };
}

export async function saveProfile(profile: HealthProfile): Promise<void> {
  try {
    await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save profile', e);
  }
}
