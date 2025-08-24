import { memo } from 'react';
import { Sheet, YStack, XStack, H4, Button, Text, Card } from 'tamagui';
import { AlertTriangle, Play, RotateCcw, X } from '@tamagui/lucide-icons';
import type { ActiveSession } from '../types';

interface WorkoutConflictModalProps {
  isOpen: boolean;
  activeSession: ActiveSession | null;
  onClose: () => void;
  onResume: () => void;
  onStartNew: () => void;
}

export const WorkoutConflictModal = memo<WorkoutConflictModalProps>(
  ({ isOpen, activeSession, onClose, onResume, onStartNew }) => {
    const handleResume = () => {
      onResume();
      onClose();
    };

    const handleStartNew = () => {
      onStartNew();
      onClose();
    };

    const handleCancel = () => {
      onClose();
    };

    const formatDuration = (startedAt: Date) => {
      const elapsed = Math.floor(
        (Date.now() - startedAt.getTime()) / 1000 / 60
      );
      return elapsed > 0 ? `${elapsed}m` : '<1m';
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
            <XStack justifyContent="space-between" alignItems="center">
              <H4>Workout in Progress</H4>
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

            {/* Warning Message */}
            <Card
              backgroundColor="$orange2"
              borderColor="$orange6"
              borderWidth={1}
              padding="$3"
            >
              <XStack space="$3" alignItems="flex-start">
                <AlertTriangle size={20} color="$orange11" />
                <YStack flex={1} space="$2">
                  <Text fontSize="$4" fontWeight="600" color="$orange12">
                    You have an active workout
                  </Text>
                  <Text fontSize="$3" color="$orange11" lineHeight="$1">
                    If you start a new workout, your current workout will be
                    discarded and all progress will be lost.
                  </Text>
                </YStack>
              </XStack>
            </Card>

            {/* Active Session Info */}
            {activeSession && (
              <Card
                backgroundColor="$blue2"
                borderColor="$blue6"
                borderWidth={1}
                padding="$3"
              >
                <YStack space="$2">
                  <Text fontSize="$4" fontWeight="600" color="$blue12">
                    {activeSession.name}
                  </Text>
                  <XStack space="$4">
                    <Text fontSize="$3" color="$blue11">
                      {formatDuration(activeSession.startedAt)} elapsed
                    </Text>
                    <Text fontSize="$3" color="$blue11">
                      {activeSession.exercises.length} exercises
                    </Text>
                  </XStack>
                </YStack>
              </Card>
            )}

            {/* Action Buttons */}
            <YStack space="$3">
              {/* Resume Button - Primary */}
              <Button
                size="$4"
                backgroundColor="$blue9"
                onPress={handleResume}
                padding="$3"
                icon={<Play size={20} color="white" />}
                accessibilityLabel="Resume active workout"
              >
                <Text color="white" fontSize="$4" fontWeight="600">
                  Resume Workout
                </Text>
              </Button>

              {/* Start New Button - Destructive */}
              <Button
                size="$4"
                backgroundColor="$red9"
                onPress={handleStartNew}
                padding="$3"
                icon={<RotateCcw size={20} color="white" />}
                accessibilityLabel="Start new workout and discard current one"
              >
                <Text color="white" fontSize="$4" fontWeight="600">
                  Start New Workout
                </Text>
              </Button>

              {/* Cancel Button - Secondary */}
              <Button
                variant="outlined"
                onPress={handleCancel}
                padding="$3"
                accessibilityLabel="Cancel and keep current workout"
              >
                <Text fontSize="$4">Cancel</Text>
              </Button>
            </YStack>
          </YStack>
        </Sheet.Frame>
      </Sheet>
    );
  }
);

WorkoutConflictModal.displayName = 'WorkoutConflictModal';
