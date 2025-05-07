import { CrystalComponent } from '../';
import './App.css';

function App() {
  return (
    <div>
      <p style={{ textAlign: 'center' }}>Crystals</p>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '5rem',
          height: '100vh',
          width: '100%',
        }}
      >
        <CrystalComponent
          width={200}
          height={200}
          red={210}
          green={119}
          blue={95}
          bgRed={255}
          bgGreen={255}
          bgBlue={225}
        />
        <CrystalComponent
          width={200}
          height={200}
          red={210}
          green={200}
          blue={95}
          bgRed={255}
          bgGreen={255}
          bgBlue={225}
        />
        <CrystalComponent
          width={200}
          height={200}
          red={100}
          green={119}
          blue={200}
          bgRed={255}
          bgGreen={255}
          bgBlue={225}
        />
      </div>
    </div>
  );
}

export default App;
