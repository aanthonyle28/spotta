module.exports = {
  extends: ['expo', '@react-native'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  ignorePatterns: [
    'coverage/**/*', // Exclude coverage reports from linting
  ],
  rules: {
    // Customize rules here
    '@typescript-eslint/no-unused-vars': 'error',
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'prefer-const': 'error',
  },
  overrides: [
    {
      files: ['**/*.spec.ts', '**/*.spec.tsx', '**/*.test.ts', '**/*.test.tsx'],
      env: {
        jest: true,
      },
      rules: {
        'no-console': 'off',
      },
    },
    {
      files: ['src/utils/logger.ts', '**/utils/logger.ts'],
      rules: {
        'no-console': 'off', // Logger utility is allowed to use console methods
      },
    },
  ],
};
