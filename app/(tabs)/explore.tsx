import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useUnit } from '../../context/UnitContext';

const OPEN_WEATHER_API_KEY = '4862d5e067388e783d46e5265ed1c203';

const weatherIcons: Record<string, string> = {
  Clear: 'sunny',
  Clouds: 'cloudy',
  Rain: 'rainy',
  Drizzle: 'rainy-outline',
  Thunderstorm: 'thunderstorm',
  Snow: 'snow',
  Mist: 'partly-sunny',
  Smoke: 'cloud',
  Haze: 'cloud-outline',
  Dust: 'cloud-outline',
  Fog: 'cloud-outline',
  Sand: 'cloud-outline',
  Ash: 'cloud-outline',
  Squall: 'cloud-outline',
  Tornado: 'cloud-outline',
};

function getDayName(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}

function getDateString(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function ForecastScreen() {
  const { unit } = useUnit();
  const [forecast, setForecast] = useState<any[]>([]);
  const [city, setCity] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const { theme } = useTheme();

  const fetchForecast = async () => {
    setRefreshing(true);
    setLoading(true);
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setErrorMsg('Permission to access location was denied');
      setRefreshing(false);
      setLoading(false);
      return;
    }
    let loc = await Location.getCurrentPositionAsync({});
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${loc.coords.latitude}&lon=${loc.coords.longitude}&units=metric&appid=${OPEN_WEATHER_API_KEY}`
      );
      const data = await response.json();
      setCity(data.city?.name || '');
      // Group by day, pick the forecast closest to 12:00 each day
      const daily: Record<string, any> = {};
      data.list.forEach((item: any) => {
        const date = item.dt_txt.split(' ')[0];
        const hour = item.dt_txt.split(' ')[1];
        if (!daily[date] || hour === '12:00:00') {
          daily[date] = item;
        }
      });
      // Only next 5 days
      setForecast(Object.values(daily).slice(0, 5));
      setErrorMsg('');
    } catch (e) {
      setErrorMsg('Failed to fetch forecast data');
    }
    setRefreshing(false);
    setLoading(false);
  };

  useEffect(() => {
    fetchForecast();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} />
        <LinearGradient colors={theme.backgroundGradient as any} style={styles.gradient}>
          <View style={styles.loadingContent}>
            <ActivityIndicator size="large" color={theme.text} />
            <Text style={[styles.loadingText, { color: theme.text }]}>Loading forecast...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (errorMsg) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <StatusBar barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} />
        <LinearGradient colors={theme.backgroundGradient as any} style={styles.gradient}>
          <View style={styles.errorContent}>
            <Ionicons name="warning-outline" size={64} color={theme.text} />
            <Text style={[styles.errorTitle, { color: theme.text }]}>Oops!</Text>
            <Text style={[styles.errorMessage, { color: theme.text }]}>{errorMsg}</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  const displayTemp = (tempC: number) => unit === 'C' ? Math.round(tempC) : Math.round(tempC * 9/5 + 32);
  const displayTempWithUnit = (tempC: number) => unit === 'C' ? `${Math.round(tempC)}°C` : `${Math.round(tempC * 9/5 + 32)}°F`;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} />
      <LinearGradient colors={theme.backgroundGradient as any} style={styles.gradient}>
        <View style={styles.topSpacer} />
        {city ? <Text style={[styles.cityName, { color: theme.text }]}>{city}</Text> : null}
        <Text style={[styles.title, { color: theme.text }]}>5-Day Forecast</Text>
        <FlatList
          data={forecast}
          keyExtractor={item => item.dt_txt}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={fetchForecast} tintColor={theme.text} colors={[theme.text]} />
          }
          renderItem={({ item }) => {
            const day = getDayName(item.dt_txt);
            const dateStr = getDateString(item.dt_txt);
            const icon = weatherIcons[item.weather[0].main] || 'cloud';
            return (
              <View style={[styles.card, { backgroundColor: theme.card }]}>
                <View style={styles.cardHeader}>
                  <Text style={[styles.day, { color: theme.text }]}>{day}</Text>
                  <Text style={[styles.date, { color: theme.text }]}>{dateStr}</Text>
                </View>
                <Ionicons name={icon as any} size={36} color={theme.text} style={styles.icon} />
                <View style={styles.temps}>
                  <Text style={[styles.tempMax, { color: theme.text }]}>{displayTempWithUnit(item.main.temp_max)}</Text>
                  <Text style={[styles.tempMin, { color: theme.text }]}>{displayTempWithUnit(item.main.temp_min)}</Text>
                </View>
                <Text style={[styles.desc, { color: theme.text }]}>{item.weather[0].description}</Text>
                <View style={styles.cardDetailsRow}>
                  <View style={styles.cardDetail}>
                    <Ionicons name="water" size={18} color={theme.accent} style={styles.detailIcon} />
                    <Text style={[styles.detailText, { color: theme.text }]}>{item.main.humidity}%</Text>
                  </View>
                  <View style={styles.cardDetail}>
                    <Ionicons name="cloud-outline" size={18} color={theme.accent} style={styles.detailIcon} />
                    <Text style={[styles.detailText, { color: theme.text }]}>{Math.round(item.wind.speed)} m/s</Text>
                  </View>
                </View>
              </View>
            );
          }}
        />
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
  },
  topSpacer: {
    height: 64,
  },
  loadingContainer: {
    flex: 1,
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
    marginTop: 20,
    fontWeight: '300',
  },
  errorContainer: {
    flex: 1,
  },
  errorContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 20,
  },
  errorMessage: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
    opacity: 0.9,
  },
  title: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
    letterSpacing: 1,
  },
  cityName: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: 'rgba(20, 20, 30, 0.85)',
    borderRadius: 18,
    padding: 24,
    marginBottom: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 4,
  },
  date: {
    color: '#fff',
    fontSize: 16,
    opacity: 0.7,
    fontWeight: '400',
  },
  day: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    opacity: 0.95,
  },
  icon: {
    marginBottom: 8,
  },
  temps: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tempMax: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginRight: 12,
  },
  tempMin: {
    color: '#fff',
    fontSize: 20,
    opacity: 0.7,
  },
  desc: {
    color: '#fff',
    fontSize: 16,
    opacity: 0.8,
    textTransform: 'capitalize',
    marginTop: 4,
  },
  cardDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 18,
    marginTop: 10,
  },
  cardDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  detailIcon: {
    marginRight: 2,
  },
  detailText: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.85,
    fontWeight: '500',
  },
});
