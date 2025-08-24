import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { SplashScreen, Stack } from 'expo-router';
import { TamaguiProvider, createTamagui } from '@tamagui/core';
import { PortalProvider } from '@tamagui/portal';
import { config } from '@tamagui/config';
import { WorkoutStateProvider } from '../src/features/workout/providers/WorkoutStateProvider';

const tamaguiConfig = createTamagui(config);

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [interLoaded, interError] = useFonts({
    Inter: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
    InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf'),
  });

  useEffect(() => {
    if (interLoaded || interError) {
      // Hide the splash screen after the fonts have loaded (or an error was returned) and the UI is ready.
      SplashScreen.hideAsync();
    }
  }, [interLoaded, interError]);

  if (!interLoaded && !interError) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <TamaguiProvider
      config={tamaguiConfig}
      defaultTheme={colorScheme === 'dark' ? 'dark' : 'light'}
    >
      <PortalProvider>
        <ThemeProvider
          value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}
        >
          <WorkoutStateProvider>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="auth" options={{ headerShown: false }} />
              <Stack.Screen
                name="add-exercises"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="browse-templates"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="create-exercise"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="template/[id]"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="logging/[sessionId]"
                options={{
                  headerShown: false,
                  presentation: 'modal',
                }}
              />
            </Stack>
          </WorkoutStateProvider>
        </ThemeProvider>
      </PortalProvider>
    </TamaguiProvider>
  );
}
