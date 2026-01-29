import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import FlightSchedule from './pages/FlightSchedule';
import Fleet from './pages/Fleet';
import Recruitment from './pages/Recruitment';
import Login from './pages/Login';
import Dashboard from './pages/management/Dashboard';
import ManageFlights from './pages/management/ManageFlights';
import ManageApplications from './pages/management/ManageApplications';
import { AuthProvider } from './context/AuthContext';
import './index.css';

// Layout wrapper to conditionally show Navbar
const Layout = ({ children }) => {
  const location = useLocation();
  // Don't hide navbar, but maybe style it differently on dashboard?
  // For now keep it everywhere or hide on login?
  // Let's keep it everywhere for navigation ease.
  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/schedule" element={<FlightSchedule />} />
            <Route path="/fleet" element={<Fleet />} />
            <Route path="/recruitment" element={<Recruitment />} />
            <Route path="/login" element={<Login />} />

            {/* Management Routes - Protected in component logic */}
            <Route path="/management" element={<Dashboard />} />
            <Route path="/management/flights" element={<ManageFlights />} />
            <Route path="/management/applications" element={<ManageApplications />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </Router>
  );
}

export default App;
