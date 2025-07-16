import { useState, useEffect, useRef } from 'react';
import * as math from 'mathjs';
import './InequalityMode.css';

const InequalityMode = ({ addToHistory }) => {
  const [expression, setExpression] = useState('');
  const [variable, setVariable] = useState('x');
  const [inequalityType, setInequalityType] = useState('<');
  const [constant, setConstant] = useState('0');
  const [solution, setSolution] = useState('');
  const [error, setError] = useState(null);
  const [previousInequalities, setPreviousInequalities] = useState([]);
  const canvasRef = useRef(null);

  // Solve the inequality
  const solveInequality = () => {
    try {
      setError(null);
      // Form the complete inequality
      const fullExpression = `${expression} ${inequalityType} ${constant}`;
      
      // For linear inequalities, we can solve directly
      if (isLinearInequality(expression, variable)) {
        const solution = solveLinearInequality(expression, variable, inequalityType, constant);
        setSolution(solution);
        
        // Add to history
        const inequalityEntry = `${fullExpression} ⟹ ${solution}`;
        setPreviousInequalities(prev => [...prev.slice(-9), inequalityEntry]);
        addToHistory(inequalityEntry);
        
        // Draw the solution on the number line
        drawNumberLine(solution);
      } else {
        // Handle more complex inequalities
        const solution = solveComplexInequality(expression, variable, inequalityType, constant);
        setSolution(solution);
        
        // Add to history
        const inequalityEntry = `${fullExpression} ⟹ ${solution}`;
        setPreviousInequalities(prev => [...prev.slice(-9), inequalityEntry]);
        addToHistory(inequalityEntry);
        
        // Draw the solution on the number line
        drawNumberLine(solution);
      }
    } catch (err) {
      console.error('Inequality solving error:', err.message);
      setError(err.message || 'Error solving inequality');
      setSolution('');
    }
  };

  // Check if the inequality is linear
  const isLinearInequality = (expr, variable) => {
    try {
      // Parse the expression
      const node = math.parse(expr);
      
      // Function to check if node contains powers of the variable > 1
      const containsHigherPowers = (node) => {
        if (node.isOperatorNode) {
          if (node.fn === 'pow' && 
              node.args[0].isSymbolNode && 
              node.args[0].name === variable && 
              node.args[1].isConstantNode && 
              node.args[1].value > 1) {
            return true;
          }
          return node.args.some(arg => containsHigherPowers(arg));
        } else if (node.isParenthesisNode) {
          return containsHigherPowers(node.content);
        } else if (node.isSymbolNode && node.name === variable) {
          return false; // Just x alone is linear
        }
        return false;
      };
      
      return !containsHigherPowers(node);
    } catch (error) {
      return false; // If we can't parse it, assume it's not linear
    }
  };

  // Solve a linear inequality
  const solveLinearInequality = (expr, variable, inequalityType, constant) => {
    // Move everything except the variable to the right side
    // ax + b < c becomes ax < c - b
    try {
      // Convert to the form: ax = c (isolate the variable)
      const leftExpr = expr;
      const rightExpr = constant;
      
      // Create a symbolic equation and solve for the variable
      const eq = `${leftExpr} - (${rightExpr})`;
      const simplified = math.simplify(eq).toString();
      
      // Find the coefficient of the variable
      const coefficientMatch = simplified.match(new RegExp(`([+-]?[^${variable}]*)${variable}`));
      let coefficient = 1;
      if (coefficientMatch && coefficientMatch[1]) {
        coefficient = coefficientMatch[1] === '-' ? -1 : parseFloat(coefficientMatch[1]) || 1;
      }
      
      // Find the constant term
      let constantTerm = 0;
      const constantMatch = simplified.replace(new RegExp(`([+-]?[^${variable}]*)${variable}`), '').trim();
      if (constantMatch && constantMatch !== '') {
        constantTerm = -parseFloat(constantMatch);
      }
      
      // Divide both sides by the coefficient
      const result = constantTerm / coefficient;
      
      // Adjust the inequality if coefficient is negative
      let adjustedInequality = inequalityType;
      if (coefficient < 0) {
        adjustedInequality = reverseInequality(inequalityType);
      }
      
      // Format the result
      return formatInequalitySolution(variable, adjustedInequality, result);
    } catch (err) {
      throw new Error(`Unable to solve linear inequality: ${err.message}`);
    }
  };

  // Reverse the inequality sign (used when multiplying by a negative)
  const reverseInequality = (ineqType) => {
    switch (ineqType) {
      case '<': return '>';
      case '>': return '<';
      case '<=': return '>=';
      case '>=': return '<=';
      default: return ineqType;
    }
  };

  // Format the inequality solution
  const formatInequalitySolution = (variable, ineqType, value) => {
    const roundedValue = Math.round(value * 1000) / 1000;
    return `${variable} ${ineqType} ${roundedValue}`;
  };

  // Solve more complex inequalities
  const solveComplexInequality = (expr, variable, inequalityType, constant) => {
    try {
      // For quadratic and other non-linear inequalities, we'd need to find roots and test intervals
      // This is a simplified version for demonstration
      
      // Create the inequality equation to solve (equals zero)
      const equation = `${expr} - (${constant})`;
      
      // Try to factor the expression and find roots
      const simplified = math.simplify(equation).toString();
      
      // For demonstration, we'll solve for some common forms
      if (simplified.includes(`${variable}^2`)) {
        // Quadratic inequality
        return solveQuadraticInequality(simplified, variable, inequalityType);
      } else if (simplified.includes(`1/${variable}`) || simplified.includes(`${variable}^(-1)`)) {
        // Rational inequality with 1/x
        return solveRationalInequality(simplified, variable, inequalityType);
      } else {
        throw new Error('Cannot solve this type of inequality yet');
      }
    } catch (err) {
      throw new Error(`Complex inequality solving error: ${err.message}`);
    }
  };

  // Solve quadratic inequalities (ax² + bx + c [ineq] 0)
  const solveQuadraticInequality = (expr, variable, ineqType) => {
    try {
      // Extract coefficients (this is a simplified approach)
      const a = extractCoefficient(expr, `${variable}\\^2`);
      const b = extractCoefficient(expr, variable);
      const c = extractConstant(expr, variable);
      
      // Calculate discriminant
      const discriminant = b * b - 4 * a * c;
      
      if (discriminant < 0) {
        // No real roots
        if ((a > 0 && (ineqType === '>' || ineqType === '>=')) || 
            (a < 0 && (ineqType === '<' || ineqType === '<='))) {
          return 'No solution';
        } else {
          return `All real numbers`;
        }
      } else if (discriminant === 0) {
        // One real root
        const root = -b / (2 * a);
        if (ineqType === '>' || ineqType === '>=') {
          if (a > 0) {
            return `${variable} < ${root} or ${variable} > ${root}`;
          } else {
            return `${root} < ${variable} < ${root}`;
          }
        } else {
          if (a > 0) {
            return `${variable} = ${root}`;
          } else {
            return `All real numbers except ${variable} = ${root}`;
          }
        }
      } else {
        // Two real roots
        const root1 = (-b + Math.sqrt(discriminant)) / (2 * a);
        const root2 = (-b - Math.sqrt(discriminant)) / (2 * a);
        const smallerRoot = Math.min(root1, root2);
        const largerRoot = Math.max(root1, root2);
        
        if (a > 0) {
          if (ineqType === '>' || ineqType === '>=') {
            return `${variable} < ${smallerRoot} or ${variable} > ${largerRoot}`;
          } else {
            return `${smallerRoot} < ${variable} < ${largerRoot}`;
          }
        } else {
          if (ineqType === '>' || ineqType === '>=') {
            return `${smallerRoot} < ${variable} < ${largerRoot}`;
          } else {
            return `${variable} < ${smallerRoot} or ${variable} > ${largerRoot}`;
          }
        }
      }
    } catch (err) {
      throw new Error(`Quadratic inequality solving error: ${err.message}`);
    }
  };

  // Extract coefficient for a term (simplified approach)
  const extractCoefficient = (expr, term) => {
    const regex = new RegExp(`([+-]?\\s*\\d*\\.?\\d*)\\s*${term}`);
    const match = expr.match(regex);
    if (!match) return 0;
    const coeff = match[1].replace(/\s+/g, '');
    if (coeff === '+' || coeff === '') return 1;
    if (coeff === '-') return -1;
    return parseFloat(coeff);
  };

  // Extract constant term
  const extractConstant = (expr, variable) => {
    // Remove variable terms
    const withoutVars = expr
      .replace(new RegExp(`[+-]?\\s*\\d*\\.?\\d*\\s*${variable}\\^2`, 'g'), '')
      .replace(new RegExp(`[+-]?\\s*\\d*\\.?\\d*\\s*${variable}`, 'g'), '')
      .trim();
    
    // If nothing left, constant is 0
    if (!withoutVars) return 0;
    
    // Otherwise parse the constant
    try {
      return parseFloat(withoutVars);
    } catch (err) {
      return 0;
    }
  };

  // Solve rational inequalities with 1/x
  const solveRationalInequality = (expr, variable, ineqType) => {
    try {
      // This is a simplified approach for 1/x type inequalities
      if (expr.includes(`1/${variable}`) || expr.includes(`${variable}^(-1)`)) {
        const isPositiveCoeff = !expr.match(`-\\s*1\\s*/${variable}`) && 
                              !expr.match(`-\\s*${variable}\\^\\(-1\\)`);
        
        // Determine the condition based on the inequality type and coefficient sign
        if ((isPositiveCoeff && (ineqType === '>' || ineqType === '>=')) || 
            (!isPositiveCoeff && (ineqType === '<' || ineqType === '<='))) {
          return `${variable} > 0`;
        } else {
          return `${variable} < 0`;
        }
      }
      
      throw new Error('Cannot solve this rational inequality');
    } catch (err) {
      throw new Error(`Rational inequality solving error: ${err.message}`);
    }
  };

  // Draw the solution on a number line
  const drawNumberLine = (solution) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear the canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw the number line
    const lineY = height / 2;
    const startX = 30;
    const endX = width - 30;
    
    // Draw the horizontal line
    ctx.beginPath();
    ctx.moveTo(startX, lineY);
    ctx.lineTo(endX, lineY);
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw tick marks and numbers
    const tickSpacing = (endX - startX) / 10;
    for (let i = 0; i <= 10; i++) {
      const x = startX + i * tickSpacing;
      const value = i - 5; // Center at 0, range from -5 to 5
      
      // Draw tick mark
      ctx.beginPath();
      ctx.moveTo(x, lineY - 10);
      ctx.lineTo(x, lineY + 10);
      ctx.stroke();
      
      // Draw number
      ctx.fillStyle = 'white';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(value.toString(), x, lineY + 25);
    }
    
    // Highlight the solution range
    try {
      if (solution.includes('All real numbers')) {
        // Highlight the entire line
        ctx.beginPath();
        ctx.moveTo(startX, lineY);
        ctx.lineTo(endX, lineY);
        ctx.strokeStyle = '#3498db';
        ctx.lineWidth = 4;
        ctx.stroke();
      } else if (solution.includes('No solution')) {
        // Draw no highlight
      } else if (solution.includes(' or ')) {
        // Multiple ranges
        const ranges = solution.split(' or ');
        ranges.forEach(range => {
          highlightRange(ctx, range, startX, endX, lineY);
        });
      } else {
        // Single range
        highlightRange(ctx, solution, startX, endX, lineY);
      }
    } catch (err) {
      console.error('Error drawing number line:', err);
    }
  };

  // Helper to highlight a range on the number line
  const highlightRange = (ctx, range, startX, endX, lineY) => {
    // Parse the range
    let rangeStart, rangeEnd, includeStart, includeEnd;
    
    if (range.includes('<') && !range.includes('=')) {
      const parts = range.split('<');
      if (parts[0].trim() === variable) {
        // x < value
        rangeEnd = parseFloat(parts[1].trim());
        rangeStart = -Infinity;
        includeEnd = false;
      } else {
        // value < x
        rangeStart = parseFloat(parts[0].trim());
        rangeEnd = Infinity;
        includeStart = false;
      }
    } else if (range.includes('<=') || range.includes('≤')) {
      const parts = range.split(/<=|≤/);
      if (parts[0].trim() === variable) {
        // x <= value
        rangeEnd = parseFloat(parts[1].trim());
        rangeStart = -Infinity;
        includeEnd = true;
      } else {
        // value <= x
        rangeStart = parseFloat(parts[0].trim());
        rangeEnd = Infinity;
        includeStart = true;
      }
    } else if (range.includes('>') && !range.includes('=')) {
      const parts = range.split('>');
      if (parts[0].trim() === variable) {
        // x > value
        rangeStart = parseFloat(parts[1].trim());
        rangeEnd = Infinity;
        includeStart = false;
      } else {
        // value > x
        rangeEnd = parseFloat(parts[0].trim());
        rangeStart = -Infinity;
        includeEnd = false;
      }
    } else if (range.includes('>=') || range.includes('≥')) {
      const parts = range.split(/>=|≥/);
      if (parts[0].trim() === variable) {
        // x >= value
        rangeStart = parseFloat(parts[1].trim());
        rangeEnd = Infinity;
        includeStart = true;
      } else {
        // value >= x
        rangeEnd = parseFloat(parts[0].trim());
        rangeStart = -Infinity;
        includeEnd = true;
      }
    }
    
    // Map the range values to the number line
    const mapValue = (value) => {
      // Map from the range -5 to 5 to the x-coordinates
      if (value === Infinity) return endX;
      if (value === -Infinity) return startX;
      return startX + ((value + 5) / 10) * (endX - startX);
    };
    
    const startXCoord = mapValue(rangeStart);
    const endXCoord = mapValue(rangeEnd);
    
    // Draw the range
    ctx.beginPath();
    ctx.moveTo(startXCoord, lineY);
    ctx.lineTo(endXCoord, lineY);
    ctx.strokeStyle = '#3498db';
    ctx.lineWidth = 4;
    ctx.stroke();
    
    // Draw endpoints
    if (rangeStart !== -Infinity) {
      ctx.beginPath();
      ctx.arc(startXCoord, lineY, 6, 0, Math.PI * 2);
      ctx.fillStyle = includeStart ? '#3498db' : 'white';
      ctx.fill();
      ctx.strokeStyle = '#3498db';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    
    if (rangeEnd !== Infinity) {
      ctx.beginPath();
      ctx.arc(endXCoord, lineY, 6, 0, Math.PI * 2);
      ctx.fillStyle = includeEnd ? '#3498db' : 'white';
      ctx.fill();
      ctx.strokeStyle = '#3498db';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  };

  // Clear the form
  const clearForm = () => {
    setExpression('');
    setVariable('x');
    setInequalityType('<');
    setConstant('0');
    setSolution('');
    setError(null);
    
    // Clear the canvas
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  // Initial number line drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      const width = canvas.width;
      const height = canvas.height;
      
      // Clear the canvas
      ctx.clearRect(0, 0, width, height);
      
      // Draw the number line
      const lineY = height / 2;
      const startX = 30;
      const endX = width - 30;
      
      // Draw the horizontal line
      ctx.beginPath();
      ctx.moveTo(startX, lineY);
      ctx.lineTo(endX, lineY);
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Draw tick marks and numbers
      const tickSpacing = (endX - startX) / 10;
      for (let i = 0; i <= 10; i++) {
        const x = startX + i * tickSpacing;
        const value = i - 5; // Center at 0, range from -5 to 5
        
        // Draw tick mark
        ctx.beginPath();
        ctx.moveTo(x, lineY - 10);
        ctx.lineTo(x, lineY + 10);
        ctx.stroke();
        
        // Draw number
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(value.toString(), x, lineY + 25);
      }
    }
  }, []);

  return (
    <div className="inequality-calculator">
      <h2>Inequality Solver</h2>
      
      {error && <div className="inequality-error">{error}</div>}
      
      <div className="inequality-form">
        <div className="form-group">
          <label htmlFor="expression">Left side:</label>
          <input 
            type="text" 
            id="expression" 
            value={expression} 
            onChange={(e) => setExpression(e.target.value)}
            placeholder="e.g. 2x + 3"
          />
        </div>
        
        <div className="form-group inequality-type">
          <label>Inequality:</label>
          <div className="inequality-selector">
            <button 
              className={inequalityType === '<' ? 'selected' : ''} 
              onClick={() => setInequalityType('<')}
            >
              &lt;
            </button>
            <button 
              className={inequalityType === '<=' ? 'selected' : ''} 
              onClick={() => setInequalityType('<=')}
            >
              &le;
            </button>
            <button 
              className={inequalityType === '>' ? 'selected' : ''} 
              onClick={() => setInequalityType('>')}
            >
              &gt;
            </button>
            <button 
              className={inequalityType === '>=' ? 'selected' : ''} 
              onClick={() => setInequalityType('>=')}
            >
              &ge;
            </button>
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="constant">Right side:</label>
          <input 
            type="text" 
            id="constant" 
            value={constant} 
            onChange={(e) => setConstant(e.target.value)}
            placeholder="e.g. 0"
          />
        </div>
        
        <div className="form-group variable-selector">
          <label htmlFor="variable">Variable:</label>
          <select 
            id="variable" 
            value={variable} 
            onChange={(e) => setVariable(e.target.value)}
          >
            <option value="x">x</option>
            <option value="y">y</option>
            <option value="z">z</option>
            <option value="a">a</option>
            <option value="b">b</option>
            <option value="c">c</option>
          </select>
        </div>
        
        <div className="form-actions">
          <button className="solve-button" onClick={solveInequality}>Solve</button>
          <button className="clear-button" onClick={clearForm}>Clear</button>
        </div>
      </div>
      
      {solution && (
        <div className="inequality-solution">
          <h3>Solution:</h3>
          <p className="solution-text">{solution}</p>
        </div>
      )}
      
      <div className="number-line-container">
        <h3>Number Line:</h3>
        <canvas ref={canvasRef} width={700} height={100} className="number-line-canvas"></canvas>
      </div>
      
      <div className="previous-inequalities">
        <h3>Previous Inequalities:</h3>
        <ul>
          {previousInequalities.map((ineq, index) => (
            <li key={index}>{ineq}</li>
          ))}
        </ul>
      </div>
      
      <div className="inequality-help">
        <h3>Examples:</h3>
        <ul>
          <li>Linear: <code>2x + 3 &lt; 7</code></li>
          <li>Quadratic: <code>x^2 - 4 &gt; 0</code></li>
          <li>Rational: <code>1/x &gt;= 0</code></li>
        </ul>
      </div>
    </div>
  );
};

export default InequalityMode; 