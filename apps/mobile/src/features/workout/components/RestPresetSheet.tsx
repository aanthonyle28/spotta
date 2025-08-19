import { memo, useState } from 'react';
import { Sheet, YStack, XStack, H4, Text, Button, Input, Label } from 'tamagui';
import { Clock, Settings } from '@tamagui/lucide-icons';

interface RestPresetSheetProps {
  isOpen: boolean;
  onClose: () => void;
  currentRestTime: number;
  exerciseName?: string;
  onApplyToThis: (seconds: number) => void;
  onApplyToAll: (seconds: number) => void;
  onRememberForExercise: (seconds: number) => void;
}

const PRESET_OPTIONS = [
  { label: '60s', value: 60 },
  { label: '90s', value: 90 },
  { label: '2min', value: 120 },
  { label: '3min', value: 180 },
];

export const RestPresetSheet = memo<RestPresetSheetProps>(({
  isOpen,
  onClose,
  currentRestTime,
  exerciseName,
  onApplyToThis,
  onApplyToAll,
  onRememberForExercise,
}) => {
  const [customTime, setCustomTime] = useState(currentRestTime.toString());
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);

  const handlePresetSelect = (seconds: number) => {
    setSelectedPreset(seconds);
    setCustomTime(seconds.toString());
  };

  const handleCustomTimeChange = (text: string) => {
    setCustomTime(text);
    setSelectedPreset(null);
  };

  const getSelectedTime = (): number => {
    if (selectedPreset !== null) return selectedPreset;
    const parsed = parseInt(customTime, 10);
    return isNaN(parsed) ? currentRestTime : Math.max(0, parsed);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    if (secs === 0) return `${mins}m`;
    return `${mins}m ${secs}s`;
  };

  return (
    <Sheet
      modal
      open={isOpen}
      onOpenChange={onClose}
      snapPoints={[40]}
      dismissOnSnapToBottom
    >
      <Sheet.Overlay />
      <Sheet.Handle />
      <Sheet.Frame padding="$4" space="$4">
        {/* Header */}
        <YStack space="$2">
          <XStack alignItems="center" space="$2">
            <Settings size={20} color="$gray11" />
            <H4>Rest Timer Settings</H4>
          </XStack>
          {exerciseName && (
            <Text fontSize="$3" color="$gray10">
              For {exerciseName}
            </Text>
          )}
        </YStack>

        {/* Preset Options */}
        <YStack space="$3">
          <Label fontSize="$4" fontWeight="500">Quick Presets</Label>
          <XStack space="$2" flexWrap="wrap">
            {PRESET_OPTIONS.map((preset) => (
              <Button
                key={preset.value}
                size="$3"
                theme={selectedPreset === preset.value ? "active" : null}
                onPress={() => handlePresetSelect(preset.value)}
                icon={<Clock size={16} />}
              >
                {preset.label}
              </Button>
            ))}
          </XStack>
        </YStack>

        {/* Custom Time */}
        <YStack space="$2">
          <Label fontSize="$4" fontWeight="500">Custom Time (seconds)</Label>
          <XStack space="$2" alignItems="center">
            <Input
              flex={1}
              placeholder="90"
              value={customTime}
              onChangeText={handleCustomTimeChange}
              keyboardType="numeric"
              accessibilityLabel="Custom rest time in seconds"
            />
            <Text fontSize="$3" color="$gray10" minWidth={60}>
              = {formatTime(getSelectedTime())}
            </Text>
          </XStack>
        </YStack>

        {/* Action Buttons */}
        <YStack space="$3" marginTop="$2">
          <Button
            size="$4"
            backgroundColor="$blue9"
            onPress={() => {
              onApplyToThis(getSelectedTime());
              onClose();
            }}
          >
            Apply to this exercise
          </Button>

          <Button
            size="$4"
            backgroundColor="$green9"
            onPress={() => {
              onApplyToAll(getSelectedTime());
              onClose();
            }}
          >
            Apply to all exercises (this session)
          </Button>

          {exerciseName && (
            <Button
              size="$4"
              backgroundColor="$purple9"
              onPress={() => {
                onRememberForExercise(getSelectedTime());
                onClose();
              }}
            >
              Remember for {exerciseName}
            </Button>
          )}

          <Button
            size="$3"
            chromeless
            onPress={onClose}
          >
            Cancel
          </Button>
        </YStack>
      </Sheet.Frame>
    </Sheet>
  );
});