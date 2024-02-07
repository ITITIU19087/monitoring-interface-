import React from 'react';
import OrderChart from './OrderChart';
import CandlestickChart from './CandlestickChart';

function App() {
  return (
    <div className="App">
      <CandlestickChart />
      <OrderChart/>
    </div>
  );
}

export default App;
