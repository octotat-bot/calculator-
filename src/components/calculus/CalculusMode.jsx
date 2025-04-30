import { useState } from 'react';
import './CalculusMode.css';
import * as math from 'mathjs';
import * as algebrite from 'algebrite';

const CalculusMode = ({ addToHistory }) => {
  const [operation, setOperation] = useState('derivative');
  const [expression, setExpression] = useState('x^2');
  const [variable, setVariable] = useState('x');
  const [point, setPoint] = useState('1');
  const [lowerLimit, setLowerLimit] = useState('0');
  const [upperLimit, setUpperLimit] = useState('1');
  const [result, setResult] = useState(null);
  const [steps, setSteps] = useState([]);
  const [showSteps, setShowSteps] = useState(false);
  const [error, setError] = useState('');
  const [calculationType, setCalculationType] = useState('numeric'); // 'numeric' or 'symbolic'
  const [order, setOrder] = useState('1'); // For higher-order derivatives
  const [variables, setVariables] = useState('x,y'); // For partial derivatives
  const [wrt, setWrt] = useState('x'); // With respect to (for partial derivatives)
  const [terms, setTerms] = useState('5'); // Number of terms for series expansion
  const [center, setCenter] = useState('0'); // Center point for Taylor series
  const [initialCondition, setInitialCondition] = useState('y(0)=1,y\'(0)=0'); // For differential equations

  // Common examples for different operations
  const examples = {
    derivative: [
      { expression: 'x^2', description: 'Power function' },
      { expression: 'sin(x)', description: 'Trigonometric function' },
      { expression: 'e^x', description: 'Exponential function' },
      { expression: 'ln(x)', description: 'Logarithmic function' },
      { expression: 'x^2 + 2*x + 1', description: 'Polynomial function' }
    ],
    integral: [
      { expression: 'x^2', description: 'Power function' },
      { expression: 'sin(x)', description: 'Trigonometric function' },
      { expression: 'e^x', description: 'Exponential function' },
      { expression: '1/x', description: 'Rational function' },
      { expression: 'sqrt(1-x^2)', description: 'Circle function' }
    ],
    limit: [
      { expression: '(x^2-1)/(x-1)', description: 'Rational function' },
      { expression: 'sin(x)/x', description: 'Trigonometric limit' },
      { expression: '(1+1/x)^x', description: 'Natural exponential' },
      { expression: '(e^x-1)/x', description: 'L\'Hôpital\'s rule example' },
      { expression: 'ln(x)/x', description: 'Logarithmic limit' }
    ],
    higherDerivative: [
      { expression: 'x^3', description: 'Power function' },
      { expression: 'sin(x)', description: 'Trigonometric function' },
      { expression: 'e^x', description: 'Exponential function' },
      { expression: 'ln(x)', description: 'Logarithmic function' },
      { expression: 'x^5 + 3*x^3 + 2*x', description: 'Polynomial function' }
    ],
    partialDerivative: [
      { expression: 'x^2 + y^2', description: 'Sum of squares' },
      { expression: 'x*y', description: 'Product' },
      { expression: 'sin(x)*cos(y)', description: 'Trigonometric product' },
      { expression: 'e^(x+y)', description: 'Exponential' },
      { expression: 'ln(x^2 + y^2)', description: 'Logarithmic function' }
    ],
    seriesExpansion: [
      { expression: 'sin(x)', description: 'Sine series' },
      { expression: 'e^x', description: 'Exponential series' },
      { expression: 'ln(1+x)', description: 'Logarithmic series' },
      { expression: '1/(1-x)', description: 'Geometric series' },
      { expression: 'cos(x)', description: 'Cosine series' }
    ],
    differentialEquation: [
      { expression: 'y\'\' + y = 0', description: 'Simple harmonic motion' },
      { expression: 'y\' = y', description: 'Exponential growth' },
      { expression: 'y\'\' + 2*y\' + y = 0', description: 'Damped system' },
      { expression: 'y\' = -2*x*y', description: 'First-order linear' },
      { expression: 'y\'\' - y = x', description: 'Non-homogeneous' }
    ],
    symbolicDerivative: [
      { expression: 'x^2 + 3*x + 2', description: 'Polynomial' },
      { expression: 'sin(x^2)', description: 'Composite function' },
      { expression: 'x*exp(x)', description: 'Product rule' },
      { expression: 'x/ln(x)', description: 'Quotient rule' },
      { expression: 'sqrt(1-x^2)', description: 'Chain rule' }
    ],
    symbolicIntegral: [
      { expression: 'x^2', description: 'Power function' },
      { expression: 'x*exp(x)', description: 'Integration by parts' },
      { expression: '1/(1+x^2)', description: 'Arctangent form' },
      { expression: 'sin(x)*cos(x)', description: 'Trigonometric product' },
      { expression: 'sqrt(x)', description: 'Square root function' }
    ]
  };

  // Handle operation change
  const handleOperationChange = (e) => {
    setOperation(e.target.value);
    setResult(null);
    setSteps([]);
    setError('');
  };

  // Handle calculation type change
  const handleCalculationTypeChange = (e) => {
    setCalculationType(e.target.value);
    setResult(null);
    setSteps([]);
    setError('');
  };

  // Set example function
  const setExample = (ex) => {
    setExpression(ex.expression);
    setResult(null);
    setSteps([]);
    setError('');
  };

  // Clear input and results
  const handleClear = () => {
    setExpression('');
    setResult(null);
    setSteps([]);
    setError('');
  };

  // Calculate derivative at a point
  const calculateDerivative = (expr, variable, point) => {
    try {
      // Create symbolic derivative
      const node = math.parse(expr);
      const derivative = math.derivative(node, variable).toString();
      
      // Evaluate at point
      const scope = {};
      scope[variable] = parseFloat(point);
      const value = math.evaluate(derivative, scope);
      
      // Create step-by-step explanation
      const steps = [
        `Step 1: Find the derivative of f(${variable}) = ${expr}`,
        `Step 2: f'(${variable}) = ${derivative}`,
        `Step 3: Evaluate f'(${point}) = ${derivative.replace(new RegExp(variable, 'g'), `(${point})`)}`,
        `Step 4: f'(${point}) = ${value}`
      ];
      
      return { 
        result: value,
        steps: steps,
        derivative: derivative
      };
    } catch (err) {
      throw new Error(`Derivative calculation error: ${err.message}`);
    }
  };

  // Calculate symbolic derivative using Algebrite
  const calculateSymbolicDerivative = (expr, variable) => {
    try {
      const derivative = algebrite.derivative(expr, variable).toString();
      
      // Simplify the result for better readability
      const simplified = algebrite.simplify(derivative).toString();
      
      // Create step-by-step explanation
      const steps = [
        `Step 1: Find the symbolic derivative of f(${variable}) = ${expr} with respect to ${variable}`,
        `Step 2: d/d${variable}(${expr}) = ${derivative}`,
        `Step 3: Simplify the result: ${simplified}`
      ];
      
      return {
        result: simplified,
        steps: steps
      };
    } catch (err) {
      throw new Error(`Symbolic derivative calculation error: ${err.message}`);
    }
  };

  // Calculate definite integral
  const calculateIntegral = (expr, variable, lower, upper) => {
    try {
      // For teaching purposes, use numerical integration with explanation
      const lowerVal = parseFloat(lower);
      const upperVal = parseFloat(upper);
      
      // Prepare the function for integration
      const f = (x) => {
        const scope = {};
        scope[variable] = x;
        return math.evaluate(expr, scope);
      };
      
      // Number of trapezoids for numerical integration
      const n = 100;
      const h = (upperVal - lowerVal) / n;
      let sum = 0.5 * (f(lowerVal) + f(upperVal));
      
      for (let i = 1; i < n; i++) {
        const x = lowerVal + i * h;
        sum += f(x);
      }
      
      const integral = h * sum;
      
      // Create step-by-step explanation
      const steps = [
        `Step 1: Set up the definite integral of f(${variable}) = ${expr} from ${lowerVal} to ${upperVal}`,
        `Step 2: Using the trapezoidal rule with ${n} subdivisions`,
        `Step 3: Calculate h = (${upperVal} - ${lowerVal}) / ${n} = ${h}`,
        `Step 4: Apply the formula: Integral ≈ h × [0.5×f(${lowerVal}) + f(${lowerVal + h}) + ... + f(${upperVal - h}) + 0.5×f(${upperVal})]`,
        `Step 5: The approximated integral is ${integral}`
      ];
      
      return { 
        result: integral,
        steps: steps
      };
    } catch (err) {
      throw new Error(`Integral calculation error: ${err.message}`);
    }
  };

  // Calculate symbolic indefinite integral using Algebrite
  const calculateSymbolicIntegral = (expr, variable) => {
    try {
      const integral = algebrite.integral(expr, variable).toString();
      
      // Simplify the result for better readability
      const simplified = algebrite.simplify(integral).toString();
      
      // Create step-by-step explanation
      const steps = [
        `Step 1: Find the symbolic indefinite integral of f(${variable}) = ${expr} with respect to ${variable}`,
        `Step 2: ∫${expr} d${variable} = ${integral}`,
        `Step 3: Simplify the result: ${simplified}`
      ];
      
      return {
        result: simplified,
        steps: steps
      };
    } catch (err) {
      throw new Error(`Symbolic integral calculation error: ${err.message}`);
    }
  };

  // Calculate limit
  const calculateLimit = (expr, variable, point) => {
    try {
      // For basic limits, try direct substitution first
      let result;
      let steps = [];
      
      // Try to evaluate the expression directly at the point
      try {
        const scope = {};
        scope[variable] = parseFloat(point);
        result = math.evaluate(expr, scope);
        
        steps = [
          `Step 1: Try direct substitution of ${variable} = ${point} in ${expr}`,
          `Step 2: Evaluating ${expr.replace(new RegExp(variable, 'g'), `(${point})`)}`,
          `Step 3: The limit is ${result}`
        ];
      } catch (directError) {
        // If direct substitution fails, try approaching from left and right
        const epsilon = 1e-10;
        const leftPoint = parseFloat(point) - epsilon;
        const rightPoint = parseFloat(point) + epsilon;
        
        const scope1 = {}, scope2 = {};
        scope1[variable] = leftPoint;
        scope2[variable] = rightPoint;
        
        const leftLimit = math.evaluate(expr, scope1);
        const rightLimit = math.evaluate(expr, scope2);
        
        if (Math.abs(leftLimit - rightLimit) < epsilon) {
          result = (leftLimit + rightLimit) / 2;
          
          steps = [
            `Step 1: Direct substitution failed at ${variable} = ${point}`,
            `Step 2: Approach from left: ${variable} → ${point}⁻ gives ${leftLimit}`,
            `Step 3: Approach from right: ${variable} → ${point}⁺ gives ${rightLimit}`,
            `Step 4: Left and right limits match, so the limit exists and equals ${result}`
          ];
        } else {
          throw new Error(`Limit does not exist. Left limit = ${leftLimit}, Right limit = ${rightLimit}`);
        }
      }
      
      return { 
        result: result,
        steps: steps
      };
    } catch (err) {
      throw new Error(`Limit calculation error: ${err.message}`);
    }
  };

  // Calculate higher-order derivative
  const calculateHigherDerivative = (expr, variable, order, point) => {
    try {
      let derivativeExpr = expr;
      let node = math.parse(expr);
      let steps = [];
      
      steps.push(`Step 1: Starting with f(${variable}) = ${expr}`);
      
      // Calculate derivatives up to the specified order
      for (let i = 1; i <= parseInt(order); i++) {
        node = math.derivative(node, variable);
        derivativeExpr = node.toString();
        steps.push(`Step ${i+1}: Derivative ${i} = ${derivativeExpr}`);
      }
      
      // Evaluate at point
      const scope = {};
      scope[variable] = parseFloat(point);
      const value = math.evaluate(derivativeExpr, scope);
      
      steps.push(`Step ${parseInt(order)+2}: Evaluate at ${variable} = ${point}: ${value}`);
      
      return { 
        result: value,
        steps: steps,
        derivative: derivativeExpr
      };
    } catch (err) {
      throw new Error(`Higher-order derivative calculation error: ${err.message}`);
    }
  };

  // Calculate symbolic higher-order derivative
  const calculateSymbolicHigherDerivative = (expr, variable, order) => {
    try {
      let result = expr;
      let steps = [];
      
      steps.push(`Step 1: Starting with f(${variable}) = ${expr}`);
      
      // Calculate derivatives up to the specified order
      for (let i = 1; i <= parseInt(order); i++) {
        result = algebrite.derivative(result, variable).toString();
        steps.push(`Step ${i+1}: Derivative ${i} = ${result}`);
      }
      
      // Simplify the result
      const simplified = algebrite.simplify(result).toString();
      steps.push(`Step ${parseInt(order)+2}: Simplify the result: ${simplified}`);
      
      return {
        result: simplified,
        steps: steps
      };
    } catch (err) {
      throw new Error(`Symbolic higher-order derivative calculation error: ${err.message}`);
    }
  };

  // Calculate partial derivative
  const calculatePartialDerivative = (expr, wrt, point) => {
    try {
      // Parse expression and calculate partial derivative with respect to the specified variable
      const node = math.parse(expr);
      const derivative = math.derivative(node, wrt).toString();
      
      // Create variable scope from the point (format: "x=1,y=2")
      const pointPairs = point.split(',');
      const scope = {};
      
      for (const pair of pointPairs) {
        const [variable, value] = pair.split('=');
        scope[variable.trim()] = parseFloat(value.trim());
      }
      
      // Evaluate partial derivative at the point
      const value = math.evaluate(derivative, scope);
      
      // Create step-by-step explanation
      const steps = [
        `Step 1: Find the partial derivative of f(${Object.keys(scope).join(', ')}) = ${expr} with respect to ${wrt}`,
        `Step 2: ∂f/∂${wrt} = ${derivative}`,
        `Step 3: Evaluate at the point (${point}): ${value}`
      ];
      
      return { 
        result: value,
        steps: steps,
        derivative: derivative
      };
    } catch (err) {
      throw new Error(`Partial derivative calculation error: ${err.message}`);
    }
  };

  // Calculate symbolic partial derivative
  const calculateSymbolicPartialDerivative = (expr, wrt) => {
    try {
      const derivative = algebrite.derivative(expr, wrt).toString();
      
      // Simplify the result for better readability
      const simplified = algebrite.simplify(derivative).toString();
      
      // Create step-by-step explanation
      const steps = [
        `Step 1: Find the symbolic partial derivative of f = ${expr} with respect to ${wrt}`,
        `Step 2: ∂f/∂${wrt} = ${derivative}`,
        `Step 3: Simplify the result: ${simplified}`
      ];
      
      return {
        result: simplified,
        steps: steps
      };
    } catch (err) {
      throw new Error(`Symbolic partial derivative calculation error: ${err.message}`);
    }
  };

  // Calculate series expansion (Taylor/Maclaurin series)
  const calculateSeriesExpansion = (expr, variable, center, terms) => {
    try {
      let result = '';
      let steps = [];
      
      // Generate Taylor series using symbolic differentiation
      // Start with the function itself (0th order term)
      let currentTerm = expr;
      let currentCoef = 1;
      const centerVal = parseFloat(center);
      const termsCount = parseInt(terms);
      
      steps.push(`Step 1: Start with the function f(${variable}) = ${expr}`);
      steps.push(`Step 2: Calculate the Taylor series expansion around ${variable} = ${center} with ${terms} terms`);
      
      // Substitute (x - a) for centered expansion
      let expansion = algebrite.subst(expr, variable, `${variable} - ${center} + ${center}`);
      expansion = algebrite.simplify(expansion).toString();
      
      // Evaluate f(a)
      const f_a = algebrite.subst(expr, variable, center).toString();
      result += algebrite.simplify(f_a).toString();
      steps.push(`Step 3: Term 0: f(${center}) = ${result}`);
      
      // Calculate each term of the series
      for (let i = 1; i < termsCount; i++) {
        // Calculate ith derivative
        currentTerm = algebrite.derivative(currentTerm, variable).toString();
        
        // Calculate factorial coefficient
        currentCoef *= i;
        
        // Evaluate derivative at the center point
        const termValue = algebrite.subst(currentTerm, variable, center).toString();
        
        // Add term to series
        const simplifiedTerm = algebrite.simplify(`(${termValue}) / ${currentCoef}`).toString();
        
        if (simplifiedTerm !== '0') {
          if (i === 1) {
            result += ` + ${simplifiedTerm} × (${variable} - ${center})`;
          } else {
            result += ` + ${simplifiedTerm} × (${variable} - ${center})^${i}`;
          }
          
          steps.push(`Step ${i+3}: Term ${i}: (${termValue})/${currentCoef} × (${variable} - ${center})^${i}`);
        }
      }
      
      // Simplify final expression
      const simplified = result;
      
      return {
        result: simplified,
        steps: steps
      };
    } catch (err) {
      throw new Error(`Series expansion calculation error: ${err.message}`);
    }
  };

  // Solve simple differential equation
  // This is a very simplified implementation that can only handle basic ODEs
  const solveDifferentialEquation = (expr, variable, initialCondition) => {
    try {
      // This is a simplified implementation that can handle only specific types of ODEs
      // For a full implementation, a specialized ODE solver library would be needed
      let result = '';
      let steps = [];
      
      steps.push(`Step 1: Analyzing the differential equation: ${expr}`);
      
      // Handle some common differential equation types
      if (expr.includes("y' = y")) {
        // Simple exponential growth/decay: y' = y
        result = "C × e^x";
        steps.push(`Step 2: This is a simple exponential growth equation with solution: ${result}`);
        
        // Handle initial condition
        if (initialCondition && initialCondition.includes('=')) {
          const ic = initialCondition.split(',')[0]; // Take first condition
          const [y, val] = ic.split('=');
          
          if (y.trim() === 'y(0)') {
            const C = parseFloat(val.trim());
            result = `${C} × e^x`;
            steps.push(`Step 3: Applying initial condition ${ic}: ${result}`);
          }
        }
      } else if (expr.includes("y'' + y = 0")) {
        // Simple harmonic motion: y'' + y = 0
        result = "C₁ × cos(x) + C₂ × sin(x)";
        steps.push(`Step 2: This is a simple harmonic motion equation with solution: ${result}`);
        
        // Handle initial conditions
        if (initialCondition && initialCondition.includes(',')) {
          const conditions = initialCondition.split(',');
          if (conditions.length >= 2) {
            const [pos, vel] = conditions;
            const [, posVal] = pos.split('=');
            const [, velVal] = vel.split('=');
            
            const C1 = parseFloat(posVal.trim());
            const C2 = parseFloat(velVal.trim());
            
            result = `${C1} × cos(x) + ${C2} × sin(x)`;
            steps.push(`Step 3: Applying initial conditions ${initialCondition}: ${result}`);
          }
        }
      } else if (expr.includes("y' = -2*x*y")) {
        // First-order linear: y' = -2*x*y
        result = "C × e^(-x²)";
        steps.push(`Step 2: This is a separable equation with solution: ${result}`);
        
        // Handle initial condition
        if (initialCondition && initialCondition.includes('=')) {
          const ic = initialCondition.split(',')[0]; // Take first condition
          const [y, val] = ic.split('=');
          
          if (y.trim() === 'y(0)') {
            const C = parseFloat(val.trim());
            result = `${C} × e^(-x²)`;
            steps.push(`Step 3: Applying initial condition ${ic}: ${result}`);
          }
        }
      } else {
        // For other equations, provide a general message
        result = "Cannot provide a closed-form solution for this differential equation";
        steps.push(`Step 2: ${result}`);
        steps.push(`Step 3: Consider using numerical methods or specialized ODE solvers for this equation`);
      }
      
      return {
        result: result,
        steps: steps
      };
    } catch (err) {
      throw new Error(`Differential equation calculation error: ${err.message}`);
    }
  };

  // Perform calculation based on selected operation
  const calculate = () => {
    try {
      let calculationResult;
      
      if (calculationType === 'numeric') {
        switch (operation) {
          case 'derivative':
            calculationResult = calculateDerivative(expression, variable, point);
            break;
          case 'higherDerivative':
            calculationResult = calculateHigherDerivative(expression, variable, order, point);
            break;
          case 'partialDerivative':
            calculationResult = calculatePartialDerivative(expression, wrt, point);
            break;
          case 'integral':
            calculationResult = calculateIntegral(expression, variable, lowerLimit, upperLimit);
            break;
          case 'limit':
            calculationResult = calculateLimit(expression, variable, point);
            break;
          case 'seriesExpansion':
            calculationResult = calculateSeriesExpansion(expression, variable, center, terms);
            break;
          case 'differentialEquation':
            calculationResult = solveDifferentialEquation(expression, variable, initialCondition);
            break;
          default:
            throw new Error('Invalid operation');
        }
      } else { // symbolic calculation
        switch (operation) {
          case 'derivative':
            calculationResult = calculateSymbolicDerivative(expression, variable);
            break;
          case 'higherDerivative':
            calculationResult = calculateSymbolicHigherDerivative(expression, variable, order);
            break;
          case 'partialDerivative':
            calculationResult = calculateSymbolicPartialDerivative(expression, wrt);
            break;
          case 'integral':
            calculationResult = calculateSymbolicIntegral(expression, variable);
            break;
          case 'seriesExpansion':
            calculationResult = calculateSeriesExpansion(expression, variable, center, terms);
            break;
          default:
            throw new Error('Invalid operation for symbolic calculation');
        }
      }
      
      setResult(calculationResult.result);
      setSteps(calculationResult.steps);
      setError('');
      
      // Add to history
      let historyEntry;
      if (calculationType === 'numeric') {
        if (operation === 'derivative') {
          historyEntry = `d/d${variable}(${expression}) at ${variable}=${point} = ${calculationResult.result}`;
        } else if (operation === 'higherDerivative') {
          historyEntry = `d^${order}/d${variable}^${order}(${expression}) at ${variable}=${point} = ${calculationResult.result}`;
        } else if (operation === 'partialDerivative') {
          historyEntry = `∂/∂${wrt}(${expression}) at (${point}) = ${calculationResult.result}`;
        } else if (operation === 'integral') {
          historyEntry = `∫(${expression})d${variable} from ${lowerLimit} to ${upperLimit} = ${calculationResult.result}`;
        } else if (operation === 'limit') {
          historyEntry = `lim ${variable}→${point} ${expression} = ${calculationResult.result}`;
        } else if (operation === 'seriesExpansion') {
          historyEntry = `Series expansion of ${expression} around ${variable}=${center} (${terms} terms) = ${calculationResult.result}`;
        } else if (operation === 'differentialEquation') {
          historyEntry = `Solution to ${expression} with ${initialCondition} = ${calculationResult.result}`;
        }
      } else { // symbolic calculation
        if (operation === 'derivative') {
          historyEntry = `d/d${variable}(${expression}) = ${calculationResult.result}`;
        } else if (operation === 'higherDerivative') {
          historyEntry = `d^${order}/d${variable}^${order}(${expression}) = ${calculationResult.result}`;
        } else if (operation === 'partialDerivative') {
          historyEntry = `∂/∂${wrt}(${expression}) = ${calculationResult.result}`;
        } else if (operation === 'integral') {
          historyEntry = `∫(${expression})d${variable} = ${calculationResult.result}`;
        } else if (operation === 'seriesExpansion') {
          historyEntry = `Series expansion of ${expression} around ${variable}=${center} (${terms} terms) = ${calculationResult.result}`;
        }
      }
      
      addToHistory(historyEntry);
    } catch (err) {
      setError(err.message);
      setResult(null);
      setSteps([]);
    }
  };

  return (
    <div className="calculus-calculator">
      <div className="operation-select">
        <label htmlFor="calculus-operation">Operation:</label>
        <select 
          id="calculus-operation" 
          value={operation} 
          onChange={handleOperationChange}
        >
          <option value="derivative">Derivative</option>
          <option value="higherDerivative">Higher-Order Derivative</option>
          <option value="partialDerivative">Partial Derivative</option>
          <option value="integral">Integral</option>
          <option value="limit">Limit</option>
          <option value="seriesExpansion">Series Expansion</option>
          <option value="differentialEquation">Differential Equation</option>
        </select>
        
        <label htmlFor="calculation-type" className="calculation-type-label">Calculation Type:</label>
        <select 
          id="calculation-type" 
          value={calculationType} 
          onChange={handleCalculationTypeChange}
        >
          <option value="numeric">Numeric</option>
          <option value="symbolic">Symbolic</option>
        </select>
      </div>
      
      <div className="input-area">
        <div className="expression-input">
          <label htmlFor="expression">Expression:</label>
          <input
            type="text"
            id="expression"
            value={expression}
            onChange={(e) => setExpression(e.target.value)}
            placeholder="e.g., x^2"
          />
        </div>
        
        {operation !== 'partialDerivative' && operation !== 'differentialEquation' && (
          <div className="variable-input">
            <label htmlFor="variable">Variable:</label>
            <input
              type="text"
              id="variable"
              value={variable}
              onChange={(e) => setVariable(e.target.value)}
              placeholder="e.g., x"
            />
          </div>
        )}
        
        {operation === 'higherDerivative' && (
          <div className="order-input">
            <label htmlFor="order">Order:</label>
            <input
              type="number"
              id="order"
              value={order}
              onChange={(e) => setOrder(e.target.value)}
              min="1"
              placeholder="e.g., 2"
            />
          </div>
        )}
        
        {operation === 'partialDerivative' && (
          <>
            <div className="wrt-input">
              <label htmlFor="wrt">With respect to:</label>
              <input
                type="text"
                id="wrt"
                value={wrt}
                onChange={(e) => setWrt(e.target.value)}
                placeholder="e.g., x"
              />
            </div>
          </>
        )}
        
        {operation === 'seriesExpansion' && (
          <>
            <div className="center-input">
              <label htmlFor="center">Center point:</label>
              <input
                type="text"
                id="center"
                value={center}
                onChange={(e) => setCenter(e.target.value)}
                placeholder="e.g., 0"
              />
            </div>
            <div className="terms-input">
              <label htmlFor="terms">Number of terms:</label>
              <input
                type="number"
                id="terms"
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                min="1"
                max="10"
                placeholder="e.g., 5"
              />
            </div>
          </>
        )}
        
        {operation === 'differentialEquation' && (
          <div className="initial-condition-input">
            <label htmlFor="initial-condition">Initial Condition:</label>
            <input
              type="text"
              id="initial-condition"
              value={initialCondition}
              onChange={(e) => setInitialCondition(e.target.value)}
              placeholder="e.g., y(0)=1,y'(0)=0"
            />
          </div>
        )}
        
        {(calculationType === 'numeric' && (operation === 'derivative' || operation === 'higherDerivative' || operation === 'limit')) && (
          <div className="point-input">
            <label htmlFor="point">Point:</label>
            <input
              type="text"
              id="point"
              value={point}
              onChange={(e) => setPoint(e.target.value)}
              placeholder="e.g., 1"
            />
          </div>
        )}
        
        {(operation === 'partialDerivative' && calculationType === 'numeric') && (
          <div className="point-input">
            <label htmlFor="point">Point (format: x=1,y=2):</label>
            <input
              type="text"
              id="point"
              value={point}
              onChange={(e) => setPoint(e.target.value)}
              placeholder="e.g., x=1,y=2"
            />
          </div>
        )}
        
        {(calculationType === 'numeric' && operation === 'integral') && (
          <>
            <div className="limit-input">
              <label htmlFor="lower-limit">Lower Limit:</label>
              <input
                type="text"
                id="lower-limit"
                value={lowerLimit}
                onChange={(e) => setLowerLimit(e.target.value)}
                placeholder="e.g., 0"
              />
            </div>
            
            <div className="limit-input">
              <label htmlFor="upper-limit">Upper Limit:</label>
              <input
                type="text"
                id="upper-limit"
                value={upperLimit}
                onChange={(e) => setUpperLimit(e.target.value)}
                placeholder="e.g., 1"
              />
            </div>
          </>
        )}
        
        <div className="buttons-row">
          <button onClick={calculate} className="calculate-btn">Calculate</button>
          <button onClick={handleClear} className="clear-btn">Clear</button>
          <button onClick={() => setShowSteps(!showSteps)} className="steps-btn">
            {showSteps ? 'Hide Steps' : 'Show Steps'}
          </button>
        </div>
      </div>
      
      <div className="examples-section">
        <h3>Examples:</h3>
        <div className="examples-grid">
          {examples[calculationType === 'symbolic' ? 
                   (operation === 'derivative' ? 'symbolicDerivative' : 
                    operation === 'integral' ? 'symbolicIntegral' : operation) : 
                   operation]?.map((ex, index) => (
            <button 
              key={index} 
              className="example-btn" 
              onClick={() => setExample(ex)}
            >
              {ex.expression} <span className="example-desc">({ex.description})</span>
            </button>
          ))}
        </div>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {result !== null && (
        <div className="result-display">
          <h3>Result:</h3>
          <div className="result-value">{result}</div>
          
          {showSteps && steps.length > 0 && (
            <div className="steps-display">
              <h4>Step-by-Step Solution:</h4>
              <ol>
                {steps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CalculusMode; 