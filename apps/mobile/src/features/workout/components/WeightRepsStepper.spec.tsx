import { render, screen, fireEvent } from '@testing-library/react-native';
import { TamaguiProvider, createTamagui } from '@tamagui/core';
import { config } from '@tamagui/config';
import { WeightRepsStepper } from './WeightRepsStepper';

const testConfig = createTamagui(config);

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <TamaguiProvider config={testConfig}>{children}</TamaguiProvider>
);

describe('WeightRepsStepper', () => {
  const mockProps = {
    weight: 135,
    reps: 8,
    onWeightChange: jest.fn(),
    onRepsChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('displays current weight and reps values', () => {
    render(
      <TestWrapper>
        <WeightRepsStepper {...mockProps} />
      </TestWrapper>
    );

    expect(screen.getByText('135')).toBeTruthy();
    expect(screen.getByText('8')).toBeTruthy();
  });

  it('shows weight and reps labels', () => {
    render(
      <TestWrapper>
        <WeightRepsStepper {...mockProps} />
      </TestWrapper>
    );

    expect(screen.getByText('Weight')).toBeTruthy();
    expect(screen.getByText('Reps')).toBeTruthy();
  });

  it('calls onWeightChange when weight increment is pressed', () => {
    render(
      <TestWrapper>
        <WeightRepsStepper {...mockProps} />
      </TestWrapper>
    );

    const incrementButton = screen.getByLabelText('Increase weight');
    fireEvent.press(incrementButton);

    expect(mockProps.onWeightChange).toHaveBeenCalledWith(140); // 135 + 5 (default step)
  });

  it('calls onWeightChange when weight decrement is pressed', () => {
    render(
      <TestWrapper>
        <WeightRepsStepper {...mockProps} />
      </TestWrapper>
    );

    const decrementButton = screen.getByLabelText('Decrease weight');
    fireEvent.press(decrementButton);

    expect(mockProps.onWeightChange).toHaveBeenCalledWith(130); // 135 - 5
  });

  it('calls onRepsChange when reps increment is pressed', () => {
    render(
      <TestWrapper>
        <WeightRepsStepper {...mockProps} />
      </TestWrapper>
    );

    const incrementButton = screen.getByLabelText('Increase reps');
    fireEvent.press(incrementButton);

    expect(mockProps.onRepsChange).toHaveBeenCalledWith(9); // 8 + 1
  });

  it('calls onRepsChange when reps decrement is pressed', () => {
    render(
      <TestWrapper>
        <WeightRepsStepper {...mockProps} />
      </TestWrapper>
    );

    const decrementButton = screen.getByLabelText('Decrease reps');
    fireEvent.press(decrementButton);

    expect(mockProps.onRepsChange).toHaveBeenCalledWith(7); // 8 - 1
  });

  it('respects minimum weight constraint', () => {
    render(
      <TestWrapper>
        <WeightRepsStepper {...mockProps} weight={0} minWeight={0} />
      </TestWrapper>
    );

    const decrementButton = screen.getByLabelText('Decrease weight');
    expect(decrementButton.props.accessibilityState?.disabled).toBe(true);
  });

  it('respects maximum weight constraint', () => {
    render(
      <TestWrapper>
        <WeightRepsStepper {...mockProps} weight={500} maxWeight={500} />
      </TestWrapper>
    );

    const incrementButton = screen.getByLabelText('Increase weight');
    expect(incrementButton.props.accessibilityState?.disabled).toBe(true);
  });

  it('respects minimum reps constraint', () => {
    render(
      <TestWrapper>
        <WeightRepsStepper {...mockProps} reps={0} minReps={0} />
      </TestWrapper>
    );

    const decrementButton = screen.getByLabelText('Decrease reps');
    expect(decrementButton.props.accessibilityState?.disabled).toBe(true);
  });

  it('respects maximum reps constraint', () => {
    render(
      <TestWrapper>
        <WeightRepsStepper {...mockProps} reps={50} maxReps={50} />
      </TestWrapper>
    );

    const incrementButton = screen.getByLabelText('Increase reps');
    expect(incrementButton.props.accessibilityState?.disabled).toBe(true);
  });

  it('uses custom weight step', () => {
    render(
      <TestWrapper>
        <WeightRepsStepper {...mockProps} weightStep={2.5} />
      </TestWrapper>
    );

    const incrementButton = screen.getByLabelText('Increase weight');
    fireEvent.press(incrementButton);

    expect(mockProps.onWeightChange).toHaveBeenCalledWith(137.5); // 135 + 2.5
  });

  it('uses custom reps step', () => {
    render(
      <TestWrapper>
        <WeightRepsStepper {...mockProps} repsStep={2} />
      </TestWrapper>
    );

    const incrementButton = screen.getByLabelText('Increase reps');
    fireEvent.press(incrementButton);

    expect(mockProps.onRepsChange).toHaveBeenCalledWith(10); // 8 + 2
  });

  it('disables all buttons when disabled prop is true', () => {
    render(
      <TestWrapper>
        <WeightRepsStepper {...mockProps} disabled={true} />
      </TestWrapper>
    );

    const buttons = [
      screen.getByLabelText('Decrease weight'),
      screen.getByLabelText('Increase weight'),
      screen.getByLabelText('Decrease reps'),
      screen.getByLabelText('Increase reps'),
    ];

    buttons.forEach((button) => {
      expect(button.props.accessibilityState?.disabled).toBe(true);
    });
  });
});
