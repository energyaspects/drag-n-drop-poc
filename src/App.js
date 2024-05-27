import React from 'react';
import CardList from './CardList';

const App = () => {
  return (
    <div className="App" style={{ height: '600px', overflowY: 'auto' }}>
      <h1>Drag and Drop Cards</h1>
      <div style={{ height: '1200px', padding: '20px' }}>
        <CardList numCards={20} />
      </div>
    </div>
  );
};

export default App;