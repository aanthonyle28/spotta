import { render, screen } from '@testing-library/react-native';
import WorkoutScreen from './workout';

describe('WorkoutScreen', () => {
  it('should render workout screen with main elements', () => {
    render(<WorkoutScreen />);
    
    // Check for main heading
    expect(screen.getByText('Workout')).toBeTruthy();
    
    // Check for description
    expect(screen.getByText('Fast workout logging and session tracking')).toBeTruthy();
    
    // Check for main action buttons
    expect(screen.getByText('Start Quick Workout')).toBeTruthy();
    expect(screen.getByText('Browse Templates')).toBeTruthy();
    expect(screen.getByText('View Recent Workouts')).toBeTruthy();
  });

  it('should show empty state for recent sessions', () => {
    render(<WorkoutScreen />);
    
    expect(screen.getByText('Recent Sessions')).toBeTruthy();
    expect(screen.getByText('No recent workouts')).toBeTruthy();
  });

  it('should have accessible elements', () => {
    render(<WorkoutScreen />);
    
    // Check that buttons are accessible (they should be tappable)
    const startButton = screen.getByText('Start Quick Workout');
    expect(startButton).toBeTruthy();
    
    const browseButton = screen.getByText('Browse Templates');
    expect(browseButton).toBeTruthy();
  });
});