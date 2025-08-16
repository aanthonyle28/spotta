import { Stack } from 'expo-router';

export default function WorkoutLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTitleStyle: { fontSize: 18, fontWeight: '600' },
      }}>
      <Stack.Screen 
        name="add" 
        options={{ title: 'Add Exercises' }}
      />
      <Stack.Screen 
        name="create-exercise" 
        options={{ title: 'Create Exercise' }}
      />
      <Stack.Screen 
        name="logging/[sessionId]" 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="template/[id]" 
        options={{ title: 'Template Preview' }}
      />
    </Stack>
  );
}