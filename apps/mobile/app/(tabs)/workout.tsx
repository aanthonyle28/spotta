import { YStack, XStack, H1, H3, H4, Text, Button, Card, ScrollView } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Play, Clock, Calendar, Plus, Search } from '@tamagui/lucide-icons';
import { useWorkoutState } from '../../src/features/workout/hooks';
import { StartEmptyButton, RoutineCarousel, BrowseExercisesTile } from '../../src/features/workout/components';

export default function WorkoutStartScreen() {
  const { state, actions } = useWorkoutState();

  const handleStartEmpty = () => {
    router.push('/workout/add?mode=empty' as any);
  };

  const handleStartTemplate = async (templateId: string) => {
    try {
      const session = await actions.startFromTemplate(templateId);
      router.push(`/workout/logging/${session.id}` as any);
    } catch (error) {
      console.error('Failed to start workout from template:', error);
    }
  };

  const handleTemplatePreview = (templateId: string) => {
    router.push(`/workout/template/${templateId}` as any);
  };

  const handleAddTemplate = () => {
    router.push('/workout/add?mode=template' as any);
  };

  const handleResumeWorkout = () => {
    if (state.activeSession) {
      router.push(`/workout/logging/${state.activeSession.id}` as any);
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView>
        <YStack flex={1} padding="$4" space="$4">
          <H1>Workout</H1>
          
          {/* Start Empty CTA */}
          <StartEmptyButton onPress={handleStartEmpty} disabled={state.isLoading} />
          
          {/* Routine Carousel */}
          <YStack space="$3">
            <H3>Templates</H3>
            <RoutineCarousel 
              routines={state.templates || []} 
              onStart={handleStartTemplate}
              onTemplatePreview={handleTemplatePreview}
              onAddTemplate={handleAddTemplate}
            />
          </YStack>
          
          {/* Browse Exercises */}
          <BrowseExercisesTile onPress={() => router.push('/workout/add?mode=append' as any)} />
          
          {/* Error Display */}
          {state.error && (
            <Card backgroundColor="$red2" borderColor="$red6" borderWidth={1} padding="$3">
              <Text color="$red11">{state.error}</Text>
              <Button 
                size="$2" 
                marginTop="$2" 
                variant="outlined"
                onPress={actions.clearError}
              >
                Dismiss
              </Button>
            </Card>
          )}
          
        </YStack>
      </ScrollView>
    </SafeAreaView>
  );
}