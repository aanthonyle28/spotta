import { YStack, H1, Text, Button, Input, XStack } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';

export default function AuthScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <YStack flex={1} padding="$4" justifyContent="center" space="$4">
        <YStack alignItems="center" space="$2">
          <H1>Welcome to Spotta</H1>
          <Text color="$gray10" textAlign="center">
            Track workouts and stay accountable with friends
          </Text>
        </YStack>

        <YStack space="$3">
          <Input placeholder="Email" keyboardType="email-address" />
          <Input placeholder="Password" secureTextEntry />
        </YStack>

        <YStack space="$3">
          <Button>Sign In</Button>
          <Button variant="outlined">Sign Up</Button>
        </YStack>

        <XStack justifyContent="center">
          <Link href="/(tabs)/workout">
            <Text color="$blue10">Continue as Guest</Text>
          </Link>
        </XStack>
      </YStack>
    </SafeAreaView>
  );
}
