/**
 * Shopify-inspired theme for storefronts
 */

export const shopifyTheme = {
  // Primary colors
  colors: {
    primary: '#008060', // Shopify green
    primaryHover: '#006e52',
    primaryLight: '#e8f5f2',
    secondary: '#5C6AC4', // Shopify purple
    secondaryHover: '#4c59b3',
    
    // Neutrals
    background: '#FFFFFF',
    surface: '#F7F8FA',
    border: '#E1E3E5',
    borderHover: '#C9CCCF',
    
    // Text
    text: '#202223',
    textSecondary: '#6D7175',
    textTertiary: '#8C9196',
    
    // Status
    success: '#008060',
    warning: '#FFC453',
    error: '#D72C0D',
    info: '#5C6AC4',
    
    // Interactive
    interactive: '#2C6ECB',
    interactiveHover: '#1F5199',
  },
  
  // Typography
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.8125rem',  // 13px
      base: '0.875rem', // 14px
      md: '0.9375rem',  // 15px
      lg: '1rem',       // 16px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    }
  },
  
  // Spacing
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
  },
  
  // Border radius
  borderRadius: {
    sm: '0.375rem',  // 6px
    md: '0.5rem',    // 8px
    lg: '0.75rem',   // 12px
    full: '9999px',
  },
  
  // Shadows
  shadows: {
    sm: '0 1px 0 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    card: '0 0 0 1px rgba(0,0,0,.05), 0 1px 3px 0 rgba(0,0,0,.1)',
  }
};

export const shopifyClasses = {
  // Buttons
  button: {
    primary: 'bg-[#008060] hover:bg-[#006e52] text-white font-medium transition-colors',
    secondary: 'bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 font-medium transition-colors',
    outline: 'border-2 border-[#008060] text-[#008060] hover:bg-[#e8f5f2] font-medium transition-colors',
  },
  
  // Cards
  card: 'bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow',
  
  // Inputs
  input: 'border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-[#008060] focus:ring-1 focus:ring-[#008060] transition-colors',
  
  // Text
  heading: 'text-gray-900 font-semibold',
  subheading: 'text-gray-700 font-medium',
  body: 'text-gray-600',
  caption: 'text-gray-500 text-sm',
};

