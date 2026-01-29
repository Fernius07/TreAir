import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const result = await login(email, password);

        if (result.success) {
            navigate('/management');
        } else {
            // Friendly error handling
            if (result.error.includes("Invalid login credentials")) {
                setError("Incorrect email or password.");
            } else {
                setError(result.error);
            }
        }
    };

    return (
        <div className="login-container">
            <div className="glass-card login-card fade-in visible">
                <h2 className="login-title">Staff Portal</h2>
                <div style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
                    Please sign in with your Tre Air official email.
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="e.g. admin@treair.com"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    {error && <div className="error-msg">{error}</div>}
                    <button type="submit" className="btn login-btn">Sign In</button>
                </form>
            </div>
        </div>
    );
};

export default Login;
