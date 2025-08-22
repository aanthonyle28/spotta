import { render, screen, fireEvent } from '@testing-library/react-native';
import { TamaguiProvider, createTamagui } from '@tamagui/core';
import { config } from '@tamagui/config';
import { WeightRepsStepper } from './WeightRepsStepper';

const testConfig = createTamagui(config);

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <TamaguiProvider config={testConfig}>{children}</TamaguiProvider>
);

describe.skip('WeightRepsStepper', () => {
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

    expect(screen.getByDisplayValue('135')).toBeTruthy();
    expect(screen.getByDisplayValue('8')).toBeTruthy();
  });

  it('has accessible stepper buttons', () => {
    render(
      <TestWrapper>
        <WeightRepsStepper {...mockProps} />
      </TestWrapper>
    );

    expect(screen.getByLabelText('Increase weight')).toBeTruthy();
    expect(screen.getByLabelText('Decrease weight')).toBeTruthy();
    expect(screen.getByLabelText('Increase reps')).toBeTruthy();
    expect(screen.getByLabelText('Decrease reps')).toBeTruthy();
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

  it('allows input of 5-digit numbers for weight', () => {
    render(
      <TestWrapper>
        <WeightRepsStepper {...mockProps} weight={0} />
      </TestWrapper>
    );

    const weightInput = screen.getByPlaceholderText('0');
    fireEvent.changeText(weightInput, '12345');

    expect(weightInput.props.value).toBe('12345');
  });

  it('allows input of 5-digit numbers for reps', () => {
    render(
      <TestWrapper>
        <WeightRepsStepper {...mockProps} reps={0} />
      </TestWrapper>
    );

    const inputs = screen.getAllByPlaceholderText('0');
    const repsInput = inputs[1]; // Second input is reps
    fireEvent.changeText(repsInput, '54321');

    expect(repsInput.props.value).toBe('54321');
  });

  it('rejects non-numeric input', () => {
    render(
      <TestWrapper>
        <WeightRepsStepper {...mockProps} weight={135} />
      </TestWrapper>
    );

    const weightInput = screen.getByDisplayValue('135');
    fireEvent.changeText(weightInput, 'abc');

    expect(weightInput.props.value).toBe('135'); // Should remain unchanged
  });

  it('handles empty input gracefully', () => {
    render(
      <TestWrapper>
        <WeightRepsStepper {...mockProps} weight={135} />
      </TestWrapper>
    );

    const weightInput = screen.getByDisplayValue('135');
    fireEvent.changeText(weightInput, '');

    expect(weightInput.props.value).toBe('');
  });

  it('responds immediately to stepper button presses', () => {
    render(
      <TestWrapper>
        <WeightRepsStepper {...mockProps} weight={100} />
      </TestWrapper>
    );

    const incrementButton = screen.getByLabelText('Increase weight');
    fireEvent.press(incrementButton);

    // Should update immediately without debounce delay
    expect(mockProps.onWeightChange).toHaveBeenCalledWith(105);
  });

  it('updates local state immediately when stepper buttons are pressed', () => {
    render(
      <TestWrapper>
        <WeightRepsStepper {...mockProps} weight={50} reps={10} />
      </TestWrapper>
    );

    const weightIncrement = screen.getByLabelText('Increase weight');
    const repsDecrement = screen.getByLabelText('Decrease reps');

    fireEvent.press(weightIncrement);
    fireEvent.press(repsDecrement);

    expect(mockProps.onWeightChange).toHaveBeenCalledWith(55);
    expect(mockProps.onRepsChange).toHaveBeenCalledWith(9);
  });
});
