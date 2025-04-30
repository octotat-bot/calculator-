import { useState, useEffect } from 'react';
import './ConverterMode.css';

const ConverterMode = ({ addToHistory }) => {
  const [conversionType, setConversionType] = useState('length');
  const [fromUnit, setFromUnit] = useState('');
  const [toUnit, setToUnit] = useState('');
  const [fromValue, setFromValue] = useState('');
  const [toValue, setToValue] = useState('');
  const [exchangeRates, setExchangeRates] = useState({});
  const [currencyList, setCurrencyList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState('');

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
    currency: []
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
    }
  };

  // Initialize default units based on conversion type
  useEffect(() => {
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

  return (
    <div className="converter-calculator">
      <div className="conversion-type-select">
        <label htmlFor="conversion-type">Conversion Type:</label>
        <select 
          id="conversion-type" 
          value={conversionType} 
          onChange={(e) => setConversionType(e.target.value)}
        >
          <option value="length">Length</option>
          <option value="mass">Mass / Weight</option>
          <option value="temperature">Temperature</option>
          <option value="volume">Volume</option>
          <option value="area">Area</option>
          <option value="time">Time</option>
          <option value="speed">Speed</option>
          <option value="currency">Currency</option>
        </select>
      </div>
      
      <div className="converter-content">
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
        
        <div className="conversion-formula">
          {fromValue && toValue && (
            <div className="formula-container">
              <h3>Conversion Details:</h3>
              <p>{`${fromValue} ${fromUnit} = ${toValue} ${toUnit}`}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConverterMode; 