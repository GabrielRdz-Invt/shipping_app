import { useState } from 'react'
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/navbar'
import Shipments from './pages/Shipments';
import Home from './pages/Home';
import ShipmentForm from './components/ShipmentForm';
import Reports from './pages/Reports';

function App() {
  const [count, setCount] = useState(0)
  return (
    <>
      <Navbar />
      <div className="container my-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shipments" element={<Shipments />} />
          <Route path="/shipments/new" element={<ShipmentForm />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="*" element={<p>Página no encontrada</p>} />
        </Routes>
      </div>
    </>
  )
}

export default App
