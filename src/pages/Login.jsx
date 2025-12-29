import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import logo from "../assets/img/logo.png";

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const from = location.state?.from?.pathname || "/";

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading]   = useState(false);
    const [error, setError] = useState(null);

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        if (!username || !password) {
            setError('User and password are required.');
            return;
        }
        setLoading(true);
        try
        {
            await login(username, password);
            navigate(from, { replace: true });
        }
        catch (e)
        {
            setError(e.message || 'Unexpected error');
        }
        finally
        {
            setLoading(false);
        }
    }

    return (
        <div className="container my-5" style={{ maxWidth: '400px' }}>
            <form onSubmit={handleSubmit} className="card p-4 shadow-sm mt-5">
                <img src={logo} alt="Logo" width={200} className="mx-auto d-block mb-3"/>
                <h5 className="mb-5 text-center">IEP Crossing Dock Shipment</h5>
                <div className="mb-3">
                    <label className="form-label">Email address :</label>
                    <input className="form-control" value={username} onChange={(e) => setUsername(e.target.value)} autoFocus />
                </div>
                <div className="mb-3">
                    <label className="form-label">Password:</label>
                    <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                {error && <div className="alert alert-danger">{error}</div>}
                <button className="btn btn-success" type="submit" disabled={loading}>
                    {loading ? 'Logging In...' : 'Login'}
                </button>
            </form>
        </div>
    );
}
