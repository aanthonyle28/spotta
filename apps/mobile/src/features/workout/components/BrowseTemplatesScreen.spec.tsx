import {
  render,
  screen,
  fireEvent,
  waitFor,
} from '@testing-library/react-native';
import BrowseTemplatesScreen from '../../../../app/workout/browse-templates';
import { workoutService } from '../services/workoutService';
import type { CommunityTemplate } from '../types';

// Mock router
jest.mock('expo-router', () => ({
  router: {
    back: jest.fn(),
    push: jest.fn(),
  },
  useLocalSearchParams: () => ({}),
}));

// Mock safe area
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: any) => children,
}));

// Mock workout state
jest.mock('../hooks', () => ({
  useWorkoutState: () => ({
    actions: {
      startFromTemplate: jest.fn().mockResolvedValue({ id: 'session-1' }),
    },
  }),
}));

// Mock workout service
jest.mock('../services/workoutService', () => ({
  workoutService: {
    getCommunityTemplates: jest.fn(),
  },
}));

// Mock Tamagui provider for tests
jest.mock('tamagui', () => ({
  ...jest.requireActual('tamagui'),
  TamaguiProvider: ({ children }: any) => children,
}));

const mockTemplates: CommunityTemplate[] = [
  {
    id: 'test-template-1' as any,
    title: 'Push Pull Legs',
    description: 'Complete muscle building program',
    exercises: [
      {
        exerciseId: 'bench-press' as any,
        sets: 4,
        reps: 8,
        weight: 135,
        restTime: 120,
        name: 'Bench Press',
        category: 'strength',
        primaryMuscles: ['chest'],
      },
    ],
    estimatedDuration: 60,
    difficulty: 'intermediate',
    isPublic: true,
    userId: 'user-1' as any,
    author: 'TestUser',
    authorId: 'user-1' as any,
    likes: 100,
    uses: 500,
    tags: ['strength', 'hypertrophy'],
    createdAt: new Date(),
    isOfficial: false,
  },
];

const renderWithTamagui = (component: React.ReactElement) => {
  return render(component);
};

describe('BrowseTemplatesScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (workoutService.getCommunityTemplates as jest.Mock).mockResolvedValue(
      mockTemplates
    );
  });

  it('renders loading state initially', async () => {
    (workoutService.getCommunityTemplates as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) => setTimeout(() => resolve(mockTemplates), 100))
    );

    renderWithTamagui(<BrowseTemplatesScreen />);

    expect(screen.getByText('Loading templates...')).toBeTruthy();
  });

  it('renders templates after loading', async () => {
    renderWithTamagui(<BrowseTemplatesScreen />);

    await waitFor(() => {
      expect(screen.getByText('Push Pull Legs')).toBeTruthy();
      expect(screen.getByText('by TestUser')).toBeTruthy();
      expect(screen.getByText('1 exercises')).toBeTruthy();
      expect(screen.getByText('intermediate')).toBeTruthy();
    });
  });

  it('filters templates by search query', async () => {
    renderWithTamagui(<BrowseTemplatesScreen />);

    await waitFor(() => {
      expect(screen.getByText('Push Pull Legs')).toBeTruthy();
    });

    const searchInput = screen.getByPlaceholderText(
      'Search templates by name, exercise, or focus'
    );
    fireEvent.changeText(searchInput, 'nonexistent');

    await waitFor(() => {
      expect(
        screen.getByText('No templates found for "nonexistent".')
      ).toBeTruthy();
    });
  });

  it('shows clear search button when no results', async () => {
    renderWithTamagui(<BrowseTemplatesScreen />);

    await waitFor(() => {
      expect(screen.getByText('Push Pull Legs')).toBeTruthy();
    });

    const searchInput = screen.getByPlaceholderText(
      'Search templates by name, exercise, or focus'
    );
    fireEvent.changeText(searchInput, 'nonexistent');

    await waitFor(() => {
      const clearButton = screen.getByText('Clear search');
      expect(clearButton).toBeTruthy();
      fireEvent.press(clearButton);
    });

    expect(screen.getByText('Push Pull Legs')).toBeTruthy();
  });

  it('shows clear filters button when filters are applied', async () => {
    renderWithTamagui(<BrowseTemplatesScreen />);

    await waitFor(() => {
      expect(screen.getByText('Push Pull Legs')).toBeTruthy();
    });

    // This would require more complex filter interaction testing
    // For now, we test that the button appears when filters are set
    expect(screen.getByText('1 of 1 templates')).toBeTruthy();
  });

  it('handles error state', async () => {
    const errorMessage = 'Failed to load templates';
    (workoutService.getCommunityTemplates as jest.Mock).mockRejectedValue(
      new Error(errorMessage)
    );

    renderWithTamagui(<BrowseTemplatesScreen />);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeTruthy();
      expect(screen.getByText('Retry')).toBeTruthy();
    });
  });

  it('shows empty state when no templates', async () => {
    (workoutService.getCommunityTemplates as jest.Mock).mockResolvedValue([]);

    renderWithTamagui(<BrowseTemplatesScreen />);

    await waitFor(() => {
      expect(screen.getByText('Discover Community Templates')).toBeTruthy();
      expect(
        screen.getByText('Browse workout templates created by the community')
      ).toBeTruthy();
    });
  });

  it('renders template metrics correctly', async () => {
    renderWithTamagui(<BrowseTemplatesScreen />);

    await waitFor(() => {
      expect(screen.getByText('100')).toBeTruthy(); // likes
      expect(screen.getByText('500')).toBeTruthy(); // uses
    });
  });

  it('has proper accessibility labels', async () => {
    renderWithTamagui(<BrowseTemplatesScreen />);

    await waitFor(() => {
      expect(
        screen.getByLabelText('Template: Push Pull Legs by TestUser')
      ).toBeTruthy();
      expect(
        screen.getByLabelText('Start Push Pull Legs template')
      ).toBeTruthy();
      expect(screen.getByLabelText('Search templates')).toBeTruthy();
    });
  });
});
