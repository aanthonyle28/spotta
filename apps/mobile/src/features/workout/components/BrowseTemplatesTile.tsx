import { memo } from 'react';
import { Card, XStack, YStack, Text } from 'tamagui';
import { BookOpen, ChevronRight } from '@tamagui/lucide-icons';

interface BrowseTemplatesTileProps {
  onPress: () => void;
}

export const BrowseTemplatesTile = memo<BrowseTemplatesTileProps>(
  ({ onPress }) => {
    return (
      <Card
        padding="$4"
        backgroundColor="$gray2"
        pressStyle={{ scale: 0.98 }}
        onPress={onPress}
        accessibilityLabel="Browse templates"
      >
        <XStack justifyContent="space-between" alignItems="center">
          <XStack space="$3" alignItems="center" flex={1}>
            <BookOpen size={20} color="$gray11" />
            <YStack flex={1}>
              <Text fontSize="$4" fontWeight="600">
                Browse Templates
              </Text>
              <Text fontSize="$3" color="$gray10">
                Discoverk workout templates
              </Text>
            </YStack>
          </XStack>
          <ChevronRight size={20} color="$gray10" />
        </XStack>
      </Card>
    );
  }
);
