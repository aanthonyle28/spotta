import { memo } from 'react';
import { Card, XStack, YStack, Text } from 'tamagui';
import { Search, ChevronRight } from '@tamagui/lucide-icons';

interface BrowseExercisesTileProps {
  onPress: () => void;
}

export const BrowseExercisesTile = memo<BrowseExercisesTileProps>(({ onPress }) => {
  return (
    <Card 
      padding="$4" 
      backgroundColor="$gray2"
      pressStyle={{ scale: 0.98 }}
      onPress={onPress}
      accessibilityLabel="Browse exercises"
    >
      <XStack justifyContent="space-between" alignItems="center">
        <XStack space="$3" alignItems="center" flex={1}>
          <Search size={20} color="$gray11" />
          <YStack flex={1}>
            <Text fontSize="$4" fontWeight="600">
              Browse Exercises
            </Text>
            <Text fontSize="$3" color="$gray10">
              Explore our exercise library
            </Text>
          </YStack>
        </XStack>
        <ChevronRight size={20} color="$gray10" />
      </XStack>
    </Card>
  );
});