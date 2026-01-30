import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import './FlightSchedule.css';

const FlightSchedule = () => {
    const [flights, setFlights] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFlights();
        // Refresh every minute to check for expired flights
        const interval = setInterval(fetchFlights, 60000);
        return () => clearInterval(interval);
    }, []);

    const fetchFlights = async () => {
        try {
            const { data, error } = await supabase
                .from('flights')
                .select('*');

            if (error) {
                // Fallback for demo purposes if table doesn't exist yet
                console.warn("Supabase fetch error (DB likely not set up):", error);
                // Load mock only if valid mock data needed, but user requested NO mock data.
                // So we default to empty list or local storage for now while DB sets up.
                // Actually, let's load from LocalStorage as a temporary "Database"
                // until they connect Supabase tables.
                const local = localStorage.getItem('tre_air_flights_db');
                if (local) {
                    const parsed = JSON.parse(local);
                    filterAndSetFlights(parsed);
                } else {
                    setFlights([]);
                }
            } else {
                filterAndSetFlights(data || []);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const filterAndSetFlights = (allFlights) => {
        const NOW = new Date();
        const EXPIRATION_MS = 90 * 60 * 1000;

        const processedFlights = allFlights.map(flight => {
            let flightTime = new Date();
            try {
                const parts = flight.departure.trim().split(/\s+/);
                const timeParts = parts[0].split(':');
                let hours = parseInt(timeParts[0], 10);
                const minutes = parseInt(timeParts[1], 10) || 0;

                if (parts[1]) {
                    const modifier = parts[1].toUpperCase();
                    if (modifier === 'PM' && hours < 12) hours += 12;
                    if (modifier === 'AM' && hours === 12) hours = 0;
                }

                flightTime.setHours(hours, minutes, 0, 0);
            } catch (e) {
                console.error("Error parsing time for flight", flight.id, e);
            }
            return { ...flight, _parsedTime: flightTime };
        });

        const activeFlights = processedFlights.filter(flight => {
            const diff = NOW - flight._parsedTime;
            return diff < EXPIRATION_MS;
        });

        activeFlights.sort((a, b) => a._parsedTime - b._parsedTime);

        setFlights(activeFlights);
    };

    const getAirportCode = (name) => {
        if (!name) return "UNK";
        // Simple logic to get 3-letter code. If already 3 letters, use it.
        // Otherwise take first 3 chars uppercase.
        // Or if it looks like "Bloxburg International", try "BIR".
        // For now, let's just default to uppercase first 3.
        return name.substring(0, 3).toUpperCase();
    };

    const formatDate = (dateObj) => {
        // Format: Jan 28, 2026
        // For this demo, since we often just have times, we'll fake the date based on "Today" or "Tomorrow" logic from parsing,
        // or just show "Today" if no date.
        // ideally we use the _parsedTime we created.
        if (!dateObj) return "Unknown Date";
        return dateObj.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    };

    return (
        <div className="page-container container">
            <div className="page-header-content fade-in visible">
                <h1 className="page-title">Flight Schedule</h1>
                <p className="page-subtitle">Explore our upcoming and past operations. Tre Air provides reliable, low-cost travel across the most popular destinations.</p>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem' }}>
                    <div className="plane-icon" style={{ display: 'inline-block', fontSize: '2rem', animation: 'pulse 1s infinite' }}>✈</div>
                    <p style={{ marginTop: '1rem', color: 'var(--color-text-muted)' }}>Loading Schedule...</p>
                </div>
            ) : flights.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--color-bg-card)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <h3>No Active Flights</h3>
                    <p style={{ color: 'var(--color-text-muted)' }}>Please check back later for new scheduled operations.</p>
                </div>
            ) : (
                <div className="schedule-grid fade-in visible">
                    {flights.map((flight) => {
                        const originCode = getAirportCode(flight.origin || 'Robloxia');
                        const destCode = getAirportCode(flight.destination);
                        const flightDate = flight._parsedTime || new Date();

                        return (
                            <div key={flight.id} className="flight-card">
                                <div className="card-header">
                                    <div>
                                        <span className="flight-badge">TreFlex Premium</span>
                                        <span className="flight-number-lg">TA-{flight.id}</span>
                                    </div>
                                    <div className="flight-date">
                                        <span>{formatDate(flightDate)}</span>
                                        <div style={{ fontSize: '0.7rem', opacity: 0.6, marginTop: '4px' }}>Scheduled</div>
                                    </div>
                                </div>

                                <div className="route-visual">
                                    <div className="airport">
                                        <span className="ap-code">{originCode}</span>
                                        <span className="ap-city">{flight.origin || 'Robloxia'}</span>
                                    </div>

                                    <div className="route-line-container">
                                        <div className="route-line"></div>
                                        <div className="plane-icon">✈</div>
                                        <div style={{ fontSize: '0.6rem', marginTop: '15px', color: 'var(--color-text-muted)' }}>Direct</div>
                                    </div>

                                    <div className="airport">
                                        <span className="ap-code">{destCode}</span>
                                        <span className="ap-city">{flight.destination}</span>
                                    </div>
                                </div>

                                <div className="card-footer">
                                    <div className="departure-time">
                                        <span style={{ opacity: 0.7 }}>🕒</span>
                                        <span>{flight.departure} UTC</span>
                                    </div>

                                    {flight.status === 'Scheduled' || flight.status === 'On Time' ? (
                                        <button className="reserve-btn">Reserve Seat ›</button>
                                    ) : (
                                        <span className={`status-badge status-${flight.status.toLowerCase().replace(' ', '-')}`}>
                                            {flight.status}
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default FlightSchedule;
