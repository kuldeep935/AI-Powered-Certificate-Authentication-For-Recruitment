import './index.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import About from './pages/About';
import Feature from './pages/Feature';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ApplicantPage from './pages/ApplicantPage';
import EmployerPage from './pages/EmployerPage';
import InstitutePage from './pages/InstitutePage';
import SearchJobs from './pages/SearchJobs';
import VerifyCertificate from "./pages/VerifyCertificate";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<About />} />
        <Route path="/feature" element={<Feature />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/applicantPage" element={<ApplicantPage />} />
        <Route path="/employerPage" element={<EmployerPage />} />
        <Route path="/institutePage" element={<InstitutePage />} />
        <Route path="/jobs" element={<SearchJobs />} />
        <Route path="/verify" element={<VerifyCertificate />} />
        <Route path="*" element={<LandingPage />} />
      </Routes>
    </Router>
  );  
}

export default App;