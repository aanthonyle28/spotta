import { useState, useCallback } from 'react';
import { Pressable, TouchableWithoutFeedback } from 'react-native';
import { YStack, Text, Button, H5 } from '@my/ui';
import { ChevronDown } from '@tamagui/lucide-icons';

export interface FilterDropdownProps {
  placeholder: string;
  options: string[];
  value: string;
  onValueChange: (value: string) => void;
  accessibilityLabel?: string;
}

export function FilterDropdown({
  placeholder,
  options,
  value,
  onValueChange,
  accessibilityLabel,
}: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const displayValue =
    value === 'all'
      ? placeholder
      : value.charAt(0).toUpperCase() + value.slice(1).replace('-', ' ');

  const handleToggle = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen]);

  const handleSelect = useCallback(
    (option: string) => {
      onValueChange(option);
      setIsOpen(false);
    },
    [onValueChange]
  );

  const handleOutsidePress = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <>
      {/* Invisible overlay to detect outside taps */}
      {isOpen && (
        <TouchableWithoutFeedback onPress={handleOutsidePress}>
          <YStack
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            zIndex={99}
          />
        </TouchableWithoutFeedback>
      )}

      {/* Container with relative positioning */}
      <YStack flex={1} position="relative">
        <Button
          flex={1}
          size="$3"
          backgroundColor="$gray2"
          color="$gray11"
          borderRadius="$3"
          borderWidth={0}
          justifyContent="space-between"
          onPress={handleToggle}
          accessibilityLabel={accessibilityLabel || `Filter by ${placeholder}`}
          iconAfter={
            <ChevronDown
              size={16}
              style={{ transform: [{ rotate: isOpen ? '180deg' : '0deg' }] }}
            />
          }
          paddingHorizontal="$3"
          paddingVertical="$1"
          minHeight={44}
        >
          <H5 color="$gray11">{displayValue}</H5>
        </Button>

        {/* Dropdown content - positioned below button */}
        {isOpen && (
          <YStack
            position="absolute"
            top={46}
            left={0}
            right={0}
            backgroundColor="$background"
            borderWidth={0}
            borderRadius="$4"
            padding="$2"
            zIndex={100}
            elevation={8}
            shadowColor="$shadowColor"
            shadowOffset={{ width: 0, height: 4 }}
            shadowOpacity={0.15}
            shadowRadius={12}
          >
            <Pressable
              onPress={() => handleSelect('all')}
              style={{
                padding: 8,
                borderRadius: 6,
                backgroundColor: value === 'all' ? '#3b82f6' : 'transparent',
              }}
            >
              <H5
                color={value === 'all' ? 'white' : '$gray11'}
                fontWeight={value === 'all' ? '500' : '400'}
              >
                All
              </H5>
            </Pressable>

            {options.map((option) => (
              <Pressable
                key={option}
                onPress={() => handleSelect(option)}
                style={{
                  padding: 8,
                  borderRadius: 6,
                  backgroundColor: value === option ? '#3b82f6' : 'transparent',
                }}
              >
                <H5
                  color={value === option ? 'white' : '$gray11'}
                  fontWeight={value === option ? '500' : '400'}
                >
                  {option.charAt(0).toUpperCase() +
                    option.slice(1).replace('-', ' ')}
                </H5>
              </Pressable>
            ))}
          </YStack>
        )}
      </YStack>
    </>
  );
}
