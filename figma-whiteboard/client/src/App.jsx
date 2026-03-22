import { SocketProvider } from './context/SocketContext';
import Whiteboard from './components/Whiteboard';

function App() {
  return (
    <SocketProvider>
      <Whiteboard />
    </SocketProvider>
  )
}

export default App;
