// Setup for React Native Testing Library
// Note: extend-expect is now built-in to @testing-library/react-native v12.4+

import type React from 'react';

// Mock Expo modules that don't work in Jest
jest.mock('expo-font', () => ({
  useFonts: () => [true, null],
}));

jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn(),
  hideAsync: jest.fn(),
}));

jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(() =>
    Promise.resolve({
      canceled: false,
      assets: [{ uri: 'file://test-image.jpg' }],
    })
  ),
  launchCameraAsync: jest.fn(() =>
    Promise.resolve({
      canceled: false,
      assets: [{ uri: 'file://test-camera.jpg' }],
    })
  ),
  MediaTypeOptions: {
    Images: 'Images',
  },
  ImagePickerOptions: {},
}));

jest.mock('expo-image', () => ({
  Image: ({
    children,
    ...props
  }: {
    children?: React.ReactNode;
    [key: string]: unknown;
  }) => {
    const React = require('react');
    const { View } = require('react-native');
    return React.createElement(
      View,
      { ...props, testID: 'expo-image' },
      children
    );
  },
}));

jest.mock('expo-router', () => ({
  Stack: ({ children }: { children: React.ReactNode }) => children,
  Tabs: ({ children }: { children: React.ReactNode }) => children,
  useLocalSearchParams: () => ({}),
  Redirect: () => null,
  Link: ({ children }: { children: React.ReactNode }) => children,
  router: {
    push: jest.fn(),
    back: jest.fn(),
    replace: jest.fn(),
    dismiss: jest.fn(),
  },
}));

// Mock React Native modules
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  getAllKeys: jest.fn(() => Promise.resolve([])),
  clear: jest.fn(() => Promise.resolve()),
}));

// Mock Tamagui
const MockedComponent = ({
  children,
  ...props
}: {
  children?: React.ReactNode;
  [key: string]: unknown;
}) => {
  const React = require('react');
  const { View } = require('react-native');
  return React.createElement(View, props, children);
};
const MockedText = ({
  children,
  ...props
}: {
  children?: React.ReactNode;
  [key: string]: unknown;
}) => {
  const React = require('react');
  const { Text } = require('react-native');
  return React.createElement(Text, props, children);
};
const MockedSheet = Object.assign(
  ({
    children,
    open,
    ...props
  }: {
    children?: React.ReactNode;
    open?: boolean;
    [key: string]: unknown;
  }) => {
    const React = require('react');
    const { View } = require('react-native');
    // Only render children when open is true (mimics Sheet behavior)
    return open ? React.createElement(View, props, children) : null;
  },
  {
    Overlay: MockedComponent,
    Handle: MockedComponent,
    Frame: MockedComponent,
  }
);
const MockedSelect = Object.assign(
  ({
    children,
    ...props
  }: {
    children?: React.ReactNode;
    [key: string]: unknown;
  }) => {
    const React = require('react');
    const { View } = require('react-native');
    return React.createElement(View, props, children);
  },
  {
    Trigger: MockedComponent,
    Value: MockedComponent,
    Content: MockedComponent,
    Item: MockedComponent,
    ItemText: MockedComponent,
    Viewport: MockedComponent,
    Group: MockedComponent,
    Label: MockedComponent,
  }
);

jest.mock('tamagui', () => ({
  YStack: MockedComponent,
  XStack: MockedComponent,
  H1: MockedText,
  H4: MockedText,
  Text: MockedText,
  Button: MockedComponent,
  Input: MockedComponent,
  Card: MockedComponent,
  Sheet: MockedSheet,
  Select: MockedSelect,
  TamaguiProvider: MockedComponent,
  createTamagui: () => ({}),
}));

// Mock Tamagui Lucide Icons
const MockedIcon = (props: { [key: string]: unknown }) => {
  const React = require('react');
  return React.createElement('span', {
    ...props,
    'data-testid': 'mocked-icon',
  });
};

jest.mock('@tamagui/lucide-icons', () => ({
  AlertTriangle: MockedIcon,
  Play: MockedIcon,
  RotateCcw: MockedIcon,
  X: MockedIcon,
  Plus: MockedIcon,
  Clock: MockedIcon,
  Trophy: MockedIcon,
  Dumbbell: MockedIcon,
  Users: MockedIcon,
  User: MockedIcon,
  ChevronLeft: MockedIcon,
  ChevronRight: MockedIcon,
  ArrowUpDown: MockedIcon,
  Target: MockedIcon,
  Edit3: MockedIcon,
  Trash2: MockedIcon,
  Check: MockedIcon,
  Camera: MockedIcon,
  Image: MockedIcon,
  Upload: MockedIcon,
  Share: MockedIcon,
}));

// Mock navigation
jest.mock('@react-navigation/native', () => ({
  useColorScheme: () => 'light',
  DarkTheme: {},
  DefaultTheme: {},
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
}));
