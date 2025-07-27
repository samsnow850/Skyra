export default ({ config }) => {
  return {
    ...config,
    expo: {
      ...(config?.expo || {}),
      name: 'Skyra',
      slug: 'Skyra',
      owner: 'samsnow850',
      version: '1.3.0',
      scheme: 'skyra',
      android: {
        package: 'com.samsnow850.Skyra',
        adaptiveIcon: {
          foregroundImage: './assets/images/adaptive-icon.png',
          backgroundColor: '#ffffff',
        },
        edgeToEdgeEnabled: true,
      },
      ios: {
        supportsTablet: true,
      },
      web: {
        bundler: 'metro',
        output: 'static',
        favicon: './assets/images/favicon.png',
      },
      plugins: [
        'expo-router',
        'expo-web-browser',
        [
          'expo-splash-screen',
          {
            image: './assets/images/splash-icon.png',
            imageWidth: 200,
            resizeMode: 'contain',
            backgroundColor: '#ffffff',
          },
        ],
        [
          'expo-notifications',
          {
            icon: './assets/images/notification-icon.png',
            color: '#ffffff',
          },
        ],
      ],
      experiments: {
        typedRoutes: true,
      },
      extra: {
        ...(config?.expo?.extra || {}),
        EXPO_PUBLIC_SUPABASE_URL: 'https://xchzsdurqohyiizfiscd.supabase.co',
        EXPO_PUBLIC_SUPABASE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjaHpzZHVycW9oeWlpemZpc2NkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzOTg0MjIsImV4cCI6MjA2ODk3NDQyMn0.LtKMBnLffcRA15FC1Es0zFi93Cx5rYnpp9uFW729M0Q',
        eas: {
          projectId: "a87afcdc-cde5-4ad8-b87e-845d73d82401",
        },
      },
    },
  };
}; 