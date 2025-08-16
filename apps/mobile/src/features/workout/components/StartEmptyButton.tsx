import { memo } from 'react';
import { Button } from 'tamagui';
import { Play } from '@tamagui/lucide-icons';

interface StartEmptyButtonProps {
  onPress: () => void;
  disabled?: boolean;
}

export const StartEmptyButton = memo<StartEmptyButtonProps>(({ onPress, disabled }) => {
  return (
    <Button 
      size="$4"
      backgroundColor="$green9"
      onPress={onPress}
      disabled={disabled}
      icon={<Play size={20} color="white" />}
      accessibilityLabel="Start empty workout"
    >
      {disabled ? 'Starting...' : 'Start empty workout'}
    </Button>
  );
});