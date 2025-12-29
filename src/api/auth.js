const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

export async function login({ username, password }) {
    const res = await fetch(`${BASE_URL}/Auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
    });
    if (res.status === 401) {
        const msg = await res.text().catch(() => '');
        throw new Error(msg || 'Invalid credentials');
    }
    if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
    }
    const data = await res.json();
    return data.user;
}