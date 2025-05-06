import { useEffect } from 'react';
import { Drawing } from './Drawing';

import './App.css';
function App() {
  useEffect(() => {
    const drawing = new Drawing();
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
