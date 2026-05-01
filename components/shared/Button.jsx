
import { ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export default function Button({ 
  title, 
  onPress, 
  loading = false,
  disabled = false,
  variant = 'primary', // primary, outline, ghost
  style,
  textStyle 
}) {
  const { theme } = useTheme();

  // Get button background based on variant
  const getBackgroundColor = () => {
    if (disabled) return theme.colors.border; // disabled state
    
    switch(variant) {
      case 'outline':
      case 'ghost':
        return 'transparent';
      default:
        return theme.colors.primary;
    }
  };

  // Get text color based on variant
  const getTextColor = () => {
    if (disabled) return theme.colors.textSecondary;
    
    switch(variant) {
      case 'outline':
      case 'ghost':
        return theme.colors.primary;
      default:
        return theme.colors.white;
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[{
        padding: 13,
        backgroundColor: getBackgroundColor(),
        width: "100%",
        borderRadius: theme.borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: variant === 'outline' ? 2 : 0,
        borderColor: variant === 'outline' ? theme.colors.primary : 'transparent',
        opacity: disabled ? 0.6 : 1,
      }, style]}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <Text style={[{
          fontSize: theme.fontSize.lg,
          color: getTextColor(),
          textAlign: "center",
          fontWeight: theme.fontWeight.bold,
        }, textStyle]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}