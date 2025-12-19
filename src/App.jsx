import { useState } from 'react'
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/navbar'
import Shipments from './pages/Shipments';
// import './App.css'


function Home(){
  return <h2>Inicio</h2>
}


function App() {
  const [count, setCount] = useState(0)
  return (
    <>
      <Navbar />
      <div className="container my-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shipments" element={<Shipments />} />
          <Route path="*" element={<p>Página no encontrada</p>} />
        </Routes>
      </div>
    </>
  )
}

export default App
