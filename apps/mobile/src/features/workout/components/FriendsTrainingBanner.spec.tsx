import { render } from '@testing-library/react-native';
import { TamaguiProvider } from '@tamagui/core';
import { FriendsTrainingBanner } from './FriendsTrainingBanner';
import config from '../../../../tamagui.config';

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <TamaguiProvider config={config}>{children}</TamaguiProvider>
);

describe('FriendsTrainingBanner', () => {
  const mockFriends = [
    { id: '1', name: 'Alex', avatarUrl: 'https://i.pravatar.cc/150?img=1' },
    { id: '2', name: 'Sarah', avatarUrl: 'https://i.pravatar.cc/150?img=2' },
    { id: '3', name: 'Mike', avatarUrl: 'https://i.pravatar.cc/150?img=3' },
  ];

  it('renders correctly with friends data', () => {
    const { getByText } = render(
      <TestWrapper>
        <FriendsTrainingBanner friends={mockFriends} />
      </TestWrapper>
    );

    expect(getByText('3 friends are training right now')).toBeTruthy();
  });

  it('renders singular text for one friend', () => {
    const oneFriend = [
      { id: '1', name: 'Alex', avatarUrl: 'https://i.pravatar.cc/150?img=1' },
    ];

    const { getByText } = render(
      <TestWrapper>
        <FriendsTrainingBanner friends={oneFriend} />
      </TestWrapper>
    );

    expect(getByText('1 friend is training right now')).toBeTruthy();
  });

  it('does not render when no friends', () => {
    const { queryByText } = render(
      <TestWrapper>
        <FriendsTrainingBanner friends={[]} />
      </TestWrapper>
    );

    expect(queryByText(/friends are training/)).toBeFalsy();
  });

  it('displays only first 3 friends as avatars', () => {
    const manyFriends = [
      { id: '1', name: 'Alex', avatarUrl: 'https://i.pravatar.cc/150?img=1' },
      { id: '2', name: 'Sarah', avatarUrl: 'https://i.pravatar.cc/150?img=2' },
      { id: '3', name: 'Mike', avatarUrl: 'https://i.pravatar.cc/150?img=3' },
      { id: '4', name: 'John', avatarUrl: 'https://i.pravatar.cc/150?img=4' },
      { id: '5', name: 'Jane', avatarUrl: 'https://i.pravatar.cc/150?img=5' },
    ];

    const { getByText } = render(
      <TestWrapper>
        <FriendsTrainingBanner friends={manyFriends} />
      </TestWrapper>
    );

    // Should still show total count
    expect(getByText('5 friends are training right now')).toBeTruthy();
  });

  it('has proper accessibility label', () => {
    const { getByLabelText } = render(
      <TestWrapper>
        <FriendsTrainingBanner friends={mockFriends} />
      </TestWrapper>
    );

    expect(getByLabelText('3 friends are training right now')).toBeTruthy();
  });
});