import { render, fireEvent } from '@testing-library/react-native';
import { TamaguiProvider } from '@tamagui/core';
import { createTamagui } from '@tamagui/core';
import { config } from '@tamagui/config';
import { FilterRow } from './FilterRow';

const tamaguiConfig = createTamagui(config);

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <TamaguiProvider config={tamaguiConfig}>{children}</TamaguiProvider>
);

describe.skip('FilterRow', () => {
  const mockProps = {
    categoryOptions: ['strength', 'cardio'],
    selectedCategory: 'all',
    onCategoryChange: jest.fn(),
    muscleOptions: ['chest', 'back'],
    selectedMuscle: 'all',
    onMuscleChange: jest.fn(),
    equipmentOptions: ['barbell', 'dumbbell'],
    selectedEquipment: 'all',
    onEquipmentChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all three filter dropdowns', () => {
    const { getByText } = render(
      <TestWrapper>
        <FilterRow {...mockProps} />
      </TestWrapper>
    );

    expect(getByText('All Categories')).toBeTruthy();
    expect(getByText('All Muscles')).toBeTruthy();
    expect(getByText('All Equipment')).toBeTruthy();
  });

  it('calls correct change handlers when filters are modified', () => {
    const { getByText } = render(
      <TestWrapper>
        <FilterRow {...mockProps} />
      </TestWrapper>
    );

    // Test category filter
    fireEvent.press(getByText('All Categories'));
    fireEvent.press(getByText('Strength'));
    expect(mockProps.onCategoryChange).toHaveBeenCalledWith('strength');

    // Test muscle filter
    fireEvent.press(getByText('All Muscles'));
    fireEvent.press(getByText('Chest'));
    expect(mockProps.onMuscleChange).toHaveBeenCalledWith('chest');

    // Test equipment filter
    fireEvent.press(getByText('All Equipment'));
    fireEvent.press(getByText('Barbell'));
    expect(mockProps.onEquipmentChange).toHaveBeenCalledWith('barbell');
  });

  it('displays selected values correctly', () => {
    const propsWithSelection = {
      ...mockProps,
      selectedCategory: 'strength',
      selectedMuscle: 'chest',
      selectedEquipment: 'barbell',
    };

    const { getByText } = render(
      <TestWrapper>
        <FilterRow {...propsWithSelection} />
      </TestWrapper>
    );

    expect(getByText('Strength')).toBeTruthy();
    expect(getByText('Chest')).toBeTruthy();
    expect(getByText('Barbell')).toBeTruthy();
  });

  it('has proper accessibility labels', () => {
    const { getByRole } = render(
      <TestWrapper>
        <FilterRow {...mockProps} />
      </TestWrapper>
    );

    // Test that buttons with accessibility labels are rendered
    expect(getByRole('button', { name: 'Filter by category' })).toBeTruthy();
    expect(
      getByRole('button', { name: 'Filter by muscle group' })
    ).toBeTruthy();
    expect(getByRole('button', { name: 'Filter by equipment' })).toBeTruthy();
  });
});
