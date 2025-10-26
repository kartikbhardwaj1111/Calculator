/**
 * Complete User Flow Integration Tests
 * Tests full calculation workflows from input to result and error handling scenarios
 */

import {
  safeCalculation,
  validateCalculationInput,
  calculatePercentage,
  toggleSign,
  resetErrorState,
  ERROR_TYPES
} from '../utils/calculation.js';

describe('Complete User Flow Integration Tests', () => {
  describe('Basic Calculator User Flows', () => {
    test('User Flow: Simple Addition (5 + 3 = 8)', () => {
      // Simulate complete user interaction flow
      const userFlow = {
        steps: [],
        currentInput: '0',
        previousInput: '',
        operator: '',
        displayValue: '0',
        hasError: false,
        
        // Step 1: User presses "5"
        pressNumber: function(number) {
          this.steps.push(`Press ${number}`);
          if (this.currentInput === '0') {
            this.currentInput = number;
          } else {
            this.currentInput += number;
          }
          this.displayValue = this.currentInput;
        },
        
        // Step 2: User presses operator
        pressOperator: function(op) {
          this.steps.push(`Press ${op}`);
          this.previousInput = this.currentInput;
          this.operator = op;
          this.currentInput = '0';
        },
        
        // Step 3: User presses equals
        pressEquals: function() {
          this.steps.push('Press =');
          const result = safeCalculation(this.previousInput, this.operator, this.currentInput);
          
          if (result.hasError) {
            this.hasError = true;
            this.displayValue = result.errorMessage;
          } else {
            this.displayValue = result.displayValue;
            this.currentInput = result.displayValue;
          }
          
          this.previousInput = '';
          this.operator = '';
        }
      };

      // Execute user flow: 5 + 3 = 8
      userFlow.pressNumber('5');
      expect(userFlow.displayValue).toBe('5');
      expect(userFlow.steps).toContain('Press 5');

      userFlow.pressOperator('+');
      expect(userFlow.operator).toBe('+');
      expect(userFlow.previousInput).toBe('5');
      expect(userFlow.steps).toContain('Press +');

      userFlow.pressNumber('3');
      expect(userFlow.displayValue).toBe('3');
      expect(userFlow.currentInput).toBe('3');
      expect(userFlow.steps).toContain('Press 3');

      userFlow.pressEquals();
      expect(userFlow.displayValue).toBe('8');
      expect(userFlow.hasError).toBe(false);
      expect(userFlow.steps).toContain('Press =');
      
      // Verify complete flow
      expect(userFlow.steps).toEqual(['Press 5', 'Press +', 'Press 3', 'Press =']);
    });

    test('User Flow: Multi-digit Calculation (123 * 45 = 5535)', () => {
      const userFlow = {
        currentInput: '0',
        previousInput: '',
        operator: '',
        displayValue: '0',
        
        enterNumber: function(digits) {
          this.currentInput = digits;
          this.displayValue = digits;
        },
        
        performOperation: function(op, secondNumber) {
          this.previousInput = this.currentInput;
          this.operator = op;
          this.currentInput = secondNumber;
          
          const result = safeCalculation(this.previousInput, this.operator, this.currentInput);
          this.displayValue = result.displayValue;
          return result;
        }
      };

      userFlow.enterNumber('123');
      expect(userFlow.displayValue).toBe('123');

      const result = userFlow.performOperation('*', '45');
      expect(result.hasError).toBe(false);
      expect(result.result).toBe(5535);
      expect(userFlow.displayValue).toBe('5535');
    });

    test('User Flow: Decimal Calculation (12.5 + 7.3 = 19.8)', () => {
      const userFlow = {
        buildNumber: function(digits) {
          let number = '';
          digits.forEach(digit => {
            if (digit === '.' && number.includes('.')) {
              return; // Prevent multiple decimals
            }
            number += digit;
          });
          return number;
        },
        
        calculate: function(num1Digits, operator, num2Digits) {
          const num1 = this.buildNumber(num1Digits);
          const num2 = this.buildNumber(num2Digits);
          
          return safeCalculation(num1, operator, num2);
        }
      };

      const result = userFlow.calculate(['1', '2', '.', '5'], '+', ['7', '.', '3']);
      expect(result.hasError).toBe(false);
      expect(result.result).toBe(19.8);
      expect(result.displayValue).toBe('19.8');
    });
  });

  describe('Complex User Flow Scenarios', () => {
    test('User Flow: Chained Operations (10 + 5 = 15, then * 2 = 30)', () => {
      const calculatorSession = {
        state: {
          currentInput: '0',
          previousInput: '',
          operator: '',
          result: null,
          displayValue: '0'
        },
        
        inputSequence: function(sequence) {
          const results = [];
          
          for (const action of sequence) {
            if (action.type === 'number') {
              this.state.currentInput = action.value;
              this.state.displayValue = action.value;
            } else if (action.type === 'operator') {
              this.state.previousInput = this.state.currentInput;
              this.state.operator = action.value;
            } else if (action.type === 'equals') {
              const calcResult = safeCalculation(
                this.state.previousInput,
                this.state.operator,
                this.state.currentInput
              );
              
              this.state.result = calcResult.result;
              this.state.displayValue = calcResult.displayValue;
              this.state.currentInput = calcResult.displayValue;
              this.state.previousInput = '';
              this.state.operator = '';
              
              results.push({
                operation: `${this.state.previousInput || calcResult.displayValue} ${this.state.operator || action.previousOp} ${this.state.currentInput || action.previousInput}`,
                result: calcResult.displayValue
              });
            }
          }
          
          return results;
        }
      };

      const sequence = [
        { type: 'number', value: '10' },
        { type: 'operator', value: '+' },
        { type: 'number', value: '5' },
        { type: 'equals', previousOp: '+', previousInput: '5' },
        { type: 'operator', value: '*' },
        { type: 'number', value: '2' },
        { type: 'equals', previousOp: '*', previousInput: '2' }
      ];

      const results = calculatorSession.inputSequence(sequence);
      
      // First calculation: 10 + 5 = 15
      expect(calculatorSession.state.displayValue).toBe('30'); // Final result
      
      // Verify the chained calculation worked
      const finalResult = safeCalculation('15', '*', '2');
      expect(finalResult.result).toBe(30);
    });

    test('User Flow: Percentage Calculation in Context (200 + 15% = 230)', () => {
      const percentageFlow = {
        calculateWithPercentage: function(baseAmount, percentageValue, operation) {
          // Step 1: Calculate percentage value
          const percentResult = calculatePercentage(percentageValue, baseAmount, operation);
          
          if (percentResult.hasError) {
            return percentResult;
          }
          
          // Step 2: Apply the percentage to base amount
          const finalResult = safeCalculation(baseAmount, operation, percentResult.displayValue);
          
          return {
            baseAmount,
            percentageValue,
            percentageAmount: percentResult.displayValue,
            operation,
            finalResult: finalResult.displayValue,
            hasError: finalResult.hasError,
            steps: [
              `Base amount: ${baseAmount}`,
              `Percentage: ${percentageValue}%`,
              `Percentage amount: ${percentResult.displayValue}`,
              `Final calculation: ${baseAmount} ${operation} ${percentResult.displayValue} = ${finalResult.displayValue}`
            ]
          };
        }
      };

      const result = percentageFlow.calculateWithPercentage('200', '15', '+');
      
      expect(result.hasError).toBe(false);
      expect(result.percentageAmount).toBe('30'); // 15% of 200
      expect(result.finalResult).toBe('230'); // 200 + 30
      expect(result.steps).toHaveLength(4);
    });

    test('User Flow: Sign Toggle Operations (-5 + 3 = -2)', () => {
      const signToggleFlow = {
        processSignToggle: function(number, shouldToggle) {
          let processedNumber = number;
          
          if (shouldToggle) {
            const toggleResult = toggleSign(number);
            if (!toggleResult.hasError) {
              processedNumber = toggleResult.result;
            }
          }
          
          return processedNumber;
        },
        
        calculateWithSignToggle: function(num1, toggleFirst, operator, num2, toggleSecond) {
          const processedNum1 = this.processSignToggle(num1, toggleFirst);
          const processedNum2 = this.processSignToggle(num2, toggleSecond);
          
          return safeCalculation(processedNum1, operator, processedNum2);
        }
      };

      // Test: 5 -> toggle to -5, then -5 + 3 = -2
      const result = signToggleFlow.calculateWithSignToggle('5', true, '+', '3', false);
      
      expect(result.hasError).toBe(false);
      expect(result.result).toBe(-2);
      expect(result.displayValue).toBe('-2');
    });
  });

  describe('Error Handling User Flows', () => {
    test('User Flow: Division by Zero Error and Recovery', () => {
      const errorRecoveryFlow = {
        state: {
          hasError: false,
          errorMessage: '',
          displayValue: '0'
        },
        
        attemptCalculation: function(num1, operator, num2) {
          const result = safeCalculation(num1, operator, num2);
          
          if (result.hasError) {
            this.state.hasError = true;
            this.state.errorMessage = result.errorMessage;
            this.state.displayValue = result.errorMessage;
          } else {
            this.state.hasError = false;
            this.state.errorMessage = '';
            this.state.displayValue = result.displayValue;
          }
          
          return result;
        },
        
        clearError: function() {
          const resetState = resetErrorState();
          this.state.hasError = resetState.hasError;
          this.state.errorMessage = resetState.errorMessage;
          this.state.displayValue = resetState.displayValue;
        },
        
        recoverAndCalculate: function(num1, operator, num2) {
          this.clearError();
          return this.attemptCalculation(num1, operator, num2);
        }
      };

      // Step 1: Attempt division by zero
      const errorResult = errorRecoveryFlow.attemptCalculation('10', '/', '0');
      expect(errorResult.hasError).toBe(true);
      expect(errorResult.errorType).toBe(ERROR_TYPES.DIVISION_BY_ZERO);
      expect(errorRecoveryFlow.state.hasError).toBe(true);

      // Step 2: Clear error and perform valid calculation
      const recoveryResult = errorRecoveryFlow.recoverAndCalculate('8', '+', '2');
      expect(recoveryResult.hasError).toBe(false);
      expect(recoveryResult.result).toBe(10);
      expect(errorRecoveryFlow.state.hasError).toBe(false);
      expect(errorRecoveryFlow.state.displayValue).toBe('10');
    });

    test('User Flow: Invalid Input Sequence Handling', () => {
      const inputValidationFlow = {
        validateAndProcess: function(inputSequence) {
          const results = [];
          let currentState = { input: '', operator: '', hasError: false };
          
          for (const input of inputSequence) {
            if (input.type === 'number') {
              // Validate number input
              if (input.value === '.' && currentState.input.includes('.')) {
                results.push({
                  input: input.value,
                  accepted: false,
                  reason: 'Multiple decimal points not allowed'
                });
              } else {
                currentState.input += input.value;
                results.push({
                  input: input.value,
                  accepted: true,
                  currentInput: currentState.input
                });
              }
            } else if (input.type === 'operator') {
              if (!currentState.input || currentState.input === '') {
                results.push({
                  input: input.value,
                  accepted: false,
                  reason: 'Cannot start with operator'
                });
              } else {
                currentState.operator = input.value;
                results.push({
                  input: input.value,
                  accepted: true,
                  operator: input.value
                });
              }
            }
          }
          
          return results;
        }
      };

      const invalidSequence = [
        { type: 'number', value: '1' },
        { type: 'number', value: '2' },
        { type: 'number', value: '.' },
        { type: 'number', value: '3' },
        { type: 'number', value: '.' }, // Invalid: second decimal
        { type: 'number', value: '4' },
        { type: 'operator', value: '+' }
      ];

      const results = inputValidationFlow.validateAndProcess(invalidSequence);
      
      // Find the invalid decimal input
      const invalidDecimal = results.find(r => r.reason === 'Multiple decimal points not allowed');
      expect(invalidDecimal).toBeDefined();
      expect(invalidDecimal.accepted).toBe(false);
      
      // Verify valid inputs were accepted
      const validInputs = results.filter(r => r.accepted);
      expect(validInputs.length).toBeGreaterThan(0);
    });

    test('User Flow: Large Number Overflow Handling', () => {
      const overflowFlow = {
        testLargeCalculation: function(num1, operator, num2) {
          const result = safeCalculation(num1, operator, num2);
          
          return {
            input: `${num1} ${operator} ${num2}`,
            result: result.result,
            displayValue: result.displayValue,
            hasError: result.hasError,
            errorType: result.errorType,
            isScientificNotation: result.displayValue && result.displayValue.includes('e'),
            isOverflow: result.hasError && result.errorType === ERROR_TYPES.OVERFLOW
          };
        }
      };

      // Test very large number multiplication
      const largeResult = overflowFlow.testLargeCalculation('999999999', '*', '999999999');
      
      expect(largeResult.hasError).toBe(false); // Should handle large numbers
      expect(largeResult.result).toBe(999999998000000001);
      
      // Should use scientific notation for display
      if (largeResult.displayValue.length > 10) {
        expect(largeResult.isScientificNotation).toBe(true);
      }
    });
  });

  describe('Real-World User Scenarios', () => {
    test('User Flow: Restaurant Bill Calculation with Tip', () => {
      const billCalculator = {
        calculateTip: function(billAmount, tipPercentage) {
          // Calculate tip amount
          const tipResult = calculatePercentage(tipPercentage, billAmount, '*');
          if (tipResult.hasError) return tipResult;
          
          const tipAmount = safeCalculation(billAmount, '*', tipResult.displayValue);
          if (tipAmount.hasError) return tipAmount;
          
          // Calculate total bill
          const totalBill = safeCalculation(billAmount, '+', tipAmount.displayValue);
          
          return {
            billAmount,
            tipPercentage,
            tipAmount: tipAmount.displayValue,
            totalBill: totalBill.displayValue,
            hasError: totalBill.hasError,
            breakdown: {
              original: billAmount,
              tip: tipAmount.displayValue,
              total: totalBill.displayValue
            }
          };
        }
      };

      const billResult = billCalculator.calculateTip('85.50', '18');
      
      expect(billResult.hasError).toBe(false);
      expect(parseFloat(billResult.tipAmount)).toBeCloseTo(15.39, 2);
      expect(parseFloat(billResult.totalBill)).toBeCloseTo(100.89, 2);
    });

    test('User Flow: Shopping Discount Calculation', () => {
      const discountCalculator = {
        applyDiscount: function(originalPrice, discountPercentage) {
          // Calculate discount amount
          const discountResult = calculatePercentage(discountPercentage, originalPrice, '+');
          if (discountResult.hasError) return discountResult;
          
          // Calculate final price
          const finalPrice = safeCalculation(originalPrice, '-', discountResult.displayValue);
          
          return {
            originalPrice,
            discountPercentage,
            discountAmount: discountResult.displayValue,
            finalPrice: finalPrice.displayValue,
            savings: discountResult.displayValue,
            hasError: finalPrice.hasError
          };
        }
      };

      const discountResult = discountCalculator.applyDiscount('120', '25');
      
      expect(discountResult.hasError).toBe(false);
      expect(discountResult.discountAmount).toBe('30'); // 25% of 120
      expect(discountResult.finalPrice).toBe('90'); // 120 - 30
      expect(discountResult.savings).toBe('30');
    });

    test('User Flow: Unit Conversion Calculation', () => {
      const unitConverter = {
        convert: function(value, conversionFactor, fromUnit, toUnit) {
          const result = safeCalculation(value, '*', conversionFactor);
          
          return {
            originalValue: value,
            originalUnit: fromUnit,
            conversionFactor,
            convertedValue: result.displayValue,
            convertedUnit: toUnit,
            hasError: result.hasError,
            conversionString: `${value} ${fromUnit} = ${result.displayValue} ${toUnit}`
          };
        }
      };

      // Convert 5.5 feet to inches (multiply by 12)
      const feetToInches = unitConverter.convert('5.5', '12', 'feet', 'inches');
      
      expect(feetToInches.hasError).toBe(false);
      expect(feetToInches.convertedValue).toBe('66');
      expect(feetToInches.conversionString).toBe('5.5 feet = 66 inches');
    });
  });

  describe('Edge Case User Flows', () => {
    test('User Flow: Rapid Button Presses', () => {
      const rapidInputHandler = {
        inputQueue: [],
        processing: false,
        
        queueInput: function(input) {
          this.inputQueue.push({
            input,
            timestamp: Date.now(),
            processed: false
          });
        },
        
        processQueue: function() {
          if (this.processing) return [];
          
          this.processing = true;
          const processed = [];
          
          while (this.inputQueue.length > 0) {
            const item = this.inputQueue.shift();
            item.processed = true;
            processed.push(item);
          }
          
          this.processing = false;
          return processed;
        }
      };

      // Simulate rapid button presses
      for (let i = 0; i < 10; i++) {
        rapidInputHandler.queueInput(`button-${i}`);
      }
      
      const processed = rapidInputHandler.processQueue();
      expect(processed).toHaveLength(10);
      expect(processed.every(item => item.processed)).toBe(true);
    });

    test('User Flow: Memory Pressure Simulation', () => {
      const memoryTest = {
        calculations: [],
        maxCalculations: 1000,
        
        performManyCalculations: function() {
          for (let i = 0; i < this.maxCalculations; i++) {
            const result = safeCalculation(
              (i + 1).toString(),
              '+',
              (i + 2).toString()
            );
            
            this.calculations.push({
              id: i,
              result: result.result,
              timestamp: Date.now()
            });
          }
          
          return this.calculations.length;
        },
        
        cleanup: function() {
          this.calculations = [];
        }
      };

      const calculationCount = memoryTest.performManyCalculations();
      expect(calculationCount).toBe(1000);
      
      // Verify calculations are correct
      expect(memoryTest.calculations[0].result).toBe(3); // 1 + 2
      expect(memoryTest.calculations[999].result).toBe(2001); // 1000 + 1001
      
      // Cleanup
      memoryTest.cleanup();
      expect(memoryTest.calculations).toHaveLength(0);
    });
  });
});