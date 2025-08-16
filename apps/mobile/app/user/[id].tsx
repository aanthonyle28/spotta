import { YStack, H1, Text } from 'tamagui'
import { Stack, useLocalSearchParams } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function Screen() {
  const { id } = useLocalSearchParams()
  
  return (
    <>
      <Stack.Screen
        options={{
          title: 'User Profile',
          presentation: 'modal',
        }}
      />
      <SafeAreaView style={{ flex: 1 }}>
        <YStack flex={1} padding="$4" space="$4">
          <H1>User Profile</H1>
          <Text>User ID: {id}</Text>
          <Text color="$gray10">Profile details coming soon...</Text>
        </YStack>
      </SafeAreaView>
    </>
  )
}
