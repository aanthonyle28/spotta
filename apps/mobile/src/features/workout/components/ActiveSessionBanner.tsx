import { memo, useMemo } from 'react';
import { XStack, YStack, Text, Card } from 'tamagui';
import { ChevronRight, Clock } from '@tamagui/lucide-icons';
import { router } from 'expo-router';
import type { ActiveSession } from '../types';

interface ActiveSessionBannerProps {
  activeSession: ActiveSession;
}

export const ActiveSessionBanner = memo<ActiveSessionBannerProps>(
  ({ activeSession }) => {
    const duration = useMemo(() => {
      const elapsed = Math.floor(
        (Date.now() - activeSession.startedAt.getTime()) / 1000 / 60
      );
      return elapsed;
    }, [activeSession.startedAt]);

    const handlePress = () => {
      console.log(`[Banner] Navigating to session: ${activeSession.id}`);
      router.push(`/logging/${activeSession.id}` as any);
    };

    return (
      <Card
        backgroundColor="$blue2"
        borderColor="$blue6"
        borderWidth={1}
        padding="$3"
        marginHorizontal="$4"
        marginBottom="$2"
        position="absolute"
        bottom={100}
        left={0}
        right={0}
        zIndex={10}
        pressStyle={{ scale: 0.98 }}
        onPress={handlePress}
        accessibilityLabel={`Resume active workout: ${activeSession.name}`}
      >
        <XStack justifyContent="space-between" alignItems="center">
          <XStack flex={1} space="$2" alignItems="center">
            <Clock size={16} color="$blue11" />
            <YStack flex={1}>
              <Text
                fontSize="$3"
                fontWeight="600"
                color="$blue12"
                numberOfLines={1}
              >
                {activeSession.name}
              </Text>
              <Text fontSize="$2" color="$blue11">
                {duration}m • {activeSession.exercises.length} exercises
              </Text>
            </YStack>
          </XStack>

          <ChevronRight size={16} color="$blue11" />
        </XStack>
      </Card>
    );
  }
);
