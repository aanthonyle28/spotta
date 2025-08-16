import { useState, useEffect, useMemo, useCallback } from 'react';
import { FlatList, TextInput } from 'react-native';
import { 
  YStack, 
  XStack, 
  H2, 
  Text, 
  Button, 
  Card, 
  Input,
  ScrollView,
  Checkbox
} from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Search, ChevronLeft, Plus } from '@tamagui/lucide-icons';
import { workoutService } from '../../src/features/workout/services/workoutService';
import { useWorkoutState } from '../../src/features/workout/hooks';
import type { Exercise } from '../../src/features/workout/types';
import type { ExerciseId } from '@spotta/shared';


export default function AddExercisesScreen() {
  const { mode, targetExerciseId } = useLocalSearchParams<{ 
    mode?: 'append' | 'empty' | 'template'; 
    targetExerciseId?: string;
  }>();
  const { actions } = useWorkoutState();
  
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<Set<ExerciseId>>(new Set());
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
    const categories = [...new Set(exercises.map(ex => ex.category))].sort();
    const muscleGroups = [...new Set(exercises.flatMap(ex => ex.primaryMuscles))].sort();
    const equipment = [...new Set(exercises.flatMap(ex => ex.equipment))].sort();
    
    return { categories, muscleGroups, equipment };
  }, [exercises]);

  // Comprehensive filtering
  const filteredExercises = useMemo(() => {
    let filtered = exercises;
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(exercise => 
        exercise.name.toLowerCase().includes(query) ||
        exercise.primaryMuscles.some(muscle => muscle.toLowerCase().includes(query)) ||
        exercise.equipment.some(eq => eq.toLowerCase().includes(query))
      );
    }
    
    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(exercise => exercise.category === selectedCategory);
    }
    
    // Muscle group filter
    if (selectedMuscleGroup !== 'all') {
      filtered = filtered.filter(exercise => 
        exercise.primaryMuscles.includes(selectedMuscleGroup)
      );
    }
    
    // Equipment filter
    if (selectedEquipment !== 'all') {
      filtered = filtered.filter(exercise => 
        exercise.equipment.includes(selectedEquipment)
      );
    }
    
    return filtered;
  }, [exercises, searchQuery, selectedCategory, selectedMuscleGroup, selectedEquipment]);


  const toggleExerciseSelection = useCallback((exerciseId: ExerciseId) => {
    setSelectedExercises(prev => {
      const newSet = new Set(prev);
      if (newSet.has(exerciseId)) {
        newSet.delete(exerciseId);
      } else {
        newSet.add(exerciseId);
      }
      return newSet;
    });
  }, []);

  const handleStart = async () => {
    if (selectedExercises.size === 0) return;

    try {
      setIsStarting(true);
      const exerciseIds = Array.from(selectedExercises);
      
      if (mode === 'empty') {
        // Start new session with selected exercises (empty workout flow)
        const session = await actions.startSessionWithExercises(exerciseIds, 'Quick Workout');
        router.push(`/workout/logging/${session.id}` as any);
      } else if (mode === 'template') {
        // For template mode, we'll show save options first
        // For now, just start the session
        const session = await actions.startSessionWithExercises(exerciseIds, 'New Template Workout');
        router.push(`/workout/logging/${session.id}` as any);
      } else {
        // Append mode - navigate back with selected exercises
        // This would typically pass data back to the calling screen
        router.back();
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
        backgroundColor={isSelected ? "$blue2" : "$gray1"}
        borderColor={isSelected ? "$blue6" : "$gray4"}
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
              <Text fontSize="$2" color="$gray10">•</Text>
              <Text fontSize="$2" color="$gray10">
                {item.primaryMuscles.join(', ')}
              </Text>
            </XStack>
          </YStack>
          
          <Checkbox 
            checked={isSelected}
            onCheckedChange={() => toggleExerciseSelection(item.id)}
            size="$4"
          />
        </XStack>
      </Card>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <YStack flex={1}>
        {/* Header Actions */}
        <XStack padding="$4" justifyContent="flex-end">
          <Button
            size="$3"
            chromeless
            onPress={() => router.push('/workout/create-exercise' as any)}
            icon={<Plus size={20} />}
            accessibilityLabel="Create exercise"
          />
        </XStack>

        {/* Search */}
        <XStack padding="$4" paddingTop="$0">
          <XStack flex={1} alignItems="center" backgroundColor="$gray2" borderRadius="$3" paddingHorizontal="$3">
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
        <YStack paddingHorizontal="$4" paddingBottom="$3" space="$3">
          {/* Category Filters */}
          <YStack space="$2">
            <Text fontSize="$3" fontWeight="500">Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <XStack space="$2">
                <Button
                  size="$2"
                  backgroundColor={selectedCategory === 'all' ? '$blue9' : '$gray4'}
                  color={selectedCategory === 'all' ? 'white' : '$gray11'}
                  onPress={() => setSelectedCategory('all')}
                >
                  All
                </Button>
                {filterOptions.categories.map(category => (
                  <Button
                    key={category}
                    size="$2"
                    backgroundColor={selectedCategory === category ? '$blue9' : '$gray4'}
                    color={selectedCategory === category ? 'white' : '$gray11'}
                    onPress={() => setSelectedCategory(category)}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </Button>
                ))}
              </XStack>
            </ScrollView>
          </YStack>

          {/* Muscle Group Filters */}
          <YStack space="$2">
            <Text fontSize="$3" fontWeight="500">Muscle Group</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <XStack space="$2">
                <Button
                  size="$2"
                  backgroundColor={selectedMuscleGroup === 'all' ? '$blue9' : '$gray4'}
                  color={selectedMuscleGroup === 'all' ? 'white' : '$gray11'}
                  onPress={() => setSelectedMuscleGroup('all')}
                >
                  All
                </Button>
                {filterOptions.muscleGroups.map(muscle => (
                  <Button
                    key={muscle}
                    size="$2"
                    backgroundColor={selectedMuscleGroup === muscle ? '$blue9' : '$gray4'}
                    color={selectedMuscleGroup === muscle ? 'white' : '$gray11'}
                    onPress={() => setSelectedMuscleGroup(muscle)}
                  >
                    {muscle}
                  </Button>
                ))}
              </XStack>
            </ScrollView>
          </YStack>

          {/* Equipment Filters */}
          <YStack space="$2">
            <Text fontSize="$3" fontWeight="500">Equipment</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <XStack space="$2">
                <Button
                  size="$2"
                  backgroundColor={selectedEquipment === 'all' ? '$blue9' : '$gray4'}
                  color={selectedEquipment === 'all' ? 'white' : '$gray11'}
                  onPress={() => setSelectedEquipment('all')}
                >
                  All
                </Button>
                {filterOptions.equipment.map(equip => (
                  <Button
                    key={equip}
                    size="$2"
                    backgroundColor={selectedEquipment === equip ? '$blue9' : '$gray4'}
                    color={selectedEquipment === equip ? 'white' : '$gray11'}
                    onPress={() => setSelectedEquipment(equip)}
                  >
                    {equip}
                  </Button>
                ))}
              </XStack>
            </ScrollView>
          </YStack>

          {/* Filter Results Summary */}
          <XStack justifyContent="space-between" alignItems="center">
            <Text fontSize="$2" color="$gray11">
              {filteredExercises.length} of {exercises.length} exercises
            </Text>
            {(selectedCategory !== 'all' || selectedMuscleGroup !== 'all' || selectedEquipment !== 'all') && (
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
        </YStack>

        {/* Results */}
        {filteredExercises.length === 0 && !isLoading && searchQuery && (
          <YStack flex={1} justifyContent="center" alignItems="center" space="$3" padding="$4">
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
                    : `Add ${selectedExercises.size} exercise${selectedExercises.size === 1 ? '' : 's'}`
              }
            </Button>
          </XStack>
        )}

        {error && (
          <Card margin="$4" backgroundColor="$red2" borderColor="$red6" borderWidth={1} padding="$3">
            <Text color="$red11">{error}</Text>
          </Card>
        )}
      </YStack>
    </SafeAreaView>
  );
}