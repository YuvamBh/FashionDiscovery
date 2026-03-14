import React from 'react';
import { Text, Pressable, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { MotiView } from 'moti';

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
  const getBackgroundColor = () => {
    switch (variant) {
      case 'primary': return '#ffffff';
      case 'secondary': return 'rgba(255,255,255,0.1)';
      case 'outline': return 'transparent';
      case 'google': return '#ffffff';
      default: return '#ffffff';
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'primary': return '#000000';
      case 'secondary': return '#ffffff';
      case 'outline': return '#ffffff';
      case 'google': return '#000000';
      default: return '#000000';
    }
  };

  return (
    <MotiView
      from={{ scale: 1 }}
      style={[styles.container, style]}
    >
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={({ pressed }) => [
          styles.button,
          {
            backgroundColor: getBackgroundColor(),
            borderColor: variant === 'outline' ? 'rgba(255,255,255,0.3)' : 'transparent',
            borderWidth: variant === 'outline' ? 1 : 0,
            opacity: disabled ? 0.5 : pressed ? 0.9 : 1,
            transform: [{ scale: pressed ? 0.97 : 1 }],
          },
        ]}
      >
        {icon && <MotiView style={styles.iconContainer}>{icon}</MotiView>}
        <Text
          style={[
            styles.text,
            { color: getTextColor() },
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
    marginVertical: 8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 30,
    width: '100%',
  },
  iconContainer: {
    marginRight: 10,
  },
  text: {
    fontFamily: 'Syne_600SemiBold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
});
