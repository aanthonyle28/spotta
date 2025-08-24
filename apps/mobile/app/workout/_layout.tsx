import { Stack } from 'expo-router';

export default function WorkoutLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
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
        options={{
          title: 'Template Preview',
          headerShown: true,
        }}
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
