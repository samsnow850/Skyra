// Convert wind speed from m/s to the user's preferred unit
export const convertWindSpeed = (speedInMs: number, unit: 'mph' | 'kph'): number => {
  if (unit === 'mph') {
    // Convert m/s to mph: 1 m/s = 2.23694 mph
    return Math.round(speedInMs * 2.23694);
  } else {
    // Convert m/s to kph: 1 m/s = 3.6 kph
    return Math.round(speedInMs * 3.6);
  }
};

// Get the appropriate unit label
export const getWindSpeedUnit = (unit: 'mph' | 'kph'): string => {
  return unit;
};

// Format wind speed with unit
export const formatWindSpeed = (speedInMs: number, unit: 'mph' | 'kph'): string => {
  const convertedSpeed = convertWindSpeed(speedInMs, unit);
  return `${convertedSpeed} ${unit}`;
}; 