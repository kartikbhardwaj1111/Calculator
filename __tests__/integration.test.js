/**
 * Integration tests for complete calculator functionality
 * Tests end-to-end user flows, complex calculation sequences, and error handling
 */

import {
  performCalculation,
  safeCalculation,
  validateCalculationInput,
  calculatePercentage,
  toggleSign,
  formatResult,
  ERROR_TYPES
} from '../utils/calculation.js';

describe('Complete Calculator Functionality Integration Tests', () => {
  describe('Basic Arithmetic Operations End-to-End', () => {
    test('should perform addition sequence correctly', () => {
      // Simulate: 5 + 3 = 8
      const step1 = safeCalculation('5', '+', '3');
      expect(step1.hasError).toBe(false);
      expect(step1.result).toBe(8);
      expect(step1.displayValue).toBe('8');
    });

    test('should perform subtraction sequence correctly', () => {
      // Simulate: 10 - 4 = 6
      const step1 = safeCalculation('10', '-', '4');
      expect(step1.hasError).toBe(false);
      expect(step1.result).toBe(6);
      expect(step1.displayValue).toBe('6');
    });

    test('should perform multiplication sequence correctly', () => {
      // Simulate: 7 * 6 = 42
      const step1 = safeCalculation('7', '*', '6');
      expect(step1.hasError).toBe(false);
      expect(step1.result).toBe(42);
      expect(step1.displayValue).toBe('42');
    });

    test('should perform division sequence correctly', () => {
      // Simulate: 15 / 3 = 5
      const step1 = safeCalculation('15', '/', '3');
      expect(step1.hasError).toBe(false);
      expect(step1.result).toBe(5);
      expect(step1.displayValue).toBe('5');
    });
  });

  describe('Complex Calculation Sequences', () => {
    test('should handle multi-step calculations correctly', () => {
      // Simulate: 5 + 3 = 8, then 8 * 2 = 16
      const step1 = safeCalculation('5', '+', '3');
      expect(step1.hasError).toBe(false);
      expect(step1.result).toBe(8);

      const step2 = safeCalculation(step1.displayValue, '*', '2');
      expect(step2.hasError).toBe(false);
      expect(step2.result).toBe(16);
      expect(step2.displayValue).toBe('16');
    });

    test('should handle decimal calculations correctly', () => {
      // Simulate: 12.5 + 7.3 = 19.8
      const step1 = safeCalculation('12.5', '+', '7.3');
      expect(step1.hasError).toBe(false);
      expect(step1.result).toBe(19.8);
      expect(step1.displayValue).toBe('19.8');
    });

    test('should handle negative number calculations', () => {
      // Simulate: -5 + 3 = -2
      const step1 = safeCalculation('-5', '+', '3');
      expect(step1.hasError).toBe(false);
      expect(step1.result).toBe(-2);
      expect(step1.displayValue).toBe('-2');
    });

    test('should handle complex decimal precision', () => {
      // Simulate: 0.1 + 0.2 = 0.3 (floating point precision test)
      const step1 = safeCalculation('0.1', '+', '0.2');
      expect(step1.hasError).toBe(false);
      expect(step1.result).toBe(0.3);
      expect(step1.displayValue).toBe('0.3');
    });

    test('should handle chained operations', () => {
      // Simulate: 100 - 25 = 75, then 75 / 3 = 25, then 25 * 4 = 100
      const step1 = safeCalculation('100', '-', '25');
      expect(step1.hasError).toBe(false);
      expect(step1.result).toBe(75);

      const step2 = safeCalculation(step1.displayValue, '/', '3');
      expect(step2.hasError).toBe(false);
      expect(step2.result).toBe(25);

      const step3 = safeCalculation(step2.displayValue, '*', '4');
      expect(step3.hasError).toBe(false);
      expect(step3.result).toBe(100);
      expect(step3.displayValue).toBe('100');
    });
  });

  describe('Special Function Integration', () => {
    test('should handle percentage calculations in context', () => {
      // Simulate: 200 + 15% = 200 + 30 = 230
      const percentageResult = calculatePercentage('15', '200', '+');
      expect(percentageResult.hasError).toBe(false);
      expect(percentageResult.result).toBe(30); // 15% of 200

      const finalResult = safeCalculation('200', '+', percentageResult.displayValue);
      expect(finalResult.hasError).toBe(false);
      expect(finalResult.result).toBe(230);
    });

    test('should handle sign toggle in calculations', () => {
      // Simulate: 5 + (-3) = 2
      const toggleResult = toggleSign('3');
      expect(toggleResult.hasError).toBe(false);
      expect(toggleResult.result).toBe('-3');

      const calculationResult = safeCalculation('5', '+', toggleResult.result);
      expect(calculationResult.hasError).toBe(false);
      expect(calculationResult.result).toBe(2);
    });

    test('should handle percentage with multiplication', () => {
      // Simulate: 50 * 25% = 50 * 0.25 = 12.5
      const percentageResult = calculatePercentage('25', '50', '*');
      expect(percentageResult.hasError).toBe(false);
      expect(percentageResult.result).toBe(0.25);

      const finalResult = safeCalculation('50', '*', percentageResult.displayValue);
      expect(finalResult.hasError).toBe(false);
      expect(finalResult.result).toBe(12.5);
    });
  });

  describe('Error Handling and Recovery Integration', () => {
    test('should handle division by zero error and recovery', () => {
      // Simulate: 10 / 0 = Error, then clear and 5 + 3 = 8
      const errorResult = safeCalculation('10', '/', '0');
      expect(errorResult.hasError).toBe(true);
      expect(errorResult.errorType).toBe(ERROR_TYPES.DIVISION_BY_ZERO);
      expect(errorResult.errorMessage).toBe('Cannot divide by zero');

      // After error, calculator should be able to perform new calculations
      const recoveryResult = safeCalculation('5', '+', '3');
      expect(recoveryResult.hasError).toBe(false);
      expect(recoveryResult.result).toBe(8);
    });

    test('should handle invalid input sequences', () => {
      // Test invalid number inputs
      const invalidResult1 = safeCalculation('abc', '+', '5');
      expect(invalidResult1.hasError).toBe(true);
      expect(invalidResult1.errorType).toBe(ERROR_TYPES.INVALID_INPUT);

      const invalidResult2 = safeCalculation('5', '+', 'xyz');
      expect(invalidResult2.hasError).toBe(true);
      expect(invalidResult2.errorType).toBe(ERROR_TYPES.INVALID_INPUT);
    });

    test('should validate complete calculation input before processing', () => {
      // Test validation before calculation
      const validation1 = validateCalculationInput('10', '+', '5');
      expect(validation1.isValid).toBe(true);

      const validation2 = validateCalculationInput('abc', '+', '5');
      expect(validation2.isValid).toBe(false);
      expect(validation2.error).toBe('First number is invalid');

      const validation3 = validateCalculationInput('10', '%', '5');
      expect(validation3.isValid).toBe(false);
      expect(validation3.error).toBe('Invalid operator');

      const validation4 = validateCalculationInput('10', '/', '0');
      expect(validation4.isValid).toBe(false);
      expect(validation4.error).toBe('Cannot divide by zero');
    });
  });

  describe('Large Number and Scientific Notation Handling', () => {
    test('should handle very large numbers', () => {
      // Test large number multiplication
      const largeResult = safeCalculation('999999999', '*', '999999999');
      expect(largeResult.hasError).toBe(false);
      expect(largeResult.result).toBe(999999998000000001);
      // Should format as scientific notation for display
      expect(largeResult.displayValue).toContain('e+');
    });

    test('should handle very small decimal numbers', () => {
      // Test small decimal division
      const smallResult = safeCalculation('1', '/', '1000000');
      expect(smallResult.hasError).toBe(false);
      expect(smallResult.result).toBe(0.000001);
      expect(smallResult.displayValue).toBe('0.000001');
    });

    test('should format results appropriately for display', () => {
      // Test various number formatting scenarios
      expect(formatResult(5)).toBe('5');
      expect(formatResult(5.0)).toBe('5');
      expect(formatResult(5.123)).toBe('5.123');
      expect(formatResult(1e12)).toBe('1.000000e+12');
      expect(formatResult(NaN)).toBe('Error');
      expect(formatResult(Infinity)).toBe('Error');
    });
  });

  describe('Real-World Calculator Usage Scenarios', () => {
    test('should handle tip calculation scenario', () => {
      // Scenario: Bill is $85.50, calculate 18% tip
      const billAmount = '85.50';
      const tipPercentage = '18';
      
      // Calculate 18% of 85.50
      const tipResult = calculatePercentage(tipPercentage, billAmount, '*');
      expect(tipResult.hasError).toBe(false);
      expect(tipResult.result).toBe(0.18);
      
      const tipAmount = safeCalculation(billAmount, '*', tipResult.displayValue);
      expect(tipAmount.hasError).toBe(false);
      expect(tipAmount.result).toBe(15.39);
      
      // Calculate total bill
      const totalBill = safeCalculation(billAmount, '+', tipAmount.displayValue);
      expect(totalBill.hasError).toBe(false);
      expect(totalBill.result).toBe(100.89);
    });

    test('should handle discount calculation scenario', () => {
      // Scenario: Item costs $120, 25% discount
      const originalPrice = '120';
      const discountPercentage = '25';
      
      // Calculate 25% of 120
      const discountResult = calculatePercentage(discountPercentage, originalPrice, '+');
      expect(discountResult.hasError).toBe(false);
      expect(discountResult.result).toBe(30); // 25% of 120
      
      // Calculate final price
      const finalPrice = safeCalculation(originalPrice, '-', discountResult.displayValue);
      expect(finalPrice.hasError).toBe(false);
      expect(finalPrice.result).toBe(90);
    });

    test('should handle unit conversion scenario', () => {
      // Scenario: Convert 5.5 feet to inches (multiply by 12)
      const feet = '5.5';
      const conversionFactor = '12';
      
      const inches = safeCalculation(feet, '*', conversionFactor);
      expect(inches.hasError).toBe(false);
      expect(inches.result).toBe(66);
      expect(inches.displayValue).toBe('66');
    });

    test('should handle budget calculation scenario', () => {
      // Scenario: Monthly budget calculation
      // Income: $3500, Expenses: $1200 + $800 + $450 = $2450, Savings: $3500 - $2450 = $1050
      
      const income = '3500';
      const expense1 = '1200';
      const expense2 = '800';
      const expense3 = '450';
      
      // Calculate total expenses
      const totalExp1 = safeCalculation(expense1, '+', expense2);
      expect(totalExp1.hasError).toBe(false);
      expect(totalExp1.result).toBe(2000);
      
      const totalExpenses = safeCalculation(totalExp1.displayValue, '+', expense3);
      expect(totalExpenses.hasError).toBe(false);
      expect(totalExpenses.result).toBe(2450);
      
      // Calculate remaining budget
      const remainingBudget = safeCalculation(income, '-', totalExpenses.displayValue);
      expect(remainingBudget.hasError).toBe(false);
      expect(remainingBudget.result).toBe(1050);
    });
  });

  describe('Edge Cases and Boundary Conditions', () => {
    test('should handle zero in various operations', () => {
      // Zero addition
      const zeroAdd = safeCalculation('0', '+', '5');
      expect(zeroAdd.hasError).toBe(false);
      expect(zeroAdd.result).toBe(5);
      
      // Zero subtraction
      const zeroSub = safeCalculation('10', '-', '0');
      expect(zeroSub.hasError).toBe(false);
      expect(zeroSub.result).toBe(10);
      
      // Zero multiplication
      const zeroMult = safeCalculation('7', '*', '0');
      expect(zeroMult.hasError).toBe(false);
      expect(zeroMult.result).toBe(0);
      
      // Division by zero (should error)
      const zeroDiv = safeCalculation('5', '/', '0');
      expect(zeroDiv.hasError).toBe(true);
      expect(zeroDiv.errorType).toBe(ERROR_TYPES.DIVISION_BY_ZERO);
    });

    test('should handle negative zero scenarios', () => {
      // Test negative zero handling
      const negZeroToggle = toggleSign('0');
      expect(negZeroToggle.hasError).toBe(false);
      expect(negZeroToggle.result).toBe('0');
      
      const negZeroCalc = safeCalculation('-0', '+', '5');
      expect(negZeroCalc.hasError).toBe(false);
      expect(negZeroCalc.result).toBe(5);
    });

    test('should handle maximum precision scenarios', () => {
      // Test calculations that might cause precision issues
      const precisionTest1 = safeCalculation('0.1', '+', '0.2');
      expect(precisionTest1.hasError).toBe(false);
      expect(precisionTest1.result).toBe(0.3);
      
      const precisionTest2 = safeCalculation('1', '/', '3');
      expect(precisionTest2.hasError).toBe(false);
      expect(precisionTest2.result).toBeCloseTo(0.3333333333, 10);
    });
  });

  describe('State Management Integration', () => {
    test('should simulate complete calculator state flow', () => {
      // Simulate a complete calculator session with state changes
      let calculatorState = {
        currentInput: '0',
        previousInput: '',
        operator: '',
        result: null,
        displayValue: '0',
        hasError: false
      };

      // User enters: 1, 2, 3
      calculatorState.currentInput = '123';
      calculatorState.displayValue = '123';
      
      // User presses +
      calculatorState.previousInput = calculatorState.currentInput;
      calculatorState.operator = '+';
      calculatorState.currentInput = '0';
      
      // User enters: 4, 5
      calculatorState.currentInput = '45';
      calculatorState.displayValue = '45';
      
      // User presses =
      const calculation = safeCalculation(
        calculatorState.previousInput, 
        calculatorState.operator, 
        calculatorState.currentInput
      );
      
      expect(calculation.hasError).toBe(false);
      expect(calculation.result).toBe(168);
      
      calculatorState.result = calculation.result;
      calculatorState.displayValue = calculation.displayValue;
      calculatorState.hasError = calculation.hasError;
      
      expect(calculatorState.displayValue).toBe('168');
      expect(calculatorState.hasError).toBe(false);
    });
  });
});