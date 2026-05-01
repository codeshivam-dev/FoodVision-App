// components/UIComponents.jsx - Fix component backgrounds
import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTheme } from '../context/ThemeContext';

// Fixed Box component
export const Box = ({ children, bg, style, ...props }) => {
  const { theme } = useTheme();
  
  const getBackgroundColor = () => {
    if (bg === 'transparent') return 'transparent';
    if (bg === 'surface') return theme.colors.surface;
    if (bg === 'card') return theme.colors.card;
    return bg || theme.colors.background;
  };
  
  return (
    <View style={[{ backgroundColor: getBackgroundColor() }, style]} {...props}>
      {children}
    </View>
  );
};

// Fixed Card - Always visible in both modes
export const Card = ({ children, style, variant = 'elevated', ...props }) => {
  const { theme } = useTheme();
  
  const getCardStyle = () => {
    const base = {
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
    };
    
    switch(variant) {
      case 'flat':
        return {
          ...base,
          backgroundColor: theme.colors.surface,
        };
      case 'outlined':
        return {
          ...base,
          backgroundColor: theme.colors.card,
          borderWidth: 1,
          borderColor: theme.colors.border,
        };
      default: // elevated
        return {
          ...base,
          backgroundColor: theme.colors.card,
          ...theme.shadows.small,
        };
    }
  };
  
  return (
    <View style={[getCardStyle(), style]} {...props}>
      {children}
    </View>
  );
};

// Fixed Button - Better contrast
export const Button = ({ 
  title, 
  onPress, 
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  textStyle,
  children 
}) => {
  const { theme } = useTheme();
  
  const getButtonStyle = () => {
    if (disabled) return { backgroundColor: theme.colors.disabled || theme.colors.border };
    
    switch(variant) {
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderColor: theme.colors.primary,
        };
      case 'ghost':
        return { backgroundColor: 'transparent' };
      default:
        return { backgroundColor: theme.colors.primary };
    }
  };
  
  const getTextColor = () => {
    if (disabled) return theme.colors.textSecondary;
    return variant === 'primary' ? theme.colors.white : theme.colors.primary;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[{
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: theme.borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 8,
        opacity: disabled ? 0.6 : 1,
        ...getButtonStyle()
      }, style]}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : children || (
        <Text style={[{
          color: getTextColor(),
          fontSize: theme.fontSize.md,
          fontWeight: theme.fontWeight.bold,
        }, textStyle]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

// Fixed Text - Always visible with fallback
export const Txt = ({ children, style, size, color, bold, ...props }) => {
  const { theme } = useTheme();
  
  return (
    <Text style={[{
      color: color || theme.colors.text, // Always has a visible color
      fontSize: size || theme.fontSize.md,
      fontWeight: bold ? theme.fontWeight.bold : theme.fontWeight.regular,
    }, style]} {...props}>
      {children}
    </Text>
  );
};

// Fixed Input
export const Input = ({ 
  label, 
  error,
  icon,
  rightIcon,
  style,
  containerStyle,
  ...props 
}) => {
  const { theme } = useTheme();
  
  return (
    <View style={[{ marginBottom: theme.spacing.md }, containerStyle]}>
      {label && (
        <Text style={{
          color: theme.colors.text,
          fontSize: theme.fontSize.sm,
          fontWeight: theme.fontWeight.medium,
          marginBottom: theme.spacing.xs,
        }}>
          {label}
        </Text>
      )}
      <View style={{ position: 'relative' }}>
        {icon && (
          <View style={{ position: 'absolute', left: 12, top: 14, zIndex: 1 }}>
            {icon}
          </View>
        )}
        <TextInput
          style={[{
            backgroundColor: theme.colors.inputBg,
            borderRadius: theme.borderRadius.md,
            paddingVertical: 12,
            paddingHorizontal: 16,
            paddingLeft: icon ? 44 : 16,
            paddingRight: rightIcon ? 44 : 16,
            color: theme.colors.text,
            fontSize: theme.fontSize.md,
            borderWidth: 1,
            borderColor: error ? theme.colors.error : theme.colors.inputBorder,
          }, style]}
          placeholderTextColor={theme.colors.textLight}
          {...props}
        />
        {rightIcon && (
          <View style={{ position: 'absolute', right: 12, top: 14 }}>
            {rightIcon}
          </View>
        )}
      </View>
      {error && (
        <Text style={{
          color: theme.colors.error,
          fontSize: theme.fontSize.xs,
          marginTop: theme.spacing.xs,
        }}>
          {error}
        </Text>
      )}
    </View>
  );
};

// Fixed Badge
export const Badge = ({ title, color, style }) => {
  const { theme } = useTheme();
  const badgeColor = color || theme.colors.primary;
  
  return (
    <View style={[{
      backgroundColor: badgeColor + '20',
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: theme.borderRadius.round,
    }, style]}>
      <Text style={{ 
        color: badgeColor, 
        fontSize: 12, 
        fontWeight: '600' 
      }}>
        {title}
      </Text>
    </View>
  );
};

export const Divider = ({ style }) => {
  const { theme } = useTheme();
  return (
    <View style={[{ 
      height: 1, 
      backgroundColor: theme.colors.divider,
    }, style]} />
  );
};