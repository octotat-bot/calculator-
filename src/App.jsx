import { useState, useEffect } from 'react'
import './App.css'
import Calculator from './components/calculator/Calculator'
import ScientificMode from './components/scientific/ScientificMode'
import AlgebraMode from './components/algebra/AlgebraMode'
import MatrixMode from './components/matrix/MatrixMode'
import GraphMode from './components/graph/GraphMode'
import CalculusMode from './components/calculus/CalculusMode'
import ConverterMode from './components/converter/ConverterMode'
import VectorsMode from './components/vectors/VectorsMode'
import History from './components/calculator/History'

function App() {
  const [mode, setMode] = useState('basic')
  const [history, setHistory] = useState([])
  const [showHistory, setShowHistory] = useState(false)
  
  useEffect(() => {
    // Apply dark theme by default
    document.documentElement.className = '';
  }, []);

  const addToHistory = (calculation) => {
    setHistory(prev => [...prev, calculation])
  }

  return (
    <div className="calculator-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>Calculator</h2>
        </div>
        <div className="mode-selector">
          <button 
            className={mode === 'basic' ? 'active' : ''} 
            onClick={() => setMode('basic')}
            aria-label="Basic mode"
          >
            <i>🧮</i> Basic
          </button>
          <button 
            className={mode === 'scientific' ? 'active' : ''} 
            onClick={() => setMode('scientific')}
            aria-label="Scientific mode"
          >
            <i>🔬</i> Scientific
          </button>
          <button 
            className={mode === 'algebra' ? 'active' : ''} 
            onClick={() => setMode('algebra')}
            aria-label="Algebra mode"
          >
            <i>📊</i> Algebra
          </button>
          <button 
            className={mode === 'matrix' ? 'active' : ''} 
            onClick={() => setMode('matrix')}
            aria-label="Matrix mode"
          >
            <i>🔢</i> Matrix
          </button>
          <button 
            className={mode === 'graph' ? 'active' : ''} 
            onClick={() => setMode('graph')}
            aria-label="Graph mode"
          >
            <i>📈</i> Graph
          </button>
          <button 
            className={mode === 'calculus' ? 'active' : ''} 
            onClick={() => setMode('calculus')}
            aria-label="Calculus mode"
          >
            <i>∫</i> Calculus
          </button>
          <button 
            className={mode === 'vectors' ? 'active' : ''} 
            onClick={() => setMode('vectors')}
            aria-label="Vectors mode"
          >
            <i>↗️</i> Vectors & 3D
          </button>
          <button 
            className={mode === 'converter' ? 'active' : ''} 
            onClick={() => setMode('converter')}
            aria-label="Converter mode"
          >
            <i>🔄</i> Converter
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <header>
          <h1>Scientific Calculator</h1>
          <div className="controls">
            <button 
              onClick={() => setShowHistory(!showHistory)}
              aria-label={showHistory ? "Hide history" : "Show history"}
            >
              {showHistory ? 'Hide History' : 'Show History'}
            </button>
          </div>
        </header>

        <div className="calculator-content">
          <main className="fade-in">
            {mode === 'basic' && <Calculator addToHistory={addToHistory} />}
            {mode === 'scientific' && <ScientificMode addToHistory={addToHistory} />}
            {mode === 'algebra' && <AlgebraMode addToHistory={addToHistory} />}
            {mode === 'matrix' && <MatrixMode addToHistory={addToHistory} />}
            {mode === 'graph' && <GraphMode addToHistory={addToHistory} />}
            {mode === 'calculus' && <CalculusMode addToHistory={addToHistory} />}
            {mode === 'vectors' && <VectorsMode addToHistory={addToHistory} />}
            {mode === 'converter' && <ConverterMode addToHistory={addToHistory} />}
          </main>
          
          {showHistory && <History history={history} />}
        </div>
      </div>
    </div>
  )
}

export default App
