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
import { Share } from 'react-native';
import { router } from 'expo-router';
import { ArrowUpDown } from '@tamagui/lucide-icons';
import { useWorkoutState } from '../../src/features/workout/providers/WorkoutStateProvider';
import { logger } from '../../src/utils/logger';
import {
  StartEmptyButton,
  RoutineCarousel,
  BrowseExercisesTile,
  BrowseTemplatesTile,
  ReorderTemplatesModal,
  WorkoutConflictModal,
  FriendsTrainingBanner,
} from '../../src/features/workout/components';
import type { Template } from '../../src/features/workout/types';
import type { TemplateId } from '@spotta/shared';
import type { Friend } from '../../src/services/friendsService';
import { SPOTTA_COLORS } from '../../src/constants/colors';

export default function WorkoutStartScreen() {
  const { state, actions, hasActiveSession } = useWorkoutState();
  const [isReorderModalOpen, setIsReorderModalOpen] = useState(false);
  const [isConflictModalOpen, setIsConflictModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  // Mock friends data for Phase 1 with circle avatars
  const mockFriends: Friend[] = [
    { id: '1', name: 'Alex', avatarUrl: 'https://i.pravatar.cc/150?img=1' },
    { id: '2', name: 'Sarah', avatarUrl: 'https://i.pravatar.cc/150?img=2' },
    { id: '3', name: 'Mike', avatarUrl: 'https://i.pravatar.cc/150?img=3' },
    { id: '4', name: 'Emma', avatarUrl: 'https://i.pravatar.cc/150?img=4' },
    { id: '5', name: 'John', avatarUrl: 'https://i.pravatar.cc/150?img=5' },
  ];

  const handleStartEmpty = () => {
    if (hasActiveSession) {
      setPendingAction(() => () => router.push('/add-exercises?mode=empty'));
      setIsConflictModalOpen(true);
      return;
    }
    router.push('/add-exercises?mode=empty');
  };

  const handleStartTemplate = async (templateId: string) => {
    if (hasActiveSession) {
      setPendingAction(() => async () => {
        try {
          const session = await actions.startFromTemplate(
            templateId as TemplateId
          );
          router.push(`/logging/${session.id}`);
        } catch (error) {
          logger.error('Failed to start workout from template:', error);
        }
      });
      setIsConflictModalOpen(true);
      return;
    }

    try {
      const session = await actions.startFromTemplate(templateId as TemplateId);
      router.push(`/logging/${session.id}`);
    } catch (error) {
      console.error('Failed to start workout from template:', error);
    }
  };

  const handleTemplatePreview = (templateId: string) => {
    router.push(`/template/${templateId}`);
  };

  const handleAddTemplate = () => {
    router.push('/create-template');
  };

  const handleEditTemplate = (templateId: string) => {
    router.push(`/edit-template/${templateId}`);
  };

  const handleDeleteTemplate = (templateId: string) => {
    logger.info('Delete template:', templateId);
    // TODO: Show confirmation dialog and delete template
  };

  const handleDuplicateTemplate = async (templateId: string) => {
    try {
      await actions.duplicateTemplate(templateId as TemplateId);
      logger.info('Template duplicated successfully');
    } catch (error) {
      logger.error('Failed to duplicate template:', error);
    }
  };

  const handleShareTemplate = async (templateId: string) => {
    try {
      const template = state.templates?.find((t) => t.id === templateId);
      if (!template) {
        logger.error('Template not found for sharing:', templateId);
        return;
      }

      const exerciseList = template.exercises
        .map(
          (ex, index) =>
            `${index + 1}. ${ex.name} (${ex.sets} sets${ex.reps ? ` × ${ex.reps} reps` : ''})`
        )
        .join('\n');

      const shareContent = {
        title: `Workout Template: ${template.title}`,
        message: `Check out this workout template!\n\n📋 ${template.title}\n${template.description ? `\n📝 ${template.description}\n` : ''}\n💪 Exercises:\n${exerciseList}\n\n⏱️ ${template.estimatedDuration} min • ${template.difficulty.charAt(0).toUpperCase() + template.difficulty.slice(1)}\n\nCreated with Spotta`,
      };

      await Share.share(shareContent);
      logger.info('Template shared:', template.title);
    } catch (error) {
      logger.error('Failed to share template:', error);
    }
  };

  const handleBrowseTemplates = () => {
    router.push('/browse-templates');
  };

  const handleReorderTemplates = () => {
    setIsReorderModalOpen(true);
  };

  const handleSaveReorderedTemplates = (reorderedTemplates: Template[]) => {
    logger.info('Save reordered templates:', reorderedTemplates);
    // TODO: Update templates order in state/backend
    // For now, this just shows the modal works correctly
  };

  const handleResumeWorkout = () => {
    if (state.activeSession) {
      router.push(`/logging/${state.activeSession.id}`);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: SPOTTA_COLORS.background }}>
      <ScrollView>
        <YStack flex={1} padding="$4" space="$4" backgroundColor={SPOTTA_COLORS.background}>
          <H1 color="white">Workout</H1>

          {/* Friends Training Banner */}
          <FriendsTrainingBanner friends={mockFriends} />

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

          {/* Discover Section - Two Column Layout */}
          <YStack space="$3">
            <Text fontSize="$5" fontWeight="600" color="white">
              Discover
            </Text>
            <XStack space="$3">
              <YStack flex={1}>
                <BrowseExercisesTile
                  onPress={() => router.push('/add-exercises?mode=append')}
                />
              </YStack>
              <YStack flex={1}>
                <BrowseTemplatesTile onPress={handleBrowseTemplates} />
              </YStack>
            </XStack>
          </YStack>

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
            logger.error('Failed to start new workout:', error);
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
