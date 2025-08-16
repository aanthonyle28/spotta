import { memo, useMemo } from 'react';
import { ScrollView } from 'react-native';
import { XStack, YStack, Card, Text, Button, H4 } from 'tamagui';
import { Play, Plus, Clock } from '@tamagui/lucide-icons';
import type { Template } from '../types';

interface RoutineCarouselProps {
  routines: Template[];
  onStart: (templateId: string) => void;
  onTemplatePreview: (templateId: string) => void;
  onAddTemplate: () => void;
}

interface RoutineCardProps {
  routine: Template;
  onStart: (templateId: string) => void;
  onPreview: (templateId: string) => void;
}

const RoutineCard = memo<RoutineCardProps>(({ routine, onStart, onPreview }) => {
  return (
    <Card 
      width={280} 
      padding="$4" 
      backgroundColor="$gray2"
      marginRight="$3"
      pressStyle={{ scale: 0.98 }}
      onPress={() => onPreview(routine.id)}
      accessibilityLabel={`Template: ${routine.title}`}
    >
      <YStack space="$3">
        <YStack space="$1">
          <Text fontSize="$5" fontWeight="600" numberOfLines={2}>
            {routine.title}
          </Text>
          <XStack space="$2" alignItems="center">
            <Clock size={14} color="$gray10" />
            <Text fontSize="$3" color="$gray10">
              {routine.estimatedDuration}m
            </Text>
            <Text fontSize="$3" color="$gray10">
              • {routine.exercises.length} exercises
            </Text>
          </XStack>
        </YStack>
        
        <Button 
          size="$3"
          backgroundColor="$blue9"
          onPress={(e) => {
            e.stopPropagation();
            onStart(routine.id);
          }}
          icon={<Play size={16} color="white" />}
          accessibilityLabel={`Start ${routine.title} template`}
        >
          Start
        </Button>
      </YStack>
    </Card>
  );
});

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

export const RoutineCarousel = memo<RoutineCarouselProps>(({ 
  routines, 
  onStart, 
  onTemplatePreview, 
  onAddTemplate 
}) => {
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
            />
          ))}
          <NewTemplateCard onPress={onAddTemplate} />
        </XStack>
      </ScrollView>
    );
  }, [routines, onStart, onTemplatePreview, onAddTemplate]);

  return content;
});