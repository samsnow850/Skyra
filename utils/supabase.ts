import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, processLock } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import 'react-native-url-polyfill/auto';

const expoConfig = Constants?.expoConfig ?? {};
const extra = (expoConfig as any)?.extra ?? {};
const supabaseUrl = extra.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseKey = extra.EXPO_PUBLIC_SUPABASE_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    lock: processLock,
  },
}) 