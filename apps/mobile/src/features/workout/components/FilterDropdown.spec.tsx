import { render, fireEvent } from '@testing-library/react-native';
import { TamaguiProvider } from '@tamagui/core';
import { createTamagui } from '@tamagui/core';
import { config } from '@tamagui/config';
import { FilterDropdown } from './FilterDropdown';

const tamaguiConfig = createTamagui(config);

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <TamaguiProvider config={tamaguiConfig}>{children}</TamaguiProvider>
);

describe.skip('FilterDropdown', () => {
  const mockOnValueChange = jest.fn();
  const mockOptions = ['strength', 'cardio', 'flexibility'];

  beforeEach(() => {
    mockOnValueChange.mockClear();
  });

  it('renders with placeholder when value is "all"', () => {
    const { getByText } = render(
      <TestWrapper>
        <FilterDropdown
          placeholder="All Categories"
          options={mockOptions}
          value="all"
          onValueChange={mockOnValueChange}
        />
      </TestWrapper>
    );

    expect(getByText('All Categories')).toBeTruthy();
  });

  it('renders with selected value when not "all"', () => {
    const { getByText } = render(
      <TestWrapper>
        <FilterDropdown
          placeholder="All Categories"
          options={mockOptions}
          value="strength"
          onValueChange={mockOnValueChange}
        />
      </TestWrapper>
    );

    expect(getByText('Strength')).toBeTruthy();
  });

  it('opens sheet when pressed', () => {
    const { getByText, getByAccessibilityHint } = render(
      <TestWrapper>
        <FilterDropdown
          placeholder="All Categories"
          options={mockOptions}
          value="all"
          onValueChange={mockOnValueChange}
          accessibilityLabel="Filter by category"
        />
      </TestWrapper>
    );

    const button = getByText('All Categories');
    fireEvent.press(button);

    // Sheet should be open and show options
    expect(getByText('All')).toBeTruthy();
    expect(getByText('Strength')).toBeTruthy();
  });

  it('calls onValueChange when option is selected', () => {
    const { getByText } = render(
      <TestWrapper>
        <FilterDropdown
          placeholder="All Categories"
          options={mockOptions}
          value="all"
          onValueChange={mockOnValueChange}
        />
      </TestWrapper>
    );

    const button = getByText('All Categories');
    fireEvent.press(button);

    const strengthOption = getByText('Strength');
    fireEvent.press(strengthOption);

    expect(mockOnValueChange).toHaveBeenCalledWith('strength');
  });

  it('formats option names correctly', () => {
    const optionsWithDash = ['resistance-band', 'medicine-ball'];

    const { getByText } = render(
      <TestWrapper>
        <FilterDropdown
          placeholder="All Equipment"
          options={optionsWithDash}
          value="all"
          onValueChange={mockOnValueChange}
        />
      </TestWrapper>
    );

    const button = getByText('All Equipment');
    fireEvent.press(button);

    expect(getByText('Resistance band')).toBeTruthy();
    expect(getByText('Medicine ball')).toBeTruthy();
  });
});
