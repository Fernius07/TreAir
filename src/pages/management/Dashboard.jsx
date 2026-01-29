import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate, Link } from 'react-router-dom';

const Dashboard = () => {
    const { user, loading } = useAuth();

    if (loading) return <div>Loading...</div>;
    if (!user) return <Navigate to="/login" />;

    return (
        <div className="page-container container">
            <h1 className="page-title fade-in visible">Management Dashboard</h1>
            <div className="glass-card fade-in visible">
                <h2>Welcome back, {user.email}</h2>
                <p style={{ marginTop: '1rem', color: 'rgba(255,255,255,0.7)' }}>
                    Select a module to manage:
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem' }}>
                    <div className="glass-card" style={{ background: 'rgba(255,255,255,0.05)' }}>
                        <h3>Flight Operations</h3>
                        <p>Manage flight schedules, gates, and status.</p>
                        <Link to="/management/flights" className="btn" style={{ marginTop: '1rem', display: 'inline-block' }}>Manage Flights</Link>
                    </div>

                    <div className="glass-card" style={{ background: 'rgba(255,255,255,0.05)' }}>
                        <h3>Applications</h3>
                        <p>Review new staff applications.</p>
                        <Link to="/management/applications" className="btn" style={{ marginTop: '1rem', display: 'inline-block' }}>View Applications</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
