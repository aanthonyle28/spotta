import { YStack, H1, Text, Button } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WorkoutScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <YStack flex={1} padding="$4" space="$4">
        <H1>Workout</H1>
        <Text>Fast workout logging and session tracking</Text>
        
        <YStack space="$3">
          <Button>Start Quick Workout</Button>
          <Button variant="outlined">Browse Templates</Button>
          <Button variant="outlined">View Recent Workouts</Button>
        </YStack>
        
        <YStack>
          <Text fontSize="$5" fontWeight="600">Recent Sessions</Text>
          <Text color="$gray10">No recent workouts</Text>
        </YStack>
      </YStack>
    </SafeAreaView>
  );
}