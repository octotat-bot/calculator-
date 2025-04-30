import { useState, useEffect } from 'react';
import './Calculator.css';

const Calculator = ({ addToHistory }) => {
  const [display, setDisplay] = useState('0');
  const [memory, setMemory] = useState(null);
  const [operator, setOperator] = useState(null);
  const [waitForOperand, setWaitForOperand] = useState(false);
  const [prevCalculation, setPrevCalculation] = useState('');
  const [error, setError] = useState(null);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key >= '0' && e.key <= '9') {
        inputDigit(parseInt(e.key, 10));
      } else if (e.key === '.') {
        inputDot();
      } else if (e.key === '+') {
        performOperation('+');
      } else if (e.key === '-') {
        performOperation('-');
      } else if (e.key === '*') {
        performOperation('×');
      } else if (e.key === '/') {
        performOperation('÷');
      } else if (e.key === '%') {
        inputPercent();
      } else if (e.key === 'Enter' || e.key === '=') {
        performEquals();
      } else if (e.key === 'Escape') {
        clearAll();
      } else if (e.key === 'Backspace') {
        backspace();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [display, operator, memory, waitForOperand]);

  // Clear error message after 3 seconds
  useEffect(() => {
    if (error) {
      const timeoutId = setTimeout(() => {
        setError(null);
      }, 3000);
      return () => clearTimeout(timeoutId);
    }
  }, [error]);

  const clearAll = () => {
    setDisplay('0');
    setMemory(null);
    setOperator(null);
    setWaitForOperand(false);
    setPrevCalculation('');
    setError(null);
  };

  const clearDisplay = () => {
    setDisplay('0');
    setError(null);
  };

  const backspace = () => {
    if (error) {
      setError(null);
      setDisplay('0');
      return;
    }

    if (display.length > 1) {
      setDisplay(display.substring(0, display.length - 1));
    } else {
      setDisplay('0');
    }
  };

  const inputDigit = (digit) => {
    if (error) {
      setError(null);
      setDisplay(String(digit));
      return;
    }

    if (waitForOperand) {
      setDisplay(String(digit));
      setWaitForOperand(false);
    } else {
      setDisplay(display === '0' ? String(digit) : display + digit);
    }
  };

  const inputDot = () => {
    if (error) {
      setError(null);
      setDisplay('0.');
      return;
    }

    if (waitForOperand) {
      setDisplay('0.');
      setWaitForOperand(false);
      return;
    }

    if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const inputPercent = () => {
    if (error) {
      setError(null);
      return;
    }

    try {
      const value = parseFloat(display);
      const result = value / 100;
      setDisplay(String(result));
    } catch (e) {
      setError('Invalid operation');
    }
  };

  const toggleSign = () => {
    if (error) {
      setError(null);
      return;
    }

    try {
      const value = parseFloat(display);
      setDisplay(String(-value));
    } catch (e) {
      setError('Invalid operation');
    }
  };

  const performOperation = (nextOperator) => {
    if (error) {
      setError(null);
      setDisplay('0');
      setOperator(nextOperator);
      setWaitForOperand(true);
      return;
    }

    try {
      const inputValue = parseFloat(display);

      if (memory === null) {
        setMemory(inputValue);
      } else if (operator) {
        const currentValue = memory || 0;
        let newValue;

        switch (operator) {
          case '+':
            newValue = currentValue + inputValue;
            break;
          case '-':
            newValue = currentValue - inputValue;
            break;
          case '×':
            newValue = currentValue * inputValue;
            break;
          case '÷':
            if (inputValue === 0) {
              setError('Division by zero');
              return;
            }
            newValue = currentValue / inputValue;
            break;
          default:
            newValue = inputValue;
        }

        setMemory(newValue);
        setDisplay(String(newValue));
        setPrevCalculation(`${currentValue} ${operator} ${inputValue} = ${newValue}`);
      }

      setWaitForOperand(true);
      setOperator(nextOperator);
    } catch (e) {
      setError('Invalid operation');
    }
  };

  const performEquals = () => {
    if (error) {
      setError(null);
      return;
    }

    if (operator === null) return;

    try {
      const inputValue = parseFloat(display);
      const currentValue = memory || 0;
      let newValue;

      switch (operator) {
        case '+':
          newValue = currentValue + inputValue;
          break;
        case '-':
          newValue = currentValue - inputValue;
          break;
        case '×':
          newValue = currentValue * inputValue;
          break;
        case '÷':
          if (inputValue === 0) {
            setError('Division by zero');
            return;
          }
          newValue = currentValue / inputValue;
          break;
        default:
          newValue = inputValue;
      }

      // Format the result better
      const formattedValue = Number.isInteger(newValue) ? 
        newValue.toString() : 
        parseFloat(newValue.toFixed(10)).toString();

      const calculation = `${currentValue} ${operator} ${inputValue} = ${formattedValue}`;
      
      setDisplay(formattedValue);
      setMemory(null);
      setOperator(null);
      setWaitForOperand(false);
      setPrevCalculation(calculation);
      addToHistory(calculation);
    } catch (e) {
      setError('Invalid operation');
    }
  };

  // Memory operations
  const memoryStore = () => {
    if (error) return;
    setMemory(parseFloat(display));
  };

  const memoryRecall = () => {
    if (error) return;
    if (memory !== null) {
      setDisplay(String(memory));
      setWaitForOperand(true);
    }
  };

  const memoryClear = () => {
    if (error) return;
    setMemory(null);
  };

  const renderButton = (label, onClick, className = '') => (
    <button 
      className={className} 
      onClick={onClick}
    >
      {label}
    </button>
  );

  return (
    <div className="calculator-pad">
      {error && <div className="calculation-error">{error}</div>}
      <div className="display">
        <div className="prev-calculation">{prevCalculation}</div>
        <div className="current-input">{display}</div>
      </div>
      <div className="buttons">
        {/* First row */}
        {renderButton('M+', () => memoryStore(), 'memory-btn')}
        {renderButton('MR', () => memoryRecall(), 'memory-btn')}
        {renderButton('MC', () => memoryClear(), 'memory-btn')}
        {renderButton('AC', clearAll, 'clear')}
        
        {/* Second row */}
        {renderButton('⌫', backspace, 'function')}
        {renderButton('%', inputPercent, 'function')}
        {renderButton('±', toggleSign, 'function')}
        {renderButton('÷', () => performOperation('÷'), 'operator')}
        
        {/* Third row */}
        {renderButton('7', () => inputDigit(7), 'number')}
        {renderButton('8', () => inputDigit(8), 'number')}
        {renderButton('9', () => inputDigit(9), 'number')}
        {renderButton('×', () => performOperation('×'), 'operator')}
        
        {/* Fourth row */}
        {renderButton('4', () => inputDigit(4), 'number')}
        {renderButton('5', () => inputDigit(5), 'number')}
        {renderButton('6', () => inputDigit(6), 'number')}
        {renderButton('-', () => performOperation('-'), 'operator')}
        
        {/* Fifth row */}
        {renderButton('1', () => inputDigit(1), 'number')}
        {renderButton('2', () => inputDigit(2), 'number')}
        {renderButton('3', () => inputDigit(3), 'number')}
        {renderButton('+', () => performOperation('+'), 'operator')}
        
        {/* Sixth row */}
        {renderButton('0', () => inputDigit(0), 'number')}
        {renderButton('.', inputDot, 'number')}
        {renderButton('=', performEquals, 'equals')}
      </div>
    </div>
  );
};

export default Calculator; 