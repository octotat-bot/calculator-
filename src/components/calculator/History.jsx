import './History.css';

const History = ({ history }) => {
  const handleItemClick = (item) => {
    // Extract the result part (after the equals sign)
    if (item.includes('=')) {
      const result = item.split('=')[1].trim();
      
      // Create a temporary input element
      const tempInput = document.createElement('input');
      tempInput.value = result;
      document.body.appendChild(tempInput);
      
      // Select and copy the text
      tempInput.select();
      document.execCommand('copy');
      
      // Remove the temporary element
      document.body.removeChild(tempInput);
      
      // Visual feedback
      const el = document.getElementById(`history-item-${item.replace(/[^a-zA-Z0-9]/g, '')}`);
      if (el) {
        el.classList.add('copied');
        setTimeout(() => el.classList.remove('copied'), 1000);
      }
    }
  };

  return (
    <div className="history-panel">
      <h3>History</h3>
      {history.length === 0 ? (
        <p className="empty-history">No calculations yet</p>
      ) : (
        <ul className="history-list">
          {history.map((item, index) => (
            <li 
              id={`history-item-${item.replace(/[^a-zA-Z0-9]/g, '')}`}
              key={index} 
              className="history-item"
              onClick={() => handleItemClick(item)}
              title="Click to copy result"
            >
              {item}
              <span className="copy-tooltip">Copied!</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default History; 