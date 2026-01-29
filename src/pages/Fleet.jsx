import React from 'react';
import './Fleet.css';
import planeImage from '../assets/hero-plane.png';

const fleetData = [
    {
        name: 'ATR 72-600',
        type: 'Turboprop',
        capacity: '70 Passengers',
        range: '825 nm',
        description: 'The backbone of our regional operations. Efficient, reliable, and perfect for short runways.',
        image: planeImage
    }
];

const Fleet = () => {
    return (
        <div className="page-container container">
            <h1 className="page-title fade-in visible">Our Fleet</h1>
            <div className="fleet-grid fade-in visible">
                {fleetData.map((plane, index) => (
                    <div key={index} className="fleet-card glass-card">
                        <div className="fleet-image" style={{ backgroundImage: `url(${plane.image})` }}></div>
                        <div className="fleet-content">
                            <h2 className="fleet-name">{plane.name}</h2>
                            <div className="fleet-specs">
                                <div className="spec-item">
                                    <span className="spec-label">Capacity</span>
                                    <span className="spec-value">{plane.capacity}</span>
                                </div>
                                <div className="spec-item">
                                    <span className="spec-label">Range</span>
                                    <span className="spec-value">{plane.range}</span>
                                </div>
                            </div>
                            <p className="fleet-desc">{plane.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Fleet;
