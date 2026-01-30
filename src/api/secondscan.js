// const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:7054/api'; // development environment
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://iep-app-n.iec.inventec:443/Warehouse_Api/api'; // production environment

export async function uploadFile(file) {
    const form = new FormData();
    form.append("file", file);

    const res = await fetch(`${BASE_URL}/IepCrossingDockShipments/upload-file`, {
        method: 'POST',
        body: form
    });

    if (!res.ok)
    {
        const text = await res.text().catch(() => "");
        throw new Error(text || `HTTP ${res.status}`);
    }
    return res.json();
}

export async function validatePair(trackingNumber, hpPartNum) {
    const res = await fetch(`${BASE_URL}/IepCrossingDockShipments/validate-bool`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackingNumber, hpPartNum })
    });
    if (!res.ok)
    {
        const text = await res.text().catch(() => "");
        throw new Error(text || `HTTP ${res.status}`);
    }
    return res.json();
}