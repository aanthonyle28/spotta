import { memo, useState, useEffect } from 'react';
import { XStack, YStack, Text, Card } from 'tamagui';
import { ChevronRight, Clock } from '@tamagui/lucide-icons';
import { router } from 'expo-router';
import type { ActiveSession } from '../types';
import { logger } from '../../../utils/logger';
import { formatTime } from '../../../utils/formatTime';

interface ActiveSessionBannerProps {
  activeSession: ActiveSession;
}

export const ActiveSessionBanner = memo<ActiveSessionBannerProps>(
  ({ activeSession }) => {
    const [currentTime, setCurrentTime] = useState(Date.now());

    // Update timer every second for real-time duration
    useEffect(() => {
      const interval = setInterval(() => {
        setCurrentTime(Date.now());
      }, 1000);

      return () => clearInterval(interval);
    }, []);

    const durationInSeconds = Math.floor(
      (currentTime - activeSession.startedAt.getTime()) / 1000
    );

    const handlePress = () => {
      logger.debug(`[Banner] Navigating to session: ${activeSession.id}`);
      router.push(`/logging/${activeSession.id}`);
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
                {formatTime(durationInSeconds)} •{' '}
                {activeSession.exercises.length} exercises
              </Text>
            </YStack>
          </XStack>

          <ChevronRight size={16} color="$blue11" />
        </XStack>
      </Card>
    );
  }
);
