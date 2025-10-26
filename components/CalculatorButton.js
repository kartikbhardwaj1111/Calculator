import React, { useRef, useEffect } from 'react';
import { TouchableOpacity, Text, Vibration, Platform, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, animations } from '../styles/globalStyles';
import { Ionicons } from '@expo/vector-icons';

const CalculatorButton = ({ 
  title, 
  onPress, 
  type = 'number', 
  isWide = false,
  isPressed = false,
  theme = 'dark'
}) => {
  // Animated values
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const glowOpacity = useSharedValue(0);
  const rippleScale = useSharedValue(0);

  // Handle press in with enhanced animations
  const handlePressIn = () => {
    // Scale animation with spring
    scale.value = withSpring(animations.pressScale, {
      damping: 15,
      stiffness: 300,
    });

    // Glow effect for special buttons
    if (type === 'operator' || type === 'equals') {
      glowOpacity.value = withTiming(0.3, { duration: animations.fast });
    }

    // Ripple effect
    rippleScale.value = withTiming(1, { duration: animations.medium });

    // Enhanced haptic feedback
    runOnJS(triggerHapticFeedback)();
  };

  // Handle press out
  const handlePressOut = () => {
    scale.value = withSpring(1, {
      damping: 15,
      stiffness: 300,
    });

    glowOpacity.value = withTiming(0, { duration: animations.medium });
    rippleScale.value = withTiming(0, { duration: animations.fast });
  };

  // Enhanced haptic feedback
  const triggerHapticFeedback = () => {
    try {
      if (Platform.OS === 'ios') {
        import('expo-haptics').then(({ impactAsync, ImpactFeedbackStyle }) => {
          const intensity = type === 'equals' ? ImpactFeedbackStyle.Medium : ImpactFeedbackStyle.Light;
          impactAsync(intensity);
        });
      } else if (Platform.OS === 'android') {
        const duration = type === 'equals' ? 75 : 50;
        Vibration.vibrate(duration);
      }
    } catch (error) {
      console.log('Haptic feedback not available');
    }
  };

  // Error shake animation
  const triggerErrorShake = () => {
    rotation.value = withSpring(animations.shakeRotation, { damping: 8 }, () => {
      rotation.value = withSpring(-animations.shakeRotation, { damping: 8 }, () => {
        rotation.value = withSpring(0, { damping: 8 });
      });
    });
  };

  // Animated styles
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { rotate: `${rotation.value}deg` },
      ],
    };
  });

  const glowStyle = useAnimatedStyle(() => {
    return {
      opacity: glowOpacity.value,
    };
  });

  const rippleStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: rippleScale.value }],
      opacity: interpolate(rippleScale.value, [0, 0.5, 1], [0.3, 0.1, 0]),
    };
  });

  // Get button colors based on type and theme
  const getButtonColors = () => {
    switch (type) {
      case 'number':
        return isPressed ? colors.numberButtonPressed : colors.numberButton;
      case 'operator':
        return isPressed ? colors.operatorButtonPressed : colors.operatorButton;
      case 'function':
        return isPressed ? colors.functionButtonPressed : colors.functionButton;
      case 'equals':
        return isPressed ? colors.equalsButtonPressed : colors.equalsButton;
      default:
        return colors.numberButton;
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'number':
        return colors.numberButtonText;
      case 'operator':
        return colors.operatorButtonText;
      case 'function':
        return colors.functionButtonText;
      case 'equals':
        return colors.equalsButtonText;
      default:
        return colors.numberButtonText;
    }
  };

  // Get icon for special buttons
  const getButtonIcon = () => {
    switch (title) {
      case '÷':
        return 'divide-outline';
      case '×':
        return 'close-outline';
      case '−':
        return 'remove-outline';
      case '+':
        return 'add-outline';
      case '=':
        return 'checkmark-outline';
      case '%':
        return 'percent-outline';
      case '±':
        return 'swap-horizontal-outline';
      case 'C':
        return 'refresh-outline';
      default:
        return null;
    }
  };

  const buttonColors = getButtonColors();
  const textColor = getTextColor();
  const iconName = getButtonIcon();

  return (
    <Animated.View style={[styles.container, animatedStyle, isWide && styles.wideContainer]}>
      {/* Glow effect */}
      <Animated.View style={[styles.glow, glowStyle, { shadowColor: colors.glowColor }]} />
      
      {/* Ripple effect */}
      <Animated.View style={[styles.ripple, rippleStyle, { backgroundColor: textColor }]} />
      
      <TouchableOpacity
        style={styles.touchable}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        accessibilityRole="button"
        accessibilityLabel={`Calculator button ${title}`}
        accessibilityHint={`Tap to input ${title}`}
      >
        <LinearGradient
          colors={buttonColors}
          style={[styles.gradient, isWide && styles.wideGradient]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {iconName ? (
            <Ionicons 
              name={iconName} 
              size={typography.buttonText.fontSize} 
              color={textColor} 
            />
          ) : (
            <Text style={[styles.buttonText, { color: textColor }]}>
              {title}
            </Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    aspectRatio: 1,
    margin: 4,
    borderRadius: 20,
    overflow: 'hidden',
  },
  wideContainer: {
    flex: 2,
    aspectRatio: 2,
  },
  touchable: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    shadowColor: colors.shadowColor,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  wideGradient: {
    borderRadius: 20,
  },
  buttonText: {
    ...typography.buttonText,
    textAlign: 'center',
  },
  glow: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: 30,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 0,
  },
  ripple: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 20,
    height: 20,
    borderRadius: 10,
    marginTop: -10,
    marginLeft: -10,
  },
});

export default CalculatorButton;