import { YStack, H1, Text, Button } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ClubsScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <YStack flex={1} padding="$4" space="$4">
        <H1>Clubs</H1>
        <Text>Join accountability groups and share progress</Text>
        
        <YStack space="$3">
          <Button>Create New Club</Button>
          <Button variant="outlined">Join with Code</Button>
          <Button variant="outlined">Browse Public Clubs</Button>
        </YStack>
        
        <YStack>
          <Text fontSize="$5" fontWeight="600">My Clubs</Text>
          <Text color="$gray10">No clubs joined yet</Text>
        </YStack>
        
        <YStack>
          <Text fontSize="$5" fontWeight="600">Recent Activity</Text>
          <Text color="$gray10">No recent activity</Text>
        </YStack>
      </YStack>
    </SafeAreaView>
  );
}