import { useState, useEffect } from 'react';
import * as math from 'mathjs';
import './ComplexMode.css';

const ComplexMode = ({ addToHistory }) => {
  const [display, setDisplay] = useState('0');
  const [result, setResult] = useState('');
  const [expression, setExpression] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [error, setError] = useState(null);
  const [prevCalculations, setPrevCalculations] = useState([]);
  
  // Function to handle number and operator inputs
  const handleInput = (value) => {
    if (error) {
      setError(null);
      setDisplay(value);
      setExpression(value);
      return;
    }
    
    if (showResult) {
      if ("0123456789.i".includes(value)) {
        setDisplay(value);
        setExpression(value);
      } else {
        setDisplay(display + value);
        setExpression(expression + value);
      }
      setShowResult(false);
    } else {
      if (display === '0' && value !== '.') {
        setDisplay(value);
        setExpression(value);
      } else {
        setDisplay(display + value);
        setExpression(expression + value);
      }
    }
  };
  
  // Function to handle imaginary unit input
  const handleImaginaryUnit = () => {
    if (error) {
      setError(null);
      setDisplay('i');
      setExpression('i');
      return;
    }
    
    if (showResult) {
      setDisplay('i');
      setExpression('i');
      setShowResult(false);
    } else {
      if (display === '0') {
        setDisplay('i');
        setExpression('i');
      } else if ("0123456789.+-*/^()".includes(display.slice(-1))) {
        setDisplay(display + 'i');
        setExpression(expression + 'i');
      } else {
        setDisplay(display + '*i');
        setExpression(expression + '*i');
      }
    }
  };
  
  // Function to clear display
  const clearDisplay = () => {
    setDisplay('0');
    setExpression('');
    setResult('');
    setShowResult(false);
    setError(null);
  };
  
  // Function to delete the last character
  const backspace = () => {
    if (error) {
      setError(null);
      setDisplay('0');
      setExpression('');
      return;
    }
    
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
      setExpression(expression.slice(0, -1));
    } else {
      setDisplay('0');
      setExpression('');
    }
  };
  
  // Function to calculate the result
  const calculate = () => {
    try {
      // Replace 'i' with the imaginary unit for mathjs
      let processedExpression = expression.replace(/i/g, 'i');
      
      const complexResult = math.evaluate(processedExpression);
      
      // Format the complex result
      let formattedResult;
      if (math.typeOf(complexResult) === 'Complex') {
        const realPart = complexResult.re;
        const imagPart = complexResult.im;
        
        if (realPart === 0 && imagPart === 0) {
          formattedResult = '0';
        } else if (realPart === 0) {
          formattedResult = `${imagPart}i`;
        } else if (imagPart === 0) {
          formattedResult = `${realPart}`;
        } else {
          const imagSign = imagPart > 0 ? '+' : '';
          formattedResult = `${realPart}${imagSign}${imagPart}i`;
        }
      } else {
        formattedResult = complexResult.toString();
      }
      
      // Update state
      setResult(formattedResult);
      setShowResult(true);
      setDisplay(formattedResult);
      
      // Add to calculation history
      const calculation = `${expression} = ${formattedResult}`;
      setPrevCalculations(prev => [...prev.slice(-9), calculation]);
      addToHistory(calculation);
      
    } catch (err) {
      console.error('Calculation error:', err.message);
      setError(err.message || 'Error in calculation');
      setDisplay('Error');
      setShowResult(true);
    }
  };
  
  // Complex number operations
  const complexOperations = {
    abs: () => {
      try {
        const complexValue = math.evaluate(expression);
        const result = math.abs(complexValue);
        const calculation = `|${expression}| = ${result}`;
        
        setDisplay(result.toString());
        setResult(result.toString());
        setShowResult(true);
        setPrevCalculations(prev => [...prev.slice(-9), calculation]);
        addToHistory(calculation);
      } catch (err) {
        setError(err.message || 'Error calculating absolute value');
        setDisplay('Error');
      }
    },
    
    conj: () => {
      try {
        const complexValue = math.evaluate(expression);
        const result = math.conj(complexValue);
        
        // Format the complex result
        let formattedResult;
        if (math.typeOf(result) === 'Complex') {
          const realPart = result.re;
          const imagPart = result.im;
          
          if (realPart === 0 && imagPart === 0) {
            formattedResult = '0';
          } else if (realPart === 0) {
            formattedResult = `${imagPart}i`;
          } else if (imagPart === 0) {
            formattedResult = `${realPart}`;
          } else {
            const imagSign = imagPart > 0 ? '+' : '';
            formattedResult = `${realPart}${imagSign}${imagPart}i`;
          }
        } else {
          formattedResult = result.toString();
        }
        
        const calculation = `conj(${expression}) = ${formattedResult}`;
        
        setDisplay(formattedResult);
        setResult(formattedResult);
        setShowResult(true);
        setPrevCalculations(prev => [...prev.slice(-9), calculation]);
        addToHistory(calculation);
      } catch (err) {
        setError(err.message || 'Error calculating conjugate');
        setDisplay('Error');
      }
    },
    
    arg: () => {
      try {
        const complexValue = math.evaluate(expression);
        const result = math.arg(complexValue);
        const calculation = `arg(${expression}) = ${result}`;
        
        setDisplay(result.toString());
        setResult(result.toString());
        setShowResult(true);
        setPrevCalculations(prev => [...prev.slice(-9), calculation]);
        addToHistory(calculation);
      } catch (err) {
        setError(err.message || 'Error calculating argument');
        setDisplay('Error');
      }
    },
    
    re: () => {
      try {
        const complexValue = math.evaluate(expression);
        const result = math.re(complexValue);
        const calculation = `Re(${expression}) = ${result}`;
        
        setDisplay(result.toString());
        setResult(result.toString());
        setShowResult(true);
        setPrevCalculations(prev => [...prev.slice(-9), calculation]);
        addToHistory(calculation);
      } catch (err) {
        setError(err.message || 'Error extracting real part');
        setDisplay('Error');
      }
    },
    
    im: () => {
      try {
        const complexValue = math.evaluate(expression);
        const result = math.im(complexValue);
        const calculation = `Im(${expression}) = ${result}`;
        
        setDisplay(result.toString());
        setResult(result.toString());
        setShowResult(true);
        setPrevCalculations(prev => [...prev.slice(-9), calculation]);
        addToHistory(calculation);
      } catch (err) {
        setError(err.message || 'Error extracting imaginary part');
        setDisplay('Error');
      }
    },
    
    toPolar: () => {
      try {
        const complexValue = math.evaluate(expression);
        const r = math.abs(complexValue);
        const theta = math.arg(complexValue);
        const formattedResult = `${r} ∠ ${theta}`;
        const calculation = `${expression} in polar form = ${formattedResult}`;
        
        setDisplay(formattedResult);
        setResult(formattedResult);
        setShowResult(true);
        setPrevCalculations(prev => [...prev.slice(-9), calculation]);
        addToHistory(calculation);
      } catch (err) {
        setError(err.message || 'Error converting to polar form');
        setDisplay('Error');
      }
    },
    
    toExponential: () => {
      try {
        const complexValue = math.evaluate(expression);
        const r = math.abs(complexValue);
        const theta = math.arg(complexValue);
        const formattedResult = `${r}e^(${theta}i)`;
        const calculation = `${expression} in exponential form = ${formattedResult}`;
        
        setDisplay(formattedResult);
        setResult(formattedResult);
        setShowResult(true);
        setPrevCalculations(prev => [...prev.slice(-9), calculation]);
        addToHistory(calculation);
      } catch (err) {
        setError(err.message || 'Error converting to exponential form');
        setDisplay('Error');
      }
    }
  };
  
  // Keyboard event handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key >= '0' && e.key <= '9') {
        handleInput(e.key);
      } else if (e.key === '.') {
        handleInput('.');
      } else if (e.key === 'i') {
        handleImaginaryUnit();
      } else if (e.key === '+') {
        handleInput('+');
      } else if (e.key === '-') {
        handleInput('-');
      } else if (e.key === '*') {
        handleInput('*');
      } else if (e.key === '/') {
        handleInput('/');
      } else if (e.key === '^') {
        handleInput('^');
      } else if (e.key === '(') {
        handleInput('(');
      } else if (e.key === ')') {
        handleInput(')');
      } else if (e.key === 'Enter' || e.key === '=') {
        calculate();
      } else if (e.key === 'Backspace') {
        backspace();
      } else if (e.key === 'Escape') {
        clearDisplay();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [display, expression, showResult, error]);
  
  // Button rendering helper
  const renderButton = (label, onClick, className = '') => (
    <button
      className={`calculator-button ${className}`}
      onClick={onClick}
      key={label}
    >
      {label}
    </button>
  );
  
  // Handle history item click
  const handleHistoryClick = (calcValue) => {
    const resultValue = calcValue.split(' = ')[1];
    setDisplay(resultValue);
    setExpression(resultValue);
  };
  
  return (
    <div className="calculator-component complex-calculator">
      <div className="calculator-content">
        <div className="calculator-display">
          {error && <div className="calculation-error">{error}</div>}
          <div className="prev-input">{showResult ? expression : ''}</div>
          <div className="current-input">{display}</div>
        </div>
        
        <div className="calculator-functions">
          <div className="functions-group">
            <h3>Complex Functions</h3>
            <div className="functions-grid">
              {renderButton('|z|', complexOperations.abs, 'function')}
              {renderButton('conj', complexOperations.conj, 'function')}
              {renderButton('arg', complexOperations.arg, 'function')}
              {renderButton('Re', complexOperations.re, 'function')}
              {renderButton('Im', complexOperations.im, 'function')}
              {renderButton('Polar', complexOperations.toPolar, 'function')}
              {renderButton('e^iθ', complexOperations.toExponential, 'function')}
            </div>
          </div>
        </div>
        
        <div className="calculator-buttons">
          {/* First row */}
          {renderButton('7', () => handleInput('7'), 'number')}
          {renderButton('8', () => handleInput('8'), 'number')}
          {renderButton('9', () => handleInput('9'), 'number')}
          {renderButton('DEL', backspace, 'clear')}
          {renderButton('AC', clearDisplay, 'clear')}
          
          {/* Second row */}
          {renderButton('4', () => handleInput('4'), 'number')}
          {renderButton('5', () => handleInput('5'), 'number')}
          {renderButton('6', () => handleInput('6'), 'number')}
          {renderButton('×', () => handleInput('*'), 'operator')}
          {renderButton('÷', () => handleInput('/'), 'operator')}
          
          {/* Third row */}
          {renderButton('1', () => handleInput('1'), 'number')}
          {renderButton('2', () => handleInput('2'), 'number')}
          {renderButton('3', () => handleInput('3'), 'number')}
          {renderButton('+', () => handleInput('+'), 'operator')}
          {renderButton('-', () => handleInput('-'), 'operator')}
          
          {/* Fourth row */}
          {renderButton('0', () => handleInput('0'), 'number')}
          {renderButton('.', () => handleInput('.'), 'number')}
          {renderButton('i', handleImaginaryUnit, 'special')}
          {renderButton('^', () => handleInput('^'), 'operator')}
          {renderButton('=', calculate, 'equals')}
          
          {/* Fifth row */}
          {renderButton('(', () => handleInput('('), 'bracket')}
          {renderButton(')', () => handleInput(')'), 'bracket')}
        </div>
      </div>
    </div>
  );
};

export default ComplexMode; 