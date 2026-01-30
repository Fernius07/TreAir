import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import './FlightSchedule.css';

const FlightSchedule = () => {
    const [flights, setFlights] = useState([]);
    const [loading, setLoading] = useState(true);

    // Calculate delay between original and delayed times
    const calculateDelay = (originalTime, delayedTime) => {
        if (!originalTime || !delayedTime) return null;

        try {
            const parseTime = (timeStr) => {
                const parts = timeStr.trim().split(':');
                return parseInt(parts[0]) * 60 + parseInt(parts[1] || 0);
            };

            const originalMinutes = parseTime(originalTime);
            const delayedMinutes = parseTime(delayedTime);
            let diffMinutes = delayedMinutes - originalMinutes;

            if (diffMinutes < 0) diffMinutes += 24 * 60;

            const hours = Math.floor(diffMinutes / 60);
            const minutes = diffMinutes % 60;

            if (hours > 0 && minutes > 0) return `+${hours}h ${minutes}m delay`;
            if (hours > 0) return `+${hours}h delay`;
            if (minutes > 0) return `+${minutes}m delay`;
            return null;
        } catch (e) {
            return null;
        }
    };

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
                        const originCode = getAirportCode(flight.origin);
                        const destCode = getAirportCode(flight.destination);
                        const flightDate = flight.flight_date ? new Date(flight.flight_date) : new Date();

                        return (
                            <div className={`flight-card status-${flight.status.toLowerCase().replace(' ', '-')}`}>
                                <div className="card-header">
                                    <div>
                                        <span className="flight-badge">{flight.flight_number ? `TR${flight.flight_number}` : flight.id}</span>
                                        {flight.aircraft && <span className="aircraft-label">{flight.aircraft}</span>}
                                    </div>
                                    <div className="flight-date">
                                        <span>{formatDate(flightDate)}</span>
                                        <div className={`status-tag status-${flight.status.toLowerCase().replace(' ', '-')}`}>
                                            {flight.status}
                                        </div>
                                    </div>
                                </div>

                                <div className="route-visual">
                                    <div className="airport">
                                        <span className="ap-code">{flight.origin_iata || originCode}</span>
                                        <span className="ap-city">{flight.origin || 'Robloxia'}</span>
                                        <div className="time">
                                            {flight.status === 'Delayed' && flight.delayed_departure ? (
                                                <>
                                                    <span style={{ textDecoration: 'line-through', opacity: 0.5, marginRight: '0.5rem' }}>
                                                        {flight.departure}
                                                    </span>
                                                    <span style={{ color: '#e76f51', fontWeight: '700' }}>
                                                        {flight.delayed_departure}
                                                    </span>
                                                </>
                                            ) : flight.departure}
                                        </div>
                                    </div>

                                    <div className="route-line-container">
                                        <div className="route-line"></div>
                                        <div className="plane-icon">✈</div>
                                        {flight.duration && <div className="duration-label">{flight.duration}</div>}
                                    </div>

                                    <div className="airport">
                                        <span className="ap-code">{flight.destination_iata || destCode}</span>
                                        <span className="ap-city">{flight.destination}</span>
                                        <div className="time">
                                            {flight.status === 'Delayed' && flight.delayed_arrival ? (
                                                <>
                                                    <span style={{ textDecoration: 'line-through', opacity: 0.5, marginRight: '0.5rem' }}>
                                                        {flight.arrival_time}
                                                    </span>
                                                    <span style={{ color: '#e76f51', fontWeight: '700' }}>
                                                        {flight.delayed_arrival}
                                                    </span>
                                                </>
                                            ) : (flight.arrival_time || '--:--')}
                                        </div>
                                    </div>
                                </div>

                                {/* Delay Calculation */}
                                {flight.status === 'Delayed' && (flight.delayed_departure || flight.delayed_arrival) && (
                                    <div className="delay-info">
                                        {flight.delayed_departure && calculateDelay(flight.departure, flight.delayed_departure)}
                                        {!flight.delayed_departure && flight.delayed_arrival && calculateDelay(flight.arrival_time, flight.delayed_arrival)}
                                    </div>
                                )}

                                {flight.status === 'Canceled' && flight.reason && (
                                    <div className="cancellation-reason">
                                        <strong>Canceled:</strong> {flight.reason}
                                    </div>
                                )}

                                <div className="card-footer">
                                    <div className="gate-info">
                                        <span style={{ opacity: 0.6 }}>Gate:</span> {flight.gate || 'TBD'}
                                    </div>
                                    <div className="footer-status-pill">
                                        {flight.status === 'Boarding' ? 'Go to Gate' : flight.status}
                                    </div>
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
