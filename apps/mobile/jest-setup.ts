// Setup for React Native Testing Library
// Note: extend-expect is now built-in to @testing-library/react-native v12.4+

// Mock Expo modules that don't work in Jest
jest.mock('expo-font', () => ({
  useFonts: () => [true, null],
}));

jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn(),
  hideAsync: jest.fn(),
}));

jest.mock('expo-router', () => ({
  Stack: ({ children }: { children: React.ReactNode }) => children,
  Tabs: ({ children }: { children: React.ReactNode }) => children,
  useLocalSearchParams: () => ({}),
  Redirect: () => null,
  Link: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock React Native modules
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock Tamagui
jest.mock('tamagui', () => ({
  YStack: ({ children }: { children: React.ReactNode }) => children,
  XStack: ({ children }: { children: React.ReactNode }) => children,
  H1: ({ children }: { children: React.ReactNode }) => children,
  Text: ({ children }: { children: React.ReactNode }) => children,
  Button: ({ children }: { children: React.ReactNode }) => children,
  Input: () => null,
}));

// Mock navigation
jest.mock('@react-navigation/native', () => ({
  useColorScheme: () => 'light',
  DarkTheme: {},
  DefaultTheme: {},
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
}));