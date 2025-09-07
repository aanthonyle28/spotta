import { styled, Text as TamaguiText, H1 as TamaguiH1, H2 as TamaguiH2, H3 as TamaguiH3, H4 as TamaguiH4, Button as TamaguiButton, Input as TamaguiInput } from 'tamagui';

// Custom components with Poppins as default font
export const Text = styled(TamaguiText, {
  fontFamily: 'Poppins',
});

export const H1 = styled(TamaguiH1, {
  fontFamily: 'Poppins',
  fontSize: 48,
  fontWeight: 'bold',
});

export const H2 = styled(TamaguiH2, {
  fontFamily: 'Poppins',
  fontSize: 24,
  fontWeight: '600',
});

export const H3 = styled(TamaguiH3, {
  fontFamily: 'Poppins',
  fontSize: 16,
  fontWeight: '500',
});

export const H4 = styled(TamaguiH4, {
  fontFamily: 'Poppins',
  fontSize: 14,
  fontWeight: '400',
});

export const Button = styled(TamaguiButton, {
  fontFamily: 'Poppins',
  fontSize: 14,
  fontWeight: '400',
});

export const Input = styled(TamaguiInput, {
  fontFamily: 'Poppins',
});

// Re-export all other components from tamagui unchanged
export * from 'tamagui';
export { Text, H1, H2, H3, H4, Button, Input };