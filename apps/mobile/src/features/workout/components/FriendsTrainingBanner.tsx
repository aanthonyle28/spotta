import { memo } from 'react';
import { View } from 'react-native';
import { Card, XStack, YStack, Text, H4 } from '@my/ui';
import { ChevronRight } from '@tamagui/lucide-icons';
import { SPOTTA_COLORS } from '../../../constants/colors';

interface Friend {
  id: string;
  name: string;
  avatarUrl: string;
}

interface FriendsTrainingBannerProps {
  friends: Friend[];
  onPress?: () => void;
}

export const FriendsTrainingBanner = memo<FriendsTrainingBannerProps>(
  ({ friends, onPress }) => {
    if (friends.length === 0) return null;

    const visibleFriends = friends.slice(0, 3);

    return (
      <Card
        padding="$3"
        backgroundColor={SPOTTA_COLORS.cardBackground}
        borderColor="transparent"
        pressStyle={{ scale: 0.98 }}
        onPress={onPress}
        accessibilityLabel={`${friends.length} friend${friends.length > 1 ? 's' : ''} ${friends.length > 1 ? 'are' : 'is'} training right now`}
      >
        <XStack justifyContent="space-between" alignItems="center">
          <XStack space="$3" alignItems="center" flex={1}>
            <XStack>
              {visibleFriends.map((friend, index) => (
                <View
                  key={friend.id}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: '#6B7280',
                    borderWidth: 2,
                    borderColor: 'white',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: visibleFriends.length - index,
                    marginLeft: index > 0 ? -8 : 0, // Overlap by 8px for each subsequent avatar
                  }}
                >
                  <Text fontSize="$3" color="white" fontWeight="600">
                    {friend.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
              ))}
            </XStack>
            <YStack flex={1}>
              <H4 color="white" numberOfLines={1}>
                {friends.length} friend{friends.length > 1 ? 's' : ''}{' '}
                {friends.length > 1 ? 'are' : 'is'} training right now
              </H4>
            </YStack>
          </XStack>
          <ChevronRight size={20} color="white" />
        </XStack>
      </Card>
    );
  }
);