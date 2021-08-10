import React from 'react';
import './App.css';
import Board from './components/Board';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <Board N={30} nBombs={150}/>
      </header>
    </div>
  );
}

export default App;
