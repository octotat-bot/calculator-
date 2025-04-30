import { useState, useEffect } from 'react';
import './ScientificMode.css';
import * as math from 'mathjs';

const ScientificMode = ({ addToHistory }) => {
  const [display, setDisplay] = useState('0');
  const [prevCalculation, setPrevCalculation] = useState('');
  const [waitForOperand, setWaitForOperand] = useState(false);
  const [degreeMode, setDegreeMode] = useState(true); // true for degree, false for radian
  const [memory, setMemory] = useState(null);
  const [shiftMode, setShiftMode] = useState(false); // Toggle for inverse functions
  const [bracketCount, setBracketCount] = useState(0); // Track open brackets
  const [history, setHistory] = useState([]); // Local calculation history
  const [theme, setTheme] = useState('default'); // Calculator theme
  const [precision, setPrecision] = useState(10); // Decimal precision
  const [notation, setNotation] = useState('auto'); // 'auto', 'fixed', 'scientific'
  const [error, setError] = useState(null); // For error messages

  // Load saved settings from localStorage if available
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('calculator-settings');
      if (savedSettings) {
        const { degreeMode: savedDegreeMode, precision: savedPrecision, notation: savedNotation } = JSON.parse(savedSettings);
        setDegreeMode(savedDegreeMode !== undefined ? savedDegreeMode : true);
        setPrecision(savedPrecision || 10);
        setNotation(savedNotation || 'auto');
      }
    } catch (e) {
      console.error("Error loading saved settings:", e);
    }
  }, []);

  // Save settings to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem('calculator-settings', JSON.stringify({
        degreeMode,
        precision,
        notation
      }));
    } catch (e) {
      console.error("Error saving settings:", e);
    }
  }, [degreeMode, precision, notation]);

  // Clear any error message after 3 seconds
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
    setPrevCalculation('');
    setWaitForOperand(false);
    setBracketCount(0);
    setError(null);
  };

  const clearEntry = () => {
    setDisplay('0');
    setWaitForOperand(false);
    setError(null);
  };

  const backspace = () => {
    if (display.length > 1) {
      // Check if we're deleting an open bracket
      if (display[display.length - 1] === '(') {
        setBracketCount(bracketCount - 1);
      } else if (display[display.length - 1] === ')') {
        setBracketCount(bracketCount + 1);
      }
      setDisplay(display.substring(0, display.length - 1));
    } else {
      setDisplay('0');
    }
    setError(null);
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

    // Check if the last number in display already has a decimal point
    const parts = display.split(/[\+\-\*\/\(\)]/).filter(Boolean);
    const lastPart = parts[parts.length - 1] || '';
    
    if (!lastPart.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const toggleSign = () => {
    if (error) {
      setError(null);
      return;
    }
    
    if (display !== '0') {
      // Check if the display has operations or just a number
      if (display.match(/[\+\-\*\/\(\)]/)) {
        // Complex expression, append negative sign to the last term
        const lastDigitIndex = display.search(/\d+$/);
        if (lastDigitIndex !== -1) {
          const start = display.substring(0, lastDigitIndex);
          const end = display.substring(lastDigitIndex);
          // If there's a - right before the number, remove it; otherwise add it
          if (start.endsWith('-') && 
              (start.length === 1 || '+-*/('.includes(start[start.length - 2]))) {
            setDisplay(start.substring(0, start.length - 1) + end);
          } else {
            setDisplay(start + '-' + end);
          }
        }
      } else {
        // Simple number, just toggle the sign
        setDisplay(String(-parseFloat(display)));
      }
    }
  };

  const inputOperator = (operator) => {
    if (error) {
      setError(null);
      setDisplay('0' + operator);
      return;
    }
    
    // If the last character is an operator, replace it
    if (['+', '-', '*', '/', '^'].includes(display.slice(-1))) {
      setDisplay(display.slice(0, -1) + operator);
    } else {
      setDisplay(display + operator);
    }
    setWaitForOperand(false);
  };

  const inputBracket = (bracket) => {
    if (error) {
      setError(null);
      setDisplay(bracket === '(' ? '(' : '0');
      if (bracket === '(') setBracketCount(1);
      return;
    }
    
    if (bracket === '(') {
      // Add a multiplication operator if needed
      if (display !== '0' && !display.match(/[\+\-\*\/\(\)]$/)) {
        setDisplay(display + '*' + bracket);
      } else if (display === '0') {
        setDisplay(bracket);
      } else {
        setDisplay(display + bracket);
      }
      setBracketCount(bracketCount + 1);
    } else {
      // Only add closing bracket if we have open brackets
      if (bracketCount > 0) {
        setDisplay(display + bracket);
        setBracketCount(bracketCount - 1);
      }
    }
    setWaitForOperand(false);
  };

  const calculateResult = () => {
    if (error) {
      setError(null);
      return;
    }
    
    try {
      // Add missing closing brackets if needed
      let expression = display;
      for (let i = 0; i < bracketCount; i++) {
        expression += ')';
      }
      
      // Replace special symbols with mathjs functions
      expression = expression.replace(/π/g, 'PI');
      expression = expression.replace(/e/g, 'E');
      expression = expression.replace(/\^/g, '**'); // Convert ^ to ** for mathjs exponentiation
      
      // Handle trigonometric functions in degree mode
      if (degreeMode) {
        expression = expression.replace(/sin\(/g, 'sin(PI/180*');
        expression = expression.replace(/cos\(/g, 'cos(PI/180*');
        expression = expression.replace(/tan\(/g, 'tan(PI/180*');
        // Handle inverse trig functions in degree mode
        expression = expression.replace(/asin\(/g, '(180/PI)*asin(');
        expression = expression.replace(/acos\(/g, '(180/PI)*acos(');
        expression = expression.replace(/atan\(/g, '(180/PI)*atan(');
      }
      
      const result = math.evaluate(expression);
      const formattedResult = formatResult(result);
      const calculation = `${display} = ${formattedResult}`;
      
      // Store the calculation in local history
      setHistory(prev => [...prev.slice(-9), calculation]);
      
      setDisplay(formattedResult);
      setPrevCalculation(calculation);
      setWaitForOperand(true);
      setBracketCount(0);
      addToHistory(calculation);
    } catch (error) {
      console.error("Calculation error:", error.message);
      setError(error.message || "Error in calculation");
      setDisplay('Error');
      setWaitForOperand(true);
    }
  };

  // Format result based on user settings
  const formatResult = (value) => {
    try {
      if (typeof value !== 'number') {
        return String(value);
      }
      
      if (notation === 'scientific' || 
         (notation === 'auto' && (Math.abs(value) < 0.000001 || Math.abs(value) >= 1e10))) {
        return value.toExponential(Math.min(precision - 1, 10));
      }
      
      if (notation === 'fixed') {
        return value.toFixed(Math.min(precision, 10));
      }
      
      // For auto notation with normal numbers
      const precisionFactor = Math.pow(10, precision);
      return String(Math.round(value * precisionFactor) / precisionFactor);
    } catch (e) {
      console.error("Formatting error:", e);
      return String(value);
    }
  };

  const applyFunction = (func) => {
    if (error) {
      setError(null);
      setDisplay('0');
      return;
    }
    
    try {
      let result;
      const value = parseFloat(display);
      
      // Functions that act on the current display value immediately
      if (func === 'sqrt' || func === 'square' || func === 'cube' || 
          func === 'exp' || func === 'fact' || func === '10^x' || 
          func === 'log' || func === 'ln' || func === '1/x' ||
          func === 'abs' || func === 'round' || func === 'floor' || 
          func === 'ceil' || func === 'sign') {
        
        switch (func) {
          case 'sqrt':
            if (value < 0) throw new Error("Cannot calculate square root of negative number");
            result = Math.sqrt(value);
            break;
          case 'square':
            result = Math.pow(value, 2);
            break;
          case 'cube':
            result = Math.pow(value, 3);
            break;
          case 'exp':
            result = Math.exp(value);
            break;
          case 'fact':
            if (value < 0 || !Number.isInteger(value)) 
              throw new Error("Factorial only defined for non-negative integers");
            result = math.factorial(value);
            break;
          case '10^x':
            result = Math.pow(10, value);
            break;
          case 'log':
            if (value <= 0) throw new Error("Cannot calculate log of non-positive number");
            result = Math.log10(value);
            break;
          case 'ln':
            if (value <= 0) throw new Error("Cannot calculate ln of non-positive number");
            result = Math.log(value);
            break;
          case '1/x':
            if (value === 0) throw new Error("Cannot divide by zero");
            result = 1 / value;
            break;
          case 'abs':
            result = Math.abs(value);
            break;
          case 'round':
            result = Math.round(value);
            break;
          case 'floor':
            result = Math.floor(value);
            break;
          case 'ceil':
            result = Math.ceil(value);
            break;
          case 'sign':
            result = Math.sign(value);
            break;
          default:
            result = value;
        }
        
        const calculation = `${func}(${value}) = ${formatResult(result)}`;
        setDisplay(formatResult(result));
        setPrevCalculation(calculation);
        setWaitForOperand(true);
        setHistory(prev => [...prev.slice(-9), calculation]);
        addToHistory(calculation);
      } else {
        // Functions that need to be inserted into the expression
        // Handle trigonometric functions differently
        const funcName = shiftMode ? 
          (func === 'sin' ? 'asin' : func === 'cos' ? 'acos' : func === 'tan' ? 'atan' : func) : 
          func;
        
        if (display === '0') {
          setDisplay(funcName + '(');
        } else if (display.match(/[\+\-\*\/\(]$/)) {
          setDisplay(display + funcName + '(');
        } else {
          setDisplay(display + '*' + funcName + '(');
        }
        
        setBracketCount(bracketCount + 1);
      }
    } catch (error) {
      console.error("Function error:", error.message);
      setError(error.message || `Error applying ${func}`);
      setDisplay('Error');
      setWaitForOperand(true);
    }
  };

  const toggleDegreeMode = () => {
    setDegreeMode(!degreeMode);
  };

  const toggleShiftMode = () => {
    setShiftMode(!shiftMode);
  };

  const setCalculationPrecision = (level) => {
    setPrecision(level);
  };

  const setNumberNotation = (type) => {
    setNotation(type);
  };

  const inputConstant = (constant) => {
    if (error) {
      setError(null);
      setDisplay(constant === 'π' ? String(Math.PI) : String(Math.E));
      return;
    }
    
    if (waitForOperand) {
      if (constant === 'π') {
        setDisplay(String(Math.PI));
      } else if (constant === 'e') {
        setDisplay(String(Math.E));
      }
      setWaitForOperand(false);
    } else {
      // Insert the constant at the cursor
      if (display === '0') {
        if (constant === 'π') {
          setDisplay('π');
        } else if (constant === 'e') {
          setDisplay('e');
        }
      } else if (display.match(/[\+\-\*\/\(]$/)) {
        setDisplay(display + constant);
      } else {
        setDisplay(display + '*' + constant);
      }
    }
  };

  const memoryStore = () => {
    try {
      const currentValue = parseFloat(display);
      setMemory(currentValue);
    } catch (error) {
      setError("Could not store value in memory");
    }
  };

  const memoryRecall = () => {
    if (memory !== null) {
      setDisplay(String(memory));
      setWaitForOperand(true);
    }
  };

  const memoryClear = () => {
    setMemory(null);
  };

  const memoryAdd = () => {
    try {
      if (memory !== null) {
        const currentValue = parseFloat(display);
        setMemory(memory + currentValue);
      } else {
        memoryStore();
      }
    } catch (error) {
      setError("Could not update memory");
    }
  };

  const memorySubtract = () => {
    try {
      if (memory !== null) {
        const currentValue = parseFloat(display);
        setMemory(memory - currentValue);
      } else {
        const currentValue = parseFloat(display);
        setMemory(-currentValue);
      }
    } catch (error) {
      setError("Could not update memory");
    }
  };

  const recallHistoryItem = (index) => {
    if (history.length > index) {
      const item = history[index];
      const expression = item.split(' = ')[0];
      setDisplay(expression);
      setWaitForOperand(false);
    }
  };

  // Keyboard event handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key >= '0' && e.key <= '9') {
        inputDigit(parseInt(e.key));
      } else if (e.key === '.') {
        inputDot();
      } else if (e.key === '+') {
        inputOperator('+');
      } else if (e.key === '-') {
        inputOperator('-');
      } else if (e.key === '*') {
        inputOperator('*');
      } else if (e.key === '/') {
        inputOperator('/');
      } else if (e.key === '^') {
        inputOperator('^');
      } else if (e.key === '(') {
        inputBracket('(');
      } else if (e.key === ')') {
        inputBracket(')');
      } else if (e.key === 'Enter' || e.key === '=') {
        calculateResult();
      } else if (e.key === 'Backspace') {
        backspace();
      } else if (e.key === 'Escape') {
        clearAll();
      } else if (e.key === 'Delete') {
        clearEntry();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [display, bracketCount, waitForOperand, error]);

  // Render functions for UI
  const renderButton = (label, onClick, className) => (
    <button
      onClick={onClick}
      className={className}
      key={label}
      aria-label={label}
    >
      {label}
    </button>
  );

  return (
    <div className={`scientific-calculator theme-${theme}`}>
      {error && <div className="calculation-error">{error}</div>}
      <div className="calculator-header">
        <div className="mode-toggles">
          <button 
            className={degreeMode ? 'active' : ''} 
            onClick={toggleDegreeMode}
          >
            {degreeMode ? 'DEG' : 'RAD'}
          </button>
          <button 
            className={shiftMode ? 'active' : ''} 
            onClick={toggleShiftMode}
          >
            SHIFT
          </button>
          <button 
            className={notation === 'auto' ? 'active' : ''} 
            onClick={() => setNumberNotation('auto')}
          >
            AUTO
          </button>
          <button 
            className={notation === 'scientific' ? 'active' : ''} 
            onClick={() => setNumberNotation('scientific')}
          >
            SCI
          </button>
        </div>
        <div className="memory-indicator">
          {memory !== null && <span className="memory-label">M</span>}
        </div>
      </div>
      
      <div className="display">
        {bracketCount > 0 && (
          <div className="bracket-indicator">{bracketCount} (</div>
        )}
        <div className="prev-calculation">{prevCalculation}</div>
        <div className="current-input">{display}</div>
      </div>

      <div className="scientific-buttons">
        {/* First row */}
        {renderButton(shiftMode ? 'y^x' : 'x^y', () => inputOperator('^'), 'function')}
        {renderButton('(', () => inputBracket('('), 'function')}
        {renderButton(')', () => inputBracket(')'), 'function')}
        {renderButton('MC', memoryClear, 'memory-btn')}
        {renderButton('MR', memoryRecall, 'memory-btn')}

        {/* Second row */}
        {renderButton(shiftMode ? '2^x' : '10^x', () => applyFunction(shiftMode ? '2^x' : '10^x'), 'function')}
        {renderButton(shiftMode ? 'asin' : 'sin', () => applyFunction('sin'), 'function')}
        {renderButton(shiftMode ? 'acos' : 'cos', () => applyFunction('cos'), 'function')}
        {renderButton(shiftMode ? 'atan' : 'tan', () => applyFunction('tan'), 'function')}
        {renderButton('M+', memoryAdd, 'memory-btn')}

        {/* Third row */}
        {renderButton(shiftMode ? 'log2' : 'log', () => applyFunction(shiftMode ? 'log2' : 'log'), 'function')}
        {renderButton(shiftMode ? 'cube' : 'square', () => applyFunction(shiftMode ? 'cube' : 'square'), 'function')}
        {renderButton(shiftMode ? 'cbrt' : 'sqrt', () => applyFunction(shiftMode ? 'cbrt' : 'sqrt'), 'function')}
        {renderButton(shiftMode ? 'exp' : '1/x', () => applyFunction(shiftMode ? 'exp' : '1/x'), 'function')}
        {renderButton('M-', memorySubtract, 'memory-btn')}

        {/* Fourth row */}
        {renderButton(shiftMode ? 'logx' : 'ln', () => applyFunction(shiftMode ? 'logx' : 'ln'), 'function')}
        {renderButton(shiftMode ? 'floor' : 'abs', () => applyFunction(shiftMode ? 'floor' : 'abs'), 'function')}
        {renderButton(shiftMode ? 'ceil' : 'round', () => applyFunction(shiftMode ? 'ceil' : 'round'), 'function')}
        {renderButton(shiftMode ? 'sign' : 'fact', () => applyFunction(shiftMode ? 'sign' : 'fact'), 'function')}
        {renderButton('MS', memoryStore, 'memory-btn')}

        {/* Fifth row */}
        {renderButton('7', () => inputDigit(7), 'number')}
        {renderButton('8', () => inputDigit(8), 'number')}
        {renderButton('9', () => inputDigit(9), 'number')}
        {renderButton('DEL', backspace, 'clear')}
        {renderButton('AC', clearAll, 'clear')}

        {/* Sixth row */}
        {renderButton('4', () => inputDigit(4), 'number')}
        {renderButton('5', () => inputDigit(5), 'number')}
        {renderButton('6', () => inputDigit(6), 'number')}
        {renderButton('×', () => inputOperator('*'), 'operator')}
        {renderButton('÷', () => inputOperator('/'), 'operator')}

        {/* Seventh row */}
        {renderButton('1', () => inputDigit(1), 'number')}
        {renderButton('2', () => inputDigit(2), 'number')}
        {renderButton('3', () => inputDigit(3), 'number')}
        {renderButton('+', () => inputOperator('+'), 'operator')}
        {renderButton('-', () => inputOperator('-'), 'operator')}

        {/* Eighth row */}
        {renderButton('0', () => inputDigit(0), 'number')}
        {renderButton('.', inputDot, 'number')}
        {renderButton('±', toggleSign, 'number')}
        {renderButton('=', calculateResult, 'equals')}
      </div>
    </div>
  );
};

export default ScientificMode; 