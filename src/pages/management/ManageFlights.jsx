import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import Modal from '../../components/Modal';
import './Management.css';

const ManageFlights = () => {
    const [flights, setFlights] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        origin: 'Robloxia International',
        destination: '',
        status: 'Scheduled',
        departure: '',
        gate: ''
    });

    useEffect(() => {
        fetchFlights();
    }, []);

    const fetchFlights = async () => {
        // In production we use supabase. For now fall back to local if DB fails
        const { data, error } = await supabase.from('flights').select('*');
        if (!error && data) {
            setFlights(data);
        } else {
            // Fallback
            const stored = localStorage.getItem('tre_air_flights_db');
            if (stored) setFlights(JSON.parse(stored));
        }
    };

    const saveToStorage = (updatedFlights) => {
        localStorage.setItem('tre_air_flights_db', JSON.stringify(updatedFlights));
        setFlights(updatedFlights);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const flightData = {
            ...formData,
            id: editingId || 'TR' + Math.floor(Math.random() * 1000)
        };

        const { error } = await supabase.from('flights').upsert(flightData);

        if (error) {
            console.error("Error saving flight:", error.message);
            alert("Error saving flight: " + error.message);
            return;
        }

        fetchFlights(); // Refresh list from DB
        closeModal();
    };

    const openAddModal = () => {
        setEditingId(null);
        setFormData({
            origin: 'Robloxia International',
            destination: '',
            status: 'Scheduled',
            departure: '',
            gate: ''
        });
        setIsModalOpen(true);
    };

    const openEditModal = (flight) => {
        setEditingId(flight.id);
        setFormData({ ...flight });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Delete flight?")) {
            const { error } = await supabase.from('flights').delete().eq('id', id);
            if (error) {
                console.error("Error deleting:", error.message);
                alert("Error deleting flight");
            } else {
                fetchFlights();
            }
        }
    };

    const closeModal = () => setIsModalOpen(false);

    return (
        <div className="page-container container">
            <div className="management-header">
                <h1 className="page-title">Manage Flights</h1>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn" onClick={openAddModal}>Add Flight +</button>
                    <Link to="/management" className="btn-back" style={{ alignSelf: 'center' }}>Back</Link>
                </div>
            </div>

            <div className="flights-list fade-in visible">
                <table className="management-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Origin</th>
                            <th>Destination</th>
                            <th>Departure</th>
                            <th>Gate</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {flights.map(flight => (
                            <tr key={flight.id} className="flight-row">
                                <td>{flight.id}</td>
                                <td>{flight.origin}</td>
                                <td>{flight.destination}</td>
                                <td>{flight.departure}</td>
                                <td>{flight.gate}</td>
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
                    <div className="form-group">
                        <label>Origin</label>
                        <input
                            type="text" required
                            value={formData.origin}
                            onChange={e => setFormData({ ...formData, origin: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label>Destination</label>
                        <input
                            type="text" required
                            value={formData.destination}
                            onChange={e => setFormData({ ...formData, destination: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label>Departure Time (e.g. 14:30)</label>
                        <input
                            type="text" required
                            value={formData.departure}
                            onChange={e => setFormData({ ...formData, departure: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label>Gate</label>
                        <input
                            type="text"
                            value={formData.gate}
                            onChange={e => setFormData({ ...formData, gate: e.target.value })}
                        />
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
                            <option>Delayed</option>
                            <option>Landed</option>
                        </select>
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="btn-text" onClick={closeModal}>Cancel</button>
                        <button type="submit" className="btn">Save Flight</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default ManageFlights;
