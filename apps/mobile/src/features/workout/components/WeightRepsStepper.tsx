import { memo, useCallback } from 'react';
import { XStack, YStack, Text, Button } from 'tamagui';
import { Minus, Plus } from '@tamagui/lucide-icons';

interface WeightRepsStepperProps {
  weight: number;
  reps: number;
  onWeightChange: (weight: number) => void;
  onRepsChange: (reps: number) => void;
  disabled?: boolean;
  weightStep?: number;
  repsStep?: number;
  minWeight?: number;
  maxWeight?: number;
  minReps?: number;
  maxReps?: number;
}

export const WeightRepsStepper = memo(
  ({
    weight,
    reps,
    onWeightChange,
    onRepsChange,
    disabled = false,
    weightStep = 5,
    repsStep = 1,
    minWeight = 0,
    maxWeight = 999,
    minReps = 0,
    maxReps = 99,
  }: WeightRepsStepperProps) => {
    const handleWeightIncrement = useCallback(() => {
      const newWeight = Math.min(weight + weightStep, maxWeight);
      onWeightChange(newWeight);
    }, [weight, weightStep, maxWeight, onWeightChange]);

    const handleWeightDecrement = useCallback(() => {
      const newWeight = Math.max(weight - weightStep, minWeight);
      onWeightChange(newWeight);
    }, [weight, weightStep, minWeight, onWeightChange]);

    const handleRepsIncrement = useCallback(() => {
      const newReps = Math.min(reps + repsStep, maxReps);
      onRepsChange(newReps);
    }, [reps, repsStep, maxReps, onRepsChange]);

    const handleRepsDecrement = useCallback(() => {
      const newReps = Math.max(reps - repsStep, minReps);
      onRepsChange(newReps);
    }, [reps, repsStep, minReps, onRepsChange]);

    return (
      <XStack space="$4" alignItems="center">
        {/* Weight stepper */}
        <YStack space="$1" alignItems="center">
          <Text fontSize="$2" color="$gray10">
            Weight
          </Text>
          <XStack space="$2" alignItems="center">
            <Button
              size="$2"
              circular
              disabled={disabled || weight <= minWeight}
              onPress={handleWeightDecrement}
              backgroundColor="$red9"
              accessibilityLabel="Decrease weight"
            >
              <Minus size={16} color="white" />
            </Button>

            <Text
              fontSize="$4"
              fontWeight="600"
              minWidth={50}
              textAlign="center"
            >
              {weight}
            </Text>

            <Button
              size="$2"
              circular
              disabled={disabled || weight >= maxWeight}
              onPress={handleWeightIncrement}
              backgroundColor="$green9"
              accessibilityLabel="Increase weight"
            >
              <Plus size={16} color="white" />
            </Button>
          </XStack>
        </YStack>

        {/* Reps stepper */}
        <YStack space="$1" alignItems="center">
          <Text fontSize="$2" color="$gray10">
            Reps
          </Text>
          <XStack space="$2" alignItems="center">
            <Button
              size="$2"
              circular
              disabled={disabled || reps <= minReps}
              onPress={handleRepsDecrement}
              backgroundColor="$red9"
              accessibilityLabel="Decrease reps"
            >
              <Minus size={16} color="white" />
            </Button>

            <Text
              fontSize="$4"
              fontWeight="600"
              minWidth={30}
              textAlign="center"
            >
              {reps}
            </Text>

            <Button
              size="$2"
              circular
              disabled={disabled || reps >= maxReps}
              onPress={handleRepsIncrement}
              backgroundColor="$green9"
              accessibilityLabel="Increase reps"
            >
              <Plus size={16} color="white" />
            </Button>
          </XStack>
        </YStack>
      </XStack>
    );
  }
);

WeightRepsStepper.displayName = 'WeightRepsStepper';
