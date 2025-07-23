import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Keyboard,
    Platform,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useUnit } from '../../context/UnitContext';

const OPEN_WEATHER_API_KEY = '4862d5e067388e783d46e5265ed1c203';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { unit } = useUnit();

  const displayTemp = (tempC: number) => unit === 'C' ? Math.round(tempC) : Math.round(tempC * 9/5 + 32);
  const displayTempWithUnit = (tempC: number) => unit === 'C' ? `${Math.round(tempC)}°C` : `${Math.round(tempC * 9/5 + 32)}°F`;

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setErrorMsg('');
    setWeather(null);
    Keyboard.dismiss();
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(query)}&units=metric&appid=${OPEN_WEATHER_API_KEY}`
      );
      const data = await response.json();
      if (response.ok) {
        setWeather(data);
      } else {
        setErrorMsg(data.message || 'City not found');
      }
    } catch {
      setErrorMsg('Network error. Please try again.');
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={["#232526", "#414345"]} style={styles.gradient}>
        <Text style={styles.title}>Search City Weather</Text>
        <View style={styles.searchRow}>
          <TextInput
            style={styles.input}
            placeholder="Enter city name..."
            placeholderTextColor="#aaa"
            value={query}
            onChangeText={setQuery}
            autoCapitalize="words"
            returnKeyType="search"
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
            <Ionicons name="search" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        {loading && <ActivityIndicator size="large" color="#fff" style={{ marginTop: 32 }} />}
        {errorMsg ? <Text style={styles.errorMsg}>{errorMsg}</Text> : null}
        {weather && (
          <View style={styles.weatherCard}>
            <Text style={styles.cityName}>{weather.name}</Text>
            <Ionicons name="location" size={18} color="#fff" style={{ marginBottom: 8 }} />
            <Ionicons
              name={weather.weather[0].main === 'Clear' ? 'sunny' : weather.weather[0].main === 'Clouds' ? 'cloudy' : 'rainy'}
              size={60}
              color="#fff"
              style={{ marginBottom: 8 }}
            />
            <Text style={styles.temp}>{displayTempWithUnit(weather.main.temp)}</Text>
            <Text style={styles.desc}>{weather.weather[0].description}</Text>
            <Text style={styles.feelsLike}>Feels like {displayTempWithUnit(weather.main.feels_like)}</Text>
            <Text style={styles.highLow}>
              H:{displayTempWithUnit(weather.main.temp_max)}  L:{displayTempWithUnit(weather.main.temp_min)}
            </Text>
          </View>
        )}
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
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? 48 : 0,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 48,
    marginBottom: 32,
    letterSpacing: 1,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
    color: '#fff',
    fontSize: 18,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
  },
  searchBtn: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 10,
    padding: 10,
  },
  errorMsg: {
    color: '#ffb3b3',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  weatherCard: {
    backgroundColor: 'rgba(20, 20, 30, 0.85)',
    borderRadius: 18,
    padding: 28,
    marginTop: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  cityName: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 2,
  },
  temp: {
    color: '#fff',
    fontSize: 54,
    fontWeight: '200',
    marginBottom: 2,
  },
  desc: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 2,
    textTransform: 'capitalize',
  },
  feelsLike: {
    color: '#fff',
    fontSize: 16,
    opacity: 0.8,
    marginBottom: 2,
  },
  highLow: {
    color: '#fff',
    fontSize: 16,
    opacity: 0.8,
  },
}); 