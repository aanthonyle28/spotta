import { memo } from 'react';
import { Card, YStack, Text } from 'tamagui';
import { Search, ArrowUpRight } from '@tamagui/lucide-icons';
import { SPOTTA_COLORS } from '../../../constants/colors';

interface BrowseExercisesTileProps {
  onPress: () => void;
}

export const BrowseExercisesTile = memo<BrowseExercisesTileProps>(
  ({ onPress }) => {
    return (
      <Card
        padding="$4"
        backgroundColor={SPOTTA_COLORS.browseExercises}
        pressStyle={{ scale: 0.98 }}
        onPress={onPress}
        accessibilityLabel="Browse exercises"
        height="$12"
        justifyContent="space-between"
        space="$3"
      >
        <Search size={20} color="white" />
        <YStack space="$2" justifyContent="space-between" flex={1}>
          <YStack space="$1">
            <Text fontSize="$4" fontWeight="600" color="white">
              Browse Exercises
            </Text>
            <Text fontSize="$3" color="white" opacity={0.8}>
              Explore our exercise library
            </Text>
          </YStack>
          <ArrowUpRight 
            size={20} 
            color="white" 
            alignSelf="flex-end"
            opacity={0.7}
          />
        </YStack>
      </Card>
    );
  }
);
