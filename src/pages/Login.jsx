import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import logo from "../assets/img/logo.png";

const FORCE_LOGOUT_KEY = "FORCE_LOGOUT";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname ?? "/home";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      localStorage.removeItem(FORCE_LOGOUT_KEY);
      await login();
      navigate(from, { replace: true });
    } catch (e) {
      setError(e.message ?? 'Unexpected error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-12 col-md-6 col-lg-4">
          <div className="text-center mb-3">
            <img src={logo} alt="Logo" height={64} />
            <h6>IEP Crossing Dock Shipment</h6>
          </div>
          <form onSubmit={handleSubmit}>
            {/* --- UPDATED: Username and password fields were removed --- */}
            {error && <div className="alert alert-danger">{error}</div>}
            <button type="submit" className="btn btn-primary w-100">
              {loading ? 'Checking...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
