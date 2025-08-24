import { Tabs, usePathname } from 'expo-router';
import { YStack } from 'tamagui';
import { useMemo } from 'react';
import { Dumbbell, Users, User } from '@tamagui/lucide-icons';
import { useWorkoutState } from '../../src/features/workout/hooks';
import { ActiveSessionBanner } from '../../src/features/workout/components';

export default function TabLayout() {
  const { state } = useWorkoutState();
  const pathname = usePathname();

  // Enhanced banner logic - more reliable detection
  const showBanner = useMemo(() => {
    // Don't show during initial load or navigation to prevent race conditions
    if (state.isLoading) return false;

    const isLoggingScreen = pathname.includes('/logging/');
    const hasSession = !!state.activeSession;
    return hasSession && !isLoggingScreen;
  }, [state.activeSession, state.isLoading, pathname]);

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
      {showBanner && state.activeSession && (
        <ActiveSessionBanner activeSession={state.activeSession} />
      )}
    </YStack>
  );
}
