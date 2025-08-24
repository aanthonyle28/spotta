import { memo, useCallback, useMemo, useState, useEffect } from 'react';
import { YStack, XStack, Text, Button, Card } from 'tamagui';
import { ChevronDown, Clock, MoreVertical, Trash2, Repeat, ArrowUpDown } from '@tamagui/lucide-icons';
import type { SessionExercise, SetData } from '../types';
import type { SetEntryId } from '@spotta/shared';
import { WeightRepsStepper } from './WeightRepsStepper';

interface CollapsibleExerciseCardProps {
  exercise: SessionExercise;
  index: number;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  onSetComplete: (setData: SetData) => void;
  onSetUpdate: (setId: SetEntryId, updates: Partial<SetData>) => void;
  onAddSet: () => void;
  onShowRestPreset: () => void;
  closeAllMenus?: boolean; // Signal from parent to close menu
  onMenuStateChange?: (isOpen: boolean, exerciseId: string) => void; // Notify parent of menu state
  onRemoveExercise?: (exerciseId: string) => void;
  onReplaceExercise?: (exerciseId: string) => void;
  onReorderExercises?: () => void;
}

export const CollapsibleExerciseCard = memo(
  ({
    exercise,
    index: _index,
    isExpanded,
    onToggleExpanded,
    onSetComplete,
    onSetUpdate,
    onAddSet,
    onShowRestPreset,
    closeAllMenus,
    onMenuStateChange,
    onRemoveExercise,
    onReplaceExercise,
    onReorderExercises,
  }: CollapsibleExerciseCardProps) => {
    const [isMenuVisible, setIsMenuVisible] = useState(false);
    
    const exerciseStats = useMemo(
      () => ({
        totalSets: exercise.sets.length,
        completedSets: exercise.sets.filter((s) => s.completed).length,
        lastCompletedSet: exercise.sets.filter((s) => s.completed).pop(),
        totalVolume: exercise.sets.reduce(
          (sum, set) =>
            set.completed ? sum + (set.weight || 0) * (set.reps || 0) : sum,
          0
        ),
      }),
      [exercise.sets]
    );

    const handleSetComplete = useCallback(
      (set: SetData) => {
        const completedSet = {
          ...set,
          completed: true,
          completedAt: new Date(),
        };
        onSetComplete(completedSet);
      },
      [onSetComplete]
    );

    const handleWeightChange = useCallback(
      (setId: string, weight: number) => {
        onSetUpdate(setId as SetEntryId, { weight });
      },
      [onSetUpdate]
    );

    const handleRepsChange = useCallback(
      (setId: string, reps: number) => {
        onSetUpdate(setId as SetEntryId, { reps });
      },
      [onSetUpdate]
    );

    // Exercise header uses modal background (dark/black)
    const headerBackgroundColor = '$color1'; // This should be the dark modal background

    const handleMenuPress = (e: any) => {
      e.stopPropagation();
      console.log('Menu pressed for exercise:', exercise.exercise.name);
      const newState = !isMenuVisible;
      setIsMenuVisible(newState);
      onMenuStateChange?.(newState, exercise.id);
    };

    // Close menu when parent requests it (but not if we're the one that should stay open)
    useEffect(() => {
      if (closeAllMenus && isMenuVisible) {
        setIsMenuVisible(false);
        onMenuStateChange?.(false, exercise.id);
      }
    }, [closeAllMenus, isMenuVisible, onMenuStateChange, exercise.id]);

    const handleCardPress = () => {
      if (isMenuVisible) {
        setIsMenuVisible(false);
      } else {
        onToggleExpanded();
      }
    };

    return (
      <YStack borderBottomWidth={1} borderBottomColor="$gray4">
        {/* Exercise Header - Always Visible */}
        <XStack
          justifyContent="space-between"
          alignItems="center"
          padding="$4"
          backgroundColor={headerBackgroundColor}
          pressStyle={{ opacity: 0.7 }}
          onPress={handleCardPress}
          accessibilityLabel={`${exercise.exercise.name}, ${isExpanded ? 'expanded' : 'collapsed'}, tap to ${isExpanded ? 'collapse' : 'expand'}`}
          accessibilityRole="button"
        >
          <YStack flex={1} space="$1">
            <Text fontSize="$5" fontWeight="600">
              {exercise.exercise.name}
            </Text>
            <XStack space="$2" alignItems="center" flexWrap="wrap">
              <Text fontSize="$3" color="$gray10">
                {exerciseStats.completedSets}/{exerciseStats.totalSets} sets
              </Text>

              {/* Rest Timer Button - Next to sets with light gray background */}
              <Button
                size="$2"
                backgroundColor="$gray3"
                borderRadius="$2"
                onPress={onShowRestPreset}
                accessibilityLabel="Rest timer settings"
                paddingHorizontal="$2"
                paddingVertical="$1"
                pressStyle={{
                  backgroundColor: '$gray4',
                }}
              >
                <XStack space="$1" alignItems="center">
                  <Clock size={12} color="$gray11" />
                  <Text fontSize="$2" color="$gray11" fontWeight="500">
                    {exercise.restPreset}s
                  </Text>
                </XStack>
              </Button>

              {exerciseStats.lastCompletedSet &&
                exerciseStats.lastCompletedSet.weight &&
                exerciseStats.lastCompletedSet.reps && (
                  <>
                    <Text fontSize="$3" color="$gray10">
                      •
                    </Text>
                    <Text fontSize="$3" color="$gray10">
                      Last: {exerciseStats.lastCompletedSet.weight}×
                      {exerciseStats.lastCompletedSet.reps}
                    </Text>
                  </>
                )}
              {exerciseStats.totalVolume > 0 && (
                <>
                  <Text fontSize="$3" color="$gray10">
                    •
                  </Text>
                  <Text fontSize="$3" color="$gray10">
                    {exerciseStats.totalVolume} lbs
                  </Text>
                </>
              )}
            </XStack>
          </YStack>

          <XStack alignItems="center" space="$2">
            <ChevronDown
              size={20}
              color="$gray10"
              style={{
                transform: [{ rotate: isExpanded ? '180deg' : '0deg' }],
              }}
            />
            <Button
              size="$3"
              chromeless
              onPress={handleMenuPress}
              padding="$0"
              paddingVertical="$2"
              paddingHorizontal="$1"
              marginRight="$-1"
              minWidth={40}
              minHeight={44}
              accessibilityLabel="Exercise options"
            >
              <MoreVertical size={16} color="white" />
            </Button>
          </XStack>
        </XStack>

        {/* Exercise Sets - Expandable */}
        {isExpanded && (
          <YStack>
            {/* Column Headers - Only shown once at top */}
            <XStack
              alignItems="center"
              paddingHorizontal="$4"
              paddingVertical="$2"
              backgroundColor="$gray2"
            >
              <YStack alignItems="center" minWidth={40}>
                <Text fontSize="$2" color="$gray10" fontWeight="500">
                  SET
                </Text>
              </YStack>
              <YStack flex={1} paddingHorizontal="$2">
                <XStack space="$2" alignItems="center">
                  <YStack alignItems="center" flex={1}>
                    <Text fontSize="$2" color="$gray10" fontWeight="500">
                      WEIGHT
                    </Text>
                  </YStack>
                  <YStack alignItems="center" flex={1}>
                    <Text fontSize="$2" color="$gray10" fontWeight="500">
                      REPS
                    </Text>
                  </YStack>
                </XStack>
              </YStack>
              <YStack alignItems="center" minWidth={50}>
                <Text fontSize="$2" color="$gray10" fontWeight="500">
                  ✓
                </Text>
              </YStack>
            </XStack>

            {/* Set Rows */}
            {exercise.sets.map((set, setIndex) => {
              // Alternating set row colors starting with gray1
              const setBackgroundColor =
                setIndex % 2 === 0 ? '$gray1' : '$background';

              return (
                <XStack
                  key={set.id}
                  alignItems="center"
                  paddingHorizontal="$4"
                  paddingVertical="$3"
                  backgroundColor={setBackgroundColor}
                  minHeight={50}
                >
                  <YStack alignItems="center" minWidth={40}>
                    <Text fontSize="$4" fontWeight="600">
                      {set.setNumber}
                    </Text>
                  </YStack>

                  <YStack flex={1} paddingHorizontal="$2">
                    <WeightRepsStepper
                      weight={set.weight || 0}
                      reps={set.reps || 0}
                      onWeightChange={(weight) =>
                        handleWeightChange(set.id, weight)
                      }
                      onRepsChange={(reps) => handleRepsChange(set.id, reps)}
                      disabled={set.completed}
                    />
                  </YStack>

                  <YStack alignItems="center" minWidth={50}>
                    <Button
                      size="$2"
                      backgroundColor={set.completed ? '$blue9' : 'transparent'}
                      borderColor={set.completed ? '$blue9' : '$gray6'}
                      borderWidth={1}
                      onPress={() => {
                        if (set.completed) {
                          // Toggle off - mark as incomplete
                          onSetUpdate(set.id as any, {
                            completed: false,
                            completedAt: undefined,
                          });
                        } else {
                          // Complete the set
                          handleSetComplete(set);
                        }
                      }}
                      disabled={false}
                      minWidth={32}
                      minHeight={32}
                      padding={0}
                      accessibilityLabel={
                        set.completed
                          ? `Uncheck set ${set.setNumber}`
                          : `Complete set ${set.setNumber}`
                      }
                    >
                      {set.completed ? (
                        <Text color="white" fontSize="$3" fontWeight="600">
                          ✓
                        </Text>
                      ) : (
                        <Text color="$gray8" fontSize="$2">
                          ✓
                        </Text>
                      )}
                    </Button>
                  </YStack>
                </XStack>
              );
            })}

            <XStack
              paddingHorizontal="$4"
              paddingVertical="$3"
              backgroundColor="$background"
            >
              {/* Add Set Button - Thinner gray border, no background */}
              <Button
                flex={1}
                variant="outlined"
                size="$3"
                borderColor="$gray6"
                backgroundColor="transparent"
                borderWidth={1}
                onPress={onAddSet}
                accessibilityLabel={`Add set to ${exercise.exercise.name}`}
              >
                Add Set
              </Button>
            </XStack>
          </YStack>
        )}

        {/* Exercise Menu Dropdown - Following RoutineCarousel pattern */}
        {isMenuVisible && (
          <Card
            position="absolute"
            top={60} // Position below the 3-dots button
            right={16} // Align with card edges
            backgroundColor="$background"
            borderColor="$gray6"
            borderWidth={1}
            padding="$2"
            zIndex={1000}
            elevation={10}
            shadowColor="$shadowColor"
            shadowOffset={{ width: 0, height: 4 }}
            shadowOpacity={0.15}
            shadowRadius={6}
            borderRadius="$3"
            width={160}
          >
            <YStack space="$1">
              <Button
                chromeless
                onPress={() => {
                  setIsMenuVisible(false);
                  onReplaceExercise?.(exercise.id);
                }}
                justifyContent="flex-start"
                padding="$3"
                minHeight={44}
                icon={<Repeat size={16} color="$gray11" />}
                gap="$2"
              >
                <Text fontSize="$4">Replace</Text>
              </Button>

              <Button
                chromeless
                onPress={() => {
                  setIsMenuVisible(false);
                  onReorderExercises?.();
                }}
                justifyContent="flex-start"
                padding="$3"
                minHeight={44}
                icon={<ArrowUpDown size={16} color="$gray11" />}
                gap="$2"
              >
                <Text fontSize="$4">Reorder</Text>
              </Button>

              <Button
                chromeless
                onPress={() => {
                  setIsMenuVisible(false);
                  onRemoveExercise?.(exercise.id);
                }}
                justifyContent="flex-start"
                padding="$3"
                minHeight={44}
                icon={<Trash2 size={16} color="$red10" />}
                gap="$2"
              >
                <Text fontSize="$4" color="$red10">
                  Remove
                </Text>
              </Button>
            </YStack>
          </Card>
        )}
      </YStack>
    );
  }
);

CollapsibleExerciseCard.displayName = 'CollapsibleExerciseCard';
