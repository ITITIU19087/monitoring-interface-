import React from 'react';
import OrderChart from './OrderChart2';
import CandlestickChart from './CandlestickChart';
import Clear from './Clear';

function App() {
  return (
    <div className="App">
      <CandlestickChart />
      <Clear/>
      <OrderChart/>
    </div>
  );
}

export default App;
