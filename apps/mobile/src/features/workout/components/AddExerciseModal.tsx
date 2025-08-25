import { useState, useEffect, useMemo, useCallback } from 'react';
import { FlatList } from 'react-native';
import { YStack, XStack, Text, Button, Card, Input, Checkbox, Sheet } from 'tamagui';
import { Search, X } from '@tamagui/lucide-icons';
import { workoutService } from '../services/workoutService';
import { FilterRow } from './FilterRow';
import type { Exercise } from '../types';
import type { ExerciseId } from '@spotta/shared';

interface AddExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (exercises: Exercise[]) => void;
  currentExercises?: ExerciseId[];
  mode?: 'add' | 'replace';
}

export function AddExerciseModal({
  isOpen,
  onClose,
  onSelect,
  currentExercises = [],
  mode = 'add',
}: AddExerciseModalProps) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<Set<ExerciseId>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>('all');
  const [selectedEquipment, setSelectedEquipment] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadExercises();
    }
  }, [isOpen]);

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

  const handleClose = () => {
    setSelectedExercises(new Set());
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedMuscleGroup('all');
    setSelectedEquipment('all');
    setError(null);
    onClose();
  };

  const handleSelect = () => {
    const selectedExerciseObjects = exercises.filter(ex => selectedExercises.has(ex.id));
    onSelect(selectedExerciseObjects);
    handleClose();
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

    // Filter out current exercises if in add mode
    if (mode === 'add') {
      filtered = filtered.filter(ex => !currentExercises.includes(ex.id));
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
    currentExercises,
    mode,
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
    <Sheet 
      open={isOpen} 
      onOpenChange={handleClose} 
      modal 
      snapPointsMode="percent"
      snapPoints={[85]}
      dismissOnSnapToBottom={false}
      disableDrag={true}
    >
      <Sheet.Overlay backgroundColor="rgba(0, 0, 0, 0.5)" />
      <Sheet.Frame
        backgroundColor="$background"
        borderTopLeftRadius="$6"
        borderTopRightRadius="$6"
        paddingBottom="$4"
      >
        <YStack flex={1}>
          {/* Header */}
          <XStack
            justifyContent="space-between"
            alignItems="center"
            padding="$4"
            paddingBottom="$3"
            borderBottomWidth={1}
            borderBottomColor="$gray4"
          >
            <Text fontSize="$6" fontWeight="600">
              {mode === 'replace' ? 'Replace Exercise' : 'Add Exercises'}
            </Text>
            <Button
              size="$3"
              chromeless
              onPress={handleClose}
              icon={<X size={20} />}
              accessibilityLabel="Close modal"
            />
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

          {/* Loading State */}
          {isLoading && (
            <YStack
              flex={1}
              justifyContent="center"
              alignItems="center"
              padding="$4"
            >
              <Text fontSize="$4" color="$gray10">
                Loading exercises...
              </Text>
            </YStack>
          )}

          {/* Empty State */}
          {!isLoading && filteredExercises.length === 0 && searchQuery && (
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
          {!isLoading && filteredExercises.length > 0 && (
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
          )}

          {/* Footer CTA */}
          {selectedExercises.size > 0 && (
            <XStack 
              padding="$4" 
              paddingBottom="$6" 
              backgroundColor="$background"
              borderTopWidth={1}
              borderTopColor="$gray4"
            >
              <Button
                flex={1}
                size="$4"
                backgroundColor="$green9"
                onPress={handleSelect}
              >
                {mode === 'replace'
                  ? selectedExercises.size === 1
                    ? 'Replace Exercise'
                    : 'Select 1 exercise to replace'
                  : `Add ${selectedExercises.size} exercise${selectedExercises.size === 1 ? '' : 's'}`}
              </Button>
            </XStack>
          )}

          {/* Error Display */}
          {error && (
            <Card
              margin="$4"
              backgroundColor="$red2"
              borderColor="$red6"
              borderWidth={1}
              padding="$3"
            >
              <XStack justifyContent="space-between" alignItems="center">
                <Text color="$red11" flex={1}>{error}</Text>
                <Button
                  size="$2"
                  chromeless
                  onPress={() => setError(null)}
                  icon={<X size={16} />}
                />
              </XStack>
            </Card>
          )}
        </YStack>
      </Sheet.Frame>
    </Sheet>
  );
}