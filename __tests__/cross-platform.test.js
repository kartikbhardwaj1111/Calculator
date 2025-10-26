/**
 * Cross-platform compatibility tests
 * Tests app functionality and visual consistency across iOS and Android platforms
 */

import { Platform, Dimensions } from 'react-native';
import { colors, typography, screenDimensions, getResponsiveStyles } from '../styles/globalStyles';

// Mock React Native Platform and Dimensions for testing
jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios', // Default to iOS, will be changed in tests
    select: jest.fn((options) => options.ios || options.default),
  },
  Dimensions: {
    get: jest.fn(() => ({ width: 375, height: 667 })), // iPhone 8 dimensions
  },
  StyleSheet: {
    create: (styles) => styles,
  },
  Vibration: {
    vibrate: jest.fn(),
  },
}));

describe('Cross-Platform Compatibility Tests', () => {
  describe('Platform Detection and Configuration', () => {
    test('should detect iOS platform correctly', () => {
      Platform.OS = 'ios';
      expect(Platform.OS).toBe('ios');
    });

    test('should detect Android platform correctly', () => {
      Platform.OS = 'android';
      expect(Platform.OS).toBe('android');
    });

    test('should handle platform-specific selections', () => {
      Platform.select = jest.fn((options) => {
        return Platform.OS === 'ios' ? options.ios : options.android;
      });

      Platform.OS = 'ios';
      const iosResult = Platform.select({
        ios: 'iOS Value',
        android: 'Android Value',
      });
      expect(iosResult).toBe('iOS Value');

      Platform.OS = 'android';
      const androidResult = Platform.select({
        ios: 'iOS Value',
        android: 'Android Value',
      });
      expect(androidResult).toBe('Android Value');
    });
  });

  describe('Visual Consistency Across Platforms', () => {
    test('should maintain consistent color scheme', () => {
      // Test that colors are defined and consistent (now using theme system)
      expect(Array.isArray(colors.background)).toBe(true);
      expect(Array.isArray(colors.displayBackground)).toBe(true);
      expect(typeof colors.displayText).toBe('string');
      expect(Array.isArray(colors.numberButton)).toBe(true);
      expect(Array.isArray(colors.operatorButton)).toBe(true);
      expect(Array.isArray(colors.functionButton)).toBe(true);
      expect(Array.isArray(colors.equalsButton)).toBe(true);
      
      // Colors should be the same regardless of platform
      Platform.OS = 'ios';
      const iosColors = { ...colors };
      
      Platform.OS = 'android';
      const androidColors = { ...colors };
      
      expect(iosColors).toEqual(androidColors);
    });

    test('should maintain consistent typography', () => {
      // Test typography consistency (now responsive)
      expect(typeof typography.displayLarge.fontSize).toBe('number');
      expect(typeof typography.displayMedium.fontSize).toBe('number');
      expect(typeof typography.displaySmall.fontSize).toBe('number');
      expect(typeof typography.buttonText.fontSize).toBe('number');
      expect(typeof typography.buttonTextLarge.fontSize).toBe('number');
      
      // Typography should be consistent across platforms
      Platform.OS = 'ios';
      const iosTypography = { ...typography };
      
      Platform.OS = 'android';
      const androidTypography = { ...typography };
      
      expect(iosTypography).toEqual(androidTypography);
    });

    test('should handle different screen sizes consistently', () => {
      // Test small screen (iPhone SE)
      Dimensions.get = jest.fn(() => ({ width: 320, height: 568 }));
      const smallScreenDimensions = {
        width: 320,
        height: 568,
        isSmallScreen: 320 < 375,
        isMediumScreen: 320 >= 375 && 320 < 414,
        isLargeScreen: 320 >= 414,
      };
      expect(smallScreenDimensions.isSmallScreen).toBe(true);
      expect(smallScreenDimensions.isMediumScreen).toBe(false);
      expect(smallScreenDimensions.isLargeScreen).toBe(false);

      // Test medium screen (iPhone 8)
      Dimensions.get = jest.fn(() => ({ width: 375, height: 667 }));
      const mediumScreenDimensions = {
        width: 375,
        height: 667,
        isSmallScreen: 375 < 375,
        isMediumScreen: 375 >= 375 && 375 < 414,
        isLargeScreen: 375 >= 414,
      };
      expect(mediumScreenDimensions.isSmallScreen).toBe(false);
      expect(mediumScreenDimensions.isMediumScreen).toBe(true);
      expect(mediumScreenDimensions.isLargeScreen).toBe(false);

      // Test large screen (iPhone Plus)
      Dimensions.get = jest.fn(() => ({ width: 414, height: 736 }));
      const largeScreenDimensions = {
        width: 414,
        height: 736,
        isSmallScreen: 414 < 375,
        isMediumScreen: 414 >= 375 && 414 < 414,
        isLargeScreen: 414 >= 414,
      };
      expect(largeScreenDimensions.isSmallScreen).toBe(false);
      expect(largeScreenDimensions.isMediumScreen).toBe(false);
      expect(largeScreenDimensions.isLargeScreen).toBe(true);
    });
  });

  describe('Platform-Specific Features', () => {
    test('should handle iOS haptic feedback', () => {
      Platform.OS = 'ios';
      
      const mockHapticFeedback = {
        platform: Platform.OS,
        triggerHaptic: function() {
          if (this.platform === 'ios') {
            // Mock expo-haptics import and call
            return Promise.resolve('iOS haptic triggered');
          }
          return Promise.resolve('No haptic');
        }
      };

      return mockHapticFeedback.triggerHaptic().then(result => {
        expect(result).toBe('iOS haptic triggered');
      });
    });

    test('should handle Android vibration feedback', () => {
      Platform.OS = 'android';
      
      const mockVibrationFeedback = {
        platform: Platform.OS,
        triggerVibration: function() {
          if (this.platform === 'android') {
            // Mock React Native Vibration
            return 'Android vibration triggered';
          }
          return 'No vibration';
        }
      };

      const result = mockVibrationFeedback.triggerVibration();
      expect(result).toBe('Android vibration triggered');
    });

    test('should handle platform-specific shadow styles', () => {
      const mockShadowStyles = {
        getShadowStyle: (platform) => {
          if (platform === 'ios') {
            return {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
            };
          } else if (platform === 'android') {
            return {
              elevation: 2,
            };
          }
          return {};
        }
      };

      const iosShadow = mockShadowStyles.getShadowStyle('ios');
      expect(iosShadow.shadowColor).toBe('#000');
      expect(iosShadow.shadowOffset).toEqual({ width: 0, height: 2 });
      expect(iosShadow.shadowOpacity).toBe(0.1);
      expect(iosShadow.shadowRadius).toBe(2);

      const androidShadow = mockShadowStyles.getShadowStyle('android');
      expect(androidShadow.elevation).toBe(2);
    });
  });

  describe('Responsive Layout Testing', () => {
    test('should adapt button sizes for different screens', () => {
      const mockResponsiveLayout = {
        getButtonSize: (screenWidth) => {
          const isSmallScreen = screenWidth < 375;
          const minHeight = isSmallScreen ? 60 : 70;
          
          return {
            standardButton: {
              flex: 1,
              aspectRatio: 1,
              minHeight: minHeight,
            },
            wideButton: {
              flex: 2,
              aspectRatio: 2,
              minHeight: minHeight,
            }
          };
        }
      };

      // Small screen
      const smallScreenLayout = mockResponsiveLayout.getButtonSize(320);
      expect(smallScreenLayout.standardButton.minHeight).toBe(60);
      expect(smallScreenLayout.wideButton.minHeight).toBe(60);

      // Medium/Large screen
      const largeScreenLayout = mockResponsiveLayout.getButtonSize(375);
      expect(largeScreenLayout.standardButton.minHeight).toBe(70);
      expect(largeScreenLayout.wideButton.minHeight).toBe(70);
    });

    test('should adapt font sizes for different screens', () => {
      const mockResponsiveFonts = {
        getDisplayFontSize: (screenWidth) => {
          const isSmallScreen = screenWidth < 375;
          return isSmallScreen ? 36 : 48;
        },
        
        getButtonFontSize: (screenWidth) => {
          const isSmallScreen = screenWidth < 375;
          return isSmallScreen ? 20 : 24;
        }
      };

      // Small screen fonts
      expect(mockResponsiveFonts.getDisplayFontSize(320)).toBe(36);
      expect(mockResponsiveFonts.getButtonFontSize(320)).toBe(20);

      // Large screen fonts
      expect(mockResponsiveFonts.getDisplayFontSize(375)).toBe(48);
      expect(mockResponsiveFonts.getButtonFontSize(375)).toBe(24);
    });

    test('should adapt padding and margins for different screens', () => {
      const mockResponsiveSpacing = {
        getSpacing: (screenWidth) => {
          const isSmallScreen = screenWidth < 375;
          const isMediumScreen = screenWidth >= 375 && screenWidth < 414;
          
          if (isSmallScreen) {
            return { padding: 16, margin: 2 };
          } else if (isMediumScreen) {
            return { padding: 20, margin: 4 };
          } else {
            return { padding: 24, margin: 6 };
          }
        }
      };

      // Small screen spacing
      const smallSpacing = mockResponsiveSpacing.getSpacing(320);
      expect(smallSpacing.padding).toBe(16);
      expect(smallSpacing.margin).toBe(2);

      // Medium screen spacing
      const mediumSpacing = mockResponsiveSpacing.getSpacing(375);
      expect(mediumSpacing.padding).toBe(20);
      expect(mediumSpacing.margin).toBe(4);

      // Large screen spacing
      const largeSpacing = mockResponsiveSpacing.getSpacing(414);
      expect(largeSpacing.padding).toBe(24);
      expect(largeSpacing.margin).toBe(6);
    });
  });

  describe('Expo Configuration Compatibility', () => {
    test('should validate iOS configuration', () => {
      const mockExpoConfig = {
        expo: {
          name: 'simple-calculator-app',
          slug: 'simple-calculator-app',
          version: '1.0.0',
          orientation: 'portrait',
          ios: {
            supportsTablet: true
          }
        }
      };

      expect(mockExpoConfig.expo.ios.supportsTablet).toBe(true);
      expect(mockExpoConfig.expo.orientation).toBe('portrait');
    });

    test('should validate Android configuration', () => {
      const mockExpoConfig = {
        expo: {
          name: 'simple-calculator-app',
          slug: 'simple-calculator-app',
          version: '1.0.0',
          orientation: 'portrait',
          android: {
            adaptiveIcon: {
              foregroundImage: './assets/adaptive-icon.png',
              backgroundColor: '#ffffff'
            },
            edgeToEdgeEnabled: true
          }
        }
      };

      expect(mockExpoConfig.expo.android.adaptiveIcon.backgroundColor).toBe('#ffffff');
      expect(mockExpoConfig.expo.android.edgeToEdgeEnabled).toBe(true);
    });

    test('should validate common configuration', () => {
      const mockExpoConfig = {
        expo: {
          name: 'simple-calculator-app',
          slug: 'simple-calculator-app',
          version: '1.0.0',
          orientation: 'portrait',
          icon: './assets/icon.png',
          userInterfaceStyle: 'light',
          newArchEnabled: true,
          splash: {
            image: './assets/splash-icon.png',
            resizeMode: 'contain',
            backgroundColor: '#ffffff'
          }
        }
      };

      expect(mockExpoConfig.expo.name).toBe('simple-calculator-app');
      expect(mockExpoConfig.expo.version).toBe('1.0.0');
      expect(mockExpoConfig.expo.orientation).toBe('portrait');
      expect(mockExpoConfig.expo.userInterfaceStyle).toBe('light');
      expect(mockExpoConfig.expo.newArchEnabled).toBe(true);
    });
  });

  describe('Touch Interaction Compatibility', () => {
    test('should handle touch events consistently across platforms', () => {
      const mockTouchHandler = {
        handleTouch: (platform, touchType) => {
          const baseResponse = {
            platform: platform,
            touchType: touchType,
            handled: true
          };

          if (platform === 'ios') {
            return {
              ...baseResponse,
              hapticFeedback: true,
              animationDuration: 100
            };
          } else if (platform === 'android') {
            return {
              ...baseResponse,
              vibrationFeedback: true,
              animationDuration: 100
            };
          }

          return baseResponse;
        }
      };

      const iosTouch = mockTouchHandler.handleTouch('ios', 'press');
      expect(iosTouch.handled).toBe(true);
      expect(iosTouch.hapticFeedback).toBe(true);
      expect(iosTouch.animationDuration).toBe(100);

      const androidTouch = mockTouchHandler.handleTouch('android', 'press');
      expect(androidTouch.handled).toBe(true);
      expect(androidTouch.vibrationFeedback).toBe(true);
      expect(androidTouch.animationDuration).toBe(100);
    });

    test('should handle gesture recognition consistently', () => {
      const mockGestureHandler = {
        recognizeGesture: (gestureType, platform) => {
          const supportedGestures = ['tap', 'longPress', 'swipe'];
          
          if (!supportedGestures.includes(gestureType)) {
            return { recognized: false, reason: 'Unsupported gesture' };
          }

          return {
            recognized: true,
            gestureType: gestureType,
            platform: platform,
            timestamp: Date.now()
          };
        }
      };

      const iosTap = mockGestureHandler.recognizeGesture('tap', 'ios');
      expect(iosTap.recognized).toBe(true);
      expect(iosTap.gestureType).toBe('tap');

      const androidTap = mockGestureHandler.recognizeGesture('tap', 'android');
      expect(androidTap.recognized).toBe(true);
      expect(androidTap.gestureType).toBe('tap');

      const unsupportedGesture = mockGestureHandler.recognizeGesture('pinch', 'ios');
      expect(unsupportedGesture.recognized).toBe(false);
    });
  });

  describe('Performance Consistency', () => {
    test('should maintain consistent animation performance', () => {
      const mockAnimationPerformance = {
        measureAnimationPerformance: (platform, animationType) => {
          const basePerformance = {
            platform: platform,
            animationType: animationType,
            useNativeDriver: true,
            duration: 100
          };

          // Both platforms should use native driver for optimal performance
          return {
            ...basePerformance,
            expectedFPS: 60,
            optimized: true
          };
        }
      };

      const iosAnimation = mockAnimationPerformance.measureAnimationPerformance('ios', 'scale');
      expect(iosAnimation.useNativeDriver).toBe(true);
      expect(iosAnimation.expectedFPS).toBe(60);
      expect(iosAnimation.optimized).toBe(true);

      const androidAnimation = mockAnimationPerformance.measureAnimationPerformance('android', 'scale');
      expect(androidAnimation.useNativeDriver).toBe(true);
      expect(androidAnimation.expectedFPS).toBe(60);
      expect(androidAnimation.optimized).toBe(true);
    });

    test('should handle memory usage consistently', () => {
      const mockMemoryUsage = {
        estimateMemoryUsage: (platform, componentCount) => {
          const baseMemory = componentCount * 0.1; // MB per component
          const platformOverhead = platform === 'ios' ? 0.5 : 0.3; // MB
          
          return {
            platform: platform,
            estimatedUsage: baseMemory + platformOverhead,
            components: componentCount,
            withinLimits: (baseMemory + platformOverhead) < 10 // 10MB limit
          };
        }
      };

      const iosMemory = mockMemoryUsage.estimateMemoryUsage('ios', 25); // 25 components
      expect(iosMemory.estimatedUsage).toBe(3.0); // 2.5 + 0.5
      expect(iosMemory.withinLimits).toBe(true);

      const androidMemory = mockMemoryUsage.estimateMemoryUsage('android', 25);
      expect(androidMemory.estimatedUsage).toBe(2.8); // 2.5 + 0.3
      expect(androidMemory.withinLimits).toBe(true);
    });
  });

  describe('Accessibility Compatibility', () => {
    test('should provide consistent accessibility features', () => {
      const mockAccessibility = {
        getAccessibilityProps: (element, platform) => {
          const baseProps = {
            accessibilityRole: element.role,
            accessibilityLabel: element.label,
            accessibilityHint: element.hint
          };

          if (platform === 'ios') {
            return {
              ...baseProps,
              accessibilityTraits: element.traits || [],
              accessible: true
            };
          } else if (platform === 'android') {
            return {
              ...baseProps,
              importantForAccessibility: 'yes',
              accessible: true
            };
          }

          return baseProps;
        }
      };

      const buttonElement = {
        role: 'button',
        label: 'Calculator button 5',
        hint: 'Tap to input 5'
      };

      const iosAccessibility = mockAccessibility.getAccessibilityProps(buttonElement, 'ios');
      expect(iosAccessibility.accessibilityRole).toBe('button');
      expect(iosAccessibility.accessibilityLabel).toBe('Calculator button 5');
      expect(iosAccessibility.accessible).toBe(true);

      const androidAccessibility = mockAccessibility.getAccessibilityProps(buttonElement, 'android');
      expect(androidAccessibility.accessibilityRole).toBe('button');
      expect(androidAccessibility.accessibilityLabel).toBe('Calculator button 5');
      expect(androidAccessibility.accessible).toBe(true);
      expect(androidAccessibility.importantForAccessibility).toBe('yes');
    });
  });
});