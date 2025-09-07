import { memo } from 'react';
import { XStack, Button, Text } from '@my/ui';
import { Dumbbell, Users, User } from '@tamagui/lucide-icons';
import { SPOTTA_COLORS } from '../../../constants/colors';

interface FloatingPillNavigationProps {
  activeTab: 'workout' | 'clubs' | 'progress';
  onTabPress: (tab: 'workout' | 'clubs' | 'progress') => void;
}

export const FloatingPillNavigation = memo<FloatingPillNavigationProps>(
  ({ activeTab, onTabPress }) => {
    return (
      <XStack
        backgroundColor={SPOTTA_COLORS.cardBackground}
        borderRadius="$12"
        padding="$3"
        paddingVertical="$4"
        space="$1"
        justifyContent="center"
        alignItems="center"
        position="absolute"
        bottom="$4"
        left="$4"
        right="$4"
        zIndex={20}
        elevation={10}
        shadowColor="black"
        shadowOffset={{ width: 0, height: 4 }}
        shadowOpacity={0.3}
        shadowRadius={8}
      >
        <Button
          size="$3"
          backgroundColor={activeTab === 'workout' ? 'white' : 'transparent'}
          borderRadius="$10"
          paddingHorizontal="$3"
          onPress={() => onTabPress('workout')}
          pressStyle={{ scale: 0.95 }}
          accessibilityLabel="Workout tab"
        >
          <XStack space="$2" alignItems="center">
            <Dumbbell
              size={18}
              color={activeTab === 'workout' ? 'black' : 'white'}
            />
            <Text
              fontSize="$3"
              fontWeight="500"
              color={activeTab === 'workout' ? 'black' : 'white'}
            >
              Workout
            </Text>
          </XStack>
        </Button>

        <Button
          size="$3"
          backgroundColor={activeTab === 'clubs' ? 'white' : 'transparent'}
          borderRadius="$10"
          paddingHorizontal="$3"
          onPress={() => onTabPress('clubs')}
          pressStyle={{ scale: 0.95 }}
          accessibilityLabel="Clubs tab"
        >
          <XStack space="$2" alignItems="center">
            <Users
              size={18}
              color={activeTab === 'clubs' ? 'black' : 'white'}
            />
            <Text
              fontSize="$3"
              fontWeight="500"
              color={activeTab === 'clubs' ? 'black' : 'white'}
            >
              Clubs
            </Text>
          </XStack>
        </Button>

        <Button
          size="$3"
          backgroundColor={activeTab === 'progress' ? 'white' : 'transparent'}
          borderRadius="$10"
          paddingHorizontal="$3"
          onPress={() => onTabPress('progress')}
          pressStyle={{ scale: 0.95 }}
          accessibilityLabel="Progress tab"
        >
          <XStack space="$2" alignItems="center">
            <User
              size={18}
              color={activeTab === 'progress' ? 'black' : 'white'}
            />
            <Text
              fontSize="$3"
              fontWeight="500"
              color={activeTab === 'progress' ? 'black' : 'white'}
            >
              Progress
            </Text>
          </XStack>
        </Button>
      </XStack>
    );
  }
);
