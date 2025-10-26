import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, SafeAreaView, TouchableOpacity, Text } from 'react-native';
import React, { useState, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { 
  safeCalculation, 
  calculatePercentage, 
  toggleSign,
  canAddDecimal,
  canAddDigit,
  canAddOperator,
  isValidOperator,
  validateCalculationInput
} from './utils/calculation';
import { getTheme } from './styles/themes';

// Simple Calculator Button Component
const SimpleCalculatorButton = ({ title, onPress, type = 'number', isWide = false, theme }) => {
  const getButtonColors = () => {
    switch (type) {
      case 'number':
        return theme.numberButton;
      case 'operator':
        return theme.operatorButton;
      case 'function':
        return theme.functionButton;
      case 'equals':
        return theme.equalsButton;
      default:
        return theme.numberButton;
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'number':
        return theme.numberButtonText;
      case 'operator':
        return theme.operatorButtonText;
      case 'function':
        return theme.functionButtonText;
      case 'equals':
        return theme.equalsButtonText;
      default:
        return theme.numberButtonText;
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, isWide && styles.wideButton]}
      onPress={onPress}
    >
      <LinearGradient
        colors={getButtonColors()}
        style={[styles.buttonGradient, isWide && styles.wideButtonGradient]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={[styles.buttonText, { color: getTextColor() }]}>
          {title}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

// Simple Display Panel Component
const SimpleDisplayPanel = ({ displayValue, hasError, theme }) => {
  return (
    <View style={styles.displayContainer}>
      <LinearGradient
        colors={theme.displayBackground}
        style={styles.displayGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text 
          style={[
            styles.displayText, 
            { 
              color: hasError ? theme.errorColor : theme.displayText,
              fontSize: displayValue.length > 10 ? 32 : 48
            }
          ]}
          numberOfLines={1}
          adjustsFontSizeToFit={true}
        >
          {displayValue}
        </Text>
      </LinearGradient>
    </View>
  );
};

// Button configuration
const buttonConfig = [
  [
    { id: 'clear', label: 'C', type: 'function', value: 'clear' },
    { id: 'plus-minus', label: '±', type: 'function', value: 'plus-minus' },
    { id: 'percent', label: '%', type: 'function', value: 'percent' },
    { id: 'divide', label: '÷', type: 'operator', value: '/' },
  ],
  [
    { id: 'seven', label: '7', type: 'number', value: '7' },
    { id: 'eight', label: '8', type: 'number', value: '8' },
    { id: 'nine', label: '9', type: 'number', value: '9' },
    { id: 'multiply', label: '×', type: 'operator', value: '*' },
  ],
  [
    { id: 'four', label: '4', type: 'number', value: '4' },
    { id: 'five', label: '5', type: 'number', value: '5' },
    { id: 'six', label: '6', type: 'number', value: '6' },
    { id: 'subtract', label: '−', type: 'operator', value: '-' },
  ],
  [
    { id: 'one', label: '1', type: 'number', value: '1' },
    { id: 'two', label: '2', type: 'number', value: '2' },
    { id: 'three', label: '3', type: 'number', value: '3' },
    { id: 'add', label: '+', type: 'operator', value: '+' },
  ],
  [
    { id: 'zero', label: '0', type: 'number', value: '0', isWide: true },
    { id: 'decimal', label: '.', type: 'number', value: '.' },
    { id: 'equals', label: '=', type: 'equals', value: '=' },
  ],
];

export default function App() {
  // Theme state
  const [currentTheme, setCurrentTheme] = useState('dark');
  
  // Calculator state
  const [currentInput, setCurrentInput] = useState('0');
  const [previousInput, setPreviousInput] = useState('');
  const [operator, setOperator] = useState('');
  const [result, setResult] = useState(null);
  const [displayValue, setDisplayValue] = useState('0');
  const [isNewCalculation, setIsNewCalculation] = useState(true);
  const [hasError, setHasError] = useState(false);
  
  // Get current theme
  const theme = getTheme(currentTheme);

  // Number input handler
  const handleNumberPress = (number) => {
    if (hasError) {
      return;
    }

    let newInput;
    
    if (isNewCalculation || currentInput === '0') {
      if (number === '.') {
        newInput = '0.';
      } else {
        newInput = number;
      }
      setIsNewCalculation(false);
    } else {
      if (number === '.' && !canAddDecimal(currentInput)) {
        return;
      }
      
      if (number !== '.' && !canAddDigit(currentInput, number)) {
        return;
      }
      
      newInput = currentInput + number;
    }
    
    setCurrentInput(newInput);
    setDisplayValue(newInput);
  };

  const handleOperatorPress = (op) => {
    if (hasError) {
      return;
    }

    if (!isValidOperator(op)) {
      return;
    }

    if (!canAddOperator(currentInput, op)) {
      return;
    }

    if (previousInput && currentInput && operator && !isNewCalculation) {
      handleEqualsPress();
      if (!hasError) {
        setPreviousInput(displayValue);
        setOperator(op);
        setIsNewCalculation(true);
        return;
      }
    }

    setPreviousInput(currentInput);
    setOperator(op);
    setIsNewCalculation(true);
  };

  const handleEqualsPress = () => {
    if (hasError) {
      return;
    }

    if (!previousInput || !currentInput || !operator) {
      return;
    }

    const validation = validateCalculationInput(previousInput, operator, currentInput);
    if (!validation.isValid) {
      setHasError(true);
      setDisplayValue('Error');
      setResult(null);
      setPreviousInput('');
      setOperator('');
      setIsNewCalculation(true);
      return;
    }

    const calculationResult = safeCalculation(previousInput, operator, currentInput);
    
    if (calculationResult.hasError) {
      setHasError(true);
      setDisplayValue('Error');
      setResult(null);
    } else {
      setResult(calculationResult.result);
      setDisplayValue(calculationResult.displayValue);
      setCurrentInput(calculationResult.displayValue);
      setHasError(false);
    }

    setPreviousInput('');
    setOperator('');
    setIsNewCalculation(true);
  };

  const handleClearPress = () => {
    setCurrentInput('0');
    setPreviousInput('');
    setOperator('');
    setResult(null);
    setDisplayValue('0');
    setIsNewCalculation(true);
    setHasError(false);
  };

  const handleSpecialPress = (type) => {
    if (hasError) {
      return;
    }

    switch (type) {
      case 'plus-minus':
        const signToggleResult = toggleSign(currentInput);
        if (signToggleResult.hasError) {
          setHasError(true);
          setDisplayValue('Error');
        } else {
          setCurrentInput(signToggleResult.result);
          setDisplayValue(signToggleResult.displayValue);
        }
        break;
      case 'percent':
        if (currentInput !== '0') {
          const percentageResult = calculatePercentage(currentInput, previousInput, operator);
          if (percentageResult.hasError) {
            setHasError(true);
            setDisplayValue('Error');
          } else {
            setCurrentInput(percentageResult.displayValue);
            setDisplayValue(percentageResult.displayValue);
          }
        }
        break;
    }
  };

  const handleButtonPress = (button) => {
    try {
      switch (button.type) {
        case 'number':
          handleNumberPress(button.value);
          break;
        case 'operator':
          handleOperatorPress(button.value);
          break;
        case 'equals':
          handleEqualsPress();
          break;
        case 'function':
          if (button.value === 'clear') {
            handleClearPress();
          } else {
            handleSpecialPress(button.value);
          }
          break;
      }
    } catch (error) {
      console.error('Button press error:', error);
      setHasError(true);
      setDisplayValue('Error');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style={theme.statusBarStyle} />
      
      <LinearGradient
        colors={theme.background}
        style={styles.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => {
              const themes = ['dark', 'light', 'neon', 'ocean', 'sunset', 'minimal'];
              const currentIndex = themes.indexOf(currentTheme);
              const nextIndex = (currentIndex + 1) % themes.length;
              setCurrentTheme(themes[nextIndex]);
            }}
          >
            <Ionicons name="color-palette-outline" size={24} color={theme.displayText} />
          </TouchableOpacity>
          
          <Text style={[styles.headerTitle, { color: theme.displayText }]}>
            ProCalc
          </Text>
        </View>

        {/* Display Panel */}
        <SimpleDisplayPanel 
          displayValue={displayValue}
          hasError={hasError}
          theme={theme}
        />

        {/* Button Grid */}
        <View style={styles.buttonContainer}>
          {buttonConfig.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.buttonRow}>
              {row.map((button) => (
                <SimpleCalculatorButton
                  key={button.id}
                  title={button.label}
                  type={button.type}
                  isWide={button.isWide || false}
                  onPress={() => handleButtonPress(button)}
                  theme={theme}
                />
              ))}
            </View>
          ))}
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 5,
  },
  headerButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  displayContainer: {
    flex: 1,
    margin: 16,
    marginBottom: 8,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
  displayGradient: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  displayText: {
    fontSize: 48,
    fontWeight: '200',
    textAlign: 'right',
  },
  buttonContainer: {
    flex: 2,
    paddingHorizontal: 16,
    paddingBottom: 20,
    justifyContent: 'space-between',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  button: {
    flex: 1,
    aspectRatio: 1,
    margin: 4,
    borderRadius: 20,
    overflow: 'hidden',
  },
  wideButton: {
    flex: 2,
    aspectRatio: 2,
  },
  buttonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  wideButtonGradient: {
    borderRadius: 20,
  },
  buttonText: {
    fontSize: 24,
    fontWeight: '500',
    textAlign: 'center',
  },
});