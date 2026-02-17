import React from 'react';
import useStore from './store/useStore';
import Lobby from './components/lobby/Lobby';
import Studio from './components/Studio';

function App() {
  const user = useStore((state) => state.user);

  return (
    <div className="min-h-screen bg-bg-darker">
      {!user ? (
        <Lobby />
      ) : (
        <Studio />
      )}
    </div>
  );
}

export default App;
