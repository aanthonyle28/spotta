import { memo, useCallback, useMemo } from 'react';
import { YStack, XStack, H3, Text, Button, Card } from '@my/ui';
import type { SessionExercise, SetData } from '../types';
import type { SetEntryId } from '@spotta/shared';
import { WeightRepsStepper } from './WeightRepsStepper';

interface ExerciseCardProps {
  exercise: SessionExercise;
  isActive: boolean;
  onSetComplete: (setData: SetData) => void;
  onSetUpdate: (setId: SetEntryId, updates: Partial<SetData>) => void;
  onToggleActive: () => void;
}

export const ExerciseCard = memo(
  ({
    exercise,
    isActive,
    onSetComplete,
    onSetUpdate,
    onToggleActive,
  }: ExerciseCardProps) => {
    const exerciseStats = useMemo(
      () => ({
        totalSets: exercise.sets.length,
        completedSets: exercise.sets.filter((s) => s.completed).length,
        totalVolume: exercise.sets.reduce(
          (sum, set) =>
            set.completed ? sum + (set.weight || 0) * (set.reps || 0) : sum,
          0
        ),
      }),
      [exercise.sets]
    );

    const handleSetComplete = useCallback(
      (set: SetData) => {
        const completedSet = {
          ...set,
          completed: true,
          completedAt: new Date(),
        };
        onSetComplete(completedSet);
      },
      [onSetComplete]
    );

    const handleWeightChange = useCallback(
      (setId: string, weight: number) => {
        onSetUpdate(setId as SetEntryId, { weight });
      },
      [onSetUpdate]
    );

    const handleRepsChange = useCallback(
      (setId: string, reps: number) => {
        onSetUpdate(setId as SetEntryId, { reps });
      },
      [onSetUpdate]
    );

    // Stable style objects to avoid recreation
    const cardStyle = useMemo(
      () => ({
        marginVertical: '$2' as const,
        padding: '$4' as const,
        backgroundColor: '$background' as const,
        borderRadius: '$4' as const,
        shadowColor: '$shadowColor' as const,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
      }),
      []
    );

    return (
      <Card {...cardStyle}>
        <XStack justifyContent="space-between" alignItems="center">
          <YStack flex={1}>
            <H3>{exercise.exercise.name}</H3>
            <Text fontSize="$3" color="$gray10">
              {exerciseStats.completedSets}/{exerciseStats.totalSets} sets
              {exerciseStats.totalVolume > 0 &&
                ` • ${exerciseStats.totalVolume} lbs`}
            </Text>
          </YStack>
          <Button
            size="$3"
            variant={isActive ? 'outlined' : undefined}
            onPress={onToggleActive}
          >
            {isActive ? 'Collapse' : 'Expand'}
          </Button>
        </XStack>

        {isActive && (
          <YStack space="$3" marginTop="$4">
            {exercise.sets.map((set, _index) => {
              // Stable styles to avoid recreation
              const setRowStyle = {
                alignItems: 'center' as const,
                space: '$3' as const,
                padding: '$3' as const,
                backgroundColor: set.completed
                  ? ('$green2' as const)
                  : ('$gray2' as const),
                borderRadius: '$3' as const,
              };

              return (
                <XStack key={set.id} {...setRowStyle}>
                  <Text fontSize="$4" fontWeight="600" width={30}>
                    {set.setNumber}
                  </Text>

                  <WeightRepsStepper
                    weight={set.weight || 0}
                    reps={set.reps || 0}
                    onWeightChange={(weight) =>
                      handleWeightChange(set.id, weight)
                    }
                    onRepsChange={(reps) => handleRepsChange(set.id, reps)}
                    disabled={set.completed}
                  />

                  {!set.completed ? (
                    <Button
                      size="$3"
                      backgroundColor="$blue9"
                      onPress={() => handleSetComplete(set)}
                      disabled={!set.weight || !set.reps}
                    >
                      ✓
                    </Button>
                  ) : (
                    <Text color="$green10" fontSize="$3">
                      ✓ Done
                    </Text>
                  )}
                </XStack>
              );
            })}

            <Button
              variant="outlined"
              size="$3"
              marginTop="$2"
              onPress={() => {
                // Add new set logic will be in parent component
              }}
            >
              Add Set
            </Button>
          </YStack>
        )}
      </Card>
    );
  }
);

ExerciseCard.displayName = 'ExerciseCard';
