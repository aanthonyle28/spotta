console.log('[DEBUG] Loading Tamagui imports...');
import { createTamagui } from '@tamagui/core';
import { config } from '@tamagui/config';
console.log('[DEBUG] Tamagui imports loaded, config available:', !!config);

console.log('[DEBUG] Using default config directly...');

const tamaguiConfig = createTamagui(config);

console.log('[DEBUG] Tamagui config created:', !!tamaguiConfig);
console.log('[DEBUG] Config has tokens:', !!tamaguiConfig?.tokens);

export default tamaguiConfig;

export type AppConfig = typeof tamaguiConfig;

declare module '@tamagui/core' {
  interface TamaguiCustomConfig extends AppConfig {}
}
