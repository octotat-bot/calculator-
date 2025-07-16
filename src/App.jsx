import { useState } from 'react'
import './App.css'
import Calculator from './components/calculator/Calculator'
import ScientificMode from './components/scientific/ScientificMode'
import AlgebraMode from './components/algebra/AlgebraMode'
import MatrixMode from './components/matrix/MatrixMode'
import GraphMode from './components/graph/GraphMode'
import CalculusMode from './components/calculus/CalculusMode'
import ConverterMode from './components/converter/ConverterMode'
import VectorsMode from './components/vectors/VectorsMode'
import ComplexMode from './components/complex/ComplexMode'
import InequalityMode from './components/inequality/InequalityMode'
import StatisticsMode from './components/statistics/StatisticsMode'
import History from './components/calculator/History'

function App() {
  const [mode, setMode] = useState('basic')
  const [history, setHistory] = useState([])

  const addToHistory = (calculation) => {
    setHistory(prev => [...prev, calculation])
  }

  // Function to get the title based on the current mode
  const getModeTitleText = () => {
    switch(mode) {
      case 'basic': return 'Basic Calculator';
      case 'scientific': return 'Scientific Calculator';
      case 'complex': return 'Complex Numbers Calculator';
      case 'inequality': return 'Inequality Solver';
      case 'algebra': return 'Algebra Calculator';
      case 'matrix': return 'Matrix Calculator';
      case 'graph': return 'Graphing Calculator';
      case 'calculus': return 'Calculus Tools';
      case 'vectors': return 'Vectors & 3D Calculator';
      case 'converter': return 'Unit Converter';
      case 'statistics': return 'Statistics Calculator';
      default: return 'Scientific Calculator';
    }
  };

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
            className={mode === 'complex' ? 'active' : ''} 
            onClick={() => setMode('complex')}
            aria-label="Complex Numbers mode"
          >
            <i>ℂ</i> Complex
          </button>
          <button 
            className={mode === 'inequality' ? 'active' : ''} 
            onClick={() => setMode('inequality')}
            aria-label="Inequality mode"
          >
            <i>≤</i> Inequality
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
            className={mode === 'statistics' ? 'active' : ''} 
            onClick={() => setMode('statistics')}
            aria-label="Statistics mode"
          >
            <i>📊</i> Statistics
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
          <h1>{getModeTitleText()}</h1>
        </header>

        <div className="calculator-content">
          <div className="calculator-layout">
            <main className="fade-in">
              {mode === 'basic' && <Calculator addToHistory={addToHistory} />}
              {mode === 'scientific' && <ScientificMode addToHistory={addToHistory} />}
              {mode === 'complex' && <ComplexMode addToHistory={addToHistory} />}
              {mode === 'inequality' && <InequalityMode addToHistory={addToHistory} />}
              {mode === 'algebra' && <AlgebraMode addToHistory={addToHistory} />}
              {mode === 'matrix' && <MatrixMode addToHistory={addToHistory} />}
              {mode === 'graph' && <GraphMode addToHistory={addToHistory} />}
              {mode === 'calculus' && <CalculusMode addToHistory={addToHistory} />}
              {mode === 'vectors' && <VectorsMode addToHistory={addToHistory} />}
              {mode === 'statistics' && <StatisticsMode addToHistory={addToHistory} />}
              {mode === 'converter' && <ConverterMode addToHistory={addToHistory} />}
            </main>
            
            <History history={history} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
