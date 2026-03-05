import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import SymptomChecker from './pages/SymptomChecker';
import DrugLookup from './pages/DrugLookup';
import Dashboard from './pages/Dashboard';
import Recalls from './pages/Recalls';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/symptom-checker" element={<SymptomChecker />} />
            <Route path="/drug-lookup" element={<DrugLookup />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/recalls" element={<Recalls />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
