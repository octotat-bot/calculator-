import { useState, useEffect } from 'react';
import './MatrixMode.css';
import * as math from 'mathjs';

const MatrixMode = ({ addToHistory }) => {
  const [matrixA, setMatrixA] = useState([
    [1, 2],
    [3, 4]
  ]);
  const [matrixB, setMatrixB] = useState([
    [5, 6],
    [7, 8]
  ]);
  const [rows, setRows] = useState(2);
  const [cols, setCols] = useState(2);
  const [rowsB, setRowsB] = useState(2);
  const [colsB, setColsB] = useState(2);
  const [operation, setOperation] = useState('add');
  const [result, setResult] = useState(null);
  const [steps, setSteps] = useState([]);
  const [showSteps, setShowSteps] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [matrixPresets, setMatrixPresets] = useState({
    identity: createIdentityMatrix(2),
    zero: createZeroMatrix(2, 2),
    ones: createOnesMatrix(2, 2),
  });

  // Initialize matrix with zeros
  const createMatrix = (rows, cols) => {
    return Array(rows).fill().map(() => Array(cols).fill(0));
  };

  // Create an identity matrix of specified size
  function createIdentityMatrix(size) {
    return Array(size).fill().map((_, i) => 
      Array(size).fill().map((_, j) => i === j ? 1 : 0)
    );
  }

  // Create a matrix filled with zeros
  function createZeroMatrix(rows, cols) {
    return Array(rows).fill().map(() => Array(cols).fill(0));
  }

  // Create a matrix filled with ones
  function createOnesMatrix(rows, cols) {
    return Array(rows).fill().map(() => Array(cols).fill(1));
  }

  // Generate a matrix with random values
  function generateRandomMatrix(rows, cols, min = -10, max = 10) {
    return Array(rows).fill().map(() => 
      Array(cols).fill().map(() => Math.floor(Math.random() * (max - min + 1)) + min)
    );
  }

  // Apply preset to matrix
  const applyPreset = (matrixType, presetType) => {
    let newMatrix;
    
    if (matrixType === 'A') {
      switch (presetType) {
        case 'identity':
          if (rows !== cols) {
            setError('Identity matrix must be square. Adjusting columns to match rows.');
            setCols(rows);
            newMatrix = createIdentityMatrix(rows);
          } else {
            newMatrix = createIdentityMatrix(rows);
          }
          break;
        case 'zero':
          newMatrix = createZeroMatrix(rows, cols);
          break;
        case 'ones':
          newMatrix = createOnesMatrix(rows, cols);
          break;
        case 'random':
          newMatrix = generateRandomMatrix(rows, cols);
          break;
        default:
          return;
      }
      setMatrixA(newMatrix);
    } else {
      switch (presetType) {
        case 'identity':
          if (rowsB !== colsB) {
            setError('Identity matrix must be square. Adjusting columns to match rows.');
            setColsB(rowsB);
            newMatrix = createIdentityMatrix(rowsB);
          } else {
            newMatrix = createIdentityMatrix(rowsB);
          }
          break;
        case 'zero':
          newMatrix = createZeroMatrix(rowsB, colsB);
          break;
        case 'ones':
          newMatrix = createOnesMatrix(rowsB, colsB);
          break;
        case 'random':
          newMatrix = generateRandomMatrix(rowsB, colsB);
          break;
        default:
          return;
      }
      setMatrixB(newMatrix);
    }
    
    // Clear any error after a brief delay
    setTimeout(() => setError(''), 3000);
  };

  // Update presets when dimensions change
  useEffect(() => {
    setMatrixPresets({
      identity: createIdentityMatrix(Math.max(rows, cols)),
      zero: createZeroMatrix(rows, cols),
      ones: createOnesMatrix(rows, cols),
    });
  }, [rows, cols]);

  // Handle matrix dimension changes
  const handleDimensionChange = (matrixType, dimType, value) => {
    const newDim = parseInt(value, 10) || 1;
    const maxDim = 5; // Limit matrix size for simplicity
    
    if (newDim < 1 || newDim > maxDim) {
      setError(`Matrix dimensions must be between 1 and ${maxDim}`);
      return;
    }
    
    setError('');
    
    if (matrixType === 'A') {
      if (dimType === 'rows') {
        setRows(newDim);
        if (operation === 'multiply' && newDim !== rowsB) {
          // Auto-adjust matrix B for multiplication compatibility
          setMatrixA(createMatrix(newDim, cols));
        } else {
          // Create a new matrix with the new dimensions but preserve existing values where possible
          const newMatrix = createMatrix(newDim, cols);
          for (let i = 0; i < Math.min(newDim, matrixA.length); i++) {
            for (let j = 0; j < Math.min(cols, matrixA[0].length); j++) {
              newMatrix[i][j] = matrixA[i][j];
            }
          }
          setMatrixA(newMatrix);
        }
      } else {
        setCols(newDim);
        if (operation === 'multiply') {
          setRowsB(newDim); // For multiplication compatibility
        }
        const newMatrix = createMatrix(rows, newDim);
        for (let i = 0; i < Math.min(rows, matrixA.length); i++) {
          for (let j = 0; j < Math.min(newDim, matrixA[0].length); j++) {
            newMatrix[i][j] = matrixA[i][j];
          }
        }
        setMatrixA(newMatrix);
        
        // Adjust matrix B if needed for multiplication
        if (operation === 'multiply') {
          const newMatrixB = createMatrix(newDim, colsB);
          for (let i = 0; i < Math.min(newDim, matrixB.length); i++) {
            for (let j = 0; j < Math.min(colsB, matrixB[0].length); j++) {
              newMatrixB[i][j] = matrixB[i][j];
            }
          }
          setMatrixB(newMatrixB);
        }
      }
    } else { // Matrix B
      if (dimType === 'rows') {
        setRowsB(newDim);
        if (operation === 'multiply' && cols !== newDim) {
          // Can't change rows of B in multiplication unless cols of A matches
          setError('For multiplication, columns of A must equal rows of B');
          return;
        }
        const newMatrix = createMatrix(newDim, colsB);
        for (let i = 0; i < Math.min(newDim, matrixB.length); i++) {
          for (let j = 0; j < Math.min(colsB, matrixB[0].length); j++) {
            newMatrix[i][j] = matrixB[i][j];
          }
        }
        setMatrixB(newMatrix);
      } else {
        setColsB(newDim);
        const newMatrix = createMatrix(rowsB, newDim);
        for (let i = 0; i < Math.min(rowsB, matrixB.length); i++) {
          for (let j = 0; j < Math.min(newDim, matrixB[0].length); j++) {
            newMatrix[i][j] = matrixB[i][j];
          }
        }
        setMatrixB(newMatrix);
      }
    }
  };

  // Handle matrix cell value changes
  const handleMatrixChange = (matrix, row, col, value) => {
    const newValue = value === '' ? 0 : parseFloat(value) || 0;
    
    if (matrix === 'A') {
      const newMatrix = [...matrixA];
      newMatrix[row][col] = newValue;
      setMatrixA(newMatrix);
    } else {
      const newMatrix = [...matrixB];
      newMatrix[row][col] = newValue;
      setMatrixB(newMatrix);
    }
  };

  // Operation change handler
  const handleOperationChange = (e) => {
    const newOperation = e.target.value;
    setOperation(newOperation);
    setResult(null);
    setSteps([]);
    setError('');
    
    // Adjust matrix dimensions for compatibility with the new operation
    if (newOperation === 'multiply') {
      if (cols !== rowsB) {
        setRowsB(cols);
        const newMatrixB = createMatrix(cols, colsB);
        for (let i = 0; i < Math.min(cols, matrixB.length); i++) {
          for (let j = 0; j < Math.min(colsB, matrixB[0].length); j++) {
            newMatrixB[i][j] = matrixB[i][j];
          }
        }
        setMatrixB(newMatrixB);
      }
    } else if (newOperation === 'add' || newOperation === 'subtract') {
      if (rows !== rowsB || cols !== colsB) {
        setRowsB(rows);
        setColsB(cols);
        const newMatrixB = createMatrix(rows, cols);
        for (let i = 0; i < Math.min(rows, matrixB.length); i++) {
          for (let j = 0; j < Math.min(cols, matrixB[0].length); j++) {
            newMatrixB[i][j] = matrixB[i][j];
          }
        }
        setMatrixB(newMatrixB);
      }
    }
  };

  // Perform matrix calculation
  const calculateResult = () => {
    try {
      let calculationResult;
      const mathJsMatrixA = math.matrix(matrixA);
      let mathJsMatrixB, determinant, inverseMatrix, transposeMatrix;
      const operationSteps = [];
      
      switch (operation) {
        case 'add':
          if (rows !== rowsB || cols !== colsB) {
            setError('Matrices must have the same dimensions for addition');
            return;
          }
          mathJsMatrixB = math.matrix(matrixB);
          calculationResult = math.add(mathJsMatrixA, mathJsMatrixB);
          
          // Record steps
          operationSteps.push('Matrix addition: A + B');
          operationSteps.push(`A = ${math.format(mathJsMatrixA)}`);
          operationSteps.push(`B = ${math.format(mathJsMatrixB)}`);
          operationSteps.push(`Result = ${math.format(calculationResult)}`);
          break;
          
        case 'subtract':
          if (rows !== rowsB || cols !== colsB) {
            setError('Matrices must have the same dimensions for subtraction');
            return;
          }
          mathJsMatrixB = math.matrix(matrixB);
          calculationResult = math.subtract(mathJsMatrixA, mathJsMatrixB);
          
          // Record steps
          operationSteps.push('Matrix subtraction: A - B');
          operationSteps.push(`A = ${math.format(mathJsMatrixA)}`);
          operationSteps.push(`B = ${math.format(mathJsMatrixB)}`);
          operationSteps.push(`Result = ${math.format(calculationResult)}`);
          break;
          
        case 'multiply':
          if (cols !== rowsB) {
            setError('Number of columns in A must equal number of rows in B for multiplication');
            return;
          }
          mathJsMatrixB = math.matrix(matrixB);
          calculationResult = math.multiply(mathJsMatrixA, mathJsMatrixB);
          
          // Record steps
          operationSteps.push('Matrix multiplication: A × B');
          operationSteps.push(`A = ${math.format(mathJsMatrixA)}`);
          operationSteps.push(`B = ${math.format(mathJsMatrixB)}`);
          
          // Show how each cell is calculated for multiplication
          for (let i = 0; i < rows; i++) {
            for (let j = 0; j < colsB; j++) {
              let cellCalculation = '';
              let cellValue = 0;
              
              for (let k = 0; k < cols; k++) {
                cellValue += matrixA[i][k] * matrixB[k][j];
                cellCalculation += `(${matrixA[i][k]} × ${matrixB[k][j]})`;
                if (k < cols - 1) cellCalculation += ' + ';
              }
              
              operationSteps.push(`Cell (${i+1},${j+1}) = ${cellCalculation} = ${cellValue}`);
            }
          }
          
          operationSteps.push(`Result = ${math.format(calculationResult)}`);
          break;
          
        case 'determinant':
          if (rows !== cols) {
            setError('Matrix must be square to calculate determinant');
            return;
          }
          determinant = math.det(mathJsMatrixA);
          calculationResult = determinant;
          
          // Record steps for determinant calculation
          operationSteps.push('Determinant of matrix A');
          operationSteps.push(`A = ${math.format(mathJsMatrixA)}`);
          
          if (rows === 2) {
            const a = matrixA[0][0], b = matrixA[0][1], c = matrixA[1][0], d = matrixA[1][1];
            operationSteps.push(`For a 2×2 matrix: |A| = (${a} × ${d}) - (${b} × ${c})`);
            operationSteps.push(`|A| = ${a * d} - ${b * c} = ${determinant}`);
          } else {
            operationSteps.push(`Determinant = ${determinant}`);
          }
          break;
          
        case 'inverse':
          if (rows !== cols) {
            setError('Matrix must be square to calculate inverse');
            return;
          }
          
          determinant = math.det(mathJsMatrixA);
          if (Math.abs(determinant) < 1e-10) {
            setError('Matrix is singular (determinant is zero), cannot compute inverse');
            return;
          }
          
          inverseMatrix = math.inv(mathJsMatrixA);
          calculationResult = inverseMatrix;
          
          // Record steps for inverse calculation
          operationSteps.push('Inverse of matrix A');
          operationSteps.push(`A = ${math.format(mathJsMatrixA)}`);
          operationSteps.push(`First, determinant = ${determinant}`);
          operationSteps.push(`Since determinant ≠ 0, inverse exists`);
          operationSteps.push(`A⁻¹ = ${math.format(inverseMatrix)}`);
          
          // Verification step: A × A⁻¹ = I
          const identityCheck = math.multiply(mathJsMatrixA, inverseMatrix);
          operationSteps.push(`Verification: A × A⁻¹ = ${math.format(identityCheck)} ≈ I`);
          break;
          
        case 'transpose':
          transposeMatrix = math.transpose(mathJsMatrixA);
          calculationResult = transposeMatrix;
          
          // Record steps for transpose
          operationSteps.push('Transpose of matrix A');
          operationSteps.push(`A = ${math.format(mathJsMatrixA)}`);
          operationSteps.push(`Aᵀ (rows and columns swapped) = ${math.format(transposeMatrix)}`);
          break;
      }
      
      // Convert mathjs matrix to array for display
      calculationResult = typeof calculationResult === 'number' 
        ? calculationResult 
        : math.matrix(calculationResult).toArray();
      
      setResult(calculationResult);
      setSteps(operationSteps);
      setError('');
      
      // Add to global history
      const operationName = operation.charAt(0).toUpperCase() + operation.slice(1);
      const operationSymbols = {
        add: '+',
        subtract: '-',
        multiply: '×',
        determinant: 'det',
        inverse: 'inv',
        transpose: 'T'
      };
      
      let historyText;
      if (operation === 'determinant' || operation === 'inverse' || operation === 'transpose') {
        historyText = `${operationName}(A) = ${
          typeof calculationResult === 'number' 
            ? calculationResult 
            : JSON.stringify(calculationResult)
        }`;
      } else {
        historyText = `A ${operationSymbols[operation]} B = ${
          typeof calculationResult === 'number' 
            ? calculationResult 
            : JSON.stringify(calculationResult)
        }`;
      }
      
      addToHistory(historyText);
    } catch (err) {
      setError(`Error: ${err.message}`);
      setResult(null);
      setSteps([]);
    }
  };

  // Import matrix from CSV
  const importMatrixFromCSV = (matrixType, csvText) => {
    try {
      // Split the CSV text by lines and then by commas
      const rows = csvText.trim().split(/[\n\r]+/);
      const parsedMatrix = rows.map(row => 
        row.split(',').map(value => {
          const num = parseFloat(value.trim());
          return isNaN(num) ? 0 : num;
        })
      );
      
      // Validate matrix dimensions
      const rowCount = parsedMatrix.length;
      const colCount = parsedMatrix[0].length;
      
      if (rowCount < 1 || colCount < 1 || rowCount > 5 || colCount > 5) {
        setError('Imported matrix dimensions must be between 1x1 and 5x5');
        return;
      }
      
      // Ensure all rows have the same number of columns
      for (let i = 1; i < rowCount; i++) {
        if (parsedMatrix[i].length !== colCount) {
          setError('All rows must have the same number of columns');
          return;
        }
      }
      
      // Update matrix and dimensions
      if (matrixType === 'A') {
        setRows(rowCount);
        setCols(colCount);
        setMatrixA(parsedMatrix);
      } else {
        setRowsB(rowCount);
        setColsB(colCount);
        setMatrixB(parsedMatrix);
      }
      
      setError('');
    } catch (err) {
      setError('Invalid CSV format. Please use comma-separated values with one row per line');
    }
  };

  // Handle file drop for CSV import
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };
  
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };
  
  const handleDrop = (matrixType) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      
      if (file.type === 'text/csv' || file.name.endsWith('.csv') || file.type === 'text/plain') {
        const reader = new FileReader();
        reader.onload = (event) => {
          importMatrixFromCSV(matrixType, event.target.result);
        };
        reader.readAsText(file);
      } else {
        setError('Please drop a CSV or text file');
      }
    }
  };

  // Copy matrix to clipboard
  const copyMatrixToClipboard = (matrix) => {
    const csvContent = matrix.map(row => row.join(',')).join('\n');
    navigator.clipboard.writeText(csvContent).then(
      () => {
        setError('Matrix copied to clipboard!');
        setTimeout(() => setError(''), 2000);
      },
      () => {
        setError('Failed to copy matrix');
      }
    );
  };

  // Render matrix input grid with enhanced features
  const renderMatrixInput = (matrix, setMatrix, matrixRows, matrixCols, label) => {
    return (
      <div className="matrix-input-container">
        <div className="matrix-header">
          <h3>{label}</h3>
          <div className="matrix-dimensions">
            <div className="dimension-control">
              <label>Rows:</label>
              <input 
                type="number" 
                min="1" 
                max="5" 
                value={label === 'Matrix A' ? rows : rowsB} 
                onChange={(e) => handleDimensionChange(label.slice(-1), 'rows', e.target.value)}
                disabled={operation === 'multiply' && label === 'Matrix B'}
              />
            </div>
            <div className="dimension-control">
              <label>Columns:</label>
              <input 
                type="number" 
                min="1" 
                max="5" 
                value={label === 'Matrix A' ? cols : colsB} 
                onChange={(e) => handleDimensionChange(label.slice(-1), 'cols', e.target.value)}
              />
            </div>
          </div>
          
          <div className="matrix-preset-buttons">
            <button 
              className="preset-btn" 
              title="Set as Identity Matrix"
              onClick={() => applyPreset(label.slice(-1), 'identity')}
            >
              Identity
            </button>
            <button 
              className="preset-btn" 
              title="Fill with Zeros"
              onClick={() => applyPreset(label.slice(-1), 'zero')}
            >
              Zeros
            </button>
            <button 
              className="preset-btn" 
              title="Fill with Ones"
              onClick={() => applyPreset(label.slice(-1), 'ones')}
            >
              Ones
            </button>
            <button 
              className="preset-btn" 
              title="Fill with Random Values"
              onClick={() => applyPreset(label.slice(-1), 'random')}
            >
              Random
            </button>
            <button 
              className="preset-btn" 
              title="Copy Matrix"
              onClick={() => copyMatrixToClipboard(label === 'Matrix A' ? matrixA : matrixB)}
            >
              Copy
            </button>
          </div>
        </div>
        
        <div 
          className={`matrix-input-area ${dragActive ? 'drag-active' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop(label.slice(-1))}
        >
          <div className="matrix-drag-overlay">
            <p>Drop CSV file here to import matrix</p>
          </div>
          
          <div className="matrix-grid-container">
            <div 
              className="matrix-grid"
              style={{
                '--rows': label === 'Matrix A' ? rows : rowsB,
                '--cols': label === 'Matrix A' ? cols : colsB
              }}
            >
              {Array.from({ length: (label === 'Matrix A' ? rows : rowsB) }, (_, row) => (
                Array.from({ length: (label === 'Matrix A' ? cols : colsB) }, (_, col) => (
                  <input
                    key={`${row}-${col}`}
                    type="number"
                    value={label === 'Matrix A' ? matrixA[row][col] : matrixB[row][col]}
                    onChange={(e) => handleMatrixChange(label.slice(-1), row, col, e.target.value)}
                    className="matrix-cell"
                    data-row={row + 1}
                    data-col={col + 1}
                  />
                ))
              )).flat()}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="matrix-calculator">
      <div className="matrices-container">
        {renderMatrixInput(matrixA, setMatrixA, rows, cols, 'Matrix A')}
        
        {(operation === 'add' || operation === 'subtract' || operation === 'multiply') && (
          <div className="matrix-operation-symbol">
            {operation === 'add' ? '+' : operation === 'subtract' ? '−' : '×'}
          </div>
        )}
        
        {(operation === 'add' || operation === 'subtract' || operation === 'multiply') && (
          renderMatrixInput(matrixB, setMatrixB, rowsB, colsB, 'Matrix B')
        )}
      </div>
      
      <div className="matrix-controls">
        <div className="operation-select">
          <label htmlFor="matrix-operation">Operation:</label>
          <select 
            id="matrix-operation" 
            value={operation} 
            onChange={handleOperationChange}
          >
            <option value="add">Addition (A + B)</option>
            <option value="subtract">Subtraction (A - B)</option>
            <option value="multiply">Multiplication (A × B)</option>
            <option value="determinant">Determinant (|A|)</option>
            <option value="inverse">Inverse (A⁻¹)</option>
            <option value="transpose">Transpose (Aᵀ)</option>
          </select>
        </div>
        
        <div className="matrix-buttons">
          <button 
            className="steps-toggle" 
            onClick={() => setShowSteps(!showSteps)}
            disabled={!result}
          >
            {showSteps ? 'Hide Steps' : 'Show Steps'}
          </button>
          <button className="calculate-btn" onClick={calculateResult}>Calculate</button>
        </div>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {result && (
        <div className="matrix-result">
          <h3>Result:</h3>
          {typeof result === 'number' ? (
            <div className="scalar-result">{result}</div>
          ) : (
            <div className="result-matrix-container">
              <div className="result-matrix">
                <div 
                  className="result-matrix-grid"
                  style={{
                    '--cols': result[0].length
                  }}
                >
                  {result.flat().map((value, index) => (
                    <div key={index} className="result-matrix-cell">
                      {typeof value === 'number' ? parseFloat(value.toFixed(4)) : value}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      {showSteps && steps.length > 0 && (
        <div className="calculation-steps">
          <h3>Calculation Steps:</h3>
          <ol className="steps-list">
            {steps.map((step, index) => (
              <li key={index} className="step-item">{step}</li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
};

export default MatrixMode; 