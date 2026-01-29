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
        // 1h 30m = 90 minutes = 90 * 60 * 1000 ms
        const EXPIRATION_MS = 90 * 60 * 1000;

        const activeFlights = allFlights.filter(flight => {
            // Assume flight.departure is ISO string or formatted date.
            // For simplicity in this v2, we'll try to parse it. 
            // If it's just "10:00 AM", we assume it's TODAY.

            let flightTime = new Date();
            const [time, modifier] = flight.departure.split(' ');
            let [hours, minutes] = time.split(':');

            if (hours === '12') hours = '00';
            if (modifier === 'PM') hours = parseInt(hours, 10) + 12;

            flightTime.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);

            // Logic: specific date handling would be better with real DB columns (timestamp with time zone)
            // For now, if the time is > 90 mins ago, hide it.
            // Note: This logic implies daily rotation if no date is stored.

            const diff = NOW - flightTime;
            // If diff > EXPIRATION_MS, it's too old
            // If diff is negative, it's in the future (keep it)
            return diff < EXPIRATION_MS;
        });

        // Sort by time
        activeFlights.sort((a, b) => {
            // Simple sort logic helper
            return a.departure.localeCompare(b.departure);
        });

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
