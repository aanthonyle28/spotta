import { memo, useState, useEffect } from 'react';
import { Sheet, YStack, XStack, H4, Button, Text, Card } from 'tamagui';
import { GripVertical, ArrowUp, ArrowDown, X } from '@tamagui/lucide-icons';
import type { SessionExercise } from '../types';

interface ExerciseReorderModalProps {
  isOpen: boolean;
  exercises: SessionExercise[];
  onClose: () => void;
  onSave: (reorderedExercises: SessionExercise[]) => void;
}

export const ExerciseReorderModal = memo<ExerciseReorderModalProps>(
  ({ isOpen, exercises, onClose, onSave }) => {
    const [reorderedExercises, setReorderedExercises] = useState<SessionExercise[]>(exercises);

    // Sync with exercises prop changes
    useEffect(() => {
      setReorderedExercises(exercises);
    }, [exercises]);

    const moveExercise = (index: number, direction: 'up' | 'down') => {
      const newExercises = [...reorderedExercises];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;

      if (targetIndex >= 0 && targetIndex < newExercises.length) {
        [newExercises[index], newExercises[targetIndex]] = [
          newExercises[targetIndex],
          newExercises[index],
        ];
        setReorderedExercises(newExercises);
      }
    };

    const handleSave = () => {
      onSave(reorderedExercises);
      onClose();
    };

    const handleCancel = () => {
      setReorderedExercises(exercises); // Reset to original order
      onClose();
    };

    return (
      <Sheet
        modal
        open={isOpen}
        onOpenChange={(open) => !open && handleCancel()}
        snapPointsMode="fit"
        dismissOnSnapToBottom
      >
        <Sheet.Overlay />
        <Sheet.Handle />
        <Sheet.Frame padding="$4" backgroundColor="$background">
          <YStack space="$4">
            {/* Header */}
            <YStack space="$2">
              <XStack justifyContent="space-between" alignItems="center">
                <H4>Reorder Exercises</H4>
                <Button
                  size="$2"
                  chromeless
                  onPress={handleCancel}
                  padding="$2"
                  accessibilityLabel="Close modal"
                >
                  <X size={18} color="$gray10" />
                </Button>
              </XStack>
              <Text fontSize="$3" color="$gray11" lineHeight="$1">
                Drag to reorder exercises in your workout.
              </Text>
            </YStack>

            {/* Exercise List */}
            <YStack space="$2" maxHeight={400}>
              {reorderedExercises.map((exercise, index) => (
                <Card
                  key={exercise.id}
                  padding="$3"
                  backgroundColor="$gray2"
                  borderColor="$gray6"
                  borderWidth={1}
                >
                  <XStack justifyContent="space-between" alignItems="center">
                    <XStack space="$3" alignItems="center" flex={1}>
                      <GripVertical size={16} color="$gray8" />
                      <YStack flex={1}>
                        <Text fontSize="$4" fontWeight="600" numberOfLines={1}>
                          {exercise.exercise.name}
                        </Text>
                        <Text fontSize="$3" color="$gray10">
                          {exercise.sets.length} sets
                        </Text>
                      </YStack>
                    </XStack>

                    <XStack space="$1">
                      <Button
                        size="$2"
                        chromeless
                        onPress={() => moveExercise(index, 'up')}
                        disabled={index === 0}
                        padding="$2"
                        opacity={index === 0 ? 0.5 : 1}
                        accessibilityLabel="Move up"
                      >
                        <ArrowUp size={14} color="$gray10" />
                      </Button>
                      <Button
                        size="$2"
                        chromeless
                        onPress={() => moveExercise(index, 'down')}
                        disabled={index === reorderedExercises.length - 1}
                        padding="$2"
                        opacity={
                          index === reorderedExercises.length - 1 ? 0.5 : 1
                        }
                        accessibilityLabel="Move down"
                      >
                        <ArrowDown size={14} color="$gray10" />
                      </Button>
                    </XStack>
                  </XStack>
                </Card>
              ))}
            </YStack>

            {/* Action Buttons */}
            <XStack space="$3" justifyContent="flex-end">
              <Button
                variant="outlined"
                onPress={handleCancel}
                padding="$3"
                minWidth={80}
              >
                <Text>Cancel</Text>
              </Button>
              <Button
                backgroundColor="$blue9"
                onPress={handleSave}
                padding="$3"
                minWidth={80}
              >
                <Text color="white">Save</Text>
              </Button>
            </XStack>
          </YStack>
        </Sheet.Frame>
      </Sheet>
    );
  }
);