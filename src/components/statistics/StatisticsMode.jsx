import { useState, useEffect } from 'react';
import * as math from 'mathjs';
import './StatisticsMode.css';

const StatisticsMode = ({ addToHistory }) => {
  const [dataList, setDataList] = useState([]);
  const [currentInput, setCurrentInput] = useState('');
  const [display, setDisplay] = useState('');
  const [error, setError] = useState(null);
  const [results, setResults] = useState({
    mean: null,
    median: null,
    mode: null,
    stdDev: null,
    variance: null,
    min: null,
    max: null,
    sum: null,
    count: 0,
    range: null,
    q1: null,
    q3: null,
    iqr: null,
    skewness: null,
    kurtosis: null
  });
  const [activeTab, setActiveTab] = useState('basic');
  const [compareDataList, setCompareDataList] = useState([]);
  const [isComparing, setIsComparing] = useState(false);

  // Clear any error message after 3 seconds
  useEffect(() => {
    if (error) {
      const timeoutId = setTimeout(() => {
        setError(null);
      }, 3000);
      return () => clearTimeout(timeoutId);
    }
  }, [error]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key >= '0' && e.key <= '9') {
        updateCurrentInput(currentInput + e.key);
      } else if (e.key === '.') {
        if (!currentInput.includes('.')) {
          updateCurrentInput(currentInput + '.');
        }
      } else if (e.key === '-' && currentInput === '') {
        updateCurrentInput('-');
      } else if (e.key === 'Backspace') {
        backspace();
      } else if (e.key === 'Enter') {
        addValue();
      } else if (e.key === 'Escape') {
        clearAll();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentInput]);

  const updateCurrentInput = (value) => {
    setCurrentInput(value);
    setDisplay(value);
  };

  const backspace = () => {
    if (currentInput.length > 0) {
      updateCurrentInput(currentInput.slice(0, -1));
    }
  };

  const clearAll = () => {
    setDataList([]);
    setCurrentInput('');
    setDisplay('');
    setError(null);
    setResults({
      mean: null,
      median: null,
      mode: null,
      stdDev: null,
      variance: null,
      min: null,
      max: null,
      sum: null,
      count: 0,
      range: null,
      q1: null,
      q3: null,
      iqr: null,
      skewness: null,
      kurtosis: null
    });
    
    if (isComparing) {
      setCompareDataList([]);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    // Only allow valid numerical input with optional decimal point and negative sign
    if (value === '' || value === '-' || /^-?\d*\.?\d*$/.test(value)) {
      updateCurrentInput(value);
    }
  };

  const addValue = () => {
    if (currentInput === '' || currentInput === '-' || currentInput === '.') {
      setError('Please enter a valid number');
      return;
    }

    try {
      const num = parseFloat(currentInput);
      const targetList = isComparing ? compareDataList : dataList;
      const newList = [...targetList, num];
      
      if (isComparing) {
        setCompareDataList(newList);
      } else {
        setDataList(newList);
      }
      
      setCurrentInput('');
      calculateStatistics(newList, isComparing);
    } catch (e) {
      setError('Invalid number format');
      console.error('Error adding value:', e);
    }
  };

  const removeLastValue = () => {
    const targetList = isComparing ? compareDataList : dataList;
    
    if (targetList.length > 0) {
      const newList = [...targetList];
      newList.pop();
      
      if (isComparing) {
        setCompareDataList(newList);
      } else {
        setDataList(newList);
      }
      
      calculateStatistics(newList, isComparing);
    }
  };

  const calculateStatistics = (data, isComparison = false) => {
    if (data.length === 0) {
      const emptyResults = {
        mean: null,
        median: null,
        mode: null,
        stdDev: null,
        variance: null,
        min: null,
        max: null,
        sum: null,
        count: 0,
        range: null,
        q1: null,
        q3: null,
        iqr: null,
        skewness: null,
        kurtosis: null
      };
      
      setResults(prev => isComparison ? { ...prev, comparison: emptyResults } : emptyResults);
      return;
    }

    try {
      // Basic statistics
      const count = data.length;
      const sum = data.reduce((acc, val) => acc + val, 0);
      const mean = sum / count;
      const min = Math.min(...data);
      const max = Math.max(...data);
      const range = max - min;
      
      // Sort data for median and quartiles
      const sortedData = [...data].sort((a, b) => a - b);
      const middle = Math.floor(sortedData.length / 2);
      
      // Median
      const median = sortedData.length % 2 === 0 ? 
        (sortedData[middle - 1] + sortedData[middle]) / 2 : 
        sortedData[middle];
      
      // Quartiles
      const lowerHalf = sortedData.slice(0, middle);
      const upperHalf = sortedData.length % 2 === 0 ? 
        sortedData.slice(middle) : 
        sortedData.slice(middle + 1);
      
      const q1Index = Math.floor(lowerHalf.length / 2);
      const q3Index = Math.floor(upperHalf.length / 2);
      
      const q1 = lowerHalf.length % 2 === 0 ? 
        (lowerHalf[q1Index - 1] + lowerHalf[q1Index]) / 2 : 
        lowerHalf[q1Index];
      
      const q3 = upperHalf.length % 2 === 0 ? 
        (upperHalf[q3Index - 1] + upperHalf[q3Index]) / 2 : 
        upperHalf[q3Index];
      
      const iqr = q3 - q1;
      
      // Standard deviation and variance
      const squaredDiffs = data.map(value => Math.pow(value - mean, 2));
      const variance = squaredDiffs.reduce((acc, val) => acc + val, 0) / count;
      const stdDev = Math.sqrt(variance);
      
      // Advanced statistics
      // Skewness (Pearson's moment coefficient of skewness)
      const cubedDiffs = data.map(value => Math.pow(value - mean, 3));
      const cubedDiffMean = cubedDiffs.reduce((acc, val) => acc + val, 0) / count;
      const skewness = stdDev > 0 ? cubedDiffMean / Math.pow(stdDev, 3) : 0;
      
      // Kurtosis
      const fourthPowerDiffs = data.map(value => Math.pow(value - mean, 4));
      const fourthPowerMean = fourthPowerDiffs.reduce((acc, val) => acc + val, 0) / count;
      const kurtosis = stdDev > 0 ? fourthPowerMean / Math.pow(variance, 2) - 3 : 0; // Excess kurtosis (normal = 0)
      
      // Calculate mode
      const frequency = {};
      let maxFreq = 0;
      let modes = [];
      
      data.forEach(value => {
        frequency[value] = (frequency[value] || 0) + 1;
        if (frequency[value] > maxFreq) {
          maxFreq = frequency[value];
          modes = [value];
        } else if (frequency[value] === maxFreq) {
          modes.push(value);
        }
      });
      
      const mode = maxFreq === 1 ? 'No mode' : modes.join(', ');

      const newResults = {
        mean: formatNumber(mean),
        median: formatNumber(median),
        mode: mode,
        stdDev: formatNumber(stdDev),
        variance: formatNumber(variance),
        min: formatNumber(min),
        max: formatNumber(max),
        sum: formatNumber(sum),
        count,
        range: formatNumber(range),
        q1: formatNumber(q1),
        q3: formatNumber(q3),
        iqr: formatNumber(iqr),
        skewness: formatNumber(skewness),
        kurtosis: formatNumber(kurtosis)
      };
      
      if (isComparison) {
        setResults(prev => ({ ...prev, comparison: newResults }));
      } else {
        setResults(newResults);
        
        // Add to history
        const statsText = `Data points: ${count}\nMean: ${formatNumber(mean)}\nMedian: ${formatNumber(median)}\nStd Dev: ${formatNumber(stdDev)}`;
        addToHistory(statsText);
      }
    } catch (e) {
      setError('Error calculating statistics');
      console.error('Statistics calculation error:', e);
    }
  };

  const formatNumber = (num) => {
    if (num === null || num === undefined || isNaN(num)) return 'N/A';
    return Number.isInteger(num) ? 
      num.toString() : 
      parseFloat(num.toFixed(6)).toString();
  };

  const sortData = () => {
    if (isComparing && compareDataList.length > 0) {
      const sortedData = [...compareDataList].sort((a, b) => a - b);
      setCompareDataList(sortedData);
    } else if (dataList.length > 0) {
      const sortedData = [...dataList].sort((a, b) => a - b);
      setDataList(sortedData);
    }
  };

  const importData = () => {
    try {
      const input = prompt("Enter comma-separated values (e.g., 1.2, 3.4, 5.6):");
      if (!input) return;
      
      const values = input.split(',')
        .map(v => v.trim())
        .filter(v => v && !isNaN(parseFloat(v)))
        .map(v => parseFloat(v));
      
      if (values.length === 0) {
        setError('No valid numbers found');
        return;
      }
      
      if (isComparing) {
        setCompareDataList(values);
        calculateStatistics(values, true);
      } else {
        setDataList(values);
        calculateStatistics(values);
      }
    } catch (e) {
      setError('Error importing data');
    }
  };

  const toggleComparison = () => {
    setIsComparing(!isComparing);
  };

  const clearComparison = () => {
    setCompareDataList([]);
    setResults(prev => ({ ...prev, comparison: null }));
  };

  const generateRandomData = () => {
    try {
      const count = parseInt(prompt("Enter number of random values to generate (1-100):", "10")) || 10;
      const min = parseInt(prompt("Enter minimum value:", "1")) || 1;
      const max = parseInt(prompt("Enter maximum value:", "100")) || 100;
      
      if (count < 1 || count > 100) {
        setError('Please enter a number between 1 and 100');
        return;
      }
      
      const randomValues = Array.from({ length: count }, () => 
        Math.floor(Math.random() * (max - min + 1)) + min
      );
      
      if (isComparing) {
        setCompareDataList(randomValues);
        calculateStatistics(randomValues, true);
      } else {
        setDataList(randomValues);
        calculateStatistics(randomValues);
      }
    } catch (e) {
      setError('Error generating random data');
    }
  };

  return (
    <div className="statistics-calculator">
      <div className="statistics-display">
        {error && <div className="error-message">{error}</div>}
        
        <div className="data-tools">
          <button className="tool-btn" onClick={importData}>Import Data</button>
          <button className="tool-btn" onClick={generateRandomData}>Random Data</button>
          <button 
            className={`tool-btn ${isComparing ? 'active-tool' : ''}`} 
            onClick={toggleComparison}
          >
            {isComparing ? 'Editing Set B' : 'Edit Set A'}
          </button>
          {isComparing && 
            <button className="tool-btn" onClick={clearComparison}>Clear Set B</button>
          }
        </div>
        
        <div className="data-input-section">
          <input
            type="text"
            className="data-input"
            value={currentInput}
            onChange={handleInputChange}
            placeholder={`Enter a number for Set ${isComparing ? 'B' : 'A'}...`}
          />
          <button className="add-value-btn" onClick={addValue}>Add Value</button>
          <button className="remove-value-btn" onClick={removeLastValue}>Remove Last</button>
        </div>

        <div className="data-list-container">
          <div className="data-list-header">
            <h3>Data Points {isComparing ? 'Set B' : 'Set A'}: {isComparing ? compareDataList.length : dataList.length}</h3>
            <button className="sort-btn" onClick={sortData}>Sort</button>
          </div>
          <div className="data-list">
            {(isComparing ? compareDataList : dataList).map((value, index) => (
              <span key={index} className="data-point">{value}</span>
            ))}
            {(isComparing ? compareDataList : dataList).length === 0 && 
              <span className="empty-msg">No data points yet. Add some values!</span>
            }
          </div>
        </div>

        <div className="stats-tabs">
          <button 
            className={`tab-btn ${activeTab === 'basic' ? 'active-tab' : ''}`}
            onClick={() => setActiveTab('basic')}
          >
            Basic Stats
          </button>
          <button 
            className={`tab-btn ${activeTab === 'advanced' ? 'active-tab' : ''}`}
            onClick={() => setActiveTab('advanced')}
          >
            Advanced Stats
          </button>
          {isComparing && results.comparison && 
            <button 
              className={`tab-btn ${activeTab === 'comparison' ? 'active-tab' : ''}`}
              onClick={() => setActiveTab('comparison')}
            >
              Comparison
            </button>
          }
        </div>

        {activeTab === 'basic' && (
          <div className="statistics-results">
            <div className="result-item">
              <span className="result-label">Mean:</span>
              <span className="result-value">{results.mean}</span>
            </div>
            <div className="result-item">
              <span className="result-label">Median:</span>
              <span className="result-value">{results.median}</span>
            </div>
            <div className="result-item">
              <span className="result-label">Mode:</span>
              <span className="result-value">{results.mode}</span>
            </div>
            <div className="result-item">
              <span className="result-label">Range:</span>
              <span className="result-value">{results.range}</span>
            </div>
            <div className="result-item">
              <span className="result-label">Sum:</span>
              <span className="result-value">{results.sum}</span>
            </div>
            <div className="result-item">
              <span className="result-label">Count:</span>
              <span className="result-value">{results.count}</span>
            </div>
            <div className="result-item">
              <span className="result-label">Min:</span>
              <span className="result-value">{results.min}</span>
            </div>
            <div className="result-item">
              <span className="result-label">Max:</span>
              <span className="result-value">{results.max}</span>
            </div>
            <div className="result-item">
              <span className="result-label">Std. Deviation:</span>
              <span className="result-value">{results.stdDev}</span>
            </div>
            <div className="result-item">
              <span className="result-label">Variance:</span>
              <span className="result-value">{results.variance}</span>
            </div>
          </div>
        )}

        {activeTab === 'advanced' && (
          <div className="statistics-results">
            <div className="result-item">
              <span className="result-label">Q1 (First Quartile):</span>
              <span className="result-value">{results.q1}</span>
            </div>
            <div className="result-item">
              <span className="result-label">Q3 (Third Quartile):</span>
              <span className="result-value">{results.q3}</span>
            </div>
            <div className="result-item">
              <span className="result-label">IQR:</span>
              <span className="result-value">{results.iqr}</span>
            </div>
            <div className="result-item">
              <span className="result-label">Skewness:</span>
              <span className="result-value">{results.skewness}</span>
            </div>
            <div className="result-item">
              <span className="result-label">Kurtosis (Excess):</span>
              <span className="result-value">{results.kurtosis}</span>
            </div>
          </div>
        )}

        {activeTab === 'comparison' && results.comparison && (
          <div className="comparison-results">
            <div className="comparison-table">
              <div className="comparison-header">
                <div className="metric-label">Metric</div>
                <div className="set-a">Set A</div>
                <div className="set-b">Set B</div>
                <div className="difference">Difference</div>
              </div>
              
              <div className="comparison-row">
                <div className="metric-label">Count</div>
                <div className="set-a">{results.count}</div>
                <div className="set-b">{results.comparison.count}</div>
                <div className="difference">{results.count - results.comparison.count}</div>
              </div>
              
              <div className="comparison-row">
                <div className="metric-label">Mean</div>
                <div className="set-a">{results.mean}</div>
                <div className="set-b">{results.comparison.mean}</div>
                <div className="difference">
                  {formatNumber(parseFloat(results.mean) - parseFloat(results.comparison.mean))}
                </div>
              </div>
              
              <div className="comparison-row">
                <div className="metric-label">Median</div>
                <div className="set-a">{results.median}</div>
                <div className="set-b">{results.comparison.median}</div>
                <div className="difference">
                  {formatNumber(parseFloat(results.median) - parseFloat(results.comparison.median))}
                </div>
              </div>
              
              <div className="comparison-row">
                <div className="metric-label">Std. Deviation</div>
                <div className="set-a">{results.stdDev}</div>
                <div className="set-b">{results.comparison.stdDev}</div>
                <div className="difference">
                  {formatNumber(parseFloat(results.stdDev) - parseFloat(results.comparison.stdDev))}
                </div>
              </div>
              
              <div className="comparison-row">
                <div className="metric-label">Variance</div>
                <div className="set-a">{results.variance}</div>
                <div className="set-b">{results.comparison.variance}</div>
                <div className="difference">
                  {formatNumber(parseFloat(results.variance) - parseFloat(results.comparison.variance))}
                </div>
              </div>
              
              <div className="comparison-row">
                <div className="metric-label">Range</div>
                <div className="set-a">{results.range}</div>
                <div className="set-b">{results.comparison.range}</div>
                <div className="difference">
                  {formatNumber(parseFloat(results.range) - parseFloat(results.comparison.range))}
                </div>
              </div>
              
              <div className="comparison-row">
                <div className="metric-label">Min</div>
                <div className="set-a">{results.min}</div>
                <div className="set-b">{results.comparison.min}</div>
                <div className="difference">
                  {formatNumber(parseFloat(results.min) - parseFloat(results.comparison.min))}
                </div>
              </div>
              
              <div className="comparison-row">
                <div className="metric-label">Max</div>
                <div className="set-a">{results.max}</div>
                <div className="set-b">{results.comparison.max}</div>
                <div className="difference">
                  {formatNumber(parseFloat(results.max) - parseFloat(results.comparison.max))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="statistics-buttons">
        <div className="button-row">
          <button onClick={() => updateCurrentInput(currentInput + '7')}>7</button>
          <button onClick={() => updateCurrentInput(currentInput + '8')}>8</button>
          <button onClick={() => updateCurrentInput(currentInput + '9')}>9</button>
          <button className="function-btn" onClick={clearAll}>Clear All</button>
        </div>
        <div className="button-row">
          <button onClick={() => updateCurrentInput(currentInput + '4')}>4</button>
          <button onClick={() => updateCurrentInput(currentInput + '5')}>5</button>
          <button onClick={() => updateCurrentInput(currentInput + '6')}>6</button>
          <button className="function-btn" onClick={removeLastValue}>Remove Last</button>
        </div>
        <div className="button-row">
          <button onClick={() => updateCurrentInput(currentInput + '1')}>1</button>
          <button onClick={() => updateCurrentInput(currentInput + '2')}>2</button>
          <button onClick={() => updateCurrentInput(currentInput + '3')}>3</button>
          <button className="function-btn" onClick={sortData}>Sort Data</button>
        </div>
        <div className="button-row">
          <button onClick={() => updateCurrentInput(currentInput + '0')}>0</button>
          <button onClick={() => currentInput.includes('.') ? null : updateCurrentInput(currentInput + '.')}>.</button>
          <button onClick={() => currentInput === '' ? updateCurrentInput('-') : null}>+/-</button>
          <button className="function-btn calculate-btn" onClick={addValue}>Add</button>
        </div>
      </div>
    </div>
  );
};

export default StatisticsMode; 