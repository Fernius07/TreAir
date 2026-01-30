import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import Modal from '../../components/Modal';
import './Management.css';

const ManageFlights = () => {
    const [flights, setFlights] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [formData, setFormData] = useState({
        flight_number: '',
        origin: 'Robloxia International',
        origin_iata: '',
        destination: '',
        destination_iata: '',
        status: 'Scheduled',
        departure: '',
        arrival_time: '',
        duration: '',
        aircraft: 'Boeing 737-800',
        gate: '',
        reason: '',
        delayed_departure: '',
        delayed_arrival: ''
    });

    // Aircraft options
    const aircraftOptions = [
        'Boeing 737-800',
        'Boeing 737 MAX 8',
        'Airbus A320',
        'Airbus A321',
        'Embraer E190',
        'Bombardier CRJ-900'
    ];

    // Calculate duration between two times
    const calculateDuration = (startTime, endTime) => {
        if (!startTime || !endTime) return '';

        try {
            const parseTime = (timeStr) => {
                const parts = timeStr.trim().split(':');
                return parseInt(parts[0]) * 60 + parseInt(parts[1] || 0);
            };

            const startMinutes = parseTime(startTime);
            const endMinutes = parseTime(endTime);
            let diffMinutes = endMinutes - startMinutes;

            if (diffMinutes < 0) diffMinutes += 24 * 60; // Handle overnight flights

            const hours = Math.floor(diffMinutes / 60);
            const minutes = diffMinutes % 60;

            return `${hours}h ${minutes}m`;
        } catch (e) {
            return '';
        }
    };

    useEffect(() => {
        fetchFlights();
    }, []);

    // Auto-calculate duration when times change
    useEffect(() => {
        const depTime = formData.status === 'Delayed' && formData.delayed_departure
            ? formData.delayed_departure
            : formData.departure;
        const arrTime = formData.status === 'Delayed' && formData.delayed_arrival
            ? formData.delayed_arrival
            : formData.arrival_time;

        const newDuration = calculateDuration(depTime, arrTime);
        if (newDuration && newDuration !== formData.duration) {
            setFormData(prev => ({ ...prev, duration: newDuration }));
        }
    }, [formData.departure, formData.arrival_time, formData.delayed_departure, formData.delayed_arrival, formData.status]);

    const fetchFlights = async () => {
        const { data, error } = await supabase.from('flights').select('*');
        if (!error && data) {
            setFlights(data);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const flightData = {
            ...formData,
            id: editingId || 'TR' + Math.floor(Math.random() * 1000)
        };

        // Clear reason if not canceled
        if (flightData.status !== 'Canceled') {
            flightData.reason = '';
        }

        // Clear delayed times if not delayed
        if (flightData.status !== 'Delayed') {
            flightData.delayed_departure = '';
            flightData.delayed_arrival = '';
        }

        const { error } = await supabase.from('flights').upsert(flightData);

        if (error) {
            console.error("Error saving flight:", error.message);
            alert("Error saving flight: " + error.message);
            return;
        }

        fetchFlights();
        closeModal();
    };

    const openAddModal = () => {
        setEditingId(null);
        setFormData({
            flight_number: '',
            origin: 'Robloxia International',
            origin_iata: '',
            destination: '',
            destination_iata: '',
            status: 'Scheduled',
            departure: '',
            arrival_time: '',
            duration: '',
            aircraft: 'Boeing 737-800',
            gate: '',
            reason: '',
            delayed_departure: '',
            delayed_arrival: ''
        });
        setIsModalOpen(true);
    };

    const openEditModal = (flight) => {
        setEditingId(flight.id);
        setFormData({
            flight_number: flight.flight_number || '',
            origin: flight.origin || '',
            origin_iata: flight.origin_iata || '',
            destination: flight.destination || '',
            destination_iata: flight.destination_iata || '',
            status: flight.status || 'Scheduled',
            departure: flight.departure || '',
            arrival_time: flight.arrival_time || '',
            duration: flight.duration || '',
            aircraft: flight.aircraft || '',
            gate: flight.gate || '',
            reason: flight.reason || '',
            delayed_departure: flight.delayed_departure || '',
            delayed_arrival: flight.delayed_arrival || ''
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Delete flight?")) {
            const { error } = await supabase.from('flights').delete().eq('id', id);
            if (!error) fetchFlights();
        }
    };

    const closeModal = () => setIsModalOpen(false);

    return (
        <div className="page-container container">
            <div className="management-header">
                <div>
                    <h1 className="page-title">Manage Flights</h1>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Real-time schedule operations</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn" onClick={openAddModal}>Add Flight +</button>
                    <Link to="/management" className="btn-back" style={{ alignSelf: 'center' }}>Back</Link>
                </div>
            </div>

            <div className="flights-list fade-in visible">
                <table className="management-table">
                    <thead>
                        <tr>
                            <th>Flight #</th>
                            <th>Origin</th>
                            <th>Destination</th>
                            <th>Depart</th>
                            <th>Arrive</th>
                            <th>Aircraft</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {flights.map(flight => (
                            <tr key={flight.id} className="flight-row">
                                <td style={{ fontFamily: 'monospace', color: 'var(--color-primary-light)', fontWeight: '700' }}>
                                    TR{flight.flight_number || flight.id}
                                </td>
                                <td>
                                    {flight.origin_iata ? `${flight.origin_iata} - ` : ''}{flight.origin}
                                </td>
                                <td>
                                    {flight.destination_iata ? `${flight.destination_iata} - ` : ''}{flight.destination}
                                </td>
                                <td>{flight.departure}</td>
                                <td>{flight.arrival_time || '--:--'}</td>
                                <td style={{ fontSize: '0.8rem', opacity: 0.8 }}>{flight.aircraft}</td>
                                <td>
                                    <span className={`status-badge status-${flight.status.toLowerCase().replace(' ', '-')}`}>
                                        {flight.status}
                                    </span>
                                </td>
                                <td>
                                    <button className="btn-icon" onClick={() => openEditModal(flight)}>✏️</button>
                                    <button className="btn-icon delete" onClick={() => handleDelete(flight.id)}>🗑️</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={editingId ? `Edit Flight ${editingId}` : "Add New Flight"}
            >
                <form className="modal-form" onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                            <label>Origin</label>
                            <input
                                type="text" required placeholder="Origin Airport"
                                value={formData.origin}
                                onChange={e => setFormData({ ...formData, origin: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Destination</label>
                            <input
                                type="text" required placeholder="Destination Airport"
                                value={formData.destination}
                                onChange={e => setFormData({ ...formData, destination: e.target.value })}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                            <label>Departure (UTC)</label>
                            <input
                                type="text" required placeholder="HH:MM"
                                value={formData.departure}
                                onChange={e => setFormData({ ...formData, departure: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Arrival (UTC)</label>
                            <input
                                type="text" placeholder="HH:MM"
                                value={formData.arrival_time}
                                onChange={e => setFormData({ ...formData, arrival_time: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Duration</label>
                            <input
                                type="text" placeholder="2h 30m"
                                value={formData.duration}
                                onChange={e => setFormData({ ...formData, duration: e.target.value })}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                            <label>Aircraft</label>
                            <input
                                type="text" placeholder="e.g. Boeing 737"
                                value={formData.aircraft}
                                onChange={e => setFormData({ ...formData, aircraft: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Gate</label>
                            <input
                                type="text" placeholder="e.g. A4"
                                value={formData.gate}
                                onChange={e => setFormData({ ...formData, gate: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Status</label>
                        <select
                            value={formData.status}
                            onChange={e => setFormData({ ...formData, status: e.target.value })}
                        >
                            <option>Scheduled</option>
                            <option>On Time</option>
                            <option>Boarding</option>
                            <option>Flying</option>
                            <option>Delayed</option>
                            <option>Landed</option>
                            <option>Canceled</option>
                        </select>
                    </div>

                    {/* Delayed Times (Conditional) */}
                    {formData.status === 'Delayed' && (
                        <div className="fade-in visible" style={{
                            background: 'rgba(231, 111, 81, 0.05)',
                            padding: '1.5rem',
                            borderRadius: '12px',
                            border: '1px solid rgba(231, 111, 81, 0.2)'
                        }}>
                            <h4 style={{
                                color: '#e76f51',
                                marginBottom: '1rem',
                                fontSize: '0.9rem',
                                fontWeight: '700',
                                textTransform: 'uppercase',
                                letterSpacing: '1px'
                            }}>Delayed Times</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label>New Departure</label>
                                    <input
                                        type="text"
                                        placeholder="15:30"
                                        value={formData.delayed_departure}
                                        onChange={e => setFormData({ ...formData, delayed_departure: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>New Arrival</label>
                                    <input
                                        type="text"
                                        placeholder="18:00"
                                        value={formData.delayed_arrival}
                                        onChange={e => setFormData({ ...formData, delayed_arrival: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {formData.status === 'Canceled' && (
                        <div className="form-group fade-in visible">
                            <label>Reason for Cancellation</label>
                            <textarea
                                placeholder="e.g. Technical issues, Bad weather..."
                                value={formData.reason}
                                onChange={e => setFormData({ ...formData, reason: e.target.value })}
                                style={{ background: 'rgba(231, 76, 60, 0.1)', border: '1px solid rgba(231, 76, 60, 0.3)' }}
                            />
                        </div>
                    )}

                    <div className="modal-actions">
                        <button type="button" className="btn-text" onClick={closeModal}>Cancel</button>
                        <button type="submit" className="btn">{editingId ? 'Save Changes' : 'Create Flight'}</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default ManageFlights;
