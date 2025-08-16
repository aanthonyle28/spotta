import { memo, useEffect, useState } from 'react';
import { XStack, YStack, Text, Button, Progress } from 'tamagui';
import { Pause, Play, SkipForward } from '@tamagui/lucide-icons';
import type { RestTimerState } from '../types';

interface RestBarProps {
  restTimer: RestTimerState;
  onSkip: () => void;
  onAdjust: (seconds: number) => void;
  onPause: () => void;
  onResume: () => void;
  exerciseName?: string;
}

export const RestBar = memo(
  ({
    restTimer,
    onSkip,
    onAdjust,
    onPause,
    onResume,
    exerciseName,
  }: RestBarProps) => {
    const [isPaused, setIsPaused] = useState(false);

    const formatTime = (seconds: number): string => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const progress =
      restTimer.totalTime > 0
        ? (restTimer.totalTime - restTimer.remainingTime) / restTimer.totalTime
        : 0;

    const handlePauseResume = () => {
      if (isPaused) {
        onResume();
      } else {
        onPause();
      }
      setIsPaused(!isPaused);
    };

    if (!restTimer.isActive) {
      return null;
    }

    return (
      <YStack
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        backgroundColor="$blue9"
        padding="$4"
        space="$2"
        borderTopLeftRadius="$4"
        borderTopRightRadius="$4"
        shadowColor="$shadowColor"
        shadowOffset={{ width: 0, height: -2 }}
        shadowOpacity={0.2}
        shadowRadius={8}
        elevation={8}
      >
        <XStack justifyContent="space-between" alignItems="center">
          <YStack>
            <Text color="white" fontSize="$2" opacity={0.8}>
              Rest Timer {exerciseName && `• ${exerciseName}`}
            </Text>
            <Text color="white" fontSize="$6" fontWeight="bold">
              {formatTime(restTimer.remainingTime)}
            </Text>
          </YStack>

          <XStack space="$2">
            <Button
              size="$3"
              circular
              backgroundColor="$blue7"
              onPress={() => onAdjust(-15)}
              disabled={restTimer.remainingTime <= 15}
            >
              <Text color="white" fontSize="$3">
                -15
              </Text>
            </Button>

            <Button
              size="$3"
              circular
              backgroundColor="$blue7"
              onPress={handlePauseResume}
            >
              {isPaused ? (
                <Play size={16} color="white" />
              ) : (
                <Pause size={16} color="white" />
              )}
            </Button>

            <Button
              size="$3"
              circular
              backgroundColor="$blue7"
              onPress={() => onAdjust(15)}
            >
              <Text color="white" fontSize="$3">
                +15
              </Text>
            </Button>

            <Button size="$3" backgroundColor="$orange9" onPress={onSkip}>
              <SkipForward size={16} color="white" />
            </Button>
          </XStack>
        </XStack>

        <Progress
          value={progress * 100}
          backgroundColor="$blue7"
          borderRadius="$2"
          height={4}
        >
          <Progress.Indicator backgroundColor="white" />
        </Progress>
      </YStack>
    );
  }
);

RestBar.displayName = 'RestBar';
