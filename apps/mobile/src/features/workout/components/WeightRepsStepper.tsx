import { memo, useCallback, useState, useEffect, useRef } from 'react';
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
    maxWeight = 99999,
    minReps = 0,
    maxReps = 99999,
  }: WeightRepsStepperProps) => {
    // Local state for input values to prevent glitches
    const [weightInput, setWeightInput] = useState(
      weight === 0 ? '' : weight.toString()
    );
    const [repsInput, setRepsInput] = useState(
      reps === 0 ? '' : reps.toString()
    );

    // Refs to track stepper actions and prevent debounce conflicts
    const isStepperAction = useRef(false);
    const weightTimerRef = useRef<NodeJS.Timeout | null>(null);
    const repsTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Update local state when props change (e.g., from stepper buttons)
    useEffect(() => {
      if (isStepperAction.current) {
        setWeightInput(weight === 0 ? '' : weight.toString());
        isStepperAction.current = false;
      }
    }, [weight]);

    useEffect(() => {
      if (isStepperAction.current) {
        setRepsInput(reps === 0 ? '' : reps.toString());
        isStepperAction.current = false;
      }
    }, [reps]);

    // Debounced update to parent state with smart timing
    useEffect(() => {
      if (weightTimerRef.current) {
        clearTimeout(weightTimerRef.current);
      }

      // Immediate update for empty string (deletion to zero)
      if (weightInput === '') {
        if (weight !== 0) {
          onWeightChange(0);
        }
        return;
      }

      // Fast debounce for shorter inputs (likely deletions), slower for longer (additions)
      const debounceTime = weightInput.length <= 2 ? 100 : 250;

      weightTimerRef.current = setTimeout(() => {
        const weightValue = parseInt(weightInput);
        if (!isNaN(weightValue) && weightValue !== weight) {
          onWeightChange(weightValue);
        }
      }, debounceTime);

      return () => {
        if (weightTimerRef.current) {
          clearTimeout(weightTimerRef.current);
        }
      };
    }, [weightInput, weight, onWeightChange]);

    useEffect(() => {
      if (repsTimerRef.current) {
        clearTimeout(repsTimerRef.current);
      }

      // Immediate update for empty string (deletion to zero)
      if (repsInput === '') {
        if (reps !== 0) {
          onRepsChange(0);
        }
        return;
      }

      // Fast debounce for shorter inputs (likely deletions), slower for longer (additions)
      const debounceTime = repsInput.length <= 1 ? 100 : 250;

      repsTimerRef.current = setTimeout(() => {
        const repsValue = parseInt(repsInput);
        if (!isNaN(repsValue) && repsValue !== reps) {
          onRepsChange(repsValue);
        }
      }, debounceTime);

      return () => {
        if (repsTimerRef.current) {
          clearTimeout(repsTimerRef.current);
        }
      };
    }, [repsInput, reps, onRepsChange]);

    const handleWeightIncrement = useCallback(() => {
      const newWeight = Math.min(weight + weightStep, maxWeight);
      isStepperAction.current = true;
      // Clear any pending debounced updates
      if (weightTimerRef.current) {
        clearTimeout(weightTimerRef.current);
        weightTimerRef.current = null;
      }
      // Update both local state and parent immediately
      setWeightInput(newWeight === 0 ? '' : newWeight.toString());
      onWeightChange(newWeight);
    }, [weight, weightStep, maxWeight, onWeightChange]);

    const handleWeightDecrement = useCallback(() => {
      const newWeight = Math.max(weight - weightStep, minWeight);
      isStepperAction.current = true;
      // Clear any pending debounced updates
      if (weightTimerRef.current) {
        clearTimeout(weightTimerRef.current);
        weightTimerRef.current = null;
      }
      // Update both local state and parent immediately
      setWeightInput(newWeight === 0 ? '' : newWeight.toString());
      onWeightChange(newWeight);
    }, [weight, weightStep, minWeight, onWeightChange]);

    const handleRepsIncrement = useCallback(() => {
      const newReps = Math.min(reps + repsStep, maxReps);
      isStepperAction.current = true;
      // Clear any pending debounced updates
      if (repsTimerRef.current) {
        clearTimeout(repsTimerRef.current);
        repsTimerRef.current = null;
      }
      // Update both local state and parent immediately
      setRepsInput(newReps === 0 ? '' : newReps.toString());
      onRepsChange(newReps);
    }, [reps, repsStep, maxReps, onRepsChange]);

    const handleRepsDecrement = useCallback(() => {
      const newReps = Math.max(reps - repsStep, minReps);
      isStepperAction.current = true;
      // Clear any pending debounced updates
      if (repsTimerRef.current) {
        clearTimeout(repsTimerRef.current);
        repsTimerRef.current = null;
      }
      // Update both local state and parent immediately
      setRepsInput(newReps === 0 ? '' : newReps.toString());
      onRepsChange(newReps);
    }, [reps, repsStep, minReps, onRepsChange]);

    const handleWeightInputChange = useCallback(
      (text: string) => {
        // Allow empty string and valid numbers only
        if (text === '' || /^\d+$/.test(text)) {
          const numValue = text === '' ? 0 : parseInt(text);
          if (text === '' || (numValue >= minWeight && numValue <= maxWeight)) {
            setWeightInput(text);
          }
        }
      },
      [minWeight, maxWeight]
    );

    const handleRepsInputChange = useCallback(
      (text: string) => {
        // Allow empty string and valid numbers only
        if (text === '' || /^\d+$/.test(text)) {
          const numValue = text === '' ? 0 : parseInt(text);
          if (text === '' || (numValue >= minReps && numValue <= maxReps)) {
            setRepsInput(text);
          }
        }
      },
      [minReps, maxReps]
    );

    // Cleanup timers on unmount
    useEffect(() => {
      return () => {
        if (weightTimerRef.current) {
          clearTimeout(weightTimerRef.current);
        }
        if (repsTimerRef.current) {
          clearTimeout(repsTimerRef.current);
        }
      };
    }, []);

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
            value={weightInput}
            onChangeText={handleWeightInputChange}
            onFocus={() => {
              // Text selection handled by selectTextOnFocus prop
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
            value={repsInput}
            onChangeText={handleRepsInputChange}
            onFocus={() => {
              // Text selection handled by selectTextOnFocus prop
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
