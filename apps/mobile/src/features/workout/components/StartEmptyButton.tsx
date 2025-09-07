import { memo } from 'react';
import { Button } from '@my/ui';
import { Play } from '@tamagui/lucide-icons';
import { SPOTTA_COLORS } from '../../../constants/colors';

interface StartEmptyButtonProps {
  onPress: () => void;
  disabled?: boolean;
}

export const StartEmptyButton = memo<StartEmptyButtonProps>(
  ({ onPress, disabled }) => {
    return (
      <Button
        size="$4"
        backgroundColor={SPOTTA_COLORS.purple}
        onPress={onPress}
        disabled={disabled}
        accessibilityLabel="Start empty workout"
      >
        {disabled ? 'Starting...' : 'Start empty workout'}
      </Button>
    );
  }
);
