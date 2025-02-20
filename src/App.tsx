import { useEffect } from 'react';
import { Drawing } from './Drawing';

import './App.css';
function App() {
  useEffect(() => {
    const drawing = new Drawing();
    window.drawing = drawing;
    return () => {
      drawing.dispose();
    };
  }, []);
  return (
    <>
      <div></div>
    </>
  );
}

export default App;
