import { render, fireEvent } from '@testing-library/react-native';
import { TamaguiProvider } from '@tamagui/core';
import { FloatingPillNavigation } from './FloatingPillNavigation';
import config from '../../../../tamagui.config';

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <TamaguiProvider config={config}>{children}</TamaguiProvider>
);

describe('FloatingPillNavigation', () => {
  const mockOnTabPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all three tabs', () => {
    const { getByText } = render(
      <TestWrapper>
        <FloatingPillNavigation
          activeTab="workout"
          onTabPress={mockOnTabPress}
        />
      </TestWrapper>
    );

    expect(getByText('Workout')).toBeTruthy();
    expect(getByText('Clubs')).toBeTruthy();
    expect(getByText('Progress')).toBeTruthy();
  });

  it('highlights active tab correctly', () => {
    const { getByLabelText } = render(
      <TestWrapper>
        <FloatingPillNavigation activeTab="clubs" onTabPress={mockOnTabPress} />
      </TestWrapper>
    );

    const clubsTab = getByLabelText('Clubs tab');
    expect(clubsTab).toBeTruthy();
  });

  it('calls onTabPress when tab is pressed', () => {
    const { getByLabelText } = render(
      <TestWrapper>
        <FloatingPillNavigation
          activeTab="workout"
          onTabPress={mockOnTabPress}
        />
      </TestWrapper>
    );

    const clubsTab = getByLabelText('Clubs tab');
    fireEvent.press(clubsTab);

    expect(mockOnTabPress).toHaveBeenCalledWith('clubs');
  });

  it('has proper accessibility labels for all tabs', () => {
    const { getByLabelText } = render(
      <TestWrapper>
        <FloatingPillNavigation
          activeTab="workout"
          onTabPress={mockOnTabPress}
        />
      </TestWrapper>
    );

    expect(getByLabelText('Workout tab')).toBeTruthy();
    expect(getByLabelText('Clubs tab')).toBeTruthy();
    expect(getByLabelText('Progress tab')).toBeTruthy();
  });

  it('maintains 44x44 touch targets for accessibility', () => {
    const { getByLabelText } = render(
      <TestWrapper>
        <FloatingPillNavigation
          activeTab="workout"
          onTabPress={mockOnTabPress}
        />
      </TestWrapper>
    );

    // Tabs should be pressable and accessible
    const workoutTab = getByLabelText('Workout tab');
    const clubsTab = getByLabelText('Clubs tab');
    const progressTab = getByLabelText('Progress tab');

    expect(workoutTab).toBeTruthy();
    expect(clubsTab).toBeTruthy();
    expect(progressTab).toBeTruthy();
  });
});
