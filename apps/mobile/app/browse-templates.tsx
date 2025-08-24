import { useState, useEffect, useMemo, useCallback } from 'react';
import { FlatList } from 'react-native';
import { YStack, XStack, Text, Button, Card, Input } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Search, ChevronLeft, Download } from '@tamagui/lucide-icons';
import { workoutService } from '../src/features/workout/services/workoutService';
import { useWorkoutState } from '../src/features/workout/hooks';
import { CustomHeader, FilterRow } from '../src/features/workout/components';
import type { CommunityTemplate } from '../src/features/workout/types';

export default function BrowseTemplatesScreen() {
  const { actions } = useWorkoutState();

  const [templates, setTemplates] = useState<CommunityTemplate[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedFocus, setSelectedFocus] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCommunityTemplates();
  }, []);

  const loadCommunityTemplates = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const templateData = await workoutService.getCommunityTemplates();
      setTemplates(templateData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load templates');
    } finally {
      setIsLoading(false);
    }
  };

  // Get unique filter options from templates
  const filterOptions = useMemo(() => {
    const categories = [
      ...new Set(templates.flatMap((t) => t.exercises.map((e) => e.category))),
    ].sort();
    const difficulties = [
      ...new Set(templates.map((t) => t.difficulty)),
    ].sort();
    const focuses = [
      ...new Set(
        templates.flatMap((t) => t.exercises.flatMap((e) => e.primaryMuscles))
      ),
    ].sort();

    return { categories, difficulties, focuses };
  }, [templates]);

  // Comprehensive filtering
  const filteredTemplates = useMemo(() => {
    let filtered = templates;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (template) =>
          template.title.toLowerCase().includes(query) ||
          template.author.toLowerCase().includes(query) ||
          template.tags?.some((tag) => tag.toLowerCase().includes(query)) ||
          template.exercises.some(
            (ex) =>
              ex.name.toLowerCase().includes(query) ||
              ex.primaryMuscles.some((muscle) =>
                muscle.toLowerCase().includes(query)
              )
          )
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((template) =>
        template.exercises.some((ex) => ex.category === selectedCategory)
      );
    }

    // Difficulty filter
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(
        (template) => template.difficulty === selectedDifficulty
      );
    }

    // Focus filter
    if (selectedFocus !== 'all') {
      filtered = filtered.filter((template) =>
        template.exercises.some((ex) =>
          ex.primaryMuscles.includes(selectedFocus)
        )
      );
    }

    return filtered;
  }, [
    templates,
    searchQuery,
    selectedCategory,
    selectedDifficulty,
    selectedFocus,
  ]);

  const handleStartTemplate = async (templateId: string) => {
    try {
      const session = await actions.startFromTemplate(templateId);
      router.push(`/logging/${session.id}` as any);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start workout');
    }
  };

  const handlePreviewTemplate = (templateId: string) => {
    router.push(`/template/${templateId}?source=community` as any);
  };

  const renderTemplateItem = ({ item }: { item: CommunityTemplate }) => {
    return (
      <Card
        padding="$4"
        backgroundColor="$gray1"
        borderColor="$gray4"
        borderWidth={1}
        marginBottom="$3"
        pressStyle={{ scale: 0.98 }}
        onPress={() => handlePreviewTemplate(item.id)}
        accessibilityLabel={`Template: ${item.title} by ${item.author}`}
      >
        <YStack space="$3">
          <YStack space="$2">
            <Text fontSize="$5" fontWeight="600" numberOfLines={2}>
              {item.title}
            </Text>
            <Text fontSize="$3" color="$gray10">
              by {item.author}
            </Text>
          </YStack>

          <XStack space="$3" alignItems="center">
            <Text fontSize="$2" color="$gray10">
              {item.exercises.length} exercises
            </Text>
            <Text fontSize="$2" color="$gray8">
              •
            </Text>
            <Text fontSize="$2" color="$gray10" textTransform="capitalize">
              {item.difficulty}
            </Text>
          </XStack>

          <XStack
            space="$4"
            alignItems="flex-end"
            justifyContent="space-between"
          >
            <XStack space="$2" alignItems="center">
              <Download size={12} color="white" />
              <Text fontSize="$2" color="$gray10" lineHeight="$1">
                {item.saves} saved
              </Text>
            </XStack>

            <Button
              size="$3"
              backgroundColor="$blue9"
              onPress={(e) => {
                e.stopPropagation();
                handleStartTemplate(item.id);
              }}
              accessibilityLabel={`Start ${item.title} template`}
            >
              Start
            </Button>
          </XStack>
        </YStack>
      </Card>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <YStack flex={1}>
        {/* Custom Header */}
        <CustomHeader
          title="Browse Templates"
          leftAction={
            <Button
              size="$3"
              chromeless
              onPress={() => router.back()}
              icon={<ChevronLeft size={20} />}
              accessibilityLabel="Go back"
            />
          }
        />

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
              placeholder="Search templates by name, exercise, or focus"
              value={searchQuery}
              onChangeText={setSearchQuery}
              borderWidth={0}
              backgroundColor="transparent"
              accessibilityLabel="Search templates"
            />
          </XStack>
        </XStack>

        {/* Filters */}
        <YStack overflow="visible" zIndex={2}>
          <FilterRow
            categoryOptions={filterOptions.categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            muscleOptions={filterOptions.focuses}
            selectedMuscle={selectedFocus}
            onMuscleChange={setSelectedFocus}
            equipmentOptions={filterOptions.difficulties}
            selectedEquipment={selectedDifficulty}
            onEquipmentChange={setSelectedDifficulty}
            categoryPlaceholder="Category"
            musclePlaceholder="Focus"
            equipmentPlaceholder="Difficulty"
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
            {filteredTemplates.length} of {templates.length} templates
          </Text>
          {(selectedCategory !== 'all' ||
            selectedDifficulty !== 'all' ||
            selectedFocus !== 'all') && (
            <Button
              size="$2"
              chromeless
              onPress={() => {
                setSelectedCategory('all');
                setSelectedDifficulty('all');
                setSelectedFocus('all');
              }}
            >
              Clear filters
            </Button>
          )}
        </XStack>

        {/* Empty Search Results */}
        {filteredTemplates.length === 0 && !isLoading && searchQuery && (
          <YStack
            flex={1}
            justifyContent="center"
            alignItems="center"
            space="$3"
            padding="$4"
          >
            <Text fontSize="$4" textAlign="center">
              No templates found for "{searchQuery}".
            </Text>
            <Button onPress={() => setSearchQuery('')}>Clear search</Button>
          </YStack>
        )}

        {/* Empty State */}
        {templates.length === 0 && !isLoading && !error && (
          <YStack
            flex={1}
            justifyContent="center"
            alignItems="center"
            space="$3"
            padding="$4"
          >
            <Text fontSize="$5" fontWeight="600" textAlign="center">
              Discover Community Templates
            </Text>
            <Text fontSize="$3" color="$gray10" textAlign="center">
              Browse workout templates created by the community
            </Text>
            <Button onPress={loadCommunityTemplates}>Retry</Button>
          </YStack>
        )}

        {/* Loading State */}
        {isLoading && (
          <YStack
            flex={1}
            justifyContent="center"
            alignItems="center"
            padding="$4"
          >
            <Text fontSize="$4" color="$gray10">
              Loading templates...
            </Text>
          </YStack>
        )}

        {/* Templates List */}
        {!isLoading && filteredTemplates.length > 0 && (
          <YStack flex={1} paddingHorizontal="$4">
            <FlatList
              data={filteredTemplates}
              renderItem={renderTemplateItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              getItemLayout={(data, index) => ({
                length: 140,
                offset: 140 * index,
                index,
              })}
            />
          </YStack>
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
            <Text color="$red11">{error}</Text>
            <Button
              size="$2"
              marginTop="$2"
              variant="outlined"
              onPress={() => {
                setError(null);
                loadCommunityTemplates();
              }}
            >
              Retry
            </Button>
          </Card>
        )}
      </YStack>
    </SafeAreaView>
  );
}
