import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/navbar';
import Home from './pages/Home';
import Shipments from './pages/Shipments';
import Reports from './pages/Reports';
import Login from './pages/Login';
import ProtectedRoute from './auth/ProtectedRoute';
import { useAuth } from './auth/AuthContext';

function IndexRedirect() {
  const { user } = useAuth();
  return <Navigate to={user ? '/home' : '/login'} replace />;  // <-- decide por sesión
}

export default function App() {
  const location = useLocation();
  const hideNavbar = location.pathname === '/login';

  return (
    <>
      {!hideNavbar && <Navbar />}
      <div className="container mt-3">
        <Routes>
          <Route path="/" element={<IndexRedirect />} />

          <Route path="/login" element={<Login />} />

          {/* Rutas protegidas */}
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/shipments"
            element={
              <ProtectedRoute>
                <Shipments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<div>Página no encontrada</div>} />
        </Routes>
      </div>
    </>
  );
}