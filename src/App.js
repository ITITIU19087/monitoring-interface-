import React from 'react';
import OrderChart from './OrderChart';
import CandlestickChart from './CandlestickChart';
import NewOrderChart from './NewOrderBarChart';

function App() {
  return (
    <div className="App">
      {/* <CandlestickChart /> */}
      <NewOrderChart/>
    </div>
  );
}

export default App;
