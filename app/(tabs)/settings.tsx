import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
  Linking,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useUnit } from '../../context/UnitContext';

const themes = [
  { label: 'System', value: 'system', icon: 'phone-portrait-outline' },
  { label: 'Light', value: 'light', icon: 'sunny-outline' },
  { label: 'Dark', value: 'dark', icon: 'moon-outline' },
];

export default function SettingsScreen() {
  const { unit, setUnit } = useUnit();
  const [changelogVisible, setChangelogVisible] = useState(false);
  const [featuresVisible, setFeaturesVisible] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={["#232526", "#414345"]} style={styles.gradient}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Settings</Text>

          {/* Temperature Unit */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="thermometer-outline" size={22} color="#FFD580" style={styles.cardIcon} />
              <Text style={styles.cardTitle}>Temperature Unit</Text>
            </View>
            <View style={styles.segmentedRow}>
              <TouchableOpacity
                style={[styles.segment, unit === 'C' && styles.segmentActive]}
                onPress={() => setUnit('C')}
              >
                <Text style={[styles.segmentText, unit === 'C' && styles.segmentTextActive]}>°C</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.segment, unit === 'F' && styles.segmentActive]}
                onPress={() => setUnit('F')}
              >
                <Text style={[styles.segmentText, unit === 'F' && styles.segmentTextActive]}>°F</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* About + Changelog Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="information-circle-outline" size={22} color="#7FDBFF" style={styles.cardIcon} />
              <Text style={styles.cardTitle}>About Skyra</Text>
            </View>
            <Text style={styles.aboutVersion}>v1.0.0</Text>
            <Text style={styles.aboutTagline}>“Weather, reimagined.”</Text>
            <Text style={styles.aboutDesc}>
              Skyra is a modern, calming weather app designed for clarity and beauty. Powered by OpenWeather. Built with ❤️ using React Native & Expo.
            </Text>
            <View style={styles.aboutBtnRow}>
              <TouchableOpacity style={styles.aboutBtn} onPress={() => setChangelogVisible(true)}>
                <Ionicons name="list-outline" size={18} color="#FFD580" style={{ marginRight: 6 }} />
                <Text style={styles.aboutBtnText}>Changelog</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.aboutBtn} onPress={() => Linking.openURL('https://forms.gle/VFvJ88jjtDx71Pvr7')}>
                <Ionicons name="chatbubble-ellipses-outline" size={18} color="#7FDBFF" style={{ marginRight: 6 }} />
                <Text style={styles.aboutBtnText}>Send Feedback</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Changelog Modal */}
          <Modal
            visible={changelogVisible}
            animationType="slide"
            transparent
            onRequestClose={() => setChangelogVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Changelog</Text>
                <Text style={styles.changelogVersion}>v1.0.0 — 7/22/25</Text>
                <View style={styles.changelogList}>
                  <Text style={styles.changelogItem}>• Initial release of Skyra</Text>
                  <Text style={styles.changelogItem}>• Modern, calming UI with animated backgrounds</Text>
                  <Text style={styles.changelogItem}>• Current, hourly, and 5/10-day forecasts</Text>
                  <Text style={styles.changelogItem}>• Search for any city’s weather</Text>
                  <Text style={styles.changelogItem}>• Global settings: units, theme, location</Text>
                  <Text style={styles.changelogItem}>• About & changelog sections</Text>
                </View>
                <Pressable style={styles.closeModalBtn} onPress={() => setChangelogVisible(false)}>
                  <Text style={styles.closeModalBtnText}>Close</Text>
                </Pressable>
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
});
