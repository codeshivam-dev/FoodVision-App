import { View, Text, TextInput } from 'react-native';
import React from 'react';
import { useTheme } from '../../context/ThemeContext';

export default function Input({ 
  placeholder, 
  onChangeText, 
  password = false, 
  label,
  value,
  keyboardType = 'default',
  autoCapitalize = 'none',
  leftIcon,
  rightIcon,
  style 
}) {
  const { theme } = useTheme();

  return (
    <View style={{ marginBottom: theme.spacing.md }}>
      {label && (
        <Text style={{ 
          fontSize: theme.fontSize.md, 
          fontWeight: theme.fontWeight.medium, 
          color: theme.colors.text 
        }}>
          {label}
        </Text>
      )}
      
      <View style={{ position: 'relative', marginTop: label ? 15 : 0 }}>
        {leftIcon && (
          <View style={{ position: 'absolute', left: 14, top:38, zIndex: 1 }}>
            {leftIcon}
          </View>
        )}
        
        <TextInput 
          placeholder={placeholder}
          value={value}
          secureTextEntry={password}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onChangeText={(value) => onChangeText(value)}
          placeholderTextColor={theme.colors.textLight}
          style={[{
            padding: 15,
            borderWidth: 1,
            borderColor: theme.colors.inputBorder,
            borderRadius: theme.borderRadius.md,
            width: "100%",
            paddingVertical: 20,
            fontSize: theme.fontSize.lg,
            marginTop: 15,
            backgroundColor: theme.colors.inputBg,
            color: theme.colors.text,
            paddingLeft: leftIcon ? 44 : 15,
            paddingRight: rightIcon ? 44 : 15,
          }, style]}
        />
        
        {rightIcon && (
          <View style={{ position: 'absolute', right: 14, top: 20, zIndex: 1 }}>
            {rightIcon}
          </View>
        )}
      </View>
    </View>
  );
}