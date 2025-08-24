import { memo, useState, useEffect } from 'react';
import { Sheet, YStack, XStack, H4, Button, Text, Card } from 'tamagui';
import { GripVertical, ArrowUp, ArrowDown, X } from '@tamagui/lucide-icons';
import type { Template } from '../types';

interface ReorderTemplatesModalProps {
  isOpen: boolean;
  templates: Template[];
  onClose: () => void;
  onSave: (reorderedTemplates: Template[]) => void;
}

export const ReorderTemplatesModal = memo<ReorderTemplatesModalProps>(
  ({ isOpen, templates, onClose, onSave }) => {
    const [reorderedTemplates, setReorderedTemplates] =
      useState<Template[]>(templates);

    // Sort templates by most recent completion for smart initial ordering
    const sortTemplatesByRecentCompletion = (templates: Template[]): Template[] => {
      return [...templates].sort((a, b) => {
        // Templates with lastCompleted come first, sorted by most recent
        if (a.lastCompleted && b.lastCompleted) {
          return new Date(b.lastCompleted).getTime() - new Date(a.lastCompleted).getTime();
        }
        if (a.lastCompleted && !b.lastCompleted) return -1;
        if (!a.lastCompleted && b.lastCompleted) return 1;
        // Both have no lastCompleted, maintain original order by title
        return a.title.localeCompare(b.title);
      });
    };

    // Sync with templates prop changes to fix loading issue
    useEffect(() => {
      const sortedTemplates = sortTemplatesByRecentCompletion(templates);
      setReorderedTemplates(sortedTemplates);
    }, [templates]);

    const moveTemplate = (index: number, direction: 'up' | 'down') => {
      const newTemplates = [...reorderedTemplates];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;

      if (targetIndex >= 0 && targetIndex < newTemplates.length) {
        [newTemplates[index], newTemplates[targetIndex]] = [
          newTemplates[targetIndex],
          newTemplates[index],
        ];
        setReorderedTemplates(newTemplates);
      }
    };

    const handleSave = () => {
      onSave(reorderedTemplates);
      onClose();
    };

    const handleCancel = () => {
      setReorderedTemplates(templates); // Reset to original order
      onClose();
    };

    return (
      <Sheet
        modal
        open={isOpen}
        onOpenChange={(open) => !open && handleCancel()}
        snapPointsMode="fit"
        dismissOnSnapToBottom
      >
        <Sheet.Overlay />
        <Sheet.Handle />
        <Sheet.Frame padding="$4" backgroundColor="$background">
          <YStack space="$4">
            {/* Header */}
            <YStack space="$2">
              <XStack justifyContent="space-between" alignItems="center">
                <H4>Reorder Templates</H4>
                <Button
                  size="$2"
                  chromeless
                  onPress={handleCancel}
                  padding="$2"
                  accessibilityLabel="Close modal"
                >
                  <X size={18} color="$gray10" />
                </Button>
              </XStack>
              <Text fontSize="$3" color="$gray11" lineHeight="$1">
                Templates are automatically ordered by most recently completed. Drag to reorder manually.
              </Text>
            </YStack>

            {/* Template List */}
            <YStack space="$2" maxHeight={400}>
              {reorderedTemplates.map((template, index) => (
                <Card
                  key={template.id}
                  padding="$3"
                  backgroundColor="$gray2"
                  borderColor="$gray6"
                  borderWidth={1}
                >
                  <XStack justifyContent="space-between" alignItems="center">
                    <XStack space="$3" alignItems="center" flex={1}>
                      <GripVertical size={16} color="$gray8" />
                      <YStack flex={1}>
                        <Text fontSize="$4" fontWeight="600" numberOfLines={1}>
                          {template.title}
                        </Text>
                        <Text fontSize="$3" color="$gray10">
                          {template.exercises.length} exercises
                        </Text>
                      </YStack>
                    </XStack>

                    <XStack space="$1">
                      <Button
                        size="$2"
                        chromeless
                        onPress={() => moveTemplate(index, 'up')}
                        disabled={index === 0}
                        padding="$2"
                        opacity={index === 0 ? 0.5 : 1}
                        accessibilityLabel="Move up"
                      >
                        <ArrowUp size={14} color="$gray10" />
                      </Button>
                      <Button
                        size="$2"
                        chromeless
                        onPress={() => moveTemplate(index, 'down')}
                        disabled={index === reorderedTemplates.length - 1}
                        padding="$2"
                        opacity={
                          index === reorderedTemplates.length - 1 ? 0.5 : 1
                        }
                        accessibilityLabel="Move down"
                      >
                        <ArrowDown size={14} color="$gray10" />
                      </Button>
                    </XStack>
                  </XStack>
                </Card>
              ))}
            </YStack>

            {/* Action Buttons */}
            <XStack space="$3" justifyContent="flex-end">
              <Button
                variant="outlined"
                onPress={handleCancel}
                padding="$3"
                minWidth={80}
              >
                <Text>Cancel</Text>
              </Button>
              <Button
                backgroundColor="$blue9"
                onPress={handleSave}
                padding="$3"
                minWidth={80}
              >
                <Text color="white">Save</Text>
              </Button>
            </XStack>
          </YStack>
        </Sheet.Frame>
      </Sheet>
    );
  }
);
