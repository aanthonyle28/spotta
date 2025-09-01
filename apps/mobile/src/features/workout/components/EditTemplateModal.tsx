import { useState, useEffect } from 'react';
import { Alert, TouchableWithoutFeedback } from 'react-native';
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
import {
  X,
  Target,
  MoreHorizontal,
  Edit3,
  Trash2,
  Replace,
  Plus,
} from '@tamagui/lucide-icons';
import type { Template } from '../types';

interface EditTemplateModalProps {
  isOpen: boolean;
  template: Template | null;
  onClose: () => void;
  onSave: (templateId: string, updates: Partial<Template>) => Promise<void>;
}

interface TemplateForm {
  title: string;
  description: string;
}

export function EditTemplateModal({
  isOpen,
  template,
  onClose,
  onSave,
}: EditTemplateModalProps) {
  const [form, setForm] = useState<TemplateForm>({
    title: '',
    description: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showTitleError, setShowTitleError] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [editingExercise, setEditingExercise] = useState<string | null>(null);

  // Initialize form with template data
  useEffect(() => {
    if (template) {
      setForm({
        title: template.title,
        description: template.description || '',
      });
    }
  }, [template]);

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
    setShowTitleError(false);
    setIsSaving(false);
    setActiveMenuId(null);
    setEditingExercise(null);
    onClose();
  };

  const handleSave = async () => {
    if (!template) return;

    // Validation
    if (!form.title.trim()) {
      setShowTitleError(true);
      return;
    }

    try {
      setIsSaving(true);

      const updates: Partial<Template> = {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
      };

      await onSave(template.id, updates);
      handleClose();
    } catch (error) {
      console.error('Failed to update template:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleMenuPress = (exerciseId: string) => {
    setActiveMenuId(activeMenuId === exerciseId ? null : exerciseId);
  };

  const handleRemoveExercise = (exerciseId: string, exerciseName: string) => {
    Alert.alert(
      'Remove Exercise',
      `Remove "${exerciseName}" from this template?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement exercise removal from template
            setActiveMenuId(null);
          },
        },
      ]
    );
  };

  const handleReplaceExercise = (_exerciseId: string) => {
    // TODO: Navigate to exercise selection for replacement
    setActiveMenuId(null);
  };

  const handleEditExercise = (exerciseId: string) => {
    setEditingExercise(editingExercise === exerciseId ? null : exerciseId);
    setActiveMenuId(null);
  };

  const handleAddExercise = () => {
    // TODO: Navigate to exercise selection for adding to template
  };

  if (!template) return null;

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
              Edit Template
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

              {/* Exercises Section */}
              <YStack space="$3">
                <XStack justifyContent="space-between" alignItems="center">
                  <XStack alignItems="center" space="$2">
                    <Target size={16} color="$gray10" />
                    <Text fontSize="$5" fontWeight="500">
                      Exercises ({template.exercises.length})
                    </Text>
                  </XStack>
                  <Button
                    size="$3"
                    backgroundColor="$blue9"
                    onPress={handleAddExercise}
                    icon={<Plus size={16} color="white" />}
                    accessibilityLabel="Add exercise"
                  >
                    Add
                  </Button>
                </XStack>

                <YStack space="$2">
                  {template.exercises.map((templateExercise, index) => (
                    <Card
                      key={`${templateExercise.exerciseId}-${index}`}
                      padding="$3"
                      backgroundColor="$gray2"
                      borderColor="$gray4"
                      borderWidth={1}
                      position="relative"
                    >
                      <XStack
                        justifyContent="space-between"
                        alignItems="flex-start"
                      >
                        <YStack flex={1} space="$2">
                          <Text fontSize="$4" fontWeight="500">
                            {index + 1}. {templateExercise.name}
                          </Text>
                          <XStack space="$2" flexWrap="wrap">
                            <Text fontSize="$2" color="$gray10">
                              {templateExercise.primaryMuscles.join(', ')}
                            </Text>
                          </XStack>

                          {/* Exercise Details - Editable */}
                          {editingExercise === templateExercise.exerciseId ? (
                            <YStack space="$2" paddingTop="$2">
                              <XStack space="$2" alignItems="center">
                                <Text
                                  fontSize="$3"
                                  fontWeight="500"
                                  minWidth={50}
                                >
                                  Sets:
                                </Text>
                                <Input
                                  value={templateExercise.sets.toString()}
                                  onChangeText={(_text) => {
                                    // TODO: Update exercise sets
                                  }}
                                  width={80}
                                  keyboardType="numeric"
                                />
                              </XStack>
                              {templateExercise.reps && (
                                <XStack space="$2" alignItems="center">
                                  <Text
                                    fontSize="$3"
                                    fontWeight="500"
                                    minWidth={50}
                                  >
                                    Reps:
                                  </Text>
                                  <Input
                                    value={templateExercise.reps.toString()}
                                    onChangeText={(_text) => {
                                      // TODO: Update exercise reps
                                    }}
                                    width={80}
                                    keyboardType="numeric"
                                  />
                                </XStack>
                              )}
                              {templateExercise.weight && (
                                <XStack space="$2" alignItems="center">
                                  <Text
                                    fontSize="$3"
                                    fontWeight="500"
                                    minWidth={50}
                                  >
                                    Weight:
                                  </Text>
                                  <Input
                                    value={templateExercise.weight.toString()}
                                    onChangeText={(_text) => {
                                      // TODO: Update exercise weight
                                    }}
                                    width={80}
                                    keyboardType="numeric"
                                  />
                                </XStack>
                              )}
                              <XStack space="$2" paddingTop="$2">
                                <Button
                                  size="$2"
                                  backgroundColor="$green9"
                                  onPress={() => setEditingExercise(null)}
                                >
                                  Save
                                </Button>
                                <Button
                                  size="$2"
                                  variant="outlined"
                                  onPress={() => setEditingExercise(null)}
                                >
                                  Cancel
                                </Button>
                              </XStack>
                            </YStack>
                          ) : (
                            <XStack space="$3" paddingTop="$1">
                              <Text fontSize="$3" color="$gray10">
                                {templateExercise.sets} sets
                                {templateExercise.reps &&
                                  ` × ${templateExercise.reps} reps`}
                                {templateExercise.weight &&
                                  ` @ ${templateExercise.weight} lbs`}
                              </Text>
                            </XStack>
                          )}
                        </YStack>

                        <Button
                          size="$2"
                          chromeless
                          onPress={() =>
                            handleMenuPress(templateExercise.exerciseId)
                          }
                          padding="$1"
                          accessibilityLabel="Exercise options"
                        >
                          <MoreHorizontal size={16} color="$gray10" />
                        </Button>
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
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </XStack>
        </YStack>
      </Sheet.Frame>

      {/* Exercise Menu Dropdown */}
      {activeMenuId && (
        <>
          {/* Full-screen overlay for tap-outside */}
          <TouchableWithoutFeedback onPress={() => setActiveMenuId(null)}>
            <Card
              position="absolute"
              top={-1000}
              left={-1000}
              right={-1000}
              bottom={-1000}
              backgroundColor="rgba(0, 0, 0, 0.1)"
              zIndex={999}
            />
          </TouchableWithoutFeedback>

          {/* Dropdown menu */}
          <Card
            position="absolute"
            top={200}
            right={80}
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
            width={140}
          >
            <YStack space="$1">
              <Button
                chromeless
                onPress={() => handleEditExercise(activeMenuId)}
                justifyContent="flex-start"
                padding="$3"
                minHeight={44}
                icon={<Edit3 size={16} color="$gray11" />}
                gap="$2"
              >
                <Text fontSize="$4">Edit</Text>
              </Button>
              <Button
                chromeless
                onPress={() => handleReplaceExercise(activeMenuId)}
                justifyContent="flex-start"
                padding="$3"
                minHeight={44}
                icon={<Replace size={16} color="$gray11" />}
                gap="$2"
              >
                <Text fontSize="$4">Replace</Text>
              </Button>
              <Button
                chromeless
                onPress={() => {
                  const exercise = template?.exercises.find(
                    (ex) => ex.exerciseId === activeMenuId
                  );
                  if (exercise) {
                    handleRemoveExercise(activeMenuId, exercise.name);
                  }
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
        </>
      )}
    </Sheet>
  );
}
