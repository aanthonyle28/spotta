import type { ReactNode } from 'react';
import { YStack, XStack, Text } from '@my/ui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface CustomHeaderProps {
  title: string;
  leftAction?: ReactNode;
  rightAction?: ReactNode;
  showBorder?: boolean;
}

export function CustomHeader({
  title,
  leftAction,
  rightAction,
  showBorder = true,
}: CustomHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <YStack
      paddingTop={insets.top - 40}
      paddingHorizontal="$4"
      paddingBottom="$2"
      backgroundColor="$background"
      borderBottomWidth={showBorder ? 1 : 0}
      borderBottomColor="$gray4"
    >
      <XStack alignItems="center" minHeight={44}>
        {leftAction}
        <Text
          fontSize="$6"
          fontWeight="600"
          marginLeft={leftAction ? '$3' : '$0'}
          flex={1}
        >
          {title}
        </Text>
        {rightAction && (
          <XStack justifyContent="flex-end">{rightAction}</XStack>
        )}
      </XStack>
    </YStack>
  );
}
