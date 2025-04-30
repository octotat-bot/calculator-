import { useState } from 'react';
import './VectorsMode.css';
import * as math from 'mathjs';

const VectorsMode = ({ addToHistory }) => {
  const [operation, setOperation] = useState('dotProduct');
  const [vector1, setVector1] = useState('1,2,3');
  const [vector2, setVector2] = useState('4,5,6');
  const [result, setResult] = useState(null);
  const [steps, setSteps] = useState([]);
  const [showSteps, setShowSteps] = useState(false);
  const [error, setError] = useState('');
  const [planeEquation, setPlaneEquation] = useState('2x + 3y - z = 5');
  const [point, setPoint] = useState('1,2,3');
  
  // Handle operation change
  const handleOperationChange = (e) => {
    setOperation(e.target.value);
    setResult(null);
    setSteps([]);
    setError('');
  };
  
  // Clear input and results
  const handleClear = () => {
    if (operation === 'dotProduct' || operation === 'crossProduct' || 
        operation === 'vectorAddition' || operation === 'vectorSubtraction' || 
        operation === 'vectorMagnitude' || operation === 'vectorAngle') {
      setVector1('1,2,3');
      setVector2('4,5,6');
    } else if (operation === 'planeEquation' || operation === 'distancePointToPlane') {
      setPlaneEquation('2x + 3y - z = 5');
      setPoint('1,2,3');
    }
    setResult(null);
    setSteps([]);
    setError('');
  };

  // Set example
  const handleExample = () => {
    switch (operation) {
      case 'dotProduct':
        setVector1('1,2,3');
        setVector2('4,5,6');
        break;
      case 'crossProduct':
        setVector1('1,0,0');
        setVector2('0,1,0');
        break;
      case 'vectorAddition':
        setVector1('2,3,1');
        setVector2('-1,4,2');
        break;
      case 'vectorSubtraction':
        setVector1('5,7,2');
        setVector2('2,3,1');
        break;
      case 'vectorMagnitude':
        setVector1('3,4,0');
        setVector2('');
        break;
      case 'vectorAngle':
        setVector1('1,0,0');
        setVector2('0,1,0');
        break;
      case 'planeEquation':
        setPoint('1,2,3');
        setVector1('2,3,4');
        setVector2('5,1,0');
        break;
      case 'distancePointToPlane':
        setPlaneEquation('2x + 3y - z = 5');
        setPoint('1,2,3');
        break;
      default:
        break;
    }
  };
  
  // Parse vector from string input
  const parseVector = (vectorStr) => {
    try {
      const components = vectorStr.split(',').map(v => parseFloat(v.trim()));
      if (components.some(isNaN)) {
        throw new Error('Invalid vector format');
      }
      return components;
    } catch (err) {
      throw new Error(`Vector parsing error: ${err.message}`);
    }
  };
  
  // Calculate vector operations
  const calculate = () => {
    try {
      let calculationResult;
      let historyEntry = '';
      
      switch (operation) {
        case 'dotProduct':
          calculationResult = calculateDotProduct();
          historyEntry = `Dot product: (${vector1}) · (${vector2}) = ${calculationResult.result}`;
          break;
        case 'crossProduct':
          calculationResult = calculateCrossProduct();
          historyEntry = `Cross product: (${vector1}) × (${vector2}) = ${calculationResult.result}`;
          break;
        case 'vectorAddition':
          calculationResult = calculateVectorAddition();
          historyEntry = `Vector addition: (${vector1}) + (${vector2}) = ${calculationResult.result}`;
          break;
        case 'vectorSubtraction':
          calculationResult = calculateVectorSubtraction();
          historyEntry = `Vector subtraction: (${vector1}) - (${vector2}) = ${calculationResult.result}`;
          break;
        case 'vectorMagnitude':
          calculationResult = calculateVectorMagnitude();
          historyEntry = `Vector magnitude: |(${vector1})| = ${calculationResult.result}`;
          break;
        case 'vectorAngle':
          calculationResult = calculateVectorAngle();
          historyEntry = `Angle between vectors: (${vector1}) and (${vector2}) = ${calculationResult.result}°`;
          break;
        case 'planeEquation':
          calculationResult = calculatePlaneEquation();
          historyEntry = `Plane equation from point (${point}) and vectors (${vector1}), (${vector2}): ${calculationResult.result}`;
          break;
        case 'distancePointToPlane':
          calculationResult = calculateDistancePointToPlane();
          historyEntry = `Distance from point (${point}) to plane ${planeEquation}: ${calculationResult.result}`;
          break;
        default:
          throw new Error('Invalid operation');
      }
      
      setResult(calculationResult.result);
      setSteps(calculationResult.steps);
      setError('');
      
      addToHistory(historyEntry);
    } catch (err) {
      setError(err.message);
      setResult(null);
      setSteps([]);
    }
  };
  
  // Calculate dot product
  const calculateDotProduct = () => {
    try {
      const v1 = parseVector(vector1);
      const v2 = parseVector(vector2);
      
      if (v1.length !== v2.length) {
        throw new Error('Vectors must have the same dimension');
      }
      
      let dotProduct = 0;
      const steps = [];
      
      steps.push(`Step 1: Parse the vectors v1 = (${v1.join(', ')}) and v2 = (${v2.join(', ')})`);
      
      // Calculate dot product component by component
      const products = [];
      for (let i = 0; i < v1.length; i++) {
        dotProduct += v1[i] * v2[i];
        products.push(`${v1[i]} × ${v2[i]}`);
      }
      
      steps.push(`Step 2: Calculate the dot product: v1 · v2 = ${products.join(' + ')}`);
      steps.push(`Step 3: Compute the final result: v1 · v2 = ${dotProduct}`);
      
      return {
        result: dotProduct,
        steps
      };
    } catch (err) {
      throw new Error(`Dot product calculation error: ${err.message}`);
    }
  };
  
  // Calculate cross product
  const calculateCrossProduct = () => {
    try {
      const v1 = parseVector(vector1);
      const v2 = parseVector(vector2);
      
      if (v1.length !== 3 || v2.length !== 3) {
        throw new Error('Cross product is only defined for 3D vectors');
      }
      
      const steps = [];
      steps.push(`Step 1: Parse the vectors v1 = (${v1.join(', ')}) and v2 = (${v2.join(', ')})`);
      
      // Calculate cross product using formula
      const result = [
        v1[1] * v2[2] - v1[2] * v2[1],
        v1[2] * v2[0] - v1[0] * v2[2],
        v1[0] * v2[1] - v1[1] * v2[0]
      ];
      
      steps.push(`Step 2: Calculate the cross product using the formula:`);
      steps.push(`  i-component: v1.y × v2.z - v1.z × v2.y = ${v1[1]} × ${v2[2]} - ${v1[2]} × ${v2[1]} = ${result[0]}`);
      steps.push(`  j-component: v1.z × v2.x - v1.x × v2.z = ${v1[2]} × ${v2[0]} - ${v1[0]} × ${v2[2]} = ${result[1]}`);
      steps.push(`  k-component: v1.x × v2.y - v1.y × v2.x = ${v1[0]} × ${v2[1]} - ${v1[1]} × ${v2[0]} = ${result[2]}`);
      
      steps.push(`Step 3: The cross product v1 × v2 = (${result.join(', ')})`);
      
      return {
        result: `(${result.join(', ')})`,
        steps
      };
    } catch (err) {
      throw new Error(`Cross product calculation error: ${err.message}`);
    }
  };
  
  // Calculate vector addition
  const calculateVectorAddition = () => {
    try {
      const v1 = parseVector(vector1);
      const v2 = parseVector(vector2);
      
      if (v1.length !== v2.length) {
        throw new Error('Vectors must have the same dimension');
      }
      
      const steps = [];
      steps.push(`Step 1: Parse the vectors v1 = (${v1.join(', ')}) and v2 = (${v2.join(', ')})`);
      
      // Calculate vector addition component by component
      const result = v1.map((val, index) => val + v2[index]);
      
      steps.push(`Step 2: Add the components of the vectors:`);
      for (let i = 0; i < v1.length; i++) {
        steps.push(`  Component ${i+1}: ${v1[i]} + ${v2[i]} = ${result[i]}`);
      }
      
      steps.push(`Step 3: The resulting vector v1 + v2 = (${result.join(', ')})`);
      
      return {
        result: `(${result.join(', ')})`,
        steps
      };
    } catch (err) {
      throw new Error(`Vector addition calculation error: ${err.message}`);
    }
  };
  
  // Calculate vector subtraction
  const calculateVectorSubtraction = () => {
    try {
      const v1 = parseVector(vector1);
      const v2 = parseVector(vector2);
      
      if (v1.length !== v2.length) {
        throw new Error('Vectors must have the same dimension');
      }
      
      const steps = [];
      steps.push(`Step 1: Parse the vectors v1 = (${v1.join(', ')}) and v2 = (${v2.join(', ')})`);
      
      // Calculate vector subtraction component by component
      const result = v1.map((val, index) => val - v2[index]);
      
      steps.push(`Step 2: Subtract the components of the vectors:`);
      for (let i = 0; i < v1.length; i++) {
        steps.push(`  Component ${i+1}: ${v1[i]} - ${v2[i]} = ${result[i]}`);
      }
      
      steps.push(`Step 3: The resulting vector v1 - v2 = (${result.join(', ')})`);
      
      return {
        result: `(${result.join(', ')})`,
        steps
      };
    } catch (err) {
      throw new Error(`Vector subtraction calculation error: ${err.message}`);
    }
  };
  
  // Calculate vector magnitude
  const calculateVectorMagnitude = () => {
    try {
      const v = parseVector(vector1);
      
      const steps = [];
      steps.push(`Step 1: Parse the vector v = (${v.join(', ')})`);
      
      // Calculate the square of the magnitude
      const squareSum = v.reduce((sum, component) => sum + component * component, 0);
      steps.push(`Step 2: Calculate the sum of squares of components: ${v.map(c => `${c}²`).join(' + ')} = ${squareSum}`);
      
      // Calculate the magnitude
      const magnitude = Math.sqrt(squareSum);
      steps.push(`Step 3: Take the square root: √${squareSum} = ${magnitude}`);
      
      return {
        result: magnitude,
        steps
      };
    } catch (err) {
      throw new Error(`Vector magnitude calculation error: ${err.message}`);
    }
  };
  
  // Calculate angle between vectors
  const calculateVectorAngle = () => {
    try {
      const v1 = parseVector(vector1);
      const v2 = parseVector(vector2);
      
      if (v1.length !== v2.length) {
        throw new Error('Vectors must have the same dimension');
      }
      
      const steps = [];
      steps.push(`Step 1: Parse the vectors v1 = (${v1.join(', ')}) and v2 = (${v2.join(', ')})`);
      
      // Calculate dot product
      let dotProduct = 0;
      for (let i = 0; i < v1.length; i++) {
        dotProduct += v1[i] * v2[i];
      }
      
      steps.push(`Step 2: Calculate the dot product: v1 · v2 = ${dotProduct}`);
      
      // Calculate magnitudes
      const mag1 = Math.sqrt(v1.reduce((sum, component) => sum + component * component, 0));
      const mag2 = Math.sqrt(v2.reduce((sum, component) => sum + component * component, 0));
      
      steps.push(`Step 3: Calculate the magnitude of v1: |v1| = ${mag1}`);
      steps.push(`Step 4: Calculate the magnitude of v2: |v2| = ${mag2}`);
      
      // Calculate angle using the formula: cos(θ) = (v1 · v2) / (|v1| * |v2|)
      const cosTheta = dotProduct / (mag1 * mag2);
      steps.push(`Step 5: Calculate cos(θ) = (v1 · v2) / (|v1| × |v2|) = ${dotProduct} / (${mag1} × ${mag2}) = ${cosTheta}`);
      
      // Convert to degrees
      const angleRadians = Math.acos(Math.min(Math.max(cosTheta, -1), 1)); // Clamp to avoid numerical issues
      const angleDegrees = angleRadians * (180 / Math.PI);
      
      steps.push(`Step 6: Calculate θ = arccos(${cosTheta}) = ${angleRadians} radians = ${angleDegrees} degrees`);
      
      return {
        result: angleDegrees.toFixed(2),
        steps
      };
    } catch (err) {
      throw new Error(`Vector angle calculation error: ${err.message}`);
    }
  };
  
  // Calculate plane equation from point and vectors
  const calculatePlaneEquation = () => {
    try {
      const p = parseVector(point);
      const v1 = parseVector(vector1);
      const v2 = parseVector(vector2);
      
      if (p.length !== 3 || v1.length !== 3 || v2.length !== 3) {
        throw new Error('Point and vectors must be 3D');
      }
      
      const steps = [];
      steps.push(`Step 1: Parse the point P = (${p.join(', ')}) and vectors v1 = (${v1.join(', ')}), v2 = (${v2.join(', ')})`);
      
      // Calculate normal vector using cross product
      const normal = [
        v1[1] * v2[2] - v1[2] * v2[1],
        v1[2] * v2[0] - v1[0] * v2[2],
        v1[0] * v2[1] - v1[1] * v2[0]
      ];
      
      steps.push(`Step 2: Calculate the normal vector n = v1 × v2 = (${normal.join(', ')})`);
      
      // Calculate d in the equation ax + by + cz + d = 0
      const d = -(normal[0] * p[0] + normal[1] * p[1] + normal[2] * p[2]);
      
      steps.push(`Step 3: Calculate d = -(n · P) = -(${normal[0]} × ${p[0]} + ${normal[1]} × ${p[1]} + ${normal[2]} × ${p[2]}) = ${d}`);
      
      // Construct the plane equation
      let equation = '';
      if (normal[0] !== 0) equation += `${normal[0]}x `;
      if (normal[1] !== 0) {
        if (equation && normal[1] > 0) equation += '+ ';
        if (normal[1] < 0) equation += '- ';
        equation += `${Math.abs(normal[1])}y `;
      }
      if (normal[2] !== 0) {
        if (equation && normal[2] > 0) equation += '+ ';
        if (normal[2] < 0) equation += '- ';
        equation += `${Math.abs(normal[2])}z `;
      }
      if (d !== 0) {
        if (equation && d > 0) equation += '+ ';
        if (d < 0) equation += '- ';
        equation += `${Math.abs(d)} `;
      }
      equation += '= 0';
      
      steps.push(`Step 4: The plane equation is ${equation}`);
      
      return {
        result: equation,
        steps
      };
    } catch (err) {
      throw new Error(`Plane equation calculation error: ${err.message}`);
    }
  };
  
  // Calculate distance from point to plane
  const calculateDistancePointToPlane = () => {
    try {
      const p = parseVector(point);
      
      if (p.length !== 3) {
        throw new Error('Point must be 3D');
      }
      
      // Parse plane equation (format: ax + by + cz + d = 0 or ax + by + cz = d)
      const steps = [];
      steps.push(`Step 1: Parse the point P = (${p.join(', ')})`);
      steps.push(`Step 2: Parse the plane equation: ${planeEquation}`);
      
      // Extract coefficients from plane equation
      let a, b, c, d;
      let equation = planeEquation.replace(/\s+/g, '');
      
      // Check if in the form ax + by + cz = d
      if (/^[-+]?\d*\.?\d*x[-+]?\d*\.?\d*y[-+]?\d*\.?\d*z=[-+]?\d*\.?\d*$/.test(equation)) {
        const match = equation.match(/^([-+]?\d*\.?\d*)x([-+]?\d*\.?\d*)y([-+]?\d*\.?\d*)z=([-+]?\d*\.?\d*)$/);
        if (match) {
          a = parseFloat(match[1] || '1');
          b = parseFloat(match[2] || '1');
          c = parseFloat(match[3] || '1');
          d = -parseFloat(match[4] || '0');
        }
      } 
      // Try alternate format with different signs and ordering
      else {
        // Replace all occurrences of '-' with '+-' except at the beginning
        equation = equation.replace(/([^+-])-/g, '$1+-');
        if (equation.startsWith('-')) {
          equation = equation.substring(1);
          equation = '-' + equation;
        }
        
        // Split by '+' and process each term
        const terms = equation.split('+');
        a = 0; b = 0; c = 0; d = 0;
        
        for (const term of terms) {
          if (term.includes('x')) {
            a = parseFloat(term.replace('x', '') || '1');
            if (term.startsWith('-')) a = -1;
          } else if (term.includes('y')) {
            b = parseFloat(term.replace('y', '') || '1');
            if (term.startsWith('-')) b = -1;
          } else if (term.includes('z')) {
            c = parseFloat(term.replace('z', '') || '1');
            if (term.startsWith('-')) c = -1;
          } else if (term.includes('=')) {
            const parts = term.split('=');
            if (parts.length === 2) {
              d = -parseFloat(parts[1] || '0');
            }
          } else {
            d = -parseFloat(term || '0');
          }
        }
      }
      
      if (isNaN(a) || isNaN(b) || isNaN(c) || isNaN(d)) {
        throw new Error('Invalid plane equation format');
      }
      
      steps.push(`Step 3: Extract coefficients: a = ${a}, b = ${b}, c = ${c}, d = ${d}`);
      
      // Calculate distance using formula: d = |ax₀ + by₀ + cz₀ + d| / √(a² + b² + c²)
      const numerator = Math.abs(a * p[0] + b * p[1] + c * p[2] + d);
      const denominator = Math.sqrt(a * a + b * b + c * c);
      
      steps.push(`Step 4: Calculate the numerator: |a×x₀ + b×y₀ + c×z₀ + d| = |${a}×${p[0]} + ${b}×${p[1]} + ${c}×${p[2]} + ${d}| = ${numerator}`);
      steps.push(`Step 5: Calculate the denominator: √(a² + b² + c²) = √(${a}² + ${b}² + ${c}²) = ${denominator}`);
      
      const distance = numerator / denominator;
      steps.push(`Step 6: Calculate the distance: ${numerator} / ${denominator} = ${distance}`);
      
      return {
        result: distance,
        steps
      };
    } catch (err) {
      throw new Error(`Distance from point to plane calculation error: ${err.message}`);
    }
  };
  
  return (
    <div className="vectors-calculator">
      <div className="operation-select">
        <label htmlFor="vectors-operation">Operation:</label>
        <select 
          id="vectors-operation" 
          value={operation} 
          onChange={handleOperationChange}
        >
          <option value="dotProduct">Dot Product</option>
          <option value="crossProduct">Cross Product</option>
          <option value="vectorAddition">Vector Addition</option>
          <option value="vectorSubtraction">Vector Subtraction</option>
          <option value="vectorMagnitude">Vector Magnitude</option>
          <option value="vectorAngle">Angle Between Vectors</option>
          <option value="planeEquation">Plane Equation</option>
          <option value="distancePointToPlane">Distance from Point to Plane</option>
        </select>
      </div>
      
      <div className="input-area">
        {(operation === 'dotProduct' || operation === 'crossProduct' || 
          operation === 'vectorAddition' || operation === 'vectorSubtraction' || 
          operation === 'vectorAngle') && (
          <>
            <div className="vector-input">
              <label htmlFor="vector1">Vector 1 (comma separated):</label>
              <input
                type="text"
                id="vector1"
                value={vector1}
                onChange={(e) => setVector1(e.target.value)}
                placeholder="e.g., 1,2,3"
              />
            </div>
            
            <div className="vector-input">
              <label htmlFor="vector2">Vector 2 (comma separated):</label>
              <input
                type="text"
                id="vector2"
                value={vector2}
                onChange={(e) => setVector2(e.target.value)}
                placeholder="e.g., 4,5,6"
              />
            </div>
          </>
        )}
        
        {operation === 'vectorMagnitude' && (
          <div className="vector-input">
            <label htmlFor="vector1">Vector (comma separated):</label>
            <input
              type="text"
              id="vector1"
              value={vector1}
              onChange={(e) => setVector1(e.target.value)}
              placeholder="e.g., 3,4,5"
            />
          </div>
        )}
        
        {operation === 'planeEquation' && (
          <>
            <div className="vector-input">
              <label htmlFor="point">Point on plane (comma separated):</label>
              <input
                type="text"
                id="point"
                value={point}
                onChange={(e) => setPoint(e.target.value)}
                placeholder="e.g., 1,2,3"
              />
            </div>
            
            <div className="vector-input">
              <label htmlFor="vector1">Vector 1 on plane (comma separated):</label>
              <input
                type="text"
                id="vector1"
                value={vector1}
                onChange={(e) => setVector1(e.target.value)}
                placeholder="e.g., 1,0,0"
              />
            </div>
            
            <div className="vector-input">
              <label htmlFor="vector2">Vector 2 on plane (comma separated):</label>
              <input
                type="text"
                id="vector2"
                value={vector2}
                onChange={(e) => setVector2(e.target.value)}
                placeholder="e.g., 0,1,0"
              />
            </div>
          </>
        )}
        
        {operation === 'distancePointToPlane' && (
          <>
            <div className="vector-input">
              <label htmlFor="planeEquation">Plane equation (e.g., 2x + 3y - z = 5):</label>
              <input
                type="text"
                id="planeEquation"
                value={planeEquation}
                onChange={(e) => setPlaneEquation(e.target.value)}
                placeholder="e.g., 2x + 3y - z = 5"
              />
            </div>
            
            <div className="vector-input">
              <label htmlFor="point">Point (comma separated):</label>
              <input
                type="text"
                id="point"
                value={point}
                onChange={(e) => setPoint(e.target.value)}
                placeholder="e.g., 1,2,3"
              />
            </div>
          </>
        )}
        
        <div className="buttons-row">
          <button onClick={calculate} className="calculate-btn">Calculate</button>
          <button onClick={handleClear} className="clear-btn">Clear</button>
          <button onClick={handleExample} className="example-btn">Example</button>
          <button onClick={() => setShowSteps(!showSteps)} className="steps-btn">
            {showSteps ? 'Hide Steps' : 'Show Steps'}
          </button>
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

export default VectorsMode; 