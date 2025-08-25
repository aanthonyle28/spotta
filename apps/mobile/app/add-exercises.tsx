import { useState, useEffect, useMemo, useCallback } from 'react';
import { FlatList } from 'react-native';
import { YStack, XStack, Text, Button, Card, Input, Checkbox } from 'tamagui';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Search, ChevronLeft } from '@tamagui/lucide-icons';
import { workoutService } from '../src/features/workout/services/workoutService';
import { useWorkoutState } from '../src/features/workout/providers/WorkoutStateProvider';
import {
  FilterRow,
} from '../src/features/workout/components';
import type { Exercise, Template } from '../src/features/workout/types';
import type { ExerciseId } from '@spotta/shared';

export default function AddExercisesScreen() {
  const { mode, exerciseId } = useLocalSearchParams<{
    mode?: 'append' | 'empty' | 'template' | 'replace';
    exerciseId?: string;
  }>();
  const { actions } = useWorkoutState();
  const insets = useSafeAreaInsets();

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
        router.push(`/logging/${session.id}`);
      } else if (mode === 'template') {
        // For original template mode, navigate to create-template screen
        router.push(`/create-template?exercises=${JSON.stringify(exerciseIds)}` as any);
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
        padding="$3"
        backgroundColor={isSelected ? '$blue2' : '$gray1'}
        borderColor={isSelected ? '$blue6' : '$gray4'}
        borderWidth={1}
        marginBottom="$2"
        pressStyle={{ scale: 0.98 }}
        onPress={() => toggleExerciseSelection(item.id)}
        accessibilityLabel={`${item.name}, ${isSelected ? 'selected' : 'not selected'}`}
      >
        <XStack justifyContent="space-between" alignItems="center">
          <YStack flex={1} space="$1">
            <Text fontSize="$4" fontWeight="500">
              {item.name}
            </Text>
            <XStack space="$2" flexWrap="wrap">
              <Text fontSize="$2" color="$gray10" textTransform="capitalize">
                {item.difficulty}
              </Text>
              <Text fontSize="$2" color="$gray10">
                •
              </Text>
              <Text fontSize="$2" color="$gray10">
                {item.primaryMuscles.join(', ')}
              </Text>
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
    <SafeAreaView style={{ flex: 1 }}>
      <YStack flex={1}>
        {/* Custom Header */}
        <YStack
          paddingTop={insets.top - 40}
          paddingHorizontal="$4"
          paddingBottom="$2"
          backgroundColor="$background"
          borderBottomWidth={1}
          borderBottomColor="$gray4"
        >
          <XStack alignItems="center" minHeight={44}>
            <Button
              size="$3"
              chromeless
              onPress={() => router.back()}
              icon={<ChevronLeft size={20} />}
              accessibilityLabel="Go back"
            />
            <Text fontSize="$6" fontWeight="600" marginLeft="$3">
              Add Exercises
            </Text>
            <XStack flex={1} justifyContent="flex-end">
              <Button
                size="$3"
                backgroundColor="$green9"
                onPress={() => router.push('/create-exercise')}
                accessibilityLabel="Create exercise"
              >
                Create +
              </Button>
            </XStack>
          </XStack>
        </YStack>
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

      </YStack>
    </SafeAreaView>
  );
}
