import { useState } from 'react';
import {
  YStack,
  XStack,
  Sheet,
  Button,
  Text,
  Input,
  Label,
  Card,
  ScrollView,
} from 'tamagui';
import { X, Target } from '@tamagui/lucide-icons';
import type { Exercise, Template, TemplateExercise } from '../types';

interface CreateTemplateModalProps {
  isOpen: boolean;
  selectedExercises: Exercise[];
  onClose: () => void;
  onSave: (templateData: Omit<Template, 'id' | 'userId'>) => Promise<void>;
}

interface TemplateForm {
  title: string;
  description: string;
}

export function CreateTemplateModal({
  isOpen,
  selectedExercises,
  onClose,
  onSave,
}: CreateTemplateModalProps) {
  const [form, setForm] = useState<TemplateForm>({
    title: '',
    description: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showTitleError, setShowTitleError] = useState(false);

  const updateForm = <K extends keyof TemplateForm>(
    key: K,
    value: TemplateForm[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (key === 'title' && showTitleError) {
      setShowTitleError(false);
    }
  };

  const handleClose = () => {
    setForm({
      title: '',
      description: '',
    });
    setShowTitleError(false);
    setIsSaving(false);
    onClose();
  };

  const handleSave = async () => {
    // Validation
    if (!form.title.trim()) {
      setShowTitleError(true);
      return;
    }

    try {
      setIsSaving(true);

      // Convert selected exercises to template exercises
      const templateExercises: TemplateExercise[] = selectedExercises.map(
        (exercise) => ({
          exerciseId: exercise.id,
          sets: 3, // Default values
          reps: 10,
          name: exercise.name,
          category: exercise.category,
          primaryMuscles: exercise.primaryMuscles,
        })
      );

      const templateData: Omit<Template, 'id' | 'userId'> = {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        exercises: templateExercises,
        estimatedDuration: 45, // Default duration
        difficulty: 'intermediate', // Default difficulty  
        isPublic: false,
      };

      await onSave(templateData);
      handleClose();
    } catch (error) {
      console.error('Failed to create template:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleClose} modal snapPointsMode="fit">
      <Sheet.Overlay backgroundColor="rgba(0, 0, 0, 0.5)" />
      <Sheet.Handle backgroundColor="$gray8" />
      <Sheet.Frame
        backgroundColor="$background"
        borderTopLeftRadius="$6"
        borderTopRightRadius="$6"
      >
        <YStack padding="$4" space="$4" maxHeight="90%">
          {/* Header */}
          <XStack justifyContent="space-between" alignItems="center">
            <Text fontSize="$6" fontWeight="600">
              Create Template
            </Text>
            <Button
              size="$3"
              chromeless
              onPress={handleClose}
              icon={<X size={20} />}
              accessibilityLabel="Close modal"
            />
          </XStack>

          <ScrollView showsVerticalScrollIndicator={false}>
            <YStack space="$4">
              {/* Basic Info */}
              <YStack space="$3">
                {/* Title */}
                <YStack space="$2">
                  <Label htmlFor="title" fontSize="$4" fontWeight="500">
                    Title *
                  </Label>
                  <Input
                    id="title"
                    placeholder="Enter template name"
                    value={form.title}
                    onChangeText={(text) => updateForm('title', text)}
                    borderColor={showTitleError ? '$red6' : '$gray6'}
                    focusStyle={{
                      borderColor: showTitleError ? '$red8' : '$blue8',
                    }}
                    accessibilityLabel="Template title"
                  />
                  {showTitleError && (
                    <Text fontSize="$3" color="$red10">
                      Title is required
                    </Text>
                  )}
                </YStack>

                {/* Description */}
                <YStack space="$2">
                  <Label htmlFor="description" fontSize="$4" fontWeight="500">
                    Description (optional)
                  </Label>
                  <Input
                    id="description"
                    placeholder="Describe your template"
                    value={form.description}
                    onChangeText={(text) => updateForm('description', text)}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                    accessibilityLabel="Template description"
                  />
                </YStack>
              </YStack>

              {/* Exercises Preview */}
              <YStack space="$3">
                <XStack alignItems="center" space="$2">
                  <Target size={16} color="$gray10" />
                  <Text fontSize="$5" fontWeight="500">
                    Exercises ({selectedExercises.length})
                  </Text>
                </XStack>

                <YStack space="$2">
                  {selectedExercises.map((exercise, index) => (
                    <Card
                      key={exercise.id}
                      padding="$3"
                      backgroundColor="$gray2"
                      borderColor="$gray4"
                      borderWidth={1}
                    >
                      <XStack
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <YStack flex={1} space="$1">
                          <Text fontSize="$4" fontWeight="500">
                            {index + 1}. {exercise.name}
                          </Text>
                          <XStack space="$2" flexWrap="wrap">
                            <Text
                              fontSize="$2"
                              color="$gray10"
                              textTransform="capitalize"
                            >
                              {exercise.difficulty}
                            </Text>
                            <Text fontSize="$2" color="$gray10">
                              •
                            </Text>
                            <Text fontSize="$2" color="$gray10">
                              {exercise.primaryMuscles.join(', ')}
                            </Text>
                          </XStack>
                        </YStack>
                        <Text fontSize="$3" color="$gray10">
                          3 sets × 10 reps
                        </Text>
                      </XStack>
                    </Card>
                  ))}
                </YStack>
              </YStack>
            </YStack>
          </ScrollView>

          {/* Action Buttons */}
          <XStack space="$3" paddingTop="$3">
            <Button
              flex={1}
              size="$4"
              variant="outlined"
              onPress={handleClose}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              flex={1}
              size="$4"
              backgroundColor="$green9"
              onPress={handleSave}
              disabled={isSaving || selectedExercises.length === 0}
            >
              {isSaving ? 'Creating...' : 'Create Template'}
            </Button>
          </XStack>
        </YStack>
      </Sheet.Frame>
    </Sheet>
  );
}
