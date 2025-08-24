import { Tabs, usePathname } from 'expo-router';
import { YStack } from 'tamagui';
import { useMemo } from 'react';
import { Dumbbell, Users, User } from '@tamagui/lucide-icons';
import { useWorkoutState } from '../../src/features/workout/providers/WorkoutStateProvider';
import { ActiveSessionBanner } from '../../src/features/workout/components';

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

  return (
    <YStack flex={1}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#007AFF',
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="workout"
          options={{
            title: 'Workout',
            tabBarIcon: ({ color }) => <Dumbbell color={color} size={24} />,
          }}
        />
        <Tabs.Screen
          name="clubs"
          options={{
            title: 'Clubs',
            tabBarIcon: ({ color }) => <Users color={color} size={24} />,
          }}
        />
        <Tabs.Screen
          name="progress"
          options={{
            title: 'Progress',
            tabBarIcon: ({ color }) => <User color={color} size={24} />,
          }}
        />
      </Tabs>

      {/* Active Session Banner - Above Tab Bar */}
      {showBanner && hasActiveSession && state.activeSession && (
        <ActiveSessionBanner activeSession={state.activeSession} />
      )}
    </YStack>
  );
}
