import { YStack, H1, Text, Button } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProgressScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <YStack flex={1} padding="$4" space="$4">
        <H1>Progress & Settings</H1>
        <Text>Track your fitness journey and manage preferences</Text>

        <YStack space="$3">
          <Button>Add Progress Photo</Button>
          <Button variant="outlined">Log Measurement</Button>
          <Button variant="outlined">View Trends</Button>
        </YStack>

        <YStack>
          <Text fontSize="$5" fontWeight="600">
            Personal Records
          </Text>
          <Text color="$gray10">No PRs recorded yet</Text>
        </YStack>

        <YStack>
          <Text fontSize="$5" fontWeight="600">
            Settings
          </Text>
          <Button variant="outlined">Account Settings</Button>
          <Button variant="outlined">Notifications</Button>
          <Button variant="outlined">Units & Preferences</Button>
        </YStack>
      </YStack>
    </SafeAreaView>
  );
}
