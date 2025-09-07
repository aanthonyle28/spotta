import { memo, useMemo, useState } from 'react';
import { ScrollView, TouchableWithoutFeedback } from 'react-native';
import { XStack, YStack, Card, Text, Button, H3 } from '@my/ui';
import {
  Play,
  Plus,
  MoreHorizontal,
  Edit3,
  Copy,
  Share2,
  Trash2,
} from '@tamagui/lucide-icons';
import type { Template } from '../types';
import { getDaysAgoText } from '../services/mockData';
import { SPOTTA_COLORS } from '../../../constants/colors';

interface RoutineCarouselProps {
  routines: Template[];
  onStart: (templateId: string) => void;
  onTemplatePreview: (templateId: string) => void;
  onAddTemplate: () => void;
  onEditTemplate?: (templateId: string) => void;
  onDeleteTemplate?: (templateId: string) => void;
  onDuplicateTemplate?: (templateId: string) => void;
  onShareTemplate?: (templateId: string) => void;
}

interface RoutineCardProps {
  routine: Template;
  onStart: (templateId: string) => void;
  onPreview: (templateId: string) => void;
  onMenuPress: (templateId: string) => void;
  showMenu: boolean;
}

const RoutineCard = memo<RoutineCardProps>(
  ({ routine, onStart, onPreview, onMenuPress, showMenu: _showMenu }) => {
    const handleMenuPress = (e: { stopPropagation: () => void }) => {
      e.stopPropagation();
      onMenuPress(routine.id);
    };

    return (
      <Card
        width={280}
        padding="$4"
        backgroundColor="$gray2"
        marginRight="$3"
        pressStyle={{ scale: 0.98 }}
        onPress={() => onPreview(routine.id)}
        accessibilityLabel={`Template: ${routine.title}`}
        position="relative"
        overflow="visible"
      >
        <YStack space="$3" flex={1}>
          <XStack justifyContent="space-between" alignItems="flex-start">
            <H3 numberOfLines={2} flex={1}>
              {routine.title}
            </H3>
            <Button
              size="$2"
              chromeless
              onPress={handleMenuPress}
              padding="$1"
              marginLeft="$2"
              accessibilityLabel="Template options"
            >
              <MoreHorizontal size={16} color="$gray10" />
            </Button>
          </XStack>

          <XStack space="$2" alignItems="center">
            <Text fontSize="$3" color="$gray10">
              {routine.exercises.length} exercises
            </Text>
            {routine.lastCompleted && (
              <>
                <Text fontSize="$3" color="$gray8">
                  •
                </Text>
                <Text fontSize="$3" color="$gray10" marginLeft="$2">
                  {getDaysAgoText(routine.lastCompleted)}
                </Text>
              </>
            )}
          </XStack>

          <Button
            size="$3"
            backgroundColor={SPOTTA_COLORS.blue}
            onPress={(e) => {
              e.stopPropagation();
              onStart(routine.id);
            }}
            accessibilityLabel={`Start ${routine.title} template`}
            marginTop="auto"
          >
            Start
          </Button>
        </YStack>
      </Card>
    );
  }
);

const NewTemplateCard = memo<{ onPress: () => void }>(({ onPress }) => {
  return (
    <Card
      width={280}
      height={140}
      backgroundColor="$gray1"
      borderColor="$gray6"
      borderWidth={1}
      borderStyle="dashed"
      marginRight="$3"
      pressStyle={{ scale: 0.98 }}
      onPress={onPress}
      justifyContent="center"
      alignItems="center"
      accessibilityLabel="Create new template"
    >
      <YStack space="$2" alignItems="center">
        <Plus size={24} color="$gray10" />
        <Text fontSize="$4" color="$gray10" fontWeight="500">
          New Template
        </Text>
      </YStack>
    </Card>
  );
});

export const RoutineCarousel = memo<RoutineCarouselProps>(
  ({
    routines,
    onStart,
    onTemplatePreview,
    onAddTemplate,
    onEditTemplate,
    onDeleteTemplate,
    onDuplicateTemplate,
    onShareTemplate,
  }) => {
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

    const handleMenuPress = (templateId: string) => {
      setActiveMenuId(activeMenuId === templateId ? null : templateId);
    };

    const handleMenuAction = (
      action: 'edit' | 'delete' | 'duplicate' | 'share'
    ) => {
      if (!activeMenuId) return;

      setActiveMenuId(null);

      switch (action) {
        case 'edit':
          onEditTemplate?.(activeMenuId);
          break;
        case 'delete':
          onDeleteTemplate?.(activeMenuId);
          break;
        case 'duplicate':
          onDuplicateTemplate?.(activeMenuId);
          break;
        case 'share':
          onShareTemplate?.(activeMenuId);
          break;
      }
    };

    const content = useMemo(() => {
      if (routines.length === 0) {
        return (
          <Card
            padding="$4"
            backgroundColor="$gray1"
            borderColor="$gray6"
            borderWidth={1}
            marginHorizontal="$4"
          >
            <YStack space="$2" alignItems="center">
              <Text fontSize="$4" color="$gray10" textAlign="center">
                Create your first template
              </Text>
              <Button
                size="$2"
                variant="outlined"
                onPress={onAddTemplate}
                icon={<Plus size={16} />}
              >
                Get Started
              </Button>
            </YStack>
          </Card>
        );
      }

      return (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: 16 }}
        >
          <XStack paddingLeft="0">
            {routines.map((routine) => (
              <RoutineCard
                key={routine.id}
                routine={routine}
                onStart={onStart}
                onPreview={onTemplatePreview}
                onMenuPress={handleMenuPress}
                showMenu={activeMenuId === routine.id}
              />
            ))}
            <NewTemplateCard onPress={onAddTemplate} />
          </XStack>
        </ScrollView>
      );
    }, [routines, onStart, onTemplatePreview, onAddTemplate, handleMenuPress]);

    return (
      <>
        {content}
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

            {/* Global dropdown menu */}
            <Card
              position="absolute"
              top={100} // Closer to the 3-dots button area
              right={80} // Align better with cards
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
                  onPress={() => handleMenuAction('edit')}
                  justifyContent="flex-start"
                  padding="$3"
                  minHeight={44}
                  icon={<Edit3 size={16} color="$gray11" />}
                  gap="$1"
                >
                  <Text fontSize="$4">Edit</Text>
                </Button>
                <Button
                  chromeless
                  onPress={() => handleMenuAction('duplicate')}
                  justifyContent="flex-start"
                  padding="$3"
                  minHeight={44}
                  icon={<Copy size={16} color="$gray11" />}
                  gap="$1"
                >
                  <Text fontSize="$4">Duplicate</Text>
                </Button>
                <Button
                  chromeless
                  onPress={() => handleMenuAction('share')}
                  justifyContent="flex-start"
                  padding="$3"
                  minHeight={44}
                  icon={<Share2 size={16} color="$gray11" />}
                  gap="$1"
                >
                  <Text fontSize="$4">Share</Text>
                </Button>
                <Button
                  chromeless
                  onPress={() => handleMenuAction('delete')}
                  justifyContent="flex-start"
                  padding="$3"
                  minHeight={44}
                  icon={<Trash2 size={16} color="$red10" />}
                  gap="$1"
                >
                  <Text fontSize="$4" color="$red10">
                    Delete
                  </Text>
                </Button>
              </YStack>
            </Card>
          </>
        )}
      </>
    );
  }
);
