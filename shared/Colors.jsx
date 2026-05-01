export default {
    WHITE: "#fff",
    PRIMARY: '#8837ff',
    BLUE: '#3b82f6',
    GRAY: 'gray',
    SECONDARY: '#fbf5ff',
    GREEN: '#0D9E71'
};

export const lightTheme = {
  mode: 'light',
colors: {
    // Primary palette
    primary: '#8837ff',
    primaryLight: '#fbf5ff',
    primaryDark: '#6B2FCC',
    accent: '#0D9E71',
    blue: '#3b82f6',
    
    // Background hierarchy (Light mode)
    background: '#FFFFFF',     // Main white background
    surface: '#F7F7F7',       // Light gray for sections
    card: '#FFFFFF',          // White cards
    cardAlt: '#F8F9FA',       // Alternative card bg
    
    // Text hierarchy (Light mode)
    text: '#1A1A1A',          // Dark text - main
    textSecondary: '#666666',  // Medium gray
    textLight: '#999999',      // Light gray
    textInverse: '#FFFFFF',    // White text for dark backgrounds
    white: '#FFFFFF',
    
    // Input fields (Light mode)
    inputBg: '#F5F5F5',       // Light gray input bg
    inputBorder: '#E0E0E0',   // Visible border
    
    // UI Elements
    border: '#E5E7EB',        // Visible border
    divider: '#F0F0F0',       // Light divider
    
    // Status
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    
    // Special
    shadow: '#000',
    overlay: 'rgba(0,0,0,0.5)',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    round: 999,
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  fontWeight: {
    regular: '400',
    medium: '500',
    bold: '600',
    extrabold: '700',
  },
  shadows: {
    small: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    medium: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
  }
};

export const darkTheme = {
  ...lightTheme,
  mode: 'dark',
   colors: {
    // Primary palette (brighter for dark mode)
    primary: '#A66CFF',
    primaryLight: '#1E1033',
    primaryDark: '#8837ff',
    accent: '#10B981',
    blue: '#60A5FA',
    
    // Background hierarchy (Dark mode)
    background: '#0F0F1A',     // Very dark
    surface: '#1A1A2E',       // Dark blue-gray
    card: '#1E1E32',          // Slightly lighter cards
    cardAlt: '#252540',       // Alternative card bg
    
    // Text hierarchy (Dark mode)
    text: '#FFFFFF',          // White text
    textSecondary: '#D1D5DB', // Light gray
    textLight: '#9CA3AF',     // Medium gray
    textInverse: '#1A1A2E',   // Dark text for light backgrounds
    white: '#FFFFFF',
    
    // Input fields (Dark mode)
    inputBg: '#16162B',       // Dark input
    inputBorder: '#2A2A4A',   // Visible border
    
    // UI Elements
    border: '#2A2A4A',
    divider: '#1E1E3A',
    
    // Status
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    
    // Special
    shadow: '#000',
    overlay: 'rgba(0,0,0,0.7)',
  },
};


