import React from 'react';
import { Link } from 'react-router-dom';
import './Hero.css';
import heroImage from '../assets/hero-plane.png';

const Hero = () => {
    return (
        <div className="hero-container" style={{ backgroundImage: `url(${heroImage})` }}>
            <div className="hero-overlay"></div>
            <div className="container hero-content">
                <h1 className="hero-title fade-in visible">Welcome to Tre Air</h1>
                <p className="hero-subtitle fade-in visible">Experience the Skies in Roblox Style</p>
                <div className="hero-buttons fade-in visible">
                    <Link to="/schedule" className="btn hero-btn">View Flights</Link>
                    <Link to="/recruitment" className="btn hero-btn-secondary">Join the Crew</Link>
                </div>
            </div>
        </div>
    );
};

export default Hero;
