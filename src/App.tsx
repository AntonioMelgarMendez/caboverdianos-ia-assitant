import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Landing from './pages/Landing';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans selection:bg-purple-500/30">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/app" element={<Home />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
