# Skyra Weather App for Android

Skyra is a modern, calming weather app designed for clarity and beauty. Powered by OpenWeather, built with ❤️ using React Native & Expo.

## Features
- 5-day weather forecast with beautiful gradients
- Location-based weather
- Search for any city’s weather
- Settings for temperature units (°C/°F)
- Modern, animated UI

## Getting Started (Android)

### 1. Install dependencies

```bash
npm install
```

### 2. Start the development server

```bash
npx expo start
```

### 3. Run on Android

- **Android Emulator:**
  - Make sure you have Android Studio and an emulator set up.
  - In the Expo Dev Tools (browser window that opens), click **"Run on Android device/emulator"**.
- **Physical Android Device:**
  - Install the [Expo Go](https://play.google.com/store/apps/details?id=host.exp.exponent) app from Google Play.
  - Scan the QR code in the Expo Dev Tools with Expo Go.

### 4. Project Structure
- `app/` — Main app screens and navigation
- `assets/` — Images, fonts, and splash/logo assets
- `components/` — Reusable UI components
- `context/` — Context providers (e.g., unit selection)
- `constants/` — App-wide constants (e.g., colors)
- `hooks/` — Custom React hooks

### 5. Customization
- **Logo:** The app uses `assets/images/skyra-logo.png` as the splash/logo.
- **API:** Uses OpenWeather API for weather data.

## Notes for Android
- Make sure to grant location permissions when prompted for accurate weather data.
- If you encounter issues with the emulator, try restarting it or use a physical device with Expo Go.

## Scripts
- `npm run reset-project` — Resets the project to a blank state (see `scripts/reset-project.js`).

## Learn More
- [Expo documentation](https://docs.expo.dev/)
- [React Native docs](https://reactnative.dev/)

---

Enjoy using Skyra on Android! 🌤️
