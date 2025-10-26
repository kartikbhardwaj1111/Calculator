import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, animations } from '../styles/globalStyles';

const DisplayPanel = ({ 
  displayValue, 
  isResult = false, 
  hasError = false, 
  history = [],
  onHistoryPress,
  currentOperation = '',
  theme = 'dark'
}) => {
  const [textWidth, setTextWidth] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [shouldScroll, setShouldScroll] = useState(false);
  const [previousValue, setPreviousValue] = useState(displayValue);
  const [showHistory, setShowHistory] = useState(false);
  
  // Animated values
  const fadeOpacity = useSharedValue(1);
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);
  const glowOpacity = useSharedValue(0);
  const historyHeight = useSharedValue(0);

  // Enhanced dynamic font sizing
  const getFontSize = (text) => {
    const length = text.length;
    if (length <= 6) return typography.displayLarge.fontSize;
    if (length <= 10) return typography.displayMedium.fontSize;
    if (length <= 15) return typography.displaySmall.fontSize;
    return typography.displaySmall.fontSize * 0.8;
  };

  // Handle smooth transitions when display value changes
  useEffect(() => {
    if (displayValue !== previousValue) {
      if (hasError) {
        triggerErrorAnimation();
      } else if (isResult) {
        triggerResultAnimation();
      } else {
        triggerInputAnimation();
      }
      setPreviousValue(displayValue);
    }
  }, [displayValue, isResult, hasError, previousValue]);

  // Input change animation
  const triggerInputAnimation = () => {
    fadeOpacity.value = withSequence(
      withTiming(0.7, { duration: animations.fast }),
      withTiming(1, { duration: animations.fast })
    );
    
    translateY.value = withSequence(
      withTiming(-5, { duration: animations.fast }),
      withTiming(0, { duration: animations.fast })
    );
  };

  // Result animation with glow effect
  const triggerResultAnimation = () => {
    scale.value = withSequence(
      withSpring(1.05, { damping: 15, stiffness: 300 }),
      withSpring(1, { damping: 15, stiffness: 300 })
    );
    
    glowOpacity.value = withSequence(
      withTiming(0.8, { duration: animations.medium }),
      withTiming(0, { duration: animations.slow })
    );
  };

  // Error shake animation
  const triggerErrorAnimation = () => {
    translateY.value = withSequence(
      withTiming(5, { duration: 50 }),
      withTiming(-5, { duration: 50 }),
      withTiming(5, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );
    
    glowOpacity.value = withSequence(
      withTiming(0.5, { duration: animations.fast }),
      withTiming(0, { duration: animations.medium })
    );
  };

  // Toggle history visibility
  const toggleHistory = () => {
    setShowHistory(!showHistory);
    historyHeight.value = withSpring(showHistory ? 0 : 120, {
      damping: 15,
      stiffness: 300,
    });
  };

  // Handle text layout
  const handleTextLayout = (event) => {
    const { width } = event.nativeEvent.layout;
    setTextWidth(width);
    setShouldScroll(width > containerWidth && containerWidth > 0);
  };

  const handleContainerLayout = (event) => {
    const { width } = event.nativeEvent.layout;
    setContainerWidth(width);
    setShouldScroll(textWidth > width && textWidth > 0);
  };

  // Animated styles
  const displayAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: fadeOpacity.value,
      transform: [
        { scale: scale.value },
        { translateY: translateY.value },
      ],
    };
  });

  const glowAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: glowOpacity.value,
    };
  });

  const historyAnimatedStyle = useAnimatedStyle(() => {
    return {
      height: historyHeight.value,
      opacity: interpolate(historyHeight.value, [0, 120], [0, 1]),
    };
  });

  // Format display value
  const formatDisplayValue = (value) => {
    if (hasError) {
      if (value.includes('divide by zero')) return 'Cannot divide by zero';
      if (value.includes('Invalid')) return 'Invalid operation';
      if (value.includes('overflow')) return 'Number too large';
      return 'Error';
    }
    
    if (value.length > 15 && !isNaN(parseFloat(value))) {
      const num = parseFloat(value);
      if (Math.abs(num) >= 1e12 || (Math.abs(num) < 1e-6 && num !== 0)) {
        return num.toExponential(4);
      }
    }
    
    return value;
  };

  const formattedValue = formatDisplayValue(displayValue);
  const fontSize = getFontSize(formattedValue);

  return (
    <View style={styles.container} onLayout={handleContainerLayout}>
      <LinearGradient
        colors={colors.displayBackground}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Glow effect */}
        <Animated.View 
          style={[
            styles.glow, 
            glowAnimatedStyle, 
            { 
              shadowColor: hasError ? colors.errorColor : colors.glowColor,
              backgroundColor: hasError ? colors.errorColor : colors.glowColor,
            }
          ]} 
        />

        {/* History Section */}
        {history.length > 0 && (
          <TouchableOpacity style={styles.historyToggle} onPress={toggleHistory}>
            <Ionicons 
              name={showHistory ? "chevron-up" : "chevron-down"} 
              size={20} 
              color={colors.displaySecondary} 
            />
          </TouchableOpacity>
        )}

        <Animated.View style={[styles.historyContainer, historyAnimatedStyle]}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {history.slice(-5).map((item, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.historyItem}
                onPress={() => onHistoryPress && onHistoryPress(item)}
              >
                <Text style={[styles.historyText, { color: colors.displaySecondary }]}>
                  {item.expression} = {item.result}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Current Operation */}
        {currentOperation && (
          <View style={styles.operationContainer}>
            <Text style={[styles.operationText, { color: colors.displaySecondary }]}>
              {currentOperation}
            </Text>
          </View>
        )}

        {/* Main Display */}
        <Animated.View style={[styles.displayContainer, displayAnimatedStyle]}>
          {shouldScroll ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              <Text 
                style={[
                  styles.displayText, 
                  { 
                    fontSize,
                    color: hasError ? colors.errorColor : colors.displayText,
                    fontWeight: isResult ? '300' : '200',
                  }
                ]}
                onLayout={handleTextLayout}
              >
                {formattedValue}
              </Text>
            </ScrollView>
          ) : (
            <Text 
              style={[
                styles.displayText,
                { 
                  fontSize,
                  color: hasError ? colors.errorColor : colors.displayText,
                  fontWeight: isResult ? '300' : '200',
                }
              ]}
              numberOfLines={1}
              adjustsFontSizeToFit={true}
              minimumFontScale={0.5}
              onLayout={handleTextLayout}
            >
              {formattedValue}
            </Text>
          )}
        </Animated.View>

        {/* Result indicator */}
        {isResult && !hasError && (
          <View style={styles.resultIndicator}>
            <Ionicons name="checkmark-circle" size={16} color={colors.successColor} />
          </View>
        )}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 24,
    margin: 16,
    marginBottom: 8,
    overflow: 'hidden',
    shadowColor: colors.shadowColor,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
  gradient: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingVertical: 20,
    position: 'relative',
  },
  glow: {
    position: 'absolute',
    top: -20,
    left: -20,
    right: -20,
    bottom: -20,
    borderRadius: 44,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 0,
  },
  historyToggle: {
    position: 'absolute',
    top: 16,
    left: 20,
    zIndex: 10,
    padding: 8,
  },
  historyContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
    overflow: 'hidden',
  },
  historyItem: {
    paddingVertical: 4,
  },
  historyText: {
    ...typography.historyText,
    textAlign: 'right',
  },
  operationContainer: {
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  operationText: {
    ...typography.historyText,
    fontSize: 18,
  },
  displayContainer: {
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    minHeight: 60,
  },
  displayText: {
    ...typography.displayLarge,
    textAlign: 'right',
    includeFontPadding: false,
  },
  scrollContent: {
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    minWidth: '100%',
  },
  resultIndicator: {
    position: 'absolute',
    bottom: 20,
    left: 20,
  },
});

export default DisplayPanel;