import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/navbar';

// pages
import Home from './pages/Home';
import Shipments from './pages/Shipments';
import Reports from './pages/Reports';
import Login from './pages/Login';
import SecondScan from './pages/SecondScan';
import ScanIn from './pages/ScanIn';
import ScanOutShipments from './pages/ScanOutShipments';
import ScanOutDetails from './pages/ScanOutDetails';
import PrintLabels from './pages/PrintLabels';

// auth
import ProtectedRoute from './auth/ProtectedRoute';
import { useAuth, hasValidSession } from './auth/AuthContext';

function IndexRedirect() {
  const { user } = useAuth();
  const ok = hasValidSession(user);
  // Con sesión → /home; sin sesión → /login
  return ok ? <Navigate to="/home" replace /> : <Navigate to="/login" replace />;
}

export default function App() {
  const location = useLocation();
  const hideNavbar = location.pathname === '/login';

  return (
	<>
	  {!hideNavbar && <Navbar />}
	  <Routes>
		{/* Public */}
		<Route path="/login" element={<Login />} />

		{/* Index */}
		<Route path="/" element={<IndexRedirect />} />

		{/* Protected */}
		<Route element={<ProtectedRoute program="IEP-CDS" section="home" />}>
			<Route path="/home" element={<Home />} />
		</Route>

		<Route element={<ProtectedRoute program="IEP-CDS" section="shipments" />}>
			<Route path="/shipments" element={<Shipments />} />
		</Route>

		<Route element={<ProtectedRoute program="IEP-CDS" section="scanin" />}>
			<Route path="/scanin" element={<ScanIn />} />
		</Route>

		<Route element={<ProtectedRoute program="IEP-CDS" section="scanoutshipments" />}>
			<Route path="/scanoutshipments" element={<ScanOutShipments />} />
		</Route>
		
		<Route element={<ProtectedRoute program="IEP-CDS" section="scanoutdetails" />}>
			<Route path="/scanoutdetails/:id_scan" element={<ScanOutDetails />} />
		</Route>

		<Route element={<ProtectedRoute program="IEP-CDS" section="secondscan" />}>
			<Route path="/secondscan" element={<SecondScan />} />
		</Route>

		<Route element={<ProtectedRoute program="IEP-CDS" section="reports" />}>
			<Route path="/reports" element={<Reports />} />
		</Route>

		<Route element={<ProtectedRoute program="IEP-CDS" section="printlabels" />}>
			<Route path="/printlabels" element={<PrintLabels/>} />
		</Route>

			{/* Fallback */}
			<Route path="*" element={<Navigate to="/" replace />} />
	  </Routes>
	</>
  );
}