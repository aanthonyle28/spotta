import { memo, useEffect, useState } from 'react';
import { Sheet, YStack, XStack, Text, Button, styled, Progress } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SkipForward } from '@tamagui/lucide-icons';
import type { RestTimerState } from '../types';

interface RestTimerModalProps {
  restTimer: RestTimerState;
  onSkip: () => void;
  onAdjust: (seconds: number) => void;
  onPause: () => void;
  onResume: () => void;
}

const ActionButton = styled(Button, {
  height: 36,
  minWidth: 75,
  borderRadius: 12,
  backgroundColor: '$blue7',
  pressStyle: {
    backgroundColor: '$blue8',
    scale: 0.98,
  },
  variants: {
    variant: {
      primary: {
        backgroundColor: '$blue7',
      },
      secondary: {
        backgroundColor: '$blue6',
      },
      skip: {
        backgroundColor: '$orange9',
        pressStyle: {
          backgroundColor: '$orange10',
          scale: 0.98,
        },
      },
    },
  } as const,
});

export const RestTimerModal = memo(
  ({
    restTimer,
    onSkip,
    onAdjust,
    onPause: _onPause,
    onResume: _onResume,
  }: RestTimerModalProps) => {
    const [currentTime, setCurrentTime] = useState(restTimer.remainingTime);

    const formatTime = (seconds: number): string => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Calculate progress for countdown (remaining time as percentage)
    const progress =
      restTimer.totalTime > 0
        ? Math.max(
            0,
            Math.min(100, Math.round((currentTime / restTimer.totalTime) * 100))
          )
        : 0;

    // Update current time in real-time
    useEffect(() => {
      if (!restTimer.isActive || !restTimer.startedAt) {
        setCurrentTime(restTimer.remainingTime);
        return;
      }

      const interval = setInterval(() => {
        const now = Date.now();
        const elapsed = Math.floor(
          (now - restTimer.startedAt!.getTime()) / 1000
        );
        const remaining = Math.max(0, restTimer.remainingTime - elapsed);
        setCurrentTime(remaining);
      }, 100); // Update more frequently for smooth countdown

      return () => clearInterval(interval);
    }, [restTimer.isActive, restTimer.startedAt, restTimer.remainingTime]);

    if (!restTimer.isActive || !restTimer.showAsModal) {
      return null;
    }

    return (
      <Sheet
        open={restTimer.isActive && restTimer.showAsModal}
        onOpenChange={() => {}}
        snapPointsMode="fit"
        dismissOnSnapToBottom={false}
        dismissOnOverlayPress={false}
        animation="medium"
        zIndex={1000}
        modal={false}
      >
        <Sheet.Frame backgroundColor="$blue9" borderRadius={0}>
          <SafeAreaView edges={['bottom']}>
            {/* Progress line that moves down */}
            <Progress
              value={progress} // Shows remaining time as progress
              backgroundColor="$blue7"
              borderRadius={0}
              height={3}
              width="100%"
            >
              <Progress.Indicator backgroundColor="white" />
            </Progress>

            <YStack padding="$3" space="$3" backgroundColor="$blue9">
              {/* Control Buttons */}
              <XStack space="$2" justifyContent="center" alignItems="center">
                <ActionButton
                  variant="secondary"
                  onPress={() => onAdjust(-15)}
                  disabled={currentTime <= 15}
                >
                  <Text color="white" fontSize="$2" fontWeight="600">
                    -15
                  </Text>
                </ActionButton>

                <Text
                  color="white"
                  fontSize="$9"
                  fontWeight="bold"
                  textAlign="center"
                  flex={1}
                >
                  {formatTime(currentTime)}
                </Text>

                <ActionButton variant="secondary" onPress={() => onAdjust(15)}>
                  <Text color="white" fontSize="$2" fontWeight="600">
                    +15
                  </Text>
                </ActionButton>

                <ActionButton variant="skip" onPress={onSkip}>
                  <XStack space="$1" alignItems="center">
                    <SkipForward size={14} color="white" />
                    <Text color="white" fontSize="$2" fontWeight="600">
                      Skip
                    </Text>
                  </XStack>
                </ActionButton>
              </XStack>
            </YStack>
          </SafeAreaView>
        </Sheet.Frame>
      </Sheet>
    );
  }
);

RestTimerModal.displayName = 'RestTimerModal';
