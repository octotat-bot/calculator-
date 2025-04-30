import { useState, useEffect, useRef } from 'react';
import './GraphMode.css';
import { Chart, registerables } from 'chart.js';
import * as math from 'mathjs';

// Register all Chart.js components
Chart.register(...registerables);

const GraphMode = ({ addToHistory }) => {
  const [functions, setFunctions] = useState([{ expression: 'x^2', color: '#4285f4', visible: true }]);
  const [xRange, setXRange] = useState({ min: -10, max: 10 });
  const [yRange, setYRange] = useState({ min: -10, max: 10 });
  const [points, setPoints] = useState(100);
  const [error, setError] = useState('');
  const [mousePosition, setMousePosition] = useState({ x: null, y: null });
  
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  
  // Generate data points for a function
  const generatePoints = (expression, xMin, xMax, pointCount) => {
    try {
      // Compile the expression for faster evaluation
      const compiled = math.compile(expression);
      
      const step = (xMax - xMin) / (pointCount - 1);
      const data = [];
      
      for (let i = 0; i < pointCount; i++) {
        const x = xMin + step * i;
        try {
          const y = compiled.evaluate({ x });
          
          // Skip points if y is not a finite number or outside the visible y range
          if (isFinite(y) && y >= yRange.min && y <= yRange.max) {
            data.push({ x, y });
          } else {
            // Add null point to break the line for discontinuities
            if (data.length > 0 && isFinite(data[data.length - 1].y)) {
              data.push({ x, y: null });
            }
          }
        } catch (err) {
          // Skip points where evaluation fails
          if (data.length > 0 && isFinite(data[data.length - 1].y)) {
            data.push({ x, y: null });
          }
        }
      }
      
      return data;
    } catch (err) {
      setError(`Error in expression "${expression}": ${err.message}`);
      return [];
    }
  };
  
  // Create or update the chart
  const updateChart = () => {
    if (!chartRef.current) return;
    
    // Destroy previous chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    
    const datasets = [];
    
    // Create datasets for each function
    functions.forEach((func, index) => {
      if (func.visible && func.expression.trim()) {
        try {
          const points = generatePoints(
            func.expression, 
            xRange.min, 
            xRange.max, 
            points
          );
          
          datasets.push({
            label: `f${index + 1}(x) = ${func.expression}`,
            data: points,
            borderColor: func.color,
            backgroundColor: 'transparent',
            pointRadius: 0,
            borderWidth: 2,
            tension: 0.1,
            spanGaps: false,
          });
        } catch (err) {
          setError(`Error in function ${index + 1}: ${err.message}`);
        }
      }
    });
    
    const ctx = chartRef.current.getContext('2d');
    
    // Create grid lines
    const gridLines = {
      color: 'rgba(200, 200, 200, 0.2)',
      drawOnChartArea: true,
    };
    
    // Create new chart
    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 0,
        },
        scales: {
          x: {
            type: 'linear',
            position: 'center',
            min: xRange.min,
            max: xRange.max,
            ticks: {
              stepSize: Math.ceil((xRange.max - xRange.min) / 10),
              color: 'var(--text-color)',
            },
            grid: gridLines,
            border: {
              color: 'var(--text-color)',
            },
          },
          y: {
            type: 'linear',
            position: 'center',
            min: yRange.min,
            max: yRange.max,
            ticks: {
              stepSize: Math.ceil((yRange.max - yRange.min) / 10),
              color: 'var(--text-color)',
            },
            grid: gridLines,
            border: {
              color: 'var(--text-color)',
            },
          },
        },
        plugins: {
          tooltip: {
            enabled: true,
            mode: 'nearest',
            intersect: false,
            callbacks: {
              title: (tooltipItems) => {
                return `x: ${tooltipItems[0].parsed.x.toFixed(2)}`;
              },
              label: (tooltipItem) => {
                return `y: ${tooltipItem.parsed.y.toFixed(2)}`;
              },
            },
          },
          legend: {
            position: 'top',
            labels: {
              color: 'var(--text-color)',
            },
          },
        },
        onHover: (event, elements) => {
          if (!event || !event.chart) return;
          
          const chart = event.chart;
          const canvasPosition = Chart.helpers.getRelativePosition(event, chart);
          
          const x = chart.scales.x.getValueForPixel(canvasPosition.x);
          const y = chart.scales.y.getValueForPixel(canvasPosition.y);
          
          setMousePosition({
            x: x ? x.toFixed(2) : null,
            y: y ? y.toFixed(2) : null,
          });
        },
      },
    });
  };
  
  // Update chart when parameters change
  useEffect(() => {
    updateChart();
  }, [functions, xRange, yRange, points]);
  
  // Add a new function
  const addFunction = () => {
    const colors = ['#4285f4', '#ea4335', '#fbbc05', '#34a853', '#9c27b0', '#ff9800'];
    const newColor = colors[functions.length % colors.length];
    
    setFunctions([...functions, { expression: '', color: newColor, visible: true }]);
  };
  
  // Remove a function
  const removeFunction = (index) => {
    if (functions.length > 1) {
      const newFunctions = [...functions];
      newFunctions.splice(index, 1);
      setFunctions(newFunctions);
    }
  };
  
  // Update function expression
  const updateFunction = (index, expression) => {
    const newFunctions = [...functions];
    newFunctions[index].expression = expression;
    setFunctions(newFunctions);
    setError('');
  };
  
  // Toggle function visibility
  const toggleFunctionVisibility = (index) => {
    const newFunctions = [...functions];
    newFunctions[index].visible = !newFunctions[index].visible;
    setFunctions(newFunctions);
  };
  
  // Update range values
  const handleRangeChange = (axis, bound, value) => {
    const numValue = parseFloat(value);
    
    if (isNaN(numValue)) return;
    
    if (axis === 'x') {
      setXRange({ ...xRange, [bound]: numValue });
    } else {
      setYRange({ ...yRange, [bound]: numValue });
    }
  };
  
  // Plot all functions and save to history
  const plotFunctions = () => {
    updateChart();
    
    // Add to history
    const functionsText = functions
      .filter(f => f.visible && f.expression.trim())
      .map((f, i) => `f${i + 1}(x) = ${f.expression}`)
      .join(', ');
    
    if (functionsText) {
      addToHistory(`Plotted: ${functionsText}`);
    }
  };
  
  return (
    <div className="graph-calculator">
      <div className="graph-inputs">
        <div className="function-inputs">
          <h3>Functions</h3>
          {functions.map((func, index) => (
            <div key={index} className="function-row">
              <div className="function-color" style={{ backgroundColor: func.color }}></div>
              <div className="function-label">{`f${index + 1}(x) =`}</div>
              <input
                type="text"
                className="function-expression"
                value={func.expression}
                onChange={(e) => updateFunction(index, e.target.value)}
                placeholder="Enter a function (e.g., sin(x) or x^2)"
              />
              <div className="function-controls">
                <button
                  className={`visibility-toggle ${func.visible ? 'visible' : ''}`}
                  onClick={() => toggleFunctionVisibility(index)}
                  title={func.visible ? 'Hide function' : 'Show function'}
                >
                  {func.visible ? '👁️' : '👁️‍🗨️'}
                </button>
                <button
                  className="remove-function"
                  onClick={() => removeFunction(index)}
                  disabled={functions.length <= 1}
                  title="Remove function"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
          <button className="add-function" onClick={addFunction}>
            + Add Function
          </button>
        </div>
        
        <div className="range-controls">
          <div className="range-section">
            <h3>X Range</h3>
            <div className="range-inputs">
              <div className="range-input">
                <label>Min:</label>
                <input
                  type="number"
                  value={xRange.min}
                  onChange={(e) => handleRangeChange('x', 'min', e.target.value)}
                  step="1"
                />
              </div>
              <div className="range-input">
                <label>Max:</label>
                <input
                  type="number"
                  value={xRange.max}
                  onChange={(e) => handleRangeChange('x', 'max', e.target.value)}
                  step="1"
                />
              </div>
            </div>
          </div>
          
          <div className="range-section">
            <h3>Y Range</h3>
            <div className="range-inputs">
              <div className="range-input">
                <label>Min:</label>
                <input
                  type="number"
                  value={yRange.min}
                  onChange={(e) => handleRangeChange('y', 'min', e.target.value)}
                  step="1"
                />
              </div>
              <div className="range-input">
                <label>Max:</label>
                <input
                  type="number"
                  value={yRange.max}
                  onChange={(e) => handleRangeChange('y', 'max', e.target.value)}
                  step="1"
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="graph-actions">
          <div className="points-control">
            <label>Resolution:</label>
            <input
              type="range"
              min="50"
              max="500"
              value={points}
              onChange={(e) => setPoints(parseInt(e.target.value))}
            />
            <span>{points} points</span>
          </div>
          
          <button className="plot-button" onClick={plotFunctions}>
            Plot
          </button>
        </div>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="graph-container">
        <canvas ref={chartRef}></canvas>
        
        {mousePosition.x && mousePosition.y && (
          <div className="coordinate-display">
            ({mousePosition.x}, {mousePosition.y})
          </div>
        )}
      </div>
    </div>
  );
};

export default GraphMode; 