import {
  YStack,
  XStack,
  H1,
  H3,
  Text,
  Button,
  Card,
  ScrollView,
} from 'tamagui';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowUpDown } from '@tamagui/lucide-icons';
import { useWorkoutState } from '../../src/features/workout/providers/WorkoutStateProvider';
import {
  StartEmptyButton,
  RoutineCarousel,
  BrowseExercisesTile,
  BrowseTemplatesTile,
  ReorderTemplatesModal,
  WorkoutConflictModal,
} from '../../src/features/workout/components';
import type { Template } from '../../src/features/workout/types';

export default function WorkoutStartScreen() {
  const { state, actions, hasActiveSession } = useWorkoutState();
  const [isReorderModalOpen, setIsReorderModalOpen] = useState(false);
  const [isConflictModalOpen, setIsConflictModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const handleStartEmpty = () => {
    if (hasActiveSession) {
      setPendingAction(
        () => () => router.push('/add-exercises?mode=empty' as any)
      );
      setIsConflictModalOpen(true);
      return;
    }
    router.push('/add-exercises?mode=empty' as any);
  };

  const handleStartTemplate = async (templateId: string) => {
    if (hasActiveSession) {
      setPendingAction(() => async () => {
        try {
          const session = await actions.startFromTemplate(templateId);
          router.push(`/logging/${session.id}` as any);
        } catch (error) {
          console.error('Failed to start workout from template:', error);
        }
      });
      setIsConflictModalOpen(true);
      return;
    }

    try {
      const session = await actions.startFromTemplate(templateId);
      router.push(`/logging/${session.id}` as any);
    } catch (error) {
      console.error('Failed to start workout from template:', error);
    }
  };

  const handleTemplatePreview = (templateId: string) => {
    router.push(`/template/${templateId}` as any);
  };

  const handleAddTemplate = () => {
    router.push('/add-exercises?mode=template' as any);
  };

  const handleEditTemplate = (templateId: string) => {
    console.log('Edit template:', templateId);
    // TODO: Navigate to edit template screen
  };

  const handleDeleteTemplate = (templateId: string) => {
    console.log('Delete template:', templateId);
    // TODO: Show confirmation dialog and delete template
  };

  const handleDuplicateTemplate = (templateId: string) => {
    console.log('Duplicate template:', templateId);
    // TODO: Create copy of template
  };

  const handleShareTemplate = (templateId: string) => {
    console.log('Share template:', templateId);
    // TODO: Open share sheet
  };

  const handleBrowseTemplates = () => {
    router.push('/browse-templates' as any);
  };

  const handleReorderTemplates = () => {
    setIsReorderModalOpen(true);
  };

  const handleSaveReorderedTemplates = (reorderedTemplates: Template[]) => {
    console.log('Save reordered templates:', reorderedTemplates);
    // TODO: Update templates order in state/backend
    // For now, this just shows the modal works correctly
  };

  const handleResumeWorkout = () => {
    if (state.activeSession) {
      router.push(`/logging/${state.activeSession.id}` as any);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView>
        <YStack flex={1} padding="$4" space="$4">
          <H1>Workout</H1>

          {/* Start Empty CTA */}
          <StartEmptyButton
            onPress={handleStartEmpty}
            disabled={state.isLoading}
          />

          {/* Routine Carousel */}
          <YStack space="$3">
            <XStack justifyContent="space-between" alignItems="center">
              <H3>Templates</H3>
              <Button
                size="$2"
                chromeless
                onPress={handleReorderTemplates}
                padding="$2"
                accessibilityLabel="Reorder templates"
              >
                <ArrowUpDown size={18} color="$gray10" />
              </Button>
            </XStack>
            <RoutineCarousel
              routines={state.templates || []}
              onStart={handleStartTemplate}
              onTemplatePreview={handleTemplatePreview}
              onAddTemplate={handleAddTemplate}
              onEditTemplate={handleEditTemplate}
              onDeleteTemplate={handleDeleteTemplate}
              onDuplicateTemplate={handleDuplicateTemplate}
              onShareTemplate={handleShareTemplate}
            />
          </YStack>

          {/* Browse Exercises */}
          <BrowseExercisesTile
            onPress={() => router.push('/add-exercises?mode=append' as any)}
          />

          {/* Browse Templates */}
          <BrowseTemplatesTile onPress={handleBrowseTemplates} />

          {/* Error Display */}
          {state.error && (
            <Card
              backgroundColor="$red2"
              borderColor="$red6"
              borderWidth={1}
              padding="$3"
            >
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

      {/* Conflict Modal */}
      <WorkoutConflictModal
        isOpen={isConflictModalOpen}
        activeSession={state.activeSession}
        onClose={() => {
          setIsConflictModalOpen(false);
          setPendingAction(null);
        }}
        onResume={handleResumeWorkout}
        onStartNew={async () => {
          try {
            if (state.activeSession) {
              await actions.discardSession();
            }
            if (pendingAction) {
              await pendingAction();
              setPendingAction(null);
            }
          } catch (error) {
            console.error('Failed to start new workout:', error);
          }
        }}
      />

      {/* Reorder Templates Modal */}
      <ReorderTemplatesModal
        isOpen={isReorderModalOpen}
        templates={state.templates || []}
        onClose={() => setIsReorderModalOpen(false)}
        onSave={handleSaveReorderedTemplates}
      />
    </SafeAreaView>
  );
}
