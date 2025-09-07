import { Tabs, usePathname, router } from 'expo-router';
import { YStack } from 'tamagui';
import { useMemo } from 'react';
import { useWorkoutState } from '../../src/features/workout/providers/WorkoutStateProvider';
import {
  ActiveSessionBanner,
  FloatingPillNavigation,
} from '../../src/features/workout/components';
import { SPOTTA_COLORS } from '../../src/constants/colors';

export default function TabLayout() {
  const { state, hasActiveSession } = useWorkoutState();
  const pathname = usePathname();

  // Enhanced banner logic - more reliable detection
  const showBanner = useMemo(() => {
    // Don't show during initial load or navigation to prevent race conditions
    if (state.isLoading) return false;

    const isLoggingScreen = pathname.includes('/logging/');
    // Use hasActiveSession computed property for consistency
    const result = hasActiveSession && !isLoggingScreen;

    // Debug logging - can be removed in production
    // console.log(`[Banner Logic] isLoading: ${state.isLoading}, hasActiveSession: ${hasActiveSession}, isLoggingScreen: ${isLoggingScreen}, showBanner: ${result}, sessionId: ${state.activeSession?.id || 'null'}, pathname: ${pathname}`);

    return result;
  }, [hasActiveSession, state.isLoading, pathname]);

  // Get current tab from pathname
  const currentTab = useMemo(() => {
    if (pathname.includes('/workout')) return 'workout';
    if (pathname.includes('/clubs')) return 'clubs';
    if (pathname.includes('/progress')) return 'progress';
    return 'workout';
  }, [pathname]);

  const handleTabPress = (tab: 'workout' | 'clubs' | 'progress') => {
    router.push(`/(tabs)/${tab}`);
  };

  return (
    <YStack flex={1} backgroundColor={SPOTTA_COLORS.background}>
      <Tabs
        screenOptions={{
          tabBarStyle: { display: 'none' }, // Hide native tab bar
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="workout"
          options={{
            title: 'Workout',
          }}
        />
        <Tabs.Screen
          name="clubs"
          options={{
            title: 'Clubs',
          }}
        />
        <Tabs.Screen
          name="progress"
          options={{
            title: 'Progress',
          }}
        />
      </Tabs>

      {/* Floating Pill Navigation */}
      <FloatingPillNavigation
        activeTab={currentTab}
        onTabPress={handleTabPress}
      />

      {/* Active Session Banner - Above Navigation */}
      {showBanner && hasActiveSession && state.activeSession && (
        <ActiveSessionBanner activeSession={state.activeSession} />
      )}
    </YStack>
  );
}
