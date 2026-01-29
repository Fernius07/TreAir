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

    return (
        <div className="page-container container">
            <h1 className="page-title fade-in visible">Flight Schedule</h1>

            {loading ? (
                <div style={{ textAlign: 'center' }}>In Flight Connectivity...</div>
            ) : flights.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', background: 'rgba(0,0,0,0.5)', borderRadius: '8px' }}>
                    No scheduled flights at the moment. Check back later!
                </div>
            ) : (
                <div className="schedule-board fade-in visible">
                    <div className="schedule-header">
                        <span>Flight</span>
                        <span>Destination</span>
                        <span>Departure</span>
                        <span>Gate</span>
                        <span>Status</span>
                    </div>

                    {flights.map((flight) => (
                        <div key={flight.id} className="schedule-row">
                            <span className="flight-id">{flight.id}</span>
                            <span className="flight-dest">{flight.destination}</span>
                            <span className="flight-time">{flight.departure}</span>
                            <span className="flight-gate">{flight.gate}</span>
                            <span className={`flight-status status-${flight.status.toLowerCase().replace(' ', '-')}`}>
                                {flight.status}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FlightSchedule;
