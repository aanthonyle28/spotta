import { memo } from 'react';
import { Card, YStack, Text } from 'tamagui';
import { BookOpen, ArrowUpRight } from '@tamagui/lucide-icons';
import { SPOTTA_COLORS } from '../../../constants/colors';

interface BrowseTemplatesTileProps {
  onPress: () => void;
}

export const BrowseTemplatesTile = memo<BrowseTemplatesTileProps>(
  ({ onPress }) => {
    return (
      <Card
        padding="$4"
        backgroundColor={SPOTTA_COLORS.findTemplates}
        pressStyle={{ scale: 0.98 }}
        onPress={onPress}
        accessibilityLabel="Browse templates"
        height="$12"
        justifyContent="space-between"
        space="$3"
      >
        <BookOpen size={20} color="white" />
        <YStack space="$2" justifyContent="space-between" flex={1}>
          <YStack space="$1">
            <Text fontSize="$4" fontWeight="600" color="white">
              Find Templates
            </Text>
            <Text fontSize="$3" color="white" opacity={0.8}>
              Discover workout templates
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
