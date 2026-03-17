import React from 'react';
import { Text, Pressable, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { MotiView } from 'moti';

import { useHaptics } from '../lib/useHaptics';

interface AnimatedButtonProps {
  onPress: () => void;
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'google';
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  onPress,
  title,
  variant = 'primary',
  style,
  textStyle,
  icon,
  disabled = false,
}) => {
  const haptics = useHaptics();

  const getBackgroundColor = () => {
    switch (variant) {
      case 'primary': return '#ffffff';
      case 'secondary': return 'transparent'; // Reverted to transparent with border
      case 'outline': return 'transparent';
      case 'google': return '#ffffff';
      default: return '#ffffff';
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'primary': return '#000000';
      case 'secondary': return 'rgba(255,255,255,0.7)'; // Reverted to tertiary/dimmed
      case 'outline': return '#ffffff';
      case 'google': return '#000000';
      default: return '#000000';
    }
  };

  const handlePress = () => {
    haptics.light();
    onPress();
  };

  return (
    <MotiView
      from={{ scale: 1 }}
      style={[styles.container, style]}
    >
      <Pressable
        onPress={handlePress}
        disabled={disabled}
        style={({ pressed }) => [
          styles.button,
          {
            backgroundColor: getBackgroundColor(),
            borderColor: variant === 'secondary' || variant === 'outline' 
              ? 'rgba(255,255,255,0.1)' 
              : 'transparent',
            borderWidth: variant === 'secondary' || variant === 'outline' ? 1 : 0,
            paddingVertical: variant === 'google' || variant === 'primary' ? 18 : 16,
            opacity: disabled ? 0.5 : pressed ? 0.9 : 1,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          },
        ]}
      >
        {icon && <MotiView style={styles.iconContainer}>{icon}</MotiView>}
        <Text
          style={[
            styles.text,
            { 
              color: getTextColor(),
              fontFamily: variant === 'google' ? 'Inter_600SemiBold' : 'Syne_600SemiBold',
              fontSize: variant === 'google' ? 15 : 16,
            },
            textStyle,
          ]}
        >
          {title}
        </Text>
      </Pressable>
    </MotiView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 4,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    borderRadius: 30,
    width: '100%',
  },
  iconContainer: {
    marginRight: 12,
  },
  text: {
    letterSpacing: 0.5,
  },
});
