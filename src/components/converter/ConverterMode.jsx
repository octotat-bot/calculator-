import { useState, useEffect } from 'react';
import './ConverterMode.css';

const ConverterMode = ({ addToHistory }) => {
  const [conversionType, setConversionType] = useState('');
  const [fromUnit, setFromUnit] = useState('');
  const [toUnit, setToUnit] = useState('');
  const [fromValue, setFromValue] = useState('');
  const [toValue, setToValue] = useState('');
  const [exchangeRates, setExchangeRates] = useState({});
  const [currencyList, setCurrencyList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState('');
  const [selectionMode, setSelectionMode] = useState(true);

  // Conversion types with icons
  const conversionTypes = [
    { id: 'length', label: 'Length', icon: '📏' },
    { id: 'mass', label: 'Mass / Weight', icon: '⚖️' },
    { id: 'temperature', label: 'Temperature', icon: '🌡️' },
    { id: 'volume', label: 'Volume', icon: '🧪' },
    { id: 'area', label: 'Area', icon: '📐' },
    { id: 'time', label: 'Time', icon: '⏱️' },
    { id: 'speed', label: 'Speed', icon: '🚀' },
    { id: 'currency', label: 'Currency', icon: '💰' },
    { id: 'gst', label: 'GST Calculator', icon: '🧾' },
    { id: 'data', label: 'Data Units', icon: '💾' },
    { id: 'numeral', label: 'Numeral Systems', icon: '🔢' },
    { id: 'bmi', label: 'BMI Calculator', icon: '👤' }
  ];

  // Conversion units by type
  const conversionUnits = {
    length: [
      { value: 'mm', label: 'Millimeters (mm)' },
      { value: 'cm', label: 'Centimeters (cm)' },
      { value: 'm', label: 'Meters (m)' },
      { value: 'km', label: 'Kilometers (km)' },
      { value: 'in', label: 'Inches (in)' },
      { value: 'ft', label: 'Feet (ft)' },
      { value: 'yd', label: 'Yards (yd)' },
      { value: 'mi', label: 'Miles (mi)' }
    ],
    mass: [
      { value: 'mg', label: 'Milligrams (mg)' },
      { value: 'g', label: 'Grams (g)' },
      { value: 'kg', label: 'Kilograms (kg)' },
      { value: 'oz', label: 'Ounces (oz)' },
      { value: 'lb', label: 'Pounds (lb)' },
      { value: 't', label: 'Metric Tons (t)' }
    ],
    temperature: [
      { value: 'c', label: 'Celsius (°C)' },
      { value: 'f', label: 'Fahrenheit (°F)' },
      { value: 'k', label: 'Kelvin (K)' }
    ],
    volume: [
      { value: 'ml', label: 'Milliliters (ml)' },
      { value: 'l', label: 'Liters (l)' },
      { value: 'cu-cm', label: 'Cubic Centimeters (cm³)' },
      { value: 'cu-m', label: 'Cubic Meters (m³)' },
      { value: 'fl-oz', label: 'Fluid Ounces (fl oz)' },
      { value: 'gal', label: 'Gallons (gal)' },
      { value: 'pt', label: 'Pints (pt)' },
      { value: 'qt', label: 'Quarts (qt)' }
    ],
    area: [
      { value: 'sq-mm', label: 'Square Millimeters (mm²)' },
      { value: 'sq-cm', label: 'Square Centimeters (cm²)' },
      { value: 'sq-m', label: 'Square Meters (m²)' },
      { value: 'hectare', label: 'Hectares (ha)' },
      { value: 'sq-km', label: 'Square Kilometers (km²)' },
      { value: 'sq-in', label: 'Square Inches (in²)' },
      { value: 'sq-ft', label: 'Square Feet (ft²)' },
      { value: 'acre', label: 'Acres (ac)' },
      { value: 'sq-mi', label: 'Square Miles (mi²)' }
    ],
    time: [
      { value: 'ms', label: 'Milliseconds (ms)' },
      { value: 's', label: 'Seconds (s)' },
      { value: 'min', label: 'Minutes (min)' },
      { value: 'h', label: 'Hours (h)' },
      { value: 'd', label: 'Days (d)' },
      { value: 'w', label: 'Weeks (w)' },
      { value: 'mo', label: 'Months (mo)' },
      { value: 'y', label: 'Years (y)' }
    ],
    speed: [
      { value: 'm/s', label: 'Meters per second (m/s)' },
      { value: 'km/h', label: 'Kilometers per hour (km/h)' },
      { value: 'mph', label: 'Miles per hour (mph)' },
      { value: 'knot', label: 'Knots (kn)' }
    ],
    currency: [],
    gst: [
      { value: 'add', label: 'Add GST to Amount' },
      { value: 'remove', label: 'Remove GST from Amount' },
      { value: 'calculate', label: 'Calculate GST Amount' }
    ],
    data: [
      { value: 'b', label: 'Bytes (B)' },
      { value: 'kb', label: 'Kilobytes (KB)' },
      { value: 'mb', label: 'Megabytes (MB)' },
      { value: 'gb', label: 'Gigabytes (GB)' },
      { value: 'tb', label: 'Terabytes (TB)' },
      { value: 'pb', label: 'Petabytes (PB)' },
      { value: 'kib', label: 'Kibibytes (KiB)' },
      { value: 'mib', label: 'Mebibytes (MiB)' },
      { value: 'gib', label: 'Gibibytes (GiB)' },
      { value: 'tib', label: 'Tebibytes (TiB)' }
    ],
    numeral: [
      { value: 'dec', label: 'Decimal (Base 10)' },
      { value: 'bin', label: 'Binary (Base 2)' },
      { value: 'oct', label: 'Octal (Base 8)' },
      { value: 'hex', label: 'Hexadecimal (Base 16)' }
    ],
    bmi: [
      { value: 'metric', label: 'Metric (kg, cm)' },
      { value: 'imperial', label: 'Imperial (lb, in)' }
    ]
  };

  // Conversion factors
  const conversionFactors = {
    // Length (to meters)
    length: {
      mm: 0.001,
      cm: 0.01,
      m: 1,
      km: 1000,
      in: 0.0254,
      ft: 0.3048,
      yd: 0.9144,
      mi: 1609.344
    },
    // Mass (to grams)
    mass: {
      mg: 0.001,
      g: 1,
      kg: 1000,
      oz: 28.3495,
      lb: 453.592,
      t: 1000000
    },
    // Volume (to liters)
    volume: {
      ml: 0.001,
      l: 1,
      'cu-cm': 0.001,
      'cu-m': 1000,
      'fl-oz': 0.0295735,
      gal: 3.78541,
      pt: 0.473176,
      qt: 0.946353
    },
    // Area (to square meters)
    area: {
      'sq-mm': 0.000001,
      'sq-cm': 0.0001,
      'sq-m': 1,
      hectare: 10000,
      'sq-km': 1000000,
      'sq-in': 0.00064516,
      'sq-ft': 0.092903,
      acre: 4046.86,
      'sq-mi': 2589988.11
    },
    // Time (to seconds)
    time: {
      ms: 0.001,
      s: 1,
      min: 60,
      h: 3600,
      d: 86400,
      w: 604800,
      mo: 2592000, // Using 30 days for simplicity
      y: 31536000 // Using 365 days for simplicity
    },
    // Speed (to meters per second)
    speed: {
      'm/s': 1,
      'km/h': 0.277778,
      mph: 0.44704,
      knot: 0.514444
    },
    // Data units (to bytes)
    data: {
      'b': 1,
      'kb': 1000,
      'mb': 1000000,
      'gb': 1000000000,
      'tb': 1000000000000,
      'pb': 1000000000000000,
      'kib': 1024,
      'mib': 1048576,
      'gib': 1073741824,
      'tib': 1099511627776
    }
  };

  // GST rates for different countries
  const gstRates = {
    'gst3': 3,
    'gst5': 5,
    'gst12': 12,
    'gst18': 18,
    'gst28': 28,
    'custom': 0
  };
  
  // State to handle special converter inputs
  const [gstRate, setGstRate] = useState(gstRates.gst18);
  const [gstCategory, setGstCategory] = useState('gst18');
  const [customGstRate, setCustomGstRate] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [bmiResult, setBmiResult] = useState('');

  // Handle conversion type selection
  const handleTypeSelect = (type) => {
    setConversionType(type);
    setSelectionMode(false);
    setFromValue('');
    setToValue('');
    setError('');
  };

  // Back to selection mode
  const handleBackToSelection = () => {
    setSelectionMode(true);
  };

  // Initialize default units based on conversion type
  useEffect(() => {
    if (!conversionType) return;
    
    if (conversionType === 'currency') {
      if (currencyList.length > 0) {
        setFromUnit('USD');
        setToUnit('EUR');
      }
    } else {
      const units = conversionUnits[conversionType];
      if (units && units.length > 0) {
        setFromUnit(units[0].value);
        setToUnit(units[1].value);
      }
    }
  }, [conversionType, currencyList]);

  // Fetch currency exchange rates
  useEffect(() => {
    const fetchExchangeRates = async () => {
      if (conversionType === 'currency') {
        setIsLoading(true);
        setError('');
        
        try {
          // Use real API with the provided API key - also try alternate endpoint that doesn't require base currency parameter
          const apiKey = '2d482bbf70094f679bbbf927a227bfa0';
          const response = await fetch(`https://openexchangerates.org/api/latest.json?app_id=${apiKey}&prettyprint=false`);
          const data = await response.json();
          
          if (data.error) {
            console.error('API Error:', data.error);
            throw new Error(data.description || 'Failed to fetch exchange rates');
          }
          
          if (!data.rates || Object.keys(data.rates).length === 0) {
            console.error('No rates data returned from API:', data);
            throw new Error('No exchange rate data available');
          }
          
          console.log('API response:', data);
          
          setExchangeRates(data.rates);
          setCurrencyList(Object.keys(data.rates).map(code => ({
            value: code,
            label: `${code} - ${getCurrencyName(code)}`
          })));
          
          if (data.timestamp) {
            setLastUpdated(new Date(data.timestamp * 1000).toLocaleDateString());
          } else {
            setLastUpdated(new Date().toLocaleDateString());
          }
          
        } catch (err) {
          console.error('Currency API error:', err);
          setError(`Failed to fetch exchange rates: ${err.message || 'Unknown error'}`);
          
          // Fallback to alternative API
          try {
            console.log('Trying alternative API...');
            const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
            const data = await response.json();
            
            if (data.rates) {
              setExchangeRates(data.rates);
              setCurrencyList(Object.keys(data.rates).map(code => ({
                value: code,
                label: `${code} - ${getCurrencyName(code)}`
              })));
              setLastUpdated(data.date || new Date().toLocaleDateString() + ' (Alternative API)');
              setError(''); // Clear error if alternative API works
              console.log('Using alternative API successfully');
            } else {
              throw new Error('Alternative API failed');
            }
          } catch (altErr) {
            console.error('Alternative API failed:', altErr);
            
            // Final fallback to mock data
            const mockData = {
              base: 'USD',
              date: new Date().toISOString().split('T')[0],
              rates: {
                USD: 1,
                EUR: 0.92,
                GBP: 0.79,
                JPY: 134.33,
                AUD: 1.48,
                CAD: 1.35,
                CHF: 0.90,
                CNY: 6.93,
                INR: 82.09,
                BRL: 4.97,
                MXN: 17.50,
                RUB: 77.50,
                KRW: 1337.22,
                TRY: 19.57,
                ZAR: 18.36
              }
            };
            
            setExchangeRates(mockData.rates);
            setCurrencyList(Object.keys(mockData.rates).map(code => ({
              value: code,
              label: `${code} - ${getCurrencyName(code)}`
            })));
            setLastUpdated(mockData.date + ' (Using fallback data)');
          }
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchExchangeRates();
  }, [conversionType]);

  // Get currency name from currency code
  const getCurrencyName = (code) => {
    const currencyNames = {
      USD: 'US Dollar',
      EUR: 'Euro',
      GBP: 'British Pound',
      JPY: 'Japanese Yen',
      AUD: 'Australian Dollar',
      CAD: 'Canadian Dollar',
      CHF: 'Swiss Franc',
      CNY: 'Chinese Yuan',
      INR: 'Indian Rupee',
      BRL: 'Brazilian Real',
      MXN: 'Mexican Peso',
      RUB: 'Russian Ruble',
      KRW: 'South Korean Won',
      TRY: 'Turkish Lira',
      ZAR: 'South African Rand'
    };
    
    return currencyNames[code] || code;
  };

  // Perform conversion when input changes
  useEffect(() => {
    if (fromValue && fromUnit && toUnit) {
      convert();
    }
  }, [fromValue, fromUnit, toUnit, conversionType]);

  // Swap units
  const swapUnits = () => {
    const tempUnit = fromUnit;
    setFromUnit(toUnit);
    setToUnit(tempUnit);
    
    if (fromValue) {
      const tempValue = fromValue;
      setFromValue(toValue);
      setToValue(tempValue);
    }
  };

  // Perform conversion
  const convert = () => {
    if (conversionType === 'bmi') {
      calculateBMI();
      return;
    }
    
    if (!fromValue || fromValue === '' || isNaN(parseFloat(fromValue))) {
      setToValue('');
      return;
    }

    const value = parseFloat(fromValue);
    let result;

    try {
      if (conversionType === 'temperature') {
        // Special case for temperature conversion
        result = convertTemperature(value, fromUnit, toUnit);
      } else if (conversionType === 'currency') {
        // Currency conversion
        if (exchangeRates && exchangeRates[fromUnit] && exchangeRates[toUnit]) {
          // Convert to USD first, then to target currency
          const valueInUSD = value / exchangeRates[fromUnit];
          result = valueInUSD * exchangeRates[toUnit];
        } else {
          throw new Error('Exchange rates not available.');
        }
      } else if (conversionType === 'gst') {
        // GST calculation
        result = calculateGST(value, fromUnit);
      } else if (conversionType === 'numeral') {
        // Numeral system conversion
        result = convertNumeralSystem(value, fromUnit, toUnit);
      } else if (conversionType === 'data') {
        // Data unit conversion
        const factors = conversionFactors[conversionType];
        if (factors && factors[fromUnit] !== undefined && factors[toUnit] !== undefined) {
          // Convert to base unit (bytes), then to target unit
          const valueInBytes = value * factors[fromUnit];
          result = valueInBytes / factors[toUnit];
        } else {
          throw new Error('Conversion factors not available.');
        }
      } else {
        // Standard unit conversion
        const factors = conversionFactors[conversionType];
        if (factors && factors[fromUnit] !== undefined && factors[toUnit] !== undefined) {
          // Convert to base unit, then to target unit
          const valueInBaseUnit = value * factors[fromUnit];
          result = valueInBaseUnit / factors[toUnit];
        } else {
          throw new Error('Conversion factors not available.');
        }
      }

      // Format the result
      setToValue(formatResult(result));
      
      // Add to history
      const historyEntry = `${value} ${fromUnit} = ${formatResult(result)} ${toUnit}`;
      addToHistory(historyEntry);
      
    } catch (err) {
      setError(err.message);
      setToValue('');
    }
  };

  // Special case for temperature conversion
  const convertTemperature = (value, from, to) => {
    let celsius;
    
    // Convert input to Celsius
    if (from === 'c') {
      celsius = value;
    } else if (from === 'f') {
      celsius = (value - 32) * 5/9;
    } else if (from === 'k') {
      celsius = value - 273.15;
    }
    
    // Convert Celsius to output unit
    if (to === 'c') {
      return celsius;
    } else if (to === 'f') {
      return celsius * 9/5 + 32;
    } else if (to === 'k') {
      return celsius + 273.15;
    }
  };

  // Format result to appropriate number of decimal places
  const formatResult = (value) => {
    if (Math.abs(value) < 0.000001 || Math.abs(value) >= 1000000) {
      return value.toExponential(6);
    }
    
    // Round to appropriate number of decimal places
    const decimalPlaces = value % 1 === 0 ? 0 : 6;
    return value.toFixed(decimalPlaces).replace(/\.?0+$/, '');
  };

  // Get the conversion type label and icon
  const getConversionTypeInfo = () => {
    const type = conversionTypes.find(t => t.id === conversionType);
    return type ? { label: type.label, icon: type.icon } : { label: '', icon: '' };
  };

  // GST calculation
  const calculateGST = (value, operation) => {
    const rate = gstCategory === 'custom' ? customGstRate : gstRates[gstCategory];
    
    if (operation === 'add') {
      // Add GST to amount
      return value * (1 + rate/100);
    } else if (operation === 'remove') {
      // Remove/extract GST from amount
      return value / (1 + rate/100);
    } else if (operation === 'calculate') {
      // Calculate GST amount only
      return value * (rate/100);
    }
    
    throw new Error('Invalid GST operation');
  };
  
  // Numeral system conversion
  const convertNumeralSystem = (value, fromSystem, toSystem) => {
    let decimalValue;
    
    // First convert to decimal (base 10) if not already
    switch(fromSystem) {
      case 'dec':
        decimalValue = value;
        break;
      case 'bin':
        decimalValue = parseInt(value.toString(), 2);
        break;
      case 'oct':
        decimalValue = parseInt(value.toString(), 8);
        break;
      case 'hex':
        decimalValue = parseInt(value.toString(), 16);
        break;
      default:
        throw new Error('Unsupported numeral system');
    }
    
    // Then convert from decimal to target system
    switch(toSystem) {
      case 'dec':
        return decimalValue;
      case 'bin':
        return decimalValue.toString(2);
      case 'oct':
        return decimalValue.toString(8);
      case 'hex':
        return decimalValue.toString(16).toUpperCase();
      default:
        throw new Error('Unsupported numeral system');
    }
  };
  
  // BMI calculation
  const calculateBMI = () => {
    if (!height || !weight || isNaN(parseFloat(height)) || isNaN(parseFloat(weight))) {
      setBmiResult('');
      return;
    }
    
    const heightVal = parseFloat(height);
    const weightVal = parseFloat(weight);
    let bmi;
    
    if (fromUnit === 'metric') {
      // Metric: weight(kg) / height(m)²
      const heightInMeters = heightVal / 100; // convert cm to m
      bmi = weightVal / (heightInMeters * heightInMeters);
    } else {
      // Imperial: (weight(lb) * 703) / height(in)²
      bmi = (weightVal * 703) / (heightVal * heightVal);
    }
    
    let category = '';
    if (bmi < 18.5) {
      category = 'Underweight';
    } else if (bmi < 25) {
      category = 'Normal weight';
    } else if (bmi < 30) {
      category = 'Overweight';
    } else {
      category = 'Obesity';
    }
    
    setBmiResult(`${bmi.toFixed(1)} - ${category}`);
    
    // Add to history
    const historyEntry = `BMI Calculation: ${bmi.toFixed(1)} (${category})`;
    addToHistory(historyEntry);
  };

  return (
    <div className="converter-calculator">
      {selectionMode ? (
        <>
          <div className="selection-header">
            <h2>Choose Conversion Type</h2>
            <p>Select the type of conversion you want to perform</p>
          </div>
          <div className="conversion-type-cards">
            {conversionTypes.map(type => (
              <div 
                key={type.id}
                className="conversion-card"
                onClick={() => handleTypeSelect(type.id)}
              >
                <div className="conversion-card-icon">{type.icon}</div>
                <div className="conversion-card-title">{type.label}</div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="conversion-mode-header">
            <button className="back-to-selection" onClick={handleBackToSelection}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
              Back
            </button>
            <h2>
              <span className="conversion-header-icon">{getConversionTypeInfo().icon}</span>
              {getConversionTypeInfo().label}
            </h2>
          </div>
          
          <div className="converter-content">
            {conversionType === 'bmi' ? (
              // BMI Calculator
              <div className="bmi-calculator">
                <div className="bmi-units">
                  <label>Unit System:</label>
                  <div className="bmi-toggle">
                    <button 
                      className={fromUnit === 'metric' ? 'active' : ''} 
                      onClick={() => setFromUnit('metric')}
                    >
                      Metric (kg, cm)
                    </button>
                    <button 
                      className={fromUnit === 'imperial' ? 'active' : ''} 
                      onClick={() => setFromUnit('imperial')}
                    >
                      Imperial (lb, in)
                    </button>
                  </div>
                </div>
                
                <div className="bmi-inputs">
                  <div className="input-group">
                    <label>Height:</label>
                    <input
                      type="number"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      placeholder={fromUnit === 'metric' ? 'Height in cm' : 'Height in inches'}
                      className="value-input"
                    />
                    <span className="unit-label">{fromUnit === 'metric' ? 'cm' : 'in'}</span>
                  </div>
                  
                  <div className="input-group">
                    <label>Weight:</label>
                    <input
                      type="number"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder={fromUnit === 'metric' ? 'Weight in kg' : 'Weight in pounds'}
                      className="value-input"
                    />
                    <span className="unit-label">{fromUnit === 'metric' ? 'kg' : 'lb'}</span>
                  </div>
                </div>
                
                <button className="calculate-button" onClick={calculateBMI}>Calculate BMI</button>
                
                {bmiResult && (
                  <div className="bmi-result">
                    <h3>Your BMI:</h3>
                    <div className="bmi-value">{bmiResult}</div>
                    <div className="bmi-chart">
                      <div className="bmi-range underweight">
                        <span>Underweight</span>
                        <span>&lt;18.5</span>
                      </div>
                      <div className="bmi-range normal">
                        <span>Normal</span>
                        <span>18.5-24.9</span>
                      </div>
                      <div className="bmi-range overweight">
                        <span>Overweight</span>
                        <span>25-29.9</span>
                      </div>
                      <div className="bmi-range obese">
                        <span>Obesity</span>
                        <span>&gt;30</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : conversionType === 'gst' ? (
              // GST Calculator
              <div className="gst-calculator">
                <div className="gst-category-select">
                  <label>GST Rate:</label>
                  <div className="gst-rate-options">
                    <button 
                      className={gstCategory === 'gst3' ? 'active' : ''} 
                      onClick={() => setGstCategory('gst3')}
                    >
                      3%
                    </button>
                    <button 
                      className={gstCategory === 'gst5' ? 'active' : ''} 
                      onClick={() => setGstCategory('gst5')}
                    >
                      5%
                    </button>
                    <button 
                      className={gstCategory === 'gst12' ? 'active' : ''} 
                      onClick={() => setGstCategory('gst12')}
                    >
                      12%
                    </button>
                    <button 
                      className={gstCategory === 'gst18' ? 'active' : ''} 
                      onClick={() => setGstCategory('gst18')}
                    >
                      18%
                    </button>
                    <button 
                      className={gstCategory === 'gst28' ? 'active' : ''} 
                      onClick={() => setGstCategory('gst28')}
                    >
                      28%
                    </button>
                    <button 
                      className={gstCategory === 'custom' ? 'active' : ''} 
                      onClick={() => setGstCategory('custom')}
                    >
                      Custom
                    </button>
                  </div>
                </div>
                
                {gstCategory === 'custom' && (
                  <div className="custom-gst-rate">
                    <label>Custom GST Rate (%):</label>
                    <input 
                      type="number" 
                      value={customGstRate}
                      onChange={(e) => setCustomGstRate(e.target.value)}
                      className="value-input"
                      min="0"
                      max="100"
                      step="0.1"
                    />
                  </div>
                )}
                
                <div className="gst-operation">
                  <label>Operation:</label>
                  <select 
                    value={fromUnit}
                    onChange={(e) => setFromUnit(e.target.value)}
                    className="unit-select"
                  >
                    {conversionUnits.gst.map((unit) => (
                      <option key={unit.value} value={unit.value}>
                        {unit.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="input-group">
                  <label>Amount:</label>
                  <input
                    type="number"
                    value={fromValue}
                    onChange={(e) => setFromValue(e.target.value)}
                    placeholder="Enter amount"
                    className="value-input"
                  />
                </div>
                
                <button className="calculate-button" onClick={convert}>Calculate</button>
                
                {toValue && (
                  <div className="gst-result">
                    <div className="result-row">
                      <span>Original Amount:</span>
                      <span className="result-value">
                        {fromUnit === 'add' ? fromValue : 
                         fromUnit === 'remove' ? toValue : 
                         fromValue}
                      </span>
                    </div>
                    
                    <div className="result-row">
                      <span>GST Amount ({gstCategory === 'custom' ? customGstRate : gstRates[gstCategory]}%):</span>
                      <span className="result-value">
                        {fromUnit === 'calculate' ? toValue : 
                         fromUnit === 'add' ? (toValue - fromValue).toFixed(2) : 
                         (fromValue - toValue).toFixed(2)}
                      </span>
                    </div>
                    
                    <div className="result-row total">
                      <span>Total Amount:</span>
                      <span className="result-value">
                        {fromUnit === 'add' ? toValue : 
                         fromUnit === 'remove' ? fromValue : 
                         parseFloat(fromValue) + parseFloat(toValue)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : conversionType === 'numeral' ? (
              // Numeral System Converter
              <div className="numeral-calculator">
                <div className="input-group">
                  <label>From:</label>
                  <select 
                    value={fromUnit}
                    onChange={(e) => setFromUnit(e.target.value)}
                    className="unit-select"
                  >
                    {conversionUnits.numeral.map((unit) => (
                      <option key={unit.value} value={unit.value}>
                        {unit.label}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={fromValue}
                    onChange={(e) => setFromValue(e.target.value)}
                    placeholder="Enter number"
                    className="value-input"
                  />
                </div>
                
                <button className="swap-button" onClick={swapUnits}>
                  ⇄
                </button>
                
                <div className="input-group">
                  <label>To:</label>
                  <select 
                    value={toUnit}
                    onChange={(e) => setToUnit(e.target.value)}
                    className="unit-select"
                  >
                    {conversionUnits.numeral.map((unit) => (
                      <option key={unit.value} value={unit.value}>
                        {unit.label}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={toValue}
                    readOnly
                    className="value-input result"
                    placeholder="Result"
                  />
                </div>
                
                <button className="calculate-button" onClick={convert}>Convert</button>
                
                {fromValue && toValue && (
                  <div className="formula-container">
                    <h3>Conversion Details:</h3>
                    <p>{`${fromValue} (${fromUnit === 'dec' ? 'Decimal' : 
                          fromUnit === 'bin' ? 'Binary' : 
                          fromUnit === 'oct' ? 'Octal' : 'Hexadecimal'}) = ${toValue} (${
                          toUnit === 'dec' ? 'Decimal' : 
                          toUnit === 'bin' ? 'Binary' : 
                          toUnit === 'oct' ? 'Octal' : 'Hexadecimal'})`}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              // Standard converter UI
              <div className="converter-form">
                <div className="input-group">
                  <label htmlFor="from-value">From:</label>
                  <input
                    id="from-value"
                    type="number"
                    value={fromValue}
                    onChange={(e) => setFromValue(e.target.value)}
                    placeholder="Enter value"
                    className="value-input"
                    autoFocus
                  />
                  <select 
                    id="from-unit" 
                    value={fromUnit} 
                    onChange={(e) => setFromUnit(e.target.value)}
                    className="unit-select"
                  >
                    {(conversionType === 'currency' ? currencyList : conversionUnits[conversionType]).map((unit) => (
                      <option key={unit.value} value={unit.value}>
                        {unit.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <button className="swap-button" onClick={swapUnits} aria-label="Swap units">
                  ⇄
                </button>
                
                <div className="input-group">
                  <label htmlFor="to-value">To:</label>
                  <input
                    id="to-value"
                    type="text"
                    value={toValue}
                    readOnly
                    className="value-input result"
                    placeholder="Result"
                  />
                  <select 
                    id="to-unit" 
                    value={toUnit} 
                    onChange={(e) => setToUnit(e.target.value)}
                    className="unit-select"
                  >
                    {(conversionType === 'currency' ? currencyList : conversionUnits[conversionType]).map((unit) => (
                      <option key={unit.value} value={unit.value}>
                        {unit.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
            
            {isLoading && <div className="loading-indicator">Loading exchange rates...</div>}
            
            {error && <div className="error-message">{error}</div>}
            
            {conversionType === 'currency' && lastUpdated && (
              <div className="currency-info">
                <p>Exchange rates as of {lastUpdated}</p>
                {lastUpdated.includes('fallback') && (
                  <p className="note">Note: Using demonstration data. API connection failed.</p>
                )}
              </div>
            )}
            
            {!['bmi', 'gst', 'numeral'].includes(conversionType) && fromValue && toValue && (
              <div className="conversion-formula">
                <div className="formula-container">
                  <h3>Conversion Details:</h3>
                  <p>{`${fromValue} ${fromUnit} = ${toValue} ${toUnit}`}</p>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ConverterMode; 