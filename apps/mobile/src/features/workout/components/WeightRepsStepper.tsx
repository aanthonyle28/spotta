import { memo, useCallback } from 'react';
import { XStack, YStack, Text, Button, Input } from 'tamagui';
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
      <XStack space="$2" alignItems="center">
        {/* Weight stepper */}
        <XStack space="$1" alignItems="center" flex={1} justifyContent="center">
          <Button
            size="$1"
            circular
            disabled={disabled || weight <= minWeight}
            onPress={handleWeightDecrement}
            backgroundColor="$red9"
            accessibilityLabel="Decrease weight"
            padding={0}
            minWidth={26}
            minHeight={26}
          >
            <Minus size={8} color="white" />
          </Button>

          <Input
            value={weight === 0 ? '' : weight.toString()}
            onChangeText={(text) => {
              if (text === '') {
                onWeightChange(0);
                return;
              }
              const newWeight = parseInt(text);
              if (!isNaN(newWeight) && newWeight >= minWeight && newWeight <= maxWeight) {
                onWeightChange(newWeight);
              }
            }}
            onFocus={(e) => {
              // Auto-select all text when focused
              e.target.select && e.target.select();
            }}
            placeholder="0"
            disabled={disabled}
            textAlign="center"
            fontSize="$3"
            fontWeight="600"
            width={65}
            height={32}
            borderRadius="$2"
            keyboardType="numeric"
            selectTextOnFocus={true}
            maxLength={5}
            paddingHorizontal={2}
            paddingVertical={0}
          />

          <Button
            size="$1"
            circular
            disabled={disabled || weight >= maxWeight}
            onPress={handleWeightIncrement}
            backgroundColor="$green9"
            accessibilityLabel="Increase weight"
            padding={0}
            minWidth={26}
            minHeight={26}
          >
            <Plus size={8} color="white" />
          </Button>
        </XStack>

        {/* Reps stepper */}
        <XStack space="$1" alignItems="center" flex={1} justifyContent="center">
          <Button
            size="$1"
            circular
            disabled={disabled || reps <= minReps}
            onPress={handleRepsDecrement}
            backgroundColor="$red9"
            accessibilityLabel="Decrease reps"
            padding={0}
            minWidth={26}
            minHeight={26}
          >
            <Minus size={8} color="white" />
          </Button>

          <Input
            value={reps === 0 ? '' : reps.toString()}
            onChangeText={(text) => {
              if (text === '') {
                onRepsChange(0);
                return;
              }
              const newReps = parseInt(text);
              if (!isNaN(newReps) && newReps >= minReps && newReps <= maxReps) {
                onRepsChange(newReps);
              }
            }}
            onFocus={(e) => {
              // Auto-select all text when focused
              e.target.select && e.target.select();
            }}
            placeholder="0"
            disabled={disabled}
            textAlign="center"
            fontSize="$3"
            fontWeight="600"
            width={65}
            height={32}
            borderRadius="$2"
            keyboardType="numeric"
            selectTextOnFocus={true}
            maxLength={5}
            paddingHorizontal={2}
            paddingVertical={0}
          />

          <Button
            size="$1"
            circular
            disabled={disabled || reps >= maxReps}
            onPress={handleRepsIncrement}
            backgroundColor="$green9"
            accessibilityLabel="Increase reps"
            padding={0}
            minWidth={26}
            minHeight={26}
          >
            <Plus size={8} color="white" />
          </Button>
        </XStack>
      </XStack>
    );
  }
);

WeightRepsStepper.displayName = 'WeightRepsStepper';
