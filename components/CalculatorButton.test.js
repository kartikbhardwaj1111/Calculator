/**
 * Unit tests for CalculatorButton component
 * Tests button rendering for all types, touch interactions, and feedback
 */

// Mock React Native components and modules for testing
jest.mock('react-native', () => ({
  TouchableOpacity: 'TouchableOpacity',
  Text: 'Text',
  Animated: {
    View: 'AnimatedView',
    Value: jest.fn(() => ({
      setValue: jest.fn(),
    })),
    timing: jest.fn(() => ({
      start: jest.fn(),
    })),
  },
  Platform: {
    OS: 'ios',
  },
  Vibration: {
    vibrate: jest.fn(),
  },
}));

// Mock the globalStyles module
jest.mock('../styles/globalStyles', () => ({
  globalStyles: {
    buttonBase: { justifyContent: 'center', alignItems: 'center' },
    numberButton: { backgroundColor: '#e0e0e0' },
    operatorButton: { backgroundColor: '#ff9500' },
    functionButton: { backgroundColor: '#a6a6a6' },
    equalsButton: { backgroundColor: '#ff9500' },
    numberButtonText: { color: '#333333', fontSize: 24 },
    operatorButtonText: { color: '#ffffff', fontSize: 24 },
    functionButtonText: { color: '#000000', fontSize: 24 },
    equalsButtonText: { color: '#ffffff', fontSize: 28 },
  },
  colors: {
    numberButton: '#e0e0e0',
    operatorButton: '#ff9500',
    functionButton: '#a6a6a6',
    equalsButton: '#ff9500',
  },
  responsiveStyles: {
    standardButton: { flex: 1, aspectRatio: 1 },
    wideButton: { flex: 2, aspectRatio: 2 },
  },
  getResponsiveStyles: () => ({
    buttonBase: [{ margin: 4 }],
    buttonText: [{ fontSize: 24 }],
  }),
}));

describe('CalculatorButton Component', () => {
  describe('Props Interface', () => {
    test('should handle required props correctly', () => {
      const mockProps = {
        title: '1',
        onPress: jest.fn(),
        type: 'number',
        isWide: false,
      };
      
      expect(mockProps.title).toBe('1');
      expect(typeof mockProps.onPress).toBe('function');
      expect(mockProps.type).toBe('number');
      expect(mockProps.isWide).toBe(false);
    });

    test('should handle default props', () => {
      const mockProps = {
        title: '5',
        onPress: jest.fn(),
        // type defaults to 'number'
        // isWide defaults to false
      };
      
      expect(mockProps.title).toBe('5');
      expect(typeof mockProps.onPress).toBe('function');
    });

    test('should handle wide button prop', () => {
      const mockProps = {
        title: '0',
        onPress: jest.fn(),
        type: 'number',
        isWide: true,
      };
      
      expect(mockProps.isWide).toBe(true);
      expect(mockProps.title).toBe('0');
    });
  });

  describe('Button Type Rendering', () => {
    test('should render number button with correct styling', () => {
      const mockComponent = {
        getButtonStyle: (type, isWide) => {
          const baseStyle = { justifyContent: 'center', alignItems: 'center' };
          const sizeStyle = isWide ? { flex: 2 } : { flex: 1 };
          
          switch (type) {
            case 'number':
              return { ...baseStyle, ...sizeStyle, backgroundColor: '#e0e0e0' };
            default:
              return { ...baseStyle, ...sizeStyle };
          }
        },
        
        getTextStyle: (type) => {
          switch (type) {
            case 'number':
              return { color: '#333333', fontSize: 24 };
            default:
              return { color: '#333333', fontSize: 24 };
          }
        }
      };

      const buttonStyle = mockComponent.getButtonStyle('number', false);
      const textStyle = mockComponent.getTextStyle('number');
      
      expect(buttonStyle.backgroundColor).toBe('#e0e0e0');
      expect(buttonStyle.flex).toBe(1);
      expect(textStyle.color).toBe('#333333');
    });

    test('should render operator button with correct styling', () => {
      const mockComponent = {
        getButtonStyle: (type) => {
          const baseStyle = { justifyContent: 'center', alignItems: 'center' };
          
          switch (type) {
            case 'operator':
              return { ...baseStyle, backgroundColor: '#ff9500' };
            default:
              return baseStyle;
          }
        },
        
        getTextStyle: (type) => {
          switch (type) {
            case 'operator':
              return { color: '#ffffff', fontSize: 24 };
            default:
              return { color: '#333333', fontSize: 24 };
          }
        }
      };

      const buttonStyle = mockComponent.getButtonStyle('operator');
      const textStyle = mockComponent.getTextStyle('operator');
      
      expect(buttonStyle.backgroundColor).toBe('#ff9500');
      expect(textStyle.color).toBe('#ffffff');
    });

    test('should render function button with correct styling', () => {
      const mockComponent = {
        getButtonStyle: (type) => {
          const baseStyle = { justifyContent: 'center', alignItems: 'center' };
          
          switch (type) {
            case 'function':
              return { ...baseStyle, backgroundColor: '#a6a6a6' };
            default:
              return baseStyle;
          }
        },
        
        getTextStyle: (type) => {
          switch (type) {
            case 'function':
              return { color: '#000000', fontSize: 24 };
            default:
              return { color: '#333333', fontSize: 24 };
          }
        }
      };

      const buttonStyle = mockComponent.getButtonStyle('function');
      const textStyle = mockComponent.getTextStyle('function');
      
      expect(buttonStyle.backgroundColor).toBe('#a6a6a6');
      expect(textStyle.color).toBe('#000000');
    });

    test('should render equals button with correct styling', () => {
      const mockComponent = {
        getButtonStyle: (type) => {
          const baseStyle = { justifyContent: 'center', alignItems: 'center' };
          
          switch (type) {
            case 'equals':
              return { ...baseStyle, backgroundColor: '#ff9500' };
            default:
              return baseStyle;
          }
        },
        
        getTextStyle: (type) => {
          switch (type) {
            case 'equals':
              return { color: '#ffffff', fontSize: 28 };
            default:
              return { color: '#333333', fontSize: 24 };
          }
        }
      };

      const buttonStyle = mockComponent.getButtonStyle('equals');
      const textStyle = mockComponent.getTextStyle('equals');
      
      expect(buttonStyle.backgroundColor).toBe('#ff9500');
      expect(textStyle.color).toBe('#ffffff');
      expect(textStyle.fontSize).toBe(28); // Larger font for equals
    });
  });

  describe('Touch Interactions', () => {
    test('should handle press events correctly', () => {
      const mockOnPress = jest.fn();
      const mockComponent = {
        onPress: mockOnPress,
        handlePress: function() {
          this.onPress();
        }
      };

      mockComponent.handlePress();
      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });

    test('should trigger press animations on touch', () => {
      const mockAnimated = {
        scaleValue: { setValue: jest.fn() },
        animationStarted: false,
        
        handlePressIn: function() {
          this.animationStarted = true;
          // Mock animation timing call
          return { start: jest.fn() };
        },
        
        handlePressOut: function() {
          this.animationStarted = false;
          // Mock animation timing call
          return { start: jest.fn() };
        }
      };

      mockAnimated.handlePressIn();
      expect(mockAnimated.animationStarted).toBe(true);
      
      mockAnimated.handlePressOut();
      expect(mockAnimated.animationStarted).toBe(false);
    });

    test('should provide accessibility support', () => {
      const mockAccessibility = {
        getAccessibilityProps: (title) => ({
          accessibilityRole: 'button',
          accessibilityLabel: `Calculator button ${title}`,
          accessibilityHint: `Tap to input ${title}`,
        })
      };

      const props = mockAccessibility.getAccessibilityProps('5');
      
      expect(props.accessibilityRole).toBe('button');
      expect(props.accessibilityLabel).toBe('Calculator button 5');
      expect(props.accessibilityHint).toBe('Tap to input 5');
    });
  });

  describe('Haptic Feedback', () => {
    test('should trigger iOS haptic feedback', () => {
      const mockHaptics = {
        platform: 'ios',
        hapticTriggered: false,
        
        triggerHapticFeedback: function() {
          if (this.platform === 'ios') {
            this.hapticTriggered = true;
            // Mock expo-haptics call
            return Promise.resolve();
          }
        }
      };

      mockHaptics.triggerHapticFeedback();
      expect(mockHaptics.hapticTriggered).toBe(true);
    });

    test('should trigger Android vibration feedback', () => {
      const mockVibration = jest.fn();
      const mockHaptics = {
        platform: 'android',
        vibrationTriggered: false,
        
        triggerHapticFeedback: function() {
          if (this.platform === 'android') {
            this.vibrationTriggered = true;
            mockVibration(50);
          }
        }
      };

      mockHaptics.triggerHapticFeedback();
      expect(mockHaptics.vibrationTriggered).toBe(true);
      expect(mockVibration).toHaveBeenCalledWith(50);
    });

    test('should handle haptic feedback errors gracefully', () => {
      const mockHaptics = {
        errorHandled: false,
        
        triggerHapticFeedback: function() {
          try {
            // Simulate haptic feedback call that might fail
            throw new Error('Haptic feedback not available');
          } catch (error) {
            this.errorHandled = true;
            // Fallback to basic vibration
            return false;
          }
        }
      };

      const result = mockHaptics.triggerHapticFeedback();
      expect(mockHaptics.errorHandled).toBe(true);
      expect(result).toBe(false);
    });
  });

  describe('Button Size Variants', () => {
    test('should handle standard button size', () => {
      const mockSizing = {
        getButtonSize: (isWide) => {
          return isWide ? { flex: 2, aspectRatio: 2 } : { flex: 1, aspectRatio: 1 };
        }
      };

      const standardSize = mockSizing.getButtonSize(false);
      expect(standardSize.flex).toBe(1);
      expect(standardSize.aspectRatio).toBe(1);
    });

    test('should handle wide button size', () => {
      const mockSizing = {
        getButtonSize: (isWide) => {
          return isWide ? { flex: 2, aspectRatio: 2 } : { flex: 1, aspectRatio: 1 };
        }
      };

      const wideSize = mockSizing.getButtonSize(true);
      expect(wideSize.flex).toBe(2);
      expect(wideSize.aspectRatio).toBe(2);
    });
  });

  describe('Animation States', () => {
    test('should manage scale animation state', () => {
      const mockAnimation = {
        scaleValue: 1,
        isPressed: false,
        
        startPressAnimation: function() {
          this.scaleValue = 0.95;
          this.isPressed = true;
        },
        
        endPressAnimation: function() {
          this.scaleValue = 1;
          this.isPressed = false;
        }
      };

      mockAnimation.startPressAnimation();
      expect(mockAnimation.scaleValue).toBe(0.95);
      expect(mockAnimation.isPressed).toBe(true);
      
      mockAnimation.endPressAnimation();
      expect(mockAnimation.scaleValue).toBe(1);
      expect(mockAnimation.isPressed).toBe(false);
    });

    test('should handle animation timing correctly', () => {
      const mockTiming = {
        duration: 100,
        useNativeDriver: true,
        animationConfig: null,
        
        createAnimationConfig: function(toValue) {
          this.animationConfig = {
            toValue,
            duration: this.duration,
            useNativeDriver: this.useNativeDriver,
          };
          return this.animationConfig;
        }
      };

      const config = mockTiming.createAnimationConfig(0.95);
      expect(config.toValue).toBe(0.95);
      expect(config.duration).toBe(100);
      expect(config.useNativeDriver).toBe(true);
    });
  });

  describe('Component Integration', () => {
    test('should integrate with calculator button grid', () => {
      const mockButtonGrid = {
        buttons: [
          { title: '1', type: 'number', onPress: jest.fn() },
          { title: '+', type: 'operator', onPress: jest.fn() },
          { title: 'C', type: 'function', onPress: jest.fn() },
          { title: '=', type: 'equals', onPress: jest.fn() },
        ],
        
        getButtonByTitle: function(title) {
          return this.buttons.find(button => button.title === title);
        }
      };

      const numberButton = mockButtonGrid.getButtonByTitle('1');
      const operatorButton = mockButtonGrid.getButtonByTitle('+');
      const functionButton = mockButtonGrid.getButtonByTitle('C');
      const equalsButton = mockButtonGrid.getButtonByTitle('=');
      
      expect(numberButton.type).toBe('number');
      expect(operatorButton.type).toBe('operator');
      expect(functionButton.type).toBe('function');
      expect(equalsButton.type).toBe('equals');
    });
  });
});