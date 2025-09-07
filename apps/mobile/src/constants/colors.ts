// Spotta Design System Colors
export const SPOTTA_COLORS = {
  // Brand colors
  purple: '#9956D4', // Primary action color (Start Empty button, Find Templates)
  blue: '#219BD8', // Secondary action color (template Start buttons, Browse Exercises)

  // Dark theme backgrounds
  background: '#0D0D0D', // Main background
  cardBackground: '#202122', // Card backgrounds

  // Discover section colors
  browseExercises: '#152D39', // Dark teal for Browse Exercises tile
  findTemplates: '#2D1F38', // Dark purple for Find Templates tile
} as const;

// Type for design system colors
export type SpottaColor = (typeof SPOTTA_COLORS)[keyof typeof SPOTTA_COLORS];
