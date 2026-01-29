import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location]);

    return (
        <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
            <div className="container nav-container">
                <Link to="/" className="nav-logo">
                    <span className="logo-icon">✈</span> TRE AIR
                </Link>

                <div className={`nav-links ${mobileMenuOpen ? 'active' : ''}`}>
                    <Link to="/" className="nav-link">Home</Link>
                    <Link to="/schedule" className="nav-link">Flight Schedule</Link>
                    <Link to="/recruitment" className="nav-link">Careers</Link>
                    <Link to="/fleet" className="nav-link">Fleet</Link>

                    {user ? (
                        <>
                            <Link to="/management" className="nav-link highlight">Dashboard</Link>
                            <button onClick={logout} className="nav-btn-logout">Logout</button>
                        </>
                    ) : (
                        <Link to="/login" className="nav-link">Staff Login</Link>
                    )}
                </div>

                <div className="hamburger" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                    <div className="line"></div>
                    <div className="line"></div>
                    <div className="line"></div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
