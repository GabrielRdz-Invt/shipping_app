const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7054/api';

export async function getAll(){
    const res = await fetch(`${BASE_URL}/IepCrossingDockShipments`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
}

export async function getById(Id) {
    const res = await fetch(`${BASE_URL}/IepCrossingDockShipments/${Id}`);
    if (res.status === 404) return [];
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    
    return res.json()
}

// Insert/Scan new shipment
export async function create(body) {
  const res = await fetch(`${BASE_URL}/IepCrossingDockShipments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (res.status === 201) {
    // El controlador devuelve el recurso creado (idealmente IepCrossingDockShipment)
    return res.json();
  }
  if (res.status === 409) {
    throw new Error('ID duplicado. Ya existe un envío con ese ID.');
  }
  if (res.status === 400) {
    const msg = await res.text();
    throw new Error(msg || 'Solicitud inválida');
  }
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  return res.json();
}

// Delete shipment by ID
export async function remove(Id) {
    const res = await fetch(`${BASE_URL}/IepCrossingDockShipments/${encodeURIComponent(Id)}`, {
        method: 'DELETE'
    });
    if (res.status === 404) throw new Error('No existe el envío.');
    if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(text || `HTTP ${res.status}`);
    }
    return true;
}

// ScanOut shipment by ID
export async function scanOut(id, shipOutDateIso, statusText = "2") {
    const body = {
        status: String(statusText),
        shipOutDate: shipOutDateIso,
        setUdtFromShipOutDate: true
    };

    const url = `${BASE_URL}/IepCrossingDockShipments/${encodeURIComponent(id)}/scanout`;
    const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });

    if (res.status === 404) {
        const txt = await res.text().catch(() => '');
        throw new Error(txt || 'No existe el envío.');
    }
    if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(text || `HTTP ${res.status}`);
    }
    return res.json();
}

