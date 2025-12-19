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