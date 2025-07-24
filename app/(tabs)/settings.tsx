import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as Updates from 'expo-updates';
import React, { useState } from 'react';
import {
  Linking,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useUnit } from '../../context/UnitContext';

const themes = [
  { label: 'System', value: 'system', icon: 'phone-portrait-outline' },
  { label: 'Light', value: 'light', icon: 'sunny-outline' },
  { label: 'Dark', value: 'dark', icon: 'moon-outline' },
];

const CHANGELOG = [
  {
    version: 'v1.2.0',
    date: '2025-07-23',
    entries: [
      { type: 'added', text: 'Added light and dark mode' },
      { type: 'added', text: 'Added theme-aware navigation bar and cards' },
      { type: 'added', text: 'Added city autocomplete suggestions in search' },
      { type: 'added', text: 'Added full city details modal from search' },
      { type: 'added', text: 'Added onboarding tutorial and replay option' },
      { type: 'improved', text: 'Improved UI and card visibility in all themes' },
      { type: 'improved', text: 'Improved favoriting and search experience' },
      { type: 'improved', text: 'Improved keyboard UX in search' },
      { type: 'fixed', text: 'Fixed hourly forecast accuracy and stability' },
      { type: 'fixed', text: 'Fixed theme switching and navigation bar bugs' },
      { type: 'fixed', text: 'Fixed card visibility in light mode' },
    ],
  },
  {
    version: 'v1.0.0',
    date: '2025-07-22',
    entries: [
      { type: 'added', text: 'Initial release of Skyra' },
      { type: 'added', text: 'Modern, calming UI with animated backgrounds' },
      { type: 'added', text: 'Current, hourly, and 5/10-day forecasts' },
      { type: 'added', text: 'Search for any city’s weather' },
      { type: 'improved', text: 'Global settings: units, theme, location' },
      { type: 'added', text: 'About & changelog sections' },
    ],
  },
  // Add more versions here as needed
];

export default function SettingsScreen() {
  const { unit, setUnit } = useUnit();
  const [windUnit, setWindUnit] = useState<'mph' | 'kph'>('mph');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [severeAlertsEnabled, setSevereAlertsEnabled] = useState(true);
  const { theme, themeName, setThemeName } = useTheme();
  const [changelogVisible, setChangelogVisible] = useState(false);
  const [featuresVisible, setFeaturesVisible] = useState(false);
  const router = useRouter();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundGradient[0] }]}>
      <StatusBar barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} />
      <LinearGradient colors={theme.backgroundGradient as any} style={styles.gradient}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={[styles.title, { color: theme.text }]}>Settings</Text>

          {/* Temperature Unit */}
          <View style={[styles.card, { backgroundColor: theme.card }]}>
            <View style={styles.cardHeader}>
              <Ionicons name="thermometer-outline" size={22} color={theme.accent} style={styles.cardIcon} />
              <Text style={[styles.cardTitle, { color: theme.text }]}>Temperature Unit</Text>
            </View>
            <View style={[styles.segmentedRow, { backgroundColor: theme.border }]}>
              <TouchableOpacity
                style={[styles.segment, unit === 'C' && styles.segmentActive]}
                onPress={() => setUnit('C')}
              >
                <Text style={[styles.segmentText, unit === 'C' && styles.segmentTextActive, { color: theme.text }]}>°C</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.segment, unit === 'F' && styles.segmentActive]}
                onPress={() => setUnit('F')}
              >
                <Text style={[styles.segmentText, unit === 'F' && styles.segmentTextActive, { color: theme.text }]}>°F</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Wind Speed Unit */}
          <View style={[styles.card, { backgroundColor: theme.card }]}>
            <View style={styles.cardHeader}>
              <Ionicons name="speedometer-outline" size={22} color={theme.accent} style={styles.cardIcon} />
              <Text style={[styles.cardTitle, { color: theme.text }]}>Wind Speed Unit</Text>
            </View>
            <View style={[styles.segmentedRow, { backgroundColor: theme.border }]}>
              <TouchableOpacity
                style={[styles.segment, windUnit === 'mph' && styles.segmentActive]}
                onPress={() => setWindUnit('mph')}
              >
                <Text style={[styles.segmentText, windUnit === 'mph' && styles.segmentTextActive, { color: theme.text }]}>mph</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.segment, windUnit === 'kph' && styles.segmentActive]}
                onPress={() => setWindUnit('kph')}
              >
                <Text style={[styles.segmentText, windUnit === 'kph' && styles.segmentTextActive, { color: theme.text }]}>kph</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Notifications */}
          <View style={[styles.card, { backgroundColor: theme.card }]}>
            <View style={styles.cardHeader}>
              <Ionicons name="notifications-outline" size={22} color={theme.accent} style={styles.cardIcon} />
              <Text style={[styles.cardTitle, { color: theme.text }]}>Notifications</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
              <Text style={{ color: theme.text, fontSize: 16 }}>General Notifications</Text>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                thumbColor={notificationsEnabled ? theme.accent : theme.border}
                trackColor={{ true: theme.accent, false: theme.border }}
              />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
              <Text style={{ color: theme.text, fontSize: 16 }}>Severe Weather Alerts</Text>
              <Switch
                value={severeAlertsEnabled}
                onValueChange={setSevereAlertsEnabled}
                thumbColor={severeAlertsEnabled ? theme.accent : theme.border}
                trackColor={{ true: theme.accent, false: theme.border }}
              />
            </View>
          </View>

          {/* Theme Selection */}
          <View style={[styles.card, { backgroundColor: theme.card }]}>
            <View style={styles.cardHeader}>
              <Ionicons name="color-palette-outline" size={22} color={theme.accent} style={styles.cardIcon} />
              <Text style={[styles.cardTitle, { color: theme.text }]}>Theme</Text>
            </View>
            <View style={[styles.segmentedRow, { backgroundColor: theme.border }]}>
              {themes.map(t => (
                <TouchableOpacity
                  key={t.value}
                  style={[styles.segment, themeName === t.value && styles.segmentActive]}
                  onPress={() => setThemeName(t.value as 'system' | 'light' | 'dark')}
                >
                  <Ionicons name={t.icon as any} size={18} color={themeName === t.value ? theme.accent : theme.text} style={{ marginBottom: 2 }} />
                  <Text style={[styles.segmentText, themeName === t.value && styles.segmentTextActive, { color: themeName === t.value ? theme.accent : theme.text }]}>{t.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* About + Changelog Card */}
          <View style={[styles.card, { backgroundColor: theme.card }]}>
            <View style={styles.cardHeader}>
              <Ionicons name="information-circle-outline" size={22} color={theme.accent} style={styles.cardIcon} />
              <Text style={[styles.cardTitle, { color: theme.text }]}>About Skyra</Text>
            </View>
            <Text style={[styles.aboutVersion, { color: theme.text }]}>v1.0.0</Text>
            <Text style={[styles.aboutTagline, { color: theme.text }]}>“Weather, reimagined.”</Text>
            <Text style={[styles.aboutDesc, { color: theme.text }]}>Skyra is a modern, calming weather app designed for clarity and beauty. Powered by OpenWeather. Built with ❤️ using React Native & Expo.</Text>
            <View style={styles.aboutBtnRow}>
              <TouchableOpacity style={styles.aboutBtn} onPress={() => setChangelogVisible(true)}>
                <Ionicons name="list-outline" size={18} color={theme.accent} style={{ marginRight: 6 }} />
                <Text style={[styles.aboutBtnText, { color: theme.text }]}>Changelog</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.aboutBtn} onPress={() => Linking.openURL('https://forms.gle/VFvJ88jjtDx71Pvr7')}>
                <Ionicons name="chatbubble-ellipses-outline" size={18} color={theme.accent} style={{ marginRight: 6 }} />
                <Text style={[styles.aboutBtnText, { color: theme.text }]}>Send Feedback</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Add Replay Onboarding Button at the end of the ScrollView */}
          <TouchableOpacity
            style={[styles.card, { alignItems: 'center', marginTop: 32, backgroundColor: theme.card }]}
            onPress={async () => {
              await AsyncStorage.removeItem('onboardingComplete');
              await Updates.reloadAsync();
            }}
          >
            <Ionicons name="refresh-circle" size={28} color={theme.accent} style={{ marginBottom: 8 }} />
            <Text style={{ color: theme.accent, fontWeight: '600', fontSize: 16 }}>Replay Onboarding Tutorial</Text>
          </TouchableOpacity>

          {/* Changelog Modal */}
          <Modal
            visible={changelogVisible}
            animationType="slide"
            transparent
            onRequestClose={() => setChangelogVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <TouchableOpacity
                  style={styles.closeIconBtn}
                  onPress={() => setChangelogVisible(false)}
                >
                  <Ionicons name="close" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Changelog</Text>
                <ScrollView style={{ maxHeight: 350, width: '100%' }} showsVerticalScrollIndicator={false}>
                  {CHANGELOG.map((log, idx) => (
                    <View key={log.version} style={[styles.changelogVersionBlock, idx > 0 && styles.changelogVersionDivider]}>
                      <Text style={styles.changelogVersionTitle}>{log.version}</Text>
                      <Text style={styles.changelogVersionDate}>{log.date}</Text>
                      {log.entries.map((entry, i) => (
                        <View key={i} style={styles.changelogEntryRow}>
                          <Ionicons
                            name={
                              entry.type === 'added' ? 'sparkles' :
                              entry.type === 'improved' ? 'trending-up' :
                              entry.type === 'fixed' ? 'bug' : 'information-circle-outline'
                            }
                            size={18}
                            color={
                              entry.type === 'added' ? '#FFD580' :
                              entry.type === 'improved' ? '#7FDBFF' :
                              entry.type === 'fixed' ? '#ffb3b3' : '#aaa'
                            }
                            style={{ marginRight: 8 }}
                          />
                          <Text style={styles.changelogEntryText}>{entry.text}</Text>
                        </View>
                      ))}
                    </View>
                  ))}
                </ScrollView>
              </View>
            </View>
          </Modal>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    paddingHorizontal: 0,
    paddingTop: Platform.OS === 'android' ? 48 : 0,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingBottom: 32,
  },
  title: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 48,
    marginBottom: 32,
    letterSpacing: 1,
  },
  card: {
    backgroundColor: 'rgba(20, 20, 30, 0.85)',
    borderRadius: 18,
    padding: 22,
    marginBottom: 22,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardIcon: {
    marginRight: 10,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  segmentedRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 6,
  },
  segment: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    flexDirection: 'column',
  },
  segmentActive: {
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  segmentText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '500',
    opacity: 0.7,
  },
  segmentTextActive: {
    opacity: 1,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    color: '#fff',
    fontSize: 18,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 8,
  },
  aboutVersion: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 2,
    opacity: 0.7,
  },
  aboutTagline: {
    color: '#fff',
    fontSize: 16,
    fontStyle: 'italic',
    marginBottom: 8,
    opacity: 0.85,
  },
  aboutDesc: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    opacity: 0.8,
    marginBottom: 2,
  },
  changelogVersion: {
    color: '#fff',
    fontSize: 13,
    marginBottom: 8,
    opacity: 0.7,
  },
  changelogList: {
    alignItems: 'flex-start',
    width: '100%',
  },
  changelogItem: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 2,
    opacity: 0.85,
  },
  aboutBtnRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 16,
  },
  aboutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  aboutBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'rgba(20, 20, 30, 0.98)',
    borderRadius: 18,
    padding: 28,
    width: '85%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  modalTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  closeModalBtn: {
    marginTop: 24,
    backgroundColor: 'rgba(255,255,255,0.13)',
    borderRadius: 8,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  closeModalBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  closeIconBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
  },
  changelogVersionBlock: {
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  changelogVersionDivider: {
    marginTop: 20,
  },
  changelogVersionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  changelogVersionDate: {
    color: '#aaa',
    fontSize: 13,
    marginBottom: 10,
  },
  changelogEntryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  changelogEntryText: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
    flexShrink: 1,
  },
});
