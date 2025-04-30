import { useState } from 'react';
import './AlgebraMode.css';
import * as algebrite from 'algebrite';
import { renderToString } from 'katex';

const AlgebraMode = ({ addToHistory }) => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [operation, setOperation] = useState('simplify');
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    setInput(e.target.value);
    setError('');
  };

  const handleOperationChange = (e) => {
    setOperation(e.target.value);
    setError('');
  };

  const performOperation = () => {
    if (!input.trim()) {
      setError('Please enter an expression');
      return;
    }

    try {
      let result;
      let displayOperation;

      switch (operation) {
        case 'simplify':
          result = algebrite.simplify(input).toString();
          displayOperation = 'Simplify';
          break;
        case 'expand':
          result = algebrite.expand(input).toString();
          displayOperation = 'Expand';
          break;
        case 'factor':
          result = algebrite.factor(input).toString();
          displayOperation = 'Factor';
          break;
        case 'solve':
          // Supports solving for one variable, assumes form: expression = expression
          if (!input.includes('=')) {
            setError('Equation must contain an equals sign (=)');
            return;
          }
          const [leftSide, rightSide] = input.split('=').map(side => side.trim());
          // Move everything to one side of the equation
          const equation = `(${leftSide})-(${rightSide})`;
          result = algebrite.roots(equation).toString();
          displayOperation = 'Solve';
          break;
        default:
          result = algebrite.simplify(input).toString();
          displayOperation = 'Simplify';
      }

      // Format result for display
      const historyItem = {
        input,
        operation: displayOperation,
        result,
        timestamp: new Date().toLocaleTimeString()
      };

      setResult(result);
      setHistory(prev => [historyItem, ...prev]);
      addToHistory(`${displayOperation}: ${input} = ${result}`);
      setError('');
    } catch (err) {
      setError(`Error: ${err.message || 'Unable to process the expression'}`);
      setResult('');
    }
  };

  // Function to render LaTeX (not fully implemented yet, would need to add more processing)
  const renderMath = (expression) => {
    try {
      return {
        __html: renderToString(expression, {
          throwOnError: false,
          displayMode: true
        })
      };
    } catch (err) {
      return { __html: expression };
    }
  };

  const clearInput = () => {
    setInput('');
    setResult('');
    setError('');
  };

  // Common examples for each operation type
  const getExample = () => {
    switch (operation) {
      case 'simplify':
        return '(x^2 + 2x + 1) / (x + 1)';
      case 'expand':
        return '(x+1)^2';
      case 'factor':
        return 'x^2 + 2x + 1';
      case 'solve':
        return '2x + 3 = 7';
      default:
        return '(x+1)^2';
    }
  };

  const setExample = () => {
    setInput(getExample());
  };

  return (
    <div className="algebra-calculator">
      <div className="algebra-controls">
        <div className="operation-select">
          <label htmlFor="operation">Operation:</label>
          <select id="operation" value={operation} onChange={handleOperationChange}>
            <option value="simplify">Simplify</option>
            <option value="expand">Expand</option>
            <option value="factor">Factor</option>
            <option value="solve">Solve Equation</option>
          </select>
        </div>
        
        <div className="input-area">
          <div className="input-label">
            <label htmlFor="algebraInput">Enter expression:</label>
            <button className="example-btn" onClick={setExample}>Example</button>
          </div>
          <div className="input-field">
            <input
              type="text"
              id="algebraInput"
              value={input}
              onChange={handleInputChange}
              placeholder={`e.g., ${getExample()}`}
            />
            <button className="clear-btn" onClick={clearInput}>Clear</button>
          </div>
          {error && <div className="error-message">{error}</div>}
          <button className="calculate-btn" onClick={performOperation}>Calculate</button>
        </div>
      </div>
      
      <div className="result-display">
        <h3>Result:</h3>
        {result && (
          <div className="result-content">
            <div className="result-text">{result}</div>
            <div className="operation-details">
              <div><strong>Input:</strong> {input}</div>
              <div><strong>Operation:</strong> {operation}</div>
            </div>
          </div>
        )}
      </div>
      
      <div className="algebra-history">
        <h3>Recent Calculations</h3>
        {history.length === 0 ? (
          <p className="empty-history">No calculations yet</p>
        ) : (
          <ul className="history-list">
            {history.map((item, index) => (
              <li key={index} className="history-item">
                <div className="history-time">{item.timestamp}</div>
                <div className="history-op">{item.operation}:</div>
                <div className="history-input">{item.input}</div>
                <div className="history-result">{item.result}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AlgebraMode; 