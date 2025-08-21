import { Tabs, usePathname } from 'expo-router';
import { YStack } from 'tamagui';
import { Dumbbell, Users, User } from '@tamagui/lucide-icons';
import { useWorkoutState } from '../../src/features/workout/hooks';
import { ActiveSessionBanner } from '../../src/features/workout/components/ActiveSessionBanner';

export default function TabLayout() {
  const { state } = useWorkoutState();
  const pathname = usePathname();

  // Don't show banner on logging screen
  const isLoggingScreen = pathname.includes('/workout/logging/');
  const showBanner = state.activeSession && !isLoggingScreen;

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
