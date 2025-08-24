import { Card, Text, YStack } from 'tamagui';
import { useWorkoutState } from '../hooks';

export const WorkoutStateDebugger = () => {
  const { state, hasActiveSession } = useWorkoutState();

  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <Card
      backgroundColor="$yellow2"
      borderColor="$yellow6"
      borderWidth={1}
      padding="$2"
      margin="$2"
      position="absolute"
      top={50}
      right={10}
      zIndex={999}
      opacity={0.8}
    >
      <YStack space="$1">
        <Text fontSize="$1" fontWeight="600">
          Debug State:
        </Text>
        <Text fontSize="$1">
          hasActiveSession: {hasActiveSession.toString()}
        </Text>
        <Text fontSize="$1">
          activeSession:{' '}
          {state.activeSession ? state.activeSession.name : 'null'}
        </Text>
        <Text fontSize="$1">loading: {state.isLoading.toString()}</Text>
      </YStack>
    </Card>
  );
};
