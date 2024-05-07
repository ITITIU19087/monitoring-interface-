import React from 'react';

const Clear = () => {
  const handleClick = () => {
    // Clear localStorage
    localStorage.clear();
    // Optionally, notify the user
    alert('Local storage cleared!');
  };

  return (
    <button onClick={handleClick}>Clear Local Storage</button>
  );
};

export default Clear;
