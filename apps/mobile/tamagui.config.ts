import { createTamagui } from '@tamagui/core';
import { config } from '@tamagui/config';
import { createFont } from '@tamagui/core';

const poppinsFont = createFont({
  family: 'Poppins',
  size: config.fonts.body.size,
  lineHeight: config.fonts.body.lineHeight,
  weight: config.fonts.body.weight,
  letterSpacing: config.fonts.body.letterSpacing,
  transform: config.fonts.body.transform,
  color: config.fonts.body.color,
  face: {
    400: { normal: 'Poppins' },
    500: { normal: 'Poppins-Medium' },
    600: { normal: 'Poppins-SemiBold' },
    700: { normal: 'Poppins-Bold' },
  },
});

const tamaguiConfig = createTamagui({
  ...config,
  fonts: {
    heading: poppinsFont,
    body: poppinsFont,
    mono: config.fonts.mono,
    // Override all font keys used by components
    true: poppinsFont,
    1: poppinsFont,
    2: poppinsFont,
    3: poppinsFont,
    4: poppinsFont,
    5: poppinsFont,
    6: poppinsFont,
    7: poppinsFont,
    8: poppinsFont,
    9: poppinsFont,
    10: poppinsFont,
  },
});

export default tamaguiConfig;

export type AppConfig = typeof tamaguiConfig;

declare module '@tamagui/core' {
  interface TamaguiCustomConfig extends AppConfig {}
}
