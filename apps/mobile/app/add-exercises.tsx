import { useState, useEffect, useMemo, useCallback } from 'react';
import { FlatList } from 'react-native';
import {
  YStack,
  XStack,
  Text,
  Button,
  Card,
  Input,
  Checkbox,
  H2,
  H4,
  H5,
} from '@my/ui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Search, ChevronLeft } from '@tamagui/lucide-icons';
import { SPOTTA_COLORS } from '../src/constants/colors';
import { workoutService } from '../src/features/workout/services/workoutService';
import { useWorkoutState } from '../src/features/workout/providers/WorkoutStateProvider';
import {
  FilterRow,
  AddExerciseModal,
} from '../src/features/workout/components';
import type { Exercise } from '../src/features/workout/types';
import type { ExerciseId } from '@spotta/shared';

// Optimized styles for performance
const safeAreaStyle = {
  flex: 1,
  backgroundColor: SPOTTA_COLORS.background,
} as const;

const backgroundStyle = {
  backgroundColor: SPOTTA_COLORS.background,
} as const;

export default function AddExercisesScreen() {
  const { mode, exerciseId } = useLocalSearchParams<{
    mode?: 'append' | 'empty' | 'template' | 'replace';
    exerciseId?: string;
  }>();
  const { state, actions } = useWorkoutState();

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<Set<ExerciseId>>(
    new Set()
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>('all');
  const [selectedEquipment, setSelectedEquipment] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateExerciseModal, setShowCreateExerciseModal] = useState(false);

  useEffect(() => {
    loadExercises();
  }, []);

  const loadExercises = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const exerciseData = await workoutService.getAllExercises();
      setExercises(exerciseData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load exercises');
    } finally {
      setIsLoading(false);
    }
  };

  // Get unique filter options from exercises
  const filterOptions = useMemo(() => {
    const categories = [...new Set(exercises.map((ex) => ex.category))].sort();
    const muscleGroups = [
      ...new Set(exercises.flatMap((ex) => ex.primaryMuscles)),
    ].sort();
    const equipment = [
      ...new Set(exercises.flatMap((ex) => ex.equipment)),
    ].sort();

    return { categories, muscleGroups, equipment };
  }, [exercises]);

  // Comprehensive filtering
  const filteredExercises = useMemo(() => {
    let filtered = exercises;

    // Filter out exercises already in active session (for append and replace modes)
    if (mode === 'append' || mode === 'replace') {
      const activeExerciseIds = new Set(
        state.activeSession?.exercises.map((ex) => ex.exercise.id) || []
      );
      filtered = filtered.filter(
        (exercise) => !activeExerciseIds.has(exercise.id)
      );
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (exercise) =>
          exercise.name.toLowerCase().includes(query) ||
          exercise.primaryMuscles.some((muscle) =>
            muscle.toLowerCase().includes(query)
          ) ||
          exercise.equipment.some((eq) => eq.toLowerCase().includes(query))
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(
        (exercise) => exercise.category === selectedCategory
      );
    }

    // Muscle group filter
    if (selectedMuscleGroup !== 'all') {
      filtered = filtered.filter((exercise) =>
        exercise.primaryMuscles.includes(selectedMuscleGroup)
      );
    }

    // Equipment filter
    if (selectedEquipment !== 'all') {
      filtered = filtered.filter((exercise) =>
        exercise.equipment.includes(selectedEquipment)
      );
    }

    return filtered;
  }, [
    exercises,
    mode,
    state.activeSession?.exercises,
    searchQuery,
    selectedCategory,
    selectedMuscleGroup,
    selectedEquipment,
  ]);

  const toggleExerciseSelection = useCallback(
    (exerciseId: ExerciseId) => {
      setSelectedExercises((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(exerciseId)) {
          newSet.delete(exerciseId);
        } else {
          // For replace mode, only allow single selection
          if (mode === 'replace') {
            return new Set([exerciseId]);
          } else {
            newSet.add(exerciseId);
          }
        }
        return newSet;
      });
    },
    [mode]
  );

  const handleCreateExerciseSuccess = (newExercise: Exercise) => {
    // Add the new exercise to our list and select it
    setExercises((prev) => [newExercise, ...prev]);
    setSelectedExercises(new Set([newExercise.id]));
  };

  const handleStart = async () => {
    if (selectedExercises.size === 0) return;

    // For replace mode, ensure only one exercise is selected
    if (mode === 'replace' && selectedExercises.size !== 1) {
      setError('Please select exactly one exercise to replace with');
      return;
    }

    try {
      setIsStarting(true);
      const exerciseIds = Array.from(selectedExercises);

      if (mode === 'empty') {
        // Start new session with selected exercises (empty workout flow)
        const session = await actions.startSessionWithExercises(
          exerciseIds,
          'Quick Workout'
        );
        // Navigate back to workout screen first, then open modal
        router.back();
        // Small delay to ensure back navigation completes
        setTimeout(() => {
          router.push(`/logging/${session.id}`);
        }, 100);
      } else if (mode === 'template') {
        // For original template mode, navigate to create-template screen
        router.push(
          `/create-template?exercises=${JSON.stringify(exerciseIds)}`
        );
      } else if (mode === 'replace' && exerciseId) {
        // Replace existing exercise with selected one in active session
        await actions.replaceExercise(exerciseId as ExerciseId, exerciseIds[0]);
        router.back(); // Return to logging screen
      } else {
        // Append mode - add exercises to current session
        await actions.appendExercises(exerciseIds);
        router.back(); // Return to logging screen
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start workout');
      setIsStarting(false);
    }
  };

  const renderExerciseItem = ({ item }: { item: Exercise }) => {
    const isSelected = selectedExercises.has(item.id);

    return (
      <Card
        padding="$4"
        backgroundColor={isSelected ? '$blue2' : '$gray2'}
        borderWidth={0}
        borderRadius="$4"
        marginBottom="$2"
        pressStyle={{ scale: 0.98 }}
        onPress={() => toggleExerciseSelection(item.id)}
        accessibilityLabel={`${item.name}, ${isSelected ? 'selected' : 'not selected'}`}
      >
        <XStack justifyContent="space-between" alignItems="center">
          <YStack flex={1} space="$2">
            <H4 color="white">{item.name}</H4>
            <XStack space="$2" flexWrap="wrap">
              {/* Category tag */}
              <XStack
                backgroundColor="$blue3"
                paddingHorizontal="$3"
                paddingVertical="$1.5"
                borderRadius="$6"
              >
                <H5 color="$blue11" textTransform="capitalize">
                  {item.category}
                </H5>
              </XStack>

              {/* Primary muscle tag - only first one */}
              {item.primaryMuscles.length > 0 && (
                <XStack
                  backgroundColor="$red3"
                  paddingHorizontal="$3"
                  paddingVertical="$1.5"
                  borderRadius="$6"
                >
                  <H5 color="$red11" textTransform="capitalize">
                    {item.primaryMuscles[0]}
                  </H5>
                </XStack>
              )}

              {/* Equipment tag - only first one */}
              {item.equipment.length > 0 && (
                <XStack
                  backgroundColor="$purple3"
                  paddingHorizontal="$3"
                  paddingVertical="$1.5"
                  borderRadius="$6"
                >
                  <H5 color="$purple11" textTransform="capitalize">
                    {item.equipment[0]}
                  </H5>
                </XStack>
              )}
            </XStack>
          </YStack>

          <Checkbox
            checked={isSelected}
            onCheckedChange={() => toggleExerciseSelection(item.id)}
            size="$4"
            backgroundColor={isSelected ? '$blue9' : 'transparent'}
            borderColor={isSelected ? '$blue9' : '$gray6'}
          >
            <Checkbox.Indicator />
          </Checkbox>
        </XStack>
      </Card>
    );
  };

  return (
    <SafeAreaView style={safeAreaStyle}>
      <YStack flex={1} style={backgroundStyle}>
        {/* Custom Header */}
        <XStack
          alignItems="center"
          justifyContent="space-between"
          paddingHorizontal="$4"
          paddingTop="$3"
          paddingBottom="$3"
        >
          <XStack alignItems="center" space="$2">
            <Button
              size="$3"
              chromeless
              onPress={() => router.back()}
              icon={<ChevronLeft size={24} />}
              accessibilityLabel="Go back"
            />
            <H2 color="white">Add Exercises</H2>
          </XStack>
          <Button
            size="$3"
            backgroundColor={SPOTTA_COLORS.purple}
            onPress={() => setShowCreateExerciseModal(true)}
            accessibilityLabel="Create exercise"
          >
            Create +
          </Button>
        </XStack>
        {/* Search */}
        <XStack padding="$4" paddingTop="$3" paddingBottom="$2">
          <XStack
            flex={1}
            alignItems="center"
            backgroundColor="$gray2"
            borderRadius="$3"
            paddingHorizontal="$3"
          >
            <Search size={16} color="$gray10" />
            <Input
              flex={1}
              placeholder="Search exercises by name, muscle, or equipment"
              value={searchQuery}
              onChangeText={setSearchQuery}
              borderWidth={0}
              backgroundColor="transparent"
              textAlignVertical="center"
              paddingVertical="$2"
              accessibilityLabel="Search exercises"
            />
          </XStack>
        </XStack>

        {/* Filters */}
        <YStack overflow="visible" zIndex={2}>
          <FilterRow
            categoryOptions={filterOptions.categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            muscleOptions={filterOptions.muscleGroups}
            selectedMuscle={selectedMuscleGroup}
            onMuscleChange={setSelectedMuscleGroup}
            equipmentOptions={filterOptions.equipment}
            selectedEquipment={selectedEquipment}
            onEquipmentChange={setSelectedEquipment}
            categoryPlaceholder="Category"
            musclePlaceholder="Muscle"
            equipmentPlaceholder="Equipment"
          />
        </YStack>

        {/* Filter Results Summary */}
        <XStack
          paddingHorizontal="$4"
          paddingBottom="$3"
          paddingTop="$5"
          justifyContent="space-between"
          alignItems="center"
          zIndex={1}
        >
          <Text fontSize="$2" color="$gray11">
            {filteredExercises.length} of {exercises.length} exercises
          </Text>
          {(selectedCategory !== 'all' ||
            selectedMuscleGroup !== 'all' ||
            selectedEquipment !== 'all') && (
            <Button
              size="$2"
              chromeless
              onPress={() => {
                setSelectedCategory('all');
                setSelectedMuscleGroup('all');
                setSelectedEquipment('all');
              }}
            >
              Clear filters
            </Button>
          )}
        </XStack>

        {/* Results */}
        {filteredExercises.length === 0 && !isLoading && searchQuery && (
          <YStack
            flex={1}
            justifyContent="center"
            alignItems="center"
            space="$3"
            padding="$4"
          >
            <Text fontSize="$4" textAlign="center">
              No exercises found for "{searchQuery}".
            </Text>
            <Button onPress={() => setSearchQuery('')}>Clear search</Button>
          </YStack>
        )}

        {/* Exercise List */}
        <YStack flex={1} paddingHorizontal="$4">
          <FlatList
            data={filteredExercises}
            renderItem={renderExerciseItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            getItemLayout={(data, index) => ({
              length: 80,
              offset: 80 * index,
              index,
            })}
          />
        </YStack>

        {/* Footer CTA */}
        {selectedExercises.size > 0 && (
          <XStack padding="$4" backgroundColor="$background">
            <Button
              flex={1}
              size="$4"
              backgroundColor="$green9"
              onPress={handleStart}
              disabled={isStarting}
            >
              {isStarting
                ? 'Starting...'
                : mode === 'empty'
                  ? `Start with ${selectedExercises.size} exercise${selectedExercises.size === 1 ? '' : 's'}`
                  : mode === 'template'
                    ? `Create template with ${selectedExercises.size} exercise${selectedExercises.size === 1 ? '' : 's'}`
                    : mode === 'replace'
                      ? selectedExercises.size === 1
                        ? 'Replace Exercise'
                        : 'Select 1 exercise to replace'
                      : `Add ${selectedExercises.size} exercise${selectedExercises.size === 1 ? '' : 's'}`}
            </Button>
          </XStack>
        )}

        {error && (
          <Card
            margin="$4"
            backgroundColor="$red2"
            borderColor="$red6"
            borderWidth={1}
            padding="$3"
          >
            <Text color="$red11">{error}</Text>
          </Card>
        )}

        {/* Create Exercise Modal */}
        <AddExerciseModal
          isOpen={showCreateExerciseModal}
          onClose={() => setShowCreateExerciseModal(false)}
          onSelect={(exercises) => {
            if (exercises.length > 0) {
              handleCreateExerciseSuccess(exercises[0]);
            }
          }}
        />
      </YStack>
    </SafeAreaView>
  );
}
