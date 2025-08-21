import { Stack, router } from 'expo-router';
import { Button } from 'tamagui';
import { ChevronLeft } from '@tamagui/lucide-icons';

export default function WorkoutLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTitleStyle: { fontSize: 18, fontWeight: '600' },
        headerStyle: { backgroundColor: 'transparent' },
      }}
    >
      <Stack.Screen
        name="add"
        options={{
          headerShown: false,
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="create-exercise"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="template/[id]"
        options={{ title: 'Template Preview' }}
      />
      <Stack.Screen
        name="browse-templates"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
