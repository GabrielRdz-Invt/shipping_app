// const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';
const AUTH_BASE = import.meta.env.VITE_AUTH_BASE_URL ?? "https://iep-app-n.iec.inventec";

export async function whoAmI() { 
    const res = await fetch(`${AUTH_BASE}/Base/Login/whoami`, {
        method: "GET",
        credentials: "include",
    });
    if (!res.ok) return null;
    const text = await res.text().catch(() => "");
    const badge = (text || "").trim();
    return badge || null;
}

export async function authorize(program) {
    const url = `${AUTH_BASE}/Base/Login/Authorize?program=${encodeURIComponent(program)}`;
    const res = await fetch(url, { method: "GET", credentials: "include" });
    if (res.status === 403) return false;
    if (!res.ok) throw new Error(`auth authorize failed: ${res.status}`); 
    try {
        const data = await res.json();
        return data?.allowed ?? true;
    } catch {
        return true;
    }
}

export async function recordAccess({ badge, program, section })
{
    const body = {
        id_record: 0,
        badge,
        program,
        section,
        access_time: new Date().toISOString().slice(0, 19).replace("T", " "),
    };
    const url = `${AUTH_BASE}/Base/Login/RecordAccess`;
    await fetch(url, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    }).catch(() => {});
    return true;
}